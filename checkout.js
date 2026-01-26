/**
 * CrazzyPe Checkout.js v2.0
 * Self-contained payment SDK with embedded UI
 * Similar to Razorpay/Paytm checkout integration
 */

(function() {
  'use strict';

  // API Configuration
  var API_BASE_URL = window.CRAZZYPE_API_URL || 'https://merchants.crazzype.com';

  // Theme Configuration
  var THEME = {
    primary: '#22c55e',
    primaryDark: '#16a34a',
    accent: '#3b82f6',
    background: '#ffffff',
    foreground: '#0f172a',
    muted: '#64748b',
    mutedLight: '#94a3b8',
    border: '#e2e8f0',
    borderLight: '#f1f5f9',
    success: '#22c55e',
    error: '#ef4444',
    warning: '#f59e0b',
    gradient: 'linear-gradient(135deg, #22c55e 0%, #14b8a6 50%, #3b82f6 100%)'
  };

  // Embedded Styles
  var STYLES = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

    .cpz-overlay {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.7);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 999999;
      padding: 16px;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      animation: cpz-fade-in 0.3s ease-out;
    }

    .cpz-overlay * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    @keyframes cpz-fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes cpz-scale-in {
      from { 
        opacity: 0; 
        transform: scale(0.95) translateY(10px); 
      }
      to { 
        opacity: 1; 
        transform: scale(1) translateY(0); 
      }
    }

    @keyframes cpz-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    @keyframes cpz-shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }

    @keyframes cpz-spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    @keyframes cpz-bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-4px); }
    }

    .cpz-modal {
      width: 100%;
      max-width: 400px;
      max-height: 90vh;
      background: ${THEME.background};
      border-radius: 20px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1);
      overflow: hidden;
      position: relative;
      animation: cpz-scale-in 0.3s ease-out;
    }

    .cpz-modal::before {
      content: '';
      position: absolute;
      inset: 0;
      padding: 2px;
      border-radius: 20px;
      background: ${THEME.gradient};
      -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
      pointer-events: none;
    }

    @media (max-width: 480px) {
      .cpz-overlay {
        padding: 0;
        align-items: flex-end;
      }
      .cpz-modal {
        max-width: 100%;
        max-height: 95vh;
        border-radius: 20px 20px 0 0;
      }
      .cpz-modal::before {
        border-radius: 20px 20px 0 0;
      }
    }

    .cpz-close {
      position: absolute;
      top: 12px;
      right: 12px;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: none;
      background: ${THEME.borderLight};
      color: ${THEME.muted};
      font-size: 18px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      z-index: 10;
    }

    .cpz-close:hover {
      background: ${THEME.border};
      color: ${THEME.foreground};
      transform: scale(1.05);
    }

    .cpz-content {
      padding: 24px;
      overflow-y: auto;
      max-height: calc(90vh - 48px);
    }

    @media (max-width: 480px) {
      .cpz-content {
        max-height: calc(95vh - 48px);
        padding: 20px;
      }
    }

    /* Header Section */
    .cpz-header {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 1px solid ${THEME.borderLight};
    }

    .cpz-logo {
      width: 52px;
      height: 52px;
      border-radius: 12px;
      object-fit: cover;
      background: ${THEME.borderLight};
      flex-shrink: 0;
    }

    .cpz-logo-placeholder {
      width: 52px;
      height: 52px;
      border-radius: 12px;
      background: ${THEME.gradient};
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 20px;
      font-weight: 700;
      flex-shrink: 0;
    }

    .cpz-merchant-info {
      flex: 1;
      min-width: 0;
    }

    .cpz-merchant-name {
      font-size: 17px;
      font-weight: 600;
      color: ${THEME.foreground};
      margin-bottom: 3px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .cpz-verified-badge {
      width: 16px;
      height: 16px;
      background: ${THEME.primary};
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .cpz-verified-badge svg {
      width: 10px;
      height: 10px;
      color: white;
    }

    .cpz-merchant-desc {
      font-size: 13px;
      color: ${THEME.muted};
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    /* Amount Section */
    .cpz-amount-section {
      background: linear-gradient(135deg, rgba(34, 197, 94, 0.08) 0%, rgba(59, 130, 246, 0.08) 100%);
      border-radius: 14px;
      padding: 18px;
      margin-bottom: 20px;
      text-align: center;
    }

    .cpz-amount-label {
      font-size: 12px;
      font-weight: 500;
      color: ${THEME.muted};
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 6px;
    }

    .cpz-amount {
      font-size: 32px;
      font-weight: 700;
      color: ${THEME.foreground};
      display: flex;
      align-items: baseline;
      justify-content: center;
      gap: 4px;
    }

    .cpz-currency {
      font-size: 20px;
      font-weight: 600;
      color: ${THEME.muted};
    }

    .cpz-order-id {
      font-size: 11px;
      color: ${THEME.mutedLight};
      margin-top: 8px;
      font-family: 'SF Mono', Monaco, monospace;
    }

    /* QR Section */
    .cpz-qr-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 20px;
    }

    .cpz-qr-container {
      position: relative;
      padding: 16px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      border: 1px solid ${THEME.borderLight};
    }

    .cpz-qr-corners {
      position: absolute;
      inset: 8px;
      pointer-events: none;
    }

    .cpz-qr-corner {
      position: absolute;
      width: 20px;
      height: 20px;
      border: 3px solid ${THEME.primary};
    }

    .cpz-qr-corner-tl {
      top: 0;
      left: 0;
      border-right: none;
      border-bottom: none;
      border-radius: 6px 0 0 0;
    }

    .cpz-qr-corner-tr {
      top: 0;
      right: 0;
      border-left: none;
      border-bottom: none;
      border-radius: 0 6px 0 0;
    }

    .cpz-qr-corner-bl {
      bottom: 0;
      left: 0;
      border-right: none;
      border-top: none;
      border-radius: 0 0 0 6px;
    }

    .cpz-qr-corner-br {
      bottom: 0;
      right: 0;
      border-left: none;
      border-top: none;
      border-radius: 0 0 6px 0;
    }

    .cpz-qr-image {
      width: 180px;
      height: 180px;
      display: block;
    }

    .cpz-qr-loading {
      width: 180px;
      height: 180px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: ${THEME.borderLight};
      border-radius: 8px;
    }

    .cpz-spinner {
      width: 32px;
      height: 32px;
      border: 3px solid ${THEME.border};
      border-top-color: ${THEME.primary};
      border-radius: 50%;
      animation: cpz-spin 0.8s linear infinite;
    }

    /* Timer Section */
    .cpz-timer-section {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      margin-bottom: 20px;
    }

    .cpz-timer-circle {
      position: relative;
      width: 44px;
      height: 44px;
    }

    .cpz-timer-svg {
      transform: rotate(-90deg);
      width: 44px;
      height: 44px;
    }

    .cpz-timer-bg {
      fill: none;
      stroke: ${THEME.borderLight};
      stroke-width: 3;
    }

    .cpz-timer-progress {
      fill: none;
      stroke: ${THEME.primary};
      stroke-width: 3;
      stroke-linecap: round;
      transition: stroke-dashoffset 1s linear, stroke 0.3s;
    }

    .cpz-timer-progress.warning {
      stroke: ${THEME.warning};
    }

    .cpz-timer-progress.danger {
      stroke: ${THEME.error};
    }

    .cpz-timer-text {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 600;
      color: ${THEME.foreground};
      font-family: 'SF Mono', Monaco, monospace;
    }

    .cpz-timer-label {
      font-size: 12px;
      color: ${THEME.muted};
    }

    /* Pay Button */
    .cpz-pay-button {
      width: 100%;
      padding: 14px 24px;
      border: none;
      border-radius: 12px;
      background: ${THEME.gradient};
      color: white;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-bottom: 16px;
      position: relative;
      overflow: hidden;
    }

    .cpz-pay-button::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
      background-size: 200% 100%;
      animation: cpz-shimmer 2s infinite;
    }

    .cpz-pay-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(34, 197, 94, 0.3);
    }

    .cpz-pay-button:active {
      transform: translateY(0);
    }

    .cpz-pay-button svg {
      width: 18px;
      height: 18px;
    }

    /* UPI Apps */
    .cpz-upi-section {
      margin-bottom: 16px;
    }

    .cpz-upi-label {
      font-size: 11px;
      color: ${THEME.mutedLight};
      text-align: center;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .cpz-upi-apps {
      display: flex;
      justify-content: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .cpz-upi-app {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: ${THEME.borderLight};
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      cursor: pointer;
      border: 1px solid transparent;
    }

    .cpz-upi-app:hover {
      transform: translateY(-2px);
      border-color: ${THEME.border};
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .cpz-upi-app img {
      width: 24px;
      height: 24px;
      object-fit: contain;
    }

    /* Footer */
    .cpz-footer {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding-top: 16px;
      border-top: 1px solid ${THEME.borderLight};
    }

    .cpz-footer-lock {
      width: 12px;
      height: 12px;
      color: ${THEME.primary};
    }

    .cpz-footer-text {
      font-size: 11px;
      color: ${THEME.mutedLight};
    }

    .cpz-footer-brand {
      font-size: 11px;
      color: ${THEME.primary};
      font-weight: 600;
      text-decoration: none;
    }

    /* Status States */
    .cpz-status {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      text-align: center;
    }

    .cpz-status-icon {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
    }

    .cpz-status-icon.success {
      background: rgba(34, 197, 94, 0.1);
      color: ${THEME.success};
    }

    .cpz-status-icon.error {
      background: rgba(239, 68, 68, 0.1);
      color: ${THEME.error};
    }

    .cpz-status-icon.processing {
      background: rgba(59, 130, 246, 0.1);
      color: ${THEME.accent};
    }

    .cpz-status-icon svg {
      width: 32px;
      height: 32px;
    }

    .cpz-status-title {
      font-size: 18px;
      font-weight: 600;
      color: ${THEME.foreground};
      margin-bottom: 8px;
    }

    .cpz-status-message {
      font-size: 14px;
      color: ${THEME.muted};
      margin-bottom: 20px;
    }

    .cpz-status-button {
      padding: 12px 24px;
      border: none;
      border-radius: 10px;
      background: ${THEME.primary};
      color: white;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .cpz-status-button:hover {
      background: ${THEME.primaryDark};
    }

    .cpz-status-button.secondary {
      background: ${THEME.borderLight};
      color: ${THEME.foreground};
    }

    .cpz-status-button.secondary:hover {
      background: ${THEME.border};
    }

    /* Processing Animation */
    .cpz-processing-dots {
      display: flex;
      gap: 6px;
      margin-top: 16px;
    }

    .cpz-processing-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: ${THEME.accent};
      animation: cpz-bounce 0.6s ease-in-out infinite;
    }

    .cpz-processing-dot:nth-child(2) {
      animation-delay: 0.1s;
    }

    .cpz-processing-dot:nth-child(3) {
      animation-delay: 0.2s;
    }
  `;

  // SVG Icons
  var ICONS = {
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',
    lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>',
    smartphone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>',
    loader: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>'
  };

  // UPI App logos - using Play Store icons for reliability
  var UPI_APPS = [
    { name: 'GPay', logo: 'https://play-lh.googleusercontent.com/Fm5PDRimTL_KsWyIRcTv9h0JLrTkDOMwh18SE819OXjEZhlwMYBHJXxUZ8eOBudxCsHC=w240-h480-rw' },
    { name: 'PhonePe', logo: 'https://play-lh.googleusercontent.com/6iyA2zVz5PyyMjK5SIxdUhrb7oh9cYVXJ93q6DZkmx07Er1o90PXYeo6mzL4VC2Gj9s=w240-h480-rw' },
    { name: 'Paytm', logo: 'https://play-lh.googleusercontent.com/B5cNBA15IxjCT-8UTXEWgiPcGkJ1C07iHKwm2Hbs8xR3PnJvZ0swTag3abdC_Fj5OfnP=w240-h480-rw' },
    { name: 'BHIM UPI', logo: 'https://play-lh.googleusercontent.com/WDGsMRuVENnZPEpV4DEaXw12qtMY3em85xpmZqcXzeh0iT_eXFtAU9VUj-Z7xNQQd5DMqrkKSs9D0qbI1rlt=w240-h480-rw' }
  ];

  /**
   * CrazzyPe Checkout Constructor
   */
  function CrazzyPe(options) {
    if (!options) {
      throw new Error('CrazzyPe: Options are required');
    }

    if (!options.key) {
      throw new Error('CrazzyPe: API key is required');
    }

    if (!options.amount) {
      throw new Error('CrazzyPe: Amount is required');
    }

    this.options = {
      key: options.key,
      amount: options.amount,
      currency: options.currency || 'INR',
      name: options.name || 'CrazzyPe',
      description: options.description || 'Payment',
      image: options.image || '',
      order_id: options.order_id,
      callback_url: options.callback_url || '',
      prefill: options.prefill || {},
      notes: options.notes || {},
      theme: Object.assign({}, THEME, options.theme || {}),
      modal: options.modal || {},
      handler: options.handler || null,
      onSuccess: options.onSuccess || null,
      onFailure: options.onFailure || null,
      onDismiss: options.onDismiss || null
    };

    this.overlay = null;
    this.orderDetails = null;
    this.pollingInterval = null;
    this.paymentTimer = null;
    this.timeLeft = 300; // 5 minutes
    this.timerCircumference = 2 * Math.PI * 18;
  }

  /**
   * Open the payment checkout
   */
  CrazzyPe.prototype.open = function() {
    var self = this;

    // Inject styles if not already done
    this._injectStyles();

    // Show loading state
    this._renderModal('loading');

    // Validate and create order
    this._validateOrigin()
      .then(function() {
        return self._checkIncognitoFeature();
      })
      .then(function(hasFeature) {
        if (!hasFeature) {
          self._showError('Incognito checkout is a premium feature. Please upgrade your plan or verify your API key.');
          return Promise.reject(new Error('Feature not available'));
        }
        return self._createOrder();
      })
      .then(function(data) {
        if (data && data.status === 'success') {
          self.orderDetails = data;
          self._renderModal('payment', data);
          self._startTimer();
          self._startPolling();
        }
      })
      .catch(function(error) {
        if (error.message !== 'Feature not available') {
          self._showError(error.message || 'Failed to initialize payment');
        }
      });
  };

  /**
   * Inject CSS styles into the page
   */
  CrazzyPe.prototype._injectStyles = function() {
    if (document.getElementById('cpz-styles')) return;

    var style = document.createElement('style');
    style.id = 'cpz-styles';
    style.textContent = STYLES;
    document.head.appendChild(style);
  };

  /**
   * Render the modal with different states
   */
  CrazzyPe.prototype._renderModal = function(state, data) {
    var self = this;

    // Remove existing overlay
    if (this.overlay) {
      this.overlay.remove();
    }

    // Create overlay
    this.overlay = document.createElement('div');
    this.overlay.className = 'cpz-overlay';
    this.overlay.onclick = function(e) {
      if (e.target === self.overlay && self.options.modal.backdropclose !== false) {
        self.close();
      }
    };

    // Create modal
    var modal = document.createElement('div');
    modal.className = 'cpz-modal';

    // Close button
    var closeBtn = document.createElement('button');
    closeBtn.className = 'cpz-close';
    closeBtn.innerHTML = '&times;';
    closeBtn.onclick = function() {
      self.close();
    };
    modal.appendChild(closeBtn);

    // Content container
    var content = document.createElement('div');
    content.className = 'cpz-content';

    switch (state) {
      case 'loading':
        content.appendChild(this._createLoadingState());
        break;
      case 'payment':
        content.appendChild(this._createHeader());
        content.appendChild(this._createAmountSection(data));
        content.appendChild(this._createQRSection(data));
        content.appendChild(this._createTimerSection());
        content.appendChild(this._createPayButton(data));
        content.appendChild(this._createUPISection());
        content.appendChild(this._createFooter());
        break;
      case 'processing':
        content.appendChild(this._createProcessingState());
        break;
      case 'success':
        content.appendChild(this._createSuccessState(data));
        break;
      case 'error':
        content.appendChild(this._createErrorState(data));
        break;
    }

    modal.appendChild(content);
    this.overlay.appendChild(modal);
    document.body.appendChild(this.overlay);

    // Prevent body scroll
    document.body.style.overflow = 'hidden';
  };

  /**
   * Create loading state
   */
  CrazzyPe.prototype._createLoadingState = function() {
    var container = document.createElement('div');
    container.className = 'cpz-status';

    var icon = document.createElement('div');
    icon.className = 'cpz-status-icon processing';
    icon.innerHTML = '<div class="cpz-spinner"></div>';
    container.appendChild(icon);

    var title = document.createElement('div');
    title.className = 'cpz-status-title';
    title.textContent = 'Initializing Payment';
    container.appendChild(title);

    var message = document.createElement('div');
    message.className = 'cpz-status-message';
    message.textContent = 'Please wait while we set up your payment...';
    container.appendChild(message);

    return container;
  };

  /**
   * Create header section
   */
  CrazzyPe.prototype._createHeader = function() {
    var header = document.createElement('div');
    header.className = 'cpz-header';

    // Logo
    if (this.options.image) {
      var logo = document.createElement('img');
      logo.className = 'cpz-logo';
      logo.src = this.options.image;
      logo.alt = this.options.name;
      logo.onerror = function() {
        this.style.display = 'none';
      };
      header.appendChild(logo);
    } else {
      var placeholder = document.createElement('div');
      placeholder.className = 'cpz-logo-placeholder';
      placeholder.textContent = this.options.name.charAt(0).toUpperCase();
      header.appendChild(placeholder);
    }

    // Merchant info
    var info = document.createElement('div');
    info.className = 'cpz-merchant-info';

    var name = document.createElement('div');
    name.className = 'cpz-merchant-name';
    name.textContent = this.options.name;

    var badge = document.createElement('span');
    badge.className = 'cpz-verified-badge';
    badge.innerHTML = ICONS.check;
    name.appendChild(badge);

    var desc = document.createElement('div');
    desc.className = 'cpz-merchant-desc';
    desc.textContent = this.options.description;

    info.appendChild(name);
    info.appendChild(desc);
    header.appendChild(info);

    return header;
  };

  /**
   * Create amount section
   */
  CrazzyPe.prototype._createAmountSection = function(data) {
    var section = document.createElement('div');
    section.className = 'cpz-amount-section';

    var label = document.createElement('div');
    label.className = 'cpz-amount-label';
    label.textContent = 'Total Amount';
    section.appendChild(label);

    var amount = document.createElement('div');
    amount.className = 'cpz-amount';

    var currency = document.createElement('span');
    currency.className = 'cpz-currency';
    currency.textContent = '₹';
    amount.appendChild(currency);

    var value = document.createElement('span');
    value.textContent = this._formatAmount(this.options.amount);
    amount.appendChild(value);

    section.appendChild(amount);

    if (data && data.order_id) {
      var orderId = document.createElement('div');
      orderId.className = 'cpz-order-id';
      orderId.textContent = 'Order ID: ' + data.order_id;
      section.appendChild(orderId);
    }

    return section;
  };

  /**
   * Create QR code section
   */
  CrazzyPe.prototype._createQRSection = function(data) {
    var section = document.createElement('div');
    section.className = 'cpz-qr-section';

    var container = document.createElement('div');
    container.className = 'cpz-qr-container';

    // Animated corners
    var corners = document.createElement('div');
    corners.className = 'cpz-qr-corners';
    corners.innerHTML = '<div class="cpz-qr-corner cpz-qr-corner-tl"></div>' +
                        '<div class="cpz-qr-corner cpz-qr-corner-tr"></div>' +
                        '<div class="cpz-qr-corner cpz-qr-corner-bl"></div>' +
                        '<div class="cpz-qr-corner cpz-qr-corner-br"></div>';
    container.appendChild(corners);

    // Generate QR URL using api.qrserver.com
    var qrData = null;
    
    // Priority: qr_code_url > upi_link > upi_intent > construct from upiId
    if (data && data.qr_code_url) {
      qrData = data.qr_code_url;
    } else if (data && data.upi_link) {
      qrData = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + encodeURIComponent(data.upi_link);
    } else if (data && data.upi_intent) {
      qrData = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + encodeURIComponent(data.upi_intent);
    } else if (data && data.upiId) {
      // Construct UPI link from upiId and amount
      var amount = this.options.amount;
      // Convert from paise to rupees not needed
      // if (amount >= 100 && Number.isInteger(parseFloat(amount))) {
      //   amount = parseFloat(amount) / 100;
      // }
      var upiLink = 'upi://pay?pa=' + encodeURIComponent(data.upiId) + 
                    '&am=' + amount + 
                    '&pn=' + encodeURIComponent(this.options.name) +
                    '&tn=' + encodeURIComponent(this.options.description) +
                    '&tr=' + encodeURIComponent(data.order_id || this.options.order_id || '');
      qrData = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + encodeURIComponent(upiLink);
    }

    if (qrData) {
      var img = document.createElement('img');
      img.className = 'cpz-qr-image';
      // Check if qrData is already a full URL or needs to be used with qrserver
      if (qrData.startsWith('http')) {
        img.src = qrData;
      } else {
        img.src = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + encodeURIComponent(qrData);
      }
      img.alt = 'Payment QR Code';
      img.onerror = function() {
        // Fallback to loading spinner on error
        container.innerHTML = '';
        container.appendChild(corners.cloneNode(true));
        var loading = document.createElement('div');
        loading.className = 'cpz-qr-loading';
        loading.innerHTML = '<div class="cpz-spinner"></div>';
        container.appendChild(loading);
      };
      container.appendChild(img);
    } else {
      var loading = document.createElement('div');
      loading.className = 'cpz-qr-loading';
      loading.innerHTML = '<div class="cpz-spinner"></div>';
      container.appendChild(loading);
    }

    section.appendChild(container);
    return section;
  };

  /**
   * Create timer section
   */
  CrazzyPe.prototype._createTimerSection = function() {
    var section = document.createElement('div');
    section.className = 'cpz-timer-section';

    var circle = document.createElement('div');
    circle.className = 'cpz-timer-circle';

    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'cpz-timer-svg');
    svg.setAttribute('viewBox', '0 0 40 40');

    var bgCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    bgCircle.setAttribute('class', 'cpz-timer-bg');
    bgCircle.setAttribute('cx', '20');
    bgCircle.setAttribute('cy', '20');
    bgCircle.setAttribute('r', '18');

    var progressCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    progressCircle.setAttribute('class', 'cpz-timer-progress');
    progressCircle.setAttribute('id', 'cpz-timer-progress');
    progressCircle.setAttribute('cx', '20');
    progressCircle.setAttribute('cy', '20');
    progressCircle.setAttribute('r', '18');
    progressCircle.setAttribute('stroke-dasharray', this.timerCircumference);
    progressCircle.setAttribute('stroke-dashoffset', '0');

    svg.appendChild(bgCircle);
    svg.appendChild(progressCircle);
    circle.appendChild(svg);

    var text = document.createElement('div');
    text.className = 'cpz-timer-text';
    text.id = 'cpz-timer-text';
    text.textContent = '5:00';
    circle.appendChild(text);

    section.appendChild(circle);

    var label = document.createElement('div');
    label.className = 'cpz-timer-label';
    label.textContent = 'Time remaining to complete payment';
    section.appendChild(label);

    return section;
  };

  /**
   * Create pay button
   */
  CrazzyPe.prototype._createPayButton = function(data) {
    var self = this;
    var button = document.createElement('button');
    button.className = 'cpz-pay-button';
    button.innerHTML = ICONS.smartphone + ' <span>Pay with UPI App</span>';

    button.onclick = function() {
      if (data && data.upi_link) {
        window.location.href = data.upi_link;
      }
    };

    return button;
  };

  /**
   * Create UPI apps section
   */
  CrazzyPe.prototype._createUPISection = function() {
    var section = document.createElement('div');
    section.className = 'cpz-upi-section';

    var label = document.createElement('div');
    label.className = 'cpz-upi-label';
    label.textContent = 'Supported UPI Apps';
    section.appendChild(label);

    var apps = document.createElement('div');
    apps.className = 'cpz-upi-apps';

    UPI_APPS.forEach(function(app) {
      var appDiv = document.createElement('div');
      appDiv.className = 'cpz-upi-app';
      appDiv.title = app.name;

      var img = document.createElement('img');
      img.src = app.logo;
      img.alt = app.name;
      appDiv.appendChild(img);

      apps.appendChild(appDiv);
    });

    section.appendChild(apps);
    return section;
  };

  /**
   * Create footer
   */
  CrazzyPe.prototype._createFooter = function() {
    var footer = document.createElement('div');
    footer.className = 'cpz-footer';

    footer.innerHTML = '<span class="cpz-footer-lock">' + ICONS.lock + '</span>' +
                       '<span class="cpz-footer-text">Secured by</span>' +
                       '<a href="https://crazzype.com" target="_blank" class="cpz-footer-brand">CrazzyPe</a>';

    return footer;
  };

  /**
   * Create processing state
   */
  CrazzyPe.prototype._createProcessingState = function() {
    var container = document.createElement('div');
    container.className = 'cpz-status';

    var icon = document.createElement('div');
    icon.className = 'cpz-status-icon processing';
    icon.innerHTML = '<div class="cpz-spinner"></div>';
    container.appendChild(icon);

    var title = document.createElement('div');
    title.className = 'cpz-status-title';
    title.textContent = 'Processing Payment';
    container.appendChild(title);

    var message = document.createElement('div');
    message.className = 'cpz-status-message';
    message.textContent = 'Please do not close this window...';
    container.appendChild(message);

    var dots = document.createElement('div');
    dots.className = 'cpz-processing-dots';
    dots.innerHTML = '<div class="cpz-processing-dot"></div>' +
                     '<div class="cpz-processing-dot"></div>' +
                     '<div class="cpz-processing-dot"></div>';
    container.appendChild(dots);

    return container;
  };

  /**
   * Create success state
   */
  CrazzyPe.prototype._createSuccessState = function(data) {
    var self = this;
    var container = document.createElement('div');
    container.className = 'cpz-status';

    var icon = document.createElement('div');
    icon.className = 'cpz-status-icon success';
    icon.innerHTML = ICONS.check;
    container.appendChild(icon);

    var title = document.createElement('div');
    title.className = 'cpz-status-title';
    title.textContent = 'Payment Successful!';
    container.appendChild(title);

    var message = document.createElement('div');
    message.className = 'cpz-status-message';
    message.textContent = 'Your payment has been processed successfully.';
    container.appendChild(message);

    var button = document.createElement('button');
    button.className = 'cpz-status-button';
    button.textContent = 'Done';
    button.onclick = function() {
      self.close();
    };
    container.appendChild(button);

    return container;
  };

  /**
   * Create error state
   */
  CrazzyPe.prototype._createErrorState = function(data) {
    var self = this;
    var container = document.createElement('div');
    container.className = 'cpz-status';

    var icon = document.createElement('div');
    icon.className = 'cpz-status-icon error';
    icon.innerHTML = ICONS.x;
    container.appendChild(icon);

    var title = document.createElement('div');
    title.className = 'cpz-status-title';
    title.textContent = data && data.title ? data.title : 'Payment Failed';
    container.appendChild(title);

    var message = document.createElement('div');
    message.className = 'cpz-status-message';
    message.textContent = data && data.message ? data.message : 'Something went wrong. Please try again.';
    container.appendChild(message);

    var button = document.createElement('button');
    button.className = 'cpz-status-button secondary';
    button.textContent = 'Close';
    button.onclick = function() {
      self.close();
    };
    container.appendChild(button);

    return container;
  };

  /**
   * Start payment timer
   */
  CrazzyPe.prototype._startTimer = function() {
    var self = this;
    this.timeLeft = 300;

    this.paymentTimer = setInterval(function() {
      self.timeLeft--;

      if (self.timeLeft <= 0) {
        clearInterval(self.paymentTimer);
        clearInterval(self.pollingInterval);
        self._handleFailure({ error_description: 'Payment timeout' });
        return;
      }

      // Update timer text
      var timerText = document.getElementById('cpz-timer-text');
      if (timerText) {
        var minutes = Math.floor(self.timeLeft / 60);
        var seconds = self.timeLeft % 60;
        timerText.textContent = minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
      }

      // Update progress circle
      var progress = document.getElementById('cpz-timer-progress');
      if (progress) {
        var offset = self.timerCircumference * (1 - self.timeLeft / 300);
        progress.setAttribute('stroke-dashoffset', offset);

        // Change color based on time
        progress.classList.remove('warning', 'danger');
        if (self.timeLeft <= 60) {
          progress.classList.add('danger');
        } else if (self.timeLeft <= 120) {
          progress.classList.add('warning');
        }
      }
    }, 1000);
  };

  /**
   * Start polling for payment status
   */
  CrazzyPe.prototype._startPolling = function() {
    var self = this;
    var orderId = this.options.order_id || (this.orderDetails && this.orderDetails.order_id);

    if (!orderId) return;

    this.pollingInterval = setInterval(function() {
      fetch(API_BASE_URL + '/api/orders/check-order-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + self.options.key
        },
        body: JSON.stringify({ order_id: orderId })
      })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        if (data.status === 'success' && data.txn_status === 'TXN_SUCCESS') {
          clearInterval(self.pollingInterval);
          clearInterval(self.paymentTimer);

          self._renderModal('processing');

          setTimeout(function() {
            var hash = '';
            if (data.data && data.data.redirect_url) {
              var hashMatch = data.data.redirect_url.match(/hash=([^&]+)/);
              if (hashMatch) hash = decodeURIComponent(hashMatch[1]);
            }

            self._handleSuccess({
              order_id: orderId,
              payment_id: data.data && data.data.upi_txn_id,
              signature: hash,
              hash: hash
            });
          }, 1500);
        } else if (data.txn_status === 'TXN_FAILED') {
          clearInterval(self.pollingInterval);
          clearInterval(self.paymentTimer);
          self._handleFailure({ error_description: data.message || 'Payment failed' });
        }
      })
      .catch(function(error) {
        console.error('CrazzyPe: Status check error', error);
      });
    }, 2000);
  };

  /**
   * Validate origin
   */
  CrazzyPe.prototype._validateOrigin = function() {
    var self = this;

    return new Promise(function(resolve, reject) {
      fetch(API_BASE_URL + '/api/orders/check-incognito-feature', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + self.options.key
        }
      })
      .then(function(response) {
        if (response.status === 403) {
          return response.json().then(function(data) {
            throw new Error('Origin not allowed. Please add this domain to your API key settings.');
          });
        }
        if (response.status === 401) {
          throw new Error('Invalid API key');
        }
        if (response.ok) {
          resolve();
          return;
        }
        throw new Error('Validation failed');
      })
      .catch(function(error) {
        if (error.message.includes('Origin') || error.message.includes('API key')) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  };

  /**
   * Check incognito feature
   */
  CrazzyPe.prototype._checkIncognitoFeature = function() {
    var self = this;

    return new Promise(function(resolve) {
      fetch(API_BASE_URL + '/api/orders/check-incognito-feature', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + self.options.key
        }
      })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        resolve(data.status === 'success' && data.hasIncognito);
      })
      .catch(function() {
        resolve(false);
      });
    });
  };

  /**
   * Create order
   */
  CrazzyPe.prototype._createOrder = function() {
    var self = this;

    return new Promise(function(resolve, reject) {
      var orderId = self.options.order_id || 'order_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

      fetch(API_BASE_URL + '/api/orders/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + self.options.key
        },
        body: JSON.stringify({
          txn_id: orderId,
          amount: self.options.amount.toString(),
          p_info: self.options.description,
          customer_name: self.options.prefill.name || 'Customer',
          customer_email: self.options.prefill.email || '',
          customer_mobile: self.options.prefill.contact || '',
          redirect_url: self.options.callback_url || window.location.href,
          udf1: self.options.notes.udf1 || '',
          udf2: self.options.notes.udf2 || '',
          udf3: self.options.notes.udf3 || ''
        })
      })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        if (data.status === 'success') {
          self.options.order_id = data.order_id || orderId;
          resolve(data);
        } else {
          reject(new Error(data.message || 'Order creation failed'));
        }
      })
      .catch(reject);
    });
  };

  /**
   * Handle success
   */
  CrazzyPe.prototype._handleSuccess = function(data) {
    var self = this;

    this._renderModal('success', data);

    var response = {
      crazzype_payment_id: data.payment_id || data.order_id,
      crazzype_order_id: data.order_id || this.options.order_id,
      crazzype_signature: data.signature || data.hash,
      order_id: data.order_id || this.options.order_id,
      payment_id: data.payment_id,
      signature: data.signature || data.hash
    };

    setTimeout(function() {
      if (self.options.handler) self.options.handler(response);
      if (self.options.onSuccess) self.options.onSuccess(response);
    }, 1000);
  };

  /**
   * Handle failure
   */
  CrazzyPe.prototype._handleFailure = function(data) {
    this._renderModal('error', {
      title: 'Payment Failed',
      message: data.error_description || 'Something went wrong'
    });

    if (this.options.onFailure) {
      this.options.onFailure({
        error: {
          code: data.error_code || 'PAYMENT_FAILED',
          description: data.error_description || 'Payment failed',
          source: 'customer',
          step: 'payment',
          reason: data.reason || 'unknown'
        }
      });
    }
  };

  /**
   * Show error
   */
  CrazzyPe.prototype._showError = function(message) {
    this._renderModal('error', {
      title: 'Error',
      message: message
    });
  };

  /**
   * Close the modal
   */
  CrazzyPe.prototype.close = function() {
    if (this.paymentTimer) {
      clearInterval(this.paymentTimer);
      this.paymentTimer = null;
    }

    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }

    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }

    document.body.style.overflow = '';

    if (this.options.onDismiss) {
      this.options.onDismiss();
    }

    if (this.options.modal && this.options.modal.ondismiss) {
      this.options.modal.ondismiss();
    }
  };

  /**
   * Format amount for display
   */
  CrazzyPe.prototype._formatAmount = function(amount) {
    var num = parseFloat(amount);
    if (isNaN(num)) return '0.00';

    // Handle paise (if amount > 100, assume it's in paise)
    if (num >= 100 && Number.isInteger(num)) {
      num = num / 100;
    }

    return num.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Export to global scope
  if (typeof window !== 'undefined') {
    window.CrazzyPe = CrazzyPe;
  }

})();
