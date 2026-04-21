import { prisma } from '@/lib/prisma';
import { CreatorProfile } from '@prisma/client';

type SocialLinks = {
  instagram?: string;
  twitter?: string;
  youtube?: string;
  tiktok?: string;
  linkedin?: string;
  facebook?: string;
};

export class CreatorProfileService {
  static async getCreatorProfile(userId: string): Promise<CreatorProfile | null> {
    return prisma.creatorProfile.findUnique({
      where: { userId },
    });
  }

  static async createOrUpdateCreatorProfile(
    userId: string,
    data: {
      bio?: string;
      website?: string;
      socialLinks?: SocialLinks;
    }
  ): Promise<CreatorProfile> {
    return prisma.creatorProfile.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        ...data,
      },
    });
  }
}