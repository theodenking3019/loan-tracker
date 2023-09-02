// models/user.js
const bcrypt = require('bcrypt');
const { MongoClient } = require('mongodb');
const { createEthereumAddress } = require('../ethereum/web3');

let db;

const connectDB = async () => {
    try {
      const client = await MongoClient.connect('mongodb://localhost:27017');
      db = client.db('loan-tracker');
      console.log("Connected to MongoDB");
    } catch (err) {
      console.error("Error connecting to MongoDB", err);
      process.exit(1); // Exit the process with an error
    }
  };

const User = {
    async create(data) {
        data.password = await bcrypt.hash(data.password, 10);

        // Generating an Ethereum address and private key
        const { address, privateKey } = createEthereumAddress();
        data.ethereumAddress = address;
        data.ethereumPrivateKey = privateKey;

        return await db.collection('users').insertOne(data);
    },
    
    async findByEmail(email) {
        return await db.collection('users').findOne({ email });
    }
};

module.exports = { User, connectDB };