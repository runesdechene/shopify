"""Pousse le code local sur le theme de DEVELOPPEMENT, puis rien d'autre.

A lancer avant chaque verification. Le theme vise est [unpublished] :
invisible des clients. Le theme LIVE n'est JAMAIS la cible de ce script —
l'identifiant du live est refuse explicitement.

Usage : python docs/superpowers/plans/verif/sync.py
"""
import os
import subprocess
import sys

BOUTIQUE = "runes-de-chene.myshopify.com"
THEME_DEV = os.environ.get("RDC_THEME_DEV", "181696168203")
THEME_LIVE = "181425930507"

if THEME_DEV == THEME_LIVE:
    print("REFUS : ce script ne pousse jamais vers le theme LIVE.")
    sys.exit(2)

print("Push vers le theme de dev #%s ..." % THEME_DEV)
proc = subprocess.run(
    ["shopify", "theme", "push", "--theme=" + THEME_DEV, "--store", BOUTIQUE],
    capture_output=True, text=True, shell=True,
    encoding="utf-8", errors="replace",
)
sortie = (proc.stdout or "") + (proc.stderr or "")

if "successfully" in sortie:
    print("Synchronise.")
    sys.exit(0)

print("ECHEC de la synchronisation :")
print(sortie[-1200:])
sys.exit(1)
