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

// High-entropy 64-byte hex key fallback for production if JWT_SECRET was not injected into cloud dashboard
const DEFAULT_SECURE_JWT =
  '9df8af31831cedb0e650a3443cabc5f0e0f7a9844d1b1d3ab7309501ac6723e761ea92b550f186e8a9c9ad70bbf9035ba13073ec29eef47841ee111d405dc982';

let jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret || jwtSecret.length < 32) {
  if (process.env.NODE_ENV === 'production') {
    console.warn(
      '⚠️  [SECURITY WARNING] JWT_SECRET was not set in cloud environment variables (or is shorter than 32 characters). ' +
      'Using secure default fallback. Set your own unique JWT_SECRET in your Render dashboard!'
    );
    jwtSecret = DEFAULT_SECURE_JWT;
  } else {
    jwtSecret = 'dkode-era-super-secure-jwt-key-2026';
  }
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(getEnvVar('PORT', '5000'), 10),
  JWT_SECRET: jwtSecret,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'Admin@DkodeEra#2026!',
  FRONTEND_URLS: (process.env.FRONTEND_URL || 'http://localhost:3000,https://dipendraprasadgupta.vercel.app')
    .split(',')
    .map(url => url.trim()),
  DATABASE_URL: getEnvVar('DATABASE_URL'),
  // SMTP email config (optional — leave blank to skip real email sending)
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  SMTP_FROM: process.env.SMTP_FROM || 'D-Kode Era <no-reply@dkodeera.com>',
};
