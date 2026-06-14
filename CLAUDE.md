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

- **`name` de section (et de preset) ≤ 25 caractères.** Au-delà, Shopify **rejette** la section : elle n'apparaît **jamais** dans l'éditeur (« Ajouter une section »). Mettre le nom long dans le réglage `title`, pas dans le `name` du schema. (Ex. : schema `name: "RDC — Mouvement vivant"` mais `title: "Le mouvement est vivant"`.)
- **Nouveau fichier de section pendant un `shopify theme dev`** : le serveur scanne `sections/` au démarrage → **redémarrer le dev** pour qu'il registre un fichier de section nouvellement créé.
- **`git push` ≠ `shopify theme push`** : git ne pousse rien vers le store. Le rendu se voit via le `shopify theme dev` en cours (sync local) ou un push explicite.
- **`type: "url"` n'accepte PAS de `default` en URL externe** (`https://…`) → schema invalide → section refusée → invisible. Pour une URL externe par défaut, utiliser `type: "text"`. (`theme check` hors-ligne ne l'attrape pas ; la validation serveur de Shopify, si.)
- **En `--theme-editor-sync`, les fichiers JSON (templates, settings_data) sont pilotés par l'éditeur** → éditer `index.json` en local est écrasé. On place/retire une section **depuis l'éditeur en ligne**, pas en touchant le JSON.
