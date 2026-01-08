/**
 * RDC BLOG POST - JavaScript
 * Gestion du bouton de partage
 */

(function() {
  'use strict';

  function init() {
    initShareButton();
    initProductsCarousel();
    initZoomModal();
  }

  function initShareButton() {
    const shareButton = document.querySelector('.share-button');
    
    if (!shareButton) return;

    shareButton.addEventListener('click', async function() {
      const url = this.dataset.url;
      const title = document.querySelector('.fragment-title')?.textContent || 'Fragment';
      
      // Vérifier si l'API Web Share est disponible (mobile)
      if (navigator.share) {
        try {
          await navigator.share({
            title: title,
            url: url
          });
        } catch (err) {
          if (err.name !== 'AbortError') {
            console.error('Erreur lors du partage:', err);
          }
        }
      } else {
        // Fallback: copier le lien dans le presse-papier
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(url);
          } else {
            // Fallback pour les navigateurs plus anciens
            const textArea = document.createElement('textarea');
            textArea.value = url;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
          }

          // Feedback visuel
          const originalText = this.textContent;
          this.textContent = 'Lien copié !';
          
          setTimeout(() => {
            this.textContent = originalText;
          }, 2000);

        } catch (err) {
          console.error('Erreur lors de la copie:', err);
          alert('Impossible de copier le lien.');
        }
      }
    });
  }

  // ============================================
  // ZOOM MODAL
  // ============================================

  function initZoomModal() {
    const zoomButton = document.querySelector('.zoom-button');
    const zoomModal = document.getElementById('zoom-modal');
    const zoomModalClose = document.querySelector('.zoom-modal-close');
    const zoomModalImage = document.getElementById('zoom-modal-image');
    
    if (!zoomButton || !zoomModal) return;
    
    // Ouvrir la modal
    zoomButton.addEventListener('click', () => {
      const imageUrl = zoomButton.dataset.imageUrl;
      zoomModalImage.src = imageUrl;
      zoomModal.classList.add('active');
      document.body.style.overflow = 'hidden'; // Bloquer le scroll
    });
    
    // Fermer la modal avec le bouton
    zoomModalClose.addEventListener('click', () => {
      zoomModal.classList.remove('active');
      document.body.style.overflow = ''; // Réactiver le scroll
    });
    
    // Fermer la modal en cliquant sur le fond
    zoomModal.addEventListener('click', (e) => {
      if (e.target === zoomModal) {
        zoomModal.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
    
    // Fermer la modal avec la touche Échap
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && zoomModal.classList.contains('active')) {
        zoomModal.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
    
    console.log('✅ Zoom modal initialized');
  }

  // ============================================
  // CARROUSEL DE PRODUITS
  // ============================================

  function initProductsCarousel() {
    const container = document.querySelector('.fragment-products');
    const prevBtn = document.querySelector('.products-nav-prev');
    const nextBtn = document.querySelector('.products-nav-next');
    
    if (!container || !prevBtn || !nextBtn) return;

    const products = container.querySelectorAll('.product-card');
    if (products.length <= 2) {
      // Masquer les flèches s'il y a 2 produits ou moins
      prevBtn.style.display = 'none';
      nextBtn.style.display = 'none';
      return;
    }

    // Fonction pour mettre à jour l'état des boutons
    function updateButtons() {
      const scrollLeft = container.scrollLeft;
      const maxScroll = container.scrollWidth - container.clientWidth;
      
      prevBtn.disabled = scrollLeft <= 0;
      nextBtn.disabled = scrollLeft >= maxScroll - 10;
    }

    // Fonction pour scroller de 2 produits
    function scrollByProducts(direction) {
      const productWidth = products[0].offsetWidth;
      const gap = 25; // 2.5rem en pixels (approximatif)
      const scrollAmount = (productWidth + gap) * 2;
      
      container.scrollBy({
        left: direction === 'next' ? scrollAmount : -scrollAmount,
        behavior: 'smooth'
      });
    }

    // Navigation précédent
    prevBtn.addEventListener('click', () => {
      scrollByProducts('prev');
    });

    // Navigation suivant
    nextBtn.addEventListener('click', () => {
      scrollByProducts('next');
    });

    // Mettre à jour les boutons au scroll
    container.addEventListener('scroll', updateButtons);
    
    // Initialiser l'état des boutons
    updateButtons();

    // Support du swipe tactile (optionnel, le navigateur le gère déjà)
    let startX = 0;
    let scrollLeftStart = 0;

    container.addEventListener('touchstart', (e) => {
      startX = e.touches[0].pageX;
      scrollLeftStart = container.scrollLeft;
    });

    container.addEventListener('touchmove', (e) => {
      const x = e.touches[0].pageX;
      const walk = (startX - x) * 1.5;
      container.scrollLeft = scrollLeftStart + walk;
    });
  }

  // Lancement au chargement de la page
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();