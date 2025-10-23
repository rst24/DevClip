import { 
  type User, 
  type InsertUser,
  type ClipboardItem,
  type InsertClipboardItem,
  type AiOperation,
  type InsertAiOperation,
  type Feedback,
  type InsertFeedback,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPlan(userId: string, plan: string, stripeCustomerId?: string, stripeSubscriptionId?: string): Promise<User>;
  updateUserCredits(userId: string, credits: number): Promise<User>;
  
  // Clipboard operations
  getClipboardItems(userId: string, limit?: number): Promise<ClipboardItem[]>;
  getClipboardItem(id: string): Promise<ClipboardItem | undefined>;
  createClipboardItem(item: InsertClipboardItem): Promise<ClipboardItem>;
  toggleFavorite(id: string): Promise<ClipboardItem | undefined>;
  deleteClipboardItem(id: string): Promise<boolean>;
  
  // AI operations
  createAiOperation(operation: InsertAiOperation): Promise<AiOperation>;
  getAiOperations(userId: string): Promise<AiOperation[]>;
  
  // Feedback
  createFeedback(feedback: InsertFeedback): Promise<Feedback>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private clipboardItems: Map<string, ClipboardItem>;
  private aiOperations: Map<string, AiOperation>;
  private feedbacks: Map<string, Feedback>;

  constructor() {
    this.users = new Map();
    this.clipboardItems = new Map();
    this.aiOperations = new Map();
    this.feedbacks = new Map();
    
    // Create a demo user for testing
    const demoUser: User = {
      id: "demo-user-1",
      email: "demo@devclip.com",
      username: "demo",
      password: "demo", // In production, this would be hashed
      plan: "free",
      aiCredits: 10,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      createdAt: new Date(),
    };
    this.users.set(demoUser.id, demoUser);
    
    // Add some demo clipboard items
    const demoItems: ClipboardItem[] = [
      {
        id: "clip-1",
        userId: demoUser.id,
        content: '{"name": "DevClip", "version": "1.0.0", "features": ["formatters", "AI", "sync"]}',
        contentType: "json",
        formatted: true,
        favorite: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 5),
      },
      {
        id: "clip-2",
        userId: demoUser.id,
        content: "SELECT users.*, subscriptions.plan FROM users LEFT JOIN subscriptions ON users.id = subscriptions.user_id WHERE users.plan = 'pro' ORDER BY users.created_at DESC LIMIT 10;",
        contentType: "sql",
        formatted: false,
        favorite: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 30),
      },
      {
        id: "clip-3",
        userId: demoUser.id,
        content: "[ERROR] 2025-01-15 10:23:45 - Database connection failed: timeout after 30s\n[WARN] 2025-01-15 10:23:46 - Retrying connection (attempt 1/3)\n[INFO] 2025-01-15 10:23:48 - Connection established successfully\n[INFO] 2025-01-15 10:23:49 - Migration 001_init completed",
        contentType: "log",
        formatted: false,
        favorite: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60),
      },
    ];
    
    demoItems.forEach(item => this.clipboardItems.set(item.id, item));
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      plan: "free",
      aiCredits: 10,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserPlan(
    userId: string, 
    plan: string, 
    stripeCustomerId?: string, 
    stripeSubscriptionId?: string
  ): Promise<User> {
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");
    
    // Update credits based on plan
    const creditsMap: Record<string, number> = {
      free: 10,
      pro: 250,
      team: 2000,
    };
    
    const updatedUser = {
      ...user,
      plan,
      aiCredits: creditsMap[plan] || 10,
      stripeCustomerId: stripeCustomerId || user.stripeCustomerId,
      stripeSubscriptionId: stripeSubscriptionId || user.stripeSubscriptionId,
    };
    
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async updateUserCredits(userId: string, credits: number): Promise<User> {
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");
    
    const updatedUser = { ...user, aiCredits: credits };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async getClipboardItems(userId: string, limit: number = 50): Promise<ClipboardItem[]> {
    const items = Array.from(this.clipboardItems.values())
      .filter(item => item.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
    return items;
  }

  async getClipboardItem(id: string): Promise<ClipboardItem | undefined> {
    return this.clipboardItems.get(id);
  }

  async createClipboardItem(insertItem: InsertClipboardItem): Promise<ClipboardItem> {
    const id = randomUUID();
    const item: ClipboardItem = {
      ...insertItem,
      id,
      createdAt: new Date(),
    };
    this.clipboardItems.set(id, item);
    return item;
  }

  async toggleFavorite(id: string): Promise<ClipboardItem | undefined> {
    const item = this.clipboardItems.get(id);
    if (!item) return undefined;
    
    const updated = { ...item, favorite: !item.favorite };
    this.clipboardItems.set(id, updated);
    return updated;
  }

  async deleteClipboardItem(id: string): Promise<boolean> {
    return this.clipboardItems.delete(id);
  }

  async createAiOperation(insertOp: InsertAiOperation): Promise<AiOperation> {
    const id = randomUUID();
    const operation: AiOperation = {
      ...insertOp,
      id,
      createdAt: new Date(),
    };
    this.aiOperations.set(id, operation);
    return operation;
  }

  async getAiOperations(userId: string): Promise<AiOperation[]> {
    return Array.from(this.aiOperations.values())
      .filter(op => op.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createFeedback(insertFeedback: InsertFeedback): Promise<Feedback> {
    const id = randomUUID();
    const feedback: Feedback = {
      ...insertFeedback,
      id,
      createdAt: new Date(),
    };
    this.feedbacks.set(id, feedback);
    return feedback;
  }
}

export const storage = new MemStorage();
