# Runes de Chêne - Thème Shopify

Thème Shopify basé sur **Nimbus 1.6.0 + Rdc Edit** pour la boutique Runes de Chêne.

## 🚀 Développement local

### Prérequis

- [Shopify CLI](https://shopify.dev/docs/themes/tools/cli) installé
- Accès à la boutique Shopify `eef6c4-b5.myshopify.com`

### Démarrer le serveur de développement

```powershell
shopify theme dev --store=eef6c4-b5.myshopify.com
```

Cette commande va :

- Créer un thème de développement temporaire sur votre boutique
- Synchroniser automatiquement vos modifications locales
- Ouvrir un aperçu dans votre navigateur

### Pousser les modifications sur Shopify

Pour pousser vos modifications vers le thème en ligne :

```powershell
# Pousser vers le thème actif (ATTENTION : production)
shopify theme push --store=eef6c4-b5.myshopify.com

# Pousser vers un thème spécifique (recommandé pour tester)
shopify theme push --store=eef6c4-b5.myshopify.com --theme=THEME_ID
```

### Télécharger les dernières modifications depuis Shopify

Si des modifications ont été faites directement sur Shopify :

```powershell
shopify theme pull --store=eef6c4-b5.myshopify.com
```

## 📦 Structure du thème

```
.
├── assets/          # CSS, JS, images
├── config/          # Configuration du thème
├── layout/          # Layouts principaux
├── locales/         # Traductions
├── sections/        # Sections réutilisables
├── snippets/        # Composants réutilisables
└── templates/       # Templates de pages
```

## 🔄 Workflow Git

### Faire des modifications

```powershell
# 1. Créer une branche pour votre fonctionnalité
git checkout -b feature/nom-de-la-feature

# 2. Faire vos modifications et tester localement
shopify theme dev --store=eef6c4-b5.myshopify.com

# 3. Commiter vos changements
git add .
git commit -m "Description des modifications"

# 4. Pousser sur GitHub
git push origin feature/nom-de-la-feature

# 5. Merger dans main
git checkout main
git merge feature/nom-de-la-feature
git push origin main
```

## 🛠️ Commandes utiles

```powershell
# Lister tous les thèmes de la boutique
shopify theme list --store=eef6c4-b5.myshopify.com

# Vérifier les erreurs du thème
shopify theme check

# Partager un aperçu du thème
shopify theme share --store=eef6c4-b5.myshopify.com
```

## 📝 Notes

- Le dossier `.shopify/` est ignoré par Git (contient les configurations locales)
- Toujours tester en local avant de pousser sur Shopify
- Utiliser `shopify theme dev` pour le développement quotidien
- Faire des commits réguliers avec des messages descriptifs
