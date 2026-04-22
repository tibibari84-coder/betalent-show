'use client';

import { useEffect, useRef, useState } from 'react';

import { EngagementCountChip } from '@/components/engagement/EngagementCountChip';

export function DiscoveryEngagementStrip(props: {
  submissionId: string;
  creatorId: string;
  canFollow: boolean;
  canLike: boolean;
  showFollow?: boolean;
  initialLiked: boolean;
  initialLikeCount: number;
  initialViewCount: number;
  initialFollowed: boolean;
  initialFollowerCount: number;
}) {
  const [liked, setLiked] = useState(props.initialLiked);
  const [likeCount, setLikeCount] = useState(props.initialLikeCount);
  const [followed, setFollowed] = useState(props.initialFollowed);
  const [followerCount, setFollowerCount] = useState(props.initialFollowerCount);
  const [busyLike, setBusyLike] = useState(false);
  const [busyFollow, setBusyFollow] = useState(false);
  const pingedRef = useRef(false);

  useEffect(() => {
    if (pingedRef.current) return;
    pingedRef.current = true;
    void fetch('/api/engagement/submissions/view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ submissionId: props.submissionId }),
    });
  }, [props.submissionId]);

  async function onToggleLike() {
    if (busyLike || !props.canLike) return;
    const wasLiked = liked;
    const wasCount = likeCount;

    setBusyLike(true);
    setLiked(!wasLiked);
    setLikeCount((count) => (wasLiked ? Math.max(0, count - 1) : count + 1));

    try {
      const response = await fetch('/api/engagement/submissions/like', {
        method: wasLiked ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId: props.submissionId }),
      });
      if (!response.ok) throw new Error('Like failed');
    } catch {
      setLiked(wasLiked);
      setLikeCount(wasCount);
    } finally {
      setBusyLike(false);
    }
  }

  async function onToggleFollow() {
    if (busyFollow || !props.canFollow) return;
    const wasFollowed = followed;
    const wasCount = followerCount;

    setBusyFollow(true);
    setFollowed(!wasFollowed);
    setFollowerCount((count) => (wasFollowed ? Math.max(0, count - 1) : count + 1));

    try {
      const response = await fetch('/api/engagement/creators/follow', {
        method: wasFollowed ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creatorId: props.creatorId }),
      });
      if (!response.ok) throw new Error('Follow failed');
    } catch {
      setFollowed(wasFollowed);
      setFollowerCount(wasCount);
    } finally {
      setBusyFollow(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {(props.showFollow ?? true) ? (
        <button
          type="button"
          onClick={onToggleFollow}
          disabled={busyFollow || !props.canFollow}
          className={`rounded-full border px-3 py-1.5 transition duration-200 ${
            followed
              ? 'border-violet-300/35 bg-violet-300/[0.14] text-violet-100 shadow-[0_12px_28px_-20px_rgba(180,120,255,0.7)]'
              : 'border-white/14 bg-white/[0.06] text-white/78 hover:border-white/24 hover:bg-white/[0.11]'
          } ${!props.canFollow ? 'cursor-not-allowed opacity-50' : 'active:scale-[0.98]'}`}
        >
          <EngagementCountChip
            icon="followers"
            label={followed ? 'Following' : 'Follow'}
            value={followerCount}
            active={followed}
            className="min-h-0 border-0 bg-transparent p-0"
          />
        </button>
      ) : null}

      <button
        type="button"
        onClick={onToggleLike}
        disabled={busyLike || !props.canLike}
        className={`rounded-full border px-3 py-1.5 transition duration-200 ${
          liked
            ? 'border-emerald-400/35 bg-emerald-400/[0.14]'
            : 'border-white/12 bg-white/[0.05] hover:border-white/20 hover:bg-white/[0.09]'
        } ${!props.canLike ? 'cursor-not-allowed opacity-50' : 'active:scale-[0.98]'}`}
      >
        <EngagementCountChip
          icon="like"
          label={liked ? 'Liked' : 'Like'}
          value={likeCount}
          active={liked}
          className="min-h-0 border-0 bg-transparent p-0"
        />
      </button>

      <EngagementCountChip icon="view" label="Views" value={props.initialViewCount} />
    </div>
  );
}
