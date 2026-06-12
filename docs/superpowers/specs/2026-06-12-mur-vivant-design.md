# Section « Le mouvement est vivant » — mur communautaire mouvant

> Spec de design. Date : 2026-06-12. Statut : **validé** (maquette approuvée en aperçu navigateur).
> Beat 5 (preuve sociale) de la home Boutique. Fichier : `sections/rdc_mur-vivant.liquid`.

---

## 1. Intention

La section qui fait *ressentir* que le mouvement avance : un **carrousel mouvant** de TOUTES les
photos du mur communautaire (« ils nous portent »). Foule de visages heureux qui défile en continu
= énergie, fierté, « on crée quelque chose ensemble ». Renforce la preuve sociale (note + clients +
festivals) sans noyer.

## 2. Source de données

- Vue Postgres **`movement_wall_photos`** (Supabase, projet `ukpapqssgsxirsgmcvof`),
  **accessible en anon via PostgREST** (testé : HTTP 200) → pas de nouveau RPC.
- Requête : `GET {supabase_url}/rest/v1/movement_wall_photos?select=image_url,submitter_name,submitter_instagram,shopify_product_handle,shopify_product_title,message,created_at&order=created_at.desc&limit={max}`
- Colonnes utilisées : `image_url`, `submitter_name`, `submitter_instagram`,
  `shopify_product_handle`, `shopify_product_title`, `message`, `created_at`.
- ⚠️ Le *rating* étoilé par soumission n'est PAS dans la vue (extension Hub possible plus tard).
  La barre de stats globale (4,6/5) est donc un réglage de section éditable, pas un calcul live.

## 3. Composition (de haut en bas)

1. **En-tête** centré : surtitre (« Ils nous portent ») + titre (« Le mouvement est vivant ») + sous-titre.
2. **Barre de stats** (optionnelle) : ★ note (4,6/5) · +5 000 clients · +35 festivals en France.
   3 stats génériques éditables + une note avec étoiles.
3. **Mur mouvant** : 1 à 3 rangées (défaut **2**) en sens opposés, défilement continu, pause au survol.
4. **Pied** : intro courte + lien « Partage ta photo sur le mur → » vers le formulaire Hub
   (`https://hub.runesdechene.com/soumettre-contenu`).

Pas de bouton vers `/ils-nous-portent` (page **morte**, abandonnée).

## 4. Carrousel (marquee)

- CSS pur : track dupliqué, `translateX(0 → -50%)`, `linear infinite`.
- Rangées en sens alternés (rang 0 →, rang 1 ←, rang 2 →), durées légèrement différentes + ordre
  décalé par rangée pour éviter l'effet « miroir ».
- **Pause au survol** (`animation-play-state: paused`).
- Fondu aux bords (mask-image gradient).
- Cartes **portrait 2/3**, coins arrondis. Nom en discret au survol.

## 5. Robustesse petit volume (lancement sobre)

- On **répète** le jeu de photos jusqu'à remplir au moins ~2× la largeur viewport par demi-piste,
  pour une boucle sans couture **même avec 4 photos**.
- **0 photo OU config manquante → section entièrement masquée** (jamais de vide / d'erreur visible).
- `prefers-reduced-motion: reduce` → animation coupée (mur statique, scroll horizontal possible).

## 6. Clic → fiche (lightbox)

Mur épuré, valeur dans le détail. Au clic sur une photo, overlay plein écran :
grande photo + **nom** + **@instagram** (si présent) + **message/avis** (en *Alegreya* italique) +
bouton **produit porté** → `/products/{handle}` (si `shopify_product_handle` présent).
Fermeture : croix, clic hors carte, `Échap`.

## 7. Typo & couleurs (tokens du thème)

- Titre + chiffres de stats : `--font-heading--family` (Bebas Neue).
- Corps / sous-titre : `--font-body--family` (Cabin).
- Surtitre / labels / lien : `--font-accent--family` (Cabin Condensed).
- Témoignages : `--font-fragment--family` (Alegreya), italique.
- Couleurs : réglage `color_scheme` (tokens `--color-background` / `--color-foreground`) +
  un réglage `accent_color` (doré, défaut `#c98a3a`) pour étoiles / liens / séparateurs.

## 8. Réglages de section (schema)

- En-tête : `overline`, `title`, `subtitle`.
- Stats : `show_stats`, `stat_rating` (+ `show_stars`), `stat_rating_label`,
  `stat2_value`/`stat2_label`, `stat3_value`/`stat3_label`.
- Carrousel : `rows` (1–3, défaut 2), `speed` (s, défaut ~58), `card_width` (px), `max_photos`.
- Pied : `submit_intro`, `submit_label`, `submit_url` (défaut formulaire Hub).
- Données : `supabase_url`, `supabase_anon_key`.
- Style : `color_scheme`, `accent_color`, paddings haut/bas.
- `presets` : « RDC — Le mouvement est vivant ».

## 9. Placement & hors périmètre

- À insérer en **beat 5** de la home (`templates/index.json`), après les produits/réassurance.
- Section festival **dates** = séparée (beat 7), pas ici. Ici on garde seulement le *chiffre* festival.
- Fix de la page `/ils-nous-portent` : **abandonné** (page morte).
- Étoiles par soumission (rating live) : extension Hub future, hors périmètre.
