"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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
      facingMode: { ideal: facingMode },
      width: { ideal: 1080 },
      height: { ideal: 1920 },
      aspectRatio: { ideal: 9 / 16 },
      frameRate: { ideal: 30, max: 30 },
    },
    audio: true,
  };
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

export function MobileCaptureFlow({
  onExit,
  onUploadConfirmed,
}: MobileCaptureFlowProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const facingModeRef = useRef<CameraFacingMode>("user");
  const handledRecorderPreviewRef = useRef(false);

  const [step, setStep] = useState<FlowStep>("camera");
  const [durationSeconds, setDurationSeconds] = useState<CaptureDuration>(60);
  const [status, setStatus] = useState<CameraStatus>("idle");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<CameraFacingMode>("user");
  const [cameraSettings, setCameraSettings] = useState<MediaTrackSettings | null>(null);
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

        const nextStream = await navigator.mediaDevices.getUserMedia(
          getCameraConstraints(nextFacingMode),
        );
        const videoTrack = nextStream.getVideoTracks()[0] ?? null;
        const settings = videoTrack?.getSettings() ?? null;

        streamRef.current = nextStream;
        facingModeRef.current = nextFacingMode;
        setFacingMode(nextFacingMode);
        setCameraSettings(settings);
        setStream(nextStream);
        setStatus("ready");
      } catch (error) {
        setCameraError(mapCameraError(error));
        setCameraSettings(null);
        setStream(null);
        setStatus(error instanceof DOMException && error.name === "NotAllowedError" ? "denied" : "error");
      }
    },
    [],
  );

  useEffect(() => {
    queueMicrotask(() => {
      void startCamera("user");
    });

    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, [startCamera]);

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

  return (
    <div className="fixed inset-0 z-[99999] h-[100dvh] w-screen overflow-hidden bg-black text-white touch-none">
      {step === "camera" ? (
        <>
          <CameraPreview
            videoRef={videoRef}
            stream={stream}
            status={status}
            error={cameraError}
            facingMode={facingMode}
            settings={cameraSettings}
            onRetry={() => void startCamera(facingModeRef.current)}
          />

          <CaptureTopBar
            onBack={onExit}
            onExit={onExit}
            isRecording={recorder.isRecording}
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
            onFlip={handleFlip}
            isRecording={recorder.isRecording}
            remainingSeconds={recorder.remainingSeconds}
            progressPercent={recorder.progressPercent}
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
}
