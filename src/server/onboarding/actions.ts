"use server";

import { Prisma, UserRole } from "@prisma/client";
import { redirect } from "next/navigation";

import { POSTHOG_EVENTS, identifyUser, trackEvent } from "@/lib/analytics/posthog";
import { sendWelcomeEmail } from "@/lib/email/resend";
import { captureException, captureMessage } from "@/lib/sentry";
import { prisma } from "@/server/db/prisma";
import { getSession } from "@/server/auth/session";

import {
  normalizeUsername,
  validateCity,
  validateCountry,
  validateDisplayName,
  validateUsername,
} from "./validators";

export type OnboardingActionState = {
  error?: string;
  fieldErrors?: {
    displayName?: string;
    username?: string;
    city?: string;
    country?: string;
  };
};

export async function completeOnboardingAction(
  _prev: OnboardingActionState | undefined,
  formData: FormData,
): Promise<OnboardingActionState> {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  if (session.user.onboardingCompletedAt) {
    redirect("/app");
  }

  const rawDisplayName = String(formData.get("displayName") ?? "");
  const rawUsername = String(formData.get("username") ?? "");
  const rawCity = String(formData.get("city") ?? "");
  const rawCountry = String(formData.get("country") ?? "");
  const wantsRaw = formData.get("wantsToAudition");
  const wantsToAudition =
    wantsRaw === "on" || wantsRaw === "true" || wantsRaw === "1";

  const displayNameErr = validateDisplayName(rawDisplayName);
  const usernameErr = validateUsername(rawUsername);
  const cityErr = validateCity(rawCity);
  const countryErr = validateCountry(rawCountry);

  if (displayNameErr || usernameErr || cityErr || countryErr) {
    return {
      fieldErrors: {
        ...(displayNameErr ? { displayName: displayNameErr } : {}),
        ...(usernameErr ? { username: usernameErr } : {}),
        ...(cityErr ? { city: cityErr } : {}),
        ...(countryErr ? { country: countryErr } : {}),
      },
    };
  }

  const displayName = rawDisplayName.trim();
  const username = normalizeUsername(rawUsername);
  const city = rawCity.trim();
  const country = rawCountry.trim();

  try {
    const updatedUser = await prisma.user.update({
      where: {
        id: session.user.id,
        onboardingCompletedAt: null,
      },
      data: {
        displayName,
        username,
        city,
        country,
        wantsToAudition,
        onboardingCompletedAt: new Date(),
        role: session.user.role === UserRole.ADMIN ? UserRole.ADMIN : UserRole.CREATOR,
        creatorProfile: {
          upsert: {
            create: {},
            update: {},
          },
        },
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
      },
    });

    await identifyUser(updatedUser.id, {
      email: updatedUser.email,
      username,
      role: updatedUser.role,
      city,
      country,
      wantsToAudition,
    });
    await trackEvent(POSTHOG_EVENTS.creator_profile_completed, {
      distinctId: updatedUser.id,
      role: updatedUser.role,
      wantsToAudition,
    });
    const emailResult = await sendWelcomeEmail(updatedUser.email, displayName);
    captureMessage(
      'Welcome email flow completed.',
      emailResult.ok ? 'info' : emailResult.skipped ? 'warning' : 'error',
      {
        userId: updatedUser.id,
        result: emailResult.ok ? 'sent' : emailResult.skipped ? 'skipped' : 'failed',
        reason: emailResult.ok ? null : emailResult.reason,
      },
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        fieldErrors: {
          username: "That username is already taken.",
        },
      };
    }
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return {
        error: "Onboarding could not be saved. Refresh and try again.",
      };
    }
    captureException(error, {
      route: "welcome",
      userId: session.user.id,
    });
    throw error;
  }

  redirect("/app");
}
