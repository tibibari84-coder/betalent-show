"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CaptureStudioShell } from "@/components/capture/CaptureStudioShell";
import { CameraCaptureView } from "@/components/capture/CameraCaptureView";
import { CaptureControls } from "@/components/capture/CaptureControls";
import { LegalConfirmationStep } from "@/components/capture/LegalConfirmationStep";
import { VideoPreviewView } from "@/components/capture/VideoPreviewView";
import { useCamera } from "@/hooks/useCamera";
import { useRecorder } from "@/hooks/useRecorder";

type FlowStep = "camera" | "preview" | "confirm";

type MobileCaptureFlowProps = {
  onExit: () => void;
  onUploadConfirmed: (file: File) => Promise<void>;
};

type DurationOption = 30 | 60 | 120;

async function readVideoDuration(file: File): Promise<number> {
  const url = URL.createObjectURL(file);

  try {
    const duration = await new Promise<number>((resolve, reject) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.src = url;
      video.onloadedmetadata = () => resolve(video.duration);
      video.onerror = () => reject(new Error("Could not read video duration."));
    });
    return duration;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function MobileCaptureFlow({
  onExit,
  onUploadConfirmed,
}: MobileCaptureFlowProps) {
  const [step, setStep] = useState<FlowStep>("camera");
  const [durationSeconds, setDurationSeconds] = useState<DurationOption>(60);
  const [libraryPreviewUrl, setLibraryPreviewUrl] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const handledRecorderPreviewRef = useRef(false);

  const camera = useCamera({ initialFacingMode: "user" });
  const recorder = useRecorder({
    stream: camera.stream,
    durationSeconds,
  });

  const activePreviewUrl = useMemo(() => {
    if (libraryPreviewUrl) return libraryPreviewUrl;
    return recorder.previewUrl;
  }, [libraryPreviewUrl, recorder.previewUrl]);

  useEffect(() => {
    void camera.startCamera();
    return () => {
      camera.stopCamera();
      if (libraryPreviewUrl) URL.revokeObjectURL(libraryPreviewUrl);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
    void camera.startCamera(camera.facingMode);
  }, [camera, libraryPreviewUrl, recorder]);

  const handleRecord = () => {
    setLocalError(null);
    handledRecorderPreviewRef.current = false;
    recorder.startRecording();
  };

  const handleStop = () => {
    recorder.stopRecording();
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
      setStep("preview");
    } catch {
      setLocalError("BETALENT could not read that video file.");
    }
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
      const message =
        error instanceof Error ? error.message : "Upload could not be completed.";
      setLocalError(message);
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    if (recorder.hasPreview && !libraryPreviewUrl && !handledRecorderPreviewRef.current) {
      handledRecorderPreviewRef.current = true;
      queueMicrotask(() => {
        const file = recorder.createRecordedFile("betalent-take");
        if (file) setPendingFile(file);
        setStep("preview");
      });
    }
  }, [libraryPreviewUrl, recorder]);

  const topBar = (
    <div className="flex items-start justify-between gap-3">
      <button
        type="button"
        onClick={step === "camera" ? onExit : resetToCamera}
        className="flex h-16 w-16 items-center justify-center rounded-full border border-white/12 bg-black/30 text-4xl text-white backdrop-blur-xl"
      >
        ‹
      </button>

      <div className="pt-1 text-center">
        <p className="text-[11px] uppercase tracking-[0.35em] text-white/55">BETALENT</p>
        <h1 className="mt-2 text-[38px] font-semibold leading-none tracking-tight text-white">
          Creator camera
        </h1>
      </div>

      <button
        type="button"
        onClick={onExit}
        className="h-16 rounded-full border border-white/12 bg-black/30 px-6 text-2xl font-semibold text-white backdrop-blur-xl"
      >
        Exit
      </button>
    </div>
  );

  if (step === "confirm") {
    return (
      <LegalConfirmationStep
        durationSeconds={durationSeconds}
        uploadError={localError}
        isUploading={isUploading}
        onBack={() => setStep(activePreviewUrl ? "preview" : "camera")}
        onConfirmUpload={handleConfirmUpload}
      />
    );
  }

  if (step === "preview" && activePreviewUrl) {
    return (
      <CaptureStudioShell
        preview={
          <VideoPreviewView
            previewUrl={activePreviewUrl}
            onRetake={resetToCamera}
            onUseVideo={() => setStep("confirm")}
          />
        }
        topBar={<div />}
        bottomControls={<div />}
        dimPreview={false}
      />
    );
  }

  return (
    <>
      <CaptureStudioShell
        preview={
          <CameraCaptureView
            stream={camera.stream}
            status={camera.status}
            error={camera.error}
            facingMode={camera.facingMode}
            onRetry={() => void camera.startCamera(camera.facingMode)}
          />
        }
        topBar={topBar}
        bottomControls={
          <div className="pb-2">
            {localError && (
              <div className="mb-3 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-base text-red-100">
                {localError}
              </div>
            )}

            <CaptureControls
              durationSeconds={durationSeconds}
              onDurationChange={(next) => setDurationSeconds(next)}
              onRecord={handleRecord}
              onStop={handleStop}
              onLibrary={handlePickLibrary}
              onFlip={() => void camera.switchCamera()}
              isRecording={recorder.isRecording}
              remainingSeconds={recorder.remainingSeconds}
              progressPercent={recorder.progressPercent}
            />
          </div>
        }
      />

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
    </>
  );
}
