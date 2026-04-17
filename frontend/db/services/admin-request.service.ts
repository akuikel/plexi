/**
 * Admin request database operations
 */
import { prisma } from '../client';
import { RequestStatus } from '../types';

export class AdminRequestService {
  /**
   * Create an admin request
   */
  static async create(requestData: {
    userId: string;
    userEmail: string;
    userName: string;
    authToken: string;
    expiresAt: Date;
  }) {
    return await prisma.adminRequest.create({
      data: requestData,
    });
  }

  /**
   * Find by auth token
   */
  static async findByToken(authToken: string) {
    return await prisma.adminRequest.findUnique({
      where: { authToken },
    });
  }

  /**
   * Find by user ID
   */
  static async findByUserId(userId: string) {
    return await prisma.adminRequest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Update request status
   */
  static async updateStatus(id: string, status: RequestStatus, approvedBy?: string) {
    return await prisma.adminRequest.update({
      where: { id },
      data: {
        status,
        approvedBy,
        approvedAt: status === 'APPROVED' ? new Date() : null,
      },
    });
  }

  /**
   * Get all pending requests
   */
  static async getPendingRequests() {
    return await prisma.adminRequest.findMany({
      where: {
        status: 'PENDING',
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Clean up expired requests
   */
  static async cleanupExpired() {
    return await prisma.adminRequest.updateMany({
      where: {
        status: 'PENDING',
        expiresAt: { lt: new Date() },
      },
      data: { status: 'EXPIRED' },
    });
  }

  /**
   * Get requests with pagination
   */
  static async findMany(
    options: {
      page?: number;
      limit?: number;
      status?: RequestStatus;
    } = {}
  ) {
    const { page = 1, limit = 10, status } = options;
    const skip = (page - 1) * limit;

    const where = status ? { status } : {};

    const [requests, total] = await Promise.all([
      prisma.adminRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.adminRequest.count({ where }),
    ]);

    return {
      requests,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Delete request
   */
  static async delete(id: string) {
    return await prisma.adminRequest.delete({
      where: { id },
    });
  }
}
