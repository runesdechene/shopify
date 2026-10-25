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

## Le dépôt local n'est pas le thème en ligne — on ne pousse que ses propres fichiers (25/10/2026)

**Le piège** : le 25/10, le dépôt avait plusieurs fichiers en retard sur le thème en ligne (menu mobile,
newsletter, `rdc_motif`, `fragment-audio`…). Un `theme push` complet aurait écrasé ces corrections. Et Uriel
règle ses images et ses textes **dans l'éditeur en ligne** : entre deux déploiements, `templates/index.json`
change en ligne sans passer par le dépôt.

**How to apply :**
- Travailler sur une copie du thème en ligne (`theme pull --theme=<LIVE_ID> --path <dossier à part>`),
  y poser ses fichiers, prévisualiser avec `theme dev --path <ce dossier>`.
- Avant chaque déploiement : re-tirer `templates/index.json` en ligne, comparer section par section, et
  **repartir de la version en ligne** en n'y appliquant que ses propres réglages.
- Pousser avec `--only` les seuls fichiers touchés, puis vérifier sur runesdechene.com.

## `theme dev` envoie tout ce qui apparaît dans le dossier, même un fichier temporaire

**Le piège** (25/10/2026) : un `sed -i` et l'outil d'édition créent un fichier temporaire à côté du vrai ;
`theme dev` l'a envoyé (« Doit avoir une extension de fichier .liquid ») et l'aperçu est resté bloqué sur une
page d'erreur jusqu'au redémarrage. **How to apply :** modifier les fichiers dans le dépôt, puis les recopier
(`cp`) dans le dossier surveillé ; jamais d'édition sur place.

## Arrêter `theme dev` ne libère pas le port 9292

**Le piège** (25/10/2026) : arrêter la tâche laisse tourner le processus `node` : le redémarrage échoue avec
`EADDRINUSE`. **How to apply :** après l'arrêt, tuer le processus qui écoute sur 9292
(`Get-NetTCPConnection -LocalPort 9292` → `Stop-Process`).

## Un réglage `range` refuse toute valeur hors de son pas

`padding_top` à 18 avec un pas de 4 → « must be a step in the range », et tout `index.json` est refusé.
Changer le pas d'un `range` : au plus 101 crans entre `min` et `max`.
