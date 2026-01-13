class NewsletterPopup extends ModalDialog {
  constructor() {
    super();
    this.config = {
      delay: (parseInt(this.dataset.delay) || 2) * 1000,
      reopenDays: parseInt(this.dataset.reopen) || 1,
      sectionId: this.dataset.sectionId
    };

    this.elements = {
      opener: document.querySelector('.newsletter-modal__opener'),
      form: this.querySelector('form')
    };

    this.elements.closeButton = this.elements.opener?.querySelector('.newsletter-modal__close');
    this.showTimeout = null;

    this.init();
  }

  init() {
    this.updateUI();
    this.attachEvents();
    this.setupDesignMode();
  }

  getState() {
    const now = Date.now();
    return {
      subscribed: this.getFlag('newsletterSubscribed'),
      popupExpired: this.isExpired('newsletterPopupClosed', now),
      openerExpired: this.isExpired('newsletterOpenerClosed', now)
    };
  }

  getFlag(key) {
    return localStorage.getItem(key) === 'true';
  }

  isExpired(key, now) {
    const timestamp = localStorage.getItem(key);
    return !timestamp || now > parseInt(timestamp);
  }

  setExpiration(key) {
    const expiration = Date.now() + this.config.reopenDays * 86400000;
    localStorage.setItem(key, expiration);
  }

  updateUI() {
    const state = this.getState();
    this.toggleOpener(state.openerExpired);

    if (!state.subscribed && state.popupExpired) {
      this.schedulePopup();
    }
  }

  toggleOpener(show) {
    if (!this.elements.opener) return;
    const display = show ? '' : 'none';
    if (this.elements.opener.style.display !== display) {
      this.elements.opener.style.display = display;
    }
  }

  schedulePopup() {
    this.clearSchedule();
    this.showTimeout = setTimeout(() => this.show(), this.config.delay);
  }

  clearSchedule() {
    if (this.showTimeout) {
      clearTimeout(this.showTimeout);
      this.showTimeout = null;
    }
  }

  attachEvents() {
    if (this.elements.form) {
      this.elements.form.addEventListener('submit', () => this.handleSubmit());
    }

    if (this.elements.closeButton) {
      this.elements.closeButton.addEventListener('click', () => this.handleOpenerClose());
    }

    const trigger = this.elements.opener?.querySelector('[data-open-modal]');
    if (trigger) {
      trigger.addEventListener('click', () => this.handleManualOpen());
    }
  }

  handleSubmit() {
    localStorage.setItem('newsletterSubscribed', 'true');
    localStorage.removeItem('newsletterPopupClosed');
    this.toggleOpener(true);
    super.hide();
  }

  handleOpenerClose() {
    this.toggleOpener(false);
    this.setExpiration('newsletterOpenerClosed');
  }

  handleManualOpen() {
    this.clearSchedule();
    this.show();
  }

  hide() {
    this.clearSchedule();
    super.hide();
    this.setExpiration('newsletterPopupClosed');
  }

  setupDesignMode() {
    if (!Shopify.designMode) return;

    document.addEventListener('shopify:section:select', (e) => {
      if (e.detail.sectionId === this.config.sectionId) this.show();
    });

    document.addEventListener('shopify:section:deselect', (e) => {
      if (e.detail.sectionId === this.config.sectionId) this.hide();
    });
  }
}

customElements.define('newsletter-popup', NewsletterPopup);
