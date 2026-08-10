# Page de collection « motif » — conception

> Statut : validée en maquette le 2026-08-10 (direction A, compagnon visuel).
> Prérequis : la page de saga (`2026-08-10-collection-saga-design.md`), dont
> cette page réutilise le snippet de carte.

## 1. La décision : une page dédiée, pas une ancre

Un clic sur un motif depuis la page d'accueil mène à une **vraie page**, sur la collection du motif qui existe déjà (`/collections/avalon`), et non à une ancre sur la page de saga.

Trois raisons, cumulatives :

- **Une ancre n'est pas une destination.** Elle dépose le visiteur au milieu d'une page où le motif n'est qu'une bande sur trois. On perd la concentration qu'on cherchait.
- **Une ancre n'existe pas pour Google.** `/collections/les-mysteres-celtes#avalon` ne sera jamais indexé comme « Avalon ». Pour une marque dont l'argument est le dessin, se priver d'une page par dessin revient à se priver de l'essentiel du référencement.
- **C'est la page qu'il faut de toute façon pour le stand.** Le QR sous chaque Fragment doit ouvrir une page publique, sans compte. Une ancre ne peut pas le faire ; cette page, oui. Sans elle, la même chose serait construite deux fois.

**Les collections existent déjà et sont correctement remplies** — avalon 7, skjaldmo 7, valkyrie 7, morrigan 6, varegue 6, hoplite 6, hecate 6, druide 4. Il n'y a donc qu'un modèle à leur poser.

## 2. Le visiteur, et ce qu'il change

On arrive ici **depuis la page d'accueil, en cliquant sur un motif**. Ce visiteur n'apprend pas une légende : il a flashé sur un dessin et veut savoir sur quoi il peut l'avoir.

D'où l'ordre : **le dessin, une phrase, les coupes.** Le récit vient après.

Cet ordre sert aussi le visiteur du QR au stand, qui descendra lire — même page, même URL, sans compte. Aucun compromis entre les deux : ce qui presse l'un est en haut, ce qui intéresse l'autre est en bas.

## 3. Mobile-first, et ce que ça impose

Le trafic vient d'Instagram et des festivals : des pouces sur des téléphones. Deux règles dures en découlent :

- **L'illustration ne dépasse jamais ~40 % de la hauteur d'écran.** Elle est en filigrane derrière le contenu, pas en bloc au-dessus : elle ne coûte donc aucun défilement.
- **Les coupes défilent horizontalement**, au doigt, sur une seule ligne. On en voit deux et demie d'entrée — assez pour comprendre qu'il y en a d'autres, sans rien pousser vers le bas.

## 4. La mise en page retenue (direction A)

Fond parchemin, dans la charte du site. Pas de version sombre : le site n'en a aucune, en créer une pour ces seules pages ferait exception.

1. **L'illustration en filigrane**, débordant à droite, opacité ~13 %, en fusion `multiply` sur le parchemin. Le dessin n'est plus un objet posé sur la page : il est la page.
2. **Le nom du motif** en Bebas, très grand (`clamp(3rem, 8vw, 6rem)`, `line-height:.84`).
3. **Une phrase** — le champ `resume`.
4. **Le rail des coupes** — image détourée, nom, prix, nuanciers. Réutilise `snippets/rdc_saga-cut-card.liquid` tel quel.
5. **Le récit**, tout en bas, **masqué tant qu'il est vide**.

## 5. Données — inventaire réel au 2026-08-10

Relevé sur `/pages/borne`, qui publie déjà tout le métaobjet en JSON. **22 motifs publiés.**

| Champ | État | Usage sur la page |
|---|---|---|
| `nom` | 22/22 | Le titre |
| `resume` | 22/22 | La phrase sous le titre |
| `description_borne` | 22/22 | Le bloc de récit |
| `artiste` | 22/22 | Mention discrète |
| `image_pour_fond_clair` | présent | Le filigrane |
| `image_fond_de_fragment` | **1/22** (Varègue) | Bonus si présent, sinon le filigrane |
| `collection` | 21/22 | Pointe vers la collection du motif **lui-même**, pas vers la saga |

### Ce que ces textes sont vraiment

À ne pas confondre, la nuance a coûté une erreur d'analyse :

- **`resume` est une étiquette factuelle**, pas une ligne épique : « Fragment scandinave du IXe siècle ». C'est ce qui s'affiche aujourd'hui sous les motifs sur les pages de saga. La tâche « rendre les résumés épiques plutôt que factuels » est ouverte par ailleurs — quand elle sera faite, cette page en bénéficiera sans modification.
- **`description_borne` est une phrase de vente**, pas un récit : « Portez un authentique Fragment de l'île mythique, Avalon, terre de repos des rois… ». Suffisante pour lancer, mais le vrai récit reste à écrire.

### ⚠ Apostrophes doublement encodées

Les valeurs contiennent `l&amp;#39;` au lieu d'une apostrophe. Rendues telles quelles, elles afficheront `l&#39;` en clair. Le rendu doit décoder avant d'afficher. Le défaut est dans la donnée, pas dans le code — il vaut une correction à la saisie.

## 6. Hors périmètre v1 — décidé

- **Aucun fil d'ariane ni bloc de retour vers la saga.** Le champ `collection` du métaobjet pointe vers le motif lui-même : le lien vers la saga demanderait soit un métachamp sur ~20 collections, soit une déduction coûteuse. On lance sans, on ajoutera si le manque se fait sentir.
- Pas de navigation entre motifs.
- Pas de récit long : le bloc se masque tant que le champ est vide.

## 7. Dégradation

| Donnée absente | Comportement |
|---|---|
| Illustration | Pas de filigrane, le fond reste parchemin uni |
| `resume` vide | La phrase disparaît, pas de trou |
| `description_borne` vide | Le bloc de récit ne s'affiche pas |
| Collection sans produit | La section ne s'affiche pas |
| Produit sans image | La carte garde son nom, son prix et ses pastilles |

## 8. Critères de vérification

1. `/collections/avalon` avec le modèle motif rend 7 cartes, prix et nuanciers réels.
2. Le filigrane est présent et ne pousse aucun contenu vers le bas.
3. Sur une fenêtre de 375 px, les coupes sont visibles sans défilement vertical au-delà d'un demi-écran.
4. Aucune entité HTML visible en clair dans les textes.
5. Les autres collections, et les pages de saga, rendent exactement comme avant.
