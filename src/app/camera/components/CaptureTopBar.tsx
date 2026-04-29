"use client";

type CaptureTopBarProps = {
  onBack: () => void;
  onExit: () => void;
  isRecording?: boolean;
};

export function CaptureTopBar({ onBack, onExit, isRecording = false }: CaptureTopBarProps) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-40 px-5 pt-[calc(env(safe-area-inset-top)+16px)]">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          disabled={isRecording}
          className="pointer-events-auto h-10 min-w-14 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-white/82 drop-shadow-md transition active:scale-95 disabled:opacity-40"
        >
          Back
        </button>

        <div className="rounded-full border border-white/10 bg-white/8 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/72 shadow-[0_10px_34px_rgba(0,0,0,0.18)] backdrop-blur-md">
          BETALENT
        </div>

        <button
          type="button"
          onClick={onExit}
          disabled={isRecording}
          className="pointer-events-auto h-10 min-w-14 text-right text-[11px] font-semibold uppercase tracking-[0.14em] text-white/82 drop-shadow-md transition active:scale-95 disabled:opacity-40"
        >
          Exit
        </button>
      </div>
    </div>
  );
}
