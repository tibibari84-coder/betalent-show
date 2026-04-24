'use client';

export function VideoPreviewView(props: {
  previewUrl: string;
  onRetake: () => void;
  onUseVideo: () => void;
  fullscreen?: boolean;
}) {
  return (
    <div className={props.fullscreen ? 'flex h-full flex-col bg-transparent' : 'space-y-4'}>
      <div
        className={
          props.fullscreen
            ? 'mx-auto aspect-[9/16] h-[62vh] min-h-[24rem] max-h-[44rem] w-auto max-w-full overflow-hidden rounded-[2rem] border border-white/10 bg-black shadow-[0_32px_90px_-42px_rgba(0,0,0,1)]'
            : 'overflow-hidden rounded-[1.2rem] border border-white/12 bg-black/90 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.95)]'
        }
      >
        <video
          controls
          playsInline
          preload="metadata"
          className={props.fullscreen ? 'h-full w-full bg-black object-cover' : 'min-h-[20rem] w-full bg-black object-cover'}
          src={props.previewUrl}
        />
      </div>

      <div className={props.fullscreen ? 'hidden' : 'rounded-[1.2rem] border border-white/10 bg-black/45 p-4 backdrop-blur-xl'}>
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
