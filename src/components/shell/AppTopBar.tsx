import Link from "next/link";

/** Minimal authenticated top bar — brand only; no notifications or messaging yet. */
export function AppTopBar() {
  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center border-b border-foreground/10 bg-background/90 px-4 backdrop-blur-md">
      <Link
        href="/app"
        className="text-sm font-semibold tracking-[0.18em] text-foreground"
      >
        BETALENT
      </Link>
    </header>
  );
}
