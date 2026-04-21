import { SubmissionStatus, VideoAssetStatus, type SeasonStatus, type StageStatus, type StageType } from '@prisma/client';

export function getInitials(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] || '')
    .join('')
    .toUpperCase();
}

export function getSeasonTheme(status: SeasonStatus) {
  switch (status) {
    case 'LIVE':
      return 'gold';
    case 'UPCOMING':
      return 'violet';
    case 'COMPLETED':
      return 'emerald';
    case 'ARCHIVED':
      return 'cobalt';
    default:
      return 'ember';
  }
}

export function getStageTheme(stageType: StageType, status: StageStatus) {
  if (status === 'RESULTS' || status === 'COMPLETED') {
    return 'gold';
  }
  if (status === 'OPEN' || status === 'JUDGING' || status === 'VOTING') {
    return 'ember';
  }
  if (stageType === 'FINAL' || stageType === 'SEMIFINAL') {
    return 'gold';
  }
  if (stageType === 'CALLBACK') {
    return 'violet';
  }
  return 'cobalt';
}

export function getAssetTheme(status: VideoAssetStatus) {
  switch (status) {
    case 'READY':
      return 'emerald';
    case 'FAILED':
      return 'ember';
    case 'PROCESSING':
      return 'gold';
    case 'UPLOADING':
      return 'cobalt';
    default:
      return 'violet';
  }
}

export function getSubmissionTheme(status: SubmissionStatus) {
  switch (status) {
    case 'ACCEPTED':
      return 'emerald';
    case 'REJECTED':
      return 'ember';
    case 'UNDER_REVIEW':
    case 'SUBMITTED':
      return 'gold';
    case 'WITHDRAWN':
      return 'cobalt';
    default:
      return 'violet';
  }
}
