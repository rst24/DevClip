import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

if (!process.env.REPLIT_DOMAINS) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}

if (!process.env.SESSION_SECRET) {
  throw new Error("Environment variable SESSION_SECRET is required");
}

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(
  claims: any,
) {
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };

  const domains = process.env.REPLIT_DOMAINS!.split(",").map(d => d.trim());
  console.log("[Auth] Registering authentication strategies for domains:", domains);
  
  for (const domain of domains) {
    const strategyName = `replitauth:${domain}`;
    console.log(`[Auth] Registering strategy: ${strategyName}`);
    
    const strategy = new Strategy(
      {
        name: strategyName,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `https://${domain}/api/callback`,
      },
      verify,
    );
    passport.use(strategy);
  }
  
  console.log("[Auth] All authentication strategies registered successfully");

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    try {
      const strategyName = `replitauth:${req.hostname}`;
      console.log(`[Auth] Login attempt for hostname: ${req.hostname}, using strategy: ${strategyName}`);
      
      passport.authenticate(strategyName, {
        prompt: "login consent",
        scope: ["openid", "email", "profile", "offline_access"],
      })(req, res, next);
    } catch (error: any) {
      console.error("[Auth] Error in /api/login:", error);
      res.status(500).json({ 
        message: "Authentication error", 
        error: error.message 
      });
    }
  });

  app.get("/api/callback", (req, res, next) => {
    try {
      const strategyName = `replitauth:${req.hostname}`;
      console.log(`[Auth] Callback received for hostname: ${req.hostname}, using strategy: ${strategyName}`);
      console.log(`[Auth] Callback query params:`, req.query);
      
      passport.authenticate(strategyName, (err: any, user: any, info: any) => {
        if (err) {
          console.error("[Auth] Error during authentication:", err);
          return res.status(500).json({ 
            message: "Authentication failed", 
            error: err.message 
          });
        }
        
        if (!user) {
          console.error("[Auth] No user returned from authentication, info:", info);
          return res.redirect("/api/login");
        }
        
        req.logIn(user, (loginErr) => {
          if (loginErr) {
            console.error("[Auth] Error during login:", loginErr);
            return res.status(500).json({ 
              message: "Login failed", 
              error: loginErr.message 
            });
          }
          
          console.log("[Auth] Login successful, redirecting to /");
          return res.redirect("/");
        });
      })(req, res, next);
    } catch (error: any) {
      console.error("[Auth] Error in /api/callback:", error);
      res.status(500).json({ 
        message: "Callback error", 
        error: error.message 
      });
    }
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
        }).href
      );
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};
