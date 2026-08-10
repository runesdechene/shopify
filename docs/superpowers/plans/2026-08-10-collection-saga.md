# Page de collection « saga » — plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Donner aux 4 sagas une page dédiée : un hero plein cadre avec texte en surimpression, puis une bande par motif — du plus récent au plus ancien — portant le sceau de l'illustration, son résumé, et le rail complet de ses coupes avec prix et nuanciers.

**Architecture:** Un template alterné `collection.saga.json` assigné aux 4 sagas, alimenté par deux sections neuves (`rdc_saga-hero`, `rdc_saga-motifs`) et un snippet de carte (`rdc_saga-cut-card`). Le regroupement par motif se fait en un passage sur `collection.products`, via le métaobjet illustration pointé par `custom.illustration_produit`, avec repli sur la convention de titre `Motif | Coupe`. Aucune autre collection n'est touchée.

**Tech Stack:** Shopify Liquid (thème Crépuscule, fork Heritage v3.2.1) · Shopify CLI 3.88.1 · `shopify theme check` pour le lint · `shopify theme dev` + curl pour la vérification de rendu.

## Global Constraints

- **Périmètre** : les 4 sagas seulement — `les-mysteres-celtes`, `lombre-et-lairain`, `garde-d-acier`, `le-pacte-sauvage`. Aucune modification de `main-collection.liquid`, `collection.json`, ni d'aucun template existant.
- **CSS portée par `#{{ uid }}`** où `uid` est dérivé de `section.id`, comme toutes les sections `rdc_*`. Jamais de sélecteur global.
- **Polices** : `var(--font-heading--family)` (Bebas Neue) en titrage, `var(--font-body--family)` (Cabin) en corps. Les prix sont en police de titrage.
- **Palette** : parchemin `#f4eee1` et `#f2e6d2` · brun `#403434` · brun secondaire `#5a4a42` · or `#b4894f` · or clair `#f4d694` · rouge prix `#962B21` · noir de fond hero `#1c1812`.
- **Surtitre** : corps, 700, `.74rem`, `letter-spacing:.26em`, capitales, or `#b4894f`.
- **`image_url` ne doit JAMAIS recevoir `format: 'jpg'`** — les packshots ont un canal alpha, le JPEG le détruit et ramène un fond blanc.
- **Aucun `shopify theme push` vers le thème live** dans ce plan. Vérification en local via `shopify theme dev` uniquement. La mise en ligne est une décision d'Uriel, hors plan.
- **Commit après chaque tâche.** `git` est la source de vérité du code ; il ne met rien en ligne.

---

## Structure des fichiers

| Fichier | Responsabilité |
|---|---|
| `templates/collection.saga.json` | Template alterné. Déclare les deux sections et leur ordre. Prévisualisable via `?view=saga`. |
| `sections/rdc_saga-hero.liquid` | Carrousel plein cadre + surtitre, titre, descriptif, CTA, points de navigation. Ne connaît rien des motifs. |
| `sections/rdc_saga-motifs.liquid` | Regroupement et tri des produits par motif, puis rendu d'une bande par motif. |
| `snippets/rdc_saga-cut-card.liquid` | Une carte de coupe : image détourée, nom, prix, nuanciers. Appelée en boucle par la section motifs. |

Deux sections plutôt qu'une : chacune se place et se retire indépendamment dans l'éditeur, et le hero se réutilisera tel quel pour les rayons thématiques. La carte est un snippet parce qu'elle est appelée 12 à 20 fois par page et qu'elle a sa propre logique de repli.

---

## Comment on vérifie (à lire avant la Tâche 1)

Il n'y a pas de framework de tests unitaires dans ce dépôt — c'est un thème Liquid. La vérification se fait à deux niveaux, tous deux réellement exécutables :

**1. Lint statique, hors ligne :**
```bash
cd "C:/Users/uriel/Desktop/DEVS/shopify (Runes de Chêne)"
shopify theme check --fail-level error
```

**2. Rendu réel, en local, sans toucher à la prod.** Dans un terminal séparé :
```bash
shopify theme dev
# sert le thème local sur http://127.0.0.1:9292
```
Puis on interroge la page via le template alterné :
```bash
curl -s "http://127.0.0.1:9292/collections/garde-d-acier?view=saga"
```
`?view=saga` fait rendre `templates/collection.saga.json` sans qu'aucune collection n'ait été réassignée dans l'admin. **La boutique live n'est pas affectée.**

Les assertions de chaque tâche sont des scripts Python lisant ce HTML. Écrire l'assertion AVANT le code, la voir échouer, puis implémenter.

---

### Task 1 : le squelette — template alterné + section hero vide

**Files:**
- Create: `templates/collection.saga.json`
- Create: `sections/rdc_saga-hero.liquid`
- Test: `docs/superpowers/plans/verif/t1_squelette.py`

**Interfaces:**
- Consumes: rien.
- Produces: le template `collection.saga.json` avec une section d'identifiant `saga_hero` de type `rdc_saga-hero`. La section expose le réglage `min_height` (entier, vh) et `min_height_mobile` (entier, vh). La section rend un élément `<section id="RdcSagaHero-{{ section.id }}">` portant l'attribut `data-rdc-saga-hero`.

- [ ] **Step 1: Écrire l'assertion qui échoue**

Créer `docs/superpowers/plans/verif/t1_squelette.py` :

```python
import sys, urllib.request

URL = "http://127.0.0.1:9292/collections/garde-d-acier?view=saga"
html = urllib.request.urlopen(URL, timeout=30).read().decode("utf-8", "replace")

checks = {
    "la section hero est rendue": 'data-rdc-saga-hero' in html,
    "elle porte un id unique RdcSagaHero-": 'RdcSagaHero-' in html,
    "la hauteur est en vh, pas en px": 'min-height:84vh' in html.replace(' ', ''),
}
fail = [k for k, ok in checks.items() if not ok]
for k, ok in checks.items():
    print(("OK   " if ok else "ECHEC") + "  " + k)
sys.exit(1 if fail else 0)
```

- [ ] **Step 2: Lancer l'assertion et la voir échouer**

Avec `shopify theme dev` en cours dans un autre terminal :

Run: `python docs/superpowers/plans/verif/t1_squelette.py`
Expected: ECHEC sur les trois lignes (le template `?view=saga` n'existe pas encore, Shopify retombe sur le template par défaut).

- [ ] **Step 3: Créer la section hero minimale**

Créer `sections/rdc_saga-hero.liquid` :

```liquid
{%- comment -%}
  rdc_saga-hero.liquid

  Hero plein cadre d'une page de saga. Reprend la grammaire de rdc_hero.liquid :
  voile degrade, Ken Burns, texte en surimpression, points de navigation.
  Ne connait rien des motifs — il ne parle que de la collection.
{%- endcomment -%}

{%- liquid
  assign uid = 'RdcSagaHero-' | append: section.id
  assign s = section.settings
-%}

<style>
  #{{ uid }}{position:relative;min-height:{{ s.min_height }}vh;display:flex;align-items:flex-end;
    overflow:hidden;background:#1c1812}
  @media (max-width:749px){#{{ uid }}{min-height:{{ s.min_height_mobile }}vh}}
</style>

<section id="{{ uid }}" data-rdc-saga-hero></section>

{% schema %}
{
  "name": "RDC — Saga : hero",
  "tag": "section",
  "settings": [
    { "type": "range", "id": "min_height", "label": "Hauteur (desktop)", "unit": "vh", "min": 40, "max": 100, "step": 2, "default": 84 },
    { "type": "range", "id": "min_height_mobile", "label": "Hauteur (mobile)", "unit": "vh", "min": 40, "max": 100, "step": 2, "default": 80 }
  ],
  "presets": [{ "name": "RDC — Saga : hero" }]
}
{% endschema %}
```

- [ ] **Step 4: Créer le template alterné**

Créer `templates/collection.saga.json` :

```json
{
  "sections": {
    "saga_hero": {
      "type": "rdc_saga-hero",
      "settings": {
        "min_height": 84,
        "min_height_mobile": 80
      }
    }
  },
  "order": ["saga_hero"]
}
```

- [ ] **Step 5: Lancer le lint**

Run: `shopify theme check --fail-level error`
Expected: aucune erreur sur les deux fichiers créés.

- [ ] **Step 6: Relancer l'assertion**

Run: `python docs/superpowers/plans/verif/t1_squelette.py`
Expected: OK sur les trois lignes.

- [ ] **Step 7: Vérifier la non-régression du template par défaut**

Run: `curl -s "http://127.0.0.1:9292/collections/garde-d-acier" | grep -c "product-grid"`
Expected: un nombre supérieur à 0 — sans `?view=saga`, la collection rend toujours l'ancienne grille.

- [ ] **Step 8: Commit**

```bash
git add templates/collection.saga.json sections/rdc_saga-hero.liquid docs/superpowers/plans/verif/t1_squelette.py
git commit -m "feat(saga): template alterne + squelette de la section hero"
```

---

### Task 2 : le carrousel du hero et son texte

**Files:**
- Modify: `sections/rdc_saga-hero.liquid`
- Test: `docs/superpowers/plans/verif/t2_hero.py`

**Interfaces:**
- Consumes: la section `rdc_saga-hero` et son `uid` définis en Tâche 1.
- Produces: la section lit les images du carrousel via **accès par variable** `collection.metafields[s.mf_namespace][s.mf_key]`, réglages `mf_namespace` (défaut `custom`) et `mf_key` (défaut `hero_images`). Elle rend `.rdcsh__slide` (une par image), `.rdcsh__overline`, `.rdcsh__title`, `.rdcsh__subtitle`, `.rdcsh__btn`, `.rdcsh__dot`.

- [ ] **Step 1: Écrire l'assertion qui échoue**

Créer `docs/superpowers/plans/verif/t2_hero.py` :

```python
import sys, urllib.request, re

URL = "http://127.0.0.1:9292/collections/garde-d-acier?view=saga"
html = urllib.request.urlopen(URL, timeout=30).read().decode("utf-8", "replace")
flat = html.replace(' ', '')

slides = len(re.findall(r'class="[^"]*rdcsh__slide', html))
dots   = len(re.findall(r'class="[^"]*rdcsh__dot', html))

checks = {
    "au moins une diapo est rendue": slides >= 1,
    "autant de points que de diapos": dots == slides,
    "le titre est en surimpression": 'rdcsh__title' in html,
    "le descriptif est present":     'rdcsh__subtitle' in html,
    "le voile degrade est applique": 'rgba(0,0,0,.62)' in flat,
    "Ken Burns est declare":         'rdcshKen' in html,
    "aucun format jpg force":        "format:'jpg'" not in flat and 'format:"jpg"' not in flat,
}
for k, ok in checks.items():
    print(("OK   " if ok else "ECHEC") + "  " + k)
print("diapos=%d points=%d" % (slides, dots))
sys.exit(0 if all(checks.values()) else 1)
```

- [ ] **Step 2: Lancer l'assertion et la voir échouer**

Run: `python docs/superpowers/plans/verif/t2_hero.py`
Expected: ECHEC — `rdcsh__slide` n'existe pas encore, `diapos=0`.

- [ ] **Step 3: Remplacer le contenu de `sections/rdc_saga-hero.liquid`**

```liquid
{%- comment -%}
  rdc_saga-hero.liquid

  Hero plein cadre d'une page de saga. Grammaire reprise de rdc_hero.liquid :
  voile degrade, Ken Burns, texte en surimpression, points qui s'etirent.

  Images : metachamp de COLLECTION lu par acces variable
  collection.metafields[namespace][cle] — reglable dans l'editeur, donc une
  cle renommee ne casse pas le code. Repli sur collection.image.
  Si aucune image : la section ne s'affiche pas du tout.
{%- endcomment -%}

{%- liquid
  assign uid = 'RdcSagaHero-' | append: section.id
  assign s = section.settings

  assign raw = collection.metafields[s.mf_namespace][s.mf_key]
  assign imgs = raw.value | default: raw

  assign has_list = false
  if imgs != blank and imgs.size > 0 and imgs.first != blank
    assign has_list = true
  endif

  assign slide_count = 0
  if has_list
    assign slide_count = imgs.size
  elsif collection.image != blank
    assign slide_count = 1
  endif
-%}

{%- if slide_count > 0 -%}
<style>
  #{{ uid }}{position:relative;min-height:{{ s.min_height }}vh;display:flex;align-items:flex-end;
    overflow:hidden;background:#1c1812}
  @media (max-width:749px){#{{ uid }}{min-height:{{ s.min_height_mobile }}vh}}
  #{{ uid }} .rdcsh__slides{position:absolute;inset:0;overflow:hidden}
  #{{ uid }} .rdcsh__slide{position:absolute;inset:0;opacity:0;transition:opacity 1.2s ease-in-out}
  #{{ uid }} .rdcsh__slide.is-active{opacity:1}
  #{{ uid }} .rdcsh__slide img{width:100%;height:100%;object-fit:cover;display:block}
  #{{ uid }} .rdcsh__slide.is-active img{animation:rdcshKen {{ s.ken_burns_duration }}s ease-in-out infinite alternate;will-change:transform}
  @keyframes rdcshKen{from{transform:scale(1.03) translate3d(0,0,0)}to{transform:scale(1.10) translate3d(-1.8%,-1.2%,0)}}
  @media (prefers-reduced-motion: reduce){#{{ uid }} .rdcsh__slide.is-active img{animation:none}}
  #{{ uid }} .rdcsh__scrim{position:absolute;inset:0;pointer-events:none;
    background:linear-gradient(180deg, rgba(0,0,0,.18) 0%, rgba(0,0,0,0) 38%, rgba(0,0,0,.62) 100%)}
  #{{ uid }} .rdcsh__content{position:relative;width:100%;padding:0 clamp(26px,5vw,64px) 68px;max-width:62ch}
  #{{ uid }} .rdcsh__overline{font-family:var(--font-body--family);font-weight:700;font-size:.74rem;
    letter-spacing:.26em;text-transform:uppercase;color:#f4d694;margin-bottom:16px}
  #{{ uid }} .rdcsh__title{font-family:var(--font-heading--family, sans-serif);color:#fff;
    text-transform:uppercase;line-height:.94;letter-spacing:.02em;
    font-size:clamp(2.2rem,5.2vw,4.6rem);text-shadow:0 2px 24px rgba(0,0,0,.55);margin:0}
  #{{ uid }} .rdcsh__subtitle{font-family:var(--font-body--family);color:#fff;
    font-size:clamp(1rem,1.4vw,1.18rem);line-height:1.5;max-width:48ch;margin:18px 0 0;
    text-shadow:0 2px 24px rgba(0,0,0,.55)}
  #{{ uid }} .rdcsh__subtitle p{margin:0}
  #{{ uid }} .rdcsh__actions{display:flex;flex-wrap:wrap;gap:13px;margin-top:28px}
  #{{ uid }} .rdcsh__btn{display:inline-flex;align-items:center;font-family:var(--font-body--family);
    font-weight:700;font-size:.82rem;letter-spacing:.06em;text-transform:uppercase;
    padding:14px 30px;border-radius:12px;color:#fff;border:1px solid rgba(255,255,255,.6);
    text-decoration:none;transition:.2s;background:transparent}
  #{{ uid }} .rdcsh__btn:hover{background:#fff;color:#222;border-color:#fff}
  #{{ uid }} .rdcsh__btn--solid{background:#f4d694;color:#623c3c;border-color:#f4d694}
  #{{ uid }} .rdcsh__btn--solid:hover{background:#f9e6bd;color:#623c3c;border-color:#f9e6bd}
  #{{ uid }} .rdcsh__dots{position:absolute;left:0;right:0;bottom:20px;z-index:3;
    display:flex;gap:8px;justify-content:center;pointer-events:none}
  #{{ uid }} .rdcsh__dot{pointer-events:auto;width:9px;height:9px;padding:0;border:0;cursor:pointer;
    border-radius:999px;background:rgba(255,255,255,.45);transition:.25s ease}
  #{{ uid }} .rdcsh__dot.is-active{background:#fff;width:26px;border-radius:5px}
</style>

<section id="{{ uid }}" data-rdc-saga-hero>
  <div class="rdcsh__slides">
    {%- if has_list -%}
      {%- for img in imgs -%}
        <div class="rdcsh__slide{% if forloop.first %} is-active{% endif %}">
          <img src="{{ img | image_url: width: 2200 }}"
               alt="{{ collection.title | escape }}"
               width="2200" height="1100"
               loading="{% if forloop.first %}eager{% else %}lazy{% endif %}">
        </div>
      {%- endfor -%}
    {%- else -%}
      <div class="rdcsh__slide is-active">
        <img src="{{ collection.image | image_url: width: 2200 }}"
             alt="{{ collection.title | escape }}"
             width="2200" height="1100" loading="eager">
      </div>
    {%- endif -%}
  </div>

  <div class="rdcsh__scrim"></div>

  <div class="rdcsh__content">
    {%- if s.overline != blank -%}
      <div class="rdcsh__overline">{{ s.overline }}</div>
    {%- endif -%}
    <h1 class="rdcsh__title">{{ s.title | default: collection.title }}</h1>
    {%- if collection.description != blank -%}
      <div class="rdcsh__subtitle">{{ collection.description }}</div>
    {%- endif -%}
    {%- if s.btn1_label != blank or s.btn2_label != blank -%}
      <div class="rdcsh__actions">
        {%- if s.btn1_label != blank -%}
          <a class="rdcsh__btn rdcsh__btn--solid" href="{{ s.btn1_link | default: '#' }}">{{ s.btn1_label }}</a>
        {%- endif -%}
        {%- if s.btn2_label != blank -%}
          <a class="rdcsh__btn" href="{{ s.btn2_link | default: '#' }}">{{ s.btn2_label }}</a>
        {%- endif -%}
      </div>
    {%- endif -%}
  </div>

  {%- if slide_count > 1 -%}
    <div class="rdcsh__dots">
      {%- for i in (1..slide_count) -%}
        <button class="rdcsh__dot{% if forloop.first %} is-active{% endif %}"
                type="button" aria-label="Diapositive {{ forloop.index }}"></button>
      {%- endfor -%}
    </div>
  {%- endif -%}
</section>

<script>
  (function(){
    var root = document.getElementById({{ uid | json }});
    if (!root) return;
    var slides = root.querySelectorAll('.rdcsh__slide');
    var dots = root.querySelectorAll('.rdcsh__dot');
    if (slides.length < 2) return;
    var i = 0, timer = null;
    var delay = {{ s.autoplay_seconds | times: 1000 }};
    function show(n){
      i = (n + slides.length) % slides.length;
      for (var k = 0; k < slides.length; k++){
        slides[k].classList.toggle('is-active', k === i);
        if (dots[k]) dots[k].classList.toggle('is-active', k === i);
      }
    }
    function start(){ if (delay > 0) timer = setInterval(function(){ show(i + 1); }, delay); }
    function stop(){ if (timer) { clearInterval(timer); timer = null; } }
    for (var k = 0; k < dots.length; k++){
      (function(n){ dots[n].addEventListener('click', function(){ stop(); show(n); start(); }); })(k);
    }
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) start();
  })();
</script>
{%- endif -%}

{% schema %}
{
  "name": "RDC — Saga : hero",
  "tag": "section",
  "settings": [
    { "type": "header", "content": "Images du carrousel" },
    { "type": "text", "id": "mf_namespace", "label": "Métachamp — namespace", "default": "custom" },
    { "type": "text", "id": "mf_key", "label": "Métachamp — clé", "default": "hero_images", "info": "Métachamp de COLLECTION, type liste de fichiers. Repli automatique sur l'image de la collection." },
    { "type": "range", "id": "autoplay_seconds", "label": "Défilement automatique", "unit": "s", "min": 0, "max": 12, "step": 1, "default": 6, "info": "0 = pas de défilement automatique." },
    { "type": "range", "id": "ken_burns_duration", "label": "Durée du zoom lent", "unit": "s", "min": 8, "max": 30, "step": 1, "default": 18 },
    { "type": "header", "content": "Texte" },
    { "type": "text", "id": "overline", "label": "Surtitre", "default": "Saga" },
    { "type": "text", "id": "title", "label": "Titre", "info": "Vide = le titre de la collection." },
    { "type": "header", "content": "Boutons" },
    { "type": "text", "id": "btn1_label", "label": "Bouton principal — libellé" },
    { "type": "url",  "id": "btn1_link",  "label": "Bouton principal — lien" },
    { "type": "text", "id": "btn2_label", "label": "Bouton secondaire — libellé" },
    { "type": "url",  "id": "btn2_link",  "label": "Bouton secondaire — lien" },
    { "type": "header", "content": "Dimensions" },
    { "type": "range", "id": "min_height", "label": "Hauteur (desktop)", "unit": "vh", "min": 40, "max": 100, "step": 2, "default": 84 },
    { "type": "range", "id": "min_height_mobile", "label": "Hauteur (mobile)", "unit": "vh", "min": 40, "max": 100, "step": 2, "default": 80 }
  ],
  "presets": [{ "name": "RDC — Saga : hero" }]
}
{% endschema %}
```

- [ ] **Step 4: Lancer le lint**

Run: `shopify theme check --fail-level error`
Expected: aucune erreur.

- [ ] **Step 5: Relancer l'assertion**

Run: `python docs/superpowers/plans/verif/t2_hero.py`
Expected: OK partout. `diapos` vaut 1 si le métachamp est vide (repli sur `collection.image`), davantage s'il est rempli.

- [ ] **Step 6: Vérifier le cas « métachamp mal nommé »**

Dans l'éditeur de thème, mettre `mf_key` à une valeur bidon (`nexistepas`), recharger la page.
Expected: le hero s'affiche toujours, avec l'image de collection. Aucune page blanche, aucune erreur Liquid. Remettre `hero_images` ensuite.

- [ ] **Step 7: Commit**

```bash
git add sections/rdc_saga-hero.liquid docs/superpowers/plans/verif/t2_hero.py
git commit -m "feat(saga): carrousel du hero, texte en surimpression, cle de metachamp reglable"
```

---

### Task 3 : le regroupement par motif et son tri

**Files:**
- Create: `sections/rdc_saga-motifs.liquid`
- Modify: `templates/collection.saga.json`
- Test: `docs/superpowers/plans/verif/t3_motifs.py`

**Interfaces:**
- Consumes: rien de la Tâche 2 — la section est indépendante.
- Produces: une section rendant `<section id="RdcSagaMotifs-{{ section.id }}">`, contenant une `.rdcsm__band` par motif, chacune avec `data-motif="<handle>"` et `data-rank="<n>"`, et à l'intérieur `.rdcsm__num`, `.rdcsm__seal`, `.rdcsm__name`, `.rdcsm__res`. L'ordre du DOM est celui du tri : date de l'illustration décroissante. Le rail des coupes arrive en Tâche 4.

- [ ] **Step 1: Écrire l'assertion qui échoue**

Créer `docs/superpowers/plans/verif/t3_motifs.py` :

```python
import sys, urllib.request, re, json

ATTENDU = {
    "garde-d-acier":       {"bandes": 3, "premier": "Skjaldm"},
    "les-mysteres-celtes": {"bandes": 3},
    "lombre-et-lairain":   {"bandes": 2},
    "le-pacte-sauvage":    {"bandes": 3},
}

ok_global = True
for handle, att in ATTENDU.items():
    url = "http://127.0.0.1:9292/collections/%s?view=saga" % handle
    html = urllib.request.urlopen(url, timeout=30).read().decode("utf-8", "replace")

    bandes = re.findall(r'data-motif="([^"]+)"\s+data-rank="(\d+)"', html)
    noms = re.findall(r'class="[^"]*rdcsm__name[^"]*"[^>]*>([^<]+)<', html)

    n_ok = len(bandes) == att["bandes"]
    rangs = [int(r) for _, r in bandes]
    rang_ok = rangs == sorted(rangs) and rangs == list(range(1, len(rangs) + 1))
    uniq_ok = len(set(h for h, _ in bandes)) == len(bandes)
    prem_ok = True
    if "premier" in att and noms:
        prem_ok = att["premier"].lower() in noms[0].lower()

    for label, cond in (("nombre de bandes = %d" % att["bandes"], n_ok),
                        ("rangs 1..n dans l'ordre", rang_ok),
                        ("aucun motif en double", uniq_ok),
                        ("le plus recent en premier", prem_ok)):
        print("%-22s %-28s %s" % (handle, label, "OK" if cond else "ECHEC"))
        ok_global = ok_global and cond
    print("%-22s motifs: %s" % (handle, [h for h, _ in bandes]))

sys.exit(0 if ok_global else 1)
```

- [ ] **Step 2: Lancer l'assertion et la voir échouer**

Run: `python docs/superpowers/plans/verif/t3_motifs.py`
Expected: ECHEC partout, `motifs: []`.

- [ ] **Step 3: Créer `sections/rdc_saga-motifs.liquid`**

Le cœur du plan. Liquid n'a pas de dictionnaires : on construit des listes de chaînes concaténées, puis on les découpe — exactement ce que fait déjà `rdc_illustrations_meta.liquid` pour son tri.

Trois pièges traités explicitement :
- La détection de doublon utilise des délimiteurs **des deux côtés** (`|avalon|`), sinon `avalon` matcherait à l'intérieur de `grand-avalon`.
- Les époques Unix sont sur 10 chiffres, donc comparables en tri alphabétique. Une date absente vaut `0000000000` et part en fin de liste.
- L'index de tri est suffixé par l'ordre de première apparition, ce qui rend le tri stable entre deux motifs de même date.

```liquid
{%- comment -%}
  rdc_saga-motifs.liquid

  Regroupe les produits de la collection par MOTIF (metaobjet illustration
  pointe par product.metafields.custom.illustration_produit), trie les motifs
  du plus recent au plus ancien, et rend une bande par motif.

  Repli si un produit n'est pas relie : le nom avant la barre verticale du
  titre ("Avalon | T-shirt unisexe"). Convention respectee sur les 64 produits
  des 4 sagas au 2026-08-10.

  Plafond Liquid : sans pagination, collection.products expose 50 produits.
  Les sagas en font 12 a 20. Au-dela, un avertissement s'affiche dans
  l'editeur plutot qu'une troncature silencieuse.
{%- endcomment -%}

{%- liquid
  assign uid = 'RdcSagaMotifs-' | append: section.id
  assign s = section.settings

  assign seen = '|'
  assign keys = ''
  assign names = ''
  assign sortable = ''
  assign rank0 = 0

  for product in collection.products
    assign ill = product.metafields.custom.illustration_produit.value

    if ill != blank and ill.nom != blank
      assign mname = ill.nom
    else
      assign mname = product.title | split: '|' | first | strip
    endif
    assign mkey = mname | handleize

    assign probe = '|' | append: mkey | append: '|'
    unless seen contains probe
      assign seen = seen | append: mkey | append: '|'
      assign keys = keys | append: mkey | append: '~'
      assign names = names | append: mname | append: '~'

      assign epoch = '0000000000'
      if ill != blank and ill.date != blank
        assign epoch = ill.date | date: '%s'
      elsif product.published_at != blank
        assign epoch = product.published_at | date: '%s'
      endif

      assign pad = rank0 | prepend: '000' | slice: -3, 3
      assign sortable = sortable | append: epoch | append: '.' | append: pad | append: '~'
      assign rank0 = rank0 | plus: 1
    endunless
  endfor

  assign key_list = keys | split: '~'
  assign name_list = names | split: '~'
  assign sorted_list = sortable | split: '~' | sort | reverse
  assign motif_count = key_list.size

  assign over_limit = false
  if collection.all_products_count > 50
    assign over_limit = true
  endif
-%}

<style>
  #{{ uid }} .rdcsm__band{position:relative;overflow:hidden;
    padding:clamp(34px,4vw,58px) clamp(26px,5vw,64px);color:#403434}
  #{{ uid }} .rdcsm__band--a{background:#f4eee1}
  #{{ uid }} .rdcsm__band--b{background:#f2e6d2}
  #{{ uid }} .rdcsm__num{position:absolute;top:clamp(12px,1.6vw,26px);right:clamp(16px,2.2vw,38px);
    font-family:var(--font-heading--family, sans-serif);font-size:clamp(6rem,14vw,12.5rem);
    line-height:1;letter-spacing:-.02em;pointer-events:none;color:transparent;
    -webkit-text-stroke:1.5px #b4894f;opacity:.20}
  #{{ uid }} .rdcsm__head{position:relative;display:flex;align-items:center;
    gap:clamp(16px,2vw,26px);margin-bottom:clamp(22px,2.6vw,34px)}
  #{{ uid }} .rdcsm__seal{flex:0 0 auto;width:clamp(74px,7vw,104px)}
  #{{ uid }} .rdcsm__seal img{width:100%;display:block;height:auto}
  #{{ uid }} .rdcsm__txt{min-width:0}
  #{{ uid }} .rdcsm__over{font-family:var(--font-body--family);font-weight:700;font-size:.68rem;
    letter-spacing:.26em;text-transform:uppercase;color:#b4894f}
  #{{ uid }} .rdcsm__name{font-family:var(--font-heading--family, sans-serif);
    font-size:clamp(2rem,4.4vw,3.4rem);line-height:.92;letter-spacing:.02em;
    text-transform:uppercase;margin:6px 0 0}
  #{{ uid }} .rdcsm__res{font-family:var(--font-body--family);font-size:1rem;line-height:1.6;
    max-width:52ch;margin:8px 0 0;color:#5a4a42}
  #{{ uid }} .rdcsm__meta{margin-left:auto;flex:0 0 auto;text-align:right;align-self:flex-end;
    font-family:var(--font-body--family);font-size:.68rem;letter-spacing:.18em;
    text-transform:uppercase;color:#b4894f;white-space:nowrap}
  #{{ uid }} .rdcsm__warn{background:#962B21;color:#fff;font-family:var(--font-body--family);
    font-size:.8rem;padding:12px 18px}
</style>

<section id="{{ uid }}">
  {%- if over_limit -%}
    <div class="rdcsm__warn">
      Cette collection contient {{ collection.all_products_count }} produits.
      Liquid n'en expose que 50 sans pagination : les motifs au-delà ne sont pas affichés.
      Réduisez la collection ou découpez-la.
    </div>
  {%- endif -%}

  {%- for entry in sorted_list -%}
    {%- liquid
      assign parts = entry | split: '.'
      assign idx = parts[1] | plus: 0
      assign mkey = key_list[idx]
      assign mname = name_list[idx]
      assign rank = forloop.index

      assign band_mod = forloop.index0 | modulo: 2
      assign band_class = 'rdcsm__band--a'
      if band_mod == 1
        assign band_class = 'rdcsm__band--b'
      endif

      assign seal = nil
      assign resume = nil
      assign cuts = 0
      for product in collection.products
        assign pill = product.metafields.custom.illustration_produit.value
        if pill != blank and pill.nom != blank
          assign pname = pill.nom
        else
          assign pname = product.title | split: '|' | first | strip
        endif
        assign pkey = pname | handleize
        if pkey == mkey
          assign cuts = cuts | plus: 1
          if seal == nil and pill != blank
            assign seal = pill.image_pour_fond_clair | default: pill.image_pour_fond_sombre
            assign resume = pill.resume
          endif
        endif
      endfor
    -%}

    <div class="rdcsm__band {{ band_class }}" data-motif="{{ mkey }}" data-rank="{{ rank }}">
      <div class="rdcsm__num">{{ rank | prepend: '0' | slice: -2, 2 }}</div>

      <div class="rdcsm__head">
        {%- if seal != blank -%}
          <div class="rdcsm__seal">
            <img src="{{ seal | image_url: width: 320 }}" alt="{{ mname | escape }}" loading="lazy">
          </div>
        {%- endif -%}
        <div class="rdcsm__txt">
          <div class="rdcsm__over">
            {%- if rank == 1 -%}{{ s.label_recent }}{%- else -%}{{ s.label_motif }}{%- endif -%}
          </div>
          <h2 class="rdcsm__name">{{ mname }}</h2>
          {%- if resume != blank -%}
            <p class="rdcsm__res">{{ resume }}</p>
          {%- endif -%}
        </div>
        <div class="rdcsm__meta">{{ cuts }} coupes</div>
      </div>
    </div>
  {%- endfor -%}
</section>

{% schema %}
{
  "name": "RDC — Saga : motifs",
  "tag": "section",
  "settings": [
    { "type": "text", "id": "label_recent", "label": "Surtitre du premier motif", "default": "Le plus récent" },
    { "type": "text", "id": "label_motif", "label": "Surtitre des autres motifs", "default": "Motif" }
  ],
  "presets": [{ "name": "RDC — Saga : motifs" }]
}
{% endschema %}
```

- [ ] **Step 4: Ajouter la section au template**

Remplacer le contenu de `templates/collection.saga.json` :

```json
{
  "sections": {
    "saga_hero": {
      "type": "rdc_saga-hero",
      "settings": {
        "mf_namespace": "custom",
        "mf_key": "hero_images",
        "autoplay_seconds": 6,
        "ken_burns_duration": 18,
        "overline": "Saga",
        "min_height": 84,
        "min_height_mobile": 80
      }
    },
    "saga_motifs": {
      "type": "rdc_saga-motifs",
      "settings": {
        "label_recent": "Le plus récent",
        "label_motif": "Motif"
      }
    }
  },
  "order": ["saga_hero", "saga_motifs"]
}
```

- [ ] **Step 5: Lancer le lint**

Run: `shopify theme check --fail-level error`
Expected: aucune erreur.

- [ ] **Step 6: Relancer l'assertion sur les 4 sagas**

Run: `python docs/superpowers/plans/verif/t3_motifs.py`
Expected: OK partout — 3, 3, 2, 3 bandes, rangs 1..n, aucun doublon, Skjaldmö en tête pour La Garde d'Acier.

- [ ] **Step 7: Vérifier le repli sur le titre**

Ce test prouve qu'un produit délié de son illustration atterrit quand même dans la bonne bande. Puisqu'on ne modifie pas la donnée en prod, on l'observe en lecture :

```bash
curl -s "http://127.0.0.1:9292/collections/le-pacte-sauvage?view=saga" | grep -o 'data-motif="[^"]*"'
```
Expected: trois motifs, dont ceux de la loutre, du hibou et du loup — quelle que soit la présence du métaobjet, puisque le repli lit le titre.

- [ ] **Step 8: Commit**

```bash
git add sections/rdc_saga-motifs.liquid templates/collection.saga.json docs/superpowers/plans/verif/t3_motifs.py
git commit -m "feat(saga): regroupement par motif, tri par date d'illustration, garde-fou 50 produits"
```

---

### Task 4 : le rail des coupes — prix, nuanciers, packshots détourés

**Files:**
- Create: `snippets/rdc_saga-cut-card.liquid`
- Modify: `sections/rdc_saga-motifs.liquid`
- Test: `docs/superpowers/plans/verif/t4_rail.py`

**Interfaces:**
- Consumes: la section `rdc_saga-motifs` de la Tâche 3 et sa boucle sur les motifs.
- Produces: le snippet `rdc_saga-cut-card` prend `product` (objet produit, requis). Il rend `.rdcsm__cut` contenant `.rdcsm__cshot > img`, `.rdcsm__cname`, `.rdcsm__cprice`, et les nuanciers via le snippet existant `variant-swatches`.

- [ ] **Step 1: Écrire l'assertion qui échoue**

Créer `docs/superpowers/plans/verif/t4_rail.py` :

```python
import sys, urllib.request, re

URL = "http://127.0.0.1:9292/collections/garde-d-acier?view=saga"
html = urllib.request.urlopen(URL, timeout=30).read().decode("utf-8", "replace")
flat = html.replace(' ', '')

cartes = len(re.findall(r'class="[^"]*rdcsm__cut', html))
prix   = re.findall(r'class="[^"]*rdcsm__cprice[^"]*"[^>]*>([^<]+)<', html)

checks = {
    "20 cartes de coupe (3 motifs)": cartes == 20,
    "chaque carte a un prix":        len(prix) == cartes,
    "les prix sont en euros":        all(('€' in p) for p in prix),
    "le prix le plus bas est 29,90": any('29,90' in p for p in prix),
    "le plus haut est 109,90":       any('109,90' in p for p in prix),
    "les nuanciers sont rendus":     'swatch' in html,
    "fond de carte transparent":     'background:transparent' in flat,
    "images en contain, non rognees": 'object-fit:contain' in flat,
    "aucun format jpg force":        "format:'jpg'" not in flat,
}
for k, ok in checks.items():
    print(("OK   " if ok else "ECHEC") + "  " + k)
print("cartes=%d prix=%d" % (cartes, len(prix)))
sys.exit(0 if all(checks.values()) else 1)
```

- [ ] **Step 2: Lancer l'assertion et la voir échouer**

Run: `python docs/superpowers/plans/verif/t4_rail.py`
Expected: ECHEC, `cartes=0`.

- [ ] **Step 3: Créer `snippets/rdc_saga-cut-card.liquid`**

```liquid
{%- doc -%}
  Une carte de coupe dans le rail d'un motif.

  Le packshot a un canal alpha (33 a 63 % de pixels transparents) : fond
  transparent et object-fit:contain, pour que la coupe entiere soit visible.
  image_url ne doit JAMAIS recevoir format:'jpg' — le JPEG detruit l'alpha.

  @param {object} product - Le produit a rendre. Requis.
{%- enddoc -%}

{%- liquid
  assign cut_name = product.title | split: '|' | last | strip
  if cut_name == blank or cut_name == product.title
    assign cut_name = product.type | default: product.title
  endif
-%}

<a class="rdcsm__cut" href="{{ product.url }}">
  <span class="rdcsm__cshot">
    {%- if product.featured_image != blank -%}
      <img src="{{ product.featured_image | image_url: width: 600 }}"
           alt="{{ product.title | escape }}"
           width="600" height="800" loading="lazy">
    {%- endif -%}
  </span>
  <span class="rdcsm__cname">{{ cut_name }}</span>
  <span class="rdcsm__cprice">{{ product.price | money }}</span>
  {%- render 'variant-swatches', product_resource: product -%}
</a>
```

- [ ] **Step 4: Ajouter le rail dans la section motifs**

Dans `sections/rdc_saga-motifs.liquid`, ajouter ces règles à la fin du bloc `<style>`, juste avant `</style>` :

```css
  #{{ uid }} .rdcsm__rail{position:relative;display:grid;gap:10px;
    grid-template-columns:repeat(auto-fit,minmax(110px,1fr))}
  #{{ uid }} .rdcsm__cut{text-decoration:none;color:inherit;display:block}
  #{{ uid }} .rdcsm__cshot{aspect-ratio:3/4;background:transparent;display:block}
  #{{ uid }} .rdcsm__cshot img{width:100%;height:100%;object-fit:contain;display:block;
    transition:transform .5s ease;filter:drop-shadow(0 10px 18px rgba(64,52,52,.18))}
  #{{ uid }} .rdcsm__cut:hover .rdcsm__cshot img{transform:scale(1.06) translateY(-3px)}
  #{{ uid }} .rdcsm__cname{font-family:var(--font-body--family);font-size:.7rem;font-weight:600;
    letter-spacing:.06em;text-transform:uppercase;margin-top:9px;line-height:1.25;
    color:#5a4a42;display:block}
  #{{ uid }} .rdcsm__cprice{font-family:var(--font-heading--family, sans-serif);font-size:1.14rem;
    letter-spacing:.03em;margin-top:1px;color:#962B21;display:block}
```

Puis, dans le corps de la boucle des motifs, insérer le rail **juste après** la fermeture de `</div>` du bloc `rdcsm__head`, avant la fermeture de la bande :

```liquid
      <div class="rdcsm__rail">
        {%- for product in collection.products -%}
          {%- liquid
            assign pill = product.metafields.custom.illustration_produit.value
            if pill != blank and pill.nom != blank
              assign pname = pill.nom
            else
              assign pname = product.title | split: '|' | first | strip
            endif
            assign pkey = pname | handleize
          -%}
          {%- if pkey == mkey -%}
            {%- render 'rdc_saga-cut-card', product: product -%}
          {%- endif -%}
        {%- endfor -%}
      </div>
```

- [ ] **Step 5: Lancer le lint**

Run: `shopify theme check --fail-level error`
Expected: aucune erreur.

- [ ] **Step 6: Relancer l'assertion**

Run: `python docs/superpowers/plans/verif/t4_rail.py`
Expected: OK partout, `cartes=20`.

- [ ] **Step 7: Vérifier qu'aucun packshot n'est servi en JPEG**

```bash
curl -s "http://127.0.0.1:9292/collections/garde-d-acier?view=saga" \
  | grep -o 'rdcsm__cshot.\{0,400\}' | grep -c '\.jpg'
```
Expected: `0`.

- [ ] **Step 8: Commit**

```bash
git add snippets/rdc_saga-cut-card.liquid sections/rdc_saga-motifs.liquid docs/superpowers/plans/verif/t4_rail.py
git commit -m "feat(saga): rail des coupes avec prix, nuanciers et packshots detoures"
```

---

### Task 5 : les dégradations, vérifiées une par une

**Files:**
- Modify: `sections/rdc_saga-motifs.liquid`
- Test: `docs/superpowers/plans/verif/t5_degradations.py`

**Interfaces:**
- Consumes: tout ce qui précède.
- Produces: aucune nouvelle interface. Cette tâche prouve que le tableau de dégradation de la spec (§6) est réellement respecté, et corrige ce qui ne l'est pas.

- [ ] **Step 1: Écrire l'assertion**

Créer `docs/superpowers/plans/verif/t5_degradations.py` :

```python
import sys, urllib.request, re

SAGAS = ["garde-d-acier", "les-mysteres-celtes", "lombre-et-lairain", "le-pacte-sauvage"]
ok_global = True

for handle in SAGAS:
    url = "http://127.0.0.1:9292/collections/%s?view=saga" % handle
    html = urllib.request.urlopen(url, timeout=30).read().decode("utf-8", "replace")

    bandes = re.findall(r'data-motif="([^"]+)"', html)
    noms   = re.findall(r'class="[^"]*rdcsm__name[^"]*"[^>]*>\s*([^<]*?)\s*<', html)
    resumes = re.findall(r'class="[^"]*rdcsm__res[^"]*"[^>]*>\s*([^<]*?)\s*<', html)
    cartes = len(re.findall(r'class="[^"]*rdcsm__cut', html))

    checks = {
        "au moins une bande":                len(bandes) >= 1,
        "aucun nom de motif vide":           all(n.strip() for n in noms),
        "aucun paragraphe resume vide":      all(r.strip() for r in resumes),
        "aucun 'Liquid error' dans la page": 'Liquid error' not in html,
        "aucun placeholder visible":         'TODO' not in html and 'Lorem' not in html,
        "au moins une carte par bande":      cartes >= len(bandes),
        "pas d'avertissement 50 produits":   'Liquid n' not in html or 'expose que 50' not in html,
    }
    for k, ok in checks.items():
        print("%-22s %-36s %s" % (handle, k, "OK" if ok else "ECHEC"))
        ok_global = ok_global and ok

sys.exit(0 if ok_global else 1)
```

- [ ] **Step 2: Lancer l'assertion**

Run: `python docs/superpowers/plans/verif/t5_degradations.py`
Expected: la ligne « aucun paragraphe resume vide » échoue probablement — si un `resume` est une chaîne vide plutôt qu'absente, le `{%- if resume != blank -%}` peut laisser passer un paragraphe creux.

- [ ] **Step 3: Durcir le test de vacuité**

Dans `sections/rdc_saga-motifs.liquid`, remplacer :

```liquid
          {%- if resume != blank -%}
            <p class="rdcsm__res">{{ resume }}</p>
          {%- endif -%}
```

par :

```liquid
          {%- assign resume_clean = resume | strip_html | strip -%}
          {%- if resume_clean != '' -%}
            <p class="rdcsm__res">{{ resume }}</p>
          {%- endif -%}
```

Et de même pour le nom, qui ne doit jamais être vide — juste avant le rendu de la bande, remplacer :

```liquid
      assign mkey = mname | handleize
```

par (dans le bloc `liquid` du haut de fichier) :

```liquid
      assign mname = mname | strip
      if mname == ''
        assign mname = 'Motif'
      endif
      assign mkey = mname | handleize
```

- [ ] **Step 4: Relancer l'assertion**

Run: `python docs/superpowers/plans/verif/t5_degradations.py`
Expected: OK sur les quatre sagas.

- [ ] **Step 5: Vérifier le garde-fou des 50 produits**

Dans l'éditeur, prévisualiser `?view=saga` sur `tous-les-produits` (qui dépasse largement 50).
Expected: le bandeau rouge d'avertissement apparaît en haut de la section. La page ne casse pas.

- [ ] **Step 6: Commit**

```bash
git add sections/rdc_saga-motifs.liquid docs/superpowers/plans/verif/t5_degradations.py
git commit -m "fix(saga): plus de nom ni de resume vide, degradations verifiees sur les 4 sagas"
```

---

### Task 6 : la recette finale sur les 4 sagas

**Files:**
- Create: `docs/superpowers/plans/verif/t6_recette.py`
- Modify: `docs/superpowers/specs/2026-08-10-collection-saga-design.md` (cocher les critères)

**Interfaces:**
- Consumes: tout.
- Produces: un script unique rejouable qui vérifie les six critères de la spec §9. C'est lui qu'on relancera avant toute mise en ligne.

- [ ] **Step 1: Écrire la recette complète**

Créer `docs/superpowers/plans/verif/t6_recette.py` :

```python
import sys, urllib.request, re

ATTENDU = {
    "garde-d-acier":       (3, 20),
    "les-mysteres-celtes": (3, 17),
    "lombre-et-lairain":   (2, 12),
    "le-pacte-sauvage":    (3, 15),
}

def get(url):
    return urllib.request.urlopen(url, timeout=30).read().decode("utf-8", "replace")

echecs = []

for handle, (n_motifs, n_produits) in ATTENDU.items():
    html = get("http://127.0.0.1:9292/collections/%s?view=saga" % handle)
    bandes = re.findall(r'data-motif="([^"]+)"\s+data-rank="(\d+)"', html)
    cartes = len(re.findall(r'class="[^"]*rdcsm__cut', html))
    prix   = re.findall(r'class="[^"]*rdcsm__cprice[^"]*"[^>]*>([^<]+)<', html)
    rangs  = [int(r) for _, r in bandes]

    cas = {
        "1. bonnes bandes":        len(bandes) == n_motifs,
        "2. rangs 1..n ordonnes":  rangs == list(range(1, n_motifs + 1)),
        "3. toutes les coupes":    cartes == n_produits,
        "3b. un prix par coupe":   len(prix) == cartes,
        "4. repli titre actif":    all(h.strip() for h, _ in bandes),
        "5. aucun fond blanc":     'object-fit:contain' in html.replace(' ', ''),
        "6. pas d'erreur Liquid":  'Liquid error' not in html,
    }
    for k, ok in cas.items():
        print("%-22s %-24s %s" % (handle, k, "OK" if ok else "ECHEC"))
        if not ok:
            echecs.append("%s / %s" % (handle, k))

# Critere 6 de la spec : les autres collections ne bougent pas
temoin = get("http://127.0.0.1:9292/collections/debardeurs")
ok = 'rdcsm__band' not in temoin
print("%-22s %-24s %s" % ("debardeurs", "6. non-regression", "OK" if ok else "ECHEC"))
if not ok:
    echecs.append("debardeurs / non-regression")

print()
if echecs:
    print("ECHECS :", len(echecs))
    for e in echecs:
        print("  -", e)
    sys.exit(1)
print("Recette complete : tout est vert.")
```

- [ ] **Step 2: Lancer la recette**

Run: `python docs/superpowers/plans/verif/t6_recette.py`
Expected: « Recette complete : tout est vert. »

- [ ] **Step 3: Lint final**

Run: `shopify theme check --fail-level error`
Expected: aucune erreur.

- [ ] **Step 4: Cocher les critères dans la spec**

Dans `docs/superpowers/specs/2026-08-10-collection-saga-design.md`, section 9, préfixer chaque critère vérifié par `- [x]` et ajouter en fin de section :

```markdown
> Recette rejouable : `python docs/superpowers/plans/verif/t6_recette.py`
> (nécessite `shopify theme dev` en cours). Dernière exécution : tout vert.
```

- [ ] **Step 5: Commit**

```bash
git add docs/superpowers/plans/verif/t6_recette.py docs/superpowers/specs/2026-08-10-collection-saga-design.md
git commit -m "test(saga): recette rejouable sur les 4 sagas + non-regression"
```

---

## Ce que ce plan ne fait PAS

Volontairement hors périmètre, à traiter séparément :

- **L'assignation du template aux 4 sagas dans l'admin Shopify.** C'est une action manuelle d'Uriel (Boutique en ligne → Collections → chaque saga → modèle « saga »), et elle rend la page publique. Le plan s'arrête juste avant.
- **La mise en ligne** (`shopify theme push`). Décision d'Uriel, procédure dans `DEPLOY.md`.
- **Les doublons** `collection-celtique` / `collection-grecque` et le titre « Collection byzantine ».
- **Les textes** : les 4 descriptions de collection vides, les `resume` de motif manquants.
- **L'image claire manquante de Varègue.**
