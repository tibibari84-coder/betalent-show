'use client';

import { useState, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';

type UploadState = {
  error: string | null;
  info: string | null;
  isUploading: boolean;
};

export function DirectVideoUploadCard() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [state, setState] = useState<UploadState>({
    error: null,
    info: null,
    isUploading: false,
  });

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    setFile(event.target.files?.[0] || null);
    setState({
      error: null,
      info: null,
      isUploading: false,
    });
  }

  async function onSubmit() {
    if (!file) {
      setState({
        error: 'Choose a video file first.',
        info: null,
        isUploading: false,
      });
      return;
    }

    setState({
      error: null,
      info: 'Initializing upload…',
      isUploading: true,
    });

    try {
      const initResponse = await fetch('/api/assets/stream-init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          mimeType: file.type || 'video/mp4',
          size: file.size,
          maxDurationSeconds: 600,
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
        info: `Upload accepted. Video asset ${initData.videoAsset?.id || ''} will move to READY after the verified Stream webhook arrives.`,
        isUploading: false,
      });
      setFile(null);
      router.refresh();
    } catch (error) {
      setState({
        error: error instanceof Error ? error.message : 'Upload failed.',
        info: null,
        isUploading: false,
      });
    }
  }

  return (
    <div className="foundation-panel rounded-[1.45rem] p-4 sm:rounded-[1.6rem] sm:p-6" aria-busy={state.isUploading}>
      <p className="foundation-kicker">Direct video upload</p>
      <h2 className="mt-3 text-[1.3rem] font-semibold text-white sm:text-xl">Create a new media asset</h2>
      <p className="mt-3 max-w-xl text-[13px] leading-relaxed text-white/64 sm:text-sm">
        Start the asset here, let Stream process it in the background, then bring READY media into submissions.
      </p>

      <div className="mt-4 space-y-4">
        <input
          type="file"
          accept="video/*"
          onChange={onFileChange}
          className="foundation-form-input block w-full rounded-[1.25rem] px-4 py-4 text-sm text-white/76 file:mr-4 file:rounded-full file:border file:border-white/10 file:bg-white/[0.08] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-white/[0.12]"
        />

        {file ? (
          <div className="flex items-center justify-between gap-3 rounded-[1rem] border border-white/8 bg-white/[0.04] px-4 py-3 text-[13px] text-white/68 sm:rounded-[1.2rem] sm:text-sm">
            <span className="min-w-0 truncate">{file.name}</span>
            <span>{(file.size / (1024 * 1024)).toFixed(1)} MB</span>
          </div>
        ) : null}

        {state.isUploading ? (
          <div className="foundation-loading-skeleton h-2 rounded-full" aria-hidden />
        ) : null}

        <button
          type="button"
          onClick={onSubmit}
          disabled={!file || state.isUploading}
          className="foundation-primary-button px-5 py-2.5 text-sm font-semibold uppercase tracking-[0.08em] transition disabled:cursor-not-allowed disabled:opacity-60"
        >
          {state.isUploading ? 'Uploading…' : 'Start Upload'}
        </button>

        {state.info ? <p className="text-sm text-emerald-300" role="status">{state.info}</p> : null}
        {state.error ? <p className="text-sm text-red-300" role="alert">{state.error}</p> : null}
      </div>
    </div>
  );
}
