import { 
  type User, 
  type InsertUser,
  type ClipboardItem,
  type InsertClipboardItem,
  type AiOperation,
  type InsertAiOperation,
  type Feedback,
  type InsertFeedback,
  users,
  clipboardItems,
  aiOperations,
  feedback,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import { randomUUID } from "crypto";
import { hashPassword } from "./auth";

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

export class PostgresStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await hashPassword(insertUser.password);
    const result = await db.insert(users).values({
      ...insertUser,
      password: hashedPassword,
      plan: "free",
      aiCredits: 10,
    }).returning();
    return result[0];
  }

  async updateUserPlan(
    userId: string, 
    plan: string, 
    stripeCustomerId?: string, 
    stripeSubscriptionId?: string
  ): Promise<User> {
    // Update credits based on plan
    const creditsMap: Record<string, number> = {
      free: 10,
      pro: 250,
      team: 2000,
    };
    
    const result = await db.update(users)
      .set({
        plan,
        aiCredits: creditsMap[plan] || 10,
        ...(stripeCustomerId && { stripeCustomerId }),
        ...(stripeSubscriptionId && { stripeSubscriptionId }),
      })
      .where(eq(users.id, userId))
      .returning();
    
    if (!result[0]) throw new Error("User not found");
    return result[0];
  }

  async updateUserCredits(userId: string, credits: number): Promise<User> {
    const result = await db.update(users)
      .set({ aiCredits: credits })
      .where(eq(users.id, userId))
      .returning();
    
    if (!result[0]) throw new Error("User not found");
    return result[0];
  }

  async getClipboardItems(userId: string, limit: number = 50): Promise<ClipboardItem[]> {
    return await db.select()
      .from(clipboardItems)
      .where(eq(clipboardItems.userId, userId))
      .orderBy(desc(clipboardItems.createdAt))
      .limit(limit);
  }

  async getClipboardItem(id: string): Promise<ClipboardItem | undefined> {
    const result = await db.select()
      .from(clipboardItems)
      .where(eq(clipboardItems.id, id))
      .limit(1);
    return result[0];
  }

  async createClipboardItem(insertItem: InsertClipboardItem): Promise<ClipboardItem> {
    const result = await db.insert(clipboardItems)
      .values(insertItem)
      .returning();
    return result[0];
  }

  async toggleFavorite(id: string): Promise<ClipboardItem | undefined> {
    const item = await this.getClipboardItem(id);
    if (!item) return undefined;
    
    const result = await db.update(clipboardItems)
      .set({ favorite: !item.favorite })
      .where(eq(clipboardItems.id, id))
      .returning();
    
    return result[0];
  }

  async deleteClipboardItem(id: string): Promise<boolean> {
    const result = await db.delete(clipboardItems)
      .where(eq(clipboardItems.id, id))
      .returning();
    return result.length > 0;
  }

  async createAiOperation(insertOp: InsertAiOperation): Promise<AiOperation> {
    const result = await db.insert(aiOperations)
      .values(insertOp)
      .returning();
    return result[0];
  }

  async getAiOperations(userId: string): Promise<AiOperation[]> {
    return await db.select()
      .from(aiOperations)
      .where(eq(aiOperations.userId, userId))
      .orderBy(desc(aiOperations.createdAt));
  }

  async createFeedback(insertFeedback: InsertFeedback): Promise<Feedback> {
    const result = await db.insert(feedback)
      .values(insertFeedback)
      .returning();
    return result[0];
  }
}

export const storage = new PostgresStorage();
