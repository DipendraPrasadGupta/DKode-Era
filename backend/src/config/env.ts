import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

const getEnvVar = (key: string, fallback?: string): string => {
  const value = process.env[key] || fallback;
  if (value === undefined) {
    throw new Error(`❌ Environment variable configuration error: Missing required key "${key}"`);
  }
  return value;
};

const jwtSecret = process.env.JWT_SECRET || 'dkode-era-super-secure-jwt-key-2026';

if (process.env.NODE_ENV === 'production') {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error(
      '❌ SECURITY ERROR: JWT_SECRET must be set in production and be at least 32 characters. ' +
      'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"\''
    );
  }
} else if (!process.env.JWT_SECRET) {
  console.warn('⚠️  [SECURITY] JWT_SECRET not set in .env — using insecure development fallback. Set it before going to production!');
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(getEnvVar('PORT', '5000'), 10),
  JWT_SECRET: jwtSecret,
  ADMIN_PASSWORD: process.env.NODE_ENV === 'production'
    ? getEnvVar('ADMIN_PASSWORD')   // Required in production — no fallback
    : getEnvVar('ADMIN_PASSWORD', 'Admin@DkodeEra#2026!'),
  FRONTEND_URLS: getEnvVar('FRONTEND_URL', 'http://localhost:3000').split(',').map(url => url.trim()),
  DATABASE_URL: getEnvVar('DATABASE_URL'),
  // SMTP email config (optional — leave blank to skip real email sending)
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  SMTP_FROM: process.env.SMTP_FROM || 'D-Kode Era <no-reply@dkodeera.com>',
};

