"use client";

export type CaptureDuration = 30 | 60 | 120;

type CaptureBottomControlsProps = {
  durationSeconds: CaptureDuration;
  onDurationChange: (duration: CaptureDuration) => void;
  onRecord: () => void;
  onStop: () => void;
  onLibrary: () => void;
  onFlip: () => void;
  isRecording: boolean;
  remainingSeconds: number;
  progressPercent: number;
  disabled?: boolean;
};

const DURATION_OPTIONS: CaptureDuration[] = [30, 60, 120];

function formatRemaining(seconds: number) {
  return `0:${seconds.toString().padStart(2, "0")}`;
}

export function CaptureBottomControls({
  durationSeconds,
  onDurationChange,
  onRecord,
  onStop,
  onLibrary,
  onFlip,
  isRecording,
  remainingSeconds,
  progressPercent,
  disabled = false,
}: CaptureBottomControlsProps) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 px-5 pb-[calc(env(safe-area-inset-bottom)+18px)]">
      <div className="mb-5 flex justify-center">
        <div className="pointer-events-auto flex rounded-full border border-white/10 bg-black/28 p-1 shadow-[0_16px_50px_rgba(0,0,0,0.32)] backdrop-blur-xl">
          {DURATION_OPTIONS.map((duration) => {
            const selected = durationSeconds === duration;

            return (
              <button
                key={duration}
                type="button"
                onClick={() => onDurationChange(duration)}
                disabled={isRecording || disabled}
                className={`h-8 rounded-full px-3 text-[11px] font-semibold transition ${
                  selected
                    ? "bg-white text-black shadow-[0_8px_20px_rgba(255,255,255,0.18)]"
                    : "text-white/62 active:bg-white/10"
                } disabled:cursor-not-allowed disabled:opacity-50`}
              >
                {duration}s
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center">
        <div className="flex justify-start">
          <button
            type="button"
            onClick={onLibrary}
            disabled={isRecording || disabled}
            className="pointer-events-auto flex h-14 w-14 flex-col items-center justify-center rounded-2xl border border-white/10 bg-black/30 text-[10px] font-semibold uppercase tracking-[0.08em] text-white/72 backdrop-blur-xl transition active:scale-95 disabled:opacity-40"
          >
            <span className="mb-1 block h-4 w-5 rounded-[5px] border border-white/40" />
            Library
          </button>
        </div>

        <div className="flex flex-col items-center">
          <button
            type="button"
            onClick={isRecording ? onStop : onRecord}
            disabled={disabled}
            aria-label={isRecording ? "Stop recording" : "Start recording"}
            className="pointer-events-auto relative flex h-[86px] w-[86px] items-center justify-center rounded-full p-[5px] shadow-[0_18px_55px_rgba(0,0,0,0.5)] transition active:scale-95 disabled:opacity-40"
            style={{
              background: isRecording
                ? `conic-gradient(rgb(248 113 113) ${progressPercent * 3.6}deg, rgba(255,255,255,0.24) 0deg)`
                : "rgba(255,255,255,0.86)",
            }}
          >
            <span className="flex h-full w-full items-center justify-center rounded-full bg-black/72 backdrop-blur-xl">
              <span
                className={`bg-[#f78f84] shadow-[0_0_32px_rgba(247,143,132,0.42)] transition-all ${
                  isRecording ? "h-8 w-8 rounded-[10px]" : "h-[58px] w-[58px] rounded-full"
                }`}
              />
            </span>
          </button>

          <div className="mt-3 h-5 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">
            {isRecording ? formatRemaining(remainingSeconds) : "Hold frame"}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onFlip}
            disabled={isRecording || disabled}
            className="pointer-events-auto flex h-14 w-14 flex-col items-center justify-center rounded-2xl border border-white/10 bg-black/30 text-[10px] font-semibold uppercase tracking-[0.08em] text-white/72 backdrop-blur-xl transition active:scale-95 disabled:opacity-40"
          >
            <span className="mb-1 block text-lg leading-none">Flip</span>
            Cam
          </button>
        </div>
      </div>
    </div>
  );
}
