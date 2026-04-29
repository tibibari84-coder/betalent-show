"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { useRecorder } from "@/hooks/useRecorder";
import {
  CameraPreview,
  type CameraFacingMode,
  type CameraStatus,
} from "./CameraPreview";
import {
  CaptureBottomControls,
  type CaptureDuration,
} from "./CaptureBottomControls";
import { CaptureTopBar } from "./CaptureTopBar";
import { LegalConfirmationScreen } from "./LegalConfirmationScreen";
import { PreviewReviewScreen } from "./PreviewReviewScreen";

type FlowStep = "camera" | "preview" | "confirm";

type MobileCaptureFlowProps = {
  onExit: () => void;
  onUploadConfirmed: (file: File) => Promise<void>;
};

type ToolButtonProps = {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  children: ReactNode;
};

type ZoomCapabilities = MediaTrackCapabilities & {
  zoom?: {
    min?: number;
    max?: number;
    step?: number;
  };
};

type ZoomConstraintSet = MediaTrackConstraintSet & {
  zoom?: number;
};

function mapCameraError(error: unknown): string {
  if (!(error instanceof DOMException)) return "Camera access failed.";

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

function getCameraConstraints(facingMode: CameraFacingMode): MediaStreamConstraints {
  return {
    video: {
      facingMode,
      aspectRatio: { exact: 0.5625 },
      width: { ideal: 720 },
      height: { ideal: 1280 },
    },
    audio: true,
  };
}

async function removeHardwareZoom(track: MediaStreamTrack) {
  const capabilities =
    typeof track.getCapabilities === "function"
      ? (track.getCapabilities() as ZoomCapabilities)
      : null;
  const minZoom = capabilities?.zoom?.min;

  if (typeof minZoom !== "number") return;

  await track
    .applyConstraints({
      advanced: [{ zoom: minZoom } as ZoomConstraintSet],
    })
    .catch(() => undefined);
}

async function readVideoDuration(file: File): Promise<number> {
  const url = URL.createObjectURL(file);

  try {
    return await new Promise<number>((resolve, reject) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.src = url;
      video.onloadedmetadata = () => resolve(video.duration);
      video.onerror = () => reject(new Error("Could not read video duration."));
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

function ToolButton({ label, onClick, disabled = false, children }: ToolButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="pointer-events-auto flex flex-col items-center gap-1 text-white drop-shadow-md transition active:scale-95 disabled:opacity-40"
    >
      <span className="flex h-7 w-7 items-center justify-center">{children}</span>
      <span className="text-[10px] font-medium tracking-[0.02em] text-white/90">{label}</span>
    </button>
  );
}

function CaptureToolRail({
  onFlip,
  disabled,
}: {
  onFlip: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="pointer-events-none absolute right-4 top-24 z-40 flex flex-col items-center gap-6">
      <ToolButton label="Flip" onClick={onFlip} disabled={disabled}>
        <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" aria-hidden>
          <path
            d="M7.2 7.5a6.75 6.75 0 0 1 10.2-.45l1.1 1.1"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M18.7 4.6v3.8h-3.8M16.8 16.5a6.75 6.75 0 0 1-10.2.45l-1.1-1.1"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M5.3 19.4v-3.8h3.8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </ToolButton>

      <ToolButton label="Speed" disabled={disabled}>
        <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" aria-hidden>
          <path
            d="M4.5 15.2a8 8 0 1 1 15 0"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="m12 12 4.1-4.1"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M8 19h8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </ToolButton>

      <ToolButton label="Timer" disabled={disabled}>
        <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" aria-hidden>
          <path
            d="M9 3h6M12 8v5l3 2"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 21a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      </ToolButton>

      <ToolButton label="Effects" disabled={disabled}>
        <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" aria-hidden>
          <path
            d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="m18.5 15 .7 2.1 2.1.7-2.1.7-.7 2.1-.7-2.1-2.1-.7 2.1-.7.7-2.1Z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
        </svg>
      </ToolButton>
    </div>
  );
}

export function MobileCaptureFlow({
  onExit,
  onUploadConfirmed,
}: MobileCaptureFlowProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const facingModeRef = useRef<CameraFacingMode>("user");
  const handledRecorderPreviewRef = useRef(false);

  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<FlowStep>("camera");
  const [durationSeconds, setDurationSeconds] = useState<CaptureDuration>(60);
  const [status, setStatus] = useState<CameraStatus>("idle");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [libraryPreviewUrl, setLibraryPreviewUrl] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const recorder = useRecorder({ stream, durationSeconds });

  const activePreviewUrl = useMemo(() => {
    return libraryPreviewUrl || recorder.previewUrl;
  }, [libraryPreviewUrl, recorder.previewUrl]);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setStream(null);
    setStatus("idle");
  }, []);

  const startCamera = useCallback(
    async (nextFacingMode: CameraFacingMode = facingModeRef.current) => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError("This browser does not support in-app camera capture.");
        setStatus("error");
        return;
      }

      setStatus("requesting");
      setCameraError(null);

      try {
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;

        let nextStream: MediaStream;
        try {
          nextStream = await navigator.mediaDevices.getUserMedia(
            getCameraConstraints(nextFacingMode),
          );
        } catch {
          nextStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: nextFacingMode },
            audio: true,
          });
        }

        const videoTrack = nextStream.getVideoTracks()[0] ?? null;
        if (videoTrack) {
          await removeHardwareZoom(videoTrack);
        }

        streamRef.current = nextStream;
        facingModeRef.current = nextFacingMode;
        setStream(nextStream);
        setStatus("ready");
      } catch (error) {
        setCameraError(mapCameraError(error));
        setStream(null);
        setStatus(error instanceof DOMException && error.name === "NotAllowedError" ? "denied" : "error");
      }
    },
    [],
  );

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousOverscrollBehavior = document.body.style.overscrollBehavior;

    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";
    queueMicrotask(() => setMounted(true));

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.overscrollBehavior = previousOverscrollBehavior;
    };
  }, []);

  useEffect(() => {
    if (!mounted) return;

    queueMicrotask(() => {
      void startCamera("user");
    });

    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, [mounted, startCamera]);

  useEffect(() => {
    return () => {
      if (libraryPreviewUrl) URL.revokeObjectURL(libraryPreviewUrl);
    };
  }, [libraryPreviewUrl]);

  useEffect(() => {
    if (!recorder.hasPreview || libraryPreviewUrl || handledRecorderPreviewRef.current) return;

    handledRecorderPreviewRef.current = true;
    queueMicrotask(() => {
      const file = recorder.createRecordedFile("betalent-take");
      if (file) setPendingFile(file);
      stopCamera();
      setStep("preview");
    });
  }, [libraryPreviewUrl, recorder, stopCamera]);

  const resetToCamera = useCallback(() => {
    setStep("camera");
    setLocalError(null);
    setPendingFile(null);
    handledRecorderPreviewRef.current = false;

    if (libraryPreviewUrl) {
      URL.revokeObjectURL(libraryPreviewUrl);
      setLibraryPreviewUrl(null);
    }

    recorder.resetRecording();
    void startCamera(facingModeRef.current);
  }, [libraryPreviewUrl, recorder, startCamera]);

  const handleRecord = () => {
    setLocalError(null);
    handledRecorderPreviewRef.current = false;
    recorder.startRecording();
  };

  const handlePickLibrary = () => {
    fileInputRef.current?.click();
  };

  const handleLibraryFile = async (file: File | null) => {
    if (!file) return;

    setLocalError(null);

    if (!file.type.startsWith("video/")) {
      setLocalError("Please choose a valid video file.");
      return;
    }

    try {
      const duration = await readVideoDuration(file);
      if (duration > 120) {
        setLocalError("Selected video is longer than 120 seconds.");
        return;
      }

      const url = URL.createObjectURL(file);
      if (libraryPreviewUrl) URL.revokeObjectURL(libraryPreviewUrl);

      recorder.resetRecording();
      handledRecorderPreviewRef.current = true;
      setLibraryPreviewUrl(url);
      setPendingFile(file);
      stopCamera();
      setStep("preview");
    } catch {
      setLocalError("BETALENT could not read that video file.");
    }
  };

  const handleFlip = () => {
    const nextFacingMode = facingModeRef.current === "user" ? "environment" : "user";
    void startCamera(nextFacingMode);
  };

  const handleConfirmUpload = async () => {
    if (!pendingFile) {
      setLocalError("No video is ready to upload.");
      return;
    }

    setIsUploading(true);
    setLocalError(null);

    try {
      await onUploadConfirmed(pendingFile);
      onExit();
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : "Upload could not be completed.");
    } finally {
      setIsUploading(false);
    }
  };

  const displayError = localError || recorder.error;
  const cameraDisabled = status !== "ready" || !stream;

  const captureView = (
    <div className="fixed inset-0 z-[999999] h-[100dvh] w-screen overflow-hidden bg-black text-white touch-none">
      {step === "camera" ? (
        <>
          <CameraPreview
            videoRef={videoRef}
            stream={stream}
            status={status}
            error={cameraError}
            onRetry={() => void startCamera(facingModeRef.current)}
          />

          <CaptureTopBar
            onBack={onExit}
            isRecording={recorder.isRecording}
          />

          <CaptureToolRail
            onFlip={handleFlip}
            disabled={recorder.isRecording || cameraDisabled}
          />

          {displayError ? (
            <div className="pointer-events-none absolute inset-x-4 bottom-[calc(env(safe-area-inset-bottom)+168px)] z-40 flex justify-center">
              <div className="max-w-sm rounded-full border border-red-300/20 bg-red-500/12 px-4 py-2 text-center text-xs font-medium leading-5 text-red-100 backdrop-blur-xl">
                {displayError}
              </div>
            </div>
          ) : null}

          <CaptureBottomControls
            durationSeconds={durationSeconds}
            onDurationChange={setDurationSeconds}
            onRecord={handleRecord}
            onStop={recorder.stopRecording}
            onLibrary={handlePickLibrary}
            isRecording={recorder.isRecording}
            remainingSeconds={recorder.remainingSeconds}
            disabled={cameraDisabled}
          />
        </>
      ) : null}

      {step === "preview" && activePreviewUrl ? (
        <PreviewReviewScreen
          previewUrl={activePreviewUrl}
          onRetake={resetToCamera}
          onUseVideo={() => setStep("confirm")}
        />
      ) : null}

      {step === "confirm" ? (
        <LegalConfirmationScreen
          durationSeconds={durationSeconds}
          uploadError={localError}
          isUploading={isUploading}
          onBack={() => setStep(activePreviewUrl ? "preview" : "camera")}
          onConfirmUpload={handleConfirmUpload}
        />
      ) : null}

      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0] ?? null;
          void handleLibraryFile(file);
          event.currentTarget.value = "";
        }}
      />
    </div>
  );

  if (!mounted || typeof document === "undefined") return null;

  return createPortal(captureView, document.body);
}
