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

    // Order ID can be provided or will be created automatically
    // If not provided, we'll create order in _fetchPaymentUrl

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
    this.paymentToken = null;
    this.orderDetails = null;
  }

  /**
   * Open the payment checkout (Incognito Mode - Premium Feature)
   */
  CrazzyPe.prototype.open = function() {
    var self = this;
    
        // First, check if user has incognito feature
        this._checkIncognitoFeature()
          .then(function(hasFeature) {
            if (!hasFeature) {
              self._handleError('Incognito checkout is a premium feature. Please upgrade your plan to use checkout.js. If you already have the feature, please check your API key and try again.');
              return;
            }
            
            // Fetch order details and payment URL
            return self._fetchPaymentUrl();
          })
      .then(function(data) {
        if (!data) return; // Error already handled
        
        if (data.payment_url) {
          self.paymentToken = data.payment_token || null;
          self.orderDetails = data;
          
          // Always use incognito/iframe mode (modal)
          self._openModal(data.payment_url);
        } else {
          self._handleError('Failed to get payment URL');
        }
      })
      .catch(function(error) {
        self._handleError(error.message || 'Failed to initialize payment');
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
        // Handle non-OK responses
        if (!response.ok) {
          // Try to parse error response
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
        // Don't reject, just resolve with false to allow graceful degradation
        // The error will be shown when trying to open payment
        resolve(false);
      });
    });
  };

  /**
   * Fetch payment URL from server
   */
  CrazzyPe.prototype._fetchPaymentUrl = function() {
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
        // Handle non-OK responses
        if (!response.ok) {
          // Try to parse error response
          return response.json().then(function(data) {
            throw new Error(data.message || 'Failed to create order. Status: ' + response.status);
          }).catch(function() {
            throw new Error('Server error (Status: ' + response.status + '). Please check your API key and try again.');
          });
        }
        return response.json();
      })
      .then(function(data) {
        if (data.status === 'success' && data.payment_url) {
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
   * Open payment in modal overlay
   */
  CrazzyPe.prototype._openModal = function(url) {
    var self = this;
    
    // Create modal overlay
    var overlay = document.createElement('div');
    overlay.id = 'crazzype-modal-overlay';
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:999999;display:flex;align-items:center;justify-content:center;';
    
    // Create modal container
    var modal = document.createElement('div');
    modal.id = 'crazzype-modal';
    modal.style.cssText = 'background:white;border-radius:8px;width:90%;max-width:500px;height:80%;max-height:600px;position:relative;box-shadow:0 4px 20px rgba(0,0,0,0.3);';
    
    // Create close button
    var closeBtn = document.createElement('button');
    closeBtn.innerHTML = '×';
    closeBtn.style.cssText = 'position:absolute;top:10px;right:10px;background:none;border:none;font-size:24px;cursor:pointer;z-index:1000000;color:#666;';
    closeBtn.onclick = function() {
      self.close();
    };
    
    // Create iframe
    var iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.style.cssText = 'width:100%;height:100%;border:none;border-radius:8px;';
    iframe.onload = function() {
      // Listen for postMessage from payment page
      var messageHandler = function(event) {
        if (event.data && event.data.type === 'crazzype-payment-success') {
          self._handleSuccess(event.data);
          window.removeEventListener('message', messageHandler);
        } else if (event.data && event.data.type === 'crazzype-payment-failure') {
          self._handleFailure(event.data);
          window.removeEventListener('message', messageHandler);
        }
      };
      window.addEventListener('message', messageHandler);
      
      // Also poll for URL changes in iframe (for callback URL handling)
      var pollInterval = setInterval(function() {
        try {
          var iframeUrl = iframe.contentWindow.location.href;
          if (iframeUrl && iframeUrl.includes('status=success')) {
            var urlParams = new URLSearchParams(iframeUrl.split('?')[1]);
            var status = urlParams.get('status');
            var orderId = urlParams.get('order_id');
            var hash = urlParams.get('hash');
            
            if (status === 'success' && orderId && hash) {
              clearInterval(pollInterval);
              // Fetch payment details to get payment_id
              self._fetchPaymentDetails(orderId, hash);
            }
          } else if (iframeUrl && iframeUrl.includes('status=failed')) {
            clearInterval(pollInterval);
            self._handleFailure({ error_description: 'Payment failed' });
          }
        } catch (e) {
          // Cross-origin error, ignore
        }
      }, 1000);
      
      // Clean up interval when modal closes
      var originalClose = self.close;
      self.close = function() {
        clearInterval(pollInterval);
        window.removeEventListener('message', messageHandler);
        originalClose.call(self);
      };
    };
    
    modal.appendChild(closeBtn);
    modal.appendChild(iframe);
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
  };

  /**
   * Open payment in new window
   */
  CrazzyPe.prototype._openWindow = function(url) {
    var width = 600;
    var height = 700;
    var left = (screen.width - width) / 2;
    var top = (screen.height - height) / 2;
    
    this.paymentWindow = window.open(
      url,
      'CrazzyPePayment',
      'width=' + width + ',height=' + height + ',left=' + left + ',top=' + top + ',resizable=yes,scrollbars=yes'
    );
    
    if (!this.paymentWindow) {
      this._handleError('Popup blocked. Please allow popups for this site.');
      return;
    }
    
    // Poll for window close
    var self = this;
    var pollTimer = setInterval(function() {
      if (self.paymentWindow.closed) {
        clearInterval(pollTimer);
        if (self.options.onDismiss) {
          self.options.onDismiss();
        }
      }
    }, 500);
  };

  /**
   * Close payment window/modal
   */
  CrazzyPe.prototype.close = function() {
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
   * Fetch payment details from callback URL
   */
  CrazzyPe.prototype._fetchPaymentDetails = function(orderId, hash) {
    var self = this;
    
    // Check order status to get payment details
    fetch(API_BASE_URL + '/api/orders/check-order-status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.options.key
      },
      body: JSON.stringify({
        order_id: orderId
      })
    })
    .then(function(res) {
      return res.json();
    })
    .then(function(data) {
      if (data.status === 'success' && data.data) {
        var paymentData = {
          order_id: orderId,
          payment_id: data.data.upi_txn_id || data.data.payment_id,
          signature: hash,
          hash: hash
        };
        self._handleSuccess(paymentData);
      } else {
        self._handleFailure({ error_description: 'Payment verification failed' });
      }
    })
    .catch(function(error) {
      console.error('Error fetching payment details:', error);
      self._handleFailure({ error_description: 'Failed to verify payment' });
    });
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
        // Optionally call a success callback
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
