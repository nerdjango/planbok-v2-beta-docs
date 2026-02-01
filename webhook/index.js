require('dotenv').config();
const express = require('express');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 9999;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

if (!WEBHOOK_SECRET) {
  console.error('ERROR: WEBHOOK_SECRET is not defined in environment variables.');
  process.exit(1);
}

/**
 * Signature verification middleware
 * Expected headers from Planbok MPC System:
 * - X-Webhook-Signature: sha256=<signature>
 * - X-Webhook-Timestamp: <unix_timestamp>
 */
const verifySignature = (req, res, next) => {
  const signatureHeader = req.get('X-Webhook-Signature');
  const timestampHeader = req.get('X-Webhook-Timestamp');

  if (!signatureHeader || !timestampHeader) {
    console.warn('Missing signature or timestamp headers');
    return res.status(401).send('Missing security headers');
  }

  // 1. Replay protection: Verify timestamp is within 5 minutes
  const now = Math.floor(Date.now() / 1000);
  const timestamp = parseInt(timestampHeader, 10);
  const timeDiff = Math.abs(now - timestamp);

  if (isNaN(timestamp) || timeDiff > 300) {
    console.warn(`Timestamp validation failed. Diff: ${timeDiff}s`);
    return res.status(401).send('Timestamp expired or invalid');
  }

  // 2. Signature verification
  // Format: sha256=<hex_signature>
  const parts = signatureHeader.split('=');
  if (parts.length !== 2 || parts[0] !== 'sha256') {
    console.warn('Invalid signature format');
    return res.status(401).send('Invalid signature format');
  }
  const providedSignature = parts[1];

  // The MPC system signs: `${timestamp}.${payloadBody}`
  const payload = `${timestampHeader}.${req.body.toString()}`;
  const expectedSignature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');

  // Constant-time comparison to prevent timing attacks
  if (!crypto.timingSafeEqual(Buffer.from(providedSignature), Buffer.from(expectedSignature))) {
    console.warn('Signature mismatch');
    return res.status(401).send('Signature verification failed');
  }

  next();
};

// Use raw body parsing to preserve original payload for signature verification
app.use(express.raw({ type: 'application/json' }));

// Health check
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Webhook endpoint
app.post('/webhook', verifySignature, (req, res) => {
  try {
    const payload = JSON.parse(req.body.toString());
    const event = req.get('X-Webhook-Event');

    console.log(`\n--- Received Webhook: ${event} ---`);
    console.log('Timestamp:', req.get('X-Webhook-Timestamp'));
    console.log('Payload:', JSON.stringify(payload, null, 2));
    
    // Process the notification here
    // Example: Update database, send internal alerts, etc.

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error processing webhook payload:', error.message);
    res.status(400).send('Invalid JSON payload');
  }
});

app.listen(PORT, () => {
  console.log(`Webhook server listening on port ${PORT}`);
  console.log(`Endpoint: http://localhost:${PORT}/webhook`);
});
