# Page de collection « saga » — conception

> Statut : validée en maquette le 2026-08-10 (v7, compagnon visuel).
> Périmètre : les 4 sagas existantes. Aucune autre collection n'est touchée.

## 1. Le problème, chiffré

Les sagas tombent aujourd'hui sur le template Shopify par défaut (`main-collection.liquid`) : une grille plate de 24 produits avec filtres. Rien ne dit pourquoi la collection existe.

Surtout, **la grille plate ment sur le catalogue** :

| Saga | Produits affichés | Motifs réels |
|---|---|---|
| Les mystères celtes | 17 | 3 — Avalon, Morrigan, Druide |
| La Garde d'Acier | 20 | 3 — Skjaldmö, Varègue, Valkyrie |
| Le Pacte Sauvage | 15 | 3 — Loutre, Hibou, Loup |
| D'ombre et d'airain | 12 | 2 — Hoplite, Hécate |

Avalon apparaît 7 fois d'affilée. C'est le pire format possible pour un produit dont l'argument est le dessin.

## 2. Ce qu'on construit

Une page par saga : un hero plein cadre avec le texte en surimpression, puis **une bande par motif**, du plus récent au plus ancien. Chaque bande porte le sceau de l'illustration, le nom du motif, son résumé, et le rail complet de ses coupes avec prix et pastilles de couleur.

Le regroupement et le tri sont **automatiques**. Rien à maintenir à la main quand un motif ou une coupe s'ajoute.

## 3. Données

### Existant, à lire (rien à créer)

- `product.metafields.custom.illustration_produit` → métaobjet illustration. Champs utilisés : `nom`, `resume`, `date`, `image_pour_fond_clair`, `image_pour_fond_sombre`.
- `collection.description` → le descriptif du hero.
- `collection.image` → image de repli du carrousel.
- Nuanciers Shopify : déjà configurés sur l'option « Couleur » (vraies textures Kaki, Bordeaux, Écru…). Rendus via le snippet existant `variant-swatches`.

### À créer — un seul champ

**`custom.hero_images`** sur *Collection*, type **liste de fichiers**. Alimente le carrousel du hero. Créé par Uriel le 2026-08-10.

> À confirmer avant implémentation : le namespace et la clé exacts, ainsi que le type retenu (liste de fichiers vs liste d'images). Le code lit `.value` avec repli sur l'accès direct, comme le fait déjà `illustration-card.liquid`.

## 4. Architecture

| Fichier | Rôle |
|---|---|
| `templates/collection.saga.json` | Assigné aux 4 sagas dans l'admin. Réversible en trois clics. |
| `sections/rdc_saga-hero.liquid` | Carrousel + texte en surimpression |
| `sections/rdc_saga-motifs.liquid` | Regroupement par motif + bandes |

Deux sections plutôt qu'une : chacune se place, se déplace et se retire indépendamment dans l'éditeur, et chacune reste assez petite pour être relue d'un bloc. Le hero se réutilisera tel quel pour les rayons thématiques.

## 5. Regroupement et tri

Un seul passage sur `collection.products` :

1. Clé de regroupement = le métaobjet illustration du produit.
2. Tri des motifs par `date` du métaobjet, décroissante.
3. Rendu d'une bande par motif.

Liquid n'a pas de dictionnaires : on passe par des listes de chaînes concaténées puis découpées — le motif qu'utilise déjà `rdc_illustrations_meta.liquid` pour son tri. Pas de troisième dialecte dans la maison.

**Plafond connu** : sans pagination, Liquid expose 50 produits. Les sagas font 12 à 20. Au-delà de 50, la section affiche un avertissement dans l'éditeur — jamais de troncature muette.

## 6. Dégradation quand une donnée manque

| Donnée absente | Comportement |
|---|---|
| Produit non relié à une illustration | Regroupement sur le nom avant la barre du titre (`Avalon \| T-shirt unisexe`) — convention respectée sur les 64 produits des 4 sagas |
| `date` du métaobjet vide | Repli sur la date de publication du produit le plus récent du motif |
| `resume` vide | La ligne disparaît, pas de trou ni de texte bouche-trou |
| `image_pour_fond_clair` absente | Repli sur `image_pour_fond_sombre` |
| Description de collection vide | Le bloc de texte disparaît, le carrousel reste |
| `hero_images` vide | `collection.image` seule ; si elle manque aussi, la section ne s'affiche pas |
| Plus de 50 produits | Avertissement visible dans l'éditeur |

## 7. Style

Repris de la page d'accueil, pas réinventé.

- **Polices** : Bebas Neue en titrage, Cabin en corps. Les prix sont en Bebas.
- **Surtitre** : Cabin 700, `.74rem`, interlettrage `.26em`, capitales, or `#b4894f`.
- **Titre de motif** : Bebas, capitales, `clamp(2rem, 4.4vw, 3.4rem)`, `line-height:.92`.
- **Palette** : parchemin `#f4eee1` et `#f2e6d2` en alternance · brun `#403434` · or `#b4894f` · or clair `#f4d694` · rouge prix `#962B21`.
- **CSS portée par `#uid`**, comme toutes les sections `rdc_*`.

### Hero — grammaire de `rdc_hero.liquid`, à l'identique

Voile dégradé `linear-gradient(180deg, rgba(0,0,0,.18) 0%, transparent 38%, rgba(0,0,0,.62) 100%)` · Ken Burns 18 s · titre `clamp(2.2rem, 5.2vw, 4.6rem)` en `line-height:.94` · sous-titre bridé à 48ch · CTA doré `#f4d694` sur texte `#623c3c`, rayon 12px, `14px 30px` · points de navigation à 9px qui s'étirent à 26px une fois actifs.

**Hauteur** : réglage `min_height` en vh, plage 40–100, défaut **84 vh** desktop et **80 vh** mobile — mêmes bornes et mêmes défauts que `rdc_hero`.

### Bande motif

Pas de rupture sombre : deux nuances de parchemin en alternance, aucun filet de séparation. Le numéro du motif (01 · 02 · 03) en Bebas géant, filet doré, opacité .20, posé **entièrement à l'intérieur** de la bande en haut à droite. Le sceau de l'illustration fait `clamp(74px, 7vw, 104px)`.

### Rail des coupes

Toutes les coupes sur une seule ligne, sans pastille « + N autres ». Cartes sans cadre : image, nom de coupe, prix, pastilles.

**Les packshots ont un vrai canal alpha** (33 à 63 % de pixels transparents), donc fond transparent et `object-fit:contain` — la coupe entière est visible, jamais rognée, avec une ombre portée douce.

> ⚠️ Le filtre `image_url` doit produire du **WebP ou du PNG**. En JPEG la transparence saute et le fond blanc revient.

## 8. Hors périmètre — à traiter ailleurs

- **Doublons en ligne** : `collection-celtique` porte exactement les 17 produits de `les-mysteres-celtes`, `collection-grecque` les 12 de `lombre-et-lairain`. Deux URLs indexées pour le même contenu, elles se cannibalisent. Décision à prendre : redirection 301 ou dépublication.
- **`collection-scandinave-copie`** s'affiche « Collection byzantine ».
- **Contenu à écrire** : les 4 descriptions de collection sont vides. Les `resume` de motif dépendent du chantier des onze lignes de Fragment manquantes.
- **Image manquante** : Varègue n'a pas de `image_pour_fond_clair`. Sur parchemin, la version sombre est illisible.

## 9. Critères de vérification

1. Les 4 sagas rendent le bon nombre de bandes : 3, 3, 3, 2.
2. L'ordre des motifs suit la date décroissante du métaobjet.
3. Chaque coupe affiche son prix réel et ses pastilles réelles.
4. Un produit volontairement délié de son illustration se range quand même dans la bonne bande.
5. Aucun fond blanc derrière un packshot.
6. Les autres collections rendent exactement comme avant.
