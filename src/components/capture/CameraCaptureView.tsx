'use client';

import { useEffect, useRef } from 'react';

import type { CameraStatus } from '@/hooks/useCamera';

export function CameraCaptureView(props: {
  stream: MediaStream | null;
  status: CameraStatus;
  error: string | null;
  isFrontCamera?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!videoRef.current) return;
    if (!props.stream) {
      videoRef.current.srcObject = null;
      return;
    }
    videoRef.current.srcObject = props.stream;
  }, [props.stream]);

  if (props.status === 'requesting') {
    return (
      <div className="flex aspect-[9/16] items-center justify-center rounded-[1.2rem] border border-white/12 bg-black/40 p-6 text-center text-sm text-white/66">
        Requesting camera access...
      </div>
    );
  }

  if (props.status === 'denied' || props.status === 'unsupported' || props.status === 'error') {
    return (
      <div className="flex aspect-[9/16] items-center justify-center rounded-[1.2rem] border border-amber-300/25 bg-amber-300/[0.08] p-6 text-center text-sm text-amber-100/90">
        {props.error || 'Camera is not available on this device.'}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[1.2rem] border border-white/12 bg-black/60">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className={`aspect-[9/16] w-full bg-black object-cover ${props.isFrontCamera ? '-scale-x-100' : ''}`}
      />
    </div>
  );
}
