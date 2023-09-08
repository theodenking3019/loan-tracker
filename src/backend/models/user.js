const bcrypt = require('bcrypt');
const CustomError = require('../utils/customError');
const { getDB } = require('../utils/database');
const { encrypt } = require('../utils/encryption');
const { createEthereumAddress } = require('../utils/ethereum');

const User = {
    async create(data) {
        try { 
            const db = getDB();
            data.password = await bcrypt.hash(data.password, 10);
            // Generating an Ethereum address and private key
            const { address, privateKey } = createEthereumAddress();
            data.ethereumAddress = address;
            data.ethereumPrivateKey = encrypt(privateKey);

            return await db.collection('users').insertOne(data);
        } catch (err) {
            throw new CustomError("Failed to create user.", 500);
        }
    },
    
    async findByEmail(email) {
        try {
            const db = getDB();
            return await db.collection('users').findOne({ email });
        } catch (err) {
            throw new CustomError("Failed to fetch user.", 500);
        }
    }
};

module.exports = { User };
