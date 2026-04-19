import type { Metadata } from "next";

import { logoutAction } from "@/server/auth/actions";
import { getSession } from "@/server/auth/session";

export const metadata: Metadata = {
  title: "Profile · BETALENT",
  description: "Your BETALENT identity.",
};

export default async function AppProfilePage() {
  const session = await getSession();

  if (!session) {
    return null;
  }

  const u = session.user;

  return (
    <div className="flex flex-col gap-6">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-foreground/55">
        BETALENT · You
      </p>
      <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
      <p className="text-sm text-foreground/70">
        Your participant identity from onboarding — not a full profile product
        yet.
      </p>

      <dl className="flex flex-col gap-4 rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-4 text-sm">
        <div className="flex flex-col gap-0.5">
          <dt className="text-xs uppercase tracking-wide text-foreground/50">
            Display name
          </dt>
          <dd className="font-medium text-foreground">
            {u.displayName?.trim() || "—"}
          </dd>
        </div>
        <div className="flex flex-col gap-0.5">
          <dt className="text-xs uppercase tracking-wide text-foreground/50">
            Username
          </dt>
          <dd className="font-medium text-foreground">
            {u.username ? `@${u.username}` : "—"}
          </dd>
        </div>
        <div className="flex flex-col gap-0.5">
          <dt className="text-xs uppercase tracking-wide text-foreground/50">
            Email
          </dt>
          <dd className="break-all font-medium text-foreground">{u.email}</dd>
        </div>
        <div className="flex flex-col gap-0.5">
          <dt className="text-xs uppercase tracking-wide text-foreground/50">
            City
          </dt>
          <dd className="text-foreground">{u.city?.trim() || "—"}</dd>
        </div>
        <div className="flex flex-col gap-0.5">
          <dt className="text-xs uppercase tracking-wide text-foreground/50">
            Country
          </dt>
          <dd className="text-foreground">{u.country?.trim() || "—"}</dd>
        </div>
        <div className="flex flex-col gap-0.5">
          <dt className="text-xs uppercase tracking-wide text-foreground/50">
            Audition interest
          </dt>
          <dd className="text-foreground">
            {u.wantsToAudition
              ? "Interested when submissions open"
              : "Not indicated"}
          </dd>
        </div>
      </dl>

      <form action={logoutAction}>
        <button
          type="submit"
          className="inline-flex h-10 w-full items-center justify-center rounded-xl border border-foreground/20 text-sm font-medium text-foreground transition hover:bg-foreground/5"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
