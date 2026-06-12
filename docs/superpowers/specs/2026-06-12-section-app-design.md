# Section « L'application » (beat 6) — home Boutique

> Spec de design. Date : 2026-06-12. Statut : **validé** (8 itérations de maquette en aperçu navigateur).
> Fichier : `sections/rdc_app.liquid`. Beat 6 (zone app/communauté) de la home.

---

## 1. Intention

Faire **ressentir et rejoindre** l'application : un vrai jeu d'exploration du patrimoine. La preuve
visuelle (vidéo de l'app) doit arriver **vite**, surtout sur mobile. Pont marque → app
(« porter / vivre »). CTA unique vers l'app.

## 2. Mise en page (grid-areas : `head` / `stage` / `body`)

- **Desktop** : 2 colonnes. Colonne gauche = `head` (surtitre + titre) puis `body` (phrase-pont,
  lead, sous-titre, chips, badge, CTA). Colonne droite = `stage` (téléphone + vidéo), centré vertical.
- **Mobile** : 1 colonne, ordre **`head` → `stage` (VIDÉO) → `body`**. On comprend tout de suite
  que c'est une app avant le gros du texte. Texte centré, chips centrées.

## 3. Contenu

- Surtitre : **« L'application »** (doré).
- Titre (Bebas) : **« Ton territoire, un terrain d'aventure. »**
- Phrase-pont (Alegreya italique, brique) : *« Une marque. Une application. L'une vous fait porter
  l'Histoire. La seconde vous la fait vivre. »*
- Lead : *« La plus grosse communauté francophone jamais fédérée autour de l'Histoire, l'Aventure
  & la Nature — dans ta poche. »*
- Sous-titre : **« Une carte. Mille façons de jouer. »**
- **Chips** (features = blocs réordonnables/ajoutables), chacune avec un **petit SVG sur-mesure** :
  Énigmes (clé) · Missions (cible) · Défis du jour (soleil) · Défis collectifs (groupe) ·
  Événements (calendrier) · Factions (blason) · Coupe des Héritages (trophée).
  Chips parcheminées (crème vieilli, liseré brique, capitales condensées, **pill arrondi**).
- Badge : **« Gratuit · un clic · rien à installer »** (point vert).
- CTA : **« Essayer l'application »** → **https://app.runesdechene.com** (réglable).

## 4. Visuel téléphone (`stage`)

- Cadre téléphone sombre **sans notch** + halo doré derrière.
- Écran = **vidéo** en lecture **auto, muette, en boucle, `playsinline`**, `object-fit: cover`.
- Source vidéo, par ordre de priorité :
  1. **Réglage `video` Shopify** (Files, transcodé/optimisé — *recommandé*, c'est là qu'on met les 18 Mo).
  2. **`video_external_url`** (texte) : URL MP4/webm externe (CDN).
  3. **Poster** (image) si aucune vidéo / pendant le chargement.
  4. Sinon placeholder discret (mode éditeur).
- `prefers-reduced-motion` → vidéo en pause (ou poster).

## 5. Réglages (schema)

Textes : surtitre, titre, phrase-pont, lead, sous-titre chips, badge, CTA (label + url, défaut app).
Vidéo : `app_video` (video), `video_external_url` (text), `video_poster` (image).
Style : `color_scheme`, `accent_color`, paddings haut/bas, **`anchor_id`** (ancre, défaut `application`).
**Blocs `feature`** : `label` (text) + `icon` (select dans une bibliothèque d'icônes :
key, target, sun, group, calendar, shield, trophy, book, gem, compass, flame, map). Preset = les 7 ci-dessus.
`presets` : « RDC — L'application ».

## 6. Conventions / contraintes

- Tokens du thème (`--font-heading/body/accent/fragment--family`, `--color-*`), couleur d'accent brique.
- **Nom de section ≤ 25 car** (« RDC — L'application » = 18). Schema valide (pas de `default` url externe, ranges ≤ 101 pas).
- **Placement dans la home** : à ajouter **via l'éditeur en ligne** (mode `--theme-editor-sync` → éditer `index.json` en local serait écrasé). Nouveau fichier de section → **redémarrer `shopify theme dev`** pour qu'il l'enregistre.
- Vidéo **non committée dans git** (18 Mo) — hébergée sur Shopify Files via le réglage `video`.

## 7. Hors périmètre

- Compression vidéo (pas de ffmpeg local) → Shopify transcode à l'upload.
- Section festival/événements *dates* (beat 7) — séparée.
