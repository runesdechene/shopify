class UpsellAddOn extends HTMLElement {
    constructor() {
        super();
        this.variantImages = {};
    }
    
    connectedCallback() {
        this.init();
    }
  
    init() {
        this.querySelectorAll('.variant-select').forEach(select => {
            const productId = select.dataset.productId;
            const optionItem = select.closest('.option-item');
            const imageJson = optionItem.querySelector('.variant-images-json');
            
            if (imageJson) {
                try {
                    this.variantImages[productId] = JSON.parse(imageJson.textContent);
                } catch (e) {
                    console.error('Error parsing variant images JSON:', e);
                }
            }
            
            select.addEventListener('change', (e) => {
                this.updatePrice(e.target);
                this.updateImage(e.target);
            });
        });
    }
    
    updatePrice(selectElement) {
        const selectedOption = selectElement.options[selectElement.selectedIndex];
        const price = selectedOption.dataset.price;
        const comparePrice = selectedOption.dataset.comparePrice;
        const currencyFormat = window.theme.settings.money_with_currency_format || "${{amount}}";
        const optionItem = selectElement.closest('.option-item');
        const priceSpan = optionItem.querySelector('.option-price');
        
        if (price && priceSpan) {
            const formattedPrice = formatMoney(price, currencyFormat);
            let priceHTML = '';
            let hasSale = comparePrice && parseInt(comparePrice) > parseInt(price);
            
            if (hasSale) {
                const formattedComparePrice = formatMoney(comparePrice, currencyFormat);
                priceHTML = `<span class="price-current price-item price-item--sale price-item--last">${formattedPrice}</span>
                <s class="price-compare price--on-sale price-item--regular">${formattedComparePrice}</s>`;
                priceSpan.classList.add('price--on-sale');
            } else {
                priceHTML = `<span class="price-current price-item price-item--regular">${formattedPrice}</span>`;
                priceSpan.classList.remove('price--on-sale');
            }
            
            priceSpan.innerHTML = priceHTML;
            priceSpan.dataset.productPrice = price;
            priceSpan.dataset.productComparePrice = comparePrice || '';
        }
    }
  
    updateImage(selectElement) {
        const selectedOption = selectElement.options[selectElement.selectedIndex];
        const variantId = selectedOption.value;
        const productId = selectElement.dataset.productId;
        const optionItem = selectElement.closest('.option-item');
        
        if (this.variantImages[productId] && this.variantImages[productId][variantId]) {
            const imageData = this.variantImages[productId][variantId];
            
            const images = optionItem.querySelectorAll('.variant-image');
            images.forEach(img => {
                img.src = imageData.url;
                img.alt = imageData.alt;
                
                // Update srcset
                if (img.hasAttribute('srcset')) {
                    const srcset = imageData.url.replace(/\?.*$/, '');
                    img.srcset = `${srcset}?width=90 90w, ${srcset}?width=180 180w`;
                }
            });
        }
    }
  
    getSelectedProducts() {
        const selected = [];
        
        this.querySelectorAll('.option-checkbox:checked').forEach(checkbox => {
            const productId = checkbox.dataset.productId;
            const optionItem = checkbox.closest('.option-item');
            const variantSelect = optionItem.querySelector('.variant-select');
            let variantId;
            
            if (variantSelect) {
                variantId = variantSelect.value;
            } else {
                const hiddenInput = optionItem.querySelector('.selected-variant-id');
                variantId = hiddenInput ? hiddenInput.value : null;
            }
            
            if (variantId) {
                selected.push({
                    productId: productId,
                    variantId: variantId
                });
            }
        });
        
        return selected;
    }
  }
  
  if (!customElements.get('upsell-add-on')) {
    customElements.define('upsell-add-on', UpsellAddOn);
  }
  