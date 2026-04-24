'use client';

import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';

import { useCamera } from '@/hooks/useCamera';
import { useRecorder } from '@/hooks/useRecorder';

import { CameraCaptureView } from './CameraCaptureView';
import { CaptureControls } from './CaptureControls';
import { CaptureStudioShell } from './CaptureStudioShell';
import { LegalConfirmationStep, type LegalCheckKey } from './LegalConfirmationStep';
import { VideoPreviewView } from './VideoPreviewView';

type CaptureStep = 'camera' | 'review' | 'legal' | 'processing';
type CaptureSource = 'recorded' | 'library';
type UploadPhase = 'idle' | 'selected' | 'uploading' | 'processing' | 'failed';
type LegalChecks = Record<LegalCheckKey, boolean>;

const DURATION_OPTIONS_MS = [30_000, 60_000, 120_000] as const;

function createEmptyLegalChecks(): LegalChecks {
  return {
    performance: false,
    rights: false,
    platform: false,
  };
}

function createRecordedFile(blob: Blob) {
  const type = blob.type || 'video/webm';
  const extension = type.includes('mp4') ? 'mp4' : 'webm';
  return new File([blob], `betalent-performance-${Date.now()}.${extension}`, { type });
}

function ProcessingView(props: { isUploading: boolean; error?: string | null; onRecordAnother: () => void }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[#050506] px-8 text-center">
      <div className="max-w-xs">
        <div className="mx-auto h-14 w-14 rounded-full border border-white/12 bg-white/[0.04] p-3">
          <div className="foundation-loading-skeleton h-full w-full rounded-full" />
        </div>
        <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/48">
          {props.isUploading ? 'Uploading' : props.error ? 'Needs attention' : 'Processing'}
        </p>
        <h3 className="mt-2 text-[1.25rem] font-semibold tracking-[-0.04em] text-white">
          {props.error
            ? 'Upload did not complete'
            : props.isUploading
              ? 'Secure handoff in progress'
              : 'BETALENT is preparing the asset'}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-white/62">
          {props.error || 'Upload is separate from submission. The asset becomes usable after it reaches READY.'}
        </p>
        {!props.isUploading ? (
          <button
            type="button"
            onClick={props.onRecordAnother}
            className="mt-5 rounded-full border border-white/14 bg-white/[0.06] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-white/82"
          >
            Record another
          </button>
        ) : null}
      </div>
    </div>
  );
}

export async function uploadVideoToExistingPipeline(file: File, selectedDurationMs: number) {
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
}

export function MobileCaptureFlow(props: {
  active: boolean;
  onClose: () => void;
  onLibraryUnavailable?: () => void;
}) {
  const router = useRouter();
  const libraryInputRef = useRef<HTMLInputElement | null>(null);
  const [step, setStep] = useState<CaptureStep>('camera');
  const [selectedDurationMs, setSelectedDurationMs] = useState<number>(60_000);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedSource, setSelectedSource] = useState<CaptureSource>('recorded');
  const [libraryPreviewUrl, setLibraryPreviewUrl] = useState<string | null>(null);
  const [legalChecks, setLegalChecks] = useState<LegalChecks>(createEmptyLegalChecks());
  const [phase, setPhase] = useState<UploadPhase>('idle');
  const [error, setError] = useState<string | null>(null);

  const camera = useCamera();
  const recorder = useRecorder(camera.stream, selectedDurationMs, () => {
    camera.stopCamera();
    setSelectedSource('recorded');
    setStep('review');
  });

  useEffect(() => {
    if (!props.active) {
      if (recorder.isRecording) recorder.stopRecording();
      camera.stopCamera();
      return;
    }

    if (step === 'camera' && !recorder.isRecording && camera.status === 'idle') {
      void camera.startCamera();
    }

    if (step !== 'camera' && !recorder.isRecording) {
      camera.stopCamera();
    }
  }, [camera, props.active, recorder, step]);

  useEffect(() => {
    if (!props.active) return;
    const previousBodyOverflow = document.body.style.overflow;
    const previousRootOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousRootOverflow;
    };
  }, [props.active]);

  useEffect(() => {
    return () => {
      if (libraryPreviewUrl) URL.revokeObjectURL(libraryPreviewUrl);
    };
  }, [libraryPreviewUrl]);

  function setLibraryPreview(file: File | null) {
    setLibraryPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return file ? URL.createObjectURL(file) : null;
    });
  }

  function resetLegal() {
    setLegalChecks(createEmptyLegalChecks());
  }

  function resetTake() {
    setSelectedFile(null);
    setSelectedSource('recorded');
    setLibraryPreview(null);
    resetLegal();
    setError(null);
    setPhase('idle');
    recorder.resetRecording();
  }

  function recordAnother() {
    resetTake();
    setStep('camera');
  }

  function handleClose() {
    if (recorder.isRecording) recorder.stopRecording();
    camera.stopCamera();
    props.onClose();
  }

  function handleLibraryChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] || null;
    event.target.value = '';
    if (!file) return;

    recorder.resetRecording();
    camera.stopCamera();
    resetLegal();
    setSelectedFile(file);
    setSelectedSource('library');
    setLibraryPreview(file);
    setError(null);
    setPhase('selected');
    setStep('review');
  }

  function useRecordedVideo() {
    if (!recorder.recordedBlob) {
      setError('Record a performance first.');
      setStep('camera');
      return;
    }

    setSelectedFile(createRecordedFile(recorder.recordedBlob));
    setSelectedSource('recorded');
    setLibraryPreview(null);
    resetLegal();
    setError(null);
    setPhase('selected');
    setStep('legal');
  }

  function useImportedVideo() {
    if (!selectedFile) return;
    resetLegal();
    setError(null);
    setPhase('selected');
    setStep('legal');
  }

  async function submitUpload() {
    if (!selectedFile) {
      setError('Choose or record a finished short video before upload.');
      return;
    }

    if (!legalChecks.performance || !legalChecks.rights || !legalChecks.platform) {
      setError('Complete all required confirmations before uploading.');
      return;
    }

    setPhase('uploading');
    setError(null);
    setStep('processing');

    try {
      await uploadVideoToExistingPipeline(selectedFile, selectedDurationMs);
      resetTake();
      setPhase('processing');
      setStep('processing');
      router.refresh();
    } catch (uploadError) {
      setPhase('failed');
      setError(uploadError instanceof Error ? uploadError.message : 'Upload failed.');
      setStep('legal');
    }
  }

  function toggleLegal(key: LegalCheckKey, checked: boolean) {
    setLegalChecks((current) => ({ ...current, [key]: checked }));
  }

  if (!props.active) {
    return (
      <input
        ref={libraryInputRef}
        type="file"
        accept="video/*"
        capture="environment"
        onChange={handleLibraryChange}
        className="sr-only"
      />
    );
  }

  const selectedDurationSeconds = selectedDurationMs / 1000;
  const previewUrl = selectedSource === 'library' ? libraryPreviewUrl : recorder.previewUrl;
  const title =
    step === 'review'
      ? 'Review'
      : step === 'legal'
        ? 'Confirm'
        : step === 'processing'
          ? phase === 'uploading' ? 'Uploading' : 'Processing'
          : recorder.isRecording
            ? 'Recording'
            : 'Creator camera';

  return (
    <>
      <input
        ref={libraryInputRef}
        type="file"
        accept="video/*"
        capture="environment"
        onChange={handleLibraryChange}
        className="sr-only"
      />
      <CaptureStudioShell
        eyebrow="BETALENT"
        title={title}
        closeLabel="Exit"
        onClose={handleClose}
        stage={
          step === 'processing' ? (
            <ProcessingView
              isUploading={phase === 'uploading'}
              error={phase === 'failed' ? error : null}
              onRecordAnother={recordAnother}
            />
          ) : step === 'review' && previewUrl ? (
            <VideoPreviewView
              previewUrl={previewUrl}
              isImported={selectedSource === 'library'}
              onRetake={selectedSource === 'library' ? () => libraryInputRef.current?.click() : recordAnother}
              onUseVideo={selectedSource === 'library' ? useImportedVideo : useRecordedVideo}
            />
          ) : (
            <CameraCaptureView
              stream={camera.stream}
              status={camera.status}
              error={camera.error}
              isFrontCamera={camera.isFrontCamera}
              onRequestLibrary={() => {
                props.onLibraryUnavailable?.();
                libraryInputRef.current?.click();
              }}
            />
          )
        }
        controls={
          step === 'legal' ? (
            <LegalConfirmationStep
              checks={legalChecks}
              disabled={phase === 'uploading'}
              isSubmitting={phase === 'uploading'}
              error={error}
              sourceLabel={selectedSource === 'library' ? 'Library import' : 'Recorded take'}
              durationLabel={`${selectedDurationSeconds}s max`}
              onBack={() => setStep('review')}
              onSubmit={submitUpload}
              onToggle={toggleLegal}
            />
          ) : step === 'processing' ? (
            <div className="rounded-[1.45rem] border border-white/10 bg-black/42 p-4 backdrop-blur-xl">
              <p className="text-sm leading-relaxed text-white/66">
                Processing continues in uploads. Submission remains a separate step after READY.
              </p>
              <button
                type="button"
                onClick={recordAnother}
                className="mt-3 min-h-11 rounded-full border border-white/14 bg-white/[0.06] px-4 text-xs font-semibold uppercase tracking-[0.08em] text-white/82"
              >
                Record another
              </button>
            </div>
          ) : step === 'review' && previewUrl ? null : (
            <CaptureControls
              canRecord={camera.status === 'ready' && phase !== 'uploading'}
              isRecording={recorder.isRecording}
              elapsedMs={recorder.elapsedMs}
              remainingMs={recorder.remainingMs}
              maxDurationMs={recorder.maxDurationMs}
              durationOptions={DURATION_OPTIONS_MS}
              selectedDurationMs={selectedDurationMs}
              canSwitchCamera={camera.status === 'ready' && !recorder.isRecording}
              recorderError={recorder.error}
              onStart={recorder.startRecording}
              onStop={recorder.stopRecording}
              onRequestLibrary={() => libraryInputRef.current?.click()}
              onSelectDuration={setSelectedDurationMs}
              onSwitchCamera={camera.switchCamera}
            />
          )
        }
      />
    </>
  );
}
