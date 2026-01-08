/**
 * Tableau Comparaison functionality
 * Handles responsive behavior and highlighting
 */

// Initialize the comparison table functionality
function initTableauComparaison() {
  const tableauComparaisonSections = document.querySelectorAll('[data-tableau-comparaison]');
  
  if (!tableauComparaisonSections.length) return;
  
  tableauComparaisonSections.forEach(section => {
    // Add responsive table indicators
    addResponsiveTableIndicators(section);
    
    // Add scroll indicators if table is scrollable
    addScrollIndicators(section);
    
    // Add highlight effects
    addHighlightEffects(section);
  });
}

// Add indicators to show table is scrollable on mobile
function addScrollIndicators(section) {
  const tableWrapper = section.querySelector('.tableau-comparaison__table-wrapper');
  const table = section.querySelector('.tableau-comparaison__table');
  
  if (!tableWrapper || !table) return;
  
  // Check if table is wider than its container
  function checkOverflow() {
    const isOverflowing = table.offsetWidth > tableWrapper.offsetWidth;
    
    if (isOverflowing && !tableWrapper.classList.contains('scrollable')) {
      tableWrapper.classList.add('scrollable');
      
      // Add scroll indicators if not already present
      if (!section.querySelector('.tableau-scroll-indicator')) {
        const scrollIndicator = document.createElement('div');
        scrollIndicator.className = 'tableau-scroll-indicator';
        scrollIndicator.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg><span>Faire défiler</span><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>';
        
        section.querySelector('.tableau-comparaison__container').appendChild(scrollIndicator);
        
        // Hide indicator after user has scrolled
        tableWrapper.addEventListener('scroll', function() {
          scrollIndicator.classList.add('fading');
          setTimeout(() => {
            scrollIndicator.classList.add('hidden');
          }, 500);
        }, { once: true });
      }
    } else if (!isOverflowing) {
      tableWrapper.classList.remove('scrollable');
      const indicator = section.querySelector('.tableau-scroll-indicator');
      if (indicator) indicator.classList.add('hidden');
    }
  }
  
  // Check on load and resize
  checkOverflow();
  window.addEventListener('resize', checkOverflow);
}

// Add responsive table indicators for small screens
function addResponsiveTableIndicators(section) {
  const cells = section.querySelectorAll('.tableau-comparaison__cell');
  const headerCells = section.querySelectorAll('.tableau-comparaison__header-cell:not(.tableau-comparaison__header-cell--empty)');
  
  cells.forEach((cell, index) => {
    // Find which column this cell belongs to
    const columnIndex = index % headerCells.length;
    const headerCell = headerCells[columnIndex];
    
    if (headerCell) {
      const columnTitle = headerCell.querySelector('.tableau-comparaison__column-title');
      
      if (columnTitle) {
        // Create a data attribute for responsive display
        cell.setAttribute('data-column', columnTitle.textContent.trim());
      }
    }
  });
}

// Add highlight effects for rows and columns
function addHighlightEffects(section) {
  const table = section.querySelector('.tableau-comparaison__table');
  const highlightedCells = section.querySelectorAll('.tableau-comparaison__cell--highlight');
  const highlightedHeaders = section.querySelectorAll('.tableau-comparaison__header-cell--highlight');
  
  // Add subtle animation to highlighted cells
  highlightedCells.forEach(cell => {
    // Add a subtle pulse effect
    cell.style.transition = 'all 0.5s ease';
    
    // Get the current background color and border color
    const currentBgColor = cell.style.backgroundColor;
    const currentBorderColor = cell.style.borderLeftColor;
    
    // Optional: Add hover effect
    cell.addEventListener('mouseenter', () => {
      // Store original background color if not already stored
      if (!cell.dataset.originalBg) {
        cell.dataset.originalBg = currentBgColor;
      }
      
      // Enhance the background color slightly
      cell.style.transform = 'translateY(-2px)';
      cell.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
    });
    
    cell.addEventListener('mouseleave', () => {
      // Restore original background color
      if (cell.dataset.originalBg) {
        cell.style.backgroundColor = cell.dataset.originalBg;
      }
      
      cell.style.transform = 'translateY(0)';
      cell.style.boxShadow = 'none';
    });
  });
  
  // Add subtle pulse animation to highlighted headers
  highlightedHeaders.forEach(header => {
    // Add transition
    header.style.transition = 'all 0.5s ease';
    
    // Add hover effect
    header.addEventListener('mouseenter', () => {
      header.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.2)';
    });
    
    header.addEventListener('mouseleave', () => {
      header.style.boxShadow = 'none';
    });
  });
}

// Initialize on DOM content loaded
document.addEventListener('DOMContentLoaded', function() {
  initTableauComparaison();
});

// Re-initialize when the Shopify section is reloaded
document.addEventListener('shopify:section:load', function(event) {
  if (event.target.querySelector('[data-tableau-comparaison]')) {
    initTableauComparaison();
  }
});
