/**
 * Database types and interfaces
 */

export type UserRole = 'USER' | 'ADMIN' | 'WAITLIST';

export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';

export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  name?: string;
  phone?: string;
  location?: string;
  bio?: string;
  profileUrl?: string;
  role: UserRole;
  googleId?: string;
  resetToken?: string;
  resetTokenExpiry?: Date;
  createdAt: Date;
  updatedAt?: Date;
}

export interface AdminRequest {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  authToken: string;
  status: RequestStatus;
  expiresAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
  createdAt: Date;
}

export interface Call {
  id: string;
  title: string;
  date: Date;
  duration: string;
  summary: string;
  transcript: any;
  createdAt: Date;
}

// Database query options
export interface PaginationOptions {
  page?: number;
  limit?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

export interface UserQueryOptions extends PaginationOptions {
  role?: UserRole;
  search?: string;
}
