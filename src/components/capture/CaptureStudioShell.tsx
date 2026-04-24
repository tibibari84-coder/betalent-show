'use client';

import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';

export function CaptureStudioShell(props: {
  title: string;
  eyebrow?: string;
  onClose: () => void;
  stage: ReactNode;
  controls: ReactNode;
  closeLabel?: string;
}) {
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-hidden bg-black text-white">
      <div className="absolute inset-0">{props.stage}</div>
      <div className="pointer-events-none absolute inset-0 capture-studio-vignette" />

      <div className="pointer-events-none relative z-10 flex min-h-dvh flex-col justify-between px-4 pb-[calc(var(--bt-safe-bottom)+1rem)] pt-[calc(var(--bt-safe-top)+0.85rem)]">
        <div className="capture-studio-float flex items-start justify-between gap-4 rounded-[1.45rem] border border-white/10 bg-black/22 px-4 py-3 shadow-[0_18px_52px_-34px_rgba(0,0,0,1)] backdrop-blur-xl">
          <div className="min-w-0">
            {props.eyebrow ? (
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50">{props.eyebrow}</p>
            ) : null}
            <h2 className="mt-1 text-[1.1rem] font-semibold tracking-[-0.04em] text-white">{props.title}</h2>
          </div>
          <button
            type="button"
            onClick={props.onClose}
            className="pointer-events-auto rounded-full border border-white/14 bg-white/[0.06] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-white/84"
          >
            {props.closeLabel || 'Exit'}
          </button>
        </div>

        <div className="pointer-events-auto capture-studio-float-delay">{props.controls}</div>
      </div>
    </div>,
    document.body,
  );
}
