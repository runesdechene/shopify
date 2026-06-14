# Déploiement — thème Shopify Crépuscule

> Comment mettre des changements en ligne sur **runesdechene.com**, sans recréer un thème à chaque fois.
> Store : `runes-de-chene.myshopify.com`

## Trouver les thèmes

```bash
shopify theme list
```

Trois rôles (les **IDs changent** dans le temps — toujours vérifier avec `theme list`) :

| Rôle | Repère | À l'instant (2026-06-14) |
|------|--------|--------------------------|
| **Live** (prod, ce que voient les clients) | `[live]` | `Crépuscule LIVE 2026-06-14` · `#181425930507` |
| **Backup / rollback** (ancien live, dépublié) | `[unpublished]` | `Crepuscule FONDATION` · `#181424521483` |
| **Dev / atelier** (aperçu, `shopify theme dev`) | `[development] [yours]` | `Development (537f9f-FONDATION)` · `#181416755467` |

---

## Cas 1 — Micro-fix de **code** (Liquid / CSS / JS) → le plus courant

On pousse **uniquement le(s) fichier(s) changé(s)** directement sur le live. `git` reste le backup.

```bash
# 1. éditer le fichier en local, commit
git add sections/mon-fichier.liquid && git commit -m "fix: ..."

# 2. pousser SEULEMENT ce fichier sur le live (--only = rien d'autre n'est touché)
shopify theme push --theme=<LIVE_ID> --only sections/mon-fichier.liquid
```

- Instantané, **pas de nouveau thème**.
- Plusieurs fichiers : répéter `--only`, ou `--only sections/a.liquid --only assets/b.css`.
- Ça foire ? `git checkout <fichier>` la version d'avant + re-push.

## Cas 2 — Changement de **contenu / mise en page** (sections, réglages, textes)

Les fichiers JSON (`templates/*.json`, `settings_data.json`) sont **pilotés par l'éditeur**. On les modifie **dans l'éditeur du thème live** :

> Online Store → Thèmes → (thème live) → **Personnaliser**

C'est live immédiatement (c'est le fonctionnement normal de l'édition de contenu Shopify). Pour récupérer/sauvegarder en git ensuite :

```bash
shopify theme pull --theme=<LIVE_ID> --only templates/product.json
git add templates/product.json && git commit -m "chore: sauvegarde config éditeur"
```

## Cas 3 — Tu veux **prévisualiser avant** que ce soit live

Travaille dans le thème **Development** (`shopify theme dev` + `--theme-editor-sync`), valide sur l'aperçu, **puis** :
- petit lot de code → `theme push --only` vers le live (Cas 1) ;
- gros lot / refonte → Cas 4.

Garde **UN seul** thème de staging — pas besoin d'en recréer un par changement.

## Cas 4 — **Grosse refonte** (filet de sécurité maximal)

C'est ce qu'on a fait le 2026-06-14. À réserver aux gros chantiers.

```bash
# 1. capturer l'état complet du thème dev en local
shopify theme pull --theme=<DEV_ID>

# 2. pousser dans un NOUVEAU thème non-publié
shopify theme push --unpublished --theme "Crépuscule LIVE $(date +%F)"

# 3. publier ce nouveau thème (récupérer son ID via theme list)
shopify theme publish --theme=<NOUVEAU_ID> --force
```

L'ancien live reste **dépublié = rollback**.

## 🔁 Rollback (revenir à l'ancien live)

```bash
shopify theme publish --theme=<BACKUP_ID> --force
# ou : Online Store → Thèmes → (ancien thème) → Publier
```

---

## ⚠️ Pièges

- **Un thème `[development]` ne peut PAS être publié** (ce sont des aperçus éphémères). Pour mettre du dev en ligne → Cas 4 (nouveau thème) ou `theme push` vers un thème normal.
- **`--theme-editor-sync` actif** → les JSON (templates, settings_data) sont écrasés par l'éditeur. On modifie le contenu **dans l'éditeur**, pas le JSON en local (cf. CLAUDE.md).
- **`git push` ≠ `shopify theme push`** : git ne met rien en ligne sur le store. Toujours un `theme push` (ou publier) pour que les clients voient le changement.
- **`git` = source de vérité du code** ; le store = la cible de déploiement. Commit avant de pousser.
