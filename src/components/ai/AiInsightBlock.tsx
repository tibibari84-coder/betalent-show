import type { PublicAiOutput } from "@/server/ai/types";

/**
 * Interpretive AI presentation — explicitly not official competition truth.
 */
export function AiInsightBlock(props: {
  variant: "judge" | "host" | "producer";
  output: PublicAiOutput | null;
}) {
  const { variant, output } = props;
  if (!output) {
    return null;
  }

  const roleLabel =
    variant === "judge"
      ? "AI Judge reading"
      : variant === "host"
        ? "AI Host narration"
        : "AI Producer assist";

  return (
    <aside className="mt-3 flex flex-col gap-2 rounded-2xl border border-foreground/12 bg-foreground/[0.03] p-4">
      <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-foreground/42">
        BETALENT AI · interpretive presentation · does not decide placements or
        advancement
      </p>
      <p className="text-[11px] font-medium uppercase tracking-wide text-foreground/48">
        {roleLabel}
      </p>
      {output.title?.trim() ? (
        <p className="text-base font-semibold tracking-tight text-foreground">
          {output.title.trim()}
        </p>
      ) : null}
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/78">
        {output.body}
      </p>
      {variant === "judge" && output.metaJson ? (
        <div className="flex flex-col gap-3 border-t border-foreground/10 pt-3 text-xs text-foreground/72">
          {output.metaJson.strengths.length > 0 ? (
            <div>
              <p className="font-medium uppercase tracking-wide text-foreground/50">
                Strengths
              </p>
              <ul className="mt-1 list-disc pl-4">
                {output.metaJson.strengths.map((s, i) => (
                  <li key={`${i}-${s}`}>{s}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {output.metaJson.weaknesses.length > 0 ? (
            <div>
              <p className="font-medium uppercase tracking-wide text-foreground/50">
                Weaknesses
              </p>
              <ul className="mt-1 list-disc pl-4">
                {output.metaJson.weaknesses.map((s, i) => (
                  <li key={`${i}-${s}`}>{s}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {output.metaJson.takeaway.trim() ? (
            <p className="text-foreground/75">
              <span className="font-medium text-foreground/55">Takeaway · </span>
              {output.metaJson.takeaway}
            </p>
          ) : null}
        </div>
      ) : null}
    </aside>
  );
}
