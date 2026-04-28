"use client";

import { useEffect, type RefObject } from "react";

export type CameraFacingMode = "user" | "environment";
export type CameraStatus = "idle" | "requesting" | "ready" | "denied" | "error";

type CameraPreviewProps = {
  videoRef: RefObject<HTMLVideoElement | null>;
  stream: MediaStream | null;
  status: CameraStatus;
  error?: string | null;
  facingMode: CameraFacingMode;
  settings?: MediaTrackSettings | null;
  onRetry: () => void;
};

function getObjectPositionClass(
  facingMode: CameraFacingMode,
  settings?: MediaTrackSettings | null,
) {
  if (facingMode === "environment") return "object-[50%_50%]";

  const width = settings?.width ?? 0;
  const height = settings?.height ?? 0;
  const isLandscapeTrack = width > 0 && height > 0 && width > height;

  return isLandscapeTrack ? "object-[50%_38%]" : "object-[50%_34%]";
}

export function CameraPreview({
  videoRef,
  stream,
  status,
  error,
  facingMode,
  settings,
  onRetry,
}: CameraPreviewProps) {
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.srcObject = stream;

    if (stream) {
      void video.play().catch(() => undefined);
    }
  }, [stream, videoRef]);

  const objectPositionClass = getObjectPositionClass(facingMode, settings);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-black">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`absolute inset-0 z-0 h-full w-full object-cover ${objectPositionClass}`}
        style={{ transform: facingMode === "user" ? "scaleX(-1)" : undefined }}
      />

      <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.08),transparent_34%),linear-gradient(180deg,rgba(0,0,0,0.44)_0%,transparent_24%,transparent_66%,rgba(0,0,0,0.62)_100%)]" />

      {status === "requesting" || status === "idle" ? (
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <div className="rounded-full border border-white/12 bg-black/45 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/72 backdrop-blur-xl">
            Starting camera
          </div>
        </div>
      ) : null}

      {status === "denied" || status === "error" ? (
        <div className="absolute inset-0 z-30 flex items-center justify-center px-7 text-center">
          <div className="max-w-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/45">
              Camera unavailable
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-white">
              Give BETALENT camera and microphone access.
            </h2>
            <p className="mt-3 text-sm leading-6 text-white/62">
              {error || "The camera could not start on this device."}
            </p>
            <button
              type="button"
              onClick={onRetry}
              className="mt-6 h-12 rounded-full bg-white px-6 text-sm font-semibold text-black transition active:scale-95"
            >
              Try again
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
