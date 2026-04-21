import type { ReactNode } from 'react';
import type { CSSProperties } from 'react';

import { cn } from '@/lib/utils/cn';

type ArtworkTheme = 'ember' | 'cobalt' | 'gold' | 'violet' | 'emerald';

const artworkThemes: Record<ArtworkTheme, string> = {
  ember: 'from-[#31130f] via-[#1b0d0b] to-[#09090b] [--artwork-glow:rgba(240,107,85,0.24)]',
  cobalt: 'from-[#102038] via-[#0a1018] to-[#09090b] [--artwork-glow:rgba(98,145,255,0.24)]',
  gold: 'from-[#302509] via-[#17120b] to-[#09090b] [--artwork-glow:rgba(255,214,102,0.22)]',
  violet: 'from-[#231530] via-[#120d18] to-[#09090b] [--artwork-glow:rgba(180,120,255,0.22)]',
  emerald: 'from-[#10221b] via-[#0c1411] to-[#09090b] [--artwork-glow:rgba(99,214,151,0.2)]',
};

export function PremiumArtworkPanel(props: {
  eyebrow?: ReactNode;
  title: ReactNode;
  detail?: ReactNode;
  meta?: ReactNode;
  monogram?: ReactNode;
  imageUrl?: string | null;
  theme?: ArtworkTheme;
  className?: string;
}) {
  const theme = props.theme ?? 'ember';
  const style: CSSProperties | undefined = props.imageUrl
    ? {
        backgroundImage: `linear-gradient(180deg, rgba(4,4,6,0.08), rgba(4,4,6,0.92) 78%), url(${props.imageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : undefined;

  return (
    <div
      className={cn(
        'relative min-h-[12rem] overflow-hidden rounded-[1.5rem] border border-white/10 bg-gradient-to-b p-4 shadow-[0_28px_70px_-38px_rgba(0,0,0,0.92)]',
        !props.imageUrl && artworkThemes[theme],
        props.className,
      )}
      style={style}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_95%_72%_at_50%_-8%,var(--artwork-glow),transparent_62%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-[#050508] via-[#050508]/76 to-transparent"
        aria-hidden
      />
      {props.monogram ? (
        <div className="absolute right-4 top-4 rounded-[1rem] border border-white/10 bg-black/25 px-3 py-2 text-[1.8rem] font-semibold tracking-[-0.04em] text-white/88 backdrop-blur-xl">
          {props.monogram}
        </div>
      ) : null}
      <div className="relative flex min-h-[12rem] flex-col justify-end gap-2">
        {props.eyebrow ? (
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/56">{props.eyebrow}</p>
        ) : null}
        <h3 className="max-w-[14rem] text-[1.15rem] font-semibold tracking-[-0.03em] text-white">{props.title}</h3>
        {props.detail ? (
          <p className="max-w-[14rem] text-[13px] leading-relaxed text-white/66">{props.detail}</p>
        ) : null}
        {props.meta ? <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-white/56">{props.meta}</div> : null}
      </div>
    </div>
  );
}
