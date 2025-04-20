import { DbService } from './dbService';

// User interface
export interface IUser {
  address: string;
  username?: string;
  email?: string;
  createdAt: string;
  lastLogin?: string;
  preferences?: {
    theme?: string;
    notifications?: boolean;
  };
}

// Create a user service using the generic DB service
class UserService {
  private dbService: DbService<IUser>;
  
  constructor() {
    this.dbService = new DbService<IUser>('users');
  }

  // User-specific methods
  async findByAddress(address: string) {
    return this.dbService.findOne({ address });
  }

  async updateLastLogin(address: string) {
    return this.dbService.updateOne(
      { address },
      { $set: { lastLogin: new Date().toISOString() } }
    );
  }

  async updatePreferences(address: string, preferences: Partial<IUser['preferences']>) {
    return this.dbService.updateOne(
      { address },
      { $set: { preferences } }
    );
  }
  
  // Add standard database operations
  async find(query = {}) {
    return this.dbService.find(query);
  }
  
  async findOne(query = {}) {
    return this.dbService.findOne(query);
  }
  
  async create(document: IUser) {
    return this.dbService.create(document);
  }
  
  async updateOne(query = {}, update = {}) {
    return this.dbService.updateOne(query, update);
  }
  
  async deleteOne(query = {}) {
    return this.dbService.deleteOne(query);
  }
}

// Export a singleton instance
export const User = new UserService(); 