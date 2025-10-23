import crypto from "crypto";

export function generateApiKey(): string {
  const prefix = "devclip";
  const randomBytes = crypto.randomBytes(32).toString("base64url");
  return `${prefix}_${randomBytes}`;
}

export function maskApiKey(key: string): string {
  if (key.length < 12) return "***";
  return `${key.slice(0, 15)}...${key.slice(-4)}`;
}

export function hashApiKey(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex");
}
