# Fiche produit « Le Fragment comme clé » — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refondre la fiche produit du thème Crépuscule en entonnoir, rallumer les blocs de réassurance éteints, et ajouter un bloc « app-unlock » qui fait exister l'argument « acheter un Fragment l'active dans l'application ».

**Architecture :** Deux pistes. (1) **Code** — un seul nouveau fichier de section `sections/rdc_fragment-app.liquid`, calqué sur `rdc_ils-nous-portent-produit` (même pattern Supabase RPC anon + fallback). (2) **Éditeur en ligne** — réordre des sections, (dé)activation de blocs existants, swap de description, badge rareté, suppression du résidu. Le `templates/product.json` est piloté par l'éditeur (`--theme-editor-sync`) : on le manipule **dans l'éditeur Shopify**, pas en local.

**Tech Stack :** Shopify Liquid, JSON templates, Supabase REST (RPC anon), `shopify` CLI (`theme check`, `theme dev`, `theme push`).

**Garde-fou (Uriel, 2026-06-14) :** améliorer/créer OK, **perdre l'existant interdit**. Aucun composant façonné (badges, pastilles, icônes confiance, parchemin `lecture-fragment`, popups, paliers panier) ne doit disparaître ni régresser. Réordre par glisser-déposer, jamais en recréant les blocs.

**Vérification :** pas de tests unitaires sur du Liquid. La « vérif » de chaque tâche = `shopify theme check` (lint) + **contrôle visuel sur l'aperçu `shopify theme dev`**. On commit après chaque tâche code ; les tâches éditeur sont validées visuellement puis on `shopify theme pull` pour versionner le JSON.

**Spec source :** `docs/superpowers/specs/2026-06-14-fiche-produit-fragment-cle-design.md`

---

## Référence — IDs de blocs dans `templates/product.json`

| Élément | ID bloc | État actuel | Action |
|---|---|---|---|
| Accroche / force de vente | `text_rF3pQm` | `disabled` | activer |
| 4 icônes de confiance | `group_JK8NUb` | `disabled` | activer |
| Caractéristiques produit | `product_features_MTyx7p` | `disabled` | (option) activer |
| Description **borne** | `text_XEkBy7` | actif | désactiver (web) |
| Description **web** | `text_Kj7gTA` | `disabled` | activer |
| Badge rareté (hack absolu) | `custom_liquid_Fh9YNn` | actif | améliorer en place |
| Section résumé illustration | `section_wkxLqe` | actif | fusionner/retirer |
| Section vide (résidu) | `section_RDbLf9` | actif | supprimer |

**Ordre actuel :** `similar_products_LCyQ6g`, `section_wkxLqe`, `product-information`, `rdc_inp_ilnp`, `section_pjncCe`, `lecture_fragment_v2_EaANnh`, `product_recommendations_8RVdzU`, `section_RDbLf9`

**Ordre cible :** `product-information`, `section_pjncCe`, `lecture_fragment_v2_EaANnh`, **`rdc_fragment-app` (nouveau)**, `rdc_inp_ilnp`, `similar_products_LCyQ6g`, `product_recommendations_8RVdzU` — (`section_wkxLqe` fusionné, `section_RDbLf9` supprimé)

---

## Task 1 : Filet de sécurité

**Files:**
- Modify: `.gitignore`
- Snapshot: `templates/product.json`

- [ ] **Step 1 : Ignorer les maquettes du compagnon visuel**

Ajouter à `.gitignore` (si absent) :

```
.superpowers/
```

- [ ] **Step 2 : Synchroniser le template live et figer un point de restauration**

Run :
```bash
shopify theme pull --only templates/product.json
git add templates/product.json .gitignore
git commit -m "chore(fiche-produit): snapshot product.json avant refonte"
```
Expected : commit créé. C'est le point de retour si un bloc saute.

---

## Task 2 : Créer la section `rdc_fragment-app.liquid` (fallback + RPC Supabase)

**Files:**
- Create: `sections/rdc_fragment-app.liquid`

Calqué sur `sections/rdc_ils-nous-portent-produit.liquid` (pattern Supabase). Le bloc s'affiche **toujours** (contrairement au mur communautaire qui se cache) : par défaut en fallback générique, enrichi par la RPC si elle répond. `name` du schema = 20 caractères (< 25, sinon section rejetée). CTA en classe `.button` pour réutiliser le vrai bouton du thème. Polices `var(--font-*)`, parchemin `#f5f1e8` / bordure `#ac9c89` / radius 20 comme `lecture-fragment`.

- [ ] **Step 1 : Écrire le fichier de section**

Créer `sections/rdc_fragment-app.liquid` avec exactement :

```liquid
{% comment %}
  RDC — Fragment & App (fiche produit).
  Bloc app-unlock : le Fragment acheté s'active dans l'application La Carte.
  Déblocages live : Titre lié au personnage + énigmes bi-journalières + affichage profil.
  Données dynamiques via RPC Supabase anon get_fragment_unlocks_by_product (fallback générique si absente).
  Calqué sur rdc_ils-nous-portent-produit.
{% endcomment %}

{%- liquid
  assign s = section.settings
  assign perso = product.metafields.custom.illustration_produit.value.nom
-%}

<style>
  .rdc-fa-{{ section.id }} { max-width: var(--page-content-width, 120rem); margin-inline: auto; padding: 1.5rem 0 3rem; }
  .rdc-fa-{{ section.id }} .rdc-fa__card {
    background-color: #f5f1e8;
    {% if s.background_image %}background-image: url('{{ s.background_image | image_url: width: 1600 }}'); background-size: cover; background-position: center;{% endif %}
    border: 2px solid #ac9c89; border-radius: 20px; padding: 48px 56px; position: relative;
  }
  @media (max-width: 749px) { .rdc-fa-{{ section.id }} .rdc-fa__card { padding: 32px 22px; } }
  .rdc-fa-{{ section.id }} .rdc-fa__layout { display: flex; gap: 2rem; align-items: center; }
  @media (max-width: 749px) { .rdc-fa-{{ section.id }} .rdc-fa__layout { flex-direction: column-reverse; } }
  .rdc-fa-{{ section.id }} .rdc-fa__col { flex: 1; }
  .rdc-fa-{{ section.id }} .rdc-fa__media { flex: 0 0 38%; }
  .rdc-fa-{{ section.id }} .rdc-fa__media img { width: 100%; border-radius: 12px; display: block; }
  .rdc-fa-{{ section.id }} .rdc-fa__pretitle { font-family: var(--font-accent--family); text-transform: uppercase; letter-spacing: .14em; font-size: .8rem; font-weight: 700; color: var(--color-primary, #833434); margin: 0 0 .4rem; }
  .rdc-fa-{{ section.id }} .rdc-fa__title { font-family: var(--font-heading--family); font-size: clamp(2rem, 4vw, 2.8rem); line-height: 1; color: var(--color-foreground-heading, #403434); margin: 0 0 .6rem; }
  .rdc-fa-{{ section.id }} .rdc-fa__intro { font-family: var(--font-paragraph--family); color: var(--color-foreground, #594848); margin: 0 0 1.4rem; max-width: 46ch; }
  .rdc-fa-{{ section.id }} .rdc-fa__unlock { display: flex; gap: 14px; padding: 12px 0; border-bottom: 1px solid #e6d8bd; }
  .rdc-fa-{{ section.id }} .rdc-fa__unlock:last-of-type { border-bottom: none; }
  .rdc-fa-{{ section.id }} .rdc-fa__ic { font-size: 1.5rem; line-height: 1; }
  .rdc-fa-{{ section.id }} .rdc-fa__ut { font-family: var(--font-accent--family); font-weight: 700; color: var(--color-foreground-heading, #403434); display: block; }
  .rdc-fa-{{ section.id }} .rdc-fa__ud { font-family: var(--font-paragraph--family); color: var(--color-foreground, #594848); font-size: .92rem; }
  .rdc-fa-{{ section.id }} .rdc-fa__cta { margin-top: 1.2rem; }
  .rdc-fa-{{ section.id }} .rdc-fa__note { font-size: .85rem; opacity: .8; margin-top: .5rem; }
</style>

<div class="rdc-fa-{{ section.id }}" id="rdc-fa-{{ section.id }}" {{ section.shopify_attributes }}>
  <div class="rdc-fa__card">
    <div class="rdc-fa__layout">
      <div class="rdc-fa__col">
        {% if s.pretitle != blank %}<p class="rdc-fa__pretitle">{{ s.pretitle }}</p>{% endif %}
        <h2 class="rdc-fa__title">{{ s.title }}</h2>
        {% if s.intro != blank %}<p class="rdc-fa__intro">{{ s.intro }}</p>{% endif %}

        <div class="rdc-fa__unlock">
          <span class="rdc-fa__ic">🏷️</span>
          <span><span class="rdc-fa__ut">{{ s.unlock1_title }}</span>
          <span class="rdc-fa__ud" id="rdc-fa-titre-{{ section.id }}">{% if perso != blank %}un titre unique, lié à {{ perso }}, que tu portes en jeu{% else %}{{ s.unlock1_desc }}{% endif %}</span></span>
        </div>
        <div class="rdc-fa__unlock">
          <span class="rdc-fa__ic">🧩</span>
          <span><span class="rdc-fa__ut">{{ s.unlock2_title }}</span>
          <span class="rdc-fa__ud">{{ s.unlock2_desc }}</span></span>
        </div>
        <div class="rdc-fa__unlock">
          <span class="rdc-fa__ic">🗺️</span>
          <span><span class="rdc-fa__ut">{{ s.unlock3_title }}</span>
          <span class="rdc-fa__ud">{{ s.unlock3_desc }}</span></span>
        </div>

        {% if s.cta_url != blank %}<a class="rdc-fa__cta button" href="{{ s.cta_url }}">{{ s.cta_label }}</a>{% endif %}
        {% if s.note != blank %}<p class="rdc-fa__note">{{ s.note }}</p>{% endif %}
      </div>
      {% if s.app_image %}<div class="rdc-fa__media">{{ s.app_image | image_url: width: 800 | image_tag: loading: 'lazy', alt: s.title }}</div>{% endif %}
    </div>
  </div>
</div>

<script>
  (function () {
    var SUPABASE_URL = {{ section.settings.supabase_url | json }};
    var SUPABASE_KEY = {{ section.settings.supabase_anon_key | json }};
    var HANDLE = {{ product.handle | json }};
    var SID = {{ section.id | json }};
    if (!SUPABASE_URL || !SUPABASE_KEY || !HANDLE) return; // le fallback générique reste affiché
    fetch(SUPABASE_URL + '/rest/v1/rpc/get_fragment_unlocks_by_product', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY },
      body: JSON.stringify({ p_handle: HANDLE })
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var row = Array.isArray(data) ? data[0] : data;
        if (!row || !row.titre) return;
        var el = document.getElementById('rdc-fa-titre-' + SID);
        if (el) el.textContent = 'le titre « ' + row.titre + ' », que tu portes en jeu';
      })
      .catch(function (e) { console.error('RDC fragment-app:', e); }); // le fallback reste affiché
  })();
</script>

{% schema %}
{
  "name": "RDC — Fragment & App",
  "tag": "section",
  "class": "section-rdc-fragment-app",
  "settings": [
    { "type": "text", "id": "pretitle", "label": "Pré-titre", "default": "Ton Fragment ne s'arrête pas au tissu" },
    { "type": "text", "id": "title", "label": "Titre", "default": "Il s'éveille dans La Carte" },
    { "type": "textarea", "id": "intro", "label": "Intro", "default": "En le possédant, tu l'actives dans l'application — il rejoint ton héritage de Porteur." },
    { "type": "text", "id": "unlock1_title", "label": "Déblocage 1 — titre", "default": "Le Titre du Fragment" },
    { "type": "text", "id": "unlock1_desc", "label": "Déblocage 1 — fallback", "default": "un titre unique, lié à ton personnage, que tu portes en jeu" },
    { "type": "text", "id": "unlock2_title", "label": "Déblocage 2 — titre", "default": "Les énigmes de sa légende" },
    { "type": "text", "id": "unlock2_desc", "label": "Déblocage 2 — texte", "default": "deux par jour sur son thème — elles rapportent des Couronnes" },
    { "type": "text", "id": "unlock3_title", "label": "Déblocage 3 — titre", "default": "Sur ton profil de Porteur" },
    { "type": "text", "id": "unlock3_desc", "label": "Déblocage 3 — texte", "default": "le Fragment rejoint ta collection" },
    { "type": "text", "id": "cta_label", "label": "Bouton — texte", "default": "Découvrir dans l'application" },
    { "type": "text", "id": "cta_url", "label": "Bouton — URL (externe : type texte, pas url)", "info": "https://… accepté ici (type url refuse un default externe)" },
    { "type": "text", "id": "note", "label": "Note sous le bouton", "default": "Connecte-toi avec ton email de commande." },
    { "type": "image_picker", "id": "app_image", "label": "Capture app (profil + titre)" },
    { "type": "image_picker", "id": "background_image", "label": "Fond parchemin (optionnel)" },
    { "type": "text", "id": "supabase_url", "label": "URL Supabase", "info": "Ex: https://xxxxx.supabase.co" },
    { "type": "text", "id": "supabase_anon_key", "label": "Clé Supabase (anon)" }
  ],
  "presets": [ { "name": "RDC — Fragment & App" } ]
}
{% endschema %}
```

- [ ] **Step 2 : Lint**

Run : `shopify theme check sections/rdc_fragment-app.liquid`
Expected : aucune erreur bloquante (warnings de style tolérés).

- [ ] **Step 3 : Pousser et afficher en aperçu**

Run : `shopify theme push --theme=<ID_DEV>` (ou redémarrer `shopify theme dev` — il scanne `sections/` au démarrage, donc un nouveau fichier de section exige un redémarrage).
Puis dans l'éditeur du thème dev, sur une fiche produit : **Ajouter une section → « RDC — Fragment & App »**, renseigner `supabase_url` + `supabase_anon_key` (mêmes valeurs que la section « Ils nous portent », cf. `templates/product.json`).
Expected : le bloc s'affiche en parchemin, 3 déblocages, le déblocage 1 montre « lié à [nom du personnage] » via le metafield. Sans RPC, le fallback reste — **aucune erreur JS ne casse la page**.

- [ ] **Step 4 : Commit**

```bash
git add sections/rdc_fragment-app.liquid
git commit -m "feat(fiche-produit): section app-unlock rdc_fragment-app (fallback + RPC Supabase)"
```

---

## Task 3 : Contrat RPC Supabase (app-side — Uriel, en parallèle)

**Files:**
- (App / Supabase, hors thème) — documenté ici pour cadrer le travail parallèle.

Le bloc consomme `POST {supabase_url}/rest/v1/rpc/get_fragment_unlocks_by_product` avec `{ "p_handle": "<product.handle>" }`, en clé `anon`. Tant que la RPC n'existe pas, le bloc tourne en fallback — **rien ne casse**.

- [ ] **Step 1 : Définir la fonction (squelette à adapter au schéma app)**

```sql
-- Renvoie le(s) déblocage(s) d'un Fragment à partir du handle produit Shopify.
-- SECURITY DEFINER + GRANT EXECUTE TO anon, comme get_community_photos_by_product.
create or replace function public.get_fragment_unlocks_by_product(p_handle text)
returns table (titre text, theme_enigmes text)
language sql stable security definer
as $$
  select f.titre, f.theme_enigmes
  from fragments f
  where f.shopify_handle = p_handle
  limit 1;
$$;

grant execute on function public.get_fragment_unlocks_by_product(text) to anon;
```

- [ ] **Step 2 : Vérifier l'accès anon**

Run (curl, clé anon) :
```bash
curl -s -X POST "$SUPABASE_URL/rest/v1/rpc/get_fragment_unlocks_by_product" \
  -H "apikey: $ANON" -H "Authorization: Bearer $ANON" -H "Content-Type: application/json" \
  -d '{"p_handle":"t-shirt-overzised-varegue"}'
```
Expected : `[{"titre":"…","theme_enigmes":"…"}]`. Dès lors, le bloc fiche affiche le **vrai titre** automatiquement (aucune modif thème).

---

## Task 4 : Éditeur en ligne — section par section (avec checkpoint visuel à chaque étape)

> Tout se fait dans l'**éditeur du thème dev** sur une fiche produit. Après chaque sous-étape : vérifier l'aperçu. **On ne recrée jamais un bloc** — on (dé)active / on glisse-dépose. À la fin : `shopify theme pull --only templates/product.json` + commit.

- [ ] **Step 4a : Rallumer l'accroche** — bloc `text_rF3pQm` (sous le titre) → activer. Vérif : l'accroche `force_de_vente` apparaît sous le titre.

- [ ] **Step 4b : Rallumer les 4 icônes de confiance** — groupe `group_JK8NUb` → activer. Vérif : Entreprise française / Sans plastique / Matière / Fair Wear & Peta s'affichent, intacts.

- [ ] **Step 4c : Description web** — activer `text_Kj7gTA` (description web), désactiver `text_XEkBy7` (description borne). Vérif : la fiche montre la description web ; la borne a disparu du web.

- [ ] **Step 4d : Badge rareté propre (amélioration en place)** — éditer le bloc `custom_liquid_Fh9YNn`, remplacer son contenu par (retire le `position:absolute`, le met dans le flux sous le variant picker) :

```html
<div style="display:inline-block; font-size:12px; padding:4px 10px; border:1px dashed #c79a52; border-radius:8px; background:#f7e7c8; color:#8a5a1e;">⚠️ Couleurs en éditions limitées — tirages à très petites séries</div>
```
Vérif : le badge est sous le variant picker, ne chevauche plus rien.

- [ ] **Step 4e : Placer le nouveau bloc + réordonner + nettoyer** — Ajouter la section « RDC — Fragment & App » et la glisser **juste après** « L'histoire derrière ce Fragment ». Réordonner par glisser-déposer vers l'ordre cible (cf. en-tête). Supprimer la section vide `section_RDbLf9`. Retirer/fusionner le résumé `section_wkxLqe` (si doublon avec l'accroche 4a). Vérif : l'ordre des 7 est respecté, « Aussi disponible en » n'est plus en sommet, aucune section vide.

- [ ] **Step 5 : Versionner le JSON final**

```bash
shopify theme pull --only templates/product.json
git add templates/product.json
git commit -m "feat(fiche-produit): nouvel ordre entonnoir + rallumages + bloc app-unlock placé"
```

---

## Self-review (couverture spec)

- §4 nouvel ordre → Task 4e ✅ · §5 rallumages → Task 4a/4b/4c ✅ · rareté propre → Task 4d ✅
- §6 bloc app-unlock (contenu, parchemin, fonts, fallback, RPC) → Task 2 ✅ · contrat RPC → Task 3 ✅
- §7 dépendances (backup, theme-editor-sync, name ≤ 25, url externe en `text`) → Task 1 + Task 2 schema + Task 4 ✅
- Garde-fou « ne rien perdre » → réordre par drag, (dé)activation, backup, aucune recréation de bloc ✅
- §8 hors scope (DA complète, Campement) → non inclus ✅

**Dépendance externe :** affichage du **vrai** titre = RPC Task 3 (app-side). Sans elle, fallback générique — la fiche reste complète et juste.
