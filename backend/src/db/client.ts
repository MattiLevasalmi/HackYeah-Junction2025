import { MongoClient, ServerApiVersion, Db, Collection } from "mongodb";

export interface User {
  _id?: string;
  userId: string;
  name: string;
  imagePath: string;
  age: number;
  gender: string;
}

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_URL}/?appName=${process.env.DB_CLUSTER}`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let db: Db;
let usersCollection: Collection<User>;

export const connectDB = async () => {
  try {
    // validate required env vars early to provide clearer errors
    const missing: string[] = [];
    if (!process.env.DB_USERNAME) missing.push('DB_USER');
    if (!process.env.DB_PASSWORD) missing.push('DB_PASSWORD');
    if (!process.env.DB_URL) missing.push('DB_URL');
    if (!process.env.DB_NAME) missing.push('DB_NAME');
    if (missing.length > 0) {
      const err = new Error(`Missing required DB env vars: ${missing.join(', ')}`);
      console.error('✗ Failed to connect to MongoDB:', err.message);
      throw err;
    }

    await client.connect();
    db = client.db(process.env.DB_NAME);
    usersCollection = db.collection<User>("Users");
    console.log("✓ Connected to MongoDB");
  } catch (error) {
    console.error("✗ Failed to connect to MongoDB:", error);
    throw error;
  }
};

export const getDB = () => db;
export const getUsersCollection = () => usersCollection;

export const disconnectDB = async () => {
  try {
    await client.close();
    console.log("✓ Disconnected from MongoDB");
  } catch (error) {
    console.error("✗ Failed to disconnect from MongoDB:", error);
  }
};
