import type { Request, Response, NextFunction } from "express";

// Middleware to check if user is admin
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = req.user as any;
  
  if (!user.isAdmin) {
    return res.status(403).json({ message: "Forbidden: Admin access required" });
  }

  next();
}
