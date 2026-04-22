'use client';

import { useState } from 'react';

import { cn } from '@/lib/utils/cn';
import { getInitials } from '@/lib/content-presentation';

export function PremiumAvatar(props: {
  name: string;
  imageUrl?: string | null;
  className?: string;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const shouldRenderImage = Boolean(props.imageUrl) && !imageFailed;

  return (
    <div
      className={cn(
        'relative flex items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/[0.05] text-sm font-semibold uppercase tracking-[0.22em] text-white/56',
        props.className,
      )}
    >
      {shouldRenderImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={props.imageUrl!}
          alt={props.name}
          className="h-full w-full object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span>{getInitials(props.name || 'BT')}</span>
      )}
    </div>
  );
}
