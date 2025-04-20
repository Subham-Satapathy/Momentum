import { MongoClient, Db, Collection, Document, ObjectId, UpdateFilter, WithId } from 'mongodb';
import 'dotenv/config';

// Get MongoDB URI from environment variables
const uri = process.env.MONGODB_URI;

// Check if MongoDB URI is set
if (!uri) {
  console.error("MONGODB_URI environment variable is not set");
  process.exit(1);
}

const client = new MongoClient(uri);
let dbConnection: Db | null = null;

/**
 * Connects to the MongoDB database
 */
export async function connectToDatabase(): Promise<Db> {
  try {
    if (!dbConnection) {
      await client.connect();
      dbConnection = client.db("Momentum");
      console.log("Connected to MongoDB");
    }
    return dbConnection;
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    throw error;
  }
}

/**
 * Generic Database Service
 */
export class DbService<T extends Document> {
  private collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  /**
   * Get collection
   */
  private async getCollection(): Promise<Collection<T>> {
    const db = await connectToDatabase();
    return db.collection<T>(this.collectionName);
  }

  /**
   * Find documents
   */
  async find(query = {}): Promise<WithId<T>[]> {
    const collection = await this.getCollection();
    const docs = await collection.find(query).toArray();
    return docs.map(doc => ({
      ...doc,
      toObject: () => doc,
      lean: () => docs
    })) as any;
  }

  /**
   * Find a single document
   */
  async findOne(query = {}): Promise<(WithId<T> & { save: () => Promise<any>, toObject: () => WithId<T> }) | null> {
    const collection = await this.getCollection();
    const doc = await collection.findOne(query);
    
    if (doc) {
      return {
        ...doc,
        save: async () => {
          const { _id, save, toObject, ...rest } = doc as any;
          await collection.updateOne({ _id }, { $set: rest });
          return doc;
        },
        toObject: () => doc
      } as any;
    }
    
    return null;
  }

  /**
   * Create a document
   */
  async create(document: T): Promise<any> {
    const collection = await this.getCollection();
    return collection.insertOne(document as any);
  }

  /**
   * Update a document
   */
  async updateOne(query = {}, update = {}): Promise<any> {
    const collection = await this.getCollection();
    return collection.updateOne(query, update as UpdateFilter<T>);
  }

  /**
   * Delete a document
   */
  async deleteOne(query = {}): Promise<{ deletedCount: number }> {
    const collection = await this.getCollection();
    const result = await collection.deleteOne(query);
    return { deletedCount: result.deletedCount };
  }
}

// Export the client for closing connection when needed
export { client }; 