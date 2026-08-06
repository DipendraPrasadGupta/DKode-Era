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

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(getEnvVar('PORT', '5000'), 10),
  JWT_SECRET: getEnvVar('JWT_SECRET', 'dkode-era-secret-key-12345'),
  FRONTEND_URLS: getEnvVar('FRONTEND_URL', 'http://localhost:3000').split(',').map(url => url.trim()),
  DATABASE_URL: getEnvVar('DATABASE_URL'), // Required for Prisma connection confirmation
};
