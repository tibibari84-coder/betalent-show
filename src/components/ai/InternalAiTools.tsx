"use client";

import { useActionState } from "react";

import { SubmitButton } from "@/components/auth/SubmitButton";
import type { AiActionState } from "@/server/ai/ai-actions";
import {
  archiveAiOutputAction,
  generateHostStageAction,
  generateHostStageResultAction,
  generateJudgeAction,
  generateProducerPlacementAction,
  publishAiOutputAction,
  reviewAiOutputAction,
} from "@/server/ai/ai-actions";

const initial: AiActionState | undefined = undefined;

export function InternalAiTools(props: {
  /** When false, generation actions will fail until OPENAI_API_KEY is set. */
  openAiConfigured?: boolean;
  recent: {
    id: string;
    kind: string;
    targetType: string;
    status: string;
    title: string | null;
    body: string;
    promptVersion: string | null;
    performanceId: string | null;
    stageId: string | null;
    episodeId: string | null;
    stageResultId: string | null;
    editorialPlacementId: string | null;
    updatedAt: Date;
  }[];
}) {
  const openAiOk = props.openAiConfigured !== false;

  const [judgeState, judgeAction] = useActionState(generateJudgeAction, initial);
  const [hostStageState, hostStageAction] = useActionState(
    generateHostStageAction,
    initial,
  );
  const [hostSrState, hostSrAction] = useActionState(
    generateHostStageResultAction,
    initial,
  );
  const [prodState, prodAction] = useActionState(
    generateProducerPlacementAction,
    initial,
  );

  const [reviewState, reviewAction] = useActionState(reviewAiOutputAction, initial);
  const [pubState, publishAction] = useActionState(publishAiOutputAction, initial);
  const [archiveState, archiveAction] = useActionState(
    archiveAiOutputAction,
    initial,
  );

  return (
    <div className="flex flex-col gap-10">
      {!openAiOk ? (
        <p
          className="rounded-xl border border-amber-500/25 bg-amber-500/5 px-3 py-2 text-sm leading-relaxed text-foreground/85"
          role="status"
        >
          <span className="font-medium text-foreground">OPENAI_API_KEY</span> is
          not set in this deployment. Generation actions will fail until it is
          configured; reviewing, publishing, or archiving existing rows still
          works.
        </p>
      ) : null}

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold tracking-tight">AI Judge · Performance</h2>
        <form action={judgeAction} className="flex max-w-lg flex-col gap-2">
          <ActionMessage state={judgeState} />
          <input
            name="performanceId"
            placeholder="performance id"
            required
            className="h-10 rounded-xl border border-foreground/15 px-3 font-mono text-xs"
          />
          <SubmitButton className="h-10 w-fit px-4 text-sm">
            Generate judge critique
          </SubmitButton>
        </form>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold tracking-tight">AI Host · Stage</h2>
        <form action={hostStageAction} className="flex max-w-lg flex-col gap-2">
          <ActionMessage state={hostStageState} />
          <input
            name="stageId"
            placeholder="stage id"
            required
            className="h-10 rounded-xl border border-foreground/15 px-3 font-mono text-xs"
          />
          <SubmitButton className="h-10 w-fit px-4 text-sm">
            Generate host copy
          </SubmitButton>
        </form>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold tracking-tight">
          AI Host · Stage result package
        </h2>
        <form action={hostSrAction} className="flex max-w-lg flex-col gap-2">
          <ActionMessage state={hostSrState} />
          <input
            name="stageResultId"
            placeholder="stage result id"
            required
            className="h-10 rounded-xl border border-foreground/15 px-3 font-mono text-xs"
          />
          <SubmitButton className="h-10 w-fit px-4 text-sm">
            Generate host framing
          </SubmitButton>
        </form>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold tracking-tight">
          AI Producer · Editorial placement
        </h2>
        <form action={prodAction} className="flex max-w-lg flex-col gap-2">
          <ActionMessage state={prodState} />
          <input
            name="editorialPlacementId"
            placeholder="editorial placement id"
            required
            className="h-10 rounded-xl border border-foreground/15 px-3 font-mono text-xs"
          />
          <SubmitButton className="h-10 w-fit px-4 text-sm">
            Generate producer assist
          </SubmitButton>
        </form>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold tracking-tight">Recent outputs</h2>
        <ActionMessage state={reviewState} />
        <ActionMessage state={pubState} />
        <ActionMessage state={archiveState} />
        {props.recent.length === 0 ? (
          <p className="text-sm text-foreground/65">None yet.</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {props.recent.map((r) => (
              <li
                key={r.id}
                className="rounded-2xl border border-foreground/12 p-4 text-sm"
              >
                <p className="font-mono text-[11px] text-foreground/55">{r.id}</p>
                <p className="mt-1 text-foreground">
                  {r.kind} · {r.targetType} ·{" "}
                  <span className="text-foreground/65">{r.status}</span>
                </p>
                {r.promptVersion ? (
                  <p className="mt-1 text-[11px] text-foreground/45">
                    {r.promptVersion}
                  </p>
                ) : null}
                {r.title?.trim() ? (
                  <p className="mt-2 font-medium text-foreground">{r.title}</p>
                ) : null}
                <p className="mt-2 line-clamp-4 whitespace-pre-wrap text-foreground/75">
                  {r.body}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <form action={reviewAction}>
                    <input type="hidden" name="outputId" value={r.id} />
                    <SubmitButton className="h-9 px-3 text-xs">Review</SubmitButton>
                  </form>
                  <form action={publishAction}>
                    <input type="hidden" name="outputId" value={r.id} />
                    <SubmitButton className="h-9 px-3 text-xs">Publish</SubmitButton>
                  </form>
                  <form action={archiveAction}>
                    <input type="hidden" name="outputId" value={r.id} />
                    <SubmitButton className="h-9 px-3 text-xs">Archive</SubmitButton>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function ActionMessage(props: { state: AiActionState | undefined }) {
  const s = props.state;
  if (!s) {
    return null;
  }
  if (s.error) {
    return (
      <p className="text-sm text-red-600 dark:text-red-400">{s.error}</p>
    );
  }
  if (s.ok) {
    return (
      <p className="text-sm text-emerald-700 dark:text-emerald-400">
        {s.detail ?? "OK"}
      </p>
    );
  }
  return null;
}
