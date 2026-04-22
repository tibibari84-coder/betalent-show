'use client';

import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';

import { CameraCaptureView } from '@/components/capture/CameraCaptureView';
import { CaptureControls } from '@/components/capture/CaptureControls';
import { VideoPreviewView } from '@/components/capture/VideoPreviewView';
import { useCamera } from '@/hooks/useCamera';
import { useRecorder } from '@/hooks/useRecorder';

type UploadPhase = 'idle' | 'selected' | 'uploading' | 'processing' | 'ready' | 'failed';

type UploadState = {
  error: string | null;
  info: string | null;
  isUploading: boolean;
  phase: UploadPhase;
};

export function DirectVideoUploadCard() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const libraryInputRef = useRef<HTMLInputElement | null>(null);
  const [state, setState] = useState<UploadState>({
    error: null,
    info: null,
    isUploading: false,
    phase: 'idle',
  });
  const camera = useCamera();
  const recorder = useRecorder(camera.stream);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 768px)');
    const update = () => setIsMobileViewport(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (!isMobileViewport || recorder.previewUrl) return;
    if (camera.status === 'idle') {
      void camera.startCamera();
    }
  }, [camera, isMobileViewport, recorder.previewUrl]);

  useEffect(() => {
    if (!recorder.previewUrl) return;
    camera.stopCamera();
  }, [camera, recorder.previewUrl]);

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0] || null;
    setFile(nextFile);
    setState({
      error: null,
      info: null,
      isUploading: false,
      phase: nextFile ? 'selected' : 'idle',
    });
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
          maxDurationSeconds: 120,
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
        void camera.startCamera();
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
    recorder.resetRecording();
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

  return (
    <div className="foundation-panel foundation-tint-cobalt rounded-[1.8rem] p-5 sm:rounded-[2rem] sm:p-6" aria-busy={state.isUploading}>
      <p className="foundation-kicker">Add Media</p>
      <h2 className="mt-3 text-[1.45rem] font-semibold tracking-[-0.04em] text-white sm:text-[1.7rem]">Compose the next short performance</h2>
      <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-white/64 sm:text-sm">
        Mobile flow is camera-first: capture, review, then upload. Best fit is 9:16 and up to 120 seconds. Upload stays separate from submission review.
      </p>
      <div className="mt-4 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.1em] text-white/62">
        <span className="rounded-full border border-white/12 bg-white/[0.05] px-3 py-1">9:16 preferred</span>
        <span className="rounded-full border border-white/12 bg-white/[0.05] px-3 py-1">120s max</span>
        <span className="rounded-full border border-white/12 bg-white/[0.05] px-3 py-1">On-demand only</span>
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
          <>
            {!recorder.previewUrl ? (
              <>
                <CameraCaptureView
                  stream={camera.stream}
                  status={camera.status}
                  error={camera.error}
                  isFrontCamera={camera.isFrontCamera}
                />
                <CaptureControls
                  canRecord={camera.status === 'ready' && !state.isUploading}
                  isRecording={recorder.isRecording}
                  elapsedMs={recorder.elapsedMs}
                  remainingMs={recorder.remainingMs}
                  maxDurationMs={recorder.maxDurationMs}
                  onStart={recorder.startRecording}
                  onStop={recorder.stopRecording}
                  onRequestLibrary={() => libraryInputRef.current?.click()}
                />
                {(camera.status === 'denied' || camera.status === 'unsupported' || camera.status === 'error') ? (
                  <div className="rounded-[1rem] border border-amber-300/25 bg-amber-300/[0.08] px-4 py-3">
                    <p className="text-sm text-amber-100/90">
                      BETALENT cannot open camera capture here. Continue with quick capture import or library selection.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        className="rounded-full border border-white/14 bg-white/[0.06] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-white/80 hover:bg-white/[0.1]"
                      >
                        Quick camera import
                      </button>
                      <button
                        type="button"
                        onClick={() => libraryInputRef.current?.click()}
                        className="rounded-full border border-white/14 bg-white/[0.06] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-white/80 hover:bg-white/[0.1]"
                      >
                        Choose from library
                      </button>
                    </div>
                  </div>
                ) : null}
              </>
            ) : null}

            {recorder.previewUrl ? (
              <VideoPreviewView previewUrl={recorder.previewUrl} onRetake={handleRetake} onUseVideo={useRecordedVideo} />
            ) : null}
          </>
        ) : (
          <div className="rounded-[1.1rem] border border-white/10 bg-black/35 p-4">
            <p className="text-sm text-white/70">
              Desktop fallback keeps the same creator flow with camera import or library selection, then upload and processing.
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
              <span>{(file.size / (1024 * 1024)).toFixed(1)} MB</span>
            </div>
            <p className="mt-2 text-xs text-white/54">
              Selected for short-video processing. Retake or choose another clip if this is not your final cut.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
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
  );
}
