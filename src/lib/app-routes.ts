export const appRoutes = {
  home: '/app',
  creator: '/app/creator',
  uploads: '/app/uploads',
  submissions: '/app/submissions',
  seasons: '/app/seasons',
  archive: '/app/archive',
  profile: '/app/profile',
  settings: '/app/settings',
} as const;

export const adminRoutes = {
  home: '/admin',
  seasons: '/admin/seasons',
  stages: '/admin/stages',
  episodes: '/admin/episodes',
  submissions: '/admin/submissions',
} as const;

export const creatorCoreRevalidatePaths = [
  appRoutes.home,
  appRoutes.creator,
  appRoutes.uploads,
  appRoutes.submissions,
  appRoutes.profile,
] as const;

export const showSurfaceRevalidatePaths = [
  appRoutes.home,
  appRoutes.seasons,
  appRoutes.archive,
  appRoutes.profile,
] as const;

export const adminSurfaceRevalidatePaths = [
  adminRoutes.home,
  adminRoutes.seasons,
  adminRoutes.stages,
  adminRoutes.episodes,
  adminRoutes.submissions,
] as const;
