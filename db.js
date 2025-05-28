const { MongoClient } = require("mongodb");
require("dotenv").config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let db;

async function connect() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    db = client.db("roadz");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    throw error;
  }
}

async function getCollection(collectionName) {
  if (!db) {
    await connect();
  }
  return db.collection(collectionName);
}

async function getCollectionNames() {
  if (!db) {
    await connect();
  }
  const collections = await db.listCollections().toArray();
  return collections.map((c) => c.name);
}

function collection(collectionName) {
  if (!db) {
    throw new Error("Database not connected. Call connect() first.");
  }
  return db.collection(collectionName);
}

module.exports = { connect, getCollection, getCollectionNames, collection };
