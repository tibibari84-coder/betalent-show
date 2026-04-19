import type { Contestant } from "@prisma/client";

import { prisma } from "@/server/db/prisma";

/** Account (`User`) is separate from show identity (`Contestant`). */
export async function getContestantByUserId(
  userId: string,
): Promise<Contestant | null> {
  return prisma.contestant.findUnique({ where: { userId } });
}

/**
 * Ensures a BETALENT contestant row exists for this account — populated from onboarding fields.
 */
export async function getOrCreateContestantForUser(
  userId: string,
): Promise<Contestant> {
  const existing = await getContestantByUserId(userId);
  if (existing) {
    return existing;
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: {
      displayName: true,
      username: true,
      city: true,
      country: true,
      email: true,
    },
  });

  const displayName =
    user.displayName?.trim() ||
    user.email.split("@")[0] ||
    "BETALENT participant";

  const username =
    user.username?.trim() || `talent_${userId.slice(-8)}`;

  return prisma.contestant.create({
    data: {
      userId,
      displayName,
      username,
      city: user.city?.trim() ?? null,
      country: user.country?.trim() ?? null,
      status: "ACTIVE",
    },
  });
}
