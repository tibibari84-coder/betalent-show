"use server";

import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";

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
    await prisma.user.update({
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
      },
    });
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
    throw error;
  }

  redirect("/app");
}
