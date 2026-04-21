import { prisma } from '@/lib/prisma';
import { User, UserRole } from '@prisma/client';
import { captureMessage } from '@/lib/sentry';

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
    const currentUser = await prisma.user.findUnique({
      where: { id },
      select: {
        role: true,
        onboardingCompletedAt: true,
      },
    });

    if (!currentUser) {
      throw new Error('User not found.');
    }

    const nextRole =
      currentUser.onboardingCompletedAt && currentUser.role === UserRole.USER
        ? UserRole.CREATOR
        : currentUser.role;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...data,
        role: nextRole,
        creatorProfile:
          currentUser.onboardingCompletedAt
            ? {
                upsert: {
                  create: {},
                  update: {},
                },
              }
            : undefined,
      },
    });

    if (nextRole !== currentUser.role) {
      captureMessage('User role aligned during profile update.', 'info', {
        userId: id,
        previousRole: currentUser.role,
        nextRole,
      });
    }

    return updatedUser;
  }
}
