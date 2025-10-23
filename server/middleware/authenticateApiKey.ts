import type { Request, Response, NextFunction } from "express";
import type { User } from "@shared/schema";
import { storage } from "../storage";

export interface ApiKeyRequest extends Request {
  apiKey?: {
    id: string;
    userId: string;
    name: string;
  };
  apiUser?: User;
  apiUserId?: string;
}

export async function authenticateApiKey(
  req: ApiKeyRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Missing or invalid Authorization header. Expected format: 'Bearer devclip_...'",
      });
    }

    const apiKey = authHeader.slice(7);
    
    if (!apiKey.startsWith("devclip_")) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Invalid API key format",
      });
    }

    const keyRecord = await storage.getApiKeyByKey(apiKey);
    
    if (!keyRecord) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Invalid or revoked API key",
      });
    }

    const user = await storage.getUser(keyRecord.userId);
    
    if (!user) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "User associated with API key not found",
      });
    }

    await storage.updateApiKeyLastUsed(keyRecord.id);

    req.apiKey = {
      id: keyRecord.id,
      userId: keyRecord.userId,
      name: keyRecord.name,
    };
    req.apiUser = user;
    req.apiUserId = keyRecord.userId;

    next();
  } catch (error) {
    console.error("[API Key Auth Error]", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to authenticate API key",
    });
  }
}
