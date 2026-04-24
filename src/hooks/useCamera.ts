'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export type CameraStatus = 'idle' | 'requesting' | 'ready' | 'denied' | 'unsupported' | 'error';
export type CameraFacingMode = 'user' | 'environment';

function stopStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop());
}

export function useCamera() {
  const streamRef = useRef<MediaStream | null>(null);
  const requestTimeoutRef = useRef<number | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [status, setStatus] = useState<CameraStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<CameraFacingMode>('environment');

  const isSupported =
    typeof window !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    window.isSecureContext &&
    Boolean(navigator.mediaDevices?.getUserMedia);

  const stopCamera = useCallback(() => {
    if (requestTimeoutRef.current) {
      window.clearTimeout(requestTimeoutRef.current);
      requestTimeoutRef.current = null;
    }
    stopStream(streamRef.current);
    streamRef.current = null;
    setStream(null);
    setStatus('idle');
  }, []);

  const startCamera = useCallback(async (nextFacingMode: CameraFacingMode = facingMode) => {
    if (!isSupported) {
      setStatus('unsupported');
      setError(
        typeof window !== 'undefined' && !window.isSecureContext
          ? 'Camera recording requires a secure browser session. Open BETALENT over HTTPS to record here, or choose a finished short video from your library.'
          : 'Camera recording is not supported in this browser. Choose a finished short video from your library instead.',
      );
      return;
    }

    stopStream(streamRef.current);
    streamRef.current = null;
    setStream(null);
    setStatus('requesting');
    setError(null);
    setFacingMode(nextFacingMode);

    if (requestTimeoutRef.current) {
      window.clearTimeout(requestTimeoutRef.current);
    }
    requestTimeoutRef.current = window.setTimeout(() => {
      if (!streamRef.current) {
        setStatus('error');
        setError('Camera did not start. Allow camera access in the browser, or choose a finished short video from your library.');
      }
    }, 7000);

    try {
      const nextStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
        video: {
          facingMode: { ideal: nextFacingMode },
          width: { ideal: 720 },
          height: { ideal: 1280 },
          aspectRatio: { ideal: 9 / 16 },
          frameRate: { ideal: 30, max: 30 },
        },
      });

      streamRef.current = nextStream;
      if (requestTimeoutRef.current) {
        window.clearTimeout(requestTimeoutRef.current);
        requestTimeoutRef.current = null;
      }
      setStream(nextStream);
      setStatus('ready');
    } catch (cameraError) {
      if (requestTimeoutRef.current) {
        window.clearTimeout(requestTimeoutRef.current);
        requestTimeoutRef.current = null;
      }
      const isPermissionDenied =
        cameraError instanceof DOMException &&
        (cameraError.name === 'NotAllowedError' || cameraError.name === 'SecurityError');

      setStatus(isPermissionDenied ? 'denied' : 'error');
      setError(
        isPermissionDenied
          ? 'Camera permission was denied. You can still choose a finished short video from your library.'
          : 'BETALENT could not open the camera on this device.',
      );
    }
  }, [facingMode, isSupported]);

  const switchCamera = useCallback(() => {
    const nextFacingMode = facingMode === 'environment' ? 'user' : 'environment';
    void startCamera(nextFacingMode);
  }, [facingMode, startCamera]);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  return useMemo(
    () => ({
      stream,
      status,
      error,
      facingMode,
      isFrontCamera: facingMode === 'user',
      isSupported,
      startCamera,
      stopCamera,
      switchCamera,
    }),
    [error, facingMode, isSupported, startCamera, status, stopCamera, stream, switchCamera],
  );
}
