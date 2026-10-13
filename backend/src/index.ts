import './config/env'; // Load and validate environment variables first
import express from 'express';
import cors from 'cors';
import path from 'path';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { loggerMiddleware } from './middleware/logger';
import { errorHandler } from './middleware/error';
import { securityHeaders, csrfOriginGuard, rejectOversizedBody } from './middleware/security';
import clientRoutes from './routes/client';
import adminRoutes from './routes/admin';
import prisma from './config/prisma';

const app = express();

// Trust reverse proxy (Cloudflare, Nginx, Vercel, Heroku) for accurate IP rate limiting
app.set('trust proxy', 1);
app.disable('x-powered-by');

// ─── SECURITY HEADERS ────────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
  noSniff: true,
  xssFilter: true,
}));

// ─── ADDITIONAL SECURITY HEADERS ─────────────────────────────────────────────
app.use(securityHeaders);

// ─── CSRF ORIGIN GUARD ────────────────────────────────────────────────────────
app.use(csrfOriginGuard);

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);

    const allowedOrigins = [...env.FRONTEND_URLS, 'http://localhost:3000', 'https://dkodeera.com', 'https://www.dkodeera.com'];
    if (allowedOrigins.indexOf(origin) !== -1 || env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// ─── RATE LIMITING ────────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per windowMs
  message: { error: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 requests per windowMs
  message: { error: 'Too many submission or authentication attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(globalLimiter);
app.use('/admin/api/auth/login', strictLimiter);
app.use('/api/contact', strictLimiter);
app.use('/api/messages', strictLimiter);
app.use('/api/orders', strictLimiter);
app.use('/api/apply', strictLimiter);
app.use('/api/cv-upload', strictLimiter);
app.use('/api/blogs/:slug/comments', strictLimiter);

// ─── BODY PARSING (with per-route size limits) ───────────────────────────────
app.use(rejectOversizedBody(2 * 1024 * 1024)); // 2MB hard cap before parsing
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ─── REQUEST LOGGER ───────────────────────────────────────────────────────────
app.use(loggerMiddleware);

// ─── STATIC ASSETS & UPLOADS SECURITY ─────────────────────────────────────────
app.use('/admin/assets', express.static(path.join(__dirname, '../admin/assets')));

// Serve uploads with strict isolation: no-sniff, CSP sandbox, disable script execution
app.use('/uploads', (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'; sandbox");
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(__dirname, '../uploads')));


// ─── HEALTH CHECK ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "D-Kode Era backend is connected",
  });
});

// ─── ROUTES ───────────────────────────────────────────────────────────────────

// Public client-facing routes (no auth required)
app.use('/api', clientRoutes);

// Protected admin CMS routes (JWT auth required)
app.use('/admin', adminRoutes);

// ─── FALLBACK 404 HANDLER ─────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// ─── GLOBAL ERROR HANDLER (must be registered last) ───────────────────────────
app.use(errorHandler);

// ─── SERVER STARTUP ───────────────────────────────────────────────────────────
const server = app.listen(env.PORT, () => {
  console.log('');
  console.log('  D-Kode Era Backend API');
  console.log('  ─────────────────────────────────────');
  console.log(`  🚀 Client API:  http://localhost:${env.PORT}/api`);
  console.log(`  🛡️  Admin API:   http://localhost:${env.PORT}/admin`);
  console.log(`  ❤️  Health:      http://localhost:${env.PORT}/health`);
  console.log(`  🌐 CORS:        ${env.FRONTEND_URLS.join(', ')}`);
  console.log(`  🗂️  Mode:        ${env.NODE_ENV}`);
  console.log('');
});

// Graceful Shutdown Handler
const shutdown = (signal: string) => {
  console.log(`\n[SERVER] ${signal} received: shutting down gracefully...`);
  server.close(async () => {
    console.log('[SERVER] HTTP server closed.');
    try {
      await prisma.$disconnect();
      console.log('[PRISMA] Disconnected successfully.');
    } catch (err) {
      console.error('[PRISMA] Error disconnecting:', err);
    }
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

