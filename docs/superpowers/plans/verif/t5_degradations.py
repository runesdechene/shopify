import sys
import os
import re
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from page import get

SAGAS = ["garde-d-acier", "les-mysteres-celtes", "lombre-et-lairain", "le-pacte-sauvage"]

ok_global = True
for handle in SAGAS:
    html = get(handle)

    bandes = re.findall(r'data-motif="([^"]+)"', html)
    noms = re.findall(r'class="rdcsm__name"[^>]*>\s*([^<]*?)\s*<', html)
    resumes = re.findall(r'class="rdcsm__res"[^>]*>\s*([^<]*?)\s*<', html)
    cartes = len(re.findall(r'class="rdcsm__cut"', html))

    checks = {
        "au moins une bande": len(bandes) >= 1,
        "aucun nom de motif vide": bool(noms) and all(n.strip() for n in noms),
        "aucun paragraphe resume vide": all(r.strip() for r in resumes),
        "aucune erreur Liquid dans la page": "Liquid error" not in html,
        "aucun placeholder visible": "TODO" not in html and "Lorem" not in html,
        "au moins une carte par bande": cartes >= len(bandes),
        "pas d'avertissement 50 produits": "expose que 50" not in html,
    }
    for k, ok in checks.items():
        print("%-22s %-36s %s" % (handle, k, "OK" if ok else "ECHEC"))
        ok_global = ok_global and ok
    print("%-22s bandes=%d cartes=%d resumes=%d" % (handle, len(bandes), cartes, len(resumes)))

sys.exit(0 if ok_global else 1)
