import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from page import get, plat

html = get("garde-d-acier")

checks = {
    "la section hero est rendue": 'data-rdc-saga-hero' in html,
    "elle porte un id unique RdcSagaHero-": 'RdcSagaHero-' in html,
    "la hauteur est en vh, pas en px": 'min-height:84vh' in plat(html),
    "le template par defaut ne rend plus": 'product-grid' not in html,
}
for k, ok in checks.items():
    print(("OK   " if ok else "ECHEC") + "  " + k)
sys.exit(0 if all(checks.values()) else 1)
