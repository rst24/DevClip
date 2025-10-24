import type { Request, Response, NextFunction, RequestHandler, ErrorRequestHandler } from "express";
import { storage } from "./storage";

interface ErrorLogData {
  userId?: string;
  endpoint: string;
  method: string;
  statusCode: number;
  errorMessage: string;
  errorStack?: string;
  requestBody?: any;
  userAgent?: string;
  ipAddress?: string;
}

/**
 * Log error to database for monitoring and debugging
 */
export async function logError(data: ErrorLogData): Promise<void> {
  try {
    await storage.createErrorLog({
      userId: data.userId || null,
      endpoint: data.endpoint,
      method: data.method,
      statusCode: data.statusCode,
      errorMessage: data.errorMessage,
      errorStack: data.errorStack || null,
      requestBody: data.requestBody || null,
      userAgent: data.userAgent || null,
      ipAddress: data.ipAddress || null,
    });
  } catch (error) {
    // Don't let error logging failures crash the app
    console.error("Failed to log error to database:", error);
  }
}

/**
 * Recursively redact sensitive fields from request body before logging
 * Handles nested objects and arrays to prevent sensitive data leakage
 */
function redactSensitiveData(data: any, depth: number = 0): any {
  // Prevent infinite recursion - preserve structure for deep objects
  if (depth > 10) {
    return { __truncated: "Max depth reached" };
  }
  
  // Handle null, undefined, primitives
  if (data == null || typeof data !== 'object') {
    return data;
  }
  
  // Skip non-plain objects (Buffers, Streams, etc.)
  if (Buffer.isBuffer(data) || data.constructor?.name !== 'Object' && !Array.isArray(data)) {
    return '[NON_PLAIN_OBJECT]';
  }
  
  // Sensitive field patterns - matches camelCase, snake_case, and standalone words
  const sensitivePatterns = [
    /password/i,          // password, newPassword, user_password, currentPassword
    /passwd/i,            // passwd, userPasswd
    /(^|_)pwd($|_)/i,     // pwd, user_pwd, pwd_hash (but not "pwdisplay")
    /secret/i,            // secret, apiSecret, client_secret, webhookSecret
    /token/i,             // token, accessToken, refresh_token, bearerToken
    /(api|private|public|webhook|stripe|client).?key/i, // apiKey, api_key, privateKey (but not "monkey")
    /authorization/i,     // authorization (but not "author" alone)
    /credential/i,        // credential, credentials, userCredential
    /bearer/i,            // bearer, bearerToken
    /(^|_)cvv($|_)/i,     // cvv, card_cvv
    /(^|_)ssn($|_)/i,     // ssn, user_ssn
    /credit.?card/i,      // creditCard, credit_card
    /card.?number/i,      // cardNumber, card_number
  ];
  
  // Check if a field name matches sensitive patterns
  const isSensitiveField = (fieldName: string): boolean => {
    return sensitivePatterns.some(pattern => pattern.test(fieldName));
  };
  
  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(item => redactSensitiveData(item, depth + 1));
  }
  
  // Handle plain objects
  const redacted: any = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (isSensitiveField(key)) {
      redacted[key] = '[REDACTED]';
    } else if (value && typeof value === 'object') {
      // Recursively redact nested objects/arrays
      redacted[key] = redactSensitiveData(value, depth + 1);
    } else {
      redacted[key] = value;
    }
  }
  
  return redacted;
}

/**
 * Express middleware for catching and logging errors
 */
export const errorLoggingMiddleware: ErrorRequestHandler = async (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || err.status || 500;
  const errorMessage = err.message || "Internal server error";
  
  // Extract user ID if authenticated
  const userId = (req.user as any)?.claims?.sub;
  
  // Log error to database with redacted sensitive data
  await logError({
    userId,
    endpoint: req.path,
    method: req.method,
    statusCode,
    errorMessage,
    errorStack: err.stack,
    requestBody: redactSensitiveData(req.body),
    userAgent: req.headers["user-agent"],
    ipAddress: req.ip || req.headers["x-forwarded-for"] as string,
  });
  
  // Log to console for development
  console.error(`[${statusCode}] ${req.method} ${req.path}:`, errorMessage);
  if (err.stack) {
    console.error(err.stack);
  }
  
  // Send error response
  res.status(statusCode).json({
    message: errorMessage,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

/**
 * Wrapper for async route handlers to catch errors
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Retry logic for transient failures (e.g., database connection issues)
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelayMs: number = 100
): Promise<T> {
  let lastError: Error | undefined;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      // Don't retry for client errors (4xx) or auth errors
      if (error.statusCode >= 400 && error.statusCode < 500) {
        throw error;
      }
      
      // Exponential backoff
      if (attempt < maxRetries - 1) {
        const delay = initialDelayMs * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}
