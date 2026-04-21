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
    <div className="member-app-root flex w-full flex-col">
      <AppTopBar />
      {/* Window scroll: no nested overflow-y — nested scroll regions trap touch/scroll on mobile Safari. */}
      <div
        className="w-full min-w-0 flex-1 pb-[calc(7.75rem+env(safe-area-inset-bottom,0px))] sm:pb-[calc(8rem+env(safe-area-inset-bottom,0px))]"
        role="main"
      >
        <MobilePageShell className="pb-0">
          <AppContainer>{children}</AppContainer>
        </MobilePageShell>
      </div>
      <BottomNav />
    </div>
  );
}
