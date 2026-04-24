'use client';

import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { CameraCaptureView } from '@/components/capture/CameraCaptureView';
import { CaptureControls } from '@/components/capture/CaptureControls';
import { CaptureStudioShell } from '@/components/capture/CaptureStudioShell';
import { LegalConfirmationStep } from '@/components/capture/LegalConfirmationStep';
import { VideoPreviewView } from '@/components/capture/VideoPreviewView';
import { ORIGINALS_ONLY_SHORT } from '@/lib/copy/disclaimers';
import { useCamera } from '@/hooks/useCamera';
import { useRecorder } from '@/hooks/useRecorder';

type UploadPhase = 'idle' | 'selected' | 'uploading' | 'processing' | 'ready' | 'failed';
type StudioStep = 'capture' | 'review' | 'legal' | 'processing';
type StudioState =
  | 'permission-request'
  | 'ready'
  | 'recording'
  | 'reviewing-preview'
  | 'legal-confirm'
  | 'uploading'
  | 'processing'
  | 'failed';

type UploadState = {
  error: string | null;
  info: string | null;
  isUploading: boolean;
  phase: UploadPhase;
};

type LegalChecks = {
  performance: boolean;
  rights: boolean;
  platform: boolean;
};

const RECORDING_DURATION_OPTIONS = [30_000, 60_000, 120_000] as const;

function formatMegabytes(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function createEmptyLegalChecks(): LegalChecks {
  return {
    performance: false,
    rights: false,
    platform: false,
  };
}

function StudioProcessingView() {
  return (
    <div className="mx-auto flex aspect-[9/16] h-[62vh] min-h-[24rem] max-h-[44rem] w-auto max-w-full items-center justify-center overflow-hidden rounded-[2rem] border border-white/10 bg-black/92 p-6 text-center shadow-[0_32px_90px_-42px_rgba(0,0,0,1)]">
      <div className="max-w-xs space-y-4">
        <div className="mx-auto h-14 w-14 rounded-full border border-white/14 bg-white/[0.05] p-3">
          <div className="foundation-loading-skeleton h-full w-full rounded-full" />
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/48">Processing</p>
          <h3 className="mt-2 text-[1.1rem] font-semibold tracking-[-0.03em] text-white">Your short video is moving into BETALENT</h3>
          <p className="mt-2 text-sm leading-relaxed text-white/62">
            Upload completed. Processing, thumbnails, and ready-state updates continue in the existing media pipeline.
          </p>
        </div>
      </div>
    </div>
  );
}

export function DirectVideoUploadCard() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [isCaptureStudioOpen, setIsCaptureStudioOpen] = useState(false);
  const [selectedDurationMs, setSelectedDurationMs] = useState<number>(60_000);
  const [studioStep, setStudioStep] = useState<StudioStep>('capture');
  const [legalChecks, setLegalChecks] = useState<LegalChecks>(createEmptyLegalChecks());
  const [hasManuallyClosedStudio, setHasManuallyClosedStudio] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const libraryInputRef = useRef<HTMLInputElement | null>(null);
  const [state, setState] = useState<UploadState>({
    error: null,
    info: null,
    isUploading: false,
    phase: 'idle',
  });

  const camera = useCamera();
  const recorder = useRecorder(camera.stream, selectedDurationMs);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 768px)');
    const update = () => {
      const nextIsMobile = media.matches;
      setIsMobileViewport(nextIsMobile);

      if (nextIsMobile && !hasManuallyClosedStudio && !file && !recorder.previewUrl && state.phase !== 'processing') {
        setIsCaptureStudioOpen(true);
      }

      if (!nextIsMobile) {
        setIsCaptureStudioOpen(false);
      }
    };

    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, [file, hasManuallyClosedStudio, recorder.previewUrl, state.phase]);

  useEffect(() => {
    if (!isMobileViewport || !isCaptureStudioOpen) return;

    const previousBodyOverflow = document.body.style.overflow;
    const previousRootOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousRootOverflow;
    };
  }, [isCaptureStudioOpen, isMobileViewport]);

  useEffect(() => {
    const shouldRunCamera =
      isMobileViewport &&
      isCaptureStudioOpen &&
      studioStep === 'capture' &&
      !recorder.previewUrl &&
      !file &&
      !state.isUploading;

    if (!shouldRunCamera) {
      if (camera.stream) {
        camera.stopCamera();
      }
      return;
    }

    if (camera.status === 'idle') {
      void camera.startCamera();
    }
  }, [
    camera,
    file,
    isCaptureStudioOpen,
    isMobileViewport,
    recorder.previewUrl,
    state.isUploading,
    studioStep,
  ]);

  useEffect(() => {
    return () => {
      if (filePreviewUrl) {
        URL.revokeObjectURL(filePreviewUrl);
      }
    };
  }, [filePreviewUrl]);

  function replaceFilePreviewUrl(nextFile: File | null) {
    setFilePreviewUrl((current) => {
      if (current) {
        URL.revokeObjectURL(current);
      }
      return nextFile ? URL.createObjectURL(nextFile) : null;
    });
  }

  function resetLegalChecks() {
    setLegalChecks(createEmptyLegalChecks());
  }

  function openCaptureStudio() {
    setHasManuallyClosedStudio(false);
    setStudioStep(file ? 'legal' : recorder.previewUrl ? 'review' : state.phase === 'processing' ? 'processing' : 'capture');
    setIsCaptureStudioOpen(true);
  }

  function closeCaptureStudio() {
    if (recorder.isRecording) {
      recorder.stopRecording();
    }
    setHasManuallyClosedStudio(true);
    setIsCaptureStudioOpen(false);
    camera.stopCamera();
  }

  function setSelectedFile(nextFile: File | null, source: 'capture' | 'library') {
    setFile(nextFile);
    replaceFilePreviewUrl(nextFile);
    resetLegalChecks();
    setState({
      error: null,
      info: null,
      isUploading: false,
      phase: nextFile ? 'selected' : 'idle',
    });

    if (!nextFile) {
      setStudioStep('capture');
      return;
    }

    if (isMobileViewport) {
      setHasManuallyClosedStudio(false);
      setIsCaptureStudioOpen(true);
      setStudioStep(source === 'capture' ? 'review' : 'legal');
    }
  }

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0] || null;
    setSelectedFile(nextFile, 'library');
    recorder.resetRecording();
  }

  function finalizeRecordedVideo() {
    if (!recorder.recordedBlob) {
      setState({
        error: 'Record a performance first, or choose one from library.',
        info: null,
        isUploading: false,
        phase: 'idle',
      });
      return;
    }

    const type = recorder.recordedBlob.type || 'video/webm';
    const ext = type.includes('mp4') ? 'mp4' : 'webm';
    const recordedFile = new File([recorder.recordedBlob], `performance-${Date.now()}.${ext}`, { type });

    setSelectedFile(recordedFile, 'capture');
    setStudioStep('legal');
  }

  async function onSubmit() {
    if (!file) {
      setState({
        error: 'Record a performance first, or choose one from library.',
        info: null,
        isUploading: false,
        phase: 'idle',
      });
      return;
    }

    if (!legalChecks.performance || !legalChecks.rights || !legalChecks.platform) {
      setState({
        error: 'Complete all required confirmations before uploading this short video.',
        info: null,
        isUploading: false,
        phase: 'selected',
      });
      return;
    }

    setState({
      error: null,
      info: 'Preparing secure upload…',
      isUploading: true,
      phase: 'uploading',
    });
    setStudioStep('processing');

    try {
      const initResponse = await fetch('/api/assets/stream-init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          mimeType: file.type || 'video/mp4',
          size: file.size,
          maxDurationSeconds: Math.floor(selectedDurationMs / 1000),
          originalityConfirmed: true,
        }),
      });

      const initData = (await initResponse.json()) as {
        error?: string;
        upload?: { url: string; formField: string };
      };

      if (!initResponse.ok || !initData.upload) {
        if (initResponse.status === 503) {
          throw new Error('Upload service is unavailable in this environment.');
        }
        if (initResponse.status === 409) {
          throw new Error(initData.error || 'Finish onboarding before starting uploads.');
        }
        throw new Error(initData.error || 'Unable to initialize upload.');
      }

      const form = new FormData();
      form.append(initData.upload.formField, file);

      const uploadResponse = await fetch(initData.upload.url, {
        method: 'POST',
        body: form,
      });

      if (!uploadResponse.ok) {
        throw new Error('Direct upload to Cloudflare Stream failed.');
      }

      setState({
        error: null,
        info: 'Upload complete. Processing started and this asset will switch to READY automatically.',
        isUploading: false,
        phase: 'processing',
      });
      setFile(null);
      replaceFilePreviewUrl(null);
      resetLegalChecks();
      recorder.resetRecording();
      router.refresh();
    } catch (error) {
      setStudioStep('legal');
      setState({
        error: error instanceof Error ? error.message : 'Upload failed.',
        info: null,
        isUploading: false,
        phase: 'failed',
      });
    }
  }

  function handleRetake() {
    setFile(null);
    replaceFilePreviewUrl(null);
    resetLegalChecks();
    recorder.resetRecording();
    setStudioStep('capture');
    setHasManuallyClosedStudio(false);
    setIsCaptureStudioOpen(true);
  }

  const phaseChip =
    state.phase === 'idle'
      ? 'Idle'
      : state.phase === 'selected'
        ? 'Selected'
        : state.phase === 'uploading'
          ? 'Uploading'
          : state.phase === 'processing'
            ? 'Processing'
            : state.phase === 'ready'
              ? 'Ready'
              : 'Needs retry';

  const phaseCopy =
    state.phase === 'idle'
      ? 'Record a short vertical performance to begin.'
      : state.phase === 'selected'
        ? 'Take selected. Confirm upload to start processing.'
        : state.phase === 'uploading'
          ? 'Uploading now. Keep this screen open until transfer completes.'
          : state.phase === 'processing'
            ? 'Transfer completed. BETALENT is preparing playback and thumbnail delivery.'
            : state.phase === 'ready'
              ? 'Asset is ready for submission attachment.'
              : 'Upload did not complete. Review the message and try again.';

  const isCameraUnavailable = camera.status === 'denied' || camera.status === 'unsupported' || camera.status === 'error';
  const selectedDurationSeconds = Math.floor(selectedDurationMs / 1000);
  const cameraModeLabel = camera.isFrontCamera ? 'Front camera' : 'Rear camera';
  const selectedSourceLabel = file
    ? file.name.startsWith('performance-')
      ? 'Recorded in studio'
      : 'Imported clip'
    : 'No clip selected';

  const studioState: StudioState =
    state.isUploading
      ? 'uploading'
      : state.phase === 'processing' || studioStep === 'processing'
        ? 'processing'
        : studioStep === 'legal'
          ? 'legal-confirm'
          : studioStep === 'review' || Boolean(recorder.previewUrl)
            ? 'reviewing-preview'
            : recorder.isRecording
              ? 'recording'
              : camera.status === 'requesting'
                ? 'permission-request'
                : isCameraUnavailable || state.phase === 'failed'
                  ? 'failed'
                  : 'ready';

  const studioTitle =
    studioState === 'permission-request'
      ? 'Requesting camera'
      : studioState === 'recording'
        ? 'Recording performance'
        : studioState === 'reviewing-preview'
          ? 'Review your take'
          : studioState === 'legal-confirm'
            ? 'Confirm rights and upload'
            : studioState === 'uploading'
              ? 'Uploading short video'
              : studioState === 'processing'
                ? 'Processing upload'
                : studioState === 'failed'
                  ? 'Camera fallback'
                  : 'Creator camera';

  const studioSubtitle =
    studioState === 'permission-request'
      ? 'BETALENT is opening the mobile camera surface.'
      : studioState === 'recording'
        ? `The take stops exactly at ${selectedDurationSeconds} seconds.`
        : studioState === 'reviewing-preview'
          ? 'Retake immediately or continue into legal confirmation.'
          : studioState === 'legal-confirm'
            ? 'Finish the required confirmations before the existing upload pipeline starts.'
            : studioState === 'uploading'
              ? 'The selected take is handing off to secure upload.'
              : studioState === 'processing'
                ? 'Upload complete. Processing continues in the background.'
                : studioState === 'failed'
                  ? 'Use the premium fallback path if camera access is unavailable.'
                  : `Select ${selectedDurationSeconds} seconds, record, review, then upload.`;

  const mobileCaptureUi =
    isMobileViewport && isCaptureStudioOpen ? (
      <CaptureStudioShell
        eyebrow="BETALENT uploads"
        title={studioTitle}
        subtitle={studioSubtitle}
        onClose={closeCaptureStudio}
        stage={
          studioState === 'reviewing-preview' || studioState === 'legal-confirm'
            ? (
                filePreviewUrl || recorder.previewUrl
                  ? <VideoPreviewView previewUrl={filePreviewUrl || recorder.previewUrl || ''} onRetake={handleRetake} onUseVideo={finalizeRecordedVideo} fullscreen />
                  : <StudioProcessingView />
              )
            : studioState === 'processing' || studioState === 'uploading'
              ? <StudioProcessingView />
              : <CameraCaptureView stream={camera.stream} status={camera.status} error={camera.error} isFrontCamera={camera.isFrontCamera} fullscreen />
        }
        footer={
          studioState === 'legal-confirm' ? (
            <div className="space-y-3">
              {state.error ? (
                <p className="rounded-[1rem] border border-red-500/20 bg-red-500/[0.08] px-4 py-3 text-sm text-red-100">
                  {state.error}
                </p>
              ) : null}
              <div className="rounded-[1.2rem] border border-white/10 bg-black/42 px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/58">
                {selectedSourceLabel} · {selectedDurationSeconds} sec cap
              </div>
              <LegalConfirmationStep
                checks={legalChecks}
                disabled={state.isUploading}
                isSubmitting={state.isUploading}
                onBack={() => setStudioStep('review')}
                onSubmit={onSubmit}
                onToggle={(key, checked) => setLegalChecks((current) => ({ ...current, [key]: checked }))}
              />
            </div>
          ) : studioState === 'reviewing-preview' ? (
            <div className="rounded-[1.35rem] border border-white/10 bg-black/42 p-4 backdrop-blur-xl">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/48">Review</p>
                  <p className="mt-1 text-sm leading-relaxed text-white/68">
                    Instant preview before upload. Keep the best take only.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleRetake}
                    className="rounded-full border border-white/14 bg-white/[0.05] px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white/80"
                  >
                    Retake
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (file) {
                        setStudioStep('legal');
                        return;
                      }
                      finalizeRecordedVideo();
                    }}
                    className="foundation-primary-button min-h-[2.9rem] rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-[0.08em]"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          ) : studioState === 'processing' || studioState === 'uploading' ? (
            <div className="rounded-[1.35rem] border border-white/10 bg-black/42 p-4 backdrop-blur-xl">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/48">Destination</p>
                  <p className="mt-1 text-sm leading-relaxed text-white/68">
                    Uploads prepares the video, submissions moves it into review, and accepted work can later flow to discovery and public surfaces.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Link href="/app/submissions#submission-workspace" className="foundation-primary-button min-h-[2.9rem] rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em]">
                    Open submissions
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setState((current) => ({ ...current, phase: 'idle' }));
                      setStudioStep('capture');
                      setHasManuallyClosedStudio(false);
                    }}
                    className="rounded-full border border-white/14 bg-white/[0.05] px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white/80"
                  >
                    Record another
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {state.error ? (
                <p className="rounded-[1rem] border border-red-500/20 bg-red-500/[0.08] px-4 py-3 text-sm text-red-100">
                  {state.error}
                </p>
              ) : null}
              <div className="rounded-[1.35rem] border border-white/10 bg-black/42 p-4 backdrop-blur-xl">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/48">
                      {studioState === 'recording' ? 'Recording' : studioState === 'failed' ? 'Fallback path' : 'Camera ready'}
                    </p>
                    <p className="mt-1 text-[15px] font-semibold tracking-[-0.03em] text-white">
                      {studioState === 'failed' ? 'Camera access is limited on this device' : 'Premium short-video capture'}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-white/62">
                      {studioState === 'recording'
                        ? `The take auto-stops at ${selectedDurationSeconds} seconds and moves straight into review.`
                        : studioState === 'failed'
                          ? 'The file picker stays secondary, but it is ready if camera permissions or support fall short.'
                          : 'Duration first, recording second, legal confirmation after review.'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/48">Mode</p>
                    <p className="mt-1 text-sm font-semibold text-white">{cameraModeLabel}</p>
                    <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-white/54">
                      {studioState === 'recording' ? `${Math.ceil(recorder.elapsedMs / 1000)} / ${selectedDurationSeconds} sec` : `${selectedDurationSeconds} sec`}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/60">
                  <span className="rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1">Camera-first</span>
                  <span className="rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1">Short-form only</span>
                  <span className="rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1">{selectedDurationSeconds} sec max</span>
                </div>
              </div>

              {isCameraUnavailable ? (
                <div className="rounded-[1.15rem] border border-amber-300/25 bg-black/55 px-4 py-3 backdrop-blur-xl">
                  <p className="text-sm text-amber-100/90">
                    BETALENT cannot open camera capture here. Use the fallback import path without turning uploads into a generic file-picker-first product.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="rounded-full border border-white/14 bg-white/[0.08] px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white/80"
                    >
                      Quick capture import
                    </button>
                    <button
                      type="button"
                      onClick={() => libraryInputRef.current?.click()}
                      className="rounded-full border border-white/14 bg-white/[0.08] px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white/80"
                    >
                      Choose from library
                    </button>
                  </div>
                </div>
              ) : null}

              <CaptureControls
                canRecord={camera.status === 'ready' && !state.isUploading}
                isRecording={recorder.isRecording}
                elapsedMs={recorder.elapsedMs}
                remainingMs={recorder.remainingMs}
                maxDurationMs={recorder.maxDurationMs}
                durationOptions={[...RECORDING_DURATION_OPTIONS]}
                selectedDurationMs={selectedDurationMs}
                canSwitchCamera={!state.isUploading && !recorder.isRecording}
                onStart={recorder.startRecording}
                onStop={recorder.stopRecording}
                onRequestLibrary={() => libraryInputRef.current?.click()}
                onSelectDuration={setSelectedDurationMs}
                onSwitchCamera={camera.switchCamera}
              />

              {!isCameraUnavailable ? (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="rounded-full border border-white/14 bg-white/[0.05] px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white/80"
                  >
                    Import via device camera
                  </button>
                  <button
                    type="button"
                    onClick={() => libraryInputRef.current?.click()}
                    className="rounded-full border border-white/14 bg-white/[0.05] px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white/80"
                  >
                    Choose from library
                  </button>
                </div>
              ) : null}
            </div>
          )
        }
      />
    ) : null;

  return (
    <>
      {mobileCaptureUi}

      <div className="foundation-panel foundation-tint-cobalt rounded-[1.8rem] p-5 sm:rounded-[2rem] sm:p-6" aria-busy={state.isUploading}>
        <p className="foundation-kicker">Add Media</p>
        <h2 className="mt-3 text-[1.45rem] font-semibold tracking-[-0.04em] text-white sm:text-[1.7rem]">Compose the next short performance</h2>
        <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-white/64 sm:text-sm">
          BETALENT uploads is now a camera-first short-video workflow: record, review, confirm rights, upload, process, then move into submissions and public short-video surfaces.
        </p>
        <p className="mt-3 max-w-2xl text-[13px] leading-relaxed text-amber-100/82 sm:text-sm">
          {ORIGINALS_ONLY_SHORT}
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.1em] text-white/62">
          <span className="rounded-full border border-white/12 bg-white/[0.05] px-3 py-1">Mobile camera-first</span>
          <span className="rounded-full border border-white/12 bg-white/[0.05] px-3 py-1">30 / 60 / 120s</span>
          <span className="rounded-full border border-white/12 bg-white/[0.05] px-3 py-1">Review before upload</span>
        </div>

        <div className="mt-4 space-y-4">
          <input
            ref={cameraInputRef}
            type="file"
            accept="video/*"
            capture="environment"
            onChange={onFileChange}
            className="sr-only"
          />
          <input ref={libraryInputRef} type="file" accept="video/*" onChange={onFileChange} className="sr-only" />

          {isMobileViewport ? (
            <div className="rounded-[1.2rem] border border-white/10 bg-black/35 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.12em] text-white/50">Mobile capture</p>
                  <h3 className="mt-2 text-lg font-semibold text-white">Camera-first creator flow</h3>
                  <p className="mt-2 max-w-lg text-sm leading-relaxed text-white/66">
                    Open the studio, select duration, record, review, confirm rights, then let the existing pipeline process the short video.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openCaptureStudio}
                  className="foundation-primary-button min-h-[2.9rem] rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em]"
                >
                  Open studio
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-[1.1rem] border border-white/10 bg-black/35 p-4">
              <p className="text-sm text-white/70">
                Desktop keeps the same backend pipeline, but mobile remains the primary creator surface for short-form capture.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="foundation-primary-button min-h-[2.8rem] rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em]"
                >
                  Record performance
                </button>
                <button
                  type="button"
                  onClick={() => libraryInputRef.current?.click()}
                  className="rounded-full border border-white/14 bg-white/[0.05] px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white/80 hover:bg-white/[0.1]"
                >
                  Choose from library
                </button>
              </div>
            </div>
          )}

          {file ? (
            <div className="rounded-[1.2rem] border border-white/8 bg-white/[0.04] px-4 py-3">
              <div className="flex items-center justify-between gap-3 text-[13px] text-white/72 sm:text-sm">
                <span className="min-w-0 truncate">{file.name}</span>
                <span>{formatMegabytes(file.size)}</span>
              </div>
              <p className="mt-2 text-xs text-white/54">
                Short video selected and ready for final rights confirmation before secure upload.
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/58">
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1">{selectedSourceLabel}</span>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1">{selectedDurationSeconds} sec cap</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={isMobileViewport ? openCaptureStudio : () => cameraInputRef.current?.click()}
                  className="foundation-chip rounded-full border border-white/14 bg-white/[0.04] px-3 py-1.5 text-xs uppercase tracking-[0.08em] text-white/72 hover:bg-white/[0.08]"
                >
                  Review and upload
                </button>
                <button
                  type="button"
                  onClick={() => libraryInputRef.current?.click()}
                  className="foundation-chip rounded-full border border-white/14 bg-white/[0.04] px-3 py-1.5 text-xs uppercase tracking-[0.08em] text-white/72 hover:bg-white/[0.08]"
                >
                  Replace from library
                </button>
              </div>
            </div>
          ) : null}

          {file && !isMobileViewport ? (
            <div className="space-y-4 rounded-[1.2rem] border border-white/8 bg-white/[0.03] p-4">
              {filePreviewUrl ? (
                <div className="overflow-hidden rounded-[1.15rem] border border-white/10 bg-black/60">
                  <video controls playsInline preload="metadata" className="aspect-[9/16] w-full bg-black object-cover" src={filePreviewUrl} />
                </div>
              ) : null}

              <LegalConfirmationStep
                checks={legalChecks}
                disabled={state.isUploading}
                isSubmitting={state.isUploading}
                onBack={() => {
                  setFile(null);
                  replaceFilePreviewUrl(null);
                }}
                onSubmit={onSubmit}
                onToggle={(key, checked) => setLegalChecks((current) => ({ ...current, [key]: checked }))}
              />
            </div>
          ) : null}

          <div className="rounded-[1.1rem] border border-white/8 bg-white/[0.03] px-4 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-white/12 bg-white/[0.05] px-3 py-1 text-xs uppercase tracking-[0.1em] text-white/68">
                {phaseChip}
              </span>
            </div>
            <p className="mt-2 text-sm text-white/62">{phaseCopy}</p>
          </div>

          <div className="rounded-[1.15rem] border border-white/8 bg-white/[0.03] px-4 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/48">Destination flow</p>
            <p className="mt-2 text-sm leading-relaxed text-white/64">
              Uploads prepares the video. Submissions moves it into competition review. Accepted work can then appear in discovery, on creator profile rails, and on public performance pages.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href="/app/submissions#submission-workspace" className="foundation-inline-action">
                Open submissions
              </Link>
              <Link href="/app/discovery" className="foundation-inline-action">
                Open discovery
              </Link>
            </div>
          </div>

          {state.isUploading ? (
            <div className="foundation-loading-skeleton h-2 rounded-full" aria-hidden />
          ) : null}

          {recorder.error ? <p className="text-sm text-red-300">{recorder.error}</p> : null}
          {state.info ? <p className="text-sm text-emerald-300" role="status">{state.info}</p> : null}
          {state.error ? <p className="text-sm text-red-300" role="alert">{state.error}</p> : null}
        </div>
      </div>
    </>
  );
}
