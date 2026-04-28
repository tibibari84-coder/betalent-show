"use client";

type CaptureTopBarProps = {
  onBack: () => void;
  onExit: () => void;
  isRecording?: boolean;
};

export function CaptureTopBar({ onBack, onExit, isRecording = false }: CaptureTopBarProps) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-30 px-4 pt-[calc(env(safe-area-inset-top)+12px)]">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          disabled={isRecording}
          aria-label="Close camera"
          className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-black/28 text-xl font-light text-white backdrop-blur-xl transition active:scale-95 disabled:opacity-40"
        >
          x
        </button>

        <div className="rounded-full border border-white/10 bg-black/22 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/78 backdrop-blur-xl">
          BETALENT
        </div>

        <button
          type="button"
          onClick={onExit}
          disabled={isRecording}
          className="pointer-events-auto h-10 rounded-full border border-white/12 bg-black/28 px-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/82 backdrop-blur-xl transition active:scale-95 disabled:opacity-40"
        >
          Exit
        </button>
      </div>
    </div>
  );
}
