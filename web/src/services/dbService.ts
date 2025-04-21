import { MongoClient, Db, Collection, Document, UpdateFilter, WithId, Filter, OptionalUnlessRequiredId } from 'mongodb';
import 'dotenv/config';

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("MONGODB_URI environment variable is not set");
  process.exit(1);
}

const client = new MongoClient(uri);
let dbConnection: Db | null = null;

export async function connectToDatabase(): Promise<Db> {
  try {
    if (!dbConnection) {
      await client.connect();
      dbConnection = client.db("Momentum");
    }
    return dbConnection;
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    throw error;
  }
}

export class DbService<T extends Document> {
  private collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  private async getCollection(): Promise<Collection<T>> {
    const db = await connectToDatabase();
    return db.collection<T>(this.collectionName);
  }

  async find(query = {}): Promise<WithId<T>[]> {
    const collection = await this.getCollection();
    const docs = await collection.find(query).toArray();
    return docs.map(doc => ({
      ...doc,
      toObject: () => doc,
      lean: () => docs
    }));
  }

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

  async create(document: T): Promise<T> {
    const collection = await this.getCollection();
    const result = await collection.insertOne(document as OptionalUnlessRequiredId<T>);
    return { ...document, _id: result.insertedId } as T;
  }

  async updateOne(query = {}, update = {}, options = {}): Promise<{ modifiedCount: number }> {
    const collection = await this.getCollection();
    const result = await collection.updateOne(query, update as UpdateFilter<T>, options);
    return { modifiedCount: result.modifiedCount };
  }

  async deleteOne(query = {}): Promise<{ deletedCount: number }> {
    const collection = await this.getCollection();
    const result = await collection.deleteOne(query);
    return { deletedCount: result.deletedCount };
  }
}

export { client }; 