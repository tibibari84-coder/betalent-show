import { logoutAction } from "@/server/auth/actions";
import { getSession } from "@/server/auth/session";
import { AppContainer } from "@/components/shell/AppContainer";
import { MobilePageShell } from "@/components/shell/MobilePageShell";

export default async function AppAreaPlaceholderPage() {
  const session = await getSession();

  if (!session) {
    return null;
  }

  const name =
    session.user.displayName?.trim() ||
    session.user.username ||
    session.user.email.split("@")[0];

  return (
    <MobilePageShell>
      <AppContainer>
        <main className="flex flex-col gap-4">
          <p className="text-xs font-medium uppercase tracking-wide text-foreground/55">
            BETALENT · Member area
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome, {name}
          </h1>
          <p className="text-sm text-foreground/70">
            You&apos;re set as{" "}
            <span className="font-medium text-foreground">
              @{session.user.username}
            </span>
            . Onboarding is complete — the show-first product experience will
            grow here.
          </p>
          <p className="text-sm leading-relaxed text-foreground/70">
            This area stays a placeholder for now. No feed, no auditions — just
            a secure home base after you join BETALENT.
          </p>
          <form action={logoutAction} className="pt-2">
            <button
              type="submit"
              className="inline-flex h-10 w-full items-center justify-center rounded-xl border border-foreground/20 text-sm font-medium text-foreground transition hover:bg-foreground/5"
            >
              Sign out
            </button>
          </form>
        </main>
      </AppContainer>
    </MobilePageShell>
  );
}
