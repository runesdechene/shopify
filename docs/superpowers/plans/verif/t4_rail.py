import sys
import os
import re
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from page import get, plat

html = get("garde-d-acier")
flat = plat(html)

cartes = len(re.findall(r'class="rdcsm__cut"', html))
prix = re.findall(r'class="rdcsm__cprice"[^>]*>\s*([^<]+?)\s*<', html)

checks = {
    "20 cartes de coupe (3 motifs)": cartes == 20,
    "chaque carte porte un prix": len(prix) == cartes,
    "les prix sont en euros": bool(prix) and all("€" in p for p in prix),
    "le plus bas est 29,90": any("29,90" in p for p in prix),
    "le plus haut est 109,90": any("109,90" in p for p in prix),
    "les nuanciers sont rendus": "swatch" in html,
    "fond de carte transparent": "background:transparent" in flat,
    "images en contain, non rognees": "object-fit:contain" in flat,
    "aucun format jpg force": "format:'jpg'" not in flat,
}
for k, ok in checks.items():
    print(("OK   " if ok else "ECHEC") + "  " + k)
print("cartes=%d prix=%d" % (cartes, len(prix)))
sys.exit(0 if all(checks.values()) else 1)
