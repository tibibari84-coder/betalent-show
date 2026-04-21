'use client';

import { useState, type ChangeEvent } from 'react';

type UploadState = {
  error: string | null;
  info: string | null;
  isUploading: boolean;
};

export function DirectVideoUploadCard() {
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
    } catch (error) {
      setState({
        error: error instanceof Error ? error.message : 'Upload failed.',
        info: null,
        isUploading: false,
      });
    }
  }

  return (
    <div className="foundation-panel rounded-[1.6rem] p-6">
      <p className="foundation-kicker">Direct video upload</p>
      <h2 className="mt-3 text-xl font-semibold text-white">Stream contract preview</h2>
      <p className="mt-3 text-sm leading-relaxed text-white/64">
        This creates a draft `VideoAsset`, then uploads the file directly to Cloudflare Stream.
        Submission creation is a separate step after the asset becomes `READY`.
      </p>

      <div className="mt-4 space-y-4">
        <input
          type="file"
          accept="video/*"
          onChange={onFileChange}
          className="block w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm text-gray-300 file:mr-4 file:rounded-full file:border-0 file:bg-white/12 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-white/18"
        />

        <button
          type="button"
          onClick={onSubmit}
          disabled={!file || state.isUploading}
          className="rounded-full bg-[#db5b47] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#ed715f] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {state.isUploading ? 'Uploading…' : 'Start Upload'}
        </button>

        {state.info ? <p className="text-sm text-emerald-300">{state.info}</p> : null}
        {state.error ? <p className="text-sm text-red-300">{state.error}</p> : null}
      </div>
    </div>
  );
}
