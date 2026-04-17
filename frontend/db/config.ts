/**
 * Database configuration and environment variables
 */

export const dbConfig = {
  url: process.env.DATABASE_URL || '',
  directUrl: process.env.DIRECT_URL,
  maxConnections: 10,
  connectionTimeout: 30000,
} as const;

export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';

// Validate required environment variables (only on server side)
if (typeof window === 'undefined' && !dbConfig.url) {
  throw new Error('DATABASE_URL environment variable is required');
}
