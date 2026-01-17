/**
 * CrazzyPe Checkout.js
 */

(function() {
  'use strict';

  // API Base URL
  const API_BASE_URL = window.CRAZZYPE_API_URL || 'https://merchants.crazzype.com';

  /**
   * CrazzyPe Checkout Constructor
   * @param {Object} options - Checkout options
   */
  function CrazzyPe(options) {
    if (!options) {
      throw new Error('Options are required');
    }

    if (!options.key) {
      throw new Error('API Key is required');
    }

    if (!options.amount) {
      throw new Error('Amount is required');
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
      theme: options.theme || {},
      modal: options.modal || {},
      handler: options.handler || null,
      onSuccess: options.onSuccess || null,
      onFailure: options.onFailure || null,
      onDismiss: options.onDismiss || null,
    };

    this.paymentWindow = null;
    this.orderDetails = null;
    this.pollingInterval = null;
    this.paymentTimer = null;
    this.timeLeft = 300; // 5 minutes default
  }

  /**
   * Open the payment checkout (Incognito Mode - Premium Feature)
   */
  CrazzyPe.prototype.open = function() {
    var self = this;
    
    // First, validate origin
    this._validateOrigin()
      .then(function() {
        // Origin validated, check if user has incognito feature
        return self._checkIncognitoFeature();
      })
      .then(function(hasFeature) {
        if (!hasFeature) {
          self._handleError('Incognito checkout is a premium feature. Please upgrade your plan to use checkout.js. If you already have the feature, please check your API key and try again.');
          return;
        }
        
        // Create order and get payment details
        return self._createOrder();
      })
      .then(function(data) {
        if (!data) return; // Error already handled
        
        if (data.status === 'success') {
          self.orderDetails = data;
          // Open payment UI modal
          self._openPaymentModal(data);
        } else {
          self._handleError(data.message || 'Failed to create order');
        }
      })
      .catch(function(error) {
        self._handleError(error.message || 'Failed to initialize payment');
      });
  };

  /**
   * Validate current origin against API key allowed origins
   */
  CrazzyPe.prototype._validateOrigin = function() {
    var self = this;
    
    return new Promise(function(resolve, reject) {
      // Get current origin
      var currentOrigin = window.location.origin;
      
      // Use check-incognito-feature endpoint to validate origin
      // This endpoint uses middleware that validates origin
      fetch(API_BASE_URL + '/api/orders/check-incognito-feature', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + self.options.key
        }
      })
      .then(function(response) {
        // If 403, origin is not allowed
        if (response.status === 403) {
          return response.json().then(function(data) {
            throw new Error('Origin not allowed: ' + currentOrigin + '. Please add this domain to your API key allowed origins in the CrazzyPe dashboard.');
          });
        }
        
        // If 401, API key is invalid
        if (response.status === 401) {
          return response.json().then(function(data) {
            throw new Error('Invalid API key. Please check your API key and try again.');
          });
        }
        
        // If OK, origin is validated
        if (response.ok) {
          resolve();
          return;
        }
        
        // Other errors
        return response.json().then(function(data) {
          throw new Error(data.message || 'Failed to validate origin');
        });
      })
      .catch(function(error) {
        // Network errors or other issues
        if (error.message && error.message.includes('Origin not allowed')) {
          reject(error);
        } else if (error.message && error.message.includes('Invalid API key')) {
          reject(error);
        } else {
          // For other errors, we'll allow it to proceed (might be network issue)
          // The actual API calls will validate origin anyway
          console.warn('Origin validation warning:', error.message);
          resolve(); // Allow to proceed, backend will validate on actual calls
        }
      });
    });
  };

  /**
   * Check if user has incognito feature
   */
  CrazzyPe.prototype._checkIncognitoFeature = function() {
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
        if (!response.ok) {
          return response.json().then(function(data) {
            throw new Error(data.message || 'Failed to check incognito feature. Status: ' + response.status);
          }).catch(function() {
            throw new Error('Server error (Status: ' + response.status + '). Please try again later.');
          });
        }
        return response.json();
      })
      .then(function(data) {
        if (data.status === 'success' && data.hasIncognito) {
          resolve(true);
        } else {
          resolve(false);
        }
      })
      .catch(function(error) {
        console.error('Error checking incognito feature:', error);
        resolve(false);
      });
    });
  };

  /**
   * Create order on server
   */
  CrazzyPe.prototype._createOrder = function() {
    var self = this;
    
    return new Promise(function(resolve, reject) {
      // Generate order_id if not provided
      var orderId = self.options.order_id || 'order_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      
      // Create order
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
          udf3: self.options.notes.udf3 || '',
        })
      })
      .then(function(response) {
        if (!response.ok) {
          return response.json().then(function(data) {
            throw new Error(data.message || 'Failed to create order. Status: ' + response.status);
          }).catch(function() {
            throw new Error('Server error (Status: ' + response.status + '). Please check your API key and try again.');
          });
        }
        return response.json();
      })
      .then(function(data) {
        if (data.status === 'success') {
          // Store order_id for later use
          self.options.order_id = data.order_id || orderId;
          resolve(data);
        } else {
          reject(new Error(data.message || 'Failed to create order'));
        }
      })
      .catch(function(error) {
        console.error('Error creating order:', error);
        reject(error);
      });
    });
  };

  /**
   * Open payment UI modal with QR code and UPI links
   */
  CrazzyPe.prototype._openPaymentModal = function(orderData) {
    var self = this;

    var ensureStyles = function() {
      if (document.getElementById('crazzype-checkout-style')) {
        return;
      }
      var style = document.createElement('style');
      style.id = 'crazzype-checkout-style';
      style.textContent = [
        ':root {',
        '  --cpz-bg: #0f172a;',
        '  --cpz-card: #ffffff;',
        '  --cpz-muted: #64748b;',
        '  --cpz-text: #0f172a;',
        '  --cpz-accent: #f97316;',
        '  --cpz-accent-2: #0ea5e9;',
        '  --cpz-border: #e2e8f0;',
        '  --cpz-shadow: 0 24px 60px rgba(15, 23, 42, 0.25);',
        '}',
        '#crazzype-modal-overlay {',
        '  position: fixed;',
        '  inset: 0;',
        '  background: rgba(15, 23, 42, 0.65);',
        '  backdrop-filter: blur(6px);',
        '  display: flex;',
        '  align-items: center;',
        '  justify-content: center;',
        '  z-index: 999999;',
        '  padding: 20px;',
        '}',
        '#crazzype-modal {',
        '  width: min(980px, 95vw);',
        '  background: var(--cpz-card);',
        '  border-radius: 18px;',
        '  overflow: hidden;',
        '  box-shadow: var(--cpz-shadow);',
        '  font-family: "Poppins", "Trebuchet MS", "Segoe UI", Arial, sans-serif;',
        '  color: var(--cpz-text);',
        '}',
        '.cpz-header {',
        '  display: flex;',
        '  align-items: center;',
        '  justify-content: space-between;',
        '  padding: 22px 26px;',
        '  background: linear-gradient(120deg, #f8fafc, #e2e8f0);',
        '  border-bottom: 1px solid var(--cpz-border);',
        '}',
        '.cpz-brand {',
        '  display: flex;',
        '  align-items: center;',
        '  gap: 14px;',
        '}',
        '.cpz-logo {',
        '  width: 48px;',
        '  height: 48px;',
        '  border-radius: 12px;',
        '  background: #0f172a;',
        '  color: #fff;',
        '  display: flex;',
        '  align-items: center;',
        '  justify-content: center;',
        '  font-weight: 700;',
        '  letter-spacing: 0.5px;',
        '  font-size: 18px;',
        '  overflow: hidden;',
        '}',
        '.cpz-logo img {',
        '  width: 100%;',
        '  height: 100%;',
        '  object-fit: cover;',
        '}',
        '.cpz-title {',
        '  font-size: 20px;',
        '  font-weight: 700;',
        '  margin: 0;',
        '}',
        '.cpz-subtitle {',
        '  font-size: 13px;',
        '  color: var(--cpz-muted);',
        '  margin: 4px 0 0;',
        '}',
        '.cpz-close {',
        '  border: none;',
        '  background: #e2e8f0;',
        '  color: #0f172a;',
        '  width: 34px;',
        '  height: 34px;',
        '  border-radius: 50%;',
        '  font-size: 18px;',
        '  cursor: pointer;',
        '}',
        '.cpz-body {',
        '  display: grid;',
        '  grid-template-columns: 1.1fr 0.9fr;',
        '  gap: 24px;',
        '  padding: 26px;',
        '}',
        '.cpz-panel {',
        '  background: #f8fafc;',
        '  border: 1px solid var(--cpz-border);',
        '  border-radius: 14px;',
        '  padding: 18px;',
        '}',
        '.cpz-amount {',
        '  font-size: 32px;',
        '  font-weight: 800;',
        '  margin: 4px 0 0;',
        '}',
        '.cpz-label {',
        '  font-size: 12px;',
        '  text-transform: uppercase;',
        '  letter-spacing: 1px;',
        '  color: var(--cpz-muted);',
        '}',
        '.cpz-meta {',
        '  margin-top: 16px;',
        '  display: grid;',
        '  gap: 10px;',
        '  font-size: 14px;',
        '}',
        '.cpz-meta span {',
        '  color: var(--cpz-muted);',
        '  display: block;',
        '  font-size: 12px;',
        '  margin-bottom: 2px;',
        '}',
        '.cpz-timer {',
        '  margin-top: 16px;',
        '  padding: 10px 12px;',
        '  border-radius: 10px;',
        '  background: #fff7ed;',
        '  color: #c2410c;',
        '  font-weight: 600;',
        '  font-size: 13px;',
        '}',
        '.cpz-qr {',
        '  display: flex;',
        '  flex-direction: column;',
        '  align-items: center;',
        '  gap: 12px;',
        '}',
        '.cpz-qr img {',
        '  width: 220px;',
        '  height: 220px;',
        '  border-radius: 12px;',
        '  border: 1px solid var(--cpz-border);',
        '  background: #fff;',
        '  padding: 8px;',
        '}',
        '.cpz-button {',
        '  display: inline-flex;',
        '  align-items: center;',
        '  justify-content: center;',
        '  gap: 8px;',
        '  padding: 12px 18px;',
        '  border-radius: 10px;',
        '  background: linear-gradient(120deg, var(--cpz-accent), var(--cpz-accent-2));',
        '  color: #fff;',
        '  text-decoration: none;',
        '  font-weight: 700;',
        '  border: none;',
        '  cursor: pointer;',
        '  margin-top: 14px;',
        '}',
        '.cpz-status {',
        '  margin-top: 16px;',
        '  font-size: 14px;',
        '  color: var(--cpz-muted);',
        '  text-align: center;',
        '}',
        '.cpz-steps {',
        '  margin-top: 16px;',
        '  font-size: 13px;',
        '  color: var(--cpz-muted);',
        '  line-height: 1.6;',
        '}',
        '.cpz-footer {',
        '  margin-top: 14px;',
        '  font-size: 11px;',
        '  color: var(--cpz-muted);',
        '  text-align: center;',
        '}',
        '@media (max-width: 860px) {',
        '  .cpz-body {',
        '    grid-template-columns: 1fr;',
        '  }',
        '  .cpz-qr img {',
        '    width: 200px;',
        '    height: 200px;',
        '  }',
        '}'
      ].join('\n');
      document.head.appendChild(style);
    };

    ensureStyles();

    // Create modal overlay
    var overlay = document.createElement('div');
    overlay.id = 'crazzype-modal-overlay';

    // Create modal container
    var modal = document.createElement('div');
    modal.id = 'crazzype-modal';

    // Create close button
    var closeBtn = document.createElement('button');
    closeBtn.innerHTML = 'x';
    closeBtn.className = 'cpz-close';
    closeBtn.onclick = function() {
      self.close();
    };

    var header = document.createElement('div');
    header.className = 'cpz-header';

    var brand = document.createElement('div');
    brand.className = 'cpz-brand';

    var logoWrap = document.createElement('div');
    logoWrap.className = 'cpz-logo';
    if (self.options.image) {
      var logoImg = document.createElement('img');
      logoImg.src = self.options.image;
      logoImg.alt = self.options.name || 'Merchant';
      logoWrap.appendChild(logoImg);
    } else {
      var initials = (self.options.name || 'C').trim().charAt(0).toUpperCase();
      logoWrap.textContent = initials || 'C';
    }

    var titleWrap = document.createElement('div');
    var title = document.createElement('div');
    title.className = 'cpz-title';
    title.textContent = self.options.name || 'CrazzyPe';
    var subtitle = document.createElement('div');
    subtitle.className = 'cpz-subtitle';
    subtitle.textContent = self.options.description || 'Secure payment';
    titleWrap.appendChild(title);
    titleWrap.appendChild(subtitle);

    brand.appendChild(logoWrap);
    brand.appendChild(titleWrap);
    header.appendChild(brand);
    header.appendChild(closeBtn);

    var body = document.createElement('div');
    body.className = 'cpz-body';

    var leftPanel = document.createElement('div');
    leftPanel.className = 'cpz-panel';

    var amountLabel = document.createElement('div');
    amountLabel.className = 'cpz-label';
    amountLabel.textContent = 'Total amount';
    var amountValue = document.createElement('div');
    amountValue.className = 'cpz-amount';
    amountValue.textContent = 'Rs. ' + parseFloat(self.options.amount).toFixed(2);
    leftPanel.appendChild(amountLabel);
    leftPanel.appendChild(amountValue);

    var meta = document.createElement('div');
    meta.className = 'cpz-meta';
    var metaOrder = document.createElement('div');
    metaOrder.innerHTML = '<span>Order ID</span>' + (orderData.order_id || self.options.order_id || 'Pending');
    meta.appendChild(metaOrder);

    if (self.options.prefill && self.options.prefill.name) {
      var metaName = document.createElement('div');
      metaName.innerHTML = '<span>Customer</span>' + self.options.prefill.name;
      meta.appendChild(metaName);
    }
    if (self.options.prefill && self.options.prefill.email) {
      var metaEmail = document.createElement('div');
      metaEmail.innerHTML = '<span>Email</span>' + self.options.prefill.email;
      meta.appendChild(metaEmail);
    }
    if (self.options.prefill && self.options.prefill.contact) {
      var metaPhone = document.createElement('div');
      metaPhone.innerHTML = '<span>Phone</span>' + self.options.prefill.contact;
      meta.appendChild(metaPhone);
    }

    leftPanel.appendChild(meta);

    var timerDiv = document.createElement('div');
    timerDiv.id = 'crazzype-timer';
    timerDiv.className = 'cpz-timer';
    var timerText = document.createElement('div');
    timerText.id = 'crazzype-timer-text';
    timerText.textContent = 'Time remaining: 5:00';
    timerDiv.appendChild(timerText);
    leftPanel.appendChild(timerDiv);

    var statusDiv = document.createElement('div');
    statusDiv.id = 'crazzype-status';
    statusDiv.className = 'cpz-status';
    statusDiv.textContent = 'Waiting for payment...';
    leftPanel.appendChild(statusDiv);

    var rightPanel = document.createElement('div');
    rightPanel.className = 'cpz-panel';

    var qrWrap = document.createElement('div');
    qrWrap.className = 'cpz-qr';
    var qrLabel = document.createElement('div');
    qrLabel.className = 'cpz-label';
    qrLabel.textContent = 'Scan to pay';
    qrWrap.appendChild(qrLabel);
    if (orderData.qr_code) {
      var qrImg = document.createElement('img');
      qrImg.src = orderData.qr_code;
      qrImg.alt = 'Payment QR';
      qrWrap.appendChild(qrImg);
    }
    rightPanel.appendChild(qrWrap);

    if (orderData.upi_intent_link) {
      var upiButton = document.createElement('a');
      upiButton.href = orderData.upi_intent_link;
      upiButton.textContent = 'Pay with UPI app';
      upiButton.className = 'cpz-button';
      upiButton.onclick = function(e) {
        window.location.href = orderData.upi_intent_link;
        e.preventDefault();
      };
      rightPanel.appendChild(upiButton);
    }

    var steps = document.createElement('div');
    steps.className = 'cpz-steps';
    steps.innerHTML = [
      '<strong>Steps:</strong>',
      '1) Open your UPI app.',
      '2) Scan the QR code or tap the button.',
      '3) Confirm amount and pay.'
    ].join('<br>');
    rightPanel.appendChild(steps);

    var footer = document.createElement('div');
    footer.className = 'cpz-footer';
    footer.textContent = 'Powered by CrazzyPe Checkout';
    rightPanel.appendChild(footer);

    body.appendChild(leftPanel);
    body.appendChild(rightPanel);

    modal.appendChild(header);
    modal.appendChild(body);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Close on backdrop click if enabled
    if (this.options.modal.backdropclose !== false) {
      overlay.onclick = function(e) {
        if (e.target === overlay) {
          self.close();
        }
      };
    }

    this.paymentWindow = overlay;

    // Start timer
    this._startTimer();

    // Start polling for payment status
    this._startPolling();
  };

  /**
   * Start payment timer
   */
  CrazzyPe.prototype._startTimer = function() {
    var self = this;
    this.timeLeft = 300; // 5 minutes
    
    var timerElement = document.getElementById('crazzype-timer-text');
    if (!timerElement) return;
    
    this.paymentTimer = setInterval(function() {
      self.timeLeft--;
      
      if (self.timeLeft <= 0) {
        clearInterval(self.paymentTimer);
        if (timerElement) {
          timerElement.textContent = 'Payment expired';
          timerElement.style.color = '#dc3545';
        }
        self._handleFailure({ error_description: 'Payment timeout' });
        return;
      }
      
      var minutes = Math.floor(self.timeLeft / 60);
      var seconds = self.timeLeft % 60;
      if (timerElement) {
        timerElement.textContent = 'Time remaining: ' + minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
      }
    }, 1000);
  };

  /**
   * Start polling for payment status
   */
  CrazzyPe.prototype._startPolling = function() {
    var self = this;
    var orderId = self.options.order_id;
    var maxPollingDuration = 5 * 60 * 1000; // 5 minutes
    var startTime = Date.now();
    
    this.pollingInterval = setInterval(function() {
      // Check if polling should stop
      if (Date.now() - startTime >= maxPollingDuration) {
        clearInterval(self.pollingInterval);
        self._handleFailure({ error_description: 'Payment timeout' });
        return;
      }
      
      // Check payment status
      fetch(API_BASE_URL + '/api/orders/check-order-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + self.options.key
        },
        body: JSON.stringify({
          order_id: orderId
        })
      })
      .then(function(res) {
        return res.json();
      })
      .then(function(data) {
        if (data.status === 'success' && data.txn_status === 'TXN_SUCCESS') {
          // Payment successful
          clearInterval(self.pollingInterval);
          clearInterval(self.paymentTimer);
          
          var statusDiv = document.getElementById('crazzype-status');
          if (statusDiv) {
            statusDiv.textContent = 'Payment successful!';
            statusDiv.style.color = '#28a745';
          }
          
          // Extract payment details
          var hash = '';
          if (data.data && data.data.redirect_url) {
            var hashMatch = data.data.redirect_url.match(/hash=([^&]+)/);
            if (hashMatch) {
              hash = decodeURIComponent(hashMatch[1]);
            }
          }
          
          var paymentData = {
            order_id: orderId,
            payment_id: data.data.upi_txn_id || data.data.payment_id,
            signature: hash,
            hash: hash
          };
          
          // Wait a moment before handling success
          setTimeout(function() {
            self._handleSuccess(paymentData);
          }, 1000);
        } else if (data.status === 'error' || data.txn_status === 'TXN_FAILED') {
          // Payment failed
          clearInterval(self.pollingInterval);
          clearInterval(self.paymentTimer);
          self._handleFailure({ error_description: data.message || 'Payment failed' });
        }
        // Otherwise, continue polling
      })
      .catch(function(error) {
        console.error('Error checking payment status:', error);
        // Continue polling on error
      });
    }, 2000); // Poll every 2 seconds
  };

  /**
   * Close payment window/modal
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
    
    if (this.paymentWindow) {
      if (this.paymentWindow.remove) {
        // Modal overlay
        this.paymentWindow.remove();
      } else {
        // Popup window
        this.paymentWindow.close();
      }
      this.paymentWindow = null;
      
      if (this.options.onDismiss) {
        this.options.onDismiss();
      }
    }
  };

  /**
   * Handle payment success
   */
  CrazzyPe.prototype._handleSuccess = function(data) {
    var self = this;
    this.close();
    
    var response = {
      crazzype_payment_id: data.payment_id || data.order_id,
      crazzype_order_id: data.order_id || this.options.order_id,
      crazzype_signature: data.signature || data.hash,
      order_id: data.order_id || this.options.order_id,
      payment_id: data.payment_id,
      signature: data.signature || data.hash
    };
    
    // If callback_url is provided, trigger server-to-server callback
    if (this.options.callback_url) {
      this._triggerServerCallback(response)
        .then(function() {
          // Call handler after callback
          if (self.options.handler) {
            self.options.handler(response);
          }
          
          if (self.options.onSuccess) {
            self.options.onSuccess(response);
          }
        })
        .catch(function(error) {
          console.error('Error in server callback:', error);
          // Still call handler even if callback fails
          if (self.options.handler) {
            self.options.handler(response);
          }
          
          if (self.options.onSuccess) {
            self.options.onSuccess(response);
          }
        });
    } else {
      // Verify signature if callback_url is not provided
      this._verifySignature(response)
        .then(function() {
          // Call handler after verification
          if (self.options.handler) {
            self.options.handler(response);
          }
          
          if (self.options.onSuccess) {
            self.options.onSuccess(response);
          }
        })
        .catch(function(error) {
          console.error('Signature verification failed:', error);
          // Still call handler
          if (self.options.handler) {
            self.options.handler(response);
          }
          
          if (self.options.onSuccess) {
            self.options.onSuccess(response);
          }
        });
    }
  };

  /**
   * Trigger server-to-server callback
   */
  CrazzyPe.prototype._triggerServerCallback = function(response) {
    var self = this;
    
    return new Promise(function(resolve, reject) {
      fetch(API_BASE_URL + '/api/orders/incognito-callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          order_id: response.order_id,
          payment_id: response.payment_id,
          signature: response.signature,
          callback_url: self.options.callback_url
        })
      })
      .then(function(res) {
        return res.json();
      })
      .then(function(data) {
        if (data.status === 'success' && data.verified) {
          resolve(data);
        } else {
          reject(new Error(data.message || 'Callback verification failed'));
        }
      })
      .catch(function(error) {
        reject(error);
      });
    });
  };

  /**
   * Handle payment failure
   */
  CrazzyPe.prototype._handleFailure = function(data) {
    this.close();
    
    var error = {
      error: {
        code: data.error_code || 'PAYMENT_FAILED',
        description: data.error_description || 'Payment failed',
        source: 'customer',
        step: 'payment',
        reason: data.reason || 'unknown'
      }
    };
    
    if (this.options.onFailure) {
      this.options.onFailure(error);
    }
  };

  /**
   * Handle error
   */
  CrazzyPe.prototype._handleError = function(message) {
    if (this.options.onFailure) {
      this.options.onFailure({
        error: {
          code: 'INTERNAL_ERROR',
          description: message,
          source: 'server',
          step: 'initialization',
          reason: 'server_error'
        }
      });
    } else {
      alert('Error: ' + message);
    }
  };

  /**
   * Verify payment signature
   */
  CrazzyPe.prototype._verifySignature = function(response) {
    var self = this;
    
    if (!response.signature && !response.hash) {
      console.warn('No signature provided for verification');
      return Promise.reject(new Error('No signature provided'));
    }
    
    // Verify signature on server
    return fetch(API_BASE_URL + '/api/orders/verify-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.options.key
      },
      body: JSON.stringify({
        order_id: response.crazzype_order_id || response.order_id,
        payment_id: response.crazzype_payment_id || response.payment_id,
        signature: response.crazzype_signature || response.signature || response.hash
      })
    })
    .then(function(res) {
      return res.json();
    })
    .then(function(data) {
      if (data.verified) {
        console.log('Payment signature verified successfully');
        if (self.options.onVerificationSuccess) {
          self.options.onVerificationSuccess(data);
        }
        return data;
      } else {
        console.warn('Payment signature verification failed:', data.message);
        if (self.options.onVerificationFailure) {
          self.options.onVerificationFailure(data);
        }
        throw new Error(data.message || 'Verification failed');
      }
    })
    .catch(function(error) {
      console.error('Error verifying signature:', error);
      if (self.options.onVerificationFailure) {
        self.options.onVerificationFailure({ error: error.message });
      }
      throw error;
    });
  };

  // Export to global scope
  if (typeof window !== 'undefined') {
    window.CrazzyPe = CrazzyPe;
  }

})();

