"""Banc d'essai commun : lire une page servie par `shopify theme dev`.

PREREQUIS : `shopify theme dev --store runes-de-chene.myshopify.com` doit
tourner dans un VRAI terminal, lance par un humain.

⚠ TOUJOURS passer `--path` a la CLI Shopify (voir spec §10). Sans lui, elle
scanne un AUTRE dossier (`Desktop/DEVs/XO`, 488 fichiers) : les fichiers neufs
ne montent jamais, et l'etape « Cleaning your remote theme » supprime du thème
distant tout ce qui manque au dossier scanné. C'est ainsi qu'une section a ete
effacee d'une page en production le 2026-08-10.

Le template alterne se lit via `?view=saga`, sans qu'aucune collection n'ait
ete reassignee : la boutique live n'est pas affectee.
"""
import urllib.request

BASE = "http://127.0.0.1:9292"


def get(handle, view="saga"):
    """Rend /collections/<handle> avec le template alterne <view>."""
    url = "%s/collections/%s" % (BASE, handle)
    if view:
        url += "?view=%s" % view
    with urllib.request.urlopen(url, timeout=90) as r:
        return r.read().decode("utf-8", "replace")


def plat(html):
    """HTML sans espaces — pour tester du CSS sans se soucier du formatage."""
    return html.replace(" ", "").replace("\n", "")
