const { MongoClient } = require('mongodb');

const mongoURL = process.env.MONGODB_URL;

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
    try {
        return client.db('loan-tracker');
    } catch (err) {
        console.error("Database loan-tracker does not exist.");
        process.exit(1);     
    }
};

module.exports = {
    connectDB,
    getDB
 };
 