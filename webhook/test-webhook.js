const axios = require('axios');
const crypto = require('crypto');

async function testWebhook() {
  const secret = 'test_secret_123';
  const url = 'http://localhost:9999/webhook';
  const timestamp = Math.floor(Date.now() / 1000).toString();
  
  const payload = {
    event: 'transaction.confirmed',
    timestamp: new Date().toISOString(),
    data: {
      transactionId: 'tx_987654321',
      status: 'confirmed',
      blockchain: 'ETH'
    }
  };

  const payloadString = JSON.stringify(payload);
  const signaturePayload = `${timestamp}.${payloadString}`;
  const signature = crypto
    .createHmac('sha256', secret)
    .update(signaturePayload)
    .digest('hex');

  console.log('--- Sending Test Webhook ---');
  console.log('Secret:', secret);
  console.log('Timestamp:', timestamp);
  console.log('Signature:', signature);

  try {
    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': `sha256=${signature}`,
        'X-Webhook-Timestamp': timestamp,
        'X-Webhook-Event': 'transaction.confirmed',
        'X-Webhook-Id': 'evt_id_123'
      }
    });

    console.log('\nResponse Status:', response.status);
    console.log('Response Data:', response.data);
    console.log('SUCCESS: Webhook verified and processed.');
  } catch (error) {
    console.error('\nFAILED: Webhook request failed.');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testWebhook();
