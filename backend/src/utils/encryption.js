const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const ITERATIONS = 100000;

class EncryptionService {
  constructor() {
    this.key = this.deriveKey(process.env.ENCRYPTION_KEY || 'default-key-change-this');
  }

  deriveKey(password, salt = null) {
    if (!salt) {
      salt = crypto.randomBytes(SALT_LENGTH);
    }
    return {
      key: crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, 'sha512'),
      salt: salt
    };
  }

  encrypt(text) {
    try {
      const iv = crypto.randomBytes(IV_LENGTH);
      const cipher = crypto.createCipheriv(ALGORITHM, this.key.key, iv);
      
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const tag = cipher.getAuthTag();
      
      return {
        encrypted: encrypted,
        iv: iv.toString('hex'),
        tag: tag.toString('hex'),
        salt: this.key.salt.toString('hex')
      };
    } catch (error) {
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }

  decrypt(encryptedData) {
    try {
      const { encrypted, iv, tag, salt } = encryptedData;
      
      const decipher = crypto.createDecipheriv(
        ALGORITHM,
        this.key.key,
        Buffer.from(iv, 'hex')
      );
      
      decipher.setAuthTag(Buffer.from(tag, 'hex'));
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }

  hash(text) {
    return crypto.createHash('sha256').update(text).digest('hex');
  }

  generateToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }
}

module.exports = new EncryptionService();
