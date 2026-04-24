'use client';

import type { ReactNode } from 'react';

export function CaptureStudioShell(props: {
  eyebrow: string;
  title: string;
  subtitle: string;
  onClose: () => void;
  stage: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[120] bg-black text-white">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/42 via-transparent to-black/78" />

      <div className="relative flex min-h-screen flex-col px-4 pb-[calc(var(--bt-safe-bottom)+1rem)] pt-[calc(var(--bt-safe-top)+0.9rem)]">
        <div className="capture-studio-float flex items-center justify-between rounded-[1.15rem] border border-white/10 bg-black/34 px-4 py-3 backdrop-blur-xl">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/48">{props.eyebrow}</p>
            <p className="mt-1 text-[15px] font-semibold tracking-[-0.03em] text-white">{props.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-white/60">{props.subtitle}</p>
          </div>
          <button
            type="button"
            onClick={props.onClose}
            className="rounded-full border border-white/14 bg-white/[0.06] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-white/84"
          >
            Exit
          </button>
        </div>

        <div className="flex flex-1 items-center justify-center py-5">
          {props.stage}
        </div>

        <div className="capture-studio-float-delay">
          {props.footer}
        </div>
      </div>
    </div>
  );
}
