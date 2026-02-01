# Planbok Webhook Example Server

A lightweight Express server for receiving and verifying webhooks from the Planbok MPC System.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Configure environment variables:

   ```bash
   cp .env.example .env
   # Edit .env and set your WEBHOOK_SECRET
   ```

3. Start the server:
   ```bash
   npm start
   ```

## Security Implementation

This example implementation follows best practices for securing webhooks:

- **HMAC Verification**: Uses standard HMAC-SHA256 to verify that requests originate from Planbok.
- **Replay Protection**: Verifies the `X-Webhook-Timestamp` is within a 5-minute window.
- **Raw Body Processing**: Captures the exact request body bytes to ensure accurate signature matching.
- **Timing Safe Comparison**: Uses `crypto.timingSafeEqual` to prevent timing attacks.

## Webhook Headers

| Header                | Description                                       |
| --------------------- | ------------------------------------------------- |
| `X-Webhook-Signature` | HMAC-SHA256 signature (prefixed with `sha256=`)   |
| `X-Webhook-Timestamp` | Unix timestamp of the request                     |
| `X-Webhook-Event`     | The type of event (e.g., `transaction.confirmed`) |
| `X-Webhook-Id`        | Unique event ID (useful for idempotency)          |

## Testing

You can use the provided `test-webhook.js` script to verify your setup:

```bash
node test-webhook.js
```
