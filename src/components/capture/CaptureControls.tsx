"use client";

const DURATIONS = [30, 60, 120] as const;

type CaptureControlsProps = {
  durationSeconds: number;
  onDurationChange: (seconds: 30 | 60 | 120) => void;
  onRecord: () => void;
  onStop: () => void;
  onLibrary: () => void;
  onFlip: () => void;
  isRecording: boolean;
  remainingSeconds: number;
  progressPercent: number;
};

export function CaptureControls({
  durationSeconds,
  onDurationChange,
  onRecord,
  onStop,
  onLibrary,
  onFlip,
  isRecording,
  remainingSeconds,
  progressPercent,
}: CaptureControlsProps) {
  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="rounded-[34px] border border-white/10 bg-black/55 px-4 pb-5 pt-4 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
        <div className="mx-auto flex w-fit items-center rounded-full border border-white/12 bg-white/[0.06] p-1">
          {DURATIONS.map((seconds) => {
            const selected = durationSeconds === seconds;
            return (
              <button
                key={seconds}
                type="button"
                onClick={() => onDurationChange(seconds)}
                className={[
                  "h-12 min-w-[92px] rounded-full px-5 text-xl font-semibold tracking-tight transition",
                  selected
                    ? "bg-white text-black shadow-[0_10px_30px_rgba(255,255,255,0.18)]"
                    : "text-white/72 hover:text-white",
                ].join(" ")}
              >
                {seconds}s
              </button>
            );
          })}
        </div>

        <div className="mt-5 text-center">
          <div className="text-[54px] font-semibold leading-none tracking-tight text-white">
            {isRecording ? `${remainingSeconds}s` : `${durationSeconds}s`}
          </div>
          <p className="mt-2 text-sm text-white/55">
            {isRecording
              ? "Recording in progress"
              : "Nothing uploads until review and confirmation"}
          </p>
        </div>

        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-rose-500 via-orange-300 to-white transition-[width]"
            style={{ width: `${isRecording ? progressPercent : 0}%` }}
          />
        </div>

        <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          <button
            type="button"
            onClick={onLibrary}
            className="h-16 rounded-full border border-white/12 bg-white/[0.05] px-5 text-xl font-medium text-white/90 transition hover:bg-white/[0.09]"
          >
            Library
          </button>

          <button
            type="button"
            onClick={isRecording ? onStop : onRecord}
            className="relative flex h-28 w-28 items-center justify-center rounded-full border-[8px] border-white/85 bg-transparent transition active:scale-[0.98]"
          >
            <span className="absolute inset-[7px] rounded-full bg-[#ff5b4d] shadow-[0_0_45px_rgba(255,91,77,0.35)]" />
            <span className="relative z-10 text-2xl font-semibold tracking-[0.1em] text-white">
              {isRecording ? "STOP" : "REC"}
            </span>
          </button>

          <button
            type="button"
            onClick={onFlip}
            className="h-16 rounded-full border border-white/12 bg-white/[0.05] px-5 text-xl font-medium text-white/90 transition hover:bg-white/[0.09]"
          >
            Flip
          </button>
        </div>
      </div>
    </div>
  );
}
