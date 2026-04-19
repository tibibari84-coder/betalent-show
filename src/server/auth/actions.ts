"use server";

import { Prisma } from "@prisma/client";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";
import { resolvePostAuthRedirect } from "@/lib/auth/redirect";
import { prisma } from "@/server/db/prisma";

import { hashPassword, verifyPassword } from "./password";
import {
  normalizeEmail,
  validateConfirmPassword,
  validateEmail,
  validateNewPassword,
  validatePasswordForLogin,
} from "./validators";
import { hashSessionToken } from "./tokens";
import { createSessionForUser } from "./session";

export type AuthActionState = {
  error?: string;
  fieldErrors?: {
    email?: string;
    password?: string;
    confirmPassword?: string;
  };
};

export async function loginAction(
  _prevState: AuthActionState | undefined,
  formData: FormData,
): Promise<AuthActionState> {
  const rawEmail = String(formData.get("email") ?? "");
  const rawPassword = String(formData.get("password") ?? "");
  const redirectRaw = String(formData.get("redirect") ?? "");

  const emailErr = validateEmail(rawEmail);
  const passwordErr = validatePasswordForLogin(rawPassword);

  if (emailErr || passwordErr) {
    return {
      fieldErrors: {
        ...(emailErr ? { email: emailErr } : {}),
        ...(passwordErr ? { password: passwordErr } : {}),
      },
    };
  }

  const email = normalizeEmail(rawEmail);
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      passwordHash: true,
      onboardingCompletedAt: true,
    },
  });

  const ok =
    user &&
    (await verifyPassword(rawPassword, user.passwordHash));

  if (!ok) {
    return {
      error: "We couldn't sign you in. Check your email and password.",
    };
  }

  await createSessionForUser(user.id);

  redirect(
    resolvePostAuthRedirect(
      { onboardingCompletedAt: user.onboardingCompletedAt },
      redirectRaw || undefined,
    ),
  );
}

export async function registerAction(
  _prevState: AuthActionState | undefined,
  formData: FormData,
): Promise<AuthActionState> {
  const rawEmail = String(formData.get("email") ?? "");
  const rawPassword = String(formData.get("password") ?? "");
  const rawConfirm = String(formData.get("confirmPassword") ?? "");
  const redirectRaw = String(formData.get("redirect") ?? "");

  const emailErr = validateEmail(rawEmail);
  const passwordErr = validateNewPassword(rawPassword);
  const confirmErr = validateConfirmPassword(rawPassword, rawConfirm);

  if (emailErr || passwordErr || confirmErr) {
    return {
      fieldErrors: {
        ...(emailErr ? { email: emailErr } : {}),
        ...(passwordErr ? { password: passwordErr } : {}),
        ...(confirmErr ? { confirmPassword: confirmErr } : {}),
      },
    };
  }

  const email = normalizeEmail(rawEmail);
  const passwordHash = await hashPassword(rawPassword);

  let newUser: { id: string; onboardingCompletedAt: Date | null };

  try {
    newUser = await prisma.user.create({
      data: {
        email,
        passwordHash,
      },
      select: {
        id: true,
        onboardingCompletedAt: true,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        fieldErrors: {
          email: "An account with this email already exists.",
        },
      };
    }
    throw error;
  }

  await createSessionForUser(newUser.id);

  redirect(resolvePostAuthRedirect(newUser, redirectRaw || undefined));
}

export async function logoutAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    await prisma.session.deleteMany({
      where: { tokenHash: hashSessionToken(token) },
    });
  }

  cookieStore.delete(SESSION_COOKIE_NAME);

  redirect("/login?signedOut=1");
}
