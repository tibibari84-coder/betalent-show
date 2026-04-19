import type { ReactNode } from "react";

import { AppContainer } from "./AppContainer";
import { MobilePageShell } from "./MobilePageShell";
import { AppTopBar } from "./AppTopBar";
import { BottomNav } from "./BottomNav";

type AppShellProps = {
  children: ReactNode;
};

/**
 * Authenticated product chrome: top bar + scrollable main + fixed bottom nav.
 */
export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <AppTopBar />
      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain">
        <MobilePageShell className="pb-28">
          <AppContainer>{children}</AppContainer>
        </MobilePageShell>
      </main>
      <BottomNav />
    </div>
  );
}
