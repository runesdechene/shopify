"""Banc d'essai commun : lire une page servie par `shopify theme dev`.

PREREQUIS : `shopify theme dev --store runes-de-chene.myshopify.com` doit
tourner dans un VRAI terminal, lance par un humain.

⚠ Pourquoi cette precision (appris a la dure le 2026-08-10) : lance depuis un
shell non interactif, la CLI Shopify **ne televerse jamais un fichier neuf**.
Elle affiche « success » et ne fait rien. Consequence : toute section ou tout
template cree par l'agent reste invisible cote Shopify tant qu'un `theme dev`
interactif ne l'a pas synchronise.

⚠ NE JAMAIS lancer `shopify theme push` pendant ce chantier : son etape
« Cleaning your remote theme » SUPPRIME du thème distant les fichiers que son
scanner ne voit pas — c'est-a-dire precisement les fichiers neufs.

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
