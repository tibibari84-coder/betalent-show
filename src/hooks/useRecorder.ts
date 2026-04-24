'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const DEFAULT_MAX_DURATION_MS = 120_000;

function selectRecorderMimeType() {
  if (typeof MediaRecorder === 'undefined' || typeof MediaRecorder.isTypeSupported !== 'function') {
    return undefined;
  }

  const preferredTypes = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'];
  return preferredTypes.find((type) => MediaRecorder.isTypeSupported(type));
}

export function useRecorder(stream: MediaStream | null, maxDurationMs = DEFAULT_MAX_DURATION_MS) {
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunkRef = useRef<BlobPart[]>([]);
  const timeoutRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);
  const startedAtRef = useRef<number>(0);
  const activeDurationMsRef = useRef<number>(maxDurationMs);

  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const clearTimers = useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const stopRecording = useCallback(() => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === 'inactive') return;
    recorder.stop();
  }, []);

  const resetRecording = useCallback(() => {
    clearTimers();
    setIsRecording(false);
    setElapsedMs(0);
    setRecordedBlob(null);
    setPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return null;
    });
    setError(null);
  }, [clearTimers]);

  const startRecording = useCallback(() => {
    if (!stream) {
      setError('Camera stream is not available yet.');
      return;
    }
    if (typeof MediaRecorder === 'undefined') {
      setError('This browser cannot record video from camera stream.');
      return;
    }

    setError(null);
    setRecordedBlob(null);
    setPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return null;
    });
    setElapsedMs(0);

    chunkRef.current = [];
    const recorder = new MediaRecorder(stream, {
      mimeType: selectRecorderMimeType(),
    });
    recorderRef.current = recorder;

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunkRef.current.push(event.data);
      }
    };

    recorder.onerror = () => {
      setError('Recording failed on this device. You can retry or import from library.');
      clearTimers();
      setIsRecording(false);
    };

    recorder.onstop = () => {
      clearTimers();
      setIsRecording(false);
      const blob = new Blob(chunkRef.current, { type: recorder.mimeType || 'video/webm' });
      setRecordedBlob(blob);
      setPreviewUrl((current) => {
        if (current) URL.revokeObjectURL(current);
        return URL.createObjectURL(blob);
      });
    };

    startedAtRef.current = Date.now();
    activeDurationMsRef.current = maxDurationMs;
    setIsRecording(true);
    recorder.start(250);

    timeoutRef.current = window.setTimeout(() => {
      stopRecording();
    }, activeDurationMsRef.current);

    intervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startedAtRef.current;
      setElapsedMs(Math.min(activeDurationMsRef.current, elapsed));
    }, 200);
  }, [clearTimers, maxDurationMs, stopRecording, stream]);

  useEffect(() => {
    if (!stream && isRecording) {
      stopRecording();
    }
  }, [isRecording, stopRecording, stream]);

  useEffect(() => {
    return () => {
      clearTimers();
      setPreviewUrl((current) => {
        if (current) URL.revokeObjectURL(current);
        return null;
      });
    };
  }, [clearTimers]);

  return useMemo(
    () => ({
      isRecording,
      recordedBlob,
      previewUrl,
      elapsedMs,
      remainingMs: Math.max(0, maxDurationMs - elapsedMs),
      maxDurationMs,
      error,
      startRecording,
      stopRecording,
      resetRecording,
    }),
    [elapsedMs, error, isRecording, maxDurationMs, previewUrl, recordedBlob, resetRecording, startRecording, stopRecording],
  );
}
