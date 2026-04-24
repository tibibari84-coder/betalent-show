'use client';

import { UPLOAD_RIGHTS_CONFIRMATIONS, UPLOAD_RIGHTS_HELPER_COPY } from '@/lib/copy/disclaimers';

type LegalCheckKey = 'performance' | 'rights' | 'platform';

export function LegalConfirmationStep(props: {
  checks: Record<LegalCheckKey, boolean>;
  disabled?: boolean;
  isSubmitting?: boolean;
  onBack: () => void;
  onSubmit: () => void;
  onToggle: (key: LegalCheckKey, checked: boolean) => void;
}) {
  const isComplete = props.checks.performance && props.checks.rights && props.checks.platform;

  return (
    <div className="space-y-4 rounded-[1.35rem] border border-white/10 bg-black/42 p-4 backdrop-blur-xl">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/48">Legal confirmation</p>
        <h3 className="mt-2 text-[1rem] font-semibold tracking-[-0.03em] text-white">Confirm rights before upload</h3>
        <p className="mt-1 text-sm leading-relaxed text-white/62">
          Short, serious, and required before this take enters BETALENT processing.
        </p>
      </div>

      <div className="space-y-3">
        <label className="flex items-start gap-3 rounded-[1rem] border border-white/10 bg-white/[0.04] px-4 py-3">
          <input
            type="checkbox"
            checked={props.checks.performance}
            disabled={props.disabled}
            onChange={(event) => props.onToggle('performance', event.target.checked)}
            className="mt-1 h-4 w-4 rounded border border-white/20 bg-transparent disabled:opacity-50"
          />
          <span className="text-sm leading-relaxed text-white/78">{UPLOAD_RIGHTS_CONFIRMATIONS.performance}</span>
        </label>

        <label className="flex items-start gap-3 rounded-[1rem] border border-white/10 bg-white/[0.04] px-4 py-3">
          <input
            type="checkbox"
            checked={props.checks.rights}
            disabled={props.disabled}
            onChange={(event) => props.onToggle('rights', event.target.checked)}
            className="mt-1 h-4 w-4 rounded border border-white/20 bg-transparent disabled:opacity-50"
          />
          <span className="text-sm leading-relaxed text-white/78">{UPLOAD_RIGHTS_CONFIRMATIONS.rights}</span>
        </label>

        <label className="flex items-start gap-3 rounded-[1rem] border border-white/10 bg-white/[0.04] px-4 py-3">
          <input
            type="checkbox"
            checked={props.checks.platform}
            disabled={props.disabled}
            onChange={(event) => props.onToggle('platform', event.target.checked)}
            className="mt-1 h-4 w-4 rounded border border-white/20 bg-transparent disabled:opacity-50"
          />
          <span className="text-sm leading-relaxed text-white/78">{UPLOAD_RIGHTS_CONFIRMATIONS.platform}</span>
        </label>
      </div>

      <div className="rounded-[1rem] border border-amber-300/20 bg-amber-300/[0.08] px-4 py-3 text-sm leading-relaxed text-amber-100/82">
        {UPLOAD_RIGHTS_HELPER_COPY}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={props.onBack}
          disabled={props.disabled}
          className="rounded-full border border-white/14 bg-white/[0.05] px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white/80 disabled:cursor-not-allowed disabled:opacity-55"
        >
          Back to review
        </button>
        <button
          type="button"
          onClick={props.onSubmit}
          disabled={props.disabled || !isComplete}
          className="foundation-primary-button min-h-[2.9rem] rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-[0.08em] disabled:cursor-not-allowed disabled:opacity-55"
        >
          {props.isSubmitting ? 'Uploading…' : 'Upload to BETALENT'}
        </button>
      </div>
    </div>
  );
}
