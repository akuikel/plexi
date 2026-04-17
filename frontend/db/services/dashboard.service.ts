/**
 * Dashboard service - handles dashboard-related business logic
 * This service operates at the database layer and should only be used in API routes
 */
import { CallService } from './call.service';
import { prisma } from '../client';

export interface DashboardStats {
  callsCompleted: number;
  timeSaved: number;
  successRate: number;
}

export interface CallData {
  id: string;
  title: string;
  status: string;
  duration: string;
  date: Date;
  createdAt: Date;
  transcript?: string;
  summary?: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export class DashboardService {
  /**
   * Get dashboard statistics for a user
   */
  static async getUserStats(userId: string): Promise<DashboardStats> {
    try {
      // Get user's calls with completed status
      const completedCalls = await prisma.call.findMany({
        where: {
          createdBy: userId,
          status: 'COMPLETED',
        },
        select: {
          startTime: true,
          endTime: true,
        },
      });

      // Get total calls created by user
      const totalUserCalls = await prisma.call.count({
        where: {
          createdBy: userId,
        },
      });

      // Calculate calls completed
      const callsCompleted = completedCalls.length;

      // Calculate time saved (total call time in hours)
      const timeSaved = completedCalls.reduce((total: number, call: any) => {
        if (call.startTime && call.endTime) {
          const duration = (call.endTime.getTime() - call.startTime.getTime()) / (1000 * 60 * 60); // Convert to hours
          return total + duration;
        }
        return total;
      }, 0);

      // Calculate success rate (completed calls / total calls * 100)
      const successRate = totalUserCalls > 0 ? Math.round((callsCompleted / totalUserCalls) * 100) : 0;

      return {
        callsCompleted,
        timeSaved: Math.round(timeSaved * 100) / 100, // Round to 2 decimal places
        successRate,
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return {
        callsCompleted: 0,
        timeSaved: 0,
        successRate: 0,
      };
    }
  }

  /**
   * Get user's call history
   */
  static async getUserCalls(userId: string, page: number = 1, limit: number = 10): Promise<CallData[]> {
    try {
      const result = await CallService.findMany({ page, limit });

      return result.calls.map((call) => ({
        id: call.id,
        title: call.title || `Call ${call.id.slice(-6)}`,
        status: 'completed', // Default status since not in model
        duration: call.duration,
        date: call.date,
        createdAt: call.createdAt,
        transcript: typeof call.transcript === 'string' ? call.transcript : JSON.stringify(call.transcript),
        summary: call.summary,
      }));
    } catch (error) {
      console.error('Error getting user calls:', error);
      return [];
    }
  }

  /**
   * Create a new call record
   */
  static async createCall(
    userId: string,
    callData: {
      title?: string;
      duration?: string;
      transcript?: string;
      summary?: string;
      date?: Date;
    }
  ): Promise<{ success: boolean; call?: CallData; error?: string }> {
    try {
      const newCall = await CallService.create({
        title: callData.title || `Call ${Date.now()}`,
        date: callData.date || new Date(),
        duration: callData.duration || '0 min',
        summary: callData.summary || '',
        transcript: callData.transcript || {},
      });

      return {
        success: true,
        call: {
          id: newCall.id,
          title: newCall.title,
          status: 'completed',
          duration: newCall.duration,
          date: newCall.date,
          createdAt: newCall.createdAt,
          transcript: typeof newCall.transcript === 'string' ? newCall.transcript : JSON.stringify(newCall.transcript),
          summary: newCall.summary,
        },
      };
    } catch (error) {
      console.error('Error creating call:', error);
      return { success: false, error: 'Failed to create call record' };
    }
  }

  /**
   * Update call record
   */
  static async updateCall(
    callId: string,
    updateData: {
      title?: string;
      duration?: string;
      transcript?: string;
      summary?: string;
      date?: Date;
    }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const updatePayload: any = {};
      if (updateData.title) updatePayload.title = updateData.title;
      if (updateData.duration) updatePayload.duration = updateData.duration;
      if (updateData.transcript) updatePayload.transcript = updateData.transcript;
      if (updateData.summary) updatePayload.summary = updateData.summary;
      if (updateData.date) updatePayload.date = updateData.date;

      await CallService.update(callId, updatePayload);
      return { success: true };
    } catch (error) {
      console.error('Error updating call:', error);
      return { success: false, error: 'Failed to update call record' };
    }
  }

  /**
   * Get call by ID
   */
  static async getCallById(callId: string): Promise<CallData | null> {
    try {
      const call = await CallService.findById(callId);
      if (!call) return null;

      return {
        id: call.id,
        title: call.title,
        status: 'completed',
        duration: call.duration,
        date: call.date,
        createdAt: call.createdAt,
        transcript: typeof call.transcript === 'string' ? call.transcript : JSON.stringify(call.transcript),
        summary: call.summary,
      };
    } catch (error) {
      console.error('Error getting call by ID:', error);
      return null;
    }
  }

  /**
   * Delete call record
   */
  static async deleteCall(callId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Since Call model doesn't have userId, we'll just check if call exists
      const call = await CallService.findById(callId);
      if (!call) {
        return { success: false, error: 'Call not found' };
      }

      await CallService.delete(callId);
      return { success: true };
    } catch (error) {
      console.error('Error deleting call:', error);
      return { success: false, error: 'Failed to delete call' };
    }
  }

  /**
   * Generate call report
   */
  static async generateCallReport(callId: string): Promise<{ success: boolean; report?: string; error?: string }> {
    try {
      const call = await CallService.findById(callId);
      if (!call) {
        return { success: false, error: 'Call not found' };
      }

      const transcript =
        typeof call.transcript === 'string' ? call.transcript : JSON.stringify(call.transcript, null, 2);

      // Generate a formatted report
      const report = `
CALL REPORT
===========

Call ID: ${call.id}
Title: ${call.title}
Date: ${call.date.toLocaleDateString()}
Time: ${call.date.toLocaleTimeString()}
Duration: ${call.duration}
Status: COMPLETED

${
  call.summary
    ? `
SUMMARY:
${call.summary}
`
    : ''
}

${
  transcript && transcript !== '{}'
    ? `
TRANSCRIPT:
${transcript}
`
    : ''
}

Generated on: ${new Date().toLocaleString()}
      `.trim();

      return { success: true, report };
    } catch (error) {
      console.error('Error generating call report:', error);
      return { success: false, error: 'Failed to generate call report' };
    }
  }

  /**
   * Search calls by content
   */
  static async searchCalls(userId: string, query: string): Promise<CallData[]> {
    try {
      const result = await CallService.findMany({ search: query });

      return result.calls.map((call) => ({
        id: call.id,
        title: call.title,
        status: 'completed',
        duration: call.duration,
        date: call.date,
        createdAt: call.createdAt,
        transcript: typeof call.transcript === 'string' ? call.transcript : JSON.stringify(call.transcript),
        summary: call.summary,
      }));
    } catch (error) {
      console.error('Error searching calls:', error);
      return [];
    }
  }
}
