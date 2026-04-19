import { AppContainer } from "@/components/shell/AppContainer";
import { MobilePageShell } from "@/components/shell/MobilePageShell";

export default function InternalAreaPlaceholderPage() {
  return (
    <MobilePageShell>
      <AppContainer>
        <main className="flex flex-col gap-3">
          <p className="text-xs font-medium uppercase tracking-wide text-foreground/55">
            Future internal area
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">
            Show-runner (placeholder)
          </h1>
          <p className="text-sm leading-relaxed text-foreground/70">
            This route is reserved for production and internal operations. No
            tools here yet.
          </p>
        </main>
      </AppContainer>
    </MobilePageShell>
  );
}
