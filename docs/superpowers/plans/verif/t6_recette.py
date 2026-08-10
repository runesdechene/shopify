"""Recette complete de la page saga — les 6 criteres de la spec, rejouables.

PREREQUIS : `shopify theme dev` lance dans un VRAI terminal (voir page.py).
Usage : python docs/superpowers/plans/verif/t6_recette.py
"""
import sys
import os
import re
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from page import get, plat

ATTENDU = {
    "garde-d-acier":       (3, 20),
    "les-mysteres-celtes": (3, 17),
    "lombre-et-lairain":   (2, 12),
    "le-pacte-sauvage":    (3, 15),
}

echecs = []

for handle, (n_motifs, n_produits) in ATTENDU.items():
    html = get(handle)
    bandes = re.findall(r'data-motif="([^"]+)" data-rank="(\d+)"', html)
    cartes = len(re.findall(r'class="rdcsm__cut"', html))
    prix = re.findall(r'class="rdcsm__cprice"[^>]*>\s*([^<]+?)\s*<', html)
    rangs = [int(r) for _, r in bandes]

    cas = {
        "1. bonnes bandes": len(bandes) == n_motifs,
        "2. rangs 1..n ordonnes": rangs == list(range(1, n_motifs + 1)),
        "3. toutes les coupes": cartes == n_produits,
        "3b. un prix par coupe": len(prix) == cartes,
        "4. cle de motif non vide": all(h.strip() for h, _ in bandes),
        "5. aucun fond blanc": "object-fit:contain" in plat(html),
        "6. pas d'erreur Liquid": "Liquid error" not in html,
    }
    for k, ok in cas.items():
        print("%-22s %-26s %s" % (handle, k, "OK" if ok else "ECHEC"))
        if not ok:
            echecs.append("%s / %s" % (handle, k))

# Non-regression : une collection temoin garde l'ancienne grille.
temoin = get("debardeurs", view=None)
ok = "rdcsm__band" not in temoin and "product-grid" in temoin
print("%-22s %-26s %s" % ("debardeurs", "6b. non-regression", "OK" if ok else "ECHEC"))
if not ok:
    echecs.append("debardeurs / non-regression")

print()
if echecs:
    print("ECHECS : %d" % len(echecs))
    for e in echecs:
        print("  -", e)
    sys.exit(1)
print("Recette complete : tout est vert.")
