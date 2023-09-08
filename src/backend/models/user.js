// models/user.js
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { MongoClient } = require('mongodb');
const { createEthereumAddress } = require('../ethereum/web3');

const mongoURL = process.env.MONGODB_URL;
const encryptionKey = process.env.ENCRYPTION_KEY;

function encrypt(text, key) {
  const iv = crypto.randomBytes(16); // generate a secure random initialization vector
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag(); // get the authentication tag

  return {
      iv: iv.toString('hex'),
      content: encrypted,
      authTag: authTag.toString('hex')
  };
}

let client;
const connectDB = async () => {
    try {
        client = await MongoClient.connect(mongoURL);
        console.log("Connected to MongoDB");
    } catch (err) {
        console.error("Error connecting to MongoDB", err);
        process.exit(1); // Exit the process with an error
    }
};

const getDB = () => {
    if (!client) {
        console.error("You must connect to the database first.");
        process.exit(1);
    }
    return client.db('loan-tracker');
};

const User = {
    async create(data) {
        const db = getDB();
        data.password = await bcrypt.hash(data.password, 10);

        // Generating an Ethereum address and private key
        const { address, privateKey } = createEthereumAddress();
        data.ethereumAddress = address;
        data.ethereumPrivateKey = encrypt(privateKey, Buffer.from(encryptionKey, "hex"));
        data.totalLoanAmount = 0;
        data.outstandingBalance = 0;

        return await db.collection('users').insertOne(data);
    },
    
    async findByEmail(email) {
        const db = getDB();
        return await db.collection('users').findOne({ email });
    },

    async updateAmounts(data) {
      const db = getDB();
      const filter = { email: data.email}
      const update = { $set: {totalLoanAmount: data.principal, outstandingBalance: data.balance} };

      return await db.collection('users').updateOne(filter, update, (err, result) => {
        if (err) throw err;
        console.log("Document updated:", result.modifiedCount);
      });
    }
};

module.exports = { User, connectDB };
