'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

export type CameraStatus = 'idle' | 'requesting' | 'ready' | 'denied' | 'unsupported' | 'error';
type FacingMode = 'user' | 'environment';

export function useCamera() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [status, setStatus] = useState<CameraStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [isFrontCamera, setIsFrontCamera] = useState(false);
  const [preferredFacingMode, setPreferredFacingMode] = useState<FacingMode>('environment');

  const isSupported =
    typeof window !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    Boolean(navigator.mediaDevices?.getUserMedia);

  const stopCamera = useCallback(() => {
    setStream((current) => {
      current?.getTracks().forEach((track) => track.stop());
      return null;
    });
    setStatus('idle');
    setIsFrontCamera(false);
  }, []);

  const startCamera = useCallback(async (nextFacingMode?: FacingMode) => {
    if (!isSupported) {
      setStatus('unsupported');
      setError('Camera capture is not supported in this browser.');
      return;
    }

    setStatus('requesting');
    setError(null);

    const targetFacingMode = nextFacingMode ?? preferredFacingMode;
    if (nextFacingMode) {
      setPreferredFacingMode(nextFacingMode);
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: targetFacingMode },
          aspectRatio: { ideal: 9 / 16 },
          width: { ideal: 720 },
          height: { ideal: 1280 },
        },
        audio: true,
      });

      const videoTrack = mediaStream.getVideoTracks()[0];
      const facingMode = videoTrack?.getSettings().facingMode;
      setIsFrontCamera(facingMode === 'user');
      setStream(mediaStream);
      setStatus('ready');
    } catch (cameraError) {
      if (cameraError instanceof DOMException && cameraError.name === 'NotAllowedError') {
        setStatus('denied');
        setError('Camera permission was denied. You can still import a video from your library.');
        return;
      }

      setStatus('error');
      setError('BETALENT could not initialize the camera on this device.');
    }
  }, [isSupported, preferredFacingMode]);

  const switchCamera = useCallback(() => {
    const nextFacingMode = preferredFacingMode === 'environment' ? 'user' : 'environment';
    stopCamera();
    void startCamera(nextFacingMode);
  }, [preferredFacingMode, startCamera, stopCamera]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return useMemo(
    () => ({
      stream,
      status,
      error,
      isFrontCamera,
      isSupported,
      preferredFacingMode,
      startCamera,
      stopCamera,
      switchCamera,
    }),
    [stream, status, error, isFrontCamera, isSupported, preferredFacingMode, startCamera, stopCamera, switchCamera],
  );
}
