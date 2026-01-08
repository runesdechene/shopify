/**
 * Galerie Ressources functionality
 * Handles filtering, modal viewing, and video playback
 */

// Global modal management
let globalModal = null;

// Create a single modal for all sections
function createGlobalModal() {
  if (globalModal) return globalModal;
  
  const modal = document.createElement('div');
  modal.className = 'galerie-ressources__modal';
  
  const modalContent = document.createElement('div');
  modalContent.className = 'galerie-ressources__modal-content';
  
  const closeButton = document.createElement('button');
  closeButton.className = 'galerie-ressources__modal-close';
  closeButton.innerHTML = '&times;';
  closeButton.setAttribute('aria-label', 'Fermer');
  
  modalContent.appendChild(closeButton);
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
  
  // Close modal on button click
  closeButton.addEventListener('click', () => closeGlobalModal());
  
  // Close modal on background click
  modal.addEventListener('click', function(event) {
    if (event.target === modal) {
      closeGlobalModal();
    }
  });
  
  // Close modal on escape key
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
      closeGlobalModal();
    }
  });
  
  globalModal = modal;
  return modal;
}

// Open global modal with content
function openGlobalModal(content) {
  const modal = createGlobalModal();
  const modalContent = modal.querySelector('.galerie-ressources__modal-content');
  
  // Clear previous content (except close button)
  const closeButton = modalContent.querySelector('.galerie-ressources__modal-close');
  modalContent.innerHTML = '';
  modalContent.appendChild(closeButton);
  
  // Add new content
  modalContent.appendChild(content);
  
  // Show modal
  modal.classList.add('active');
  
  // Prevent body scrolling
  document.body.style.overflow = 'hidden';
}

// Close global modal
function closeGlobalModal() {
  if (!globalModal) return;
  
  // Hide modal
  globalModal.classList.remove('active');
  
  // Allow body scrolling
  document.body.style.overflow = '';
  
  // Clear content after animation
  setTimeout(() => {
    const modalContent = globalModal.querySelector('.galerie-ressources__modal-content');
    const closeButton = modalContent.querySelector('.galerie-ressources__modal-close');
    modalContent.innerHTML = '';
    modalContent.appendChild(closeButton);
  }, 300);
}

function initGalerieRessources() {
  // DOM elements - Get all sections instead of just one
  const galerieSections = document.querySelectorAll('[data-galerie-ressources]');
  if (!galerieSections.length) return;
  
  // Create the global modal
  createGlobalModal();
  
  // Initialize each section separately
  galerieSections.forEach(galerieSection => {
    initSection(galerieSection);
  });
}

function initSection(galerieSection) {

  const items = galerieSection.querySelectorAll('.galerie-ressources__item');
  const videoWrappers = galerieSection.querySelectorAll('.galerie-ressources__video-wrapper');
  const viewImageButtons = galerieSection.querySelectorAll('[data-view-image]');
  const viewVideoButtons = galerieSection.querySelectorAll('[data-view-video]');
  
  // Initialize video previews
  initVideoPreviews();
  
  // Initialize view buttons
  initViewButtons();

  // Initialize category filtering
  initCategoryFilters();

  /**
   * Initialize video preview functionality
   */
  function initVideoPreviews() {
    videoWrappers.forEach(wrapper => {
      wrapper.addEventListener('click', function() {
        const videoUrl = this.getAttribute('data-video-url');
        
        if (!videoUrl) return;
        
        // Check if it's YouTube or Vimeo
        if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
          openYouTubeVideo(videoUrl);
        } else if (videoUrl.includes('vimeo.com')) {
          openVimeoVideo(videoUrl);
        } else {
          // Assume it's a direct video file
          openVideoFile(videoUrl);
        }
      });
    });
  }

  /**
   * Open YouTube video in modal
   */
  function openYouTubeVideo(url) {
    // Extract YouTube ID
    let videoId = '';
    
    if (url.includes('youtube.com/watch')) {
      videoId = new URL(url).searchParams.get('v');
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0];
    }
    
    if (!videoId) return;
    
    // Create iframe
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    iframe.width = '800';
    iframe.height = '450';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    iframe.classList.add('galerie-ressources__modal-video');
    
    // Open in global modal
    openGlobalModal(iframe);
  }

  /**
   * Open Vimeo video in modal
   */
  function openVimeoVideo(url) {
    // Extract Vimeo ID
    const vimeoId = url.split('vimeo.com/')[1].split('?')[0];
    
    if (!vimeoId) return;
    
    // Create iframe
    const iframe = document.createElement('iframe');
    iframe.src = `https://player.vimeo.com/video/${vimeoId}?autoplay=1`;
    iframe.width = '800';
    iframe.height = '450';
    iframe.allow = 'autoplay; fullscreen; picture-in-picture';
    iframe.allowFullscreen = true;
    iframe.classList.add('galerie-ressources__modal-video');
    
    // Open in global modal
    openGlobalModal(iframe);
  }

  /**
   * Open video file in modal
   */
  function openVideoFile(url) {
    // Create video element
    const video = document.createElement('video');
    video.src = url;
    video.controls = true;
    video.autoplay = true;
    video.classList.add('galerie-ressources__modal-video');
    
    // Open in global modal
    openGlobalModal(video);
  }

  // Modal functions removed - using global modal
  
  /**
   * Initialize category filters
   */
  function initCategoryFilters() {
    const filterButtons = galerieSection.querySelectorAll('.galerie-ressources__filter-btn');
    
    if (!filterButtons.length) return;
    
    filterButtons.forEach(button => {
      button.addEventListener('click', function() {
        // Remove active class from all buttons
        filterButtons.forEach(btn => btn.classList.remove('active'));
        
        // Add active class to clicked button
        this.classList.add('active');
        
        // Get filter value
        const filterValue = this.getAttribute('data-filter');
        
        // Filter items
        filterItems(filterValue);
      });
    });
  }
  
  /**
   * Filter items by category
   */
  function filterItems(category) {
    items.forEach(item => {
      if (category === 'all') {
        item.classList.remove('hidden');
        // Add animation
        item.style.animation = 'none';
        item.offsetHeight; // Trigger reflow
        item.style.animation = 'fadeIn 0.6s ease forwards';
      } else {
        const itemCategory = item.getAttribute('data-category');
        
        if (itemCategory === category) {
          item.classList.remove('hidden');
          // Add animation
          item.style.animation = 'none';
          item.offsetHeight; // Trigger reflow
          item.style.animation = 'fadeIn 0.6s ease forwards';
        } else {
          item.classList.add('hidden');
        }
      }
    });
  }
  
  /**
   * Initialize view buttons for images and videos
   */
  function initViewButtons() {
    // Handle image view buttons
    viewImageButtons.forEach(button => {
      button.addEventListener('click', function() {
        const imageUrl = this.getAttribute('data-view-image');
        if (!imageUrl) return;
        
        // Create image element
        const img = document.createElement('img');
        img.src = imageUrl;
        img.classList.add('galerie-ressources__modal-image');
        img.alt = this.closest('.galerie-ressources__item').querySelector('.galerie-ressources__item-title')?.textContent || 'Image';
        
        // Open in global modal
        openGlobalModal(img);
      });
    });
    
    // Handle video view buttons
    viewVideoButtons.forEach(button => {
      button.addEventListener('click', function() {
        const videoUrl = this.getAttribute('data-view-video');
        if (!videoUrl) return;
        
        // Check if it's YouTube or Vimeo
        if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
          openYouTubeVideo(videoUrl);
        } else if (videoUrl.includes('vimeo.com')) {
          openVimeoVideo(videoUrl);
        } else {
          // Assume it's a direct video file
          openVideoFile(videoUrl);
        }
      });
    });
  }
}
