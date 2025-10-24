import { 
  type User, 
  type UpsertUser,
  type ClipboardItem,
  type InsertClipboardItem,
  type AiOperation,
  type InsertAiOperation,
  type Feedback,
  type InsertFeedback,
  type TeamMember,
  type ApiKey,
  type ConversionEvent,
  type ErrorLog,
  users,
  clipboardItems,
  aiOperations,
  feedback,
  teamMembers,
  apiKeys,
  conversionEvents,
  errorLogs,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, isNull } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  getUserByStripeCustomerId(stripeCustomerId: string): Promise<User | undefined>;
  updateUserPlan(userId: string, plan: string, stripeCustomerId?: string, stripeSubscriptionId?: string): Promise<User>;
  updateUserCredits(userId: string, creditsBalance: number, creditsUsed?: number): Promise<User>;
  updateUserAdminStatus(userId: string, isAdmin: boolean): Promise<User | undefined>;
  deductCredits(userId: string, amount: number): Promise<User>;
  refreshMonthlyCredits(userId: string): Promise<User>;
  
  // Clipboard operations
  getClipboardItems(userId: string, limit?: number): Promise<ClipboardItem[]>;
  getClipboardItem(id: string): Promise<ClipboardItem | undefined>;
  createClipboardItem(item: InsertClipboardItem): Promise<ClipboardItem>;
  createClipboardItemsBulk(items: InsertClipboardItem[]): Promise<ClipboardItem[]>;
  toggleFavorite(id: string): Promise<ClipboardItem | undefined>;
  deleteClipboardItem(id: string): Promise<boolean>;
  
  // AI operations
  createAiOperation(operation: InsertAiOperation): Promise<AiOperation>;
  getAiOperations(userId: string): Promise<AiOperation[]>;
  
  // Feedback
  createFeedback(feedback: InsertFeedback): Promise<Feedback>;
  
  // Team operations
  getTeamMembers(teamOwnerId: string): Promise<TeamMember[]>;
  
  // API keys
  createApiKey(userId: string, name: string): Promise<ApiKey>;
  getApiKeys(userId: string): Promise<ApiKey[]>;
  getApiKeyByKey(key: string): Promise<ApiKey | undefined>;
  revokeApiKey(id: string): Promise<boolean>;
  updateApiKeyLastUsed(id: string): Promise<void>;
  
  // A/B testing
  logConversionEvent(userId: string, eventType: string, metadata?: any): Promise<ConversionEvent>;
  
  // Error logging
  createErrorLog(errorData: {
    userId: string | null;
    endpoint: string;
    method: string;
    statusCode: number;
    errorMessage: string;
    errorStack: string | null;
    requestBody: any;
    userAgent: string | null;
    ipAddress: string | null;
  }): Promise<ErrorLog>;
}

export class PostgresStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        // Set defaults for new users
        plan: "free",
        aiCreditsBalance: 50,
        aiCreditsUsed: 0,
        creditCarryover: 0,
        abTestVariant: Math.random() > 0.5 ? "control" : "testA", // Simple A/B split
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getUserByStripeCustomerId(stripeCustomerId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.stripeCustomerId, stripeCustomerId));
    return user;
  }

  async updateUserPlan(
    userId: string, 
    plan: string, 
    stripeCustomerId?: string, 
    stripeSubscriptionId?: string
  ): Promise<User> {
    // Credit allocation based on plan
    const creditsMap: Record<string, number> = {
      free: 50,
      pro: 5000,
      team: 25000,
    };
    
    const [user] = await db.update(users)
      .set({
        plan,
        aiCreditsBalance: creditsMap[plan] || 50,
        ...(stripeCustomerId && { stripeCustomerId }),
        ...(stripeSubscriptionId && { stripeSubscriptionId }),
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    
    if (!user) throw new Error("User not found");
    return user;
  }

  async updateUserCredits(userId: string, creditsBalance: number, creditsUsed?: number): Promise<User> {
    const updateData: any = { 
      aiCreditsBalance: creditsBalance,
      updatedAt: new Date(),
    };
    
    if (creditsUsed !== undefined) {
      updateData.aiCreditsUsed = creditsUsed;
    }
    
    const [user] = await db.update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();
    
    if (!user) throw new Error("User not found");
    return user;
  }

  async deductCredits(userId: string, amount: number): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");
    
    if (user.aiCreditsBalance < amount) {
      throw new Error("Insufficient credits");
    }
    
    const [updatedUser] = await db.update(users)
      .set({
        aiCreditsBalance: user.aiCreditsBalance - amount,
        aiCreditsUsed: user.aiCreditsUsed + amount,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    
    return updatedUser;
  }

  async refreshMonthlyCredits(userId: string): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");
    
    // Calculate carryover (unused credits from this month)
    const unusedCredits = user.aiCreditsBalance;
    const maxCarryover = user.plan === "pro" ? 10000 : user.plan === "team" ? 50000 : 0;
    const newCarryover = Math.min(unusedCredits, maxCarryover);
    
    // Refresh credits based on plan
    const monthlyCredits: Record<string, number> = {
      free: 50,
      pro: 5000,
      team: 25000,
    };
    
    const baseCredits = monthlyCredits[user.plan] || 50;
    
    const [updatedUser] = await db.update(users)
      .set({
        aiCreditsBalance: baseCredits + newCarryover,
        creditCarryover: newCarryover,
        aiCreditsUsed: 0,
        lastCreditRefresh: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    
    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async updateUserAdminStatus(userId: string, isAdmin: boolean): Promise<User | undefined> {
    const [user] = await db.update(users)
      .set({
        isAdmin,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    
    return user;
  }

  // Clipboard operations
  async getClipboardItems(userId: string, limit: number = 50): Promise<ClipboardItem[]> {
    return await db.select()
      .from(clipboardItems)
      .where(eq(clipboardItems.userId, userId))
      .orderBy(desc(clipboardItems.createdAt))
      .limit(limit);
  }

  async getClipboardItem(id: string): Promise<ClipboardItem | undefined> {
    const [item] = await db.select()
      .from(clipboardItems)
      .where(eq(clipboardItems.id, id))
      .limit(1);
    return item;
  }

  async createClipboardItem(insertItem: InsertClipboardItem): Promise<ClipboardItem> {
    const [item] = await db.insert(clipboardItems)
      .values(insertItem)
      .returning();
    return item;
  }

  async createClipboardItemsBulk(items: InsertClipboardItem[]): Promise<ClipboardItem[]> {
    if (items.length === 0) return [];
    return await db.insert(clipboardItems)
      .values(items)
      .returning();
  }

  async toggleFavorite(id: string): Promise<ClipboardItem | undefined> {
    const item = await this.getClipboardItem(id);
    if (!item) return undefined;
    
    const [updated] = await db.update(clipboardItems)
      .set({ favorite: !item.favorite })
      .where(eq(clipboardItems.id, id))
      .returning();
    
    return updated;
  }

  async deleteClipboardItem(id: string): Promise<boolean> {
    const result = await db.delete(clipboardItems)
      .where(eq(clipboardItems.id, id))
      .returning();
    return result.length > 0;
  }

  // AI operations
  async createAiOperation(insertOp: InsertAiOperation): Promise<AiOperation> {
    const [operation] = await db.insert(aiOperations)
      .values(insertOp)
      .returning();
    return operation;
  }

  async getAiOperations(userId: string): Promise<AiOperation[]> {
    return await db.select()
      .from(aiOperations)
      .where(eq(aiOperations.userId, userId))
      .orderBy(desc(aiOperations.createdAt));
  }

  // Feedback
  async createFeedback(insertFeedback: InsertFeedback): Promise<Feedback> {
    const [fb] = await db.insert(feedback)
      .values(insertFeedback)
      .returning();
    return fb;
  }

  // Team operations
  async getTeamMembers(teamOwnerId: string): Promise<TeamMember[]> {
    return await db.select()
      .from(teamMembers)
      .where(eq(teamMembers.teamOwnerId, teamOwnerId));
  }

  // API keys
  async createApiKey(userId: string, name: string): Promise<ApiKey> {
    const { generateApiKey } = await import("./apiKeyUtils.js");
    const key = generateApiKey();
    const [apiKey] = await db.insert(apiKeys)
      .values({
        userId,
        key,
        name,
      })
      .returning();
    return apiKey;
  }

  async getApiKeys(userId: string): Promise<ApiKey[]> {
    return await db.select()
      .from(apiKeys)
      .where(and(eq(apiKeys.userId, userId), isNull(apiKeys.revokedAt)))
      .orderBy(desc(apiKeys.createdAt));
  }

  async getApiKeyByKey(key: string): Promise<ApiKey | undefined> {
    const [apiKey] = await db.select()
      .from(apiKeys)
      .where(and(eq(apiKeys.key, key), isNull(apiKeys.revokedAt)));
    return apiKey;
  }

  async revokeApiKey(id: string): Promise<boolean> {
    const result = await db.update(apiKeys)
      .set({ revokedAt: new Date() })
      .where(eq(apiKeys.id, id))
      .returning();
    return result.length > 0;
  }

  async updateApiKeyLastUsed(id: string): Promise<void> {
    await db.update(apiKeys)
      .set({ lastUsed: new Date() })
      .where(eq(apiKeys.id, id));
  }

  // A/B testing
  async logConversionEvent(userId: string, eventType: string, metadata?: any): Promise<ConversionEvent> {
    const user = await this.getUser(userId);
    const [event] = await db.insert(conversionEvents)
      .values({
        userId,
        eventType,
        abTestVariant: user?.abTestVariant,
        metadata,
      })
      .returning();
    return event;
  }
  
  // Error logging
  async createErrorLog(errorData: {
    userId: string | null;
    endpoint: string;
    method: string;
    statusCode: number;
    errorMessage: string;
    errorStack: string | null;
    requestBody: any;
    userAgent: string | null;
    ipAddress: string | null;
  }): Promise<ErrorLog> {
    const [log] = await db.insert(errorLogs)
      .values(errorData)
      .returning();
    return log;
  }
}

export const storage = new PostgresStorage();
