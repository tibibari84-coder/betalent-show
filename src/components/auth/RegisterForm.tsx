"use client";

import Link from "next/link";
import { useActionState } from "react";

import {
  registerAction,
  type AuthActionState,
} from "@/server/auth/actions";
import { streamingFieldClass } from "@/lib/ui/streaming-forms";

import { AuthCard } from "./AuthCard";
import { SubmitButton } from "./SubmitButton";

const initialState: AuthActionState | undefined = undefined;

export function RegisterForm({
  defaultRedirect,
}: {
  defaultRedirect: string;
}) {
  const [state, formAction] = useActionState(registerAction, initialState);

  return (
    <AuthCard title="Create account" subtitle="Join BETALENT — originals-first">
      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="redirect" value={defaultRedirect} readOnly />
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
            autoComplete="new-password"
            required
            minLength={8}
            aria-invalid={state?.fieldErrors?.password ? true : undefined}
            className={streamingFieldClass}
          />
          {state?.fieldErrors?.password ? (
            <p className="text-xs text-red-600 dark:text-red-400">
              {state.fieldErrors.password}
            </p>
          ) : null}
        </div>
        <div className="flex flex-col gap-1.5 text-left">
          <label className="text-xs font-medium uppercase tracking-wide text-foreground/60">
            Confirm password
          </label>
          <input
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            aria-invalid={state?.fieldErrors?.confirmPassword ? true : undefined}
            className={streamingFieldClass}
          />
          {state?.fieldErrors?.confirmPassword ? (
            <p className="text-xs text-red-600 dark:text-red-400">
              {state.fieldErrors.confirmPassword}
            </p>
          ) : null}
        </div>
        <SubmitButton>Create account</SubmitButton>
        <p className="text-center text-sm text-foreground/60">
          Already joined?{" "}
          <Link
            className="font-medium text-foreground underline-offset-4 hover:underline"
            href="/login"
          >
            Sign in
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
