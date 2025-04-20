import { MongoClient, Db, Collection, Document, UpdateFilter, WithId, Filter, OptionalUnlessRequiredId } from 'mongodb';
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
    }));
  }

  /**
   * Find a single document
   */
  async findOne(query: Filter<T> = {}): Promise<(WithId<T> & { 
    save: () => Promise<WithId<T>>, 
    toObject: () => WithId<T> 
  }) | null> {
    const collection = await this.getCollection();
    const doc = await collection.findOne(query);
    
    if (doc) {
      const enrichedDoc = {
        ...doc,
        save: async () => {
          const { _id, ...rest } = doc as WithId<T>;
          await collection.updateOne(
            { _id } as unknown as Filter<T>, 
            { $set: rest as unknown as Partial<T> }
          );
          return doc;
        },
        toObject: () => doc
      };
      
      return enrichedDoc as (WithId<T> & { 
        save: () => Promise<WithId<T>>, 
        toObject: () => WithId<T> 
      });
    }
    
    return null;
  }

  /**
   * Create a document
   */
  async create(document: T): Promise<T> {
    const collection = await this.getCollection();
    const result = await collection.insertOne(document as OptionalUnlessRequiredId<T>);
    return { ...document, _id: result.insertedId } as T;
  }

  /**
   * Update a document
   */
  async updateOne(query = {}, update = {}): Promise<{ modifiedCount: number }> {
    const collection = await this.getCollection();
    const result = await collection.updateOne(query, update as UpdateFilter<T>);
    return { modifiedCount: result.modifiedCount };
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