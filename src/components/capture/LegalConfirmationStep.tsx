'use client';

import { UPLOAD_RIGHTS_CONFIRMATIONS } from '@/lib/copy/disclaimers';

export type LegalCheckKey = 'performance' | 'rights' | 'platform';

export function LegalConfirmationStep(props: {
  checks: Record<LegalCheckKey, boolean>;
  disabled?: boolean;
  isSubmitting?: boolean;
  error?: string | null;
  sourceLabel: string;
  durationLabel: string;
  onBack: () => void;
  onSubmit: () => void;
  onToggle: (key: LegalCheckKey, checked: boolean) => void;
}) {
  const isComplete = props.checks.performance && props.checks.rights && props.checks.platform;

  return (
    <div className="space-y-4 rounded-[1.45rem] border border-white/10 bg-black/48 p-4 shadow-[0_-24px_60px_-36px_rgba(0,0,0,1)] backdrop-blur-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/48">Legal confirmation</p>
          <h3 className="mt-1 text-[1.1rem] font-semibold tracking-[-0.04em] text-white">Confirm before upload</h3>
        </div>
        <p className="text-right text-xs leading-relaxed text-white/54">
          {props.sourceLabel} · {props.durationLabel}
        </p>
      </div>

      {props.error ? (
        <p className="rounded-[1rem] border border-red-400/20 bg-red-500/[0.08] px-3 py-2 text-sm text-red-100">{props.error}</p>
      ) : null}

      <div className="space-y-2">
        {(['performance', 'rights', 'platform'] as const).map((key) => (
          <label key={key} className="flex items-start gap-3 rounded-[1rem] border border-white/10 bg-white/[0.04] px-3 py-3">
            <input
              type="checkbox"
              checked={props.checks[key]}
              disabled={props.disabled}
              onChange={(event) => props.onToggle(key, event.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-white/20 bg-transparent disabled:opacity-50"
            />
            <span className="text-sm leading-relaxed text-white/80">{UPLOAD_RIGHTS_CONFIRMATIONS[key]}</span>
          </label>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={props.onBack}
          disabled={props.disabled}
          className="min-h-12 rounded-full border border-white/14 bg-white/[0.06] px-4 text-xs font-semibold uppercase tracking-[0.08em] text-white/82 disabled:cursor-not-allowed disabled:opacity-55"
        >
          Back
        </button>
        <button
          type="button"
          onClick={props.onSubmit}
          disabled={props.disabled || !isComplete}
          className="foundation-primary-button min-h-12 px-4 text-xs font-semibold uppercase tracking-[0.08em] disabled:cursor-not-allowed disabled:opacity-55"
        >
          {props.isSubmitting ? 'Uploading' : 'Upload'}
        </button>
      </div>
    </div>
  );
}
