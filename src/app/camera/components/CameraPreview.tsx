"use client";

import { useEffect, useRef, useState } from "react";

export type CameraFacingMode = "user" | "environment";
export type CameraStatus = "idle" | "requesting" | "ready" | "denied" | "error";

type CameraPreviewProps = {
  stream: MediaStream | null;
  facingMode?: CameraFacingMode;
  [key: string]: unknown;
};

export function CameraPreview({ stream, facingMode = "user" }: CameraPreviewProps) {
  const backgroundVideoRef = useRef<HTMLVideoElement>(null);
  const foregroundVideoRef = useRef<HTMLVideoElement>(null);
  const [isLandscape, setIsLandscape] = useState(true);

  useEffect(() => {
    if (!stream) return;

    if (backgroundVideoRef.current) {
      backgroundVideoRef.current.srcObject = stream;
      void backgroundVideoRef.current.play().catch(() => undefined);
    }

    if (foregroundVideoRef.current) {
      foregroundVideoRef.current.srcObject = stream;
      void foregroundVideoRef.current.play().catch(() => undefined);
    }

    const track = stream.getVideoTracks()[0];
    const settings = track?.getSettings();
    queueMicrotask(() => {
      setIsLandscape((settings?.width || 1920) > (settings?.height || 1080));
    });
  }, [stream]);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-black">
      {/* BACKGROUND - kitolti a kepernyot blurrel */}
      <video
        ref={backgroundVideoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 h-full w-full scale-125 object-cover opacity-50 blur-3xl"
        style={{ transform: facingMode === "user" ? "scaleX(-1)" : undefined }}
      />

      {/* FOREGROUND - termeszetes framing, NINCS crop */}
      <video
        ref={foregroundVideoRef}
        autoPlay
        playsInline
        muted
        className={`relative z-10 h-full w-full ${
          isLandscape ? "object-contain" : "object-cover object-[50%_35%]"
        }`}
        style={{
          transform: facingMode === "user" ? "scaleX(-1)" : undefined,
          maxHeight: "100dvh",
        }}
      />
    </div>
  );
}

export default CameraPreview;
