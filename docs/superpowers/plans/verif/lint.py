"""Lint cible : ne juge QUE les fichiers de la page saga.

`shopify theme check` sur le theme entier remonte 335 erreurs preexistantes
(fork lourdement modifie + binaires lus en JSON). Un `--fail-level error`
global ne peut donc rien garder. On filtre sur nos fichiers.

Le rapport JSON ne liste que les fichiers AYANT des offenses : un de nos
fichiers absent du rapport est donc propre. On verifie quand meme qu'il
existe sur le disque, sinon un fichier supprime passerait pour propre.

Usage : python docs/superpowers/plans/verif/lint.py
Sortie : code 0 si aucune erreur sur nos fichiers, 1 sinon, 2 si le lint
n'a pas pu tourner.
"""
import json
import os
import subprocess
import sys

ATTENDUS = [
    "templates/collection.saga.json",
    "sections/rdc_saga-hero.liquid",
    "sections/rdc_saga-motifs.liquid",
    "snippets/rdc_saga-cut-card.liquid",
    # Fichier du theme que le chantier saga modifie : l'en-tete transparent
    # sur les pages de saga. Il sert sur TOUTES les pages, d'ou sa presence ici.
    "sections/header.liquid",
]
MARQUEURS = ("rdc_saga", "collection.saga.json", "header.liquid")

proc = subprocess.run(
    ["shopify", "theme", "check", "-o", "json"],
    capture_output=True, text=True, shell=True,
    encoding="utf-8", errors="replace",
)

debut = proc.stdout.find("[")
if debut == -1:
    print("Impossible de lire la sortie JSON de theme check.")
    print(proc.stdout[:400])
    print(proc.stderr[:400])
    sys.exit(2)

rapport = json.loads(proc.stdout[debut:])
if not rapport:
    print("Rapport vide : theme check n'a probablement pas tourne.")
    sys.exit(2)

erreurs_par_fichier = {}
for f in rapport:
    chemin = f.get("path", "").replace("\\", "/")
    if any(m in chemin for m in MARQUEURS):
        graves = [o for o in f.get("offenses", []) if o.get("severity", 2) == 0]
        erreurs_par_fichier[chemin] = graves

total = 0
presents = 0
for rel in ATTENDUS:
    if not os.path.exists(rel):
        print("-     %-42s pas encore cree (tache ulterieure)" % rel)
        continue
    presents += 1
    graves = []
    for chemin, g in erreurs_par_fichier.items():
        if chemin.endswith(rel):
            graves = g
    if graves:
        print("ECHEC %-42s %d erreur(s)" % (rel, len(graves)))
        for o in graves:
            print("        ligne %s : %s — %s"
                  % (o.get("start_line"), o.get("check"), o.get("message")))
        total += len(graves)
    else:
        print("OK    %-42s aucune erreur" % rel)

print()
print("Fichiers saga presents : %d | erreurs : %d" % (presents, total))
if presents == 0:
    print("Aucun fichier saga sur le disque — rien n'a ete verifie.")
    sys.exit(2)
sys.exit(1 if total else 0)
