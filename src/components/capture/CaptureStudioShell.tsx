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
    <div className="fixed inset-0 z-[9999] w-screen h-[100dvh] overflow-hidden bg-black text-white">
      <div className="absolute inset-0 z-0">{props.stage}</div>
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-32 bg-gradient-to-b from-black/50 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-64 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

      <div className="absolute inset-x-4 top-[calc(env(safe-area-inset-top,0px)+1rem)] z-20 flex items-start justify-between">
        <button
          type="button"
          onClick={props.onClose}
          aria-label={props.closeLabel || 'Exit camera'}
          className="rounded-full bg-black/40 p-3 text-white backdrop-blur-md"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
        <div className="pointer-events-none pt-1 text-center drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
          {props.eyebrow ? (
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60">{props.eyebrow}</p>
          ) : null}
          <h2 className="mt-0.5 text-sm font-semibold text-white">{props.title}</h2>
        </div>
        <div className="h-11 w-11" aria-hidden />
      </div>

      <div className="absolute inset-x-0 bottom-[calc(env(safe-area-inset-bottom,0px)+1.5rem)] z-20 flex flex-col items-center justify-end gap-6 px-6">
        {props.controls}
      </div>
    </div>,
    document.body,
  );
}
