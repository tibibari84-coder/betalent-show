import type { ReactNode } from 'react';

import { cn } from '@/lib/utils/cn';

type EngagementIcon = 'like' | 'view' | 'followers' | 'following';

function Icon(props: { kind: EngagementIcon }) {
  if (props.kind === 'like') {
    return (
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden>
        <path
          d="M12 20.6 4.8 14a4.7 4.7 0 0 1 6.5-6.8L12 8l.7-.8A4.7 4.7 0 0 1 19.2 14L12 20.6Z"
          fill="currentColor"
        />
      </svg>
    );
  }
  if (props.kind === 'view') {
    return (
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden>
        <path
          d="M12 6c5.2 0 9.4 3.4 10.8 6-1.4 2.6-5.6 6-10.8 6S2.6 14.6 1.2 12C2.6 9.4 6.8 6 12 6Zm0 3.1a2.9 2.9 0 1 0 0 5.8 2.9 2.9 0 0 0 0-5.8Z"
          fill="currentColor"
        />
      </svg>
    );
  }
  if (props.kind === 'followers') {
    return (
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden>
        <path
          d="M8.2 11.1a3.3 3.3 0 1 1 0-6.6 3.3 3.3 0 0 1 0 6.6Zm7.6-.9a2.7 2.7 0 1 1 0-5.4 2.7 2.7 0 0 1 0 5.4ZM3.5 18c0-2.5 2.4-4.3 4.7-4.3 2.3 0 4.7 1.8 4.7 4.3V19H3.5v-1Zm9.7.9V18c0-1.2-.4-2.3-1.2-3.2a6.2 6.2 0 0 1 3.8-1.2c2 0 4.1 1.3 4.1 3.4v1.9h-6.7Z"
          fill="currentColor"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden>
      <path d="M11.3 11.3V5h1.4v6.3H19v1.4h-6.3V19h-1.4v-6.3H5v-1.4h6.3Z" fill="currentColor" />
      <path d="M15.8 7.8a3.3 3.3 0 1 1 0-6.6 3.3 3.3 0 0 1 0 6.6Z" fill="currentColor" />
      <path d="M8.2 13.2a3.3 3.3 0 1 1 0-6.6 3.3 3.3 0 0 1 0 6.6Z" fill="currentColor" />
    </svg>
  );
}

export function EngagementCountChip(props: {
  icon: EngagementIcon;
  label: string;
  value: ReactNode;
  active?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex min-h-[2rem] items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] uppercase tracking-[0.09em]',
        props.active
          ? 'border-emerald-400/32 bg-emerald-400/[0.14] text-emerald-100'
          : 'border-white/12 bg-white/[0.05] text-white/68',
        props.className,
      )}
    >
      <span className="inline-flex items-center justify-center text-current/92">
        <Icon kind={props.icon} />
      </span>
      <span className="text-white/52">{props.label}</span>
      <strong className="text-white">{props.value}</strong>
    </span>
  );
}
