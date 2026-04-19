import { cache } from "react";
import { cookies } from "next/headers";

import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_DAYS,
} from "@/lib/auth/constants";
import { prisma } from "@/server/db/prisma";

import { generateSessionToken, hashSessionToken } from "./tokens";

function sessionExpiresAt(): Date {
  const d = new Date();
  d.setDate(d.getDate() + SESSION_MAX_DAYS);
  return d;
}

export const getSession = cache(async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }

  const tokenHash = hashSessionToken(token);
  const row = await prisma.session.findUnique({
    where: { tokenHash },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          onboardingCompletedAt: true,
          displayName: true,
          username: true,
          city: true,
          country: true,
          wantsToAudition: true,
        },
      },
    },
  });

  if (!row) {
    cookieStore.delete(SESSION_COOKIE_NAME);
    return null;
  }

  if (row.expiresAt.getTime() <= Date.now()) {
    await prisma.session.delete({ where: { id: row.id } }).catch(() => undefined);
    cookieStore.delete(SESSION_COOKIE_NAME);
    return null;
  }

  return {
    sessionId: row.id,
    user: row.user,
  };
});

export async function createSessionForUser(userId: string): Promise<void> {
  const token = generateSessionToken();
  const expiresAt = sessionExpiresAt();

  await prisma.session.create({
    data: {
      tokenHash: hashSessionToken(token),
      userId,
      expiresAt,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}
