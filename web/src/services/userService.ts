import { DbService } from './dbService';

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

class UserService {
  private dbService: DbService<IUser>;
  
  constructor() {
    this.dbService = new DbService<IUser>('users');
  }

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

export const User = new UserService(); 