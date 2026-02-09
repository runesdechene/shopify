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
    produitsData = JSON.parse(document.getElementById("borne-produits-data").textContent);
  } catch (e) { console.warn("Borne: pas de données produits", e); }
  try {
    illustrationsData = JSON.parse(document.getElementById("borne-illustrations-data").textContent);
  } catch (e) { console.warn("Borne: pas de données illustrations", e); }

  // Historique de navigation pour le bouton retour
  var navHistory = [];
  var currentScreen = "0";
  var browseMode = null; // "article" ou "illustration"
  var selectedCategory = null;
  var selectedIllustration = null;
  var selectedProduitMeta = null;

  // Panier local
  var cart = { items: [], total: 0 };

  /* ============================
   * ÉLÉMENTS DOM
   * ============================ */
  var screens = borneEl.querySelectorAll(".rdc-borne__screen");
  var backButton = borneEl.querySelector('[data-action="back"]');
  var cartButton = borneEl.querySelector('[data-action="toggle-cart"]');
  var cartDrawer = borneEl.querySelector(".rdc-borne__cart-drawer");
  var cartItemsContainer = borneEl.querySelector(".rdc-borne__cart-items");
  var cartCountEl = borneEl.querySelector(".rdc-borne__cart-count");
  var cartTotalEl = borneEl.querySelector(".rdc-borne__cart-total-price");
  var checkoutButton = borneEl.querySelector('[data-action="checkout"]');
  var clearCartButton = borneEl.querySelector('[data-action="clear-cart"]');
  var confirmationPopup = document.getElementById("cart-confirmation-popup");
  var popupProductName = confirmationPopup ? confirmationPopup.querySelector(".rdc-borne__popup-product-name") : null;
  var bgDefault = borneEl.querySelector(".rdc-borne__bg-default");
  var bgDynamic = borneEl.querySelector(".rdc-borne__bg-dynamic");

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
        navigateToScreen("1a");
      } else if (browseMode === "illustration") {
        navigateToScreen("1b");
      }
    });
  });

  /* ============================
   * ÉCRAN 1a : CATÉGORIES
   * ============================ */
  var categoryCards = borneEl.querySelectorAll(".rdc-borne__category-card");
  categoryCards.forEach(function (card) {
    card.addEventListener("click", function () {
      selectedCategory = this.dataset.category;
      showProduitsForCategory(selectedCategory);
      navigateToScreen("2");
    });
  });

  function showProduitsForCategory(category) {
    var titleEl = borneEl.querySelector(".rdc-borne__products-title");
    if (titleEl) titleEl.textContent = category;

    // Masquer la description illustration
    var descEl = borneEl.querySelector(".rdc-borne__illustration-desc");
    if (descEl) descEl.style.display = "none";

    // Filtrer les cartes de produits métaobjets par catégorie
    var cards = borneEl.querySelectorAll(".rdc-borne__produit-card");
    cards.forEach(function (card) {
      var cardCat = card.dataset.categorie;
      card.style.display = (cardCat && cardCat.trim() === category.trim()) ? "" : "none";
    });
  }

  /* ============================
   * ÉCRAN 1b : ILLUSTRATIONS
   * ============================ */
  var illustrationCards = borneEl.querySelectorAll(".rdc-borne__illustration-card");
  illustrationCards.forEach(function (card) {
    card.addEventListener("click", function () {
      var handle = this.dataset.illustrationHandle;
      var bgImage = this.dataset.bgImage;

      selectedIllustration = illustrationsData.find(function (i) { return i.handle === handle; });

      // Changer le fond
      if (bgImage) {
        setDynamicBackground(bgImage);
      }

      // Afficher les produits de la collection liée à l'illustration
      if (selectedIllustration && selectedIllustration.collection_handle) {
        showProductsForCollection(selectedIllustration.collection_handle, selectedIllustration.nom);

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

      selectedProduitMeta = produitsData.find(function (p) { return p.handle === handle; });

      if (collectionHandle) {
        var title = selectedProduitMeta ? (selectedProduitMeta.label || selectedProduitMeta.nom) : "";
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

    var allGrids = borneEl.querySelectorAll(".rdc-borne__shopify-products");
    allGrids.forEach(function (grid) {
      grid.style.display = grid.dataset.collection === collectionHandle ? "" : "none";
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
    allDetails.forEach(function (d) { d.style.display = "none"; });

    var detail = borneEl.querySelector('.rdc-borne__product-detail[data-product-handle="' + productHandle + '"]');
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

    var firstColor = detail.querySelector(".rdc-borne__swatch--color:not(.sold-out)");
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
   * AJOUT AU PANIER
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
        "X-Requested-With": "XMLHttpRequest"
      },
      body: JSON.stringify({ id: variantId, quantity: 1 })
    })
    .then(function (response) { return response.json(); })
    .then(function (data) {
      addBtn.disabled = false;
      addBtn.textContent = "Ajouter au panier";

      // Mettre à jour le panier local
      initCart();

      // Afficher le popup de confirmation
      var detail = addBtn.closest(".rdc-borne__product-detail");
      var productTitle = "";
      if (detail) {
        var titleEl = detail.querySelector(".rdc-borne__detail-product-title");
        if (titleEl) productTitle = titleEl.textContent;
      }
      showConfirmationPopup(productTitle);
    })
    .catch(function (error) {
      console.error("Erreur ajout au panier:", error);
      addBtn.disabled = false;
      addBtn.textContent = "Ajouter au panier";
    });
  });

  /* ============================
   * PANIER — Initialisation et mise à jour
   * ============================ */
  function initCart() {
    fetch("/cart.js", {
      headers: { "X-Requested-With": "XMLHttpRequest" }
    })
    .then(function (response) { return response.json(); })
    .then(function (data) {
      cart.items = data.items || [];
      cart.total = data.total_price || 0;
      updateCartUI();
    })
    .catch(function (error) {
      console.error("Erreur récupération panier:", error);
    });
  }

  function updateCartUI() {
    // Compteur
    var totalItems = 0;
    cart.items.forEach(function (item) { totalItems += item.quantity; });
    if (cartCountEl) {
      cartCountEl.textContent = totalItems;
      cartCountEl.style.display = totalItems > 0 ? "" : "none";
    }

    // Total
    if (cartTotalEl) {
      cartTotalEl.textContent = formatPrice(cart.total / 100);
    }

    // Items
    renderCartItems();
  }

  function renderCartItems() {
    if (!cartItemsContainer) return;
    cartItemsContainer.innerHTML = "";

    if (cart.items.length === 0) {
      cartItemsContainer.innerHTML = '<div class="rdc-borne__cart-empty"><p>Votre panier est vide</p></div>';
      return;
    }

    cart.items.forEach(function (item) {
      var itemEl = document.createElement("div");
      itemEl.className = "rdc-borne__cart-item";
      itemEl.innerHTML =
        '<div class="rdc-borne__cart-item-img">' +
          '<img src="' + (item.image ? item.image.replace(/(\.[^.]+)$/, '_100x$1') : '') + '" alt="' + item.title + '">' +
        '</div>' +
        '<div class="rdc-borne__cart-item-info">' +
          '<h4 class="rdc-borne__cart-item-title">' + item.title + '</h4>' +
          '<p class="rdc-borne__cart-item-variant">' + item.variant_title + '</p>' +
          '<p class="rdc-borne__cart-item-price">' + formatPrice(item.price / 100) + '</p>' +
        '</div>' +
        '<div class="rdc-borne__cart-item-actions">' +
          '<div class="rdc-borne__cart-item-qty">' +
            '<button class="rdc-borne__qty-btn" data-action="decrease-qty" data-variant-id="' + item.id + '">-</button>' +
            '<span>' + item.quantity + '</span>' +
            '<button class="rdc-borne__qty-btn" data-action="increase-qty" data-variant-id="' + item.id + '">+</button>' +
          '</div>' +
          '<button class="rdc-borne__cart-item-remove" data-action="remove-item" data-variant-id="' + item.id + '">' +
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>' +
          '</button>' +
        '</div>';
      cartItemsContainer.appendChild(itemEl);
    });
  }

  /* ============================
   * PANIER — Actions (quantité, suppression, vidage)
   * ============================ */
  // Délégation d'événement pour les actions du panier
  if (cartDrawer) {
    cartDrawer.addEventListener("click", function (e) {
      var target = e.target.closest("[data-action]");
      if (!target) return;

      var action = target.dataset.action;
      var variantId = target.dataset.variantId;

      if (action === "decrease-qty" && variantId) {
        updateItemQuantity(variantId, -1);
      } else if (action === "increase-qty" && variantId) {
        updateItemQuantity(variantId, 1);
      } else if (action === "remove-item" && variantId) {
        removeItemFromCart(variantId);
      }
    });
  }

  function updateItemQuantity(variantId, change) {
    var itemIndex = -1;
    for (var i = 0; i < cart.items.length; i++) {
      if (String(cart.items[i].id) === String(variantId)) {
        itemIndex = i;
        break;
      }
    }
    if (itemIndex === -1) return;

    var newQuantity = cart.items[itemIndex].quantity + change;
    if (newQuantity <= 0) {
      removeItemFromCart(variantId);
      return;
    }

    fetch("/cart/change.js", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Requested-With": "XMLHttpRequest" },
      body: JSON.stringify({ id: variantId, quantity: newQuantity })
    })
    .then(function (r) { return r.json(); })
    .then(function () { initCart(); })
    .catch(function (err) { console.error("Erreur mise à jour quantité:", err); });
  }

  function removeItemFromCart(variantId) {
    fetch("/cart/change.js", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Requested-With": "XMLHttpRequest" },
      body: JSON.stringify({ id: variantId, quantity: 0 })
    })
    .then(function (r) { return r.json(); })
    .then(function () { initCart(); })
    .catch(function (err) { console.error("Erreur suppression article:", err); });
  }

  function clearCart() {
    fetch("/cart/clear.js", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Requested-With": "XMLHttpRequest" }
    })
    .then(function (r) { return r.json(); })
    .then(function () {
      cart.items = [];
      cart.total = 0;
      updateCartUI();
      toggleCartDrawer(true);
      setTimeout(function () { navigateToScreen("0", false); navHistory.length = 0; resetBackground(); }, 800);
    })
    .catch(function (err) { console.error("Erreur vidage panier:", err); });
  }

  /* ============================
   * PANIER — Drawer toggle
   * ============================ */
  function toggleCartDrawer(forceClose) {
    if (!cartDrawer) return;
    var isOpen = cartDrawer.dataset.open === "true";

    if (forceClose) {
      cartDrawer.dataset.open = "false";
      document.removeEventListener("click", handleOutsideClick);
      return;
    }

    cartDrawer.dataset.open = isOpen ? "false" : "true";

    if (!isOpen) {
      setTimeout(function () {
        document.addEventListener("click", handleOutsideClick);
      }, 0);
    } else {
      document.removeEventListener("click", handleOutsideClick);
    }
  }

  function handleOutsideClick(event) {
    if (
      !event.target.closest(".rdc-borne__cart-drawer") &&
      !event.target.closest('[data-action="toggle-cart"]')
    ) {
      toggleCartDrawer(true);
    }
  }

  /* ============================
   * POPUP CONFIRMATION
   * ============================ */
  function showConfirmationPopup(productTitle) {
    if (!confirmationPopup) return;
    if (popupProductName) popupProductName.textContent = productTitle;
    confirmationPopup.dataset.visible = "true";
  }

  function hideConfirmationPopup() {
    if (!confirmationPopup) return;
    confirmationPopup.dataset.visible = "false";
  }

  // Boutons du popup
  if (confirmationPopup) {
    confirmationPopup.addEventListener("click", function (e) {
      var target = e.target.closest("[data-action]");
      if (!target) return;

      var action = target.dataset.action;
      if (action === "continue-shopping") {
        hideConfirmationPopup();
        navigateToScreen("0", false);
        navHistory.length = 0;
        resetBackground();
      } else if (action === "view-cart") {
        hideConfirmationPopup();
        toggleCartDrawer();
      }
    });
  }

  /* ============================
   * ÉVÉNEMENTS GLOBAUX
   * ============================ */
  // Bouton retour
  if (backButton) {
    backButton.addEventListener("click", goBack);
  }

  // Boutons panier (toggle)
  borneEl.querySelectorAll('[data-action="toggle-cart"]').forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      toggleCartDrawer();
    });
  });

  // Bouton checkout
  if (checkoutButton) {
    checkoutButton.addEventListener("click", function () {
      window.location.href = "/checkout";
    });
  }

  // Bouton vider le panier
  if (clearCartButton) {
    clearCartButton.addEventListener("click", function () {
      clearCart();
    });
  }

  /* ============================
   * UTILITAIRES
   * ============================ */
  function formatPrice(price) {
    return price.toFixed(2).replace(".", ",") + " \u20AC";
  }

  /* ============================
   * INITIALISATION
   * ============================ */
  // Masquer le bouton retour au démarrage
  if (backButton) backButton.style.display = "none";

  // Initialiser le panier
  initCart();

  // Masquer le compteur si vide
  if (cartCountEl) cartCountEl.style.display = "none";
});
