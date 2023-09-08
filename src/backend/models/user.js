// models/user.js
const bcrypt = require('bcrypt');
const { getDB } = require('../utils/database');
const { encrypt } = require('../utils/encryption');
const { createEthereumAddress } = require('../utils/ethereum');

const User = {
    async create(data) {
        const db = getDB();
        data.password = await bcrypt.hash(data.password, 10);

        // Generating an Ethereum address and private key
        const { address, privateKey } = createEthereumAddress();
        data.ethereumAddress = address;
        data.ethereumPrivateKey = encrypt(privateKey);
        data.totalLoanAmount = 0;
        data.outstandingBalance = 0;

        return await db.collection('users').insertOne(data);
    },
    
    async findByEmail(email) {
        const db = getDB();
        return await db.collection('users').findOne({ email });
    }
};

module.exports = { User };
