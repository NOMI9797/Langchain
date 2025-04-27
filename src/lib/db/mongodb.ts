import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI as string;
if (!uri) throw new Error('Missing MONGODB_URI in environment variables');

let client: MongoClient;
let db: Db;

export async function getDb() {
  if (db) return db;
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
  }
  db = client.db();
  return db;
} 