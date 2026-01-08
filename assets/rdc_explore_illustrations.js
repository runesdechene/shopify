/**
 * RDC FRAGMENTS D'HISTOIRE
 * Carrousel horizontal scrollable pour blog
 * Phase 1: Système avec cadres de couleur
 * Phase 2: Connexion aux articles du blog
 */

class FragmentsCarousel {
  constructor(section) {
    this.section = section;
    this.sectionId = section.dataset.sectionId;
    this.carousel = section.querySelector(".fragments-carousel");
    this.cards = Array.from(this.carousel.querySelectorAll(".fragment-card"));
    this.totalCards = this.cards.length;
    this.currentIndex = 0;
    this.targetIndex = null;
    this.scrollTimeout = null;
    this.isHoveringButton = false;
    this.indicatorsContainer = section.querySelector(".fragments-indicators");
    this.prevBtn = section.querySelector(".carousel-nav-prev");
    this.nextBtn = section.querySelector(".carousel-nav-next");
    this.searchInput = section.querySelector(".fragments-search-input");
    this.filters = Array.from(section.querySelectorAll(".fragments-filter"));
    this.excerptElement = section.querySelector(".fragments-excerpt");

    this.currentIndex = 0;
    this.totalCards = this.cards.length;
    this.scrollTimeout = null;
    this.targetIndex = null; // Carte ciblée lors d'un clic

    // Générer les indicateurs dynamiquement
    this.generateIndicators();
    this.indicators = Array.from(section.querySelectorAll(".indicator"));

    this.init();
  }

  /**
   * Obtenir les cartes visibles (non cachées)
   */
  getVisibleCards() {
    return this.cards.filter((card) => !card.classList.contains("hidden"));
  }

  /**
   * Génère les indicateurs dynamiquement en fonction du nombre de cartes visibles
   */
  generateIndicators() {
    if (!this.indicatorsContainer) return;

    this.indicatorsContainer.innerHTML = "";

    const visibleCards = this.getVisibleCards();

    visibleCards.forEach((card, visibleIndex) => {
      const actualIndex = this.cards.indexOf(card);
      const indicator = document.createElement("button");
      indicator.className =
        visibleIndex === 0 ? "indicator active" : "indicator";
      indicator.dataset.slide = actualIndex;
      this.indicatorsContainer.appendChild(indicator);
    });
  }

  /**
   * Calculer et définir la hauteur du header comme variable CSS
   */
  setHeaderHeight() {
    const hero = this.section.querySelector(".fragments-hero");
    if (hero) {
      const heroHeight = hero.offsetHeight;
      this.section.style.setProperty("--header-height", `${heroHeight}px`);
      console.log("📏 Header height set to:", heroHeight + "px");
    }
  }

  /**
   * Mélanger les cartes de manière aléatoire
   */
  shuffleCards() {
    // Créer un tableau avec les cartes et leurs index
    const cardsArray = Array.from(this.cards);

    // Algorithme de Fisher-Yates pour mélanger
    for (let i = cardsArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cardsArray[i], cardsArray[j]] = [cardsArray[j], cardsArray[i]];
    }

    // Réorganiser les cartes dans le DOM
    cardsArray.forEach((card) => {
      this.carousel.appendChild(card);
    });

    // Mettre à jour la référence des cartes
    this.cards = Array.from(this.carousel.querySelectorAll(".fragment-card"));

    console.log("🔀 Cartes mélangées aléatoirement");
  }

  init() {
    console.log("🚀 INIT CALLED - Starting initialization");
    console.log(
      "🎨 Fragments Carousel initialized with",
      this.totalCards,
      "cards"
    );
    console.log("📦 Carousel element:", this.carousel);
    console.log("🎯 Section:", this.section);

    // Calculer la hauteur du header et la définir comme variable CSS
    this.setHeaderHeight();

    // Mélanger les cartes au chargement
    this.shuffleCards();

    // Mettre à jour le placeholder de recherche avec le nombre de cartes
    this.updateSearchPlaceholder();

    // Détecter la carte centrale au scroll
    this.setupScrollDetection();

    // Événements de navigation
    this.setupNavigation();

    // Événements des indicateurs
    this.setupIndicators();

    // Événements des filtres
    this.setupFilters();

    // Événement de recherche
    this.setupSearch();

    // Clics sur les cartes
    this.setupCardClicks();

    // Empêcher propagation des boutons d'action
    this.setupActionButtons();

    // Support clavier
    this.setupKeyboardNavigation();

    // Toggle thème sombre
    this.setupThemeToggle();

    // Centrer la carte du milieu au chargement
    setTimeout(() => {
      const middleIndex = Math.floor(this.totalCards / 2);
      this.scrollToCard(middleIndex);
    }, 100);
  }

  /**
   * Met à jour le placeholder de recherche avec le nombre de cartes
   */
  updateSearchPlaceholder() {
    if (!this.searchInput) return;

    this.searchInput.placeholder = `Rechercher parmi les ${this.totalCards} fragments...`;
  }

  /**
   * Détection de la carte centrale au scroll
   */
  setupScrollDetection() {
    let scrolling = false;
    this.carousel.addEventListener("scroll", () => {
      // Limiter les appels avec requestAnimationFrame
      if (!scrolling) {
        scrolling = true;
        requestAnimationFrame(() => {
          this.updateCenterCard();
          scrolling = false;
        });
      }

      // Après le scroll, réinitialiser la cible
      clearTimeout(this.scrollTimeout);
      this.scrollTimeout = setTimeout(() => {
        this.targetIndex = null;
        this.updateCenterCard();
      }, 150);
    });
  }

  /**
   * Obtenir l'index de la prochaine carte visible
   */
  getNextVisibleIndex(currentIndex) {
    const visibleCards = this.getVisibleCards();
    if (visibleCards.length === 0) return currentIndex;

    // Trouver la position actuelle dans les cartes visibles
    let currentVisibleIndex = -1;
    for (let i = 0; i < visibleCards.length; i++) {
      if (this.cards.indexOf(visibleCards[i]) === currentIndex) {
        currentVisibleIndex = i;
        break;
      }
    }

    // Si la carte actuelle n'est pas visible, trouver la première carte visible après currentIndex
    if (currentVisibleIndex === -1) {
      for (let i = 0; i < visibleCards.length; i++) {
        const visibleCardIndex = this.cards.indexOf(visibleCards[i]);
        if (visibleCardIndex > currentIndex) {
          return visibleCardIndex;
        }
      }
      // Si aucune carte après, retourner la première carte visible
      return this.cards.indexOf(visibleCards[0]);
    }

    // Prochaine carte visible (avec boucle)
    const nextVisibleIndex = (currentVisibleIndex + 1) % visibleCards.length;
    return this.cards.indexOf(visibleCards[nextVisibleIndex]);
  }

  /**
   * Obtenir l'index de la carte visible précédente
   */
  getPrevVisibleIndex(currentIndex) {
    const visibleCards = this.getVisibleCards();
    if (visibleCards.length === 0) return currentIndex;

    // Trouver la position actuelle dans les cartes visibles
    let currentVisibleIndex = -1;
    for (let i = 0; i < visibleCards.length; i++) {
      if (this.cards.indexOf(visibleCards[i]) === currentIndex) {
        currentVisibleIndex = i;
        break;
      }
    }

    // Si la carte actuelle n'est pas visible, trouver la première carte visible avant currentIndex
    if (currentVisibleIndex === -1) {
      for (let i = visibleCards.length - 1; i >= 0; i--) {
        const visibleCardIndex = this.cards.indexOf(visibleCards[i]);
        if (visibleCardIndex < currentIndex) {
          return visibleCardIndex;
        }
      }
      // Si aucune carte avant, retourner la dernière carte visible
      return this.cards.indexOf(visibleCards[visibleCards.length - 1]);
    }

    // Carte visible précédente (avec boucle)
    const prevVisibleIndex =
      (currentVisibleIndex - 1 + visibleCards.length) % visibleCards.length;
    return this.cards.indexOf(visibleCards[prevVisibleIndex]);
  }

  /**
   * Met à jour quelle carte est au centre
   */
  updateCenterCard() {
    // Ne pas mettre à jour si on survole un bouton
    if (this.isHoveringButton) {
      return;
    }

    // Si on a une carte ciblée (clic/navigation), utiliser celle-ci
    if (this.targetIndex !== null) {
      this.currentIndex = this.targetIndex;
    } else {
      // Calculer l'index basé sur la position de scroll
      // Mais seulement parmi les cartes visibles
      const scrollLeft = this.carousel.scrollLeft;
      const viewportWidth = window.innerWidth;
      const visibleCards = this.getVisibleCards();

      if (visibleCards.length > 0) {
        // Trouver quelle carte visible est la plus proche du centre
        // En calculant la position basée sur l'index visible (pas l'index global)
        let closestIndex = 0;
        let minDistance = Infinity;

        visibleCards.forEach((card, visibleIndex) => {
          const cardIndex = this.cards.indexOf(card);
          const cardLeft = visibleIndex * viewportWidth;
          const distance = Math.abs(scrollLeft - cardLeft);

          if (distance < minDistance) {
            minDistance = distance;
            closestIndex = cardIndex;
          }
        });

        this.currentIndex = closestIndex;
      }
    }

    // Mettre à jour les classes is-center
    this.cards.forEach((card, index) => {
      if (index === this.currentIndex) {
        card.classList.add("is-center");
      } else {
        card.classList.remove("is-center");
      }
    });

    // Mettre à jour les indicateurs et l'extrait
    this.updateIndicators();
    if (this.excerptElement) {
      this.updateExcerpt(this.currentIndex);
    }
  }

  /**
   * Navigation vers la carte suivante (avec boucle)
   */
  next() {
    // Obtenir la prochaine carte visible
    const nextIndex = this.getNextVisibleIndex(this.currentIndex);

    // Définir la cible et appliquer l'animation immédiatement
    this.targetIndex = nextIndex;
    this.cards.forEach((card, index) => {
      if (index === nextIndex) {
        card.classList.add("is-center");
      } else {
        card.classList.remove("is-center");
      }
    });

    this.scrollToCard(nextIndex);
  }

  /**
   * Navigation vers la carte précédente (avec boucle)
   */
  prev() {
    // Obtenir la carte visible précédente
    const prevIndex = this.getPrevVisibleIndex(this.currentIndex);

    // Définir la cible et appliquer l'animation immédiatement
    this.targetIndex = prevIndex;
    this.cards.forEach((card, index) => {
      if (index === prevIndex) {
        card.classList.add("is-center");
      } else {
        card.classList.remove("is-center");
      }
    });

    this.scrollToCard(prevIndex);
  }

  /**
   * Scroll vers une carte spécifique
   */
  scrollToCard(index) {
    if (index < 0 || index >= this.totalCards) return;

    const card = this.cards[index];
    if (!card || card.classList.contains("hidden")) return;

    // Trouver l'index visible de cette carte (en comptant seulement les cartes non cachées)
    const visibleCards = this.getVisibleCards();
    const visibleIndex = visibleCards.indexOf(card);

    if (visibleIndex === -1) return;

    // Calculer la position de scroll basée sur l'index visible
    const targetScroll = visibleIndex * window.innerWidth;

    this.carousel.scrollTo({
      left: targetScroll,
      behavior: "smooth",
    });
  }

  /**
   * Configuration de la navigation
   */
  setupNavigation() {
    console.log(
      "🔍 Setup navigation - prevBtn:",
      this.prevBtn,
      "nextBtn:",
      this.nextBtn
    );

    if (this.prevBtn) {
      this.prevBtn.addEventListener("click", () => {
        console.log(
          "⬅️ Prev button clicked, current index:",
          this.currentIndex
        );
        this.prev();
      });
    } else {
      console.warn("⚠️ Prev button not found");
    }

    if (this.nextBtn) {
      this.nextBtn.addEventListener("click", () => {
        console.log(
          "➡️ Next button clicked, current index:",
          this.currentIndex
        );
        this.next();
      });
    } else {
      console.warn("⚠️ Next button not found");
    }
  }

  /**
   * Configuration des indicateurs
   */
  setupIndicators() {
    this.indicators.forEach((indicator, visibleIndex) => {
      indicator.addEventListener("click", () => {
        const visibleCards = this.getVisibleCards();

        // Convertir l'index visible en index global
        const targetCard = visibleCards[visibleIndex];
        const globalIndex = this.cards.indexOf(targetCard);

        if (globalIndex === -1) return;

        // Définir la cible et appliquer l'animation immédiatement
        this.targetIndex = globalIndex;
        this.cards.forEach((card, cardIndex) => {
          if (cardIndex === globalIndex) {
            card.classList.add("is-center");
          } else {
            card.classList.remove("is-center");
          }
        });

        this.scrollToCard(globalIndex);
      });
    });
  }

  /**
   * Met à jour le compteur de cartes
   */
  updateIndicators() {
    const counterElement = this.section.querySelector(".counter-current");
    const totalElement = this.section.querySelector(".counter-total");

    if (counterElement) {
      const visibleCards = this.getVisibleCards();
      const currentCard = this.cards[this.currentIndex];
      const visibleIndex = visibleCards.indexOf(currentCard);

      // Si la carte actuelle est visible, mettre à jour le numéro
      if (visibleIndex !== -1) {
        counterElement.textContent = visibleIndex + 1;
      }
      // Sinon, garder le numéro actuel affiché

      // Mettre à jour le total avec le nombre de cartes visibles
      if (totalElement) {
        totalElement.textContent = visibleCards.length;
      }
    }
  }

  /**
   * Met à jour l'extrait avec un effet de fade
   */
  updateExcerpt(cardIndex) {
    if (!this.excerptElement) return;

    const card = this.cards[cardIndex];
    if (!card) return;

    const newExcerpt =
      card.dataset.excerpt ||
      "Sélectionnez un fragment pour découvrir son histoire...";

    // Si le texte est le même, ne rien faire
    if (this.excerptElement.textContent === newExcerpt) return;

    // Fade out
    this.excerptElement.classList.add("fade-out");

    // Changer le texte après le fade out
    setTimeout(() => {
      this.excerptElement.textContent = newExcerpt;
      // Fade in
      this.excerptElement.classList.remove("fade-out");
    }, 300);
  }

  /**
   * Configuration des filtres
   */
  setupFilters() {
    this.filters.forEach((filter) => {
      filter.addEventListener("click", (e) => {
        // Retirer la classe active de tous les filtres
        this.filters.forEach((f) => f.classList.remove("active"));

        // Ajouter la classe active au filtre cliqué
        e.target.classList.add("active");

        const filterValue = e.target.dataset.filter;
        const filterType = e.target.dataset.filterType;
        console.log("🔍 Filter selected:", filterValue, "Type:", filterType);

        this.filterCards(filterValue, filterType);
      });
    });
  }

  /**
   * Filtrer les cartes par tag ou par date
   */
  filterCards(filterValue, filterType) {
    console.log("🏷️ Filtering by:", filterValue, "Type:", filterType);

    let visibleCount = 0;
    let firstVisibleIndex = -1;

    if (filterValue === "all") {
      // Réafficher toutes les cartes
      this.cards.forEach((card, index) => {
        card.classList.remove("hidden");
        card.style.display = "";
        if (firstVisibleIndex === -1) firstVisibleIndex = index;
        visibleCount++;
      });
    } else if (filterType === "date" && filterValue === "recent") {
      // Filtrer par date (articles de moins de 60 jours)
      const now = Math.floor(Date.now() / 1000);
      const sixtyDaysAgo = now - 60 * 24 * 60 * 60;

      this.cards.forEach((card, index) => {
        const publishedAt = parseInt(card.dataset.publishedAt || "0");
        const isRecent = publishedAt >= sixtyDaysAgo;

        if (isRecent) {
          card.classList.remove("hidden");
          card.style.display = "";
          if (firstVisibleIndex === -1) firstVisibleIndex = index;
          visibleCount++;
        } else {
          card.classList.add("hidden");
          // Retirer du DOM après l'animation complète (opacity + width)
          setTimeout(() => {
            if (card.classList.contains("hidden")) {
              card.style.display = "none";
            }
          }, 500);
        }
      });
    } else {
      // Filtrer par tag
      this.cards.forEach((card, index) => {
        const tags = card.dataset.tags || "";
        const tagsArray = tags
          .split(",")
          .map((tag) => this.handleize(tag.trim()));
        const match = tagsArray.includes(filterValue.toLowerCase());

        if (match) {
          card.classList.remove("hidden");
          card.style.display = "";
          if (firstVisibleIndex === -1) firstVisibleIndex = index;
          visibleCount++;
        } else {
          card.classList.add("hidden");
          // Retirer du DOM après l'animation complète (opacity + width)
          setTimeout(() => {
            if (card.classList.contains("hidden")) {
              card.style.display = "none";
            }
          }, 500);
        }
      });
    }

    console.log(`✅ ${visibleCount} carte(s) affichée(s)`);

    // Régénérer les indicateurs pour ne montrer que les cartes visibles
    this.generateIndicators();
    this.indicators = Array.from(this.section.querySelectorAll(".indicator"));
    this.setupIndicators();

    // Si la carte actuelle est cachée, scroller vers la première carte visible
    const currentCard = this.cards[this.currentIndex];
    if (
      currentCard &&
      currentCard.classList.contains("hidden") &&
      firstVisibleIndex !== -1
    ) {
      console.log(
        "➡️ Current card hidden, scrolling to first visible card:",
        firstVisibleIndex
      );
      setTimeout(() => {
        this.targetIndex = firstVisibleIndex;
        this.cards.forEach((card, index) => {
          if (index === firstVisibleIndex) {
            card.classList.add("is-center");
          } else {
            card.classList.remove("is-center");
          }
        });
        this.scrollToCard(firstVisibleIndex);
      }, 350);
    } else {
      // Sinon, juste mettre à jour la carte centrale après l'animation
      setTimeout(() => {
        this.updateCenterCard();
      }, 350);
    }
  }

  /**
   * Normaliser un tag (similaire au filtre handleize de Shopify)
   */
  handleize(str) {
    return str
      .toLowerCase()
      .replace(/[àáâãäå]/g, "a")
      .replace(/[èéêë]/g, "e")
      .replace(/[ìíîï]/g, "i")
      .replace(/[òóôõö]/g, "o")
      .replace(/[ùúûü]/g, "u")
      .replace(/[ç]/g, "c")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  /**
   * Configuration de la recherche
   */
  setupSearch() {
    if (!this.searchInput) return;

    let searchTimeout;
    this.searchInput.addEventListener("input", (e) => {
      clearTimeout(searchTimeout);

      searchTimeout = setTimeout(() => {
        const query = e.target.value.toLowerCase().trim();
        console.log("🔎 Search query:", query);

        this.searchCards(query);
      }, 300);
    });
  }

  /**
   * Rechercher dans les cartes
   */
  searchCards(query) {
    let visibleCount = 0;
    let firstVisibleIndex = -1;

    this.cards.forEach((card, index) => {
      // Récupérer le titre de la carte
      const titleElement = card.querySelector(".fragment-card-title");
      const title = titleElement ? titleElement.textContent.toLowerCase() : "";

      // Vérifier si le titre contient le terme de recherche
      const match = !query || title.includes(query);

      if (match) {
        card.classList.remove("hidden");
        card.style.display = "";
        if (firstVisibleIndex === -1) firstVisibleIndex = index;
        visibleCount++;
      } else {
        card.classList.add("hidden");
        // Retirer du DOM après l'animation complète (opacity + width)
        setTimeout(() => {
          if (card.classList.contains("hidden")) {
            card.style.display = "none";
          }
        }, 500);
      }
    });

    console.log(`✅ ${visibleCount} carte(s) trouvée(s)`);

    // Régénérer les indicateurs pour ne montrer que les cartes visibles
    this.generateIndicators();
    this.indicators = Array.from(this.section.querySelectorAll(".indicator"));
    this.setupIndicators();

    // Si la carte actuelle est cachée, scroller vers la première carte visible
    const currentCard = this.cards[this.currentIndex];
    if (
      currentCard &&
      currentCard.classList.contains("hidden") &&
      firstVisibleIndex !== -1
    ) {
      console.log(
        "➡️ Current card hidden, scrolling to first visible card:",
        firstVisibleIndex
      );
      setTimeout(() => {
        this.targetIndex = firstVisibleIndex;
        this.cards.forEach((card, index) => {
          if (index === firstVisibleIndex) {
            card.classList.add("is-center");
          } else {
            card.classList.remove("is-center");
          }
        });
        this.scrollToCard(firstVisibleIndex);
      }, 350);
    } else {
      // Sinon, juste mettre à jour la carte centrale après l'animation
      setTimeout(() => {
        this.updateCenterCard();
      }, 350);
    }
  }

  /**
   * Configuration des clics sur les cartes
   */
  setupCardClicks() {
    this.cards.forEach((card, index) => {
      card.addEventListener("click", () => {
        const isCentered = card.classList.contains("is-center");

        if (isCentered) {
          // Ouvrir l'article
          const articleUrl = card.dataset.articleUrl;
          if (articleUrl) {
            console.log("✨ Opening article:", articleUrl);
            window.location.href = articleUrl;
          }
        } else {
          console.log("➡️ Scrolling to card", index);

          // Définir cette carte comme cible
          this.targetIndex = index;

          // Appliquer immédiatement la classe is-center pour démarrer l'animation
          this.cards.forEach((c) => c.classList.remove("is-center"));
          card.classList.add("is-center");

          // Puis scroller vers la carte
          this.scrollToCard(index);
        }
      });
    });
  }

  /**
   * Navigation au clavier
   */
  setupKeyboardNavigation() {
    document.addEventListener("keydown", (e) => {
      // Vérifier si on est dans la section
      const rect = this.section.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;

      if (!inView) return;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        this.prev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        this.next();
      }
    });
  }

  /**
   * Empêcher la propagation des clics sur les boutons d'action
   */
  setupActionButtons() {
    // Empêcher la propagation sur les boutons
    const actionButtons = this.section.querySelectorAll(".fragment-action-btn");
    actionButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
      });
      btn.addEventListener("mousedown", (e) => {
        e.stopPropagation();
      });
      btn.addEventListener("mouseup", (e) => {
        e.stopPropagation();
      });
      btn.addEventListener("mouseenter", () => {
        this.isHoveringButton = true;
      });
      btn.addEventListener("mouseleave", () => {
        this.isHoveringButton = false;
      });
    });

    // Empêcher la propagation sur le conteneur des boutons
    const actionContainers = this.section.querySelectorAll(
      ".fragment-card-actions"
    );
    actionContainers.forEach((container) => {
      container.addEventListener("click", (e) => {
        e.stopPropagation();
      });
      container.addEventListener("mousedown", (e) => {
        e.stopPropagation();
      });
      container.addEventListener("mouseup", (e) => {
        e.stopPropagation();
      });
    });
  }

  /**
   * Configuration du toggle thème sombre
   */
  setupThemeToggle() {
    const toggleBtn = this.section.querySelector(".theme-toggle");
    if (!toggleBtn) return;

    // Charger le thème sauvegardé
    const savedTheme = localStorage.getItem("rdc-theme");
    if (savedTheme === "dark") {
      this.section.classList.add("dark-theme");
      toggleBtn.classList.add("active");
      this.updateImagesForTheme(true);
    }

    // Gérer le clic sur le toggle
    toggleBtn.addEventListener("click", () => {
      this.section.classList.toggle("dark-theme");
      toggleBtn.classList.toggle("active");

      const isDark = this.section.classList.contains("dark-theme");

      // Changer les images
      this.updateImagesForTheme(isDark);

      // Sauvegarder la préférence
      if (isDark) {
        localStorage.setItem("rdc-theme", "dark");
      } else {
        localStorage.setItem("rdc-theme", "light");
      }
    });
  }

  /**
   * Met à jour les images des cartes en fonction du thème
   */
  updateImagesForTheme(isDark) {
    this.cards.forEach((card) => {
      const img = card.querySelector(".fragment-image");
      if (!img) return;

      // Récupérer les URLs des deux images depuis les data attributes
      const lightImageUrl = img.dataset.lightImage;
      const darkImageUrl = img.dataset.darkImage;

      // Si on a les deux URLs, changer l'image
      if (lightImageUrl && darkImageUrl) {
        img.src = isDark ? darkImageUrl : lightImageUrl;
      }
    });
  }
}

// ============================================
// INITIALISATION
// ============================================

function initFragmentsCarousels() {
  const sections = document.querySelectorAll(".rdc-fragments-section");

  sections.forEach((section) => {
    // Éviter la double initialisation
    if (section.dataset.initialized) return;

    new FragmentsCarousel(section);
    section.dataset.initialized = "true";

    console.log("✅ Fragments carousel initialized");
  });
}

// Initialisation au chargement de la page
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initFragmentsCarousels);
} else {
  initFragmentsCarousels();
}

// Support pour l'éditeur de thème Shopify
if (typeof Shopify !== "undefined" && Shopify.designMode) {
  document.addEventListener("shopify:section:load", (event) => {
    const section = event.target.querySelector(".rdc-fragments-section");
    if (section && !section.dataset.initialized) {
      new FragmentsCarousel(section);
      section.dataset.initialized = "true";
    }
  });

  document.addEventListener("shopify:section:unload", (event) => {
    const section = event.target.querySelector(".rdc-fragments-section");
    if (section) {
      section.dataset.initialized = "";
    }
  });
}
