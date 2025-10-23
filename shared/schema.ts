import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users with subscription tracking
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  plan: text("plan").notNull().default("free"), // free, pro, team
  aiCredits: integer("ai_credits").notNull().default(10), // Free tier gets 10 credits/month
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Clipboard history items
export const clipboardItems = pgTable("clipboard_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  content: text("content").notNull(),
  contentType: text("content_type").notNull(), // json, yaml, sql, code, text, log
  formatted: boolean("formatted").notNull().default(false),
  favorite: boolean("favorite").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertClipboardItemSchema = createInsertSchema(clipboardItems).omit({
  id: true,
  createdAt: true,
});

export type InsertClipboardItem = z.infer<typeof insertClipboardItemSchema>;
export type ClipboardItem = typeof clipboardItems.$inferSelect;

// AI operation requests for tracking usage
export const aiOperations = pgTable("ai_operations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  operationType: text("operation_type").notNull(), // explain, refactor, summarize
  inputText: text("input_text").notNull(),
  outputText: text("output_text").notNull(),
  tokensUsed: integer("tokens_used").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAiOperationSchema = createInsertSchema(aiOperations).omit({
  id: true,
  createdAt: true,
});

export type InsertAiOperation = z.infer<typeof insertAiOperationSchema>;
export type AiOperation = typeof aiOperations.$inferSelect;

// Feedback submissions
export const feedback = pgTable("feedback", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  rating: integer("rating").notNull(), // 1-5
  message: text("message"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertFeedbackSchema = createInsertSchema(feedback).omit({
  id: true,
  createdAt: true,
});

export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
export type Feedback = typeof feedback.$inferSelect;

// Zod schemas for API requests
export const formatRequestSchema = z.object({
  text: z.string(),
  format: z.enum(["json", "yaml", "sql", "ansi-clean", "log-to-markdown"]),
});

export const aiRequestSchema = z.object({
  text: z.string().max(5000),
  operation: z.enum(["explain", "refactor", "summarize"]),
});

export const createSubscriptionSchema = z.object({
  plan: z.enum(["pro", "team"]),
});

export type FormatRequest = z.infer<typeof formatRequestSchema>;
export type AiRequest = z.infer<typeof aiRequestSchema>;
export type CreateSubscriptionRequest = z.infer<typeof createSubscriptionSchema>;
