import { prisma } from '@/lib/prisma';
import { User, UserRole } from '@prisma/client';

export class UserService {
  static async getUserById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
      include: { creatorProfile: true },
    });
  }

  static async updateUserRole(id: string, role: UserRole): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { role },
    });
  }

  static async updateUserProfile(
    id: string,
    data: {
      displayName?: string;
      username?: string;
      city?: string;
      country?: string;
      wantsToAudition?: boolean;
      avatarUrl?: string | null;
    }
  ): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }
}