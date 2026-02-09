/**
 * Borne de Commande v2 — Runes de Chêne
 * Navigation : Accueil → (Par article | Par illustration) → Produits → Détail + Panier
 */

document.addEventListener("DOMContentLoaded", function () {
  "use strict";

  /* ============================
   * ÉTAT GLOBAL
   * ============================ */
  var borneEl = document.getElementById("rdc-borne");
  if (!borneEl) return;

  // Données JSON injectées par Liquid
  var produitsData = [];
  var illustrationsData = [];
  try {
    produitsData = JSON.parse(
      document.getElementById("borne-produits-data").textContent,
    );
  } catch (e) {
    console.warn("Borne: pas de données produits", e);
  }
  try {
    illustrationsData = JSON.parse(
      document.getElementById("borne-illustrations-data").textContent,
    );
  } catch (e) {
    console.warn("Borne: pas de données illustrations", e);
  }

  // Historique de navigation pour le bouton retour
  var navHistory = [];
  var currentScreen = "0";
  var browseMode = null; // "article" ou "illustration"
  var selectedIllustration = null;
  var selectedProduitMeta = null;

  /* ============================
   * ÉLÉMENTS DOM
   * ============================ */
  var screens = borneEl.querySelectorAll(".rdc-borne__screen");
  var backButton = borneEl.querySelector('[data-action="back"]');
  var cartCountEl = borneEl.querySelector(".rdc-borne__cart-count");
  var bgDefault = borneEl.querySelector(".rdc-borne__bg-default");
  var bgDynamic = borneEl.querySelector(".rdc-borne__bg-dynamic");

  /* ============================
   * PANIER NATIF SHOPIFY
   * ============================ */
  function openNativeCartDrawer() {
    var drawerComponent = document.querySelector("cart-drawer-component");
    if (drawerComponent && typeof drawerComponent.showDialog === "function") {
      drawerComponent.showDialog();
    } else if (drawerComponent && typeof drawerComponent.open === "function") {
      drawerComponent.open();
    } else {
      window.location.href = "/cart";
    }
  }

  function closeNativeCartDrawer() {
    var drawerComponent = document.querySelector("cart-drawer-component");
    if (drawerComponent && typeof drawerComponent.closeDialog === "function") {
      drawerComponent.closeDialog();
    } else if (drawerComponent && typeof drawerComponent.close === "function") {
      drawerComponent.close();
    }
  }

  function updateCartCount() {
    fetch("/cart.js", { headers: { "X-Requested-With": "XMLHttpRequest" } })
      .then(function (r) {
        return r.json();
      })
      .then(function (data) {
        var count = data.item_count || 0;
        if (cartCountEl) {
          cartCountEl.textContent = count;
          cartCountEl.style.display = count > 0 ? "" : "none";
        }
      })
      .catch(function () {});
  }

  /* ============================
   * CARROUSEL (style explore-illustrations)
   * ============================ */
  function initCarousel(container) {
    if (!container || container._carouselInit) return;
    container._carouselInit = true;

    var carousel = container.querySelector(".rdc-borne__carousel");
    if (!carousel) return;

    var wrappers = Array.from(
      carousel.querySelectorAll(".rdc-borne__card-wrapper"),
    );
    if (wrappers.length === 0) return;

    var prevBtn = container.querySelector(".rdc-borne__carousel-prev");
    var nextBtn = container.querySelector(".rdc-borne__carousel-next");
    var counterCurrent = container.querySelector(".rdc-borne__counter-current");
    var counterTotal = container.querySelector(".rdc-borne__counter-total");
    var currentIdx = 0;
    var scrollTimeout = null;

    if (counterTotal) counterTotal.textContent = wrappers.length;

    function getVisibleWrappers() {
      return wrappers.filter(function (w) {
        return w.style.display !== "none" && !w.classList.contains("hidden");
      });
    }

    function updateCenter() {
      var visible = getVisibleWrappers();
      if (visible.length === 0) return;

      var scrollLeft = carousel.scrollLeft;
      var cardWidth = visible[0].offsetWidth || window.innerWidth * 0.7;
      var closestIdx = 0;
      var minDist = Infinity;

      visible.forEach(function (w, i) {
        var dist = Math.abs(
          w.offsetLeft - scrollLeft - carousel.offsetWidth / 2 + cardWidth / 2,
        );
        if (dist < minDist) {
          minDist = dist;
          closestIdx = i;
        }
      });

      currentIdx = closestIdx;

      wrappers.forEach(function (w) {
        w.classList.remove("is-center");
      });
      if (visible[currentIdx]) {
        visible[currentIdx].classList.add("is-center");
      }

      if (counterCurrent) counterCurrent.textContent = currentIdx + 1;
      if (counterTotal) counterTotal.textContent = visible.length;
    }

    function scrollToIndex(idx) {
      var visible = getVisibleWrappers();
      if (idx < 0 || idx >= visible.length) return;
      currentIdx = idx;

      // Apply is-center immediately for snappy feel
      wrappers.forEach(function (w) {
        w.classList.remove("is-center");
      });
      visible[idx].classList.add("is-center");
      if (counterCurrent) counterCurrent.textContent = idx + 1;

      visible[idx].scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }

    // Scroll detection
    var scrolling = false;
    carousel.addEventListener("scroll", function () {
      if (!scrolling) {
        scrolling = true;
        requestAnimationFrame(function () {
          updateCenter();
          scrolling = false;
        });
      }
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(function () {
        updateCenter();
      }, 150);
    });

    // Nav buttons
    if (prevBtn) {
      prevBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        var visible = getVisibleWrappers();
        var newIdx = (currentIdx - 1 + visible.length) % visible.length;
        scrollToIndex(newIdx);
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        var visible = getVisibleWrappers();
        var newIdx = (currentIdx + 1) % visible.length;
        scrollToIndex(newIdx);
      });
    }

    // Center first card on init
    setTimeout(function () {
      scrollToIndex(0);
    }, 50);
  }

  // Init all static carousels
  function initAllCarousels() {
    var containers = borneEl.querySelectorAll(".rdc-borne__carousel-container");
    containers.forEach(function (c) {
      initCarousel(c);
    });
  }

  /* ============================
   * NAVIGATION ENTRE ÉCRANS
   * ============================ */
  function navigateToScreen(screenId, addToHistory) {
    if (addToHistory !== false && currentScreen !== screenId) {
      navHistory.push(currentScreen);
    }
    currentScreen = screenId;

    screens.forEach(function (s) {
      s.dataset.active = s.dataset.screen === screenId ? "true" : "false";
    });

    // Masquer le bouton retour sur l'écran d'accueil
    if (backButton) {
      backButton.style.display = screenId === "0" ? "none" : "";
    }

    // Scroll en haut
    borneEl.scrollTop = 0;
    window.scrollTo(0, 0);

    // Init carousels on the newly active screen
    setTimeout(function () {
      var activeScreen = borneEl.querySelector(
        '.rdc-borne__screen[data-active="true"]',
      );
      if (activeScreen) {
        var containers = activeScreen.querySelectorAll(
          ".rdc-borne__carousel-container",
        );
        containers.forEach(function (c) {
          initCarousel(c);
        });
      }
    }, 50);
  }

  function goBack() {
    if (navHistory.length > 0) {
      var prev = navHistory.pop();
      navigateToScreen(prev, false);

      // Si on revient à l'accueil, reset le fond
      if (prev === "0") {
        resetBackground();
        browseMode = null;
      }
    }
  }

  /* ============================
   * FOND DYNAMIQUE
   * ============================ */
  function setDynamicBackground(imageUrl) {
    if (!bgDynamic || !bgDefault) return;
    if (imageUrl) {
      bgDynamic.style.backgroundImage = "url('" + imageUrl + "')";
      bgDynamic.classList.add("active");
      bgDefault.classList.remove("active");
    }
  }

  function resetBackground() {
    if (!bgDynamic || !bgDefault) return;
    bgDynamic.classList.remove("active");
    bgDynamic.style.backgroundImage = "";
    bgDefault.classList.add("active");
  }

  /* ============================
   * ÉCRAN 0 : ACCUEIL — Choix du mode
   * ============================ */
  var choiceButtons = borneEl.querySelectorAll(".rdc-borne__choice-btn");
  choiceButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      browseMode = this.dataset.choice;
      if (browseMode === "article") {
        showAllProduits();
        navigateToScreen("2");
      } else if (browseMode === "illustration") {
        navigateToScreen("1b");
      }
    });
  });

  function showAllProduits() {
    var titleEl = borneEl.querySelector(".rdc-borne__products-title");
    if (titleEl) titleEl.textContent = "Choisissez un article";

    // Masquer la description illustration
    var descEl = borneEl.querySelector(".rdc-borne__illustration-desc");
    if (descEl) descEl.style.display = "none";

    // Afficher tous les card-wrappers
    var wrappers = borneEl.querySelectorAll(
      ".rdc-borne__produits-grid .rdc-borne__card-wrapper",
    );
    wrappers.forEach(function (wrapper) {
      wrapper.style.display = "";
    });

    // Reset carousel init so it re-initializes with all cards
    var container = borneEl.querySelector(
      '.rdc-borne__screen[data-screen="2"] .rdc-borne__carousel-container',
    );
    if (container) container._carouselInit = false;
  }

  /* ============================
   * ÉCRAN 1b : ILLUSTRATIONS
   * ============================ */
  var illustrationCards = borneEl.querySelectorAll(
    ".rdc-borne__illustration-card",
  );
  illustrationCards.forEach(function (card) {
    card.addEventListener("click", function () {
      var handle = this.dataset.illustrationHandle;
      var bgImage = this.dataset.bgImage;

      selectedIllustration = illustrationsData.find(function (i) {
        return i.handle === handle;
      });

      // Changer le fond
      if (bgImage) {
        setDynamicBackground(bgImage);
      }

      // Afficher les produits de la collection liée à l'illustration
      if (selectedIllustration && selectedIllustration.collection_handle) {
        showProductsForCollection(
          selectedIllustration.collection_handle,
          selectedIllustration.nom,
        );

        // Afficher la description borne si disponible
        var descEl = borneEl.querySelector(".rdc-borne__illustration-desc");
        if (descEl && selectedIllustration.description_borne) {
          descEl.textContent = selectedIllustration.description_borne;
          descEl.style.display = "";
        }

        navigateToScreen("3");
      }
    });
  });

  /* ============================
   * ÉCRAN 2 : PRODUITS MÉTAOBJETS (par catégorie)
   * ============================ */
  var produitCards = borneEl.querySelectorAll(".rdc-borne__produit-card");
  produitCards.forEach(function (card) {
    card.addEventListener("click", function () {
      var handle = this.dataset.produitHandle;
      var collectionHandle = this.dataset.collectionHandle;

      selectedProduitMeta = produitsData.find(function (p) {
        return p.handle === handle;
      });

      if (collectionHandle) {
        var title = selectedProduitMeta
          ? selectedProduitMeta.label || selectedProduitMeta.nom
          : "";
        showProductsForCollection(collectionHandle, title);
        navigateToScreen("3");
      }
    });
  });

  /* ============================
   * ÉCRAN 3 : PRODUITS SHOPIFY D'UNE COLLECTION
   * ============================ */
  function showProductsForCollection(collectionHandle, title) {
    var titleEl = borneEl.querySelector(".rdc-borne__detail-title");
    if (titleEl) titleEl.textContent = title || "";

    // Hide all product grids
    var allGrids = borneEl.querySelectorAll(".rdc-borne__shopify-products");
    allGrids.forEach(function (grid) {
      grid.style.display = "none";
    });

    // Remove any previously built dynamic carousel
    var detailScreen = borneEl.querySelector(
      '.rdc-borne__screen[data-screen="3"] .rdc-borne__detail-screen',
    );
    var oldCarousel = detailScreen
      ? detailScreen.querySelector(".rdc-borne__carousel-container")
      : null;
    if (oldCarousel) oldCarousel.remove();

    // Find the matching collection grid
    var matchGrid = borneEl.querySelector(
      '.rdc-borne__shopify-products[data-collection="' +
        collectionHandle +
        '"]',
    );
    if (!matchGrid || !detailScreen) return;

    // Build a carousel container dynamically
    var container = document.createElement("div");
    container.className = "rdc-borne__carousel-container";

    var carousel = document.createElement("div");
    carousel.className = "rdc-borne__carousel";

    var products = matchGrid.querySelectorAll(".rdc-borne__shop-product");
    var count = 0;
    products.forEach(function (prod) {
      var wrapper = document.createElement("div");
      wrapper.className = "rdc-borne__card-wrapper";
      wrapper.appendChild(prod.cloneNode(true));
      carousel.appendChild(wrapper);
      count++;
    });

    container.appendChild(carousel);

    // Nav arrows
    var prevBtn = document.createElement("button");
    prevBtn.className = "rdc-borne__carousel-nav rdc-borne__carousel-prev";
    prevBtn.setAttribute("aria-label", "Précédent");
    prevBtn.innerHTML =
      '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>';
    container.appendChild(prevBtn);

    var nextBtn = document.createElement("button");
    nextBtn.className = "rdc-borne__carousel-nav rdc-borne__carousel-next";
    nextBtn.setAttribute("aria-label", "Suivant");
    nextBtn.innerHTML =
      '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>';
    container.appendChild(nextBtn);

    // Counter
    var counter = document.createElement("div");
    counter.className = "rdc-borne__carousel-counter";
    counter.innerHTML =
      '<span class="rdc-borne__counter-current">1</span> / <span class="rdc-borne__counter-total">' +
      count +
      "</span>";
    container.appendChild(counter);

    detailScreen.appendChild(container);

    // Re-bind click events on cloned products
    container
      .querySelectorAll(".rdc-borne__shop-product")
      .forEach(function (product) {
        product.addEventListener("click", function () {
          var productHandle = this.dataset.productHandle;
          showProductDetail(productHandle);
          navigateToScreen("4");
        });
      });
  }

  // Clic sur un produit Shopify → écran 4 (détail variantes)
  var shopProducts = borneEl.querySelectorAll(".rdc-borne__shop-product");
  shopProducts.forEach(function (product) {
    product.addEventListener("click", function () {
      var productHandle = this.dataset.productHandle;
      showProductDetail(productHandle);
      navigateToScreen("4");
    });
  });

  /* ============================
   * ÉCRAN 4 : DÉTAIL PRODUIT + VARIANTES
   * ============================ */
  function showProductDetail(productHandle) {
    var allDetails = borneEl.querySelectorAll(".rdc-borne__product-detail");
    allDetails.forEach(function (d) {
      d.style.display = "none";
    });

    var detail = borneEl.querySelector(
      '.rdc-borne__product-detail[data-product-handle="' + productHandle + '"]',
    );
    if (!detail) return;
    detail.style.display = "";

    resetVariantSelection(detail);
  }

  function resetVariantSelection(detail) {
    detail.querySelectorAll(".rdc-borne__swatch").forEach(function (s) {
      s.classList.remove("active");
    });

    var colorLabel = detail.querySelector(".rdc-borne__selected-color-label");
    var sizeLabel = detail.querySelector(".rdc-borne__selected-size-label");
    if (colorLabel) colorLabel.textContent = "";
    if (sizeLabel) sizeLabel.textContent = "";

    var firstColor = detail.querySelector(
      ".rdc-borne__swatch--color:not(.sold-out)",
    );
    if (firstColor) {
      firstColor.click();
    }
  }

  /* ============================
   * SWATCHES COULEUR (délégation d'événement)
   * ============================ */
  borneEl.addEventListener("click", function (e) {
    var colorSwatch = e.target.closest(".rdc-borne__swatch--color");
    if (!colorSwatch || colorSwatch.disabled) return;

    var detail = colorSwatch.closest(".rdc-borne__product-detail");
    if (!detail) return;

    detail.querySelectorAll(".rdc-borne__swatch--color").forEach(function (s) {
      s.classList.remove("active");
    });
    colorSwatch.classList.add("active");

    var colorLabel = detail.querySelector(".rdc-borne__selected-color-label");
    if (colorLabel) {
      colorLabel.textContent = colorSwatch.dataset.colorName || "";
    }

    var mainImg = detail.querySelector(".rdc-borne__detail-main-img");
    if (mainImg && colorSwatch.dataset.imageUrl) {
      mainImg.src = colorSwatch.dataset.imageUrl;
    }

    var addBtn = detail.querySelector(".rdc-borne__add-to-cart");
    if (addBtn && colorSwatch.dataset.variantId) {
      addBtn.dataset.variantId = colorSwatch.dataset.variantId;
    }

    updateSizeAvailability(detail, colorSwatch.dataset.color);
  });

  /* ============================
   * SWATCHES TAILLE (délégation d'événement)
   * ============================ */
  borneEl.addEventListener("click", function (e) {
    var sizeSwatch = e.target.closest(".rdc-borne__swatch--size");
    if (!sizeSwatch) return;

    var detail = sizeSwatch.closest(".rdc-borne__product-detail");
    if (!detail) return;

    detail.querySelectorAll(".rdc-borne__swatch--size").forEach(function (s) {
      s.classList.remove("active");
    });
    sizeSwatch.classList.add("active");

    var sizeLabel = detail.querySelector(".rdc-borne__selected-size-label");
    if (sizeLabel) {
      sizeLabel.textContent = "Taille " + sizeSwatch.dataset.size;
    }

    var activeColor = detail.querySelector(".rdc-borne__swatch--color.active");
    if (activeColor) {
      var selectedColor = activeColor.dataset.color;
      var variantIds = sizeSwatch.dataset.variantIds || "";
      var entries = variantIds.split(",").filter(Boolean);

      for (var i = 0; i < entries.length; i++) {
        var parts = entries[i].split(":");
        if (parts.length === 2 && parts[1] === selectedColor) {
          var addBtn = detail.querySelector(".rdc-borne__add-to-cart");
          if (addBtn) addBtn.dataset.variantId = parts[0];
          break;
        }
      }
    }
  });

  function updateSizeAvailability(detail, selectedColor) {
    var sizeSwatches = detail.querySelectorAll(".rdc-borne__swatch--size");
    sizeSwatches.forEach(function (swatch) {
      var availableColors = swatch.dataset.availableColors || "";
      var isAvailable = availableColors.indexOf("," + selectedColor) !== -1;
      swatch.classList.toggle("sold-out", !isAvailable);
      swatch.disabled = !isAvailable;

      if (!isAvailable && swatch.classList.contains("active")) {
        swatch.classList.remove("active");
        var sizeLabel = detail.querySelector(".rdc-borne__selected-size-label");
        if (sizeLabel) sizeLabel.textContent = "";
      }
    });
  }

  /* ============================
   * AJOUT AU PANIER (utilise le panier natif Shopify)
   * ============================ */
  borneEl.addEventListener("click", function (e) {
    var addBtn = e.target.closest(".rdc-borne__add-to-cart");
    if (!addBtn) return;

    var variantId = addBtn.dataset.variantId;
    if (!variantId) return;

    addBtn.disabled = true;
    addBtn.textContent = "Ajout en cours...";

    fetch("/cart/add.js", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
      body: JSON.stringify({ id: variantId, quantity: 1 }),
    })
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        addBtn.disabled = false;
        addBtn.textContent = "Ajouter au panier";

        // Mettre à jour le compteur du bouton flottant
        updateCartCount();

        // Marquer le panier avec l'attribut "source: borne" pour identifier les commandes
        fetch("/cart/update.js", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
          },
          body: JSON.stringify({ attributes: { source: "borne" } }),
        }).catch(function () {});

        // Déclencher l'événement cart:update pour que le cart drawer natif se mette à jour
        document.dispatchEvent(
          new CustomEvent("cart:update", {
            bubbles: true,
            detail: {
              resource: data,
              sourceId: "borne-add-to-cart",
              data: {
                source: "borne",
                itemCount: data.item_count || 0,
              },
            },
          }),
        );

        // Retour à l'écran d'accueil
        navigateToScreen("0", false);
        navHistory.length = 0;
        resetBackground();
      })
      .catch(function (error) {
        console.error("Erreur ajout au panier:", error);
        addBtn.disabled = false;
        addBtn.textContent = "Ajouter au panier";
      });
  });

  /* ============================
   * ÉVÉNEMENTS GLOBAUX
   * ============================ */
  // Bouton retour
  if (backButton) {
    backButton.addEventListener("click", goBack);
  }

  // Bouton panier flottant — ouvre le cart drawer natif
  borneEl
    .querySelectorAll('[data-action="open-native-cart"]')
    .forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        openNativeCartDrawer();
      });
    });

  // Resynchroniser le compteur quand le panier est modifié (ex: suppression depuis le drawer)
  document.addEventListener("cart:update", function () {
    updateCartCount();
  });

  /* ============================
   * INITIALISATION
   * ============================ */
  // Masquer le bouton retour au démarrage
  if (backButton) backButton.style.display = "none";

  // Initialiser le compteur panier
  updateCartCount();

  // Masquer le compteur si vide
  if (cartCountEl) cartCountEl.style.display = "none";

  // Faire disparaître le loader overlay après un court délai
  var loader = document.getElementById("rdc-borne-loader");
  if (loader) {
    setTimeout(function () {
      loader.style.opacity = "0";
      loader.style.pointerEvents = "none";
      setTimeout(function () {
        loader.remove();
      }, 600);
    }, 300);
  }
});
