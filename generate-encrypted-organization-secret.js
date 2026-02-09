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
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAxCgNoHHK0nMXEgNUkhaM
H6puWYG/QoKAryoe+aBs6DnJkLG/SaQsdA5RDeOUuIc0gRMYUGvoAZ2VPOou0eoO
ykMjTKeggBqmOfu41Aea/R01w3ioPw7CYk6l8baGHpuQRvOwo1VgJrEA6EgN3Snv
AEl2NTWC+D/CrfFU1YGIFVtshdZI56MYqE87XIgBgaZK9fyTRiZTHWaSACbgrqm8
rWX2/KzV4OajOZwrYl/6ZvbJ2B9BaD6BUEPHcwWdm3xFX3uWpyL0p/Km5YWObwzW
6LR6zWDteEuCT1eTrdKjW7eFIEH3yck93wTKf17w575R9uWEZxi/ohUvlaVpkp28
eQIDAQAB
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