import { users, type User, type InsertUser } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { getUserByUsername, getUser, createUser } from "./google-sheets";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  sessionStore: session.Store;
}

export class GoogleSheetsStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return await getUser(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return await getUserByUsername(username);
  }

  async createUser(user: InsertUser): Promise<User> {
    return await createUser(user);
  }
}

export const storage = new GoogleSheetsStorage();