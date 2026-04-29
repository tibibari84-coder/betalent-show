"use client";

import { useEffect, type RefObject } from "react";

export type CameraFacingMode = "user" | "environment";
export type CameraStatus = "idle" | "requesting" | "ready" | "denied" | "error";

type CameraPreviewProps = {
  videoRef: RefObject<HTMLVideoElement | null>;
  stream: MediaStream | null;
  status: CameraStatus;
  error?: string | null;
  onRetry: () => void;
};

export function CameraPreview({
  videoRef,
  stream,
  status,
  error,
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

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-black">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 h-[100dvh] w-screen object-cover object-top -z-10 bg-black"
        style={{ transform: "scaleX(-1)" }}
      />

      {status === "requesting" || status === "idle" ? (
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <div className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-medium tracking-[0.08em] text-white/80 shadow-2xl backdrop-blur-md">
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
