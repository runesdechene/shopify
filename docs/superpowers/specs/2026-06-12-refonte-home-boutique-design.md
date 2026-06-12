# Refonte de la page d'accueil — Boutique en ligne Runes de Chêne

> Spec de design (marketing + structure). Date : 2026-06-12.
> Statut : **direction validée**. Prochaine étape : maquette visuelle → plan d'implémentation.

---

## 1. Le Nord (mission)

> **Runes de Chêne crée un mouvement d'aventuriers locaux autour de l'Histoire et du patrimoine.**

Tout choix de la home se juge à cette aune : est-ce que ça fait *ressentir* et *rejoindre* ce mouvement, sans noyer le visiteur ?

## 2. Le problème qu'on résout

- La marque **cartonne en festival** (contact humain, récit oral, émotion) mais **cale en ligne**.
- Sur la home actuelle, les gens **se noient** : trop de produits (78 en vrac), trop de pages redondantes (boutique / collections / tous-les-produits), un hero abstrait sans image ni CTA, et le meilleur contenu est **désactivé** (les 4 atouts, le bouton mission) ou **enfermé dans un popup** (le slogan accrocheur).
- La home **n'explique pas la mission** ni l'atmosphère de la marque.

## 3. La leçon décisive (données réelles)

Une version **app-first** a déjà été testée : **les ventes se sont effondrées.** Quand l'app est le héros sur un domaine de boutique, le vêtement devient un goodies orphelin — plus de raison d'acheter *maintenant*.

**Conséquence, règle d'or :**

| Surface | Job | Met en avant |
|---|---|---|
| **Dehors** (Insta, bouche-à-oreille, festival) | Acquisition | **L'app** (gratuite, virale, PWA sans friction) |
| **La home boutique** (runesdechene.com) | Conversion | **La boutique** ; l'app en **second temps** (zone communauté) |

> **Le mouvement avant le produit dans les *mots* (hero). Le produit avant l'app dans l'*action* (CTA).**

Note produit : l'app est une **PWA** (pas sur les stores), installable en un clic. La friction d'install est faible — le problème n'est pas la conversion vers l'app mais la **notoriété**. La home n'a donc pas à « vendre » l'app de force ; elle la présente au bon moment.

## 4. La voix (copy éprouvé)

Slogan du Roll-Up qui cartonne en salon — on l'exploite, on ne le réécrit pas. Il est **découpé** sur la page (et il en est l'architecture) :

- **Accroche (hero)** : « Pendant que le monde scrolle, un mouvement s'éveille. Runes de Chêne appelle les âmes anciennes. »
- **Phrase-pont (vers l'app, beat 5)** : « Une marque. Une application. L'une vous fait **porter** l'Histoire. La seconde vous la fait **vivre**. »
  - « porter » = la boutique (beats 2-4) · « vivre » = l'app (beat 5).

### Hero — accroches retenues
- **Primaire** : « Pendant que le monde scrolle, un mouvement s'éveille. » + sous-titre d'ancrage : *« Runes de Chêne appelle les âmes anciennes — celles qui portent l'Histoire et explorent le patrimoine près de chez elles. »*
- **Secondaire (à garder en tête / A-B test)** : « Porte un Fragment d'Histoire. Deviens un aventurier de ton territoire. »
- ⚠️ Garde-fou : « âmes anciennes » est sublime mais mystique. Toujours **ancrer** avec une ligne concrète (vêtements / patrimoine / aventuriers locaux) pour ne pas perdre l'inconnu à froid.

### Triptyque de marque — « Apprenez. Incarnez. Explorez »
Deuxième structure à trois temps (équivalente au « porter → vivre » du slogan), qui sert de **colonne vertébrale visuelle** du scroll :

```
APPRENEZ  → la mission / l'Histoire     (manifeste)
INCARNEZ  → porter le Fragment          (la boutique, beats produits)
EXPLOREZ  → l'app, 2600 lieux           (la communauté, beat app)
```

### Bloc « marque » existant — à DÉCOUPER (ne pas coller tel quel)
Le bloc actuel (`section_YjqMVK`) mélange marque + app dans un seul paragraphe → réinjecte l'app trop tôt = risque boutique-orpheline. On le scinde :
- *« marque française qui se bat pour rendre au monde sa mémoire & son souffle »* → **manifeste (haut)**.
- *« Chacun de nos articles est un Fragment d'Histoire… échos du passé qui méritent d'être portés »* → **intro des produits vedette**.
- *« Notre application… plus grosse communauté francophone… »* → **beat app (n°6)**.
- Garde-fou anti-noyade : manifeste **court**, pas un mur de texte.

## 5. La structure de la home (7 beats)

| # | Beat | Contenu-clé | CTA |
|---|---|---|---|
| 1 | **Hero — la mission** | Image d'un Fragment porté en pleine nature/patrimoine + accroche slogan | **→ Découvrir les Fragments** *(boutique, PAS l'app)* |
| 2 | **Manifeste** (court) | *« marque française qui se bat pour rendre au monde sa mémoire & son souffle »* + triptyque **Apprenez. Incarnez. Explorez** + lien mission (rallumé). Pas un mur de texte. | → Notre mission |
| 3 | **Produits vedette** | Intro : *« Chacun de nos articles est un Fragment d'Histoire… qui méritent d'être portés. »* Puis 3-6 Fragments emblématiques, portés en extérieur (pas 78) | → Voir toute la collection |
| 4 | **Réassurance qualités** | Les 4 atouts : **fait main · sans IA · imprimé en Bretagne · coton bio** (à *rallumer*) | — |
| 5 | **Preuve sociale** ⭐ | 4,6/5 sur +5700 clients · amour du festival · communauté « ils nous portent » | — |
| 6 | **L'app — zone communauté** | Phrase-pont + *« Notre application rassemble la plus grosse communauté francophone… »* + montrer l'app (carte, 2600 lieux, « gratuit, un clic, rien à installer ») | **→ Rejoindre la communauté** |
| 7 | **Nos événements** | Les dates de festival — le pont réel festival ↔ boutique | → On se voit là-bas |
| 8 | **Rejoindre** | CTA final app **+ capture email** (seul filet pour les indécis) | → Rejoindre / email |

## 6. Ce qu'on coupe (pour arrêter de noyer)

- Le **popup auto** qui emprisonne le meilleur message → le message monte dans le hero.
- Le **catalogue de 78 produits** sur la home → 3-6 Fragments curatés.
- Le **carrefour app/boutique 50/50** → une porte principale (boutique), l'app en relais.
- Les **pages redondantes** (boutique / collections / tous-les-produits) → un seul chemin clair.
- On **rallume** : la section des 4 atouts (`disabled: true`) et le bouton vers `/notre-mission` (`disabled: true`).

## 7. Shot list (photos à shooter pour CETTE home)

1. **LA photo hero** : un aventurier (3/4 ou de dos) face à un paysage patrimoine/nature, portant un Fragment. Cadrage large, espace négatif pour le texte, lumière dorée.
2. **L'app en contexte** (beat 5) : main tenant le téléphone (carte ouverte) dans un décor réel nature/ruine. 2-3 variantes.
3. **Fragments portés dehors** (beat 2) : 3-6 modèles phares, sur de vrais gens, en extérieur (dos + face). Règle aussi la famine de photos produit.
4. **Communauté / festival** (beats 4 & 6) : ambiance stand, foule, émotion (réutiliser l'existant).

## 8. Points ouverts

- Préciser la formule du manifeste : « des t-shirts qu'on porte pour un **combat / une cause** » (à confirmer — transcription « carnet » à lever).
- Choix final hero primaire vs secondaire (candidat A/B test une fois en ligne).
- Liste exacte des 3-6 Fragments vedette du beat 2.

## 9. Hors périmètre (pour plus tard)

- Le plan 90 jours global (fondations analytics, capture email, abandon panier, acquisition organique Insta/app, parrainage). Cette spec ne couvre **que la home**.
- Le système de contenu Insta (app-led) — discuté, à spécifier séparément.
