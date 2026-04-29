"use client";

export type CaptureDuration = 30 | 60 | 120;

type CaptureBottomControlsProps = {
  durationSeconds: CaptureDuration;
  onDurationChange: (duration: CaptureDuration) => void;
  onRecord: () => void;
  onStop: () => void;
  onLibrary: () => void;
  isRecording: boolean;
  remainingSeconds: number;
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
  isRecording,
  remainingSeconds,
  disabled = false,
}: CaptureBottomControlsProps) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40 px-6 pb-[calc(env(safe-area-inset-bottom)+24px)]">
      <div className="mb-6 flex justify-center">
        <div className="pointer-events-auto flex rounded-full border border-white/10 bg-white/10 p-1 shadow-[0_16px_50px_rgba(0,0,0,0.26)] backdrop-blur-md">
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
                    ? "bg-white/90 text-black shadow-[0_8px_20px_rgba(255,255,255,0.16)]"
                    : "text-white/68 active:bg-white/10"
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
            aria-label="Open gallery"
            className="pointer-events-auto h-14 w-14 rounded-[1.05rem] border border-white/55 bg-white/10 shadow-[0_12px_34px_rgba(0,0,0,0.28)] backdrop-blur-sm transition active:scale-95 disabled:opacity-40"
          >
            <span className="mx-auto block h-full w-full rounded-[0.92rem] bg-[radial-gradient(circle_at_35%_30%,rgba(255,255,255,0.92),rgba(255,255,255,0.16)_34%,rgba(247,143,132,0.46)_66%,rgba(0,0,0,0.35)_100%)]" />
          </button>
        </div>

        <div className="flex flex-col items-center">
          <button
            type="button"
            onClick={isRecording ? onStop : onRecord}
            disabled={disabled}
            aria-label={isRecording ? "Stop recording" : "Start recording"}
            className={`pointer-events-auto flex h-20 w-20 items-center justify-center rounded-full border-[4px] shadow-[0_18px_55px_rgba(0,0,0,0.42)] transition active:scale-95 disabled:opacity-40 ${
              isRecording ? "border-red-400" : "border-white"
            }`}
          >
            <span
              className={`transition-all ${
                isRecording
                  ? "h-10 w-10 rounded-[0.8rem] bg-red-500"
                  : "h-[58px] w-[58px] rounded-full bg-white"
              }`}
            />
          </button>

          <div className="mt-4 h-5 text-center text-[11px] font-semibold tracking-[0.18em] text-white drop-shadow-md">
            {isRecording ? formatRemaining(remainingSeconds) : ""}
          </div>
        </div>

        <div className="flex justify-end">
          <div className="h-14 w-14" aria-hidden />
        </div>
      </div>
    </div>
  );
}
