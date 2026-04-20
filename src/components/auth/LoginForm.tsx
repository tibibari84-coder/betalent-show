"use client";

import Link from "next/link";
import { useActionState } from "react";

import {
  loginAction,
  type AuthActionState,
} from "@/server/auth/actions";
import { streamingFieldClass } from "@/lib/ui/streaming-forms";

import { AuthCard } from "./AuthCard";
import { SubmitButton } from "./SubmitButton";

const initialState: AuthActionState | undefined = undefined;

export function LoginForm({
  defaultRedirect,
  signedOut,
}: {
  defaultRedirect: string;
  signedOut?: boolean;
}) {
  const [state, formAction] = useActionState(loginAction, initialState);

  return (
    <AuthCard title="Sign in" subtitle="Member access to BETALENT">
      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="redirect" value={defaultRedirect} readOnly />
        {signedOut ? (
          <p
            className="rounded-lg border border-foreground/10 bg-foreground/[0.03] px-3 py-2 text-center text-sm text-foreground/75"
            role="status"
          >
            You&apos;re signed out. Sign in to continue.
          </p>
        ) : null}
        {state?.error ? (
          <p
            className="rounded-lg bg-red-500/10 px-3 py-2 text-center text-sm text-red-700 dark:text-red-400"
            role="alert"
          >
            {state.error}
          </p>
        ) : null}
        <div className="flex flex-col gap-1.5 text-left">
          <label className="text-xs font-medium uppercase tracking-wide text-foreground/60">
            Email
          </label>
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            aria-invalid={state?.fieldErrors?.email ? true : undefined}
            className={streamingFieldClass}
          />
          {state?.fieldErrors?.email ? (
            <p className="text-xs text-red-600 dark:text-red-400">
              {state.fieldErrors.email}
            </p>
          ) : null}
        </div>
        <div className="flex flex-col gap-1.5 text-left">
          <label className="text-xs font-medium uppercase tracking-wide text-foreground/60">
            Password
          </label>
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
            aria-invalid={state?.fieldErrors?.password ? true : undefined}
            className={streamingFieldClass}
          />
          {state?.fieldErrors?.password ? (
            <p className="text-xs text-red-600 dark:text-red-400">
              {state.fieldErrors.password}
            </p>
          ) : null}
        </div>
        <SubmitButton>Sign in</SubmitButton>
        <p className="text-center text-sm text-foreground/60">
          No account?{" "}
          <Link
            className="font-medium text-foreground underline-offset-4 hover:underline"
            href="/register"
          >
            Create one
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
