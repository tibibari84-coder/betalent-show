"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type CameraFacingMode = "user" | "environment";
export type CameraStatus = "idle" | "requesting" | "ready" | "denied" | "error";

type UseCameraOptions = {
  initialFacingMode?: CameraFacingMode;
};

function mapCameraError(error: unknown): string {
  if (!(error instanceof DOMException)) {
    return "Camera access failed.";
  }

  switch (error.name) {
    case "NotAllowedError":
      return "Camera and microphone access was denied.";
    case "NotFoundError":
      return "No camera was found on this device.";
    case "NotReadableError":
      return "The camera is already in use by another app.";
    case "OverconstrainedError":
      return "This device could not satisfy the requested camera settings.";
    default:
      return "Unable to start the camera right now.";
  }
}

function getMediaConstraints(facingMode: CameraFacingMode): MediaStreamConstraints {
  return {
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    },
    video: {
      facingMode: { ideal: facingMode },
      // The exact aspect ratio forces iOS to return vertical video, stopping the zoom/crop issue.
      aspectRatio: { exact: 0.5625 },
      width: { ideal: 720 },
      height: { ideal: 1280 },
    },
  };
}

export function useCamera(options: UseCameraOptions = {}) {
  const { initialFacingMode = "user" } = options;

  const [status, setStatus] = useState<CameraStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<CameraFacingMode>(initialFacingMode);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    const current = streamRef.current;
    if (!current) return;

    current.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setStream(null);
    setStatus("idle");
  }, []);

  const startCamera = useCallback(
    async (nextFacingMode?: CameraFacingMode) => {
      const targetFacing = nextFacingMode ?? facingMode;

      setStatus("requesting");
      setError(null);

      try {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }

        const mediaStream = await navigator.mediaDevices.getUserMedia(
          getMediaConstraints(targetFacing),
        );

        streamRef.current = mediaStream;
        setFacingMode(targetFacing);
        setStream(mediaStream);
        setStatus("ready");
      } catch (err) {
        const message = mapCameraError(err);
        setError(message);
        setStream(null);

        if (err instanceof DOMException && err.name === "NotAllowedError") {
          setStatus("denied");
        } else {
          setStatus("error");
        }
      }
    },
    [facingMode],
  );

  const switchCamera = useCallback(async () => {
    const nextFacing: CameraFacingMode = facingMode === "user" ? "environment" : "user";
    await startCamera(nextFacing);
  }, [facingMode, startCamera]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return {
    status,
    error,
    stream,
    facingMode,
    startCamera,
    stopCamera,
    switchCamera,
    isReady: status === "ready" && !!stream,
  };
}
