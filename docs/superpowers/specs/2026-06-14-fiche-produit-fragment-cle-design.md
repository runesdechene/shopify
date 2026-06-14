# Refonte fiche produit — « Le Fragment comme clé »

> Spec de design. Thème Crépuscule (fork Heritage). Date : 2026-06-14. Auteur : XO + Uriel.
> Ambition retenue : **B — Le Fragment comme clé** (refonte narrative, risque maîtrisé). Pas de refonte DA complète (= option C, projet séparé).

## 1. Objectif

Faire exister sur la fiche produit l'argument de vente **aujourd'hui totalement absent** : acheter un Fragment l'**active dans l'application La Carte** et y débloque des éléments de jeu. Le vêtement devient une **clé vers le jeu**, pas un simple achat textile.

En parallèle, réparer la fiche actuelle : des arguments de réassurance sont **éteints** (`disabled: true`), et l'ordre des sections n'est pas pensé en entonnoir.

## 2. Principe directeur

**Respecter au maximum l'existant.** On réutilise toutes les sections déjà présentes, on rallume ce qui dort, on réordonne, et on n'ajoute **qu'un seul bloc neuf** (l'app-unlock), construit sur les patterns déjà en place (section `rdc_` + données Supabase anon, comme le mur communautaire).

## 3. Décisions actées

- Ambition = **B** (narratif, pas refonte DA complète).
- Description du bloc produit = **description web** (`base.description`), la `description_borne` reste réservée à la borne du stand.
- Ordre des sections = **validé** (cf. §4).
- Donnée du bloc app-unlock = **pilotée par RPC Supabase** (le « v2 dynamique »), avec **fallback générique** pour ne jamais casser la fiche avant que la RPC existe. Uriel code la RPC côté app en parallèle.
- Déblocages mis en avant = **3 déblocages 100 % live** (Titre, énigmes, profil). Pas de Couronnes en item séparé (downstream des énigmes), pas d'emblème/Campement (abandonné).

## 4. Nouvel ordre des sections (entonnoir)

Désir → décision → réassurance → sens → preuve → rebond.

| # | Section | Fichier / type | Statut |
|---|---------|----------------|--------|
| 1 | **Bloc produit** | `product-information` | existant, **blocs rallumés** (cf. §5) |
| 2 | **Tailles + Notre mission** | `section_pjncCe` (popups) | existant, inchangé |
| 3 | **L'histoire derrière ce Fragment** | `lecture-fragment-v2` | existant, **remonté** |
| 4 | **Ce Fragment s'éveille dans La Carte** | 🆕 `rdc_fragment-app` | **nouveau** (cf. §6) |
| 5 | **Ils portent ce modèle** | `rdc_ils-nous-portent-produit` | existant, inchangé |
| 6 | **Aussi disponible en…** | `similar-products` | existant, **descendu** (était en sommet) |
| 7 | **Vous pourriez aussi aimer** | `product-recommendations` | existant, inchangé |
| — | Section vide | `section_RDbLf9` | **supprimée** (résidu) |

Changement clé : le « Aussi disponible en » **quitte le sommet de page** (où il poussait titre/prix/achat sous la ligne de flottaison et invitait à quitter la fiche) pour rejoindre la zone cross-sell. Le bloc produit devient la première section.

Le petit résumé d'illustration (`section_wkxLqe`, `h3` en demi-opacité) actuellement entre le sommet et le produit : il **fusionne** avec l'accroche du bloc produit (cf. §5) plutôt que de rester une section isolée au-dessus. À confirmer en implémentation (s'il fait doublon avec `force_de_vente`, on le retire).

## 5. Bloc produit — rallumages

Tous ces blocs **existent déjà** dans `templates/product.json`, simplement en `disabled: true`. Aucune création.

- **Accroche / force de vente** sous le titre (`force_de_vente`) → ON.
- **Les 4 icônes de confiance** (Entreprise française / Livraison sans plastique / Matière haute-de-gamme / Certifié Fair Wear & Peta) → ON.
- **Description web** (`base.description`) → ON. La `description_borne` (`text_XEkBy7`) qui s'affiche aujourd'hui est retirée du web.
- **Caractéristiques produit** (`product-features`) → à réévaluer à l'allumage (garder si pertinent, sinon laisser off — pas prioritaire).
- **Rareté propre** : l'avertissement « ⚠️ Couleurs en éditions limitées » sort du hack `custom-liquid` en `position:absolute; font-size:12px` (risque de chevauchement) pour devenir un **vrai libellé/badge** sous le variant picker, dans le flux.

## 6. Nouveau bloc — `rdc_fragment-app.liquid`

Section custom `rdc_`, même ADN visuel que `lecture-fragment-v2` (esthétique parchemin, fonds déjà disponibles type `fond_explore.webp`), polices du thème (`var(--font-*)`, **pas** de Google Font chargée en dur). Données via **RPC Supabase anon**, sur le modèle exact de `rdc_ils-nous-portent-produit` (réglages `supabase_url` + `supabase_anon_key`, appel RPC `get_community_photos_by_product`).

### Contenu (wording de référence)

> **TON FRAGMENT NE S'ARRÊTE PAS AU TISSU**
> ### Il s'éveille dans La Carte
> En le possédant, tu l'actives dans l'application — il rejoint ton héritage de Porteur.
>
> 🏷️ **Le Titre du Fragment** — un titre unique, lié à *[personnage]*, que tu portes en jeu
> 🧩 **Les énigmes de sa légende** — deux par jour sur son thème (et elles rapportent des Couronnes)
> 🗺️ **Sur ton profil de Porteur** — le Fragment rejoint ta collection
>
> *[capture app]* → **[ Découvrir dans l'application ]**
> _Connecte-toi avec ton email de commande._

### Données — les 3 déblocages live (vérité app, 2026-06-14)

1. **Titre lié au personnage** du Fragment (déjà débloqué dans l'app aujourd'hui).
2. **Énigmes bi-journalières** sur le thème du Fragment (et ce sont elles qui rapportent des Couronnes — monnaie in-game, non convertible boutique).
3. **Affichage du Fragment sur le profil** du joueur acheteur.

### Modèle de données

- **Fallback générique (livrable sans dépendance app)** : bloc identique partout, `[personnage]` tiré du champ déjà disponible `product.metafields.custom.illustration_produit.value.nom`.
- **Dynamique (cible)** : RPC Supabase anon renvoyant les déblocages exacts par produit.
  - Contrat **proposé** (à confirmer avec l'app) : `get_fragment_unlocks_by_product(p_product_id)` → `{ titre: text, theme_enigmes: text, ... }`.
  - Si la RPC ne répond pas / renvoie vide → fallback générique. La fiche ne casse jamais.
- Le bloc rend **toujours quelque chose** : pas d'écran vide, pas d'erreur visible client.

### CTA

Lien « Découvrir dans l'application » → URL de l'app (réglage de section, type `text` si URL externe `https://` — `type: url` n'accepte pas de `default` externe, piège thème connu). Mention « connecte-toi avec ton email de commande ».

## 7. Dépendances & points durs

- **RPC Supabase à exposer côté app** (`get_fragment_unlocks_by_product`) — codée par Uriel en parallèle. Tant qu'elle n'existe pas, le bloc tourne en fallback générique.
- **Piège `--theme-editor-sync`** : `product.json` est piloté par l'éditeur en ligne. Donc :
  - Le **réordre des sections + les rallumages de blocs** se font **dans l'éditeur Shopify en ligne** (éditer le JSON en local serait écrasé).
  - Le **nouveau bloc** `rdc_fragment-app.liquid` est créé **en local + `shopify theme push`**, puis **placé depuis l'éditeur**. Redémarrer un éventuel `shopify theme dev` après création du fichier (le serveur scanne `sections/` au démarrage).
- **`name` de section ≤ 25 caractères** (sinon section rejetée, invisible dans l'éditeur). Le nom long va dans un réglage `title`, pas dans le `name` du schema.

## 8. Hors scope

- Refonte DA complète (option C) : restyle galerie / colonne d'achat / typo / mobile. Projet séparé.
- Réintroduction du Campement / emblème posable : mécanique abandonnée côté app.
- Refonte des emails post-achat (déjà existants, cohérents avec le message).

## 9. Critères de succès

- Le bloc produit affiche accroche + 4 icônes confiance + description web, rareté propre dans le flux.
- La fiche suit le nouvel ordre ; « Aussi disponible en » n'est plus en sommet ; section vide supprimée.
- Un bloc app-unlock existe, rend toujours quelque chose (fallback ou dynamique), pointe vers l'app, et n'utilise que les polices/fonds du thème.
- Le wording des déblocages correspond aux 3 déblocages live (Titre, énigmes, profil) — aucune promesse fausse (pas de Couronnes en perk direct, pas d'emblème).
