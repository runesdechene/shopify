"""Banc d'essai commun : recuperer une page rendue par le theme de DEV.

Pourquoi pas `shopify theme dev` (localhost:9292) : verifie le 2026-08-10,
son surveillant de fichiers ne televerse pas les fichiers NEUFS. La page
servie restait donc celle d'avant, et toutes les assertions echouaient a
tort. L'apercu distant du theme de developpement, lui, dit la verite.

Le theme de dev est [unpublished] : aucun client ne le voit. Le theme LIVE
n'est jamais touche.

Avant de verifier, synchroniser :
    python docs/superpowers/plans/verif/sync.py
"""
import http.cookiejar
import os
import urllib.request

BOUTIQUE = "https://runes-de-chene.myshopify.com"
THEME_DEV = os.environ.get("RDC_THEME_DEV", "181696168203")

_jar = http.cookiejar.CookieJar()
_opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(_jar))
_opener.addheaders = [("User-Agent", "rdc-verif/1.0")]


def get(handle, view="saga"):
    """Rend /collections/<handle> avec le template alterne <view>."""
    url = "%s/collections/%s?preview_theme_id=%s" % (BOUTIQUE, handle, THEME_DEV)
    if view:
        url += "&view=%s" % view
    with _opener.open(url, timeout=45) as r:
        return r.read().decode("utf-8", "replace")


def plat(html):
    """HTML sans espaces — pour tester du CSS sans se soucier du formatage."""
    return html.replace(" ", "").replace("\n", "")
