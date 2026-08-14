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

if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'dkode-era-secret-key-12345')) {
  console.warn('⚠️ SECURITY WARNING: Using default JWT_SECRET in production mode! Set a unique JWT_SECRET in .env');
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(getEnvVar('PORT', '5000'), 10),
  JWT_SECRET: jwtSecret,
  ADMIN_PASSWORD: getEnvVar('ADMIN_PASSWORD', 'Admin@DkodeEra#2026!'),
  FRONTEND_URLS: getEnvVar('FRONTEND_URL', 'http://localhost:3000').split(',').map(url => url.trim()),
  DATABASE_URL: getEnvVar('DATABASE_URL'),
  // SMTP email config (optional — leave blank to skip real email sending)
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  SMTP_FROM: process.env.SMTP_FROM || 'D-Kode Era <no-reply@dkodeera.com>',
};

