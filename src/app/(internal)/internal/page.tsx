import { logoutAction } from "@/server/auth/actions";
import { getSession } from "@/server/auth/session";
import { AppContainer } from "@/components/shell/AppContainer";
import { MobilePageShell } from "@/components/shell/MobilePageShell";

export default async function InternalAreaPlaceholderPage() {
  const session = await getSession();

  if (!session) {
    return null;
  }

  return (
    <MobilePageShell>
      <AppContainer>
        <main className="flex flex-col gap-4">
          <p className="text-xs font-medium uppercase tracking-wide text-foreground/55">
            Internal
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">
            Show-runner (placeholder)
          </h1>
          <p className="text-sm text-foreground/70">
            Signed in as{" "}
            <span className="font-medium text-foreground">{session.user.email}</span>
            . Full admin and tooling are intentionally deferred — this route is
            only gated so it does not read like consumer product UI.
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
