"use client";

import { useMemo, useState } from "react";

type LegalConfirmationScreenProps = {
  durationSeconds: number;
  uploadError?: string | null;
  isUploading?: boolean;
  onBack: () => void;
  onConfirmUpload: () => Promise<void>;
};

const CHECKS = [
  "This is my own performance recording, or I have the necessary rights to upload it.",
  "I am responsible for the music, performance, and content rights in this upload.",
  "I understand BETALENT may remove or restrict content that violates platform rules.",
];

export function LegalConfirmationScreen({
  durationSeconds,
  uploadError,
  isUploading = false,
  onBack,
  onConfirmUpload,
}: LegalConfirmationScreenProps) {
  const [accepted, setAccepted] = useState<boolean[]>(CHECKS.map(() => false));
  const allAccepted = useMemo(() => accepted.every(Boolean), [accepted]);

  const toggle = (index: number) => {
    setAccepted((current) =>
      current.map((value, currentIndex) => (currentIndex === index ? !value : value)),
    );
  };

  return (
    <div className="absolute inset-0 z-50 overflow-hidden bg-black text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(247,143,132,0.18),transparent_34%),linear-gradient(180deg,#050505_0%,#09090b_48%,#000_100%)]" />

      <div className="relative z-10 flex h-full flex-col px-5 pb-[calc(env(safe-area-inset-bottom)+18px)] pt-[calc(env(safe-area-inset-top)+12px)]">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            disabled={isUploading}
            className="h-10 rounded-full border border-white/12 bg-white/[0.06] px-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/82 backdrop-blur-xl transition active:scale-95 disabled:opacity-40"
          >
            Back
          </button>

          <div className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/70 backdrop-blur-xl">
            BETALENT
          </div>

          <div className="h-10 w-[64px]" aria-hidden />
        </div>

        <div className="flex flex-1 flex-col justify-end pb-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/42">
            Legal confirmation
          </p>
          <h2 className="mt-3 max-w-sm text-[2.7rem] font-semibold leading-[0.95] tracking-[-0.08em] text-white">
            Confirm your rights.
          </h2>
          <p className="mt-4 max-w-sm text-sm leading-6 text-white/58">
            Your take is ready. Confirm ownership before BETALENT sends this {durationSeconds}s
            creator video to processing.
          </p>

          {uploadError ? (
            <div className="mt-5 rounded-3xl border border-red-400/22 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-100 backdrop-blur-xl">
              {uploadError}
            </div>
          ) : null}

          <div className="mt-6 space-y-3">
            {CHECKS.map((label, index) => (
              <label
                key={label}
                className="flex cursor-pointer items-start gap-3 rounded-3xl border border-white/10 bg-white/[0.055] px-4 py-4 backdrop-blur-xl transition active:scale-[0.99]"
              >
                <input
                  type="checkbox"
                  checked={accepted[index]}
                  onChange={() => toggle(index)}
                  disabled={isUploading}
                  className="mt-1 h-5 w-5 rounded border-white/20 bg-black accent-[#f78f84]"
                />
                <span className="text-sm leading-6 text-white/78">{label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onBack}
            disabled={isUploading}
            className="h-14 rounded-full border border-white/12 bg-white/[0.06] text-sm font-semibold uppercase tracking-[0.12em] text-white/82 backdrop-blur-xl transition active:scale-95 disabled:opacity-40"
          >
            Back
          </button>
          <button
            type="button"
            disabled={!allAccepted || isUploading}
            onClick={() => void onConfirmUpload()}
            className="h-14 rounded-full bg-[#f78f84] text-sm font-semibold uppercase tracking-[0.12em] text-black shadow-[0_18px_50px_rgba(247,143,132,0.28)] transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-45"
          >
            {isUploading ? "Uploading" : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
}
