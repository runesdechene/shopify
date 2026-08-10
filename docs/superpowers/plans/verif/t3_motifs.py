import sys
import os
import re
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from page import get

ATTENDU = {
    "garde-d-acier":       {"bandes": 3, "premier": "Skjaldm"},
    "les-mysteres-celtes": {"bandes": 3},
    "lombre-et-lairain":   {"bandes": 2},
    "le-pacte-sauvage":    {"bandes": 3},
}

ok_global = True
for handle, att in ATTENDU.items():
    html = get(handle)

    bandes = re.findall(r'data-motif="([^"]+)" data-rank="(\d+)"', html)
    noms = re.findall(r'class="rdcsm__name"[^>]*>\s*([^<]+?)\s*<', html)

    rangs = [int(r) for _, r in bandes]
    cas = {
        "nombre de bandes = %d" % att["bandes"]: len(bandes) == att["bandes"],
        "rangs 1..n dans l'ordre": rangs == list(range(1, len(rangs) + 1)) and rangs != [],
        "aucun motif en double": len(set(h for h, _ in bandes)) == len(bandes),
    }
    if "premier" in att:
        cas["le plus recent en premier"] = bool(noms) and att["premier"].lower() in noms[0].lower()

    for label, cond in cas.items():
        print("%-22s %-28s %s" % (handle, label, "OK" if cond else "ECHEC"))
        ok_global = ok_global and cond
    print("%-22s motifs: %s" % (handle, [h for h, _ in bandes]))

sys.exit(0 if ok_global else 1)
