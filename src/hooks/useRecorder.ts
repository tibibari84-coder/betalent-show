"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type RecorderState = "idle" | "recording" | "preview";

const MIME_TYPES = [
  "video/mp4;codecs=h264,aac",
  "video/webm;codecs=vp9,opus",
  "video/webm;codecs=vp8,opus",
  "video/webm",
  "",
];

function getSupportedMimeType(): string {
  if (typeof MediaRecorder === "undefined") return "";
  return MIME_TYPES.find((type) => !type || MediaRecorder.isTypeSupported(type)) ?? "";
}

type UseRecorderOptions = {
  stream: MediaStream | null;
  durationSeconds: number;
};

export function useRecorder({ stream, durationSeconds }: UseRecorderOptions) {
  const [state, setState] = useState<RecorderState>("idle");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(durationSeconds);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const stopTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tickIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const selectedMimeType = useMemo(() => getSupportedMimeType(), []);
  const progressPercent = useMemo(() => {
    const elapsed = durationSeconds - remainingSeconds;
    return Math.max(0, Math.min(100, (elapsed / durationSeconds) * 100));
  }, [durationSeconds, remainingSeconds]);

  const clearTimers = useCallback(() => {
    if (stopTimeoutRef.current) {
      clearTimeout(stopTimeoutRef.current);
      stopTimeoutRef.current = null;
    }
    if (tickIntervalRef.current) {
      clearInterval(tickIntervalRef.current);
      tickIntervalRef.current = null;
    }
  }, []);

  const clearPreview = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setRecordedBlob(null);
  }, [previewUrl]);

  const stopRecording = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
    clearTimers();
  }, [clearTimers]);

  const resetRecording = useCallback(() => {
    stopRecording();
    clearPreview();
    setRemainingSeconds(durationSeconds);
    setError(null);
    setState("idle");
  }, [clearPreview, durationSeconds, stopRecording]);

  const startRecording = useCallback(() => {
    if (!stream) {
      setError("Camera is not ready yet.");
      return;
    }

    setError(null);
    clearPreview();
    chunksRef.current = [];

    try {
      const recorder = selectedMimeType
        ? new MediaRecorder(stream, { mimeType: selectedMimeType })
        : new MediaRecorder(stream);

      recorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blobType = selectedMimeType || "video/webm";
        const blob = new Blob(chunksRef.current, { type: blobType });
        const url = URL.createObjectURL(blob);

        setRecordedBlob(blob);
        setPreviewUrl(url);
        setState("preview");
        clearTimers();
      };

      recorder.start(250);
      setState("recording");
      setRemainingSeconds(durationSeconds);

      const startedAt = Date.now();

      tickIntervalRef.current = setInterval(() => {
        const elapsedMs = Date.now() - startedAt;
        const nextRemaining = Math.max(0, durationSeconds - Math.floor(elapsedMs / 1000));
        setRemainingSeconds(nextRemaining);
      }, 250);

      stopTimeoutRef.current = setTimeout(() => {
        stopRecording();
      }, durationSeconds * 1000);
    } catch {
      setError("Recording could not start on this device.");
    }
  }, [clearPreview, clearTimers, durationSeconds, selectedMimeType, stopRecording, stream]);

  const createRecordedFile = useCallback(
    (prefix = "betalent-performance") => {
      if (!recordedBlob) return null;

      const extension = recordedBlob.type.includes("mp4") ? "mp4" : "webm";
      return new File([recordedBlob], `${prefix}-${Date.now()}.${extension}`, {
        type: recordedBlob.type || `video/${extension}`,
      });
    },
    [recordedBlob],
  );

  useEffect(() => {
    return () => {
      clearTimers();
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [clearTimers, previewUrl]);

  return {
    state,
    error,
    previewUrl,
    recordedBlob,
    remainingSeconds,
    progressPercent,
    startRecording,
    stopRecording,
    resetRecording,
    createRecordedFile,
    isRecording: state === "recording",
    hasPreview: state === "preview" && !!previewUrl,
  };
}
