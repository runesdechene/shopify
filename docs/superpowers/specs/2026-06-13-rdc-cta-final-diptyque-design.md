# RDC — CTA de fin : refonte en diptyque contenu

> Date : 2026-06-13 · Section : `sections/rdc_cta-final.liquid` · Page : Accueil (bas de page)

## Contexte & problème

La home se terminait sur les logos presse (« Ils parlent de nous »), sans appel à
l'achat. On a ajouté une section `rdc_cta-final` de clôture, mais sa première version
(sur-titre + titre + sous-titre + 1–2 boutons centrés) **ressemblait trop au CTA de la
section « Application »** — deux boutons fades, pas vendeur.

Objectif : remplacer ce contenu par un **élément graphique fort** qui referme le parcours
sur l'achat, avec une **photo de shooting mise en avant et animée**.

## Direction validée

Diptyque **contenu en largeur de page** (pas plein écran), présenté comme un
**rectangle à coins arrondis** : panneau texte parchemin d'un côté, photo de shooting
animée de l'autre. (Concept « 3 » du brainstorm, version contenue.)

Charte respectée : titres **Bebas Neue** (`--font-heading--family`), corps **Cabin**
(`--font-body--family`), ligne d'accent **Alegreya** italique (`--font-fragment--family`),
fond **parchemin**, **bouton doré** (#f4d694 / texte #623c3c), accents **brique** (#833434).

## Mise en page

### Desktop (≥ 750px)
- Container centré **largeur de page** (`max-width: var(--page-width, 1180px)`, padding
  inline ~32px). La section reste full-width pour le fond, mais le **panneau** est contenu.
- Le panneau est un **rectangle arrondi** : `border-radius` réglable (défaut 24px),
  `overflow:hidden`, ombre douce + filet 1px.
- 2 colonnes en flex :
  - **Panneau texte** : largeur réglable (défaut 44%). Fond parchemin (dégradé radial doux
    basé sur le schéma de couleur). Contenu vertical-centré, padding `clamp(28px,4vw,56px)`,
    `gap` ~18px.
  - **Photo** : prend le reste (`flex:1`), `position:relative`, `overflow:hidden`.
- **Côté de l'image réglable** (`image_side` : droite par défaut / gauche) via `flex-direction`
  (`row` ou `row-reverse`).

### Mobile (< 750px)
- Empilé en colonne : **photo en haut, texte dessous**, même `border-radius` sur le bloc global.
- Hauteur de la photo réglable (défaut ~240px) ou ratio fixe.
- Padding texte réduit.

## Contenu du panneau texte
1. Sur-titre (`overline`) — Cabin 700, uppercase, letter-spacing .3em, couleur accent/brique. Optionnel.
2. Titre (`title`) — Bebas Neue, `clamp(40px, 5vw, 78px)`, line-height .84. Optionnel.
3. Ligne d'accent (`subtitle`) — Alegreya italique, couleur foreground du schéma. Optionnel (richtext).
4. Bouton (`button_label` + `button_url`) — doré, radius 12px, padding ~14px 28px, `→` en suffixe.
   Léger « sheen » (ombre dorée) au survol. Affiché seulement si `button_label` non vide.

## Photo + animation
- `background-size:cover; background-position:center` (ou `<img>` object-fit cover).
- **Ken burns** : `@keyframes` zoom **de scale(1.03) à scale(1.12)** (jamais 1.0 exact pour
  éviter tout bord visible), `transform-origin:center`, durée ~16s `ease-in-out infinite alternate`,
  `will-change:transform`. La colonne image est en `overflow:hidden` → **la photo ne sort jamais
  du cadre arrondi**.
- Toggle `animate` (défaut activé).
- **`@media (prefers-reduced-motion: reduce)`** → animation coupée.

## Réglages (schema)

Réutiliser les ids existants quand c'est possible (l'instance home les a déjà) :

| id | type | défaut | note |
|----|------|--------|------|
| `overline` | inline_richtext | « Nos créations » | |
| `title` | inline_richtext | « Un Fragment pour chaque âme » | Bebas |
| `subtitle` | richtext | ligne Alegreya | |
| `button_label` | text | « Découvrir la boutique » | |
| `button_url` | url | (vide) | sélecteur natif page/collection |
| `image` | image_picker | — | photo bureau |
| `image_mobile` | image_picker | — | photo mobile (sinon `image`) |
| `image_side` | select (right/left) | right | |
| `text_panel_width` | range 30–60% | 44 | largeur panneau desktop |
| `corner_radius` | range 0–40px | 24 | |
| `image_min_height` | range 320–640px | 440 | hauteur mini panneau desktop |
| `image_height_mobile` | range 160–420px | 240 | hauteur photo mobile |
| `animate` | checkbox | true | ken burns |
| `color_scheme` | color_scheme | scheme-1 | parchemin |
| `accent_color` | color | #833434 | sur-titre |
| `button_bg` | color | #f4d694 | doré |
| `button_text` | color | #623c3c | |
| `padding_top` / `padding_bottom` | range | 72 / 80 | marges section |
| `anchor_id` | text | (pas de défaut) | éviter default vide (rejeté par Shopify) |

Placeholder si `image` vide : `placeholder_svg_tag` + message dans le panneau image.

## Comportement / cas limites
- **Pas de `default` vide sur un champ `text`/`url`** (rejet serveur Shopify) → `anchor_id`,
  `button_url`, `image*` sans clé `default`.
- Si `button_label` vide → pas de bouton.
- Si **les 4 champs texte sont vides** (`overline`, `title`, `subtitle`, `button_label`) →
  on **masque le panneau texte** et la photo occupe toute la largeur du rectangle arrondi.
  Sinon → diptyque normal.
- `name` de section ≤ 25 caractères (« RDC — CTA final » = 15, OK).
- Section déjà enregistrée → pas besoin de redémarrer `shopify theme dev` (fichier existant).

## Fichiers touchés
- `sections/rdc_cta-final.liquid` — réécriture complète (markup + `<style>` + schema).
- `templates/index.json` — l'instance `rdc_cta_final_z9Kq2` reste ; on peut compléter ses
  settings (image_side, etc.) mais ce n'est pas requis (defaults). **Attention** : piloté par
  l'éditeur si `--theme-editor-sync`.

## Hors-scope (YAGNI)
- Bouton secondaire, voile/overlay sur image, réglage d'alignement du texte (retirés de la v1).
- Vraie photo : fournie plus tard par l'utilisateur via l'éditeur (réglages image bureau/mobile).
- Pas de parallaxe au scroll (ken burns suffit).
