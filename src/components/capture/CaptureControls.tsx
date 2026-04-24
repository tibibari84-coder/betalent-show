'use client';

function formatDuration(ms: number) {
  const totalSeconds = Math.ceil(ms / 1000);
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
  durationOptions: number[];
  selectedDurationMs: number;
  canSwitchCamera?: boolean;
  onStart: () => void;
  onStop: () => void;
  onRequestLibrary: () => void;
  onSelectDuration: (durationMs: number) => void;
  onSwitchCamera?: () => void;
}) {
  const progress = Math.min(100, Math.round((props.elapsedMs / props.maxDurationMs) * 100));

  return (
    <div className="space-y-4 rounded-[1.4rem] border border-white/10 bg-black/45 p-4 shadow-[0_-20px_50px_-35px_rgba(0,0,0,0.95)] backdrop-blur-xl">
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.1em] text-white/62">
        <span>{props.isRecording ? 'Recording' : 'Duration selected'}</span>
        <span>{formatDuration(props.remainingMs)} left</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {props.durationOptions.map((durationMs) => {
          const isSelected = durationMs === props.selectedDurationMs;
          return (
            <button
              key={durationMs}
              type="button"
              onClick={() => props.onSelectDuration(durationMs)}
              disabled={props.isRecording}
              className={`rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] transition ${
                isSelected
                  ? 'border-white/28 bg-white text-black'
                  : 'border-white/12 bg-white/[0.05] text-white/74 hover:bg-white/[0.1]'
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              {durationMs / 1000}s
            </button>
          );
        })}
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-white/[0.08]">
        <div className="h-full rounded-full bg-rose-300/85 transition-all duration-200" style={{ width: `${progress}%` }} />
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <button
          type="button"
          onClick={props.onRequestLibrary}
          className="justify-self-start rounded-full border border-white/14 bg-white/[0.05] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-white/74 hover:bg-white/[0.1]"
        >
          Library
        </button>

        {!props.isRecording ? (
          <button
            type="button"
            onClick={props.onStart}
            disabled={!props.canRecord}
            className="h-16 w-16 rounded-full border border-rose-200/40 bg-rose-300/85 text-[11px] font-semibold uppercase tracking-[0.08em] text-rose-950 shadow-[0_18px_30px_-20px_rgba(255,120,150,0.9)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Record
          </button>
        ) : (
          <button
            type="button"
            onClick={props.onStop}
            className="h-16 w-16 rounded-full border border-white/20 bg-white/90 text-[11px] font-semibold uppercase tracking-[0.08em] text-black shadow-[0_18px_30px_-20px_rgba(255,255,255,0.9)]"
          >
            Stop
          </button>
        )}

        {props.canSwitchCamera && props.onSwitchCamera ? (
          <button
            type="button"
            onClick={props.onSwitchCamera}
            className="justify-self-end rounded-full border border-white/14 bg-white/[0.05] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-white/74 hover:bg-white/[0.1]"
          >
            Flip
          </button>
        ) : (
          <span className="justify-self-end text-xs text-white/58">{props.isRecording ? 'On camera' : 'Vertical 9:16'}</span>
        )}
      </div>
    </div>
  );
}
