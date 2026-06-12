# Spec — Hero saisonnier de la Home Boutique

**Date** : 2026-04-23
**Statut** : Validé par Uriel, prêt pour plan d'implémentation
**Auteurs** : XO + Uriel
**Fichier cible** : `sections/rdc_hero-saison.liquid`
**Template impacté** : `templates/index.json`

---

## 1. Contexte

`runesdechene.com` a aujourd'hui une home en 4 sections (hero text plain « Soyez audacieux » → carrousel illustrations → 4 piliers icônes sourcing → bloc « marque française »). Cette home vend des t-shirts. La doctrine `🧭 STRATEGIE — Runes de Chêne 2026` du 22 avril a tranché : la home doit devenir le **carrefour du mouvement**, orientant en 3 secondes vers l'application OU la boutique. Le pivot complet du site (menu, sections narratives, page Boutique dédiée) viendra par étapes — **ce sprint refait uniquement le hero**.

Décision stack collatérale : la migration vers Hydrogen + Oxygen a été évaluée et **reportée** (POC envisagé plus tard). On reste sur le thème Crépuscule (fork Heritage v3.2.1) pour ce chantier.

## 2. Objectif

Une home **one-screen** (un seul viewport, mobile et desktop) qui :
1. Pose le mouvement en moins de 3 secondes via image, titre, sous-titre, accroche
2. Oriente vers deux destinations : application OU Fragments (boutique)
3. Installe la crédibilité par une tagline maison mémorable
4. Pivote saisonnièrement (4×/an) pour incarner la mécanique de saisons du mouvement

## 3. Décisions tranchées

| Décision | Choix | Raison |
|---|---|---|
| Stack | Crépuscule actuel (pas Hydrogen) | Temporiser, pas de bande passante dev pour migration full |
| Format | One-screen (100dvh mobile + desktop) | Décision binaire en 3 secondes, pas de scroll-fatigue |
| Section | Custom `rdc_hero-saison.liquid` (pas section native Heritage) | Besoins spécifiques (Ken Burns, art-direction responsive, hauteur dvh, hiérarchie spécifique) |
| Saisonnalité | Assumée — pivot 4×/an (équinoxes/solstices) | Aligne le site avec la mécanique de saisons in-app |
| Recherche de lieux dans le hero | **Refusée** | Diluerait la décision binaire, retirerait une raison de télécharger l'app, invivable mobile |
| Mention de marque dans le titre | Refusée | Logo header + URL disent déjà le nom ; le titre vend la promesse |
| Témoignage | **Tagline maison assumée**, pas faux avis, pas vrai avis | Sobriété Voie 3, zéro risque juridique, zéro maintenance, mémorable |
| Système d'avis Hub → site | Reporté V2 (post-Hub V1, fin juin) | Hors scope ce sprint, à inscrire au Backlog |

## 4. Architecture de la section

```
sections/rdc_hero-saison.liquid
├── Container 100dvh, position relative
├── <picture> art-direction
│   ├── <source media="(min-width: 768px)" srcset="{{ image_desktop }}">
│   └── <img src="{{ image_mobile }}" alt="{{ image_alt }}">
├── Overlay gradient (linear, bottom→top, plus dense en bas)
└── Contenu, en colonne, justify-between
    ├── Bloc texte (haut)
    │   ├── .rdc-hero__overline   → « CET ÉTÉ, »
    │   ├── .rdc-hero__title       → « MARCHEZ DANS L'HISTOIRE. »
    │   ├── .rdc-hero__subtitle    → sous-titre
    │   └── .rdc-hero__pitch       → accroche chiffrée
    ├── Bloc CTA (milieu-bas)
    │   ├── .rdc-hero__cta-primary   → « Télécharger l'application »
    │   └── .rdc-hero__cta-secondary → « Découvrir les Fragments »
    └── Bloc tagline (bas, fin, italique)
        └── « Le Pokémon Go du patrimoine. »
```

## 5. Settings Shopify (theme editor)

Tous les champs ci-dessous sont éditables par Mathéo/Uriel **sans toucher au code**, depuis l'éditeur de thème Shopify.

| Setting | Type | Défaut été 2026 | Notes |
|---|---|---|---|
| `image_desktop` | image_picker | (Perseus Vegvisir paysage) | Format paysage 16:10 ou plus large |
| `image_mobile` | image_picker | (à fournir par Uriel) | Format portrait 9:16 ou approchant |
| `image_alt` | text | « Personne face aux montagnes » | Accessibilité, requis |
| `overline` | text | `CET ÉTÉ,` | Surtitre. Vide = masqué |
| `title` | text | `MARCHEZ DANS L'HISTOIRE.` | Titre principal jumbo |
| `subtitle` | richtext | `Une marque française, une application, une Confrérie. Pour redécouvrir nos contrées.` | Sous-titre |
| `pitch` | text | `+ de 2600 lieux magiques, partout en France.` | Accroche chiffrée |
| `cta_primary_label` | text | `Télécharger l'application` | |
| `cta_primary_url` | url | `https://app.runesdechene.com` | Domaine principal de la PWA (`carte.runesdechene.com` redirige vers cette URL) |
| `cta_secondary_label` | text | `Découvrir les Fragments` | |
| `cta_secondary_url` | url | (URL page Boutique à créer) | Pointe vers la future page Boutique |
| `tagline` | text | `Le Pokémon Go du patrimoine.` | Affichée en italique sobre |
| `enable_ken_burns` | checkbox | true | Désactive le dézoom JS si false |
| `overlay_strength` | range 0-100 | 40 | Intensité du gradient overlay |

## 6. Copy figée — version été 2026 (Grande Floraison)

```
CET ÉTÉ,
MARCHEZ DANS L'HISTOIRE.

Une marque française, une application, une Confrérie.
Pour redécouvrir nos contrées.

+ de 2600 lieux magiques, partout en France.

[ Télécharger l'application ]   [ Découvrir les Fragments ]

« Le Pokémon Go du patrimoine. »
```

## 7. Comportements responsive

- **Hauteur** : `100dvh` (dynamic viewport height) pour gérer correctement les barres navigateur iOS/Android. Fallback `100vh` pour navigateurs non-supportants.
- **Desktop ≥ 768px** : photo paysage en arrière-plan, contenu aligné à gauche dans un container max-width ~720px, padding généreux.
- **Mobile < 768px** : photo portrait en arrière-plan, contenu centré verticalement avec marges latérales serrées, CTA empilés verticalement et `width: 100%`.
- **Garantie** : les CTA doivent toujours être visibles dans le viewport sans scroll, même sur petit écran (iPhone SE ~667px de hauteur). Si nécessaire, réduire taille typographique ou hauteur padding sur très petits écrans.
- **Accessibilité** : contraste texte/fond ≥ 4.5:1 (WCAG AA) garanti par l'overlay gradient et la couleur foncée des zones de texte.

## 8. Comportement JavaScript — Ken Burns

- Au chargement, l'image démarre légèrement zoomée (`scale(1.10)`).
- Animation CSS keyframe en yo-yo continu : 30s zoom out (1.10 → 1.00) puis 30s zoom in (1.00 → 1.10), boucle infinie.
- Easing `ease-in-out` pour douceur, pas d'à-coups.
- `transform-origin` centré pour mobile, `center bottom` pour desktop (concentre l'effet sur le sujet et la vallée).
- Désactivé automatiquement si `prefers-reduced-motion: reduce` (accessibilité WCAG).
- Désactivable manuellement par setting `enable_ken_burns`.

## 9. Maintenance saisonnière

Pivot 4×/an aux dates suivantes (à inscrire dans le calendrier Mathéo) :

| Date | Saison | Surtitre proposé |
|---|---|---|
| 21 juin 2026 | Été (Grande Floraison) | `CET ÉTÉ,` |
| 22 septembre 2026 | Automne | `CET AUTOMNE,` |
| 21 décembre 2026 | Hiver | `CET HIVER,` |
| 20 mars 2027 | Printemps | `CE PRINTEMPS,` |

À chaque pivot : modifier `overline`, `image_desktop`, `image_mobile`, et éventuellement ajuster `pitch` si la promesse saisonnière évolue. Une **banque de 4 photos préparées d'avance** (chez Uriel/Mathéo) évite la panique le jour J.

Note : le titre `MARCHEZ DANS L'HISTOIRE.` et le sous-titre peuvent rester stables d'une saison à l'autre — c'est l'overline + la photo qui portent la signature saisonnière. Réviser au cas par cas.

## 10. Hors-scope (ne sera PAS fait dans ce sprint)

- Refonte du **menu** du site (Mouvement · Application · Fragments · Festivals · Journal) — chantier séparé
- Création de la **page Boutique** vers laquelle pointe le CTA secondaire — chantier séparé, à enchaîner après ce hero
- Création des **sections narratives au scroll** sous le hero (Rune · Héritages · Porteur · Comment rejoindre) — la home est délibérément one-screen pour ce sprint
- **Système d'avis Hub → site** — à inscrire dans Backlog Hub V1 (fin juin)
- **Recherche de lieux dans le hero** — refusé doctrinalement
- **Refonte SCSS générale** — on s'aligne sur la palette/typo Crépuscule existante, pas de nouvelle DA
- **Migration Hydrogen** — reportée, à réévaluer après ce hero

## 11. Critères d'acceptation

Ce hero est considéré comme livré quand :

1. La section `sections/rdc_hero-saison.liquid` existe avec tous les settings listés au §5
2. La home (`templates/index.json`) utilise cette section en première position, en remplacement de la section actuelle « Heading »
3. Sur Chrome/Safari/Firefox desktop ≥ 1280px, le hero remplit `100dvh`, photo desktop visible, contenu lisible, CTA fonctionnels
4. Sur iPhone (Safari) et Android (Chrome) en portrait, le hero remplit `100dvh`, photo mobile visible, **CTA toujours visibles sans scroll**, contenu lisible
5. Ken Burns visible sur desktop, désactivé si `prefers-reduced-motion: reduce`
6. CTA primaire pointe vers l'URL de téléchargement de l'application
7. CTA secondaire pointe vers une URL temporaire (anchor `/collections/all` ou `/products` en attendant la page Boutique dédiée)
8. Mathéo confirme qu'il peut éditer titre/photos/copy via le theme editor sans assistance
9. Lighthouse mobile : Performance ≥ 80, Accessibility ≥ 95

## 12. Évolutions prévues (V2 du hero)

À envisager après le sprint, dans cet ordre :

- **V2.1** : remplacement de la tagline maison par rotation de **vrais avis Porteurs** collectés via Hub V1 (post fin juin 2026)
- **V2.2** : ajout d'un **indicateur saisonnier visuel** (petit logo/badge changeant avec la saison)
- **V2.3** : possible POC Hydrogen sur cette section seule, en parallèle de la prod Crépuscule, comme test de migration

---

*Spec rédigée en session brainstorming XO + Uriel le 23 avril 2026.*
