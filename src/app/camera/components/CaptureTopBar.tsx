"use client";

type CaptureTopBarProps = {
  onBack: () => void;
  isRecording?: boolean;
};

export function CaptureTopBar({ onBack, isRecording = false }: CaptureTopBarProps) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-40 px-5 pt-[calc(env(safe-area-inset-top)+16px)]">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          disabled={isRecording}
          aria-label="Close camera"
          className="pointer-events-auto flex h-10 w-10 items-center justify-center text-3xl font-extralight leading-none text-white drop-shadow-md transition active:scale-95 disabled:opacity-40"
        >
          ×
        </button>

        <button
          type="button"
          disabled={isRecording}
          className="pointer-events-auto rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-medium text-white/88 shadow-[0_10px_34px_rgba(0,0,0,0.24)] backdrop-blur-md transition active:scale-95 disabled:opacity-40"
        >
          ♫ Add sound
        </button>

        <button
          type="button"
          disabled={isRecording}
          aria-label="Camera settings"
          className="pointer-events-auto flex h-10 w-10 items-center justify-center text-white drop-shadow-md transition active:scale-95 disabled:opacity-40"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden>
            <path
              d="M12 8.25a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5Z"
              stroke="currentColor"
              strokeWidth="1.7"
            />
            <path
              d="M19.4 13.5a7.83 7.83 0 0 0 .06-1.5l2-1.55-2-3.46-2.48 1a8 8 0 0 0-1.3-.76L15.3 4.6h-4l-.38 2.63a8 8 0 0 0-1.3.76l-2.48-1-2 3.46L7.14 12a7.83 7.83 0 0 0 .06 1.5l-2.06 1.6 2 3.46 2.55-1.03c.4.3.83.55 1.28.75l.39 2.72h4l.39-2.72c.45-.2.88-.45 1.28-.75l2.55 1.03 2-3.46-2.18-1.6Z"
              stroke="currentColor"
              strokeWidth="1.35"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
