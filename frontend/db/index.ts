/**
 * Database barrel export - single entry point for all database operations
 */

// Core client and configuration
export { default as prisma } from './client';
export * from './config';

// Types and interfaces
export * from './types';

// Services
export * from './services';
