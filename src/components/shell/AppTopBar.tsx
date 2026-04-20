import Link from "next/link";

/** Minimal bar — solid fill, no blur/border (blur seams read as a stripe and confuse scroll). */
export function AppTopBar() {
  return (
    <header className="sticky top-0 z-30 flex h-[3.25rem] shrink-0 items-center bg-background px-4 sm:h-14 sm:px-6">
      <Link
        href="/app"
        className="text-[13px] font-semibold tracking-[0.26em] text-foreground"
      >
        BETALENT
      </Link>
    </header>
  );
}
