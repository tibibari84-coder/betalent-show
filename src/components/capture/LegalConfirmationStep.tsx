"use client";

import { useMemo, useState } from "react";

type LegalConfirmationStepProps = {
  durationSeconds: number;
  uploadError?: string | null;
  isUploading?: boolean;
  onBack: () => void;
  onConfirmUpload: () => Promise<void>;
};

const CHECKS = [
  "I confirm this is my own performance recording or I have the necessary rights to upload it.",
  "I confirm I am responsible for the music/content rights in this upload.",
  "I understand BETALENT may remove or restrict content that violates rights or platform rules.",
];

export function LegalConfirmationStep({
  durationSeconds,
  uploadError,
  isUploading = false,
  onBack,
  onConfirmUpload,
}: LegalConfirmationStepProps) {
  const [accepted, setAccepted] = useState<boolean[]>([false, false, false]);
  const allAccepted = useMemo(() => accepted.every(Boolean), [accepted]);

  const toggle = (index: number) => {
    setAccepted((prev) => prev.map((value, currentIndex) => (currentIndex === index ? !value : value)));
  };

  return (
    <div className="absolute inset-0 overflow-y-auto bg-black px-4 pb-[calc(env(safe-area-inset-bottom,0px)+18px)] pt-[calc(env(safe-area-inset-top,0px)+18px)] text-white">
      <div className="mx-auto max-w-xl">
        <div className="rounded-[32px] border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.32em] text-white/55">BETALENT</p>
              <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white">Confirm</h1>
            </div>

            <button
              type="button"
              onClick={onBack}
              className="h-14 rounded-full border border-white/12 bg-white/[0.04] px-6 text-lg font-semibold text-white transition hover:bg-white/[0.08]"
            >
              Back
            </button>
          </div>
        </div>

        <div className="mt-5 rounded-[34px] border border-white/10 bg-black/55 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.32em] text-white/55">
                Legal confirmation
              </p>
              <h2 className="mt-2 text-4xl font-semibold leading-tight tracking-tight text-white">
                Confirm before upload
              </h2>
            </div>
            <p className="max-w-[120px] text-right text-sm text-white/55">
              Recorded take · {durationSeconds}s max
            </p>
          </div>

          {uploadError && (
            <div className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-base text-red-100">
              {uploadError}
            </div>
          )}

          <div className="mt-5 space-y-3">
            {CHECKS.map((label, index) => (
              <label
                key={label}
                className="flex cursor-pointer items-start gap-4 rounded-[28px] border border-white/10 bg-white/[0.03] px-4 py-4"
              >
                <input
                  type="checkbox"
                  checked={accepted[index]}
                  onChange={() => toggle(index)}
                  className="mt-1 h-6 w-6 rounded border-white/20 accent-sky-500"
                />
                <span className="text-lg leading-9 text-white/86">{label}</span>
              </label>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onBack}
              className="h-16 rounded-full border border-white/12 bg-white/[0.05] text-xl font-semibold text-white transition hover:bg-white/[0.08]"
            >
              Back
            </button>
            <button
              type="button"
              disabled={!allAccepted || isUploading}
              onClick={onConfirmUpload}
              className="h-16 rounded-full bg-[#f78f84] text-xl font-semibold text-white shadow-[0_14px_34px_rgba(247,143,132,0.28)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-45"
            >
              {isUploading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
