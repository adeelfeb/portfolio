// Next.js automatically loads environment variables, but we need to ensure
// they're available in all contexts (API routes, server components, etc.)
// Load .env files explicitly to ensure they're available when this module is imported
import dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env files
// Next.js loads these automatically, but this ensures they're available
// when this config module is imported in any context
if (typeof window === 'undefined') {
  // Only load on server-side
  dotenv.config({ path: resolve(process.cwd(), '.env') });
  dotenv.config({ path: resolve(process.cwd(), '.env.local') });
  
  // Load environment-specific files
  const nodeEnv = process.env.NODE_ENV || 'development';
  if (nodeEnv === 'development') {
    dotenv.config({ path: resolve(process.cwd(), '.env.development') });
    dotenv.config({ path: resolve(process.cwd(), '.env.development.local') });
  } else if (nodeEnv === 'production') {
    dotenv.config({ path: resolve(process.cwd(), '.env.production') });
    dotenv.config({ path: resolve(process.cwd(), '.env.production.local') });
  }
}

// Build a normalized env object used across server modules
const isProd = process.env.NODE_ENV === 'production';

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  // Prefer explicit env; in development provide a safe local default to avoid crashes
  MONGODB_URI:
    process.env.MONGODB_URI ||
    (!isProd ? 'mongodb://127.0.0.1:27017/proofresponse' : ''),
  // In development, provide a safe placeholder to avoid blocking local auth if .env is not parsed
  JWT_SECRET: process.env.JWT_SECRET || (!isProd ? 'dev-jwt-secret-change-me' : ''),
  NEXT_PUBLIC_BASE_URL:
    process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8000',
  SUPERADMIN_SETUP_TOKEN: process.env.SUPERADMIN_SETUP_TOKEN || '',
  CORS_DEFAULT_ORIGINS:
    process.env.CORS_DEFAULT_ORIGINS || (!isProd ? 'http://localhost:3000' : ''),
  // SMTP2Go email configuration (REST API)
  SMTP2GO_API_KEY: process.env.SMTP2GO_API_KEY || '',
  SMTP2GO_FROM_EMAIL: process.env.SMTP2GO_FROM_EMAIL || (process.env.SMTP_FROM ? process.env.SMTP_FROM.replace(/^["']|["']$/g, '') : ''),
  SMTP2GO_FROM_NAME: process.env.SMTP2GO_FROM_NAME || 'The Server',
  
  // SMTP2Go SMTP configuration (alternative - for SMTP protocol)
  SMTP_HOST: process.env.SMTP_HOST || 'mail.smtp2go.com',
  SMTP_PORT: process.env.SMTP_PORT || '25',
  SMTP_USERNAME: process.env.SMTP_USERNAME || '',
  SMTP_PASSWORD: process.env.SMTP_PASSWORD || '',
  SMTP_SECURE: process.env.SMTP_SECURE === 'true' || false,
};

// Helper function to check if environment variables are loaded
// Useful for debugging environment variable issues
export function debugEnv() {
  if (typeof window !== 'undefined') {
    return { error: 'This function can only be called server-side' };
  }
  
  return {
    nodeEnv: process.env.NODE_ENV,
    cwd: process.cwd(),
    envLoaded: {
      MONGODB_URI: !!process.env.MONGODB_URI,
      JWT_SECRET: !!process.env.JWT_SECRET,
      SMTP_USERNAME: !!process.env.SMTP_USERNAME,
      SMTP_PASSWORD: !!process.env.SMTP_PASSWORD,
      SMTP_FROM: !!process.env.SMTP_FROM,
      SMTP_HOST: !!process.env.SMTP_HOST,
      SMTP_PORT: !!process.env.SMTP_PORT,
    },
    configValues: {
      MONGODB_URI: env.MONGODB_URI ? 'Set' : 'Not set',
      SMTP_USERNAME: env.SMTP_USERNAME ? 'Set' : 'Not set',
      SMTP_PASSWORD: env.SMTP_PASSWORD ? 'Set' : 'Not set',
      SMTP_FROM: env.SMTP2GO_FROM_EMAIL ? env.SMTP2GO_FROM_EMAIL : 'Not set',
      SMTP_HOST: env.SMTP_HOST,
      SMTP_PORT: env.SMTP_PORT,
    },
  };
}

// In production, enforce presence of required vars early
export function assertServerEnv() {
  if (isProd) {
    if (!env.MONGODB_URI) {
      throw new Error('Missing env: MONGODB_URI is required in production');
    }
    if (!env.JWT_SECRET) {
      throw new Error('Missing env: JWT_SECRET is required in production');
    }
    if (!env.LOXO_API_KEY) {
      throw new Error('Missing env: LOXO_API_KEY is required in production');
    }
    if (!env.LOXO_SLUG) {
      throw new Error('Missing env: LOXO_SLUG is required in production');
    }
  }
}


