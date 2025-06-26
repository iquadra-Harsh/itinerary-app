import {
  users,
  itineraries,
  type User,
  type InsertUser,
  type Itinerary,
  type InsertItinerary,
  type UpdateItinerary,
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { db } from "./db";
import { eq } from "drizzle-orm";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getItinerary(id: number): Promise<Itinerary | undefined>;
  getItinerariesByUserId(userId: number): Promise<Itinerary[]>;
  createItinerary(
    itinerary: InsertItinerary & { userId: number }
  ): Promise<Itinerary>;
  updateItinerary(
    id: number,
    updates: Partial<UpdateItinerary>
  ): Promise<Itinerary | undefined>;
  deleteItinerary(id: number): Promise<boolean>;

  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private itineraries: Map<number, Itinerary>;
  private currentUserId: number;
  private currentItineraryId: number;
  public sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.itineraries = new Map();
    this.currentUserId = 1;
    this.currentItineraryId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((user) => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async getItinerary(id: number): Promise<Itinerary | undefined> {
    return this.itineraries.get(id);
  }

  async getItinerariesByUserId(userId: number): Promise<Itinerary[]> {
    return Array.from(this.itineraries.values()).filter(
      (itinerary) => itinerary.userId === userId
    );
  }

  async createItinerary(
    itinerary: InsertItinerary & { userId: number }
  ): Promise<Itinerary> {
    const id = this.currentItineraryId++;
    const now = new Date();
    const newItinerary: Itinerary = {
      ...itinerary,
      id,
      description: itinerary.description ?? null,
      generatedContent: null,
      status: "draft",
      createdAt: now,
      updatedAt: now,
    };
    this.itineraries.set(id, newItinerary);
    return newItinerary;
  }

  async updateItinerary(
    id: number,
    updates: Partial<UpdateItinerary>
  ): Promise<Itinerary | undefined> {
    const itinerary = this.itineraries.get(id);
    if (!itinerary) return undefined;

    const updatedItinerary: Itinerary = {
      ...itinerary,
      ...updates,
      updatedAt: new Date(),
    };
    this.itineraries.set(id, updatedItinerary);
    return updatedItinerary;
  }

  async deleteItinerary(id: number): Promise<boolean> {
    const result = await db.delete(itineraries).where(eq(itineraries.id, id));
    return (result.rowCount ?? 0) > 0;
  }
}

class PgStorage implements IStorage {
  public sessionStore: session.Store;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: number) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(user: InsertUser) {
    const [created] = await db.insert(users).values(user).returning();
    return created;
  }

  async getItinerary(id: number) {
    const [itinerary] = await db
      .select()
      .from(itineraries)
      .where(eq(itineraries.id, id));
    return itinerary;
  }

  async getItinerariesByUserId(userId: number) {
    return db.select().from(itineraries).where(eq(itineraries.userId, userId));
  }

  async createItinerary(itinerary: InsertItinerary & { userId: number }) {
    const [created] = await db
      .insert(itineraries)
      .values(itinerary)
      .returning();
    return created;
  }

  async updateItinerary(id: number, updates: Partial<UpdateItinerary>) {
    const [updated] = await db
      .update(itineraries)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(itineraries.id, id))
      .returning();
    return updated;
  }

  async deleteItinerary(id: number) {
    const result = await db.delete(itineraries).where(eq(itineraries.id, id));
    return (result.rowCount ?? 0) > 0;
  }
}

// Keep MemStorage for reference/testing, but export PgStorage for production
// export const storage = new MemStorage();
export const storage = new PgStorage();
