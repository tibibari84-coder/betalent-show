"use client";

import { useActionState } from "react";

import { AuthCard } from "@/components/auth/AuthCard";
import { SubmitButton } from "@/components/auth/SubmitButton";
import {
  completeOnboardingAction,
  type OnboardingActionState,
} from "@/server/onboarding/actions";
import { streamingFieldClass } from "@/lib/ui/streaming-forms";

const initialState: OnboardingActionState | undefined = undefined;

export function OnboardingForm() {
  const [state, formAction] = useActionState(
    completeOnboardingAction,
    initialState,
  );

  return (
    <AuthCard
      title="Welcome to BETALENT"
      subtitle="A quick participant identity for Season 1 — originals only."
    >
      <form action={formAction} className="flex flex-col gap-4">
        {state?.error ? (
          <p
            className="rounded-lg bg-red-500/10 px-3 py-2 text-center text-sm text-red-700 dark:text-red-400"
            role="alert"
          >
            {state.error}
          </p>
        ) : null}
        <div className="flex flex-col gap-1.5 text-left">
          <label
            className="text-xs font-medium uppercase tracking-wide text-foreground/60"
            htmlFor="displayName"
          >
            Display name
          </label>
          <input
            id="displayName"
            name="displayName"
            type="text"
            autoComplete="name"
            required
            maxLength={48}
            aria-invalid={state?.fieldErrors?.displayName ? true : undefined}
            className={streamingFieldClass}
          />
          {state?.fieldErrors?.displayName ? (
            <p className="text-xs text-red-600 dark:text-red-400">
              {state.fieldErrors.displayName}
            </p>
          ) : null}
        </div>
        <div className="flex flex-col gap-1.5 text-left">
          <label
            className="text-xs font-medium uppercase tracking-wide text-foreground/60"
            htmlFor="username"
          >
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            required
            maxLength={24}
            aria-invalid={state?.fieldErrors?.username ? true : undefined}
            className={streamingFieldClass}
            placeholder="your_handle"
          />
          {state?.fieldErrors?.username ? (
            <p className="text-xs text-red-600 dark:text-red-400">
              {state.fieldErrors.username}
            </p>
          ) : (
            <p className="text-xs text-foreground/45">
              Lowercase letters, numbers, underscores. Used as your public
              handle later.
            </p>
          )}
        </div>
        <div className="flex flex-col gap-1.5 text-left">
          <label
            className="text-xs font-medium uppercase tracking-wide text-foreground/60"
            htmlFor="city"
          >
            City
          </label>
          <input
            id="city"
            name="city"
            type="text"
            autoComplete="address-level2"
            required
            maxLength={64}
            aria-invalid={state?.fieldErrors?.city ? true : undefined}
            className={streamingFieldClass}
          />
          {state?.fieldErrors?.city ? (
            <p className="text-xs text-red-600 dark:text-red-400">
              {state.fieldErrors.city}
            </p>
          ) : null}
        </div>
        <div className="flex flex-col gap-1.5 text-left">
          <label
            className="text-xs font-medium uppercase tracking-wide text-foreground/60"
            htmlFor="country"
          >
            Country
          </label>
          <input
            id="country"
            name="country"
            type="text"
            autoComplete="country-name"
            required
            maxLength={64}
            aria-invalid={state?.fieldErrors?.country ? true : undefined}
            className={streamingFieldClass}
          />
          {state?.fieldErrors?.country ? (
            <p className="text-xs text-red-600 dark:text-red-400">
              {state.fieldErrors.country}
            </p>
          ) : null}
        </div>
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-foreground/10 bg-foreground/[0.02] p-4 text-left text-sm leading-snug dark:border-white/[0.08] dark:bg-white/[0.04]">
          <input
            name="wantsToAudition"
            type="checkbox"
            className="mt-0.5 size-4 rounded border-foreground/30 text-foreground"
          />
          <span className="text-foreground/80">
            I&apos;m interested in auditioning when submissions open. (Optional
            intent — not a submission.)
          </span>
        </label>
        <SubmitButton>Continue</SubmitButton>
      </form>
    </AuthCard>
  );
}
