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
        <div className="capture-studio-float flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={props.onClose}
            aria-label={props.closeLabel || 'Exit'}
            className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/16 bg-black/34 text-[1.9rem] font-light leading-none text-white shadow-[0_18px_42px_-30px_rgba(0,0,0,1)] backdrop-blur-xl"
          >
            ‹
          </button>
          <div className="min-w-0 text-center">
            {props.eyebrow ? (
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/54">{props.eyebrow}</p>
            ) : null}
            <h2 className="mt-0.5 text-sm font-semibold tracking-[-0.02em] text-white/90">{props.title}</h2>
          </div>
          <button
            type="button"
            onClick={props.onClose}
            className="pointer-events-auto min-h-11 rounded-full border border-white/16 bg-black/34 px-4 text-[11px] font-semibold uppercase tracking-[0.1em] text-white/86 shadow-[0_18px_42px_-30px_rgba(0,0,0,1)] backdrop-blur-xl"
          >
            {props.closeLabel || 'Exit'}
          </button>
        </div>

        <div className="pointer-events-auto capture-studio-float-delay pb-2">{props.controls}</div>
      </div>
    </div>,
    document.body,
  );
}
