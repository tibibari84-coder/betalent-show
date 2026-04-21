export const POSTHOG_EVENTS = {
  landing_cta_clicked: 'landing_cta_clicked',
  creator_profile_started: 'creator_profile_started',
  creator_profile_completed: 'creator_profile_completed',
  creator_profile_avatar_upload_requested: 'creator_profile_avatar_upload_requested',
  upload_started: 'upload_started',
  upload_completed: 'upload_completed',
  upload_failed: 'upload_failed',
  submission_started: 'submission_started',
  submission_submitted: 'submission_submitted',
  submission_withdrawn: 'submission_withdrawn',
  admin_submission_reviewed: 'admin_submission_reviewed',
} as const;

export type PostHogEventName = (typeof POSTHOG_EVENTS)[keyof typeof POSTHOG_EVENTS];
