'use client';

function formatRemaining(ms: number) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function CaptureControls(props: {
  canRecord: boolean;
  isRecording: boolean;
  elapsedMs: number;
  remainingMs: number;
  maxDurationMs: number;
  durationOptions: readonly number[];
  selectedDurationMs: number;
  canSwitchCamera: boolean;
  recorderError?: string | null;
  onStart: () => void;
  onStop: () => void;
  onRequestLibrary: () => void;
  onSelectDuration: (durationMs: number) => void;
  onSwitchCamera: () => void;
}) {
  const progress = Math.min(100, (props.elapsedMs / props.maxDurationMs) * 100);
  const selectedSeconds = props.selectedDurationMs / 1000;

  return (
    <div className="space-y-4">
      <div className="mx-auto max-w-[18rem] overflow-hidden rounded-full bg-white/[0.14]">
        <div className="h-1 rounded-full bg-white transition-all duration-100" style={{ width: `${progress}%` }} />
      </div>

      <div className="rounded-[1.8rem] border border-white/10 bg-black/34 px-4 py-5 shadow-[0_-24px_60px_-36px_rgba(0,0,0,1)] backdrop-blur-xl">
        <div className="flex items-center justify-center">
          <div className="flex rounded-full border border-white/10 bg-white/[0.05] p-1">
            {props.durationOptions.map((durationMs) => {
              const isSelected = props.selectedDurationMs === durationMs;
              return (
                <button
                  key={durationMs}
                  type="button"
                  disabled={props.isRecording}
                  onClick={() => props.onSelectDuration(durationMs)}
                  className={`min-h-9 min-w-14 rounded-full px-3 text-xs font-semibold transition ${
                    isSelected ? 'bg-white text-black' : 'text-white/68'
                  } disabled:cursor-not-allowed disabled:opacity-55`}
                >
                  {durationMs / 1000}s
                </button>
              );
            })}
          </div>
        </div>

        {props.recorderError ? (
          <p className="mt-3 rounded-[1rem] border border-red-400/20 bg-red-500/[0.08] px-3 py-2 text-sm text-red-100">
            {props.recorderError}
          </p>
        ) : null}

        <p className="mt-4 text-center text-[1.35rem] font-semibold tracking-[-0.05em] text-white">
          {props.isRecording ? formatRemaining(props.remainingMs) : `${selectedSeconds}s`}
        </p>

        <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <button
            type="button"
            onClick={props.onRequestLibrary}
            disabled={props.isRecording}
            className="justify-self-start rounded-full border border-white/14 bg-white/[0.06] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-white/78 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Library
          </button>

          {props.isRecording ? (
            <button
              type="button"
              onClick={props.onStop}
              className="h-[5rem] w-[5rem] rounded-full border-[6px] border-white bg-[#0d0d10] text-[10px] font-semibold uppercase tracking-[0.08em] text-white shadow-[0_22px_56px_-24px_rgba(255,255,255,0.75)]"
            >
              Stop
            </button>
          ) : (
            <button
              type="button"
              onClick={props.onStart}
              disabled={!props.canRecord}
              className="h-[5rem] w-[5rem] rounded-full border-[6px] border-white/85 bg-[#e94b3f] text-[10px] font-semibold uppercase tracking-[0.08em] text-white shadow-[0_22px_56px_-22px_rgba(233,75,63,0.95)] disabled:cursor-not-allowed disabled:opacity-45"
            >
              Rec
            </button>
          )}

          <button
            type="button"
            onClick={props.onSwitchCamera}
            disabled={!props.canSwitchCamera}
            className="justify-self-end rounded-full border border-white/14 bg-white/[0.06] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-white/78 disabled:cursor-not-allowed disabled:opacity-45"
          >
            Flip
          </button>
        </div>
        <p className="mt-4 text-center text-xs leading-relaxed text-white/46">
          Nothing uploads until review and confirmation.
        </p>
      </div>
    </div>
  );
}
