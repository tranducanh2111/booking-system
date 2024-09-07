const crypto = require('crypto');

const algorithm = process.env.ENCRYPTION_ALGORITHM || 'aes-256-ctr';
const secretKey = process.env.ENCRYPTION_SECRET_KEY || 'vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3';

const cryptoOperation = async (data, operation) => {
  try {
    const iv = operation === 'encrypt' ? crypto.randomBytes(16) : Buffer.from(data.iv, 'hex');
    const key = crypto.scryptSync(secretKey, 'salt', 32);

    const cipher = operation === 'encrypt'
      ? crypto.createCipheriv(algorithm, key, iv)
      : crypto.createDecipheriv(algorithm, key, iv);

    const input = operation === 'encrypt' ? JSON.stringify(data) : Buffer.from(data.content, 'hex');
    const output = Buffer.concat([cipher.update(input), cipher.final()]);

    return operation === 'encrypt'
      ? { iv: iv.toString('hex'), content: output.toString('hex') }
      : JSON.parse(output.toString());
  } catch (error) {
    console.error(`Crypto operation failed: ${error.message}`);
    throw new Error(`Crypto operation failed: ${error.message}`);
  }
};

const encrypt = (data) => cryptoOperation(data, 'encrypt');
const decrypt = (data) => cryptoOperation(data, 'decrypt');

module.exports = { encrypt, decrypt };