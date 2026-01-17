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
    
    // Create modal overlay
    var overlay = document.createElement('div');
    overlay.id = 'crazzype-modal-overlay';
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:999999;display:flex;align-items:center;justify-content:center;';
    
    // Create modal container
    var modal = document.createElement('div');
    modal.id = 'crazzype-modal';
    modal.style.cssText = 'background:white;border-radius:12px;width:90%;max-width:450px;max-height:90vh;overflow-y:auto;position:relative;box-shadow:0 8px 32px rgba(0,0,0,0.3);';
    
    // Create close button
    var closeBtn = document.createElement('button');
    closeBtn.innerHTML = '×';
    closeBtn.style.cssText = 'position:absolute;top:15px;right:15px;background:none;border:none;font-size:28px;cursor:pointer;z-index:1000000;color:#666;width:32px;height:32px;display:flex;align-items:center;justify-content:center;line-height:1;';
    closeBtn.onclick = function() {
      self.close();
    };
    
    // Create modal content
    var content = document.createElement('div');
    content.style.cssText = 'padding:30px;';
    
    // Merchant name/logo
    var merchantHeader = document.createElement('div');
    merchantHeader.style.cssText = 'text-align:center;margin-bottom:20px;';
    if (self.options.image) {
      var logo = document.createElement('img');
      logo.src = self.options.image;
      logo.style.cssText = 'max-width:80px;max-height:80px;margin-bottom:10px;border-radius:8px;';
      merchantHeader.appendChild(logo);
    }
    var merchantName = document.createElement('h2');
    merchantName.textContent = self.options.name;
    merchantName.style.cssText = 'margin:0;font-size:20px;font-weight:600;color:#333;';
    merchantHeader.appendChild(merchantName);
    content.appendChild(merchantHeader);
    
    // Amount
    var amountDiv = document.createElement('div');
    amountDiv.style.cssText = 'text-align:center;margin-bottom:25px;';
    var amountLabel = document.createElement('div');
    amountLabel.textContent = 'Amount to Pay';
    amountLabel.style.cssText = 'font-size:14px;color:#666;margin-bottom:5px;';
    var amountValue = document.createElement('div');
    amountValue.textContent = '₹' + parseFloat(self.options.amount).toFixed(2);
    amountValue.style.cssText = 'font-size:32px;font-weight:700;color:#333;';
    amountDiv.appendChild(amountLabel);
    amountDiv.appendChild(amountValue);
    content.appendChild(amountDiv);
    
    // Timer
    var timerDiv = document.createElement('div');
    timerDiv.id = 'crazzype-timer';
    timerDiv.style.cssText = 'text-align:center;margin-bottom:25px;padding:10px;background:#fff3cd;border-radius:8px;';
    var timerText = document.createElement('div');
    timerText.id = 'crazzype-timer-text';
    timerText.textContent = 'Time remaining: 5:00';
    timerText.style.cssText = 'font-size:14px;font-weight:600;color:#856404;';
    timerDiv.appendChild(timerText);
    content.appendChild(timerDiv);
    
    // QR Code
    if (orderData.qr_code) {
      var qrDiv = document.createElement('div');
      qrDiv.style.cssText = 'text-align:center;margin-bottom:25px;';
      var qrLabel = document.createElement('div');
      qrLabel.textContent = 'Scan QR Code to Pay';
      qrLabel.style.cssText = 'font-size:14px;color:#666;margin-bottom:10px;';
      var qrImg = document.createElement('img');
      qrImg.src = orderData.qr_code;
      qrImg.style.cssText = 'width:200px;height:200px;border:2px solid #e0e0e0;border-radius:8px;padding:10px;background:white;';
      qrImg.alt = 'Payment QR Code';
      qrDiv.appendChild(qrLabel);
      qrDiv.appendChild(qrImg);
      content.appendChild(qrDiv);
    }
    
    // UPI Payment Link
    if (orderData.upi_intent_link) {
      var upiDiv = document.createElement('div');
      upiDiv.style.cssText = 'text-align:center;margin-bottom:20px;';
      var upiLabel = document.createElement('div');
      upiLabel.textContent = 'Or Pay via UPI App';
      upiLabel.style.cssText = 'font-size:14px;color:#666;margin-bottom:10px;';
      var upiButton = document.createElement('a');
      upiButton.href = orderData.upi_intent_link;
      upiButton.textContent = 'Open UPI App';
      upiButton.style.cssText = 'display:inline-block;padding:12px 24px;background:#007bff;color:white;text-decoration:none;border-radius:8px;font-weight:600;font-size:16px;';
      upiButton.onclick = function(e) {
        // Try to open UPI app
        window.location.href = orderData.upi_intent_link;
        e.preventDefault();
      };
      upiDiv.appendChild(upiLabel);
      upiDiv.appendChild(upiButton);
      content.appendChild(upiDiv);
    }
    
    // Status message
    var statusDiv = document.createElement('div');
    statusDiv.id = 'crazzype-status';
    statusDiv.style.cssText = 'text-align:center;padding:10px;margin-top:20px;font-size:14px;color:#666;';
    statusDiv.textContent = 'Waiting for payment...';
    content.appendChild(statusDiv);
    
    modal.appendChild(closeBtn);
    modal.appendChild(content);
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
