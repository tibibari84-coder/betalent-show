'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const RECORDER_MIME_TYPES = [
  'video/mp4;codecs=h264,aac',
  'video/webm;codecs=vp9,opus',
  'video/webm;codecs=vp8,opus',
  'video/webm',
];

export const MAX_RECORDING_DURATION_MS = 120_000;

function getRecorderMimeType() {
  if (typeof MediaRecorder === 'undefined' || typeof MediaRecorder.isTypeSupported !== 'function') {
    return undefined;
  }

  return RECORDER_MIME_TYPES.find((type) => MediaRecorder.isTypeSupported(type));
}

export function useRecorder(stream: MediaStream | null, maxDurationMs: number, onRecorded?: () => void) {
  const cappedDurationMs = Math.min(maxDurationMs, MAX_RECORDING_DURATION_MS);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const startedAtRef = useRef(0);
  const maxDurationRef = useRef(cappedDurationMs);
  const onRecordedRef = useRef(onRecorded);
  const autoStopRef = useRef<number | null>(null);
  const tickRef = useRef<number | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    onRecordedRef.current = onRecorded;
  }, [onRecorded]);

  const clearTimers = useCallback(() => {
    if (autoStopRef.current) {
      window.clearTimeout(autoStopRef.current);
      autoStopRef.current = null;
    }

    if (tickRef.current) {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }, []);

  const clearPreview = useCallback(() => {
    setPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return null;
    });
    setRecordedBlob(null);
  }, []);

  const stopRecording = useCallback(() => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === 'inactive') return;

    setElapsedMs(Math.min(maxDurationRef.current, Date.now() - startedAtRef.current));
    recorder.stop();
  }, []);

  const resetRecording = useCallback(() => {
    clearTimers();
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop();
    }
    recorderRef.current = null;
    chunksRef.current = [];
    setIsRecording(false);
    setElapsedMs(0);
    setError(null);
    clearPreview();
  }, [clearPreview, clearTimers]);

  const startRecording = useCallback(() => {
    if (!stream) {
      setError('Camera is not ready yet.');
      return;
    }

    if (typeof MediaRecorder === 'undefined') {
      setError('This browser can open the camera, but it cannot record video here.');
      return;
    }

    const mimeType = getRecorderMimeType();
    chunksRef.current = [];
    clearTimers();
    clearPreview();
    setElapsedMs(0);
    setError(null);

    try {
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      recorderRef.current = recorder;
      maxDurationRef.current = cappedDurationMs;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onerror = () => {
        clearTimers();
        setIsRecording(false);
        setError('Recording failed on this device. Retake or choose a finished video from library.');
      };

      recorder.onstop = () => {
        clearTimers();
        setIsRecording(false);
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'video/webm' });
        setRecordedBlob(blob);
        setPreviewUrl((current) => {
          if (current) URL.revokeObjectURL(current);
          return URL.createObjectURL(blob);
        });
        onRecordedRef.current?.();
      };

      startedAtRef.current = Date.now();
      setIsRecording(true);
      recorder.start(250);

      autoStopRef.current = window.setTimeout(() => {
        stopRecording();
      }, cappedDurationMs);

      tickRef.current = window.setInterval(() => {
        setElapsedMs(Math.min(maxDurationRef.current, Date.now() - startedAtRef.current));
      }, 100);
    } catch {
      setIsRecording(false);
      setError('This device could not start a BETALENT recording session.');
    }
  }, [cappedDurationMs, clearPreview, clearTimers, stopRecording, stream]);

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
      remainingMs: Math.max(0, cappedDurationMs - elapsedMs),
      maxDurationMs: cappedDurationMs,
      error,
      startRecording,
      stopRecording,
      resetRecording,
      clearPreview,
    }),
    [cappedDurationMs, clearPreview, elapsedMs, error, isRecording, previewUrl, recordedBlob, resetRecording, startRecording, stopRecording],
  );
}
