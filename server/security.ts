import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { body, validationResult } from 'express-validator';
import { Express, Request, Response, NextFunction } from 'express';
import emojiRegex from 'emoji-regex';

// Rate limiting configurations
export const createRateLimiters = () => {
  const isDev = process.env.NODE_ENV !== 'production';
  // General API rate limiter
  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // Skip rate limiting for static files and health checks
      return req.path.startsWith('/uploads/') || req.path === '/health';
    }
  });

  // Strict rate limiter for authentication endpoints
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 auth attempts per windowMs
    message: {
      error: 'Too many authentication attempts, please try again later.',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => isDev,
  });

  // File upload rate limiter
  const uploadLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 10, // Limit each IP to 10 uploads per windowMs
    message: {
      error: 'Too many file uploads, please try again later.',
      retryAfter: '10 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => isDev,
  });

  // Public API rate limiter (for public dog pages, inquiries)
  const publicLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 50, // Limit each IP to 50 requests per windowMs
    message: {
      error: 'Too many requests, please try again later.',
      retryAfter: '5 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => isDev,
  });

  return {
    generalLimiter,
    authLimiter,
    uploadLimiter,
    publicLimiter
  };
};

// Security headers configuration
export const setupSecurityHeaders = (app: Express) => {
  const isProd = process.env.NODE_ENV === 'production';
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://fonts.googleapis.com",
        ],
        fontSrc: [
          "'self'",
          "https://fonts.gstatic.com",
        ],
        imgSrc: [
          "'self'",
          "data:",
          "blob:",
          "https:",
        ],
        scriptSrc: [
          "'self'",
          // Only allow eval/inline in development for Vite
          ...(isProd ? [] : ["'unsafe-eval'", "'unsafe-inline'", "https://replit.com", "https://*.replit.com"]),
        ],
        connectSrc: [
          "'self'",
          ...(isProd ? [] : ["ws:", "wss:"]),
          "https:",
        ],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'self'"],
        upgradeInsecureRequests: isProd ? [] : null,
      },
    },
    crossOriginEmbedderPolicy: isProd,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  }));
};

// Enhanced input validation middleware
export const createValidationRules = () => {
  const emojiPattern = emojiRegex();

  // Helper to check for emojis
  const noEmojis = (value: string, { req }: any) => {
    if (emojiPattern.test(value)) {
      throw new Error('Emojis are not allowed in this field');
    }
    return true;
  };

  // Helper to sanitize HTML and dangerous characters
  const sanitizeHtml = (value: string) => {
    return value
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  };

  return {
    // Dog creation validation
    dogValidation: [
      body('name')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Dog name must be between 1 and 100 characters')
        .custom(noEmojis)
        .customSanitizer(sanitizeHtml),
      
      body('ageYears')
        .isFloat({ min: 0, max: 30 })
        .withMessage('Age must be between 0 and 30 years'),
      
      body('sex')
        .isIn(['Male', 'Female'])
        .withMessage('Sex must be Male or Female'),
      
      body('breedGuess')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('Breed guess must be under 200 characters')
        .custom(noEmojis)
        .customSanitizer(sanitizeHtml),
      
      body('weightLbs')
        .isFloat({ min: 1, max: 300 })
        .withMessage('Weight must be between 1 and 300 pounds'),
      
      body('temperament')
        .trim()
        .isLength({ min: 1, max: 500 })
        .withMessage('Temperament must be between 1 and 500 characters')
        .custom(noEmojis)
        .customSanitizer(sanitizeHtml),
      
      body('bio')
        .optional()
        .trim()
        .isLength({ max: 2000 })
        .withMessage('Bio must be under 2000 characters')
        .custom(noEmojis)
        .customSanitizer(sanitizeHtml),
    ],

    // User registration validation
    registrationValidation: [
      body('name')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Name must be between 1 and 100 characters')
        .customSanitizer(sanitizeHtml),
      
      body('email')
        .isEmail()
        .withMessage('Must be a valid email address')
        .normalizeEmail()
        .isLength({ max: 254 })
        .withMessage('Email must be under 254 characters'),
      
      body('password')
        .isLength({ min: 6, max: 128 })
        .withMessage('Password must be between 6 and 128 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
      
      body('city')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('City must be between 1 and 100 characters')
        .customSanitizer(sanitizeHtml),
      
      body('state')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('State must be between 2 and 50 characters')
        .customSanitizer(sanitizeHtml),
    ],

    // Login validation
    loginValidation: [
      body('email')
        .isEmail()
        .withMessage('Must be a valid email address')
        .normalizeEmail(),
      
      body('password')
        .isLength({ min: 1 })
        .withMessage('Password is required'),
    ],

    // Adoption inquiry validation
    inquiryValidation: [
      body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters')
        .custom(noEmojis)
        .customSanitizer(sanitizeHtml),
      
      body('email')
        .isEmail()
        .withMessage('Must be a valid email address')
        .normalizeEmail(),
      
      body('phone')
        .optional()
        .trim()
        .matches(/^[\+]?[1-9][\d]{0,15}$/)
        .withMessage('Phone number must be valid'),
      
      body('message')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Message must be under 1000 characters')
        .custom(noEmojis)
        .customSanitizer(sanitizeHtml),
    ],

    // Volunteer registration validation
    volunteerValidation: [
      body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters')
        .custom(noEmojis)
        .customSanitizer(sanitizeHtml),
      
      body('email')
        .isEmail()
        .withMessage('Must be a valid email address')
        .normalizeEmail(),
      
      body('city')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('City must be under 100 characters')
        .custom(noEmojis)
        .customSanitizer(sanitizeHtml),
      
      body('state')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('State must be under 50 characters')
        .custom(noEmojis)
        .customSanitizer(sanitizeHtml),
    ],
  };
};

// Validation result handler middleware
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// Enhanced file upload security
export const enhanceFileUploadSecurity = () => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp'
  ];

  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

  return {
    fileFilter: (req: any, file: any, cb: any) => {
      // Check MIME type
      if (!allowedMimeTypes.includes(file.mimetype)) {
        return cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'));
      }

      // Check file extension
      const ext = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf('.'));
      if (!allowedExtensions.includes(ext)) {
        return cb(new Error('Invalid file extension. Only .jpg, .jpeg, .png, and .webp files are allowed.'));
      }

      // Check for potential executable extensions in filename
      const suspiciousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.com', '.jar', '.vbs', '.js', '.php', '.asp', '.jsp'];
      const filename = file.originalname.toLowerCase();
      
      for (const suspiciousExt of suspiciousExtensions) {
        if (filename.includes(suspiciousExt)) {
          return cb(new Error('Suspicious file detected. Upload rejected for security reasons.'));
        }
      }

      cb(null, true);
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit (reduced from 8MB)
      files: 1, // Only allow single file uploads
      fieldSize: 10 * 1024, // 10KB for other form fields
      fieldNameSize: 50, // 50 bytes for field names
      fields: 20 // Maximum 20 form fields
    }
  };
};

// Enhanced session security configuration
export const enhanceSessionSecurity = () => {
  return {
    name: 'sessionId', // Don't use default session name
    secret: process.env.SESSION_SECRET || 'super-secret-change-in-production',
    resave: false,
    saveUninitialized: false,
    rolling: true, // Reset expiration on activity
    cookie: {
      // Allow opting out for local dev when serving prod build over http
      secure: process.env.NODE_ENV === 'production' && process.env.ALLOW_HTTP_SESSION !== 'true',
      httpOnly: true, // Prevent XSS attacks
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'strict' as const, // CSRF protection
    }
  };
};

// IP-based security middleware
export const createIpSecurityMiddleware = () => {
  const suspiciousIPs = new Set<string>();
  const ipAttempts = new Map<string, { count: number, lastAttempt: number }>();

  return (req: Request, res: Response, next: NextFunction) => {
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
    
    // Check if IP is marked as suspicious
    if (suspiciousIPs.has(clientIP)) {
      return res.status(429).json({ 
        error: 'IP temporarily blocked due to suspicious activity' 
      });
    }

    // Track failed authentication attempts
    if (req.path === '/api/login' && req.method === 'POST') {
      res.on('finish', () => {
        if (res.statusCode === 401) {
          const attempts = ipAttempts.get(clientIP) || { count: 0, lastAttempt: 0 };
          attempts.count++;
          attempts.lastAttempt = Date.now();
          ipAttempts.set(clientIP, attempts);

          // Block IP after 10 failed attempts in 1 hour
          if (attempts.count >= 10 && Date.now() - attempts.lastAttempt < 60 * 60 * 1000) {
            suspiciousIPs.add(clientIP);
            // Unblock after 1 hour
            setTimeout(() => {
              suspiciousIPs.delete(clientIP);
              ipAttempts.delete(clientIP);
            }, 60 * 60 * 1000);
          }
        } else if (res.statusCode === 200) {
          // Reset counter on successful login
          ipAttempts.delete(clientIP);
        }
      });
    }

    next();
  };
};
