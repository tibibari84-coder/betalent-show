'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { EngagementCountChip } from './EngagementCountChip';

type Props = {
  submissionId: string;
  initialLikeCount: number;
  initialViewCount: number;
  initialLiked: boolean;
  canLike: boolean;
  canView: boolean;
};

export function SubmissionEngagementBar(props: Props) {
  const [liked, setLiked] = useState(props.initialLiked);
  const [likeCount, setLikeCount] = useState(props.initialLikeCount);
  const [viewCount] = useState(props.initialViewCount);
  const [busy, setBusy] = useState(false);
  const viewPingedRef = useRef(false);

  useEffect(() => {
    if (!props.canView || viewPingedRef.current) {
      return;
    }

    viewPingedRef.current = true;
    void fetch('/api/engagement/submissions/view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ submissionId: props.submissionId }),
    });
  }, [props.canView, props.submissionId]);

  const likeLabel = useMemo(() => (liked ? 'Liked' : 'Like'), [liked]);

  async function toggleLike() {
    if (!props.canLike || busy) {
      return;
    }

    const prevLiked = liked;
    const prevCount = likeCount;

    setBusy(true);
    setLiked(!prevLiked);
    setLikeCount((count) => (prevLiked ? Math.max(0, count - 1) : count + 1));

    try {
      const response = await fetch('/api/engagement/submissions/like', {
        method: prevLiked ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId: props.submissionId }),
      });

      if (!response.ok) {
        throw new Error('Like toggle failed');
      }
    } catch {
      setLiked(prevLiked);
      setLikeCount(prevCount);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2.5">
      <button
        type="button"
        onClick={toggleLike}
        disabled={!props.canLike || busy}
        className={`group inline-flex min-h-[2.35rem] items-center rounded-full border px-3 py-1.5 text-xs uppercase tracking-[0.08em] transition duration-200 ${
          liked
            ? 'border-emerald-400/35 bg-emerald-400/14 text-emerald-100 shadow-[0_10px_28px_-20px_rgba(99,214,151,0.75)]'
            : 'border-white/12 bg-white/[0.05] text-white/72 hover:border-white/20 hover:bg-white/[0.09]'
        } ${!props.canLike ? 'cursor-not-allowed opacity-55' : 'active:scale-[0.98]'}`}
      >
        <EngagementCountChip
          icon="like"
          label={likeLabel}
          value={likeCount}
          active={liked}
          className="pointer-events-none min-h-0 border-0 bg-transparent p-0"
        />
      </button>
      <EngagementCountChip icon="view" label="Views" value={viewCount} />
    </div>
  );
}
