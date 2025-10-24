import type { Request, Response, NextFunction } from "express";
import { storage } from "./storage";

// Middleware to check if user is admin
export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const sessionUser = req.user as any;
  
  // Fetch the actual user from the database to check admin status
  const user = await storage.getUser(sessionUser.claims.sub);
  
  if (!user || !user.isAdmin) {
    return res.status(403).json({ message: "Forbidden: Admin access required" });
  }

  next();
}
