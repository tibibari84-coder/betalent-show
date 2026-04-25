"use client";

import { useEffect, useRef } from "react";
import type { CameraFacingMode, CameraStatus } from "@/hooks/useCamera";

type CameraCaptureViewProps = {
  stream: MediaStream | null;
  status: CameraStatus;
  error: string | null;
  facingMode: CameraFacingMode;
  onRetry: () => void;
};

export function CameraCaptureView({
  stream,
  status,
  error,
  facingMode,
  onRetry,
}: CameraCaptureViewProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (stream) {
      video.srcObject = stream;
      void video.play().catch(() => {});
    } else {
      video.srcObject = null;
    }
  }, [stream]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className={[
          "absolute inset-0 h-full w-full object-cover",
          facingMode === "user" ? "scale-x-[-1]" : "",
        ].join(" ")}
        style={{
          objectPosition: facingMode === "user" ? "50% 36%" : "50% 44%",
        }}
      />

      {!stream && (
        <div className="absolute inset-0 flex items-center justify-center px-6">
          <div className="max-w-sm rounded-[32px] border border-white/10 bg-black/65 p-6 text-center backdrop-blur-xl">
            <p className="text-[11px] uppercase tracking-[0.32em] text-white/55">Camera</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
              {status === "requesting" ? "Opening camera..." : "Allow camera and microphone access"}
            </h2>
            <p className="mt-3 text-sm leading-6 text-white/70">
              {status === "requesting"
                ? "BETALENT is preparing your capture surface."
                : "Nothing uploads until you review and confirm your take."}
            </p>

            {error && (
              <p className="mt-4 rounded-2xl border border-red-500/35 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                {error}
              </p>
            )}

            {status !== "requesting" && (
              <button
                type="button"
                onClick={onRetry}
                className="mt-5 inline-flex h-12 items-center justify-center rounded-full border border-white/12 bg-white/10 px-5 text-sm font-medium text-white transition hover:bg-white/14"
              >
                Retry camera
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
