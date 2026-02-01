/**
 * User database operations
 */
import { prisma } from '../client';
import { UserQueryOptions, User, UserRole } from '../types';
import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

export class UserService {
  /**
   * Find user by email
   */
  static async findByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Find user by username
   */
  static async findByUsername(username: string) {
    return await prisma.user.findUnique({
      where: { username },
    });
  }

  /**
   * Find user by ID
   */
  static async findById(id: string) {
    return await prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * Verify user exists and get basic profile data (for middleware)
   */
  static async verifyUserExists(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          phone: true,
          location: true,
          bio: true,
          profileUrl: true,
        },
      });
      return user;
    } catch (error) {
      console.error('Database user verification failed:', error);
      return null;
    }
  }

  /**
   * Find user by Google ID
   */
  static async findByGoogleId(googleId: string) {
    return await prisma.user.findUnique({
      where: { googleId },
    });
  }

  /**
   * Find user by email or Google ID
   */
  static async findByEmailOrGoogleId(email: string, googleId: string) {
    return await prisma.user.findFirst({
      where: {
        OR: [{ email }, { googleId }],
      },
    });
  }

  /**
   * Link Google account to existing user
   */
  static async linkGoogleAccount(userId: string, googleId: string, profileUrl?: string) {
    const updateData: any = { googleId };
    if (profileUrl) {
      updateData.profileUrl = profileUrl;
    }

    return await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });
  }

  /**
   * Update user profile URL
   */
  static async updateProfileUrl(userId: string, profileUrl: string) {
    return await prisma.user.update({
      where: { id: userId },
      data: { profileUrl },
    });
  }

  /**
   * Create a new user
   */
  static async create(userData: {
    username: string;
    email: string;
    password: string;
    name?: string;
    googleId?: string;
    role?: UserRole;
  }) {
    const passwordHash = await bcrypt.hash(userData.password, 12);

    return await prisma.user.create({
      data: {
        username: userData.username,
        email: userData.email,
        passwordHash,
        name: userData.name,
        googleId: userData.googleId,
        role: userData.role || 'USER',
      },
    });
  }

  /**
   * Create OAuth user
   */
  static async createOAuthUser(oauthData: {
    email: string;
    name: string | null;
    googleId: string;
    profileUrl?: string;
  }) {
    const { email, name, googleId, profileUrl } = oauthData;
    const dummyPassword = randomBytes(32).toString('hex');
    const passwordHash = await bcrypt.hash(dummyPassword, 12);

    // Try with email as username first
    try {
      return await prisma.user.create({
        data: {
          email,
          username: email,
          name,
          passwordHash,
          googleId,
          profileUrl,
          role: 'USER',
        },
      });
    } catch (error) {
      // If email is taken as username, generate a fallback
      const baseUsername = email.split('@')[0];
      const fallbackUsername = `${baseUsername}-${randomBytes(4).toString('hex')}`;

      return await prisma.user.create({
        data: {
          email,
          username: fallbackUsername,
          name,
          passwordHash,
          googleId,
          profileUrl,
          role: 'USER',
        },
      });
    }
  }

  /**
   * Update user
   */
  static async update(id: string, data: Partial<User>) {
    return await prisma.user.update({
      where: { id },
      data,
    });
  }

  /**
   * Update user password
   */
  static async updatePassword(id: string, password: string) {
    const passwordHash = await bcrypt.hash(password, 12);
    return await prisma.user.update({
      where: { id },
      data: { passwordHash },
    });
  }

  /**
   * Set reset token
   */
  static async setResetToken(email: string, token: string, expiresAt: Date) {
    return await prisma.user.update({
      where: { email },
      data: {
        resetToken: token,
        resetTokenExpiry: expiresAt,
      },
    });
  }

  /**
   * Create password reset token
   */
  static async createPasswordResetToken(userId: string) {
    const resetToken = randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    return await prisma.user.update({
      where: { id: userId },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });
  }

  /**
   * Reset password with token
   */
  static async resetPasswordWithToken(token: string, newPassword: string) {
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return null;
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    return await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });
  }

  /**
   * Clear reset token
   */
  static async clearResetToken(id: string) {
    return await prisma.user.update({
      where: { id },
      data: {
        resetToken: null,
        resetTokenExpiry: null,
      },
    });
  }

  /**
   * Verify password
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  /**
   * Get all users with pagination and filters
   */
  static async findMany(options: UserQueryOptions = {}) {
    const { page = 1, limit = 10, orderBy = 'createdAt', orderDirection = 'desc', role, search } = options;

    const skip = (page - 1) * limit;

    const where: any = {};

    if (role) {
      where.role = role;
    }

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [orderBy]: orderDirection },
        select: {
          id: true,
          username: true,
          email: true,
          name: true,
          profileUrl: true,
          role: true,
          createdAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Delete user
   */
  static async delete(id: string) {
    return await prisma.user.delete({
      where: { id },
    });
  }
}
