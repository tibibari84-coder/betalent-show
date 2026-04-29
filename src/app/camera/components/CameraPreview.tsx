"use client";

import { useEffect, useState, type RefObject } from "react";

export type CameraFacingMode = "user" | "environment";
export type CameraStatus = "idle" | "requesting" | "ready" | "denied" | "error";

type CameraPreviewProps = {
  videoRef: RefObject<HTMLVideoElement | null>;
  stream: MediaStream | null;
  status: CameraStatus;
  error?: string | null;
  constraintMode?: "native-portrait" | "fallback" | "none";
  facingMode: CameraFacingMode;
  onRetry: () => void;
};

export function CameraPreview({
  videoRef,
  stream,
  status,
  error,
  constraintMode = "none",
  facingMode,
  onRetry,
}: CameraPreviewProps) {
  const [debugMetrics, setDebugMetrics] = useState({
    screenWidth: 0,
    screenHeight: 0,
    videoWidth: 0,
    videoHeight: 0,
    trackWidth: 0,
    trackHeight: 0,
    trackAspectRatio: "n/a",
  });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.srcObject = stream;

    if (stream) {
      void video.play().catch(() => undefined);
    }
  }, [stream, videoRef]);

  useEffect(() => {
    const updateMetrics = () => {
      const video = videoRef.current;
      const settings = stream?.getVideoTracks()[0]?.getSettings();

      setDebugMetrics({
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
        videoWidth: video?.videoWidth ?? 0,
        videoHeight: video?.videoHeight ?? 0,
        trackWidth: settings?.width ?? 0,
        trackHeight: settings?.height ?? 0,
        trackAspectRatio:
          typeof settings?.aspectRatio === "number"
            ? settings.aspectRatio.toFixed(4)
            : "n/a",
      });
    };

    updateMetrics();
    const interval = window.setInterval(updateMetrics, 500);
    window.addEventListener("resize", updateMetrics);
    window.visualViewport?.addEventListener("resize", updateMetrics);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("resize", updateMetrics);
      window.visualViewport?.removeEventListener("resize", updateMetrics);
    };
  }, [stream, videoRef]);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-black">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 h-full w-full object-cover object-[50%_35%] -z-10"
        style={{ transform: facingMode === "user" ? "scaleX(-1) scale(0.78)" : "scale(0.78)" }}
      />

      <div className="absolute left-4 top-24 z-[999999] rounded-md bg-black/80 p-2 font-mono text-[10px] leading-4 text-green-400">
        <div>Screen: {debugMetrics.screenWidth} x {debugMetrics.screenHeight}</div>
        <div>Video Element: {debugMetrics.videoWidth} x {debugMetrics.videoHeight}</div>
        <div>Track Settings: {debugMetrics.trackWidth} x {debugMetrics.trackHeight}</div>
        <div>Track Aspect Ratio: {debugMetrics.trackAspectRatio}</div>
        <div>Constraint: {constraintMode}</div>
      </div>

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
