'use client';

import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';

import { CameraCaptureView } from '@/components/capture/CameraCaptureView';
import { CaptureControls } from '@/components/capture/CaptureControls';
import { VideoPreviewView } from '@/components/capture/VideoPreviewView';
import { useCamera } from '@/hooks/useCamera';
import { useRecorder } from '@/hooks/useRecorder';

type UploadPhase = 'idle' | 'selected' | 'uploading' | 'processing' | 'ready' | 'failed';
const RECORDING_DURATION_OPTIONS = [30_000, 60_000, 120_000] as const;

type UploadState = {
  error: string | null;
  info: string | null;
  isUploading: boolean;
  phase: UploadPhase;
};

function CaptureRailButton(props: {
  label: string;
  detail: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      disabled={props.disabled}
      className="flex flex-col items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/14 bg-black/40 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/84 shadow-[0_20px_35px_-24px_rgba(0,0,0,0.95)] backdrop-blur-xl">
        {props.label}
      </span>
      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/68">{props.detail}</span>
    </button>
  );
}

function formatMegabytes(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DirectVideoUploadCard() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [isCaptureStudioOpen, setIsCaptureStudioOpen] = useState(false);
  const [selectedDurationMs, setSelectedDurationMs] = useState<number>(120_000);
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
      setIsCaptureStudioOpen(nextIsMobile && !file && !recorder.previewUrl);
    };
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, [file, recorder.previewUrl]);

  useEffect(() => {
    if (!isMobileViewport || !isCaptureStudioOpen || recorder.previewUrl) return;
    if (camera.status === 'idle') {
      void camera.startCamera();
    }
  }, [camera, isCaptureStudioOpen, isMobileViewport, recorder.previewUrl]);

  useEffect(() => {
    if (isCaptureStudioOpen && !recorder.previewUrl) return;
    camera.stopCamera();
  }, [camera, isCaptureStudioOpen, recorder.previewUrl]);

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

  function openCaptureStudio() {
    setIsCaptureStudioOpen(true);
    if (!recorder.previewUrl) {
      void camera.startCamera();
    }
  }

  function closeCaptureStudio() {
    if (recorder.isRecording) {
      recorder.stopRecording();
    }
    setIsCaptureStudioOpen(false);
    camera.stopCamera();
  }

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0] || null;
    setFile(nextFile);
    setIsCaptureStudioOpen(false);
    setState({
      error: null,
      info: null,
      isUploading: false,
      phase: nextFile ? 'selected' : 'idle',
    });
    camera.stopCamera();
  }

  function onFallbackCameraImport(event: ChangeEvent<HTMLInputElement>) {
    onFileChange(event);
    recorder.resetRecording();
  }

  function useRecordedVideo() {
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

    setFile(recordedFile);
    setIsCaptureStudioOpen(false);
    setState({
      error: null,
      info: 'Take approved. Ready to upload into BETALENT processing.',
      isUploading: false,
      phase: 'selected',
    });
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

    setState({
      error: null,
      info: 'Preparing secure upload…',
      isUploading: true,
      phase: 'uploading',
    });

    try {
      const initResponse = await fetch('/api/assets/stream-init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          mimeType: file.type || 'video/mp4',
          size: file.size,
          maxDurationSeconds: Math.floor(selectedDurationMs / 1000),
        }),
      });

      const initData = (await initResponse.json()) as {
        error?: string;
        upload?: { url: string; formField: string };
        videoAsset?: { id: string };
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
      recorder.resetRecording();
      if (isMobileViewport) {
        setIsCaptureStudioOpen(true);
      }
      router.refresh();
    } catch (error) {
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
    recorder.resetRecording();
    setIsCaptureStudioOpen(true);
    void camera.startCamera();
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
  const cameraModeLabel = camera.isFrontCamera ? 'Front camera' : 'Rear camera';
  const selectedDurationSeconds = Math.floor(selectedDurationMs / 1000);
  const studioHeadline = recorder.previewUrl
    ? 'Choose your final cut'
    : recorder.isRecording
      ? 'Performance is live'
      : 'Full-screen mobile recording';
  const studioCopy = recorder.previewUrl
    ? 'Review the playback, then keep this take or retake immediately.'
    : recorder.isRecording
      ? `Keep the performer centered. Recording stops automatically at ${selectedDurationSeconds} seconds.`
      : `9:16 vertical, with instant review before upload. Current cap: ${selectedDurationSeconds} seconds.`;
  const captureStatusLabel = recorder.previewUrl
    ? 'Review take'
    : recorder.isRecording
      ? 'Recording now'
      : 'Capture studio';
  const selectedSourceLabel = file
    ? file.name.startsWith('performance-')
      ? 'Recorded in studio'
      : 'Imported clip'
    : 'No clip selected';

  const mobileCaptureUi =
    isMobileViewport && isCaptureStudioOpen ? (
      <div className="fixed inset-0 z-[120] bg-black text-white">
        <div className="absolute inset-0">
          {recorder.previewUrl ? (
            <VideoPreviewView
              previewUrl={recorder.previewUrl}
              onRetake={handleRetake}
              onUseVideo={useRecordedVideo}
              fullscreen
            />
          ) : (
            <CameraCaptureView
              stream={camera.stream}
              status={camera.status}
              error={camera.error}
              isFrontCamera={camera.isFrontCamera}
              fullscreen
            />
          )}
        </div>

        <div className="capture-studio-vignette pointer-events-none absolute inset-0" />

        <div className="pointer-events-none absolute inset-x-0 top-0 px-4 pb-4 pt-[calc(var(--bt-safe-top)+0.9rem)]">
          <div className="flex items-start justify-between gap-3">
            <div className="capture-studio-float rounded-[1.25rem] border border-white/10 bg-black/28 px-4 py-3 backdrop-blur-xl">
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${recorder.isRecording ? 'bg-rose-300 shadow-[0_0_18px_rgba(255,130,160,0.9)]' : 'bg-white/40'}`} />
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/48">
                  {captureStatusLabel}
                </p>
              </div>
              <h3 className="mt-2 text-lg font-semibold tracking-[-0.04em] text-white">{studioHeadline}</h3>
              <p className="mt-1 max-w-[16rem] text-xs leading-relaxed text-white/64">{studioCopy}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/60">
                <span className="rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1">{cameraModeLabel}</span>
                <span className="rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1">{selectedDurationSeconds} sec max</span>
              </div>
            </div>

            <button
              type="button"
              onClick={closeCaptureStudio}
              className="capture-studio-float pointer-events-auto rounded-full border border-white/14 bg-black/28 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-white/80 backdrop-blur-xl"
            >
              Close
            </button>
          </div>
        </div>

        {!recorder.previewUrl ? (
          <>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 px-1">
              <div className="capture-studio-float pointer-events-auto flex flex-col items-center gap-5">
                <CaptureRailButton
                  label="Flip"
                  detail="Camera"
                  onClick={camera.switchCamera}
                  disabled={state.isUploading}
                />
                <CaptureRailButton
                  label="Lib"
                  detail="Gallery"
                  onClick={() => libraryInputRef.current?.click()}
                  disabled={state.isUploading}
                />
                <CaptureRailButton
                  label="Import"
                  detail="System"
                  onClick={() => cameraInputRef.current?.click()}
                  disabled={state.isUploading}
                />
              </div>
            </div>

            <div className="pointer-events-none absolute inset-x-0 bottom-0 px-4 pb-[calc(var(--bt-safe-bottom)+1rem)]">
              <div className="space-y-3">
                <div className="capture-studio-float pointer-events-auto flex items-end justify-between gap-4 rounded-[1.4rem] border border-white/10 bg-black/18 px-4 py-3 backdrop-blur-md">
                  <div className="max-w-[15rem]">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/48">BETALENT camera</p>
                    <p className="mt-1 text-[15px] font-semibold tracking-[-0.03em] text-white">
                      {recorder.isRecording ? 'Performance is live' : 'Frame your shot and hit record'}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-white/62">
                      {recorder.isRecording
                        ? `Keep the performer centered. The take stops on its own at ${selectedDurationSeconds} seconds.`
                        : 'The page chrome stays hidden here so the camera feels like the primary app surface.'}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/48">Mode</p>
                    <p className="mt-1 text-sm font-semibold text-white">{cameraModeLabel}</p>
                    <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-white/54">
                      {recorder.isRecording ? `${Math.ceil(recorder.elapsedMs / 1000)} / ${selectedDurationSeconds} sec` : `${selectedDurationSeconds} sec cap`}
                    </p>
                  </div>
                </div>

                {isCameraUnavailable ? (
                  <div className="capture-studio-float-delay pointer-events-auto rounded-[1.1rem] border border-amber-300/25 bg-black/55 px-4 py-3 backdrop-blur-xl">
                    <p className="text-sm text-amber-100/90">
                      BETALENT cannot open live capture here. Switch to quick import or choose an existing video.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        className="rounded-full border border-white/14 bg-white/[0.08] px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white/80"
                      >
                        Quick camera import
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

                <div className="capture-studio-float-delay pointer-events-auto">
                  <CaptureControls
                    canRecord={camera.status === 'ready' && !state.isUploading}
                    isRecording={recorder.isRecording}
                  elapsedMs={recorder.elapsedMs}
                  remainingMs={recorder.remainingMs}
                  maxDurationMs={recorder.maxDurationMs}
                  durationOptions={[...RECORDING_DURATION_OPTIONS]}
                  selectedDurationMs={selectedDurationMs}
                  canSwitchCamera={!state.isUploading}
                  onStart={recorder.startRecording}
                  onStop={recorder.stopRecording}
                  onRequestLibrary={() => libraryInputRef.current?.click()}
                  onSelectDuration={setSelectedDurationMs}
                  onSwitchCamera={camera.switchCamera}
                />
              </div>
              </div>
            </div>
          </>
        ) : (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 px-4 pb-[calc(var(--bt-safe-bottom)+1rem)]">
            <div className="capture-studio-float-delay pointer-events-auto flex items-end justify-between gap-4 rounded-[1.4rem] border border-white/10 bg-black/28 px-4 py-3 backdrop-blur-xl">
              <div className="max-w-[15rem]">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/48">Preview</p>
                <p className="mt-1 text-[15px] font-semibold tracking-[-0.03em] text-white">Keep this take or shoot again</p>
                <p className="mt-1 text-xs leading-relaxed text-white/62">
                  Review the full-screen playback before sending it into processing.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRetake}
                  className="rounded-full border border-white/14 bg-white/[0.06] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-white/82"
                >
                  Retake
                </button>
                <button
                  type="button"
                  onClick={useRecordedVideo}
                  className="rounded-full bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-black"
                >
                  Use take
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    ) : null;

  return (
    <>
      {mobileCaptureUi}

      <div className="foundation-panel foundation-tint-cobalt rounded-[1.8rem] p-5 sm:rounded-[2rem] sm:p-6" aria-busy={state.isUploading}>
        <p className="foundation-kicker">Add Media</p>
        <h2 className="mt-3 text-[1.45rem] font-semibold tracking-[-0.04em] text-white sm:text-[1.7rem]">Compose the next short performance</h2>
        <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-white/64 sm:text-sm">
          Mobile now opens a dedicated full-screen capture studio so the camera is the focus, not the surrounding page chrome.
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.1em] text-white/62">
          <span className="rounded-full border border-white/12 bg-white/[0.05] px-3 py-1">9:16 preferred</span>
          <span className="rounded-full border border-white/12 bg-white/[0.05] px-3 py-1">30 / 60 / 120s</span>
          <span className="rounded-full border border-white/12 bg-white/[0.05] px-3 py-1">Flip camera</span>
        </div>

        <div className="mt-4 space-y-4">
          <input
            ref={cameraInputRef}
            type="file"
            accept="video/*"
            capture="environment"
            onChange={onFallbackCameraImport}
            className="sr-only"
          />
          <input ref={libraryInputRef} type="file" accept="video/*" onChange={onFileChange} className="sr-only" />

          {isMobileViewport ? (
            <div className="rounded-[1.2rem] border border-white/10 bg-black/35 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.12em] text-white/50">Mobile capture</p>
                  <h3 className="mt-2 text-lg font-semibold text-white">Full-screen studio</h3>
                  <p className="mt-2 max-w-lg text-sm leading-relaxed text-white/66">
                    Open a clean recording surface with camera flip, review, and direct upload flow.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openCaptureStudio}
                  className="foundation-primary-button min-h-[2.9rem] rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em]"
                >
                  Open camera
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-[1.1rem] border border-white/10 bg-black/35 p-4">
              <p className="text-sm text-white/70">
                Desktop keeps the same flow with direct camera import or library selection, then upload and processing.
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
                Selected for short-video processing. Retake or choose another clip if this is not your final cut.
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/58">
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1">{selectedSourceLabel}</span>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1">{phaseChip}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={isMobileViewport ? handleRetake : () => cameraInputRef.current?.click()}
                  className="foundation-chip rounded-full border border-white/14 bg-white/[0.04] px-3 py-1.5 text-xs uppercase tracking-[0.08em] text-white/72 hover:bg-white/[0.08]"
                >
                  Retake
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

          <div className="rounded-[1.1rem] border border-white/8 bg-white/[0.03] px-4 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-white/12 bg-white/[0.05] px-3 py-1 text-xs uppercase tracking-[0.1em] text-white/68">
                {phaseChip}
              </span>
            </div>
            <p className="mt-2 text-sm text-white/62">{phaseCopy}</p>
          </div>

          {state.isUploading ? (
            <div className="foundation-loading-skeleton h-2 rounded-full" aria-hidden />
          ) : null}

          {recorder.error ? <p className="text-sm text-red-300">{recorder.error}</p> : null}

          <button
            type="button"
            onClick={onSubmit}
            disabled={!file || state.isUploading}
            className="foundation-primary-button min-h-[3.2rem] px-5 py-2.5 text-sm font-semibold uppercase tracking-[0.08em] transition disabled:cursor-not-allowed disabled:opacity-60"
          >
            {state.isUploading ? 'Uploading…' : 'Use this video'}
          </button>

          {state.info ? <p className="text-sm text-emerald-300" role="status">{state.info}</p> : null}
          {state.error ? <p className="text-sm text-red-300" role="alert">{state.error}</p> : null}
        </div>
      </div>
    </>
  );
}
