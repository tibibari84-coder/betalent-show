"use client";

type PreviewReviewScreenProps = {
  previewUrl: string;
  onRetake: () => void;
  onUseVideo: () => void;
};

export function PreviewReviewScreen({
  previewUrl,
  onRetake,
  onUseVideo,
}: PreviewReviewScreenProps) {
  return (
    <div className="absolute inset-0 z-40 overflow-hidden bg-black text-white">
      <video
        src={previewUrl}
        autoPlay
        playsInline
        loop
        controls={false}
        className="absolute inset-0 z-0 h-full w-full object-cover object-[50%_38%]"
      />

      <div className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(0,0,0,0.52)_0%,transparent_24%,transparent_68%,rgba(0,0,0,0.68)_100%)]" />

      <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-4 pt-[calc(env(safe-area-inset-top)+12px)]">
        <button
          type="button"
          onClick={onRetake}
          className="h-10 rounded-full border border-white/12 bg-black/28 px-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/84 backdrop-blur-xl transition active:scale-95"
        >
          Retake
        </button>

        <div className="rounded-full border border-white/10 bg-black/22 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/78 backdrop-blur-xl">
          Preview
        </div>

        <div className="h-10 w-[76px]" aria-hidden />
      </div>

      <div className="absolute inset-x-0 bottom-0 z-20 px-5 pb-[calc(env(safe-area-inset-bottom)+18px)]">
        <div className="mb-5 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/52">
            Local take
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-white">
            Review before upload
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onRetake}
            className="h-14 rounded-full border border-white/12 bg-black/32 text-sm font-semibold uppercase tracking-[0.12em] text-white/82 backdrop-blur-xl transition active:scale-95"
          >
            Retake
          </button>
          <button
            type="button"
            onClick={onUseVideo}
            className="h-14 rounded-full bg-white text-sm font-semibold uppercase tracking-[0.12em] text-black shadow-[0_18px_50px_rgba(255,255,255,0.22)] transition active:scale-95"
          >
            Use video
          </button>
        </div>
      </div>
    </div>
  );
}
