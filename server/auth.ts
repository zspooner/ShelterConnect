// Referenced from javascript_auth_all_persistance integration
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import { enhanceSessionSecurity, createRateLimiters, createValidationRules, handleValidationErrors } from "./security";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Sanitize user data before sending to client
function sanitizeUser(user: any) {
  const { password, ...sanitizedUser } = user;
  return sanitizedUser;
}

export function setupAuth(app: Express) {
  // Get enhanced session security configuration
  const enhancedSessionConfig = enhanceSessionSecurity();
  const sessionSettings: session.SessionOptions = {
    ...enhancedSessionConfig,
    store: storage.sessionStore,
  };

  // Note: trust proxy is already set in index.ts
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
      try {
        const user = await storage.getUserByUsername(email);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Get rate limiters and validation rules
  const { authLimiter } = createRateLimiters();
  const { registrationValidation, loginValidation } = createValidationRules();

  app.post("/api/register", 
    authLimiter, 
    registrationValidation, 
    handleValidationErrors, 
    async (req, res, next) => {
    try {
      if (process.env.NODE_ENV !== 'production') console.log('Registration attempt with data:', {
        name: req.body.name,
        email: req.body.email,
        city: req.body.city,
        state: req.body.state
      });
      
      const { name, email, password, city, state } = req.body;
      
      // Check if shelter already exists
      const existingUser = await storage.getUserByUsername(email);
      if (existingUser) {
        if (process.env.NODE_ENV !== 'production') console.log('User already exists:', email);
        return res.status(400).json({ 
          error: "Email already exists",
          message: "An account with this email already exists. Please use a different email or try logging in."
        });
      }

      // Create shelter (which serves as user) with full details
      const hashedPassword = await hashPassword(password);
      if (process.env.NODE_ENV !== 'production') console.log('Creating user with hashed password');
      
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        name,
        city,
        state,
      });

      if (process.env.NODE_ENV !== 'production') console.log('User created successfully, logging in...');
      
      req.login(user, (err) => {
        if (err) {
          if (process.env.NODE_ENV !== 'production') console.error('Login error after registration:', err);
          return next(err);
        }
        if (process.env.NODE_ENV !== 'production') console.log('User logged in successfully');
        res.status(201).json(sanitizeUser(user));
      });
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') console.error('Registration error:', error);
      next(error);
    }
  });

  app.post("/api/login", 
    authLimiter, 
    loginValidation, 
    handleValidationErrors, 
    passport.authenticate("local"), 
    (req, res) => {
    res.status(200).json(sanitizeUser(req.user));
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(sanitizeUser(req.user));
  });
}

export { hashPassword, comparePasswords };
