/**
 * Call database operations
 */
import { prisma } from '../client';

export class CallService {
  /**
   * Create a new call record
   */
  static async create(callData: { title: string; date: Date; duration: string; summary: string; transcript: any }) {
    return await prisma.call.create({
      data: callData,
    });
  }

  /**
   * Find call by ID
   */
  static async findById(id: string) {
    return await prisma.call.findUnique({
      where: { id },
    });
  }

  /**
   * Get all calls with pagination
   */
  static async findMany(
    options: {
      page?: number;
      limit?: number;
      search?: string;
    } = {}
  ) {
    const { page = 1, limit = 10, search } = options;
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' as any } },
            { summary: { contains: search, mode: 'insensitive' as any } },
          ],
        }
      : {};

    const [calls, total] = await Promise.all([
      prisma.call.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
      }),
      prisma.call.count({ where }),
    ]);

    return {
      calls,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Update call
   */
  static async update(
    id: string,
    data: Partial<{
      title: string;
      date: Date;
      duration: string;
      summary: string;
      transcript: any;
    }>
  ) {
    return await prisma.call.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete call
   */
  static async delete(id: string) {
    return await prisma.call.delete({
      where: { id },
    });
  }

  /**
   * Get call statistics
   */
  static async getStats() {
    const [totalCalls, totalDuration] = await Promise.all([
      prisma.call.count(),
      prisma.call.findMany({
        select: { duration: true },
      }),
    ]);

    // Calculate total duration in minutes (assuming duration is in "X min" format)
    const totalMinutes = totalDuration.reduce((acc, call) => {
      const minutes = parseInt(call.duration.replace(/[^\d]/g, '')) || 0;
      return acc + minutes;
    }, 0);

    return {
      totalCalls,
      totalMinutes,
      averageCallDuration: totalCalls > 0 ? Math.round(totalMinutes / totalCalls) : 0,
    };
  }
}
