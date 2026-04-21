"use client";

import { useActionState } from "react";

import { SubmitButton } from "@/components/auth/SubmitButton";
import type { ShowSetupActionState } from "@/server/setup/show-setup-actions";
import {
  createAuditionWindowSetupAction,
  createEpisodeSetupAction,
  createSeasonSetupAction,
  createStageSetupAction,
} from "@/server/setup/show-setup-actions";

const initial: ShowSetupActionState | undefined = undefined;

function fieldClass() {
  return "h-10 w-full rounded-xl border border-foreground/15 bg-transparent px-3 text-sm outline-none focus:border-foreground/40";
}

function labelClass() {
  return "text-xs font-medium uppercase tracking-wide text-foreground/60";
}

function ActionNote(props: { state: ShowSetupActionState | undefined }) {
  const s = props.state;
  if (!s) return null;
  if (s.error) {
    return (
      <p className="text-sm text-red-600 dark:text-red-400" role="alert">
        {s.error}
      </p>
    );
  }
  if (s.ok && s.detail) {
    return (
      <p className="text-sm text-emerald-700 dark:text-emerald-400">{s.detail}</p>
    );
  }
  return null;
}

export function InternalShowSetupForms(props: {
  seasons: { id: string; slug: string; title: string; status: string }[];
  stages: {
    id: string;
    seasonId: string;
    slug: string;
    title: string;
    season: { title: string; slug: string };
  }[];
  defaultOpensLocal: string;
  defaultClosesLocal: string;
}) {
  const [seasonState, seasonAction] = useActionState(
    createSeasonSetupAction,
    initial,
  );
  const [stageState, stageAction] = useActionState(
    createStageSetupAction,
    initial,
  );
  const [windowState, windowAction] = useActionState(
    createAuditionWindowSetupAction,
    initial,
  );
  const [episodeState, episodeAction] = useActionState(
    createEpisodeSetupAction,
    initial,
  );

  return (
    <div className="flex flex-col gap-10">
      <section className="rounded-2xl border border-foreground/12 bg-foreground/[0.02] p-4">
        <h2 className="text-sm font-semibold tracking-tight">
          1. Create Season
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-foreground/65">
          BETALENT is asynchronous on-demand viewing — not live streaming. For a
          season the member app should treat as <strong>current</strong>, pick
          status{" "}
          <code className="rounded bg-foreground/5 px-1 font-mono text-[11px]">
            LIVE
          </code>{" "}
          (schema label only). Optional dates help{" "}
          <code className="rounded bg-foreground/5 px-1 font-mono text-[11px]">
            getCurrentSeason
          </code>
          .
        </p>
        <form action={seasonAction} className="mt-4 flex flex-col gap-3">
          <ActionNote state={seasonState} />
          <div className="flex flex-col gap-1">
            <label className={labelClass()}>slug</label>
            <input name="slug" className={fieldClass()} placeholder="season-1" />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass()}>title</label>
            <input name="title" required className={fieldClass()} />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass()}>description (optional)</label>
            <textarea
              name="description"
              rows={2}
              className="w-full resize-y rounded-xl border border-foreground/15 bg-transparent px-3 py-2 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass()}>status</label>
            <select name="status" required className={fieldClass()} defaultValue="LIVE">
              <option value="DRAFT">DRAFT</option>
              <option value="UPCOMING">UPCOMING</option>
              <option value="LIVE">
                LIVE — current / active season (stored as LIVE in schema;
                not broadcast)
              </option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="ARCHIVED">ARCHIVED</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass()}>startAt (optional)</label>
            <input
              name="startAt"
              type="datetime-local"
              className={fieldClass()}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass()}>endAt (optional)</label>
            <input name="endAt" type="datetime-local" className={fieldClass()} />
          </div>
          <SubmitButton className="h-10 w-fit px-4 text-sm">
            Create season
          </SubmitButton>
        </form>
      </section>

      <section className="rounded-2xl border border-foreground/12 bg-foreground/[0.02] p-4">
        <h2 className="text-sm font-semibold tracking-tight">
          2. Create Stage (under a season)
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-foreground/65">
          Pick the season this stage belongs to.{" "}
          <code className="rounded bg-foreground/5 px-1 font-mono text-[11px]">
            OPEN
          </code>{" "}
          means the competition phase is open per rules below; it is not a
          “live channel” state.
        </p>
        <form action={stageAction} className="mt-4 flex flex-col gap-3">
          <ActionNote state={stageState} />
          <div className="flex flex-col gap-1">
            <label className={labelClass()}>season</label>
            <select name="seasonId" required className={fieldClass()}>
              <option value="">— choose —</option>
              {props.seasons.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title} ({s.slug}) · {s.status}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass()}>slug</label>
            <input name="slug" className={fieldClass()} placeholder="audition-1" />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass()}>title</label>
            <input name="title" required className={fieldClass()} />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass()}>description (optional)</label>
            <textarea
              name="description"
              rows={2}
              className="w-full resize-y rounded-xl border border-foreground/15 bg-transparent px-3 py-2 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass()}>orderIndex</label>
            <input
              name="orderIndex"
              type="number"
              defaultValue={0}
              className={fieldClass()}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass()}>stageType</label>
            <select name="stageType" required className={fieldClass()} defaultValue="AUDITION">
              <option value="AUDITION">AUDITION</option>
              <option value="CALLBACK">CALLBACK</option>
              <option value="SEMIFINAL">SEMIFINAL</option>
              <option value="FINAL">FINAL</option>
              <option value="SPECIAL">SPECIAL</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass()}>status</label>
            <select name="status" required className={fieldClass()} defaultValue="OPEN">
              <option value="DRAFT">DRAFT</option>
              <option value="UPCOMING">UPCOMING</option>
              <option value="OPEN">
                OPEN — current competition phase (submissions context per schedule)
              </option>
              <option value="JUDGING">JUDGING</option>
              <option value="VOTING">VOTING</option>
              <option value="RESULTS">RESULTS</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="ARCHIVED">ARCHIVED</option>
            </select>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label className={labelClass()}>submissionsOpenAt</label>
              <input
                name="submissionsOpenAt"
                type="datetime-local"
                className={fieldClass()}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass()}>submissionsCloseAt</label>
              <input
                name="submissionsCloseAt"
                type="datetime-local"
                className={fieldClass()}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass()}>judgingOpenAt</label>
              <input
                name="judgingOpenAt"
                type="datetime-local"
                className={fieldClass()}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass()}>judgingCloseAt</label>
              <input
                name="judgingCloseAt"
                type="datetime-local"
                className={fieldClass()}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass()}>votingOpenAt</label>
              <input
                name="votingOpenAt"
                type="datetime-local"
                className={fieldClass()}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass()}>votingCloseAt</label>
              <input
                name="votingCloseAt"
                type="datetime-local"
                className={fieldClass()}
              />
            </div>
            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className={labelClass()}>resultsAt</label>
              <input
                name="resultsAt"
                type="datetime-local"
                className={fieldClass()}
              />
            </div>
          </div>
          <SubmitButton className="h-10 w-fit px-4 text-sm">
            Create stage
          </SubmitButton>
        </form>
      </section>

      <section className="rounded-2xl border border-foreground/12 bg-foreground/[0.02] p-4">
        <h2 className="text-sm font-semibold tracking-tight">
          3. Create AuditionWindow
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-foreground/65">
          Official formal entry window — aligned with BETALENT{" "}
          <strong>Originals Only</strong> member copy. For members to see an open
          window, use status{" "}
          <code className="rounded bg-foreground/5 px-1 font-mono text-[11px]">
            OPEN
          </code>{" "}
          and set{" "}
          <code className="rounded bg-foreground/5 px-1 font-mono text-[11px]">
            opensAt
          </code>
          /
          <code className="rounded bg-foreground/5 px-1 font-mono text-[11px]">
            closesAt
          </code>{" "}
          so “now” is inside the range (
          <code className="rounded bg-foreground/5 px-1 font-mono text-[11px]">
            getPrimaryOpenAuditionWindow
          </code>
          ). If both season and stage are set, the stage must belong to that
          season.
        </p>
        <form action={windowAction} className="mt-4 flex flex-col gap-3">
          <ActionNote state={windowState} />
          <div className="flex flex-col gap-1">
            <label className={labelClass()}>season (optional but recommended)</label>
            <select name="seasonId" className={fieldClass()}>
              <option value="">— none —</option>
              {props.seasons.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title} ({s.slug}) · {s.status}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass()}>stage (optional)</label>
            <select name="stageId" className={fieldClass()}>
              <option value="">— none —</option>
              {props.stages.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.season.title} · {st.title} ({st.slug})
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass()}>slug</label>
            <input name="slug" className={fieldClass()} placeholder="s1-audition-window" />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass()}>title</label>
            <input name="title" required className={fieldClass()} />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass()}>description (optional)</label>
            <textarea
              name="description"
              rows={2}
              className="w-full resize-y rounded-xl border border-foreground/15 bg-transparent px-3 py-2 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass()}>status</label>
            <select name="status" required className={fieldClass()} defaultValue="OPEN">
              <option value="DRAFT">DRAFT</option>
              <option value="UPCOMING">UPCOMING</option>
              <option value="OPEN">
                OPEN — formal submission window open (schedule must include now)
              </option>
              <option value="CLOSED">CLOSED</option>
              <option value="REVIEW">REVIEW</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="ARCHIVED">ARCHIVED</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass()}>opensAt (required)</label>
            <input
              name="opensAt"
              type="datetime-local"
              required
              defaultValue={props.defaultOpensLocal}
              className={fieldClass()}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass()}>closesAt (required)</label>
            <input
              name="closesAt"
              type="datetime-local"
              required
              defaultValue={props.defaultClosesLocal}
              className={fieldClass()}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label className={labelClass()}>reviewStartsAt</label>
              <input
                name="reviewStartsAt"
                type="datetime-local"
                className={fieldClass()}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass()}>reviewEndsAt</label>
              <input
                name="reviewEndsAt"
                type="datetime-local"
                className={fieldClass()}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass()}>maxSubmissionsPerUser</label>
            <input
              name="maxSubmissionsPerUser"
              type="number"
              min={1}
              className={fieldClass()}
              placeholder="optional"
            />
          </div>
          <SubmitButton className="h-10 w-fit px-4 text-sm">
            Create audition window
          </SubmitButton>
        </form>
      </section>

      <section className="rounded-2xl border border-foreground/12 bg-foreground/[0.02] p-4">
        <h2 className="text-sm font-semibold tracking-tight">
          4. Create Episode (optional bootstrap)
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-foreground/65">
          Low-risk catalog row for season/stage context. Does not replace media
          pipeline.{" "}
          <code className="rounded bg-foreground/5 px-1 font-mono text-[11px]">
            PUBLISHED
          </code>{" "}
          +{" "}
          <code className="rounded bg-foreground/5 px-1 font-mono text-[11px]">
            publishedAt
          </code>{" "}
          helps show-state pick a current episode when configured.
        </p>
        <form action={episodeAction} className="mt-4 flex flex-col gap-3">
          <ActionNote state={episodeState} />
          <div className="flex flex-col gap-1">
            <label className={labelClass()}>season</label>
            <select name="seasonId" required className={fieldClass()}>
              <option value="">— choose —</option>
              {props.seasons.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title} ({s.slug}) · {s.status}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass()}>stage (optional)</label>
            <select name="stageId" className={fieldClass()}>
              <option value="">— none —</option>
              {props.stages.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.season.title} · {st.title} ({st.slug})
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass()}>slug</label>
            <input name="slug" className={fieldClass()} placeholder="ep-01" />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass()}>title</label>
            <input name="title" required className={fieldClass()} />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass()}>description (optional)</label>
            <textarea
              name="description"
              rows={2}
              className="w-full resize-y rounded-xl border border-foreground/15 bg-transparent px-3 py-2 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass()}>orderIndex</label>
            <input
              name="orderIndex"
              type="number"
              defaultValue={0}
              className={fieldClass()}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass()}>status</label>
            <select name="status" required className={fieldClass()} defaultValue="DRAFT">
              <option value="DRAFT">DRAFT</option>
              <option value="SCHEDULED">SCHEDULED</option>
              <option value="PUBLISHED">PUBLISHED</option>
              <option value="ARCHIVED">ARCHIVED</option>
            </select>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label className={labelClass()}>premiereAt</label>
              <input
                name="premiereAt"
                type="datetime-local"
                className={fieldClass()}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass()}>publishedAt</label>
              <input
                name="publishedAt"
                type="datetime-local"
                className={fieldClass()}
              />
            </div>
          </div>
          <SubmitButton className="h-10 w-fit px-4 text-sm">
            Create episode
          </SubmitButton>
        </form>
      </section>
    </div>
  );
}
