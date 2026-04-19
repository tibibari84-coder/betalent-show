import type { Metadata } from "next";

import { getSession } from "@/server/auth/session";

export const metadata: Metadata = {
  title: "Home · BETALENT",
  description: "BETALENT show lobby — Season 1 originals.",
};

export default async function AppHomePage() {
  const session = await getSession();

  if (!session) {
    return null;
  }

  const name =
    session.user.displayName?.trim() ||
    session.user.username ||
    session.user.email.split("@")[0];

  return (
    <div className="flex flex-col gap-5">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-foreground/55">
        Show lobby
      </p>
      <h1 className="text-2xl font-semibold tracking-tight text-balance">
        Welcome, {name}
      </h1>
      <p className="text-sm leading-relaxed text-foreground/70">
        This is the main BETALENT app — a structured talent show, not a feed.
        Season 1 is originals only. Your show journey and the season arc will
        live here.
      </p>
      <p className="text-sm leading-relaxed text-foreground/65">
        No For You. No endless scroll. Use the tabs below when each part of the
        season opens.
      </p>
    </div>
  );
}
