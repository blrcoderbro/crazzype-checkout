# CrazzyPe Checkout.js - PHP Integration Guide

## Overview

CrazzyPe Checkout.js is a **premium incognito payment feature** that allows you to process payments directly on your website without redirecting users. The payment interface loads in an iframe, providing a seamless checkout experience.

## Prerequisites

1. **Premium Plan**: You must have a plan that includes the "Incognito Checkout" feature
2. **API Key**: Your CrazzyPe API key (available in your dashboard)
3. **API Key Configuration**: Add your website domain to the API key's allowed origins in your CrazzyPe dashboard (e.g., `https://yoursite.com`)
4. **PHP 7.4+**: Required for the examples below

## Important: Origin Validation

checkout.js automatically validates your origin before proceeding. You must add your website domain to your API key's allowed origins in the CrazzyPe dashboard. Only domains listed in the allowed origins can use checkout.js with your API key. This ensures security and prevents unauthorized usage.

## Installation

### Step 1: Configure API Key Allowed Origins

Before using checkout.js, go to your CrazzyPe dashboard → API Keys section, and add your website domain to the "Allowed URL" field (e.g., `https://yoursite.com`). This ensures only your domain can use checkout.js with your API key.

### Step 2: Include checkout.js

checkout.js is a self-contained, single-file solution that works standalone - no backend proxy required. Add the CrazzyPe checkout.js script to your HTML page:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Payment Page</title>
    <script src="https://cdn.jsdelivr.net/gh/blrcoderbro/crazzype-checkout@refs/heads/main/checkout.js"></script>
</head>
<body>
    <!-- Your payment form -->
</body>
</html>
```

## Basic Integration

### Step 1: Create Order (Server-Side)

Create a PHP file to handle order creation:

```php
<?php
// create_order.php

$apiKey = 'YOUR_API_KEY'; // Replace with your API key
$apiUrl = 'https://merchants.crazzype.com/api/orders/create-order';

// Order details
$orderData = [
    'txn_id' => 'order_' . time() . '_' . rand(1000, 9999),
    'amount' => '500.00', // Amount in rupees (as string)
    'p_info' => 'Product Purchase',
    'customer_name' => $_POST['customer_name'] ?? 'Customer Name',
    'customer_email' => $_POST['customer_email'] ?? 'customer@example.com',
    'customer_mobile' => $_POST['customer_mobile'] ?? '9876543210',
    'redirect_url' => 'https://yoursite.com/payment-callback.php',
    'udf1' => 'Additional Info 1',
    'udf2' => 'Additional Info 2',
    'udf3' => 'Additional Info 3'
];

// Initialize cURL
$ch = curl_init($apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($orderData));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer ' . $apiKey
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 201) {
    $result = json_decode($response, true);
    echo json_encode([
        'success' => true,
        'order_id' => $result['order_id'],
        'payment_url' => $result['payment_url']
    ]);
} else {
    echo json_encode([
        'success' => false,
        'error' => json_decode($response, true)
    ]);
}
?>
```

### Step 2: Initialize Checkout (Client-Side)

checkout.js automatically validates your origin before proceeding. If your domain is not in the API key's allowed origins, it will show an error and not proceed. All API calls are made directly to CrazzyPe - no backend proxy needed.

```html
<!DOCTYPE html>
<html>
<head>
    <title>Payment</title>
    <script src="https://cdn.jsdelivr.net/gh/blrcoderbro/crazzype-checkout@refs/heads/main/checkout.js"></script>
</head>
<body>
    <button id="pay-button">Pay Now</button>

    <script>
        document.getElementById('pay-button').addEventListener('click', function() {
            // Initialize CrazzyPe Checkout
            var options = {
                key: 'YOUR_API_KEY', // Your API key
                amount: '500.00', // Amount in rupees (as string)
                currency: 'INR',
                name: 'Your Company Name',
                description: 'Product Purchase',
                order_id: 'order_123456789', // Optional: will be auto-generated if not provided
                callback_url: 'https://yoursite.com/payment-callback.php', // Server-to-server callback URL
                prefill: {
                    name: 'John Doe',
                    email: 'john@example.com',
                    contact: '9876543210'
                },
                notes: {
                    udf1: 'Additional Info 1',
                    udf2: 'Additional Info 2',
                    udf3: 'Additional Info 3'
                },
                handler: function(response) {
                    // This is called after payment success
                    console.log('Payment Success:', response);
                    // Redirect or show success message
                    window.location.href = 'success.php?order_id=' + response.order_id;
                },
                onSuccess: function(response) {
                    // Additional success handler
                    console.log('Payment verified:', response);
                },
                onFailure: function(error) {
                    // Handle payment failure
                    console.error('Payment failed:', error);
                    alert('Payment failed: ' + error.error.description);
                }
            };

            var cpz = new CrazzyPe(options);
            cpz.open();
        });
    </script>
</body>
</html>
```

## Server-to-Server Callback

When you provide a `callback_url`, CrazzyPe will send a POST request to your server after payment verification. Create a callback handler:

```php
<?php
// payment-callback.php

// Get POST data
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Verify the callback
$orderId = $data['order_id'] ?? null;
$paymentId = $data['payment_id'] ?? null;
$amount = $data['amount'] ?? null;
$status = $data['status'] ?? null;
$signature = $data['signature'] ?? null;
$timestamp = $data['timestamp'] ?? null;

if ($status === 'success' && $orderId && $paymentId) {
    // Verify payment on your end
    // You can call the verify-payment API to double-check
    
    // Update your database
    // Example:
    // $pdo = new PDO('mysql:host=localhost;dbname=yourdb', 'user', 'pass');
    // $stmt = $pdo->prepare("UPDATE orders SET status = 'paid', payment_id = ? WHERE order_id = ?");
    // $stmt->execute([$paymentId, $orderId]);
    
    // Return success response
    http_response_code(200);
    echo json_encode(['status' => 'success', 'message' => 'Callback received']);
} else {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid callback data']);
}
?>
```

## Complete Example

Here's a complete example with order creation and payment:

```php
<?php
// index.php - Payment Page

session_start();

// If order is not created, create it
if (!isset($_SESSION['order_id'])) {
    $apiKey = 'YOUR_API_KEY';
    $apiUrl = 'https://merchants.crazzype.com/api/orders/create-order';
    
    $orderData = [
        'txn_id' => 'order_' . time() . '_' . rand(1000, 9999),
        'amount' => '500.00',
        'p_info' => 'Product Purchase',
        'customer_name' => 'John Doe',
        'customer_email' => 'john@example.com',
        'customer_mobile' => '9876543210',
        'redirect_url' => 'https://yoursite.com/payment-callback.php',
        'udf1' => 'Order #123',
        'udf2' => '',
        'udf3' => ''
    ];
    
    $ch = curl_init($apiUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($orderData));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $apiKey
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode === 201) {
        $result = json_decode($response, true);
        $_SESSION['order_id'] = $result['order_id'];
    } else {
        die('Failed to create order');
    }
}
?>
<!DOCTYPE html>
<html>
<head>
    <title>Payment</title>
    <script src="https://cdn.jsdelivr.net/gh/blrcoderbro/crazzype-checkout@refs/heads/main/checkout.js"></script>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 50px auto;
            padding: 20px;
        }
        #pay-button {
            background: #4CAF50;
            color: white;
            padding: 15px 30px;
            border: none;
            border-radius: 5px;
            font-size: 16px;
            cursor: pointer;
        }
        #pay-button:hover {
            background: #45a049;
        }
    </style>
</head>
<body>
    <h1>Complete Payment</h1>
    <p>Amount: ₹500.00</p>
    <p>Order ID: <?php echo $_SESSION['order_id']; ?></p>
    
    <button id="pay-button">Pay Now</button>

    <script>
        document.getElementById('pay-button').addEventListener('click', function() {
            var options = {
                key: '<?php echo $apiKey; ?>',
                amount: '500.00',
                currency: 'INR',
                name: 'Your Company',
                description: 'Product Purchase',
                order_id: '<?php echo $_SESSION['order_id']; ?>',
                callback_url: 'https://yoursite.com/payment-callback.php',
                prefill: {
                    name: 'John Doe',
                    email: 'john@example.com',
                    contact: '9876543210'
                },
                handler: function(response) {
                    // Payment successful
                    window.location.href = 'success.php?order_id=' + response.order_id;
                },
                onFailure: function(error) {
                    alert('Payment failed: ' + error.error.description);
                }
            };

            var cpz = new CrazzyPe(options);
            cpz.open();
        });
    </script>
</body>
</html>
```

## Advanced Options

### Custom Modal Styling

```javascript
var options = {
    // ... other options
    modal: {
        backdropclose: true, // Allow closing by clicking backdrop
        escapekey: true // Allow closing with ESC key
    },
    theme: {
        color: '#4CAF50' // Custom color
    }
};
```

### Without Server-to-Server Callback

If you don't provide a `callback_url`, the payment will be verified client-side:

```javascript
var options = {
    key: 'YOUR_API_KEY',
    amount: '500.00',
    handler: function(response) {
        // Payment details available in response
        console.log('Order ID:', response.order_id);
        console.log('Payment ID:', response.payment_id);
        console.log('Signature:', response.signature);
        
        // Verify payment on your server
        fetch('verify-payment.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                order_id: response.order_id,
                payment_id: response.payment_id,
                signature: response.signature
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.verified) {
                window.location.href = 'success.php';
            } else {
                alert('Payment verification failed');
            }
        });
    }
};
```

## Error Handling

```javascript
var options = {
    // ... other options
    onFailure: function(error) {
        console.error('Payment Error:', error);
        
        switch(error.error.code) {
            case 'PAYMENT_FAILED':
                alert('Payment was declined. Please try again.');
                break;
            case 'TIMEOUT':
                alert('Payment timed out. Please try again.');
                break;
            case 'USER_CANCELLED':
                alert('Payment was cancelled.');
                break;
            default:
                alert('An error occurred: ' + error.error.description);
        }
    },
    onDismiss: function() {
        console.log('Payment window was closed');
    }
};
```

## Response Object

The `handler` function receives a response object with the following structure:

```javascript
{
    order_id: "order_123456789",
    payment_id: "UPI123456789",
    signature: "abc123def456...",
    crazzype_order_id: "order_123456789",
    crazzype_payment_id: "UPI123456789",
    crazzype_signature: "abc123def456..."
}
```

## Important Notes

1. **Premium Feature**: Incognito checkout is only available for users with plans that include this feature
2. **Amount Format**: Always provide amount as a string in rupees (e.g., "500.00" for ₹500.00)
3. **API Key Security**: Never expose your API key in client-side code in production. Use server-side order creation
4. **Callback URL**: Always use HTTPS for callback URLs in production
5. **Signature Verification**: Always verify the payment signature on your server before marking orders as paid

## Support

For issues or questions:
- Email: support@crazzype.com
- Documentation: https://merchants.crazzype.com/docs
