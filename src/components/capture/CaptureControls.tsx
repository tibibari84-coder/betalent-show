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
    <div className="space-y-5">
      <div className="mx-auto h-1 w-[min(74vw,21rem)] overflow-hidden rounded-full bg-white/22">
        <div className="h-full rounded-full bg-white transition-all duration-100" style={{ width: `${progress}%` }} />
      </div>

      <div className="space-y-5">
        <div className="flex items-center justify-center">
          <div className="flex rounded-full border border-white/12 bg-black/42 p-1 shadow-[0_18px_48px_-28px_rgba(0,0,0,1)] backdrop-blur-xl">
            {props.durationOptions.map((durationMs) => {
              const isSelected = props.selectedDurationMs === durationMs;
              return (
                <button
                  key={durationMs}
                  type="button"
                  disabled={props.isRecording}
                  onClick={() => props.onSelectDuration(durationMs)}
                  className={`min-h-9 min-w-[4.2rem] rounded-full px-3 text-sm font-semibold transition ${
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
          <p className="mx-auto max-w-[19rem] rounded-[1rem] border border-red-400/20 bg-red-500/[0.16] px-3 py-2 text-center text-sm text-red-100 backdrop-blur-xl">
            {props.recorderError}
          </p>
        ) : null}

        <p className="text-center text-[2.3rem] font-semibold tracking-[-0.04em] text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.7)]">
          {props.isRecording ? formatRemaining(props.remainingMs) : `${selectedSeconds}s`}
        </p>

        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-2">
          <button
            type="button"
            onClick={props.onRequestLibrary}
            disabled={props.isRecording}
            className="min-h-12 justify-self-start rounded-full border border-white/16 bg-black/36 px-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-white/86 shadow-[0_18px_42px_-30px_rgba(0,0,0,1)] backdrop-blur-xl disabled:cursor-not-allowed disabled:opacity-40"
          >
            Library
          </button>

          {props.isRecording ? (
            <button
              type="button"
              onClick={props.onStop}
              className="h-[5.6rem] w-[5.6rem] rounded-full border-[7px] border-white bg-[#0d0d10] text-[10px] font-semibold uppercase tracking-[0.08em] text-white shadow-[0_22px_56px_-24px_rgba(255,255,255,0.75)]"
            >
              Stop
            </button>
          ) : (
            <button
              type="button"
              onClick={props.onStart}
              disabled={!props.canRecord}
              className="h-[5.6rem] w-[5.6rem] rounded-full border-[7px] border-white/90 bg-[#e94b3f] text-[10px] font-semibold uppercase tracking-[0.08em] text-white shadow-[0_22px_56px_-22px_rgba(233,75,63,0.95)] disabled:cursor-not-allowed disabled:opacity-45"
            >
              Rec
            </button>
          )}

          <button
            type="button"
            onClick={props.onSwitchCamera}
            disabled={!props.canSwitchCamera}
            className="min-h-12 justify-self-end rounded-full border border-white/16 bg-black/36 px-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-white/86 shadow-[0_18px_42px_-30px_rgba(0,0,0,1)] backdrop-blur-xl disabled:cursor-not-allowed disabled:opacity-45"
          >
            Flip
          </button>
        </div>
      </div>
    </div>
  );
}
