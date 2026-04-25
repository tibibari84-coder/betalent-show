"use client";

import { ReactNode } from "react";

type CaptureStudioShellProps = {
  preview: ReactNode;
  topBar: ReactNode;
  bottomControls: ReactNode;
  dimPreview?: boolean;
};

export function CaptureStudioShell({
  preview,
  topBar,
  bottomControls,
  dimPreview = false,
}: CaptureStudioShellProps) {
  return (
    <div className="fixed inset-0 z-[9999] w-screen h-[100dvh] overflow-hidden bg-black text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(102,65,255,0.12),_transparent_38%),radial-gradient(circle_at_bottom,_rgba(255,83,83,0.10),_transparent_42%)]" />

      <div className="absolute inset-0">
        {preview}
        <div className={`absolute inset-0 ${dimPreview ? "bg-black/28" : "bg-black/10"}`} />
        <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-black via-black/50 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-[42vh] bg-gradient-to-t from-black via-black/75 to-transparent" />
      </div>

      <div
        className="relative flex h-full min-h-[100dvh] flex-col justify-between"
        style={{
          paddingTop: "calc(env(safe-area-inset-top, 0px) + 16px)",
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 18px)",
        }}
      >
        <div className="px-4">{topBar}</div>
        <div className="px-4">{bottomControls}</div>
      </div>
    </div>
  );
}
