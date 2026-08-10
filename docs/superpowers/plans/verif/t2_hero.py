import sys
import os
import re
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from page import get, plat

html = get("garde-d-acier")
flat = plat(html)

# Attention : `rdcsh__slides` (le conteneur) contient `rdcsh__slide`.
# On borne donc la classe pour ne compter que les vraies diapos.
slides = len(re.findall(r'class="rdcsh__slide[ "]', html))
dots = len(re.findall(r'class="rdcsh__dot[ "]', html))

# Les points ne s'affichent qu'a partir de deux diapos : une seule image
# (repli sur collection.image) ne merite pas de navigation.
dots_ok = (dots == slides) if slides > 1 else (dots == 0)

checks = {
    "au moins une diapo est rendue": slides >= 1,
    "points coherents avec les diapos": dots_ok,
    "le titre est en surimpression": 'rdcsh__title' in html,
    "le voile degrade est applique": 'rgba(0,0,0,.62)' in flat,
    "Ken Burns est declare": 'rdcshKen' in html,
    "le mouvement se coupe si l'utilisateur le demande": 'prefers-reduced-motion' in html,
    "aucun format jpg force": "format:'jpg'" not in flat and 'format:"jpg"' not in flat,
    "la grille par defaut ne rend pas": 'product-grid' not in html,
}
for k, ok in checks.items():
    print(("OK   " if ok else "ECHEC") + "  " + k)
print("diapos=%d points=%d" % (slides, dots))
sys.exit(0 if all(checks.values()) else 1)
