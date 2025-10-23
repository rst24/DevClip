import { db } from "./db";
import { users, clipboardItems } from "@shared/schema";

async function seed() {
  console.log("Seeding database...");
  
  // Create demo user
  const [demoUser] = await db.insert(users).values({
    email: "demo@devclip.com",
    username: "demo",
    password: "demo", // In production, this would be hashed
    plan: "free",
    aiCredits: 10,
  }).returning();
  
  console.log("Created demo user:", demoUser.email);
  
  // Create demo clipboard items
  await db.insert(clipboardItems).values([
    {
      userId: demoUser.id,
      content: '{"name": "DevClip", "version": "1.0.0", "features": ["formatters", "AI", "sync"]}',
      contentType: "json",
      formatted: true,
      favorite: true,
    },
    {
      userId: demoUser.id,
      content: "SELECT users.*, subscriptions.plan FROM users LEFT JOIN subscriptions ON users.id = subscriptions.user_id WHERE users.plan = 'pro' ORDER BY users.created_at DESC LIMIT 10;",
      contentType: "sql",
      formatted: false,
      favorite: false,
    },
    {
      userId: demoUser.id,
      content: "[ERROR] 2025-01-15 10:23:45 - Database connection failed: timeout after 30s\n[WARN] 2025-01-15 10:23:46 - Retrying connection (attempt 1/3)\n[INFO] 2025-01-15 10:23:48 - Connection established successfully\n[INFO] 2025-01-15 10:23:49 - Migration 001_init completed",
      contentType: "log",
      formatted: false,
      favorite: false,
    },
  ]);
  
  console.log("Created demo clipboard items");
  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});
