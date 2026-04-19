"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils/cn";

const NAV = [
  { href: "/app", label: "Home", Icon: IconHome },
  { href: "/app/show", label: "Show", Icon: IconShow },
  { href: "/app/auditions", label: "Auditions", Icon: IconMic },
  { href: "/app/results", label: "Results", Icon: IconResults },
  { href: "/app/profile", label: "Profile", Icon: IconProfile },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/app") {
    return pathname === "/app" || pathname === "/app/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-foreground/10 bg-background/95 pb-[env(safe-area-inset-bottom,0px)] backdrop-blur-md"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-between gap-0 px-1 pt-1">
        {NAV.map(({ href, label, Icon }) => {
          const active = isActive(pathname, href);
          return (
            <li key={href} className="flex min-w-0 flex-1 justify-center">
              <Link
                href={href}
                className={cn(
                  "flex w-full flex-col items-center gap-0.5 rounded-lg px-1 py-2 text-[0.65rem] font-medium transition-colors",
                  active
                    ? "text-foreground"
                    : "text-foreground/45 hover:text-foreground/75",
                )}
              >
                <Icon active={active} />
                <span className="truncate">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function IconHome({ active }: { active: boolean }) {
  return (
    <svg
      aria-hidden
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      className={active ? "text-foreground" : "text-foreground/50"}
      stroke="currentColor"
      strokeWidth="1.75"
    >
      <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" />
    </svg>
  );
}

function IconShow({ active }: { active: boolean }) {
  return (
    <svg
      aria-hidden
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      className={active ? "text-foreground" : "text-foreground/50"}
      stroke="currentColor"
      strokeWidth="1.75"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m10 9 6 3-6 3V9Z" fill="currentColor" stroke="none" opacity="0.35" />
    </svg>
  );
}

function IconMic({ active }: { active: boolean }) {
  return (
    <svg
      aria-hidden
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      className={active ? "text-foreground" : "text-foreground/50"}
      stroke="currentColor"
      strokeWidth="1.75"
    >
      <path d="M12 14a3 3 0 0 0 3-3V7a3 3 0 1 0-6 0v4a3 3 0 0 0 3 3Z" />
      <path d="M19 11a7 7 0 0 1-14 0" />
      <path d="M12 18v3" />
    </svg>
  );
}

function IconResults({ active }: { active: boolean }) {
  return (
    <svg
      aria-hidden
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      className={active ? "text-foreground" : "text-foreground/50"}
      stroke="currentColor"
      strokeWidth="1.75"
    >
      <path d="M8 21h8M12 17V3" />
      <path d="m5 9 3-3 4 4 5-7 3 4" />
    </svg>
  );
}

function IconProfile({ active }: { active: boolean }) {
  return (
    <svg
      aria-hidden
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      className={active ? "text-foreground" : "text-foreground/50"}
      stroke="currentColor"
      strokeWidth="1.75"
    >
      <circle cx="12" cy="9" r="4" />
      <path d="M5 21a7 7 0 0 1 14 0" />
    </svg>
  );
}
