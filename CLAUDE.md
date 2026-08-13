# shopify — Boutique en ligne Runes de Chêne

> Thème **Crépuscule** (fork Heritage v3.2.1 **lourdement modifié**). Prod : runesdechene.com
> Responsables : Mathéo (quotidien, fiches) · Uriel (DA)

## Démarrage — Règle N°1

Lire `~/citadelle/CLAUDE.md` (symlink vers vault Obsidian partagé). Ce fichier contient :
- Protocole ingest (`_Inbox/`)
- Routing par intent
- 4-Layer Query Rule

Si `~/citadelle` inaccessible → vérifier qu'Obsidian est ouvert sur le vault. Fallback NAS : `\\EGIDE\Runes de Chêne\👑 LA CITADELLE\`.

## 4-Layer Query Rule (adaptée Shopify)

1. **Question Shopify / Liquid / App extensions** → **Context7 MCP** (docs officielles Shopify à jour)
2. **Structure / sections / blocks de ce thème** → Glob / Read direct (pas de Graphify sur Liquid, pas supporté)
3. **Décisions marque, ton, contenu** → **Obsidian MCP** (vault Citadelle)
4. **Édition** → Read du fichier brut

## Zone Citadelle pour ce repo

Pour contexte produit / vision / stratégie boutique en ligne :

- **`~/citadelle/📋 VUE - Boutique en ligne.md`** — rôle, mix CA, parcours client, intégrations
- **`~/citadelle/⛩️ La Marque/🌐 La boutique en ligne/INDEX - Boutique en ligne.md`** — notes opérationnelles
- **`~/citadelle/⛩️ La Marque/📦 Produits/INDEX - Produits.md`** — catalogue
- **`~/citadelle/Backlogs/Backlog - Boutique en ligne.md`** — chantiers futurs (emails auto, blog SEO, /rejoindre, refonte DA)

## Spécificités de CE repo

### Stack
- **Thème Shopify** Crépuscule (forké de Heritage v3.2.1)
- **Liquid** + JSON templates + SCSS
- Fichiers custom **préfixés `rdc_`** pour distinction claire vs thème Heritage original

### Règle d'or

**JAMAIS faire la mise à jour du thème Heritage.** On édite Crépuscule à la main. Une MAJ Heritage écraserait toutes nos modifications.

### Intégrations

- **Avis Hub → Shopify** : avis communautaires affichés sur fiches produit (push depuis Hub)
- **Mur "Ils nous portent"** : photos ambassadeurs approuvées (poussées depuis Hub)
- **Borne commande stand** : QR code → commande mobile sur cette boutique
- **CONQUÊTE** : lien flyer post-achat + bouton dans site

## Commandes rapides (Shopify CLI)

```bash
# Push vers le thème dev
shopify theme push

# Pull le thème dev
shopify theme pull

# Auto-sync en dev (watch + push auto)
shopify theme dev --theme-editor-sync

# Push/pull vers un thème spécifique (par ID)
shopify theme push --theme=123456789
shopify theme pull --theme=123456789
```

## Écosystème global

| Projet | Rôle |
|--------|------|
| **Ce repo** | Thème Shopify Crépuscule |
| **`app (Runes de Chêne)`** | Monorepo apps (explore-web + hub + supabase) |
| **Citadelle** (Obsidian) | QG mémoire partagée |

### Repos voisins — accès cross-repo (PAS de fusion)

Décision 2026-06-14 : le thème et le monorepo app restent **deux repos séparés** (pipelines de déploiement, Graphify et CI distincts — fusionner coûterait plus que ça ne rapporte). Mais ils sont **voisins sur le disque** sous `DEVs/`. Dès qu'un sujet touche les deux, **lire aussi le monorepo voisin** (`../app (Runes de Chêne)/`) :

- `docs/db/xo-discipline.md` — méthodo / discipline XO (la source de la méthodo)
- `docs/db/gotchas.md`, `docs/db/migrations-workflow.md` — schéma DB, noms de colonnes, workflow migrations (ne jamais deviner un nom de colonne)
- `supabase/migrations/` + `supabase/functions/` — **les RPC anon que CE thème consomme** : ex. `get_community_photos_by_product` (mur « Ils nous portent »), `get_fragment_unlocks_by_product` (bloc app-unlock fiche produit)
- `apps/hub/` — back-office qui **pousse** vers ce thème (avis, photos communautaires)
- `apps/explore-web/` — l'application La Carte
- `graphify-out/graph.json` — graphe indexé du monorepo (inventaire tables/RPC/FK)

> Graphify n'indexe pas le Liquid → CE repo n'est pas indexé. Pour toute question DB / RPC / hub / app, la **source de vérité est le monorepo voisin** ci-dessus, pas la mémoire.

## Conventions générales (rappel rapide)

- **Conventional Commits** (`feat:`, `fix:`, `chore:`, `docs:`)
- **Pas de console.log en prod** dans les scripts JS
- **Naming `rdc_*`** pour tout fichier custom pour pas confondre avec les fichiers d'origine Heritage

### ⚠️ Pièges Shopify à NE PAS refaire

- **⚠️ TOUJOURS `--path` sur `theme push` / `theme pull`.** Un `cd` dans le dossier **ne suffit pas** : sans `--path`, le CLI résout le projet ailleurs (l'autre thème Heritage de base, `~/CascadeProjects/RUNES DE CHENE (Shopify)`, qui ne contient **aucun** fichier `rdc_*`). Conséquence observée deux fois : le fichier visé par `--only` n'existe pas dans ce dossier fantôme → rien n'est envoyé, **et l'étape « Cleaning your remote theme » SUPPRIME le fichier en ligne**. Le CLI affiche quand même « pushed successfully ». Forme correcte :

  ```bash
  PROJ="/c/Users/uriel/Desktop/DEVs/shopify (Runes de Chêne)"
  shopify theme push --path "$PROJ" --theme=181425930507 \
    --only sections/mon-fichier.liquid --allow-live --nodelete
  ```

  - `--allow-live` : sans lui, le CLI demande une confirmation → échoue en non-interactif (« Failed to prompt »).
  - `--nodelete` : désactive l'étape de nettoyage, celle qui a déjà effacé un fichier en ligne.
  - **Vérifier après coup**, toujours : `theme pull --path <dossier temporaire> --only <fichier>` puis `diff`. « Theme upload complete » ne prouve rien.
- **Un nouveau réglage de schéma se pousse en DEUX temps : la section d'abord, le template ensuite.** Poussés dans la même passe, Shopify valide le JSON du template contre l'**ancien** schéma de la section — celui encore en ligne — et **supprime silencieusement** la clé qu'il ne connaît pas. Le CLI affiche « pushed successfully », le fichier de section est bien à jour, et le réglage a disparu du template. Constaté le 2026-08-13 avec `mobile_bleed` sur `collection.saga.json` : il a fallu repousser le template seul, une fois la section en ligne. Seul un `theme pull` + `diff` sur le template le révèle.
  - Corollaire : si le template **ne stocke pas** la clé, Shopify sert le `default` du schéma. Un réglage neuf dont le défaut convient n'a donc pas besoin d'être poussé côté template du tout.
- **Une page peut rester en cache plusieurs minutes.** Un `curl` sur le site peut renvoyer l'ancienne version du HTML alors que le fichier en ligne est déjà le bon. Comparer d'abord **le fichier** (`theme pull` + `diff`), le HTML rendu ensuite, avec un paramètre d'URL bidon pour casser le cache.
- **`name` de section (et de preset) ≤ 25 caractères.** Au-delà, Shopify **rejette** la section : elle n'apparaît **jamais** dans l'éditeur (« Ajouter une section »). Mettre le nom long dans le réglage `title`, pas dans le `name` du schema. (Ex. : schema `name: "RDC — Mouvement vivant"` mais `title: "Le mouvement est vivant"`.)
- **Nouveau fichier de section pendant un `shopify theme dev`** : le serveur scanne `sections/` au démarrage → **redémarrer le dev** pour qu'il registre un fichier de section nouvellement créé.
- **`git push` ≠ `shopify theme push`** : git ne pousse rien vers le store. Le rendu se voit via le `shopify theme dev` en cours (sync local) ou un push explicite.
- **`range` avec un seul intervalle = schema refusé.** `min:1, max:2, step:1` → `Invalid schema: setting with id="x" step n'est pas valide`, et la section n'existe pas en ligne. Il faut **au moins deux intervalles** (`min:1, max:3, step:1`). Pour les pas décimaux : `step` multiple de `0.1`, et le `default` doit tomber pile sur un pas.
- **`theme push` peut dire « pushed with errors » sans écrire le fichier.** Le détail est noyé sous la barre de progression → rediriger (`> push.log 2>&1`) puis grep. Et **vérifier** avec `theme pull --only <fichier>` : « Theme upload complete » ne garantit rien.
- **`type: "url"` n'accepte PAS de `default` en URL externe** (`https://…`) → schema invalide → section refusée → invisible. Pour une URL externe par défaut, utiliser `type: "text"`. (`theme check` hors-ligne ne l'attrape pas ; la validation serveur de Shopify, si.)
- **En `--theme-editor-sync`, les fichiers JSON (templates, settings_data) sont pilotés par l'éditeur** → éditer `index.json` en local est écrasé. On place/retire une section **depuis l'éditeur en ligne**, pas en touchant le JSON.
