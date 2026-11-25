# Déploiement du thème

> Regroupé le 25/09/2026 depuis la mémoire locale, pour que ce protocole voyage avec le dépôt.
> Les pièges Shopify eux-mêmes vivent dans le `CLAUDE.md` de ce dépôt — ils ne sont pas dupliqués ici.

## Protocole « déploie shopify »

**Trigger** : quand Uriel dit `déploie shopify` ou `déploie` (dans un contexte Shopify évident).
Boutique `eef6c4-b5.myshopify.com`, thème en ligne `181425930507` (si la CLI refuse l'accès, elle est
connectée à une autre boutique : `shopify auth logout`).

**Jamais de `theme push` complet.** Dans l'ordre :

1. `git branch -a --no-merged main` : une branche déjà envoyée en ligne et absente de `main` se fusionne
   **avant** de toucher au moindre fichier.
2. Tirer le thème en ligne dans un dossier à part (`theme pull --path <dossier>`).
3. Pour chaque fichier à envoyer, comparer la version en ligne à la version **d'avant ses propres
   modifications**. Un écart = quelqu'un d'autre l'a changé : le reprendre d'abord. Les réglages de
   l'éditeur (`templates/*.json`, `*-group.json`, `settings_data.json`) font foi en ligne.
4. `theme push --path <dépôt> --theme=181425930507 --only <fichiers> --allow-live --nodelete`
5. Re-tirer ces fichiers pour comparer, puis vérifier la page sur runesdechene.com.

## `main` doit contenir tout ce qui est en ligne (26/11/2026)

**Le piège** : 56 commits envoyés en ligne depuis une branche n'avaient jamais rejoint `main`. Le 18/11,
un correctif fait sur le `rdc_cta-final.liquid` de `main` a écrasé en ligne le formulaire prénom + e-mail
et rendu au pied de page de l'accueil son inscription.

**How to apply :** une branche se fusionne dans `main` dès qu'un de ses fichiers part en ligne.

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
