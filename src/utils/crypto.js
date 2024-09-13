// src/utils/crypto.js
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const crypto = require('crypto');

const algorithm = 'aes-256-ctr';
const secretKey = process.env.APIAUTH;
const iv = Buffer.from(process.env.IV, 'utf-8');

/**
 * Encrypts a given text using AES-256-CTR algorithm.
 * @param {string} text
 * @returns {Promise<Object>}
 */
async function encrypt(text) {
  return new Promise((resolve, reject) => {
    if (typeof text !== 'string') {
      return reject(new TypeError('The "text" argument must be of type string.'));
    }
    
    const keyBuffer = Buffer.from(secretKey, 'hex');
    
    if (keyBuffer.length !== 32) {
      return reject(new Error('Invalid key length. Key must be 32 bytes for AES-256.'));
    }

    const cipher = crypto.createCipheriv(algorithm, keyBuffer, iv);
    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
    
    resolve({
      iv: iv.toString('hex'),
      content: encrypted.toString('hex')
    });
  });
}

/**
 * Decrypts a given hash using AES-256-CTR algorithm.
 * @param {Object} hash
 * @returns {Promise<string>}
 */
async function decrypt(hash) {
  return new Promise((resolve, reject) => {
    if (!hash || !hash.iv || !hash.content) {
      return reject(new TypeError('Invalid hash object. Must contain iv and content.'));
    }

    const keyBuffer = Buffer.from(secretKey, 'hex');
    const decipher = crypto.createDecipheriv(algorithm, keyBuffer, iv);
    const decrypted = Buffer.concat([decipher.update(Buffer.from(hash.content, 'hex')), decipher.final()]);
    
    resolve(decrypted.toString());
  });
}

// async function encryptPracticeCode() {
//   const practiceCode = '9999';
  
//   try {
//       const encrypted = await encrypt(practiceCode);
//       console.log('Encrypted Code:', encrypted.content); // This will log the encrypted content
//   } catch (error) {
//       console.error('Error encrypting practice code:', error);
//   }
// }

// encryptPracticeCode();

module.exports = { encrypt, decrypt };