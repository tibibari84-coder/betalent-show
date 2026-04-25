'use client';

import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';

import {
  MobileCaptureFlow,
  uploadVideoToExistingPipeline,
} from '@/components/capture/MobileCaptureFlow';
import { LegalConfirmationStep, type LegalCheckKey } from '@/components/capture/LegalConfirmationStep';
import { ORIGINALS_ONLY_SHORT } from '@/lib/copy/disclaimers';

type LegalChecks = Record<LegalCheckKey, boolean>;
type UploadPhase = 'idle' | 'selected' | 'uploading' | 'processing' | 'failed';
type DeviceMode = 'mobile' | 'desktop';

const DURATION_OPTIONS_MS = [30_000, 60_000, 120_000] as const;

function createEmptyLegalChecks(): LegalChecks {
  return {
    performance: false,
    rights: false,
    platform: false,
  };
}

function formatMegabytes(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getDeviceMode(): DeviceMode {
  if (typeof window === 'undefined') return 'mobile';

  const userAgent = window.navigator.userAgent;
  const isMobileUserAgent = /Android|iPhone|iPad|iPod|Mobile/i.test(userAgent);
  const isTouchDevice = window.navigator.maxTouchPoints > 1;
  const width = window.visualViewport?.width ?? window.innerWidth;
  const isFineDesktopPointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (isMobileUserAgent || isTouchDevice || width < 900) {
    return 'mobile';
  }

  return isFineDesktopPointer ? 'desktop' : 'mobile';
}

function useDeviceMode() {
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('mobile');
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    const update = () => {
      setDeviceMode(getDeviceMode());
      setHasHydrated(true);
    };

    update();
    window.addEventListener('resize', update);
    window.visualViewport?.addEventListener('resize', update);

    return () => {
      window.removeEventListener('resize', update);
      window.visualViewport?.removeEventListener('resize', update);
    };
  }, []);

  return { deviceMode, hasHydrated };
}

export function DirectVideoUploadCard() {
  const router = useRouter();
  const { deviceMode, hasHydrated } = useDeviceMode();
  const isMobile = deviceMode === 'mobile';
  const isDesktop = deviceMode === 'desktop';
  const desktopInputRef = useRef<HTMLInputElement | null>(null);
  const [isCaptureOpen, setIsCaptureOpen] = useState(false);
  const [desktopFile, setDesktopFile] = useState<File | null>(null);
  const [desktopPreviewUrl, setDesktopPreviewUrl] = useState<string | null>(null);
  const [desktopDurationMs, setDesktopDurationMs] = useState<number>(60_000);
  const [legalChecks, setLegalChecks] = useState<LegalChecks>(createEmptyLegalChecks());
  const [phase, setPhase] = useState<UploadPhase>('idle');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (desktopPreviewUrl) URL.revokeObjectURL(desktopPreviewUrl);
    };
  }, [desktopPreviewUrl]);

  useEffect(() => {
    const openCapture = () => {
      setIsCaptureOpen(true);
      setInfo(null);
      setError(null);
    };
    const openCaptureFromHash = () => {
      if (window.location.hash === '#upload-panel') {
        openCapture();
      }
    };

    openCaptureFromHash();

    window.addEventListener('betalent:open-upload-camera', openCapture);
    window.addEventListener('hashchange', openCaptureFromHash);

    return () => {
      window.removeEventListener('betalent:open-upload-camera', openCapture);
      window.removeEventListener('hashchange', openCaptureFromHash);
    };
  }, []);

  function setDesktopPreview(file: File | null) {
    setDesktopPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return file ? URL.createObjectURL(file) : null;
    });
  }

  function resetDesktopSelection() {
    setDesktopFile(null);
    setDesktopPreview(null);
    setLegalChecks(createEmptyLegalChecks());
    setPhase('idle');
    setError(null);
    setInfo(null);
  }

  function onDesktopFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] || null;
    event.target.value = '';
    if (!file) return;

    setDesktopFile(file);
    setDesktopPreview(file);
    setLegalChecks(createEmptyLegalChecks());
    setPhase('selected');
    setError(null);
    setInfo(null);
  }

  function toggleLegalCheck(key: LegalCheckKey, checked: boolean) {
    setLegalChecks((current) => ({ ...current, [key]: checked }));
  }

  function openMobileCapture() {
    setIsCaptureOpen(true);
    setInfo(null);
    setError(null);
  }

  async function submitDesktopUpload() {
    if (!desktopFile) {
      setError('Choose a finished short video before upload.');
      return;
    }

    if (!legalChecks.performance || !legalChecks.rights || !legalChecks.platform) {
      setError('Complete all required confirmations before uploading.');
      return;
    }

    setPhase('uploading');
    setError(null);
    setInfo('Preparing secure upload.');

    try {
      await uploadVideoToExistingPipeline(desktopFile, desktopDurationMs);
      resetDesktopSelection();
      setPhase('processing');
      setInfo('Upload complete. Processing started and this asset will switch to READY automatically.');
      router.refresh();
    } catch (uploadError) {
      setPhase('failed');
      setInfo(null);
      setError(uploadError instanceof Error ? uploadError.message : 'Upload failed.');
    }
  }

  const phaseCopy =
    phase === 'idle'
      ? isMobile
        ? 'Mobile opens directly into BETALENT recording mode. Library import stays secondary.'
        : 'Desktop can import a finished short video. The premium recorder is optimized for mobile.'
      : phase === 'selected'
        ? 'Video selected. Legal confirmation is required before upload.'
        : phase === 'uploading'
          ? 'Uploading now. Keep this screen open until transfer completes.'
          : phase === 'processing'
            ? 'Upload complete. BETALENT processing continues until the asset is READY.'
            : 'Upload did not complete. Review the message and try again.';

  return (
    <>
      {isMobile ? (
        <MobileCaptureFlow
          active={hasHydrated && isCaptureOpen}
          onClose={() => setIsCaptureOpen(false)}
        />
      ) : null}

      <input
        ref={desktopInputRef}
        type="file"
        accept="video/*"
        onChange={onDesktopFileChange}
        className="sr-only"
      />

      <div className="foundation-panel foundation-tint-cobalt rounded-[1.8rem] p-5 sm:rounded-[2rem] sm:p-6" aria-busy={phase === 'uploading'}>
        <p className="foundation-kicker">Uploads</p>
        <h2 className="mt-3 text-[1.45rem] font-semibold tracking-[-0.04em] text-white sm:text-[1.7rem]">
          Create a short-video asset
        </h2>
        <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-white/64 sm:text-sm">
          Record a vertical BETALENT performance, review it locally, confirm rights, then hand it to the existing upload and processing pipeline.
        </p>
        <p className="mt-3 max-w-2xl text-[13px] leading-relaxed text-amber-100/82 sm:text-sm">{ORIGINALS_ONLY_SHORT}</p>

        <div className="mt-5 space-y-4">
          {isMobile ? (
            <div className="rounded-[1.35rem] border border-white/10 bg-black/35 p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-white/48">Mobile capture</p>
              <h3 className="mt-2 text-lg font-semibold tracking-[-0.03em] text-white">
                Open the full-screen camera
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-white/64">
                Full-screen vertical capture with 30, 60, or 120 second limits. Review, confirm rights, then upload.
              </p>
              <button
                type="button"
                onClick={openMobileCapture}
                className="foundation-primary-button mt-4 min-h-[2.9rem] px-4 text-xs font-semibold uppercase tracking-[0.08em]"
              >
                Open camera
              </button>
            </div>
          ) : isDesktop ? (
            <div className="space-y-4 rounded-[1.35rem] border border-white/10 bg-black/35 p-4">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-white/48">Desktop import</p>
                <h3 className="mt-2 text-lg font-semibold tracking-[-0.03em] text-white">
                  Import a finished short video
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/64">
                  Desktop keeps a controlled import path. Mobile remains the camera-first BETALENT recorder.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {DURATION_OPTIONS_MS.map((durationMs) => (
                  <button
                    key={durationMs}
                    type="button"
                    onClick={() => setDesktopDurationMs(durationMs)}
                    disabled={phase === 'uploading'}
                    className={`min-h-10 rounded-full px-4 text-xs font-semibold transition ${
                      desktopDurationMs === durationMs
                        ? 'bg-white text-black'
                        : 'border border-white/14 bg-white/[0.06] text-white/78'
                    } disabled:cursor-not-allowed disabled:opacity-55`}
                  >
                    {durationMs / 1000}s
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => desktopInputRef.current?.click()}
                disabled={phase === 'uploading'}
                className="foundation-primary-button min-h-[2.8rem] px-4 text-xs font-semibold uppercase tracking-[0.08em] disabled:cursor-not-allowed disabled:opacity-55"
              >
                Choose short video
              </button>
            </div>
          ) : null}

          {desktopFile && isDesktop ? (
            <div className="space-y-4 rounded-[1.2rem] border border-white/8 bg-white/[0.03] p-4">
              <div className="flex items-center justify-between gap-3 text-sm text-white/72">
                <span className="min-w-0 truncate">{desktopFile.name}</span>
                <span>{formatMegabytes(desktopFile.size)}</span>
              </div>
              {desktopPreviewUrl ? (
                <video
                  controls
                  playsInline
                  preload="metadata"
                  className="aspect-[9/16] max-h-[34rem] w-full rounded-[1rem] bg-black object-cover"
                  src={desktopPreviewUrl}
                />
              ) : null}
              <LegalConfirmationStep
                checks={legalChecks}
                disabled={phase === 'uploading'}
                isSubmitting={phase === 'uploading'}
                error={error}
                sourceLabel="Desktop import"
                durationLabel={`${desktopDurationMs / 1000}s max`}
                onBack={resetDesktopSelection}
                onSubmit={submitDesktopUpload}
                onToggle={toggleLegalCheck}
              />
            </div>
          ) : null}

          <div className="rounded-[1.1rem] border border-white/8 bg-white/[0.03] px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/50">{phase}</p>
            <p className="mt-2 text-sm leading-relaxed text-white/62">{phaseCopy}</p>
          </div>

          {phase === 'uploading' ? <div className="foundation-loading-skeleton h-2 rounded-full" aria-hidden /> : null}
          {info ? <p className="text-sm text-emerald-300" role="status">{info}</p> : null}
          {error && !(desktopFile && isDesktop) ? <p className="text-sm text-red-300" role="alert">{error}</p> : null}
        </div>
      </div>
    </>
  );
}
