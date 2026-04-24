'use client';

export function VideoPreviewView(props: {
  previewUrl: string;
  isImported?: boolean;
  onRetake: () => void;
  onUseVideo: () => void;
}) {
  return (
    <div className="relative h-full w-full">
      <video
        controls
        playsInline
        preload="metadata"
        className="h-full w-full bg-black object-contain"
        src={props.previewUrl}
      />

      <div className="pointer-events-auto absolute inset-x-4 bottom-[calc(var(--bt-safe-bottom)+1rem)] z-20 space-y-4 rounded-[1.45rem] border border-white/10 bg-black/44 p-4 shadow-[0_-24px_60px_-36px_rgba(0,0,0,1)] backdrop-blur-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/48">Review</p>
            <h3 className="mt-1 text-[1.1rem] font-semibold tracking-[-0.04em] text-white">
              {props.isImported ? 'Review imported video' : 'Review your take'}
            </h3>
          </div>
          <p className="text-right text-xs leading-relaxed text-white/54">Local preview. Nothing uploads until confirmation.</p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={props.onRetake}
            className="min-h-12 rounded-full border border-white/14 bg-white/[0.06] px-4 text-xs font-semibold uppercase tracking-[0.08em] text-white/82"
          >
            {props.isImported ? 'Choose again' : 'Retake'}
          </button>
          <button
            type="button"
            onClick={props.onUseVideo}
            className="foundation-primary-button min-h-12 px-4 text-xs font-semibold uppercase tracking-[0.08em]"
          >
            Use video
          </button>
        </div>
      </div>
    </div>
  );
}
