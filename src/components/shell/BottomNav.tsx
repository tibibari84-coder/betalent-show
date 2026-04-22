"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { appRoutes } from "@/lib/app-routes";
import { cn } from "@/lib/utils/cn";

const NAV = [
  { href: "/app", label: "Home", Icon: IconHome },
  { href: appRoutes.creator, label: "Creator", Icon: IconCreator },
  { href: appRoutes.uploads, label: "Uploads", Icon: IconUploads },
  { href: appRoutes.submissions, label: "Entries", Icon: IconEntries },
  { href: appRoutes.profile, label: "Profile", Icon: IconProfile },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/app") {
    return pathname === "/app" || pathname === "/app/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * “Liquid glass” dock — web best-approximation of iOS system bar materials
 * (UIGlass / vibrancy). Heavier blur + saturation + specular stack; our SVGs unchanged.
 */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-[max(0.9rem,env(safe-area-inset-bottom))] pt-2.5"
    >
      <div className="pointer-events-auto w-full max-w-md">
        {/* 1) Outer refraction ring (bright lip like system glass) */}
        <div
          className={cn(
            "rounded-[2.6rem] p-[1.25px]",
            "bg-gradient-to-b from-white/60 via-white/18 to-white/[0.08]",
            "shadow-[0_20px_50px_-8px_rgba(0,0,0,0.55),0_8px_24px_-6px_rgba(0,0,0,0.4),0_0_0_1px_rgba(0,0,0,0.2)]",
          )}
        >
          {/* 2) Main frosted body — system-style heavy blur + boost saturation */}
          <div
            className={cn(
              "relative overflow-hidden rounded-[2.5rem]",
              "border border-white/10",
              "bg-gradient-to-b from-white/[0.18] via-white/[0.08] to-white/[0.03]",
              "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.52),inset_0_-1px_0_0_rgba(255,255,255,0.06)]",
              "backdrop-blur-[52px] backdrop-saturate-[195%]",
              "[-webkit-backdrop-filter:saturate(195%)_blur(52px)]",
              "supports-[backdrop-filter]:from-white/[0.14] supports-[backdrop-filter]:via-white/[0.06]",
            )}
          >
            {/* Specular streak + soft bloom (liquid highlight) */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-3 top-0 h-[42%] rounded-b-[3rem] bg-gradient-to-b from-white/38 via-white/12 to-transparent opacity-95"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -top-10 left-1/2 h-24 w-[92%] -translate-x-1/2 rounded-full bg-white/25 blur-3xl mix-blend-overlay"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-[2.5rem] bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-70"
            />

            <ul className="relative z-[1] flex items-end justify-between gap-px px-1 pb-1 pt-1.5">
              {NAV.map(({ href, label, Icon }) => {
                const active = isActive(pathname, href);
                return (
                  <li key={href} className="flex min-w-0 flex-1 justify-center">
                    <Link
                      href={href}
                      className={cn(
                        "group flex w-full flex-col items-center gap-1 rounded-[1.35rem] px-0.5 pb-1 pt-1 outline-none transition-[transform,color] duration-200 ease-out active:scale-[0.96]",
                        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40",
                      )}
                    >
                      <span
                        className={cn(
                          "relative flex h-[2.65rem] w-[2.65rem] shrink-0 items-center justify-center rounded-full transition-[background-color,box-shadow,backdrop-filter] duration-200 ease-out",
                          active
                            ? cn(
                                "border border-white/22 bg-white/[0.28] text-foreground",
                                "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.55),0_4px_14px_-4px_rgba(0,0,0,0.45)]",
                                "backdrop-blur-md backdrop-saturate-150",
                              )
                            : "border border-transparent text-foreground/50 group-hover:border-white/12 group-hover:bg-white/[0.09] group-hover:text-foreground/88",
                        )}
                      >
                        {active ? (
                          <>
                            <span
                              aria-hidden
                              className="absolute inset-0 rounded-full bg-gradient-to-b from-sky-300/45 via-blue-500/25 to-indigo-600/30 opacity-95"
                            />
                            <span
                              aria-hidden
                              className="absolute inset-[1px] rounded-full bg-gradient-to-t from-transparent via-white/8 to-white/25 opacity-90"
                            />
                          </>
                        ) : null}
                        <span className="relative z-[1] flex items-center justify-center drop-shadow-sm">
                          <Icon active={active} />
                        </span>
                      </span>
                      <span
                        className={cn(
                          "max-w-[4.5rem] truncate text-center text-[0.61rem] font-semibold leading-none tracking-[0.045em]",
                          active ? "text-foreground" : "text-foreground/42",
                        )}
                      >
                        {label}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
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
      className={active ? "text-foreground" : "text-current"}
      stroke="currentColor"
      strokeWidth="1.75"
    >
      <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" />
    </svg>
  );
}

function IconCreator({ active }: { active: boolean }) {
  return (
    <svg
      aria-hidden
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      className={active ? "text-foreground" : "text-current"}
      stroke="currentColor"
      strokeWidth="1.75"
    >
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </svg>
  );
}

function IconUploads({ active }: { active: boolean }) {
  return (
    <svg
      aria-hidden
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      className={active ? "text-foreground" : "text-current"}
      stroke="currentColor"
      strokeWidth="1.75"
    >
      <path d="M12 16V5" />
      <path d="m7.5 9.5 4.5-4.5 4.5 4.5" />
      <rect x="4" y="16.5" width="16" height="3.5" rx="1.75" />
    </svg>
  );
}

function IconEntries({ active }: { active: boolean }) {
  return (
    <svg
      aria-hidden
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      className={active ? "text-foreground" : "text-current"}
      stroke="currentColor"
      strokeWidth="1.75"
    >
      <rect x="4" y="5" width="16" height="14" rx="2.5" />
      <path d="M8 9h8M8 13h8M8 17h5" strokeLinecap="round" opacity="0.7" />
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
      className={active ? "text-foreground" : "text-current"}
      stroke="currentColor"
      strokeWidth="1.75"
    >
      <circle cx="12" cy="9" r="4" />
      <path d="M5 21a7 7 0 0 1 14 0" />
    </svg>
  );
}
