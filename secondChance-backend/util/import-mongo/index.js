require('dotenv').config();
const { MongoClient } = require('mongodb');
const fs = require('fs');

const url = process.env.MONGO_URL;
const dbName = 'secondChance';
const collectionName = 'secondChanceItems';
const filename = `${__dirname}/secondChanceItems.json`;

async function loadData() {
    const client = new MongoClient(url);

    try {
        // Connect to MongoDB
        await client.connect();
        console.log("Connected successfully to server");

        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        // Read JSON file
        const data = JSON.parse(fs.readFileSync(filename, 'utf8')).docs;

        // Clear the collection first
        await collection.deleteMany({});

        // Insert all documents
        const insertResult = await collection.insertMany(data);
        console.log('Inserted documents:', insertResult.insertedCount); // Should print 16

    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}

// Run the script
loadData();

module.exports = { loadData };
