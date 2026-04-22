'use client';

import { useState } from 'react';

import { EngagementCountChip } from '@/components/engagement/EngagementCountChip';

export function PublicFollowButton(props: {
  creatorId: string;
  canFollow: boolean;
  canAct: boolean;
  initialFollowed: boolean;
  initialFollowerCount: number;
}) {
  const [busy, setBusy] = useState(false);
  const [followed, setFollowed] = useState(props.initialFollowed);
  const [followerCount, setFollowerCount] = useState(props.initialFollowerCount);

  async function onToggleFollow() {
    if (busy || !props.canAct || !props.canFollow) return;

    setBusy(true);
    const next = !followed;
    setFollowed(next);
    setFollowerCount((count) => Math.max(0, count + (next ? 1 : -1)));

    try {
      const response = await fetch('/api/engagement/creators/follow', {
        method: next ? 'POST' : 'DELETE',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ creatorId: props.creatorId }),
      });

      if (!response.ok) {
        throw new Error('Follow request failed');
      }
    } catch {
      setFollowed((value) => !value);
      setFollowerCount((count) => Math.max(0, count + (next ? -1 : 1)));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <button
        type="button"
        onClick={onToggleFollow}
        disabled={busy || !props.canFollow || !props.canAct}
        className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.09em] transition duration-200 ${
          followed
            ? 'border-violet-300/35 bg-violet-300/[0.14] text-violet-100 shadow-[0_12px_30px_-22px_rgba(180,120,255,0.75)]'
            : 'border-white/12 bg-white/[0.06] text-white/78 hover:border-white/22 hover:bg-white/[0.1]'
        } ${(busy || !props.canFollow || !props.canAct) ? 'cursor-not-allowed opacity-55' : 'active:scale-[0.98]'}`}
      >
        {followed ? 'Following' : 'Follow'}
      </button>
      <EngagementCountChip
        icon="followers"
        label="Followers"
        value={followerCount}
        active={followed}
        className="shadow-[0_10px_28px_-22px_rgba(255,255,255,0.6)]"
      />
    </div>
  );
}
