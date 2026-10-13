import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

// ── Allowed origins for CSRF origin check ────────────────────────────────────
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://dkodeera.com',
  'https://www.dkodeera.com',
  ...env.FRONTEND_URLS,
];

/**
 * CSRF / Origin guard for state-changing requests.
 * Blocks POST/PUT/PATCH/DELETE that come from unknown origins.
 * GET requests are always allowed.
 */
export const csrfOriginGuard = (req: Request, res: Response, next: NextFunction): void => {
  const method = req.method.toUpperCase();
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) return next();

  const origin = req.headers.origin as string | undefined;
  const referer = req.headers.referer as string | undefined;

  // In development allow all
  if (env.NODE_ENV === 'development') return next();

  const source = origin || (referer ? new URL(referer).origin : '');
  if (!source || !ALLOWED_ORIGINS.some((o) => source.startsWith(o))) {
    res.status(403).json({ error: 'Forbidden: request origin not allowed.' });
    return;
  }
  next();
};

/**
 * Enforce Content-Type: application/json on JSON write routes.
 * Prevents HTTP smuggling / parser desync attacks.
 */
export const requireJson = (req: Request, res: Response, next: NextFunction): void => {
  const method = req.method.toUpperCase();
  if (['GET', 'HEAD', 'OPTIONS', 'DELETE'].includes(method)) return next();

  const ct = req.headers['content-type'] || '';
  if (!ct.includes('application/json') && !ct.includes('multipart/form-data')) {
    res.status(415).json({ error: 'Unsupported Media Type. Use application/json.' });
    return;
  }
  next();
};

/**
 * Sanitize a string: strip HTML tags, trim, limit length.
 */
export function sanitize(value: unknown, maxLen = 2000): string {
  if (typeof value !== 'string') return '';
  return value
    .trim()
    .replace(/<[^>]*>/g, '')       // strip HTML tags
    .replace(/[<>"'`]/g, (c) =>    // encode remaining special chars
      ({ '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '`': '&#96;' }[c] ?? c)
    )
    .slice(0, maxLen);
}

/**
 * Validate email format.
 */
export function isValidEmail(email: unknown): boolean {
  if (typeof email !== 'string') return false;
  return /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/.test(email.trim());
}

/**
 * Validate phone: digits, spaces, +, -, (, ) only — max 20 chars.
 */
export function isValidPhone(phone: unknown): boolean {
  if (!phone) return true; // phone is optional in most forms
  if (typeof phone !== 'string') return false;
  return /^[\d\s\+\-\(\)]{6,20}$/.test(phone.trim());
}

/**
 * Security headers added to every response.
 * Supplements helmet with project-specific values.
 */
export const securityHeaders = (_req: Request, res: Response, next: NextFunction): void => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  next();
};

/**
 * Block requests with suspiciously large payloads before body-parser runs.
 * Protects against ReDoS and memory exhaustion via huge JSON strings.
 */
export const rejectOversizedBody = (maxBytes: number) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);
    if (contentLength > maxBytes) {
      res.status(413).json({ error: 'Payload too large.' });
      return;
    }
    next();
  };
