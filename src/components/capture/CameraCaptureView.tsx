'use client';

import { useEffect, useRef } from 'react';

import type { CameraStatus } from '@/hooks/useCamera';

export function CameraCaptureView(props: {
  stream: MediaStream | null;
  status: CameraStatus;
  error: string | null;
  isFrontCamera?: boolean;
  onRequestLibrary?: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    video.srcObject = props.stream;
    if (!props.stream) return;

    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {
        // iOS may briefly reject play while camera permission is settling.
      });
    }
  }, [props.stream]);

  if (props.status === 'requesting' || props.status === 'idle' || (props.status === 'ready' && !props.stream)) {
    return (
      <div className="fixed inset-0 z-[100] flex h-[100dvh] w-screen items-center justify-center overflow-hidden bg-black px-8 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.08),transparent_28%),linear-gradient(180deg,#0f1014_0%,#050506_100%)]" />
        <div className="relative max-w-xs">
          <div className="mx-auto h-14 w-14 rounded-full border border-white/12 bg-white/[0.04] p-2.5">
            <div className="foundation-loading-skeleton h-full w-full rounded-full" />
          </div>
          <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/42">Camera</p>
          <p className="mt-3 text-sm leading-relaxed text-white/66">Allow camera and microphone access. BETALENT will not upload anything until you approve the take.</p>
        </div>
      </div>
    );
  }

  if (props.status === 'denied' || props.status === 'unsupported' || props.status === 'error') {
    return (
      <div className="fixed inset-0 z-[100] flex h-[100dvh] w-screen items-center justify-center overflow-hidden bg-black px-8 text-center">
        <div className="max-w-sm">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-100/58">Camera unavailable</p>
          <h3 className="mt-3 text-[1.35rem] font-semibold tracking-[-0.04em] text-white">Secure camera access is required</h3>
          <p className="mt-3 text-sm leading-relaxed text-white/66">{props.error || 'Camera recording is not available here.'}</p>
          {props.onRequestLibrary ? (
            <button
              type="button"
              onClick={props.onRequestLibrary}
              className="mt-5 rounded-full border border-white/14 bg-white/[0.06] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-white/82"
            >
              Choose from library
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] h-[100dvh] w-screen isolate overflow-hidden bg-black">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        disablePictureInPicture
        className={`absolute inset-0 h-full w-full object-cover -z-10 ${props.isFrontCamera ? '-scale-x-100' : ''}`}
      />
    </div>
  );
}
