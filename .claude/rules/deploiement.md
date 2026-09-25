# Déploiement du thème

> Regroupé le 25/09/2026 depuis la mémoire locale, pour que ce protocole voyage avec le dépôt.
> Les pièges Shopify eux-mêmes vivent dans le `CLAUDE.md` de ce dépôt — ils ne sont pas dupliqués ici.

## Protocole « déploie shopify »

**Trigger** : quand Uriel dit `déploie shopify` ou `déploie` (dans contexte Shopify évident).

**Protocole automatique** :

1. **Stop `shopify theme dev`** si en cours (TaskStop sur le background task)
2. **Récupérer l'ID du Development theme actuel** :
   ```bash
   shopify theme list --store=runes-de-chene
   ```
   Chercher la ligne `[development] [yours]` — l'ID change à chaque création (les Development themes ont une lifespan ~7 jours).
3. **Pull** depuis le Development theme :
   ```bash
   cd "C:/Users/uriel/Desktop/DEVS/shopify (Runes de Chêne)" && shopify theme pull --theme=DEV_ID --store=runes-de-chene --force
   ```
   → récupère les settings qu'Uriel a édités via theme editor (images, couleurs, padding, perks, etc.)
4. **Push --live** vers le thème publié :
   ```bash
   cd "C:/Users/uriel/Desktop/DEVS/shopify (Runes de Chêne)" && shopify theme push --live --store=runes-de-chene --force --allow-live
   ```
   → push code + settings vers le thème actuellement live (peu importe son nom/ID)
5. **Confirmer** en chat avec l'URL https://runesdechene.com

**Pourquoi ce protocole** : les settings d'Uriel (images uploadées, couleurs custom, padding, etc.) sont stockés dans `templates/index.json` du Development theme distant, PAS dans le local. Sans le pull, on push un local obsolète et on perd ses ajustements.

**Risque** : `--live` push direct en production sans test intermédiaire. À utiliser quand on a déjà validé sur le Development theme. Pour test intermédiaire : push vers une "Copie de Crépuscule" d'abord, puis publish.

**Repo** : `C:/Users/uriel/Desktop/DEVS/shopify (Runes de Chêne)/` (machine FONDATION).

**Établi** : 23 avril 2026, fin de session refonte popup home Boutique.
