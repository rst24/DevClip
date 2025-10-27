import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, index, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table - required for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users with Replit Auth + enhanced token system
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  plan: text("plan").notNull().default("free"), // free, pro, team
  
  // Enhanced token system
  tokenBalance: integer("token_balance").notNull().default(100), // Current available tokens (updated from 50)
  tokensUsed: integer("tokens_used").notNull().default(0), // Total tokens used this period
  tokenCarryover: integer("token_carryover").notNull().default(0), // Carried over from previous month
  lastTokenRefresh: timestamp("last_token_refresh").defaultNow(), // Last monthly refresh
  
  // Stripe integration
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  
  // A/B testing
  abTestVariant: text("ab_test_variant").default("control"), // control, testA, testB
  
  // Admin access
  isAdmin: boolean("is_admin").notNull().default(false),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Code Memory items (formerly clipboard_items) - now with AI-powered tagging and semantic search
export const clipboardItems = pgTable(
  "clipboard_items",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull(),
    content: text("content").notNull(),
    contentType: text("content_type").notNull(), // json, yaml, sql, code, text, log
    formatted: boolean("formatted").notNull().default(false),
    favorite: boolean("favorite").notNull().default(false),
    
    // AI Code Memory features
    language: text("language"), // Auto-detected programming language (javascript, python, etc.)
    tags: text("tags").array().default(sql`ARRAY[]::text[]`), // AI-generated and manual tags
    embedding: jsonb("embedding"), // OpenAI embedding vector for semantic search (1536 dimensions)
    
    // Team collaboration features
    isShared: boolean("is_shared").notNull().default(false), // Shared with team
    teamId: varchar("team_id"), // Team ownership for shared snippets
    
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_clipboard_items_user_id").on(table.userId),
    index("idx_clipboard_items_created_at").on(table.createdAt),
    index("idx_clipboard_items_team_id").on(table.teamId),
    index("idx_clipboard_items_tags").on(table.tags),
  ],
);

export const insertClipboardItemSchema = createInsertSchema(clipboardItems).omit({
  id: true,
  createdAt: true,
  userId: true,
});

export type InsertClipboardItemRequest = z.infer<typeof insertClipboardItemSchema>;
export type InsertClipboardItem = typeof clipboardItems.$inferInsert;
export type ClipboardItem = typeof clipboardItems.$inferSelect;

// Snippet tags for organizing and discovering code memories
export const snippetTags = pgTable(
  "snippet_tags",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tag: text("tag").notNull().unique(), // Unique tag name (e.g., "authentication", "api", "jwt")
    usageCount: integer("usage_count").notNull().default(1), // How many snippets use this tag
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_snippet_tags_usage_count").on(table.usageCount),
  ],
);

export const insertSnippetTagSchema = createInsertSchema(snippetTags).omit({
  id: true,
  createdAt: true,
});

export type InsertSnippetTag = typeof snippetTags.$inferInsert;
export type SnippetTag = typeof snippetTags.$inferSelect;

// Team insights for weekly AI-generated reports
export const teamInsights = pgTable(
  "team_insights",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    teamId: varchar("team_id").notNull(),
    weekStart: timestamp("week_start").notNull(), // Start of the week for this report
    summary: text("summary").notNull(), // AI-generated summary of team activity
    topSnippets: jsonb("top_snippets"), // Most-used snippets with usage counts
    patterns: jsonb("patterns"), // Detected coding patterns and trends
    generatedAt: timestamp("generated_at").notNull().defaultNow(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_team_insights_team_id").on(table.teamId),
    index("idx_team_insights_week_start").on(table.weekStart),
  ],
);

export const insertTeamInsightSchema = createInsertSchema(teamInsights).omit({
  id: true,
  createdAt: true,
  generatedAt: true,
});

export type InsertTeamInsight = typeof teamInsights.$inferInsert;
export type TeamInsight = typeof teamInsights.$inferSelect;

// AI operation requests for tracking usage with token costs
export const aiOperations = pgTable(
  "ai_operations",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull(),
    operationType: text("operation_type").notNull(), // explain, refactor, summarize
    inputText: text("input_text").notNull(),
    outputText: text("output_text").notNull(),
    apiTokensUsed: integer("api_tokens_used").notNull(), // OpenAI API tokens consumed
    tokensCharged: integer("tokens_charged").notNull().default(1), // DevClip tokens deducted (1-3 per operation)
    estimatedCost: integer("estimated_cost"), // Cost in cents ($0.002-$0.006 per operation)
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_ai_operations_user_id").on(table.userId),
    index("idx_ai_operations_created_at").on(table.createdAt),
    index("idx_ai_operations_user_created").on(table.userId, table.createdAt),
  ],
);

export const insertAiOperationSchema = createInsertSchema(aiOperations).omit({
  id: true,
  createdAt: true,
});

export type InsertAiOperation = z.infer<typeof insertAiOperationSchema>;
export type AiOperation = typeof aiOperations.$inferSelect;

// Feedback submissions
export const feedback = pgTable(
  "feedback",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id"),
    rating: integer("rating").notNull(), // 1-5
    message: text("message"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_feedback_user_id").on(table.userId),
  ],
);

export const insertFeedbackSchema = createInsertSchema(feedback).omit({
  id: true,
  createdAt: true,
});

export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
export type Feedback = typeof feedback.$inferSelect;

// Team members for Team plan
export const teamMembers = pgTable(
  "team_members",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    teamOwnerId: varchar("team_owner_id").notNull(),
    memberId: varchar("member_id").notNull(),
    role: text("role").notNull().default("member"), // owner, admin, member
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_team_members_owner_id").on(table.teamOwnerId),
    index("idx_team_members_member_id").on(table.memberId),
  ],
);

export type TeamMember = typeof teamMembers.$inferSelect;

// API keys for Pro and Team tiers
export const apiKeys = pgTable(
  "api_keys",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull(),
    key: text("key").notNull().unique(),
    name: text("name").notNull(),
    lastUsed: timestamp("last_used"),
    revokedAt: timestamp("revoked_at"), // NULL = active, set = revoked
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_api_keys_user_id").on(table.userId),
    index("idx_api_keys_key").on(table.key),
  ],
);

export const insertApiKeySchema = createInsertSchema(apiKeys).omit({
  id: true,
  createdAt: true,
  lastUsed: true,
  revokedAt: true,
});

export type InsertApiKey = z.infer<typeof insertApiKeySchema>;
export type ApiKey = typeof apiKeys.$inferSelect;

// Conversion events for A/B testing
export const conversionEvents = pgTable(
  "conversion_events",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull(),
    eventType: text("event_type").notNull(), // signup, upgrade_pro, upgrade_team
    abTestVariant: text("ab_test_variant"),
    metadata: jsonb("metadata"), // Additional context
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_conversion_events_user_id").on(table.userId),
    index("idx_conversion_events_event_type").on(table.eventType),
  ],
);

export type ConversionEvent = typeof conversionEvents.$inferSelect;

// Error logs for monitoring and debugging
export const errorLogs = pgTable(
  "error_logs",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id"), // NULL if error occurred before auth
    endpoint: text("endpoint").notNull(), // API route that failed
    method: text("method").notNull(), // GET, POST, PUT, DELETE
    statusCode: integer("status_code").notNull(), // HTTP status code
    errorMessage: text("error_message").notNull(),
    errorStack: text("error_stack"), // Stack trace for debugging
    requestBody: jsonb("request_body"), // Request data for reproduction
    userAgent: text("user_agent"),
    ipAddress: text("ip_address"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_error_logs_user_id").on(table.userId),
    index("idx_error_logs_endpoint").on(table.endpoint),
    index("idx_error_logs_created_at").on(table.createdAt),
  ],
);

export type ErrorLog = typeof errorLogs.$inferSelect;

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
  billingInterval: z.enum(["month", "year"]).optional().default("month"),
});

export const migrateLocalDataSchema = z.object({
  clipboardItems: z.array(z.object({
    content: z.string(),
    contentType: z.string(),
    formatted: z.boolean(),
    favorite: z.boolean().optional().default(false),
  })),
});

export type FormatRequest = z.infer<typeof formatRequestSchema>;
export type AiRequest = z.infer<typeof aiRequestSchema>;
export type CreateSubscriptionRequest = z.infer<typeof createSubscriptionSchema>;
export type MigrateLocalDataRequest = z.infer<typeof migrateLocalDataSchema>;
