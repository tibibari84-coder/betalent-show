import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Auditions · BETALENT",
  description: "Formal competition entry path for BETALENT.",
};

export default function AppAuditionsPage() {
  return (
    <div className="flex flex-col gap-5">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-foreground/55">
        BETALENT · Auditions
      </p>
      <h1 className="text-2xl font-semibold tracking-tight">Auditions</h1>
      <p className="text-sm leading-relaxed text-foreground/70">
        Your path into the formal competition — structured submissions, not
        casual posts. Uploads and scoring are not wired yet.
      </p>
      <p className="text-sm leading-relaxed text-foreground/65">
        When submissions open, this is where you&apos;ll enter the contest with
        clear rules and deadlines.
      </p>
    </div>
  );
}
