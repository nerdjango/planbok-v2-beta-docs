/**
 * Crypto Module Import
 * We require the native Node.js 'crypto' module to handle cryptographic operations
 * such as random byte generation and public-key encryption.
 */
const crypto = require("crypto");

/**
 * Organization Public Key
 * This is the RSA public key associated with the organization.
 * It is used to encrypt the secret so that only the holder of the
 * corresponding private key can decrypt it.
 * 
 * Paste the public key from the Planbok dashboard.
 */
const organizationPublicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0g+zt0XaWKG4KTKlacGX
JWnKbynTxRqJmIDH2i4PCeD6jj75ePmXK3hM7EZNOfLgqzQcPqLjEVFrSaimWnVe
f7r0lXE1NQ/GeoZYuk1I+81ebamC8MzKALYi7OJk/stin/ylU2ATH3QW1dWa6fq3
Z6iJG8DaLd6mIstLAglXgvzMdyoLWRm0WcfYlpPkSm73IwNQMespZAjSL9pG7mjM
GhiCTp5Lzb5eKtbi4I/puFrNQkQ0uczevSN63wUiBXXXlEx8dnmtsXmuli/UJAfg
R/YB1wrdkI1GzepkYdiVcl0L+RcSzr34KkwZ6ablvmS8O/hM9DnRH08/VxHpw2Ov
KwIDAQAB
-----END PUBLIC KEY-----`;

/**
 * Organization Secret
 * A 32-byte hex string representing the shared secret.
 * If this is empty, a new random secret will be generated.
 * 
 * Just copy and paste here to use in the future.
 */
let organizationSecretHex = "79f733a81c566da48f20828b2443c708fffbd7c0eafff0373ff3ed88696123cd";

/**
 * Encrypts data using the provided RSA Public Key.
 * Uses OAEP padding with SHA-256 for enhanced security.
 * 
 * @param {string} publicKey - PEM encoded public key
 * @param {string} data - Data to encrypt
 * @returns {string} - Base64 encoded ciphertext
 */
function encryptWithPublicKey(publicKey, data) {
  const buffer = Buffer.from(data, 'utf8');
  const encrypted = crypto.publicEncrypt(
    {
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256',
    },
    buffer
  );
  return encrypted.toString('base64');
}

function main() {
    // Secret Generation
    // If no specific secret is provided, safely generate a random 32-byte hex string.
    if (!organizationSecretHex) {
        console.log("No organization secret provided. Generating a new one...");
        const randomBytes = crypto.randomBytes(32);
        organizationSecretHex = randomBytes.toString('hex');
        console.log('Generated organization secret: ', organizationSecretHex);
    } else {
        console.log('Using existing organization secret');
    }
    
    // Convert and Validate
    // Convert hex string to buffer and verify distinct length (32 bytes).
    const organizationSecret = Buffer.from(organizationSecretHex, 'hex');
    if (organizationSecret.length != 32) {
        console.log("invalid organization secret");
        return;
    }

    // Construct Payload
    // Create a JSON object containing the secret, timestamp and context metadata.
    // Use 'dkg' for organization setup/DKG initiation.
    // Use 'sign' for creating wallets, signing transactions, or signing messages.
    // node generate-encrypted-organization-secret.js sign
    const args = process.argv.slice(2);
    const context = args[0] || 'dkg';
    console.log('Using context:', context); 

    let secretPayload = JSON.stringify({
      secret: organizationSecretHex,
      timestamp: Date.now(),
      context: context,
    });

    // Encrypt Payload
    // Encrypt the JSON payload using the organization's public key.
    const encryptedData = encryptWithPublicKey(organizationPublicKey, secretPayload);

    // Final Output
    // Print the resulting encrypted ciphertext.
    console.log("Organization secret ciphertext: ", encryptedData);
}

if (require.main === module) {
    main();
}