// models/user.js
const bcrypt = require('bcrypt');
const { MongoClient } = require('mongodb');

let db;

MongoClient.connect('mongodb://localhost:27017', { useUnifiedTopology: true }, (err, client) => {
    if (err) throw err;
    db = client.db('loan_tracker_proj');
});

const User = {
    async create(data) {
        data.password = await bcrypt.hash(data.password, 10);
        return await db.collection('users').insertOne(data);
    },
    
    async findByEmail(email) {
        return await db.collection('users').findOne({ email });
    }
};

module.exports = User;
