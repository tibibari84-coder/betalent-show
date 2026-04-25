"use client";

type VideoPreviewViewProps = {
  previewUrl: string;
  onRetake: () => void;
  onUseVideo: () => void;
};

export function VideoPreviewView({
  previewUrl,
  onRetake,
  onUseVideo,
}: VideoPreviewViewProps) {
  return (
    <div className="absolute inset-0 bg-black">
      <video
        src={previewUrl}
        controls
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
        style={{ objectPosition: "50% 40%" }}
      />

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/85 to-transparent px-4 pb-[calc(env(safe-area-inset-bottom,0px)+18px)] pt-24">
        <div className="mx-auto max-w-xl rounded-[34px] border border-white/10 bg-black/58 p-5 backdrop-blur-2xl">
          <p className="text-[11px] uppercase tracking-[0.32em] text-white/55">Review</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">
            Check your take
          </h2>
          <p className="mt-2 text-sm leading-6 text-white/65">
            Retake if the framing, energy, or sound is off. Use video to move into rights
            confirmation and upload.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onRetake}
              className="h-14 rounded-full border border-white/12 bg-white/[0.05] text-base font-semibold text-white transition hover:bg-white/[0.08]"
            >
              Retake
            </button>
            <button
              type="button"
              onClick={onUseVideo}
              className="h-14 rounded-full bg-[#f78f84] text-base font-semibold text-white shadow-[0_14px_34px_rgba(247,143,132,0.28)] transition hover:brightness-105"
            >
              Use video
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
