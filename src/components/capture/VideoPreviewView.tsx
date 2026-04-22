'use client';

export function VideoPreviewView(props: {
  previewUrl: string;
  onRetake: () => void;
  onUseVideo: () => void;
}) {
  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-[1.2rem] border border-white/12 bg-black/60">
        <video controls playsInline preload="metadata" className="aspect-[9/16] w-full bg-black object-cover" src={props.previewUrl} />
      </div>

      <div className="rounded-[1rem] border border-white/10 bg-black/35 p-4">
        <p className="text-sm text-white/72">Review this take before upload. Keep only your final performance cut.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={props.onRetake}
            className="rounded-full border border-white/14 bg-white/[0.04] px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white/78 hover:bg-white/[0.08]"
          >
            Retake
          </button>
          <button
            type="button"
            onClick={props.onUseVideo}
            className="foundation-primary-button min-h-[2.8rem] rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em]"
          >
            Use video
          </button>
        </div>
      </div>
    </div>
  );
}
