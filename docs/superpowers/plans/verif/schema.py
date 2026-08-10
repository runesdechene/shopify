"""Valide les schemas de nos sections avant tout envoi.

Shopify rejette une section entiere pour une erreur de schema — et il la
rejette SILENCIEUSEMENT : pas d'erreur Liquid, juste une page vide. Deux
regles nous ont mordu le 2026-08-11 :

  1. le `default` d'un `range` doit tomber sur un cran valide,
     autrement dit (default - min) doit etre un multiple de step ;
  2. un `range` ne peut pas depasser 101 crans,
     autrement dit (max - min) / step <= 101.

Usage : python docs/superpowers/plans/verif/schema.py
"""
import io
import json
import re
import sys

FICHIERS = [
    "sections/rdc_motif.liquid",
    "sections/rdc_saga-hero.liquid",
    "sections/rdc_saga-motifs.liquid",
    "sections/header.liquid",
]

MAX_CRANS = 101
erreurs = []
inspectes = 0

for chemin in FICHIERS:
    try:
        src = io.open(chemin, encoding="utf-8", errors="replace").read()
    except OSError:
        print("-     %-34s absent" % chemin)
        continue

    bloc = re.search(r"\{%\s*schema\s*%\}(.*?)\{%\s*endschema\s*%\}", src, re.S)
    if not bloc:
        print("-     %-34s pas de schema" % chemin)
        continue

    try:
        schema = json.loads(bloc.group(1))
    except ValueError as e:
        erreurs.append("%s : JSON invalide — %s" % (chemin, e))
        print("ECHEC %-34s JSON invalide" % chemin)
        continue

    inspectes += 1
    locales = []
    for st in schema.get("settings", []):
        if not isinstance(st, dict) or st.get("type") != "range":
            continue
        mn, mx, pas, dft = st["min"], st["max"], st["step"], st["default"]
        if (dft - mn) % pas != 0:
            locales.append("%s : defaut %s hors cran (min %s, pas %s)" % (st["id"], dft, mn, pas))
        crans = (mx - mn) / float(pas)
        if crans > MAX_CRANS:
            locales.append("%s : %d crans, maximum %d" % (st["id"], crans, MAX_CRANS))

    if locales:
        print("ECHEC %-34s %d probleme(s)" % (chemin, len(locales)))
        for l in locales:
            print("        " + l)
        erreurs.extend(locales)
    else:
        print("OK    %-34s schema valide" % chemin)

print()
print("Schemas inspectes : %d | problemes : %d" % (inspectes, len(erreurs)))
sys.exit(1 if erreurs else 0)
