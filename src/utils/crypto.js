const crypto = require('crypto');

const algorithm = 'aes-256-ctr';
const secretKey = 'vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3'; // This should be stored securely, not in the code

function encrypt(text) {
  console.log('Encrypting text:', text);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
  const result = {
    iv: iv.toString('hex'),
    content: encrypted.toString('hex')
  };
  console.log('Encrypted result:', result);
  return result;
}

function decrypt(hash) {
  console.log('Decrypting hash:', hash);
  const decipher = crypto.createDecipheriv(algorithm, secretKey, Buffer.from(hash.iv, 'hex'));
  const decrypted = Buffer.concat([decipher.update(Buffer.from(hash.content, 'hex')), decipher.final()]);
  const result = decrypted.toString();
  console.log('Decrypted result:', result);
  return result;
}

module.exports = {
  encrypt,
  decrypt
};