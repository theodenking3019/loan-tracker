const crypto = require('crypto');
const CustomError = require('../utils/customError');

const encryptionKey = process.env.ENCRYPTION_KEY;

function encrypt(text) {
    try {
        const iv = crypto.randomBytes(16); // generate a secure random initialization vector
        const cipher = crypto.createCipheriv(
            'aes-256-gcm',
            Buffer.from(encryptionKey, 'hex'),
            iv
        );

        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const authTag = cipher.getAuthTag(); // get the authentication tag

        return {
            iv: iv.toString('hex'),
            content: encrypted,
            authTag: authTag.toString('hex')
        };
    } catch (err) {
        throw new CustomError('Encryption failure!', 500);
    }
}

module.exports = {
    encrypt
};
