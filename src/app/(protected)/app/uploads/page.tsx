import Link from 'next/link';
import { VideoAssetStatus } from '@prisma/client';

import { DirectVideoUploadCard } from '@/components/uploads/DirectVideoUploadCard';
import { OpenUploadCameraButton } from '@/components/uploads/OpenUploadCameraButton';
import {
  AppPage,
  FeatureSurface,
  PremiumArtworkPanel,
  PremiumEmptyState,
  PremiumStageCard,
  SupportPanel,
} from '@/components/premium';
import { getAssetTheme } from '@/lib/content-presentation';
import { getR2ConfigState } from '@/lib/r2';
import { VideoAssetService } from '@/lib/services/video-asset.service';
import { requireAuthenticatedOnboarded } from '@/server/auth/guard';

const statusLabel: Record<VideoAssetStatus, string> = {
  UPLOADING: 'Uploading',
  PROCESSING: 'Preparing',
  READY: 'Ready',
  FAILED: 'Needs another try',
  DELETED: 'Removed',
};

export const dynamic = 'force-dynamic';

export default async function UploadsPage(props: {
  searchParams?: Promise<{ asset?: string }>;
}) {
  const searchParams = props.searchParams ? await props.searchParams : undefined;
  const session = await requireAuthenticatedOnboarded('/app/uploads');
  const assets = await VideoAssetService.getVideoAssetsByUser(session.user.id);
  const readyAssets = assets.filter((asset) => asset.status === VideoAssetStatus.READY);
  const processingAssets = assets.filter((asset) => asset.status === VideoAssetStatus.PROCESSING || asset.status === VideoAssetStatus.UPLOADING);
  const failedAssets = assets.filter((asset) => asset.status === VideoAssetStatus.FAILED);
  const featuredAsset = readyAssets[0] ?? processingAssets[0] ?? failedAssets[0] ?? assets[0] ?? null;
  const selectedAssetId = searchParams?.asset;
  const detailAsset = assets.find((asset) => asset.id === selectedAssetId) ?? featuredAsset;
  const detailPlaybackUrl = detailAsset?.playbackUrl || detailAsset?.previewUrl || null;
  const detailStatus = detailAsset?.status;
  const uploadStorageConfig = getR2ConfigState('video');
  const uploadsEnabled = uploadStorageConfig.enabled;
  const detailPrimaryAction =
    detailStatus === VideoAssetStatus.READY
      ? {
          href: '/app/submissions#submission-workspace',
          label: 'Attach to submission',
        }
      : detailStatus === VideoAssetStatus.PROCESSING || detailStatus === VideoAssetStatus.UPLOADING
        ? {
            href: '/app/uploads',
            label: 'Continue processing wait',
          }
        : detailStatus === VideoAssetStatus.FAILED
          ? {
              href: '#upload-panel',
              label: 'Retry this upload',
            }
          : {
              href: '/app/uploads',
              label: 'Return to library',
            };

  return (
    <AppPage
      hero={
        <FeatureSurface
          eyebrow="Uploads"
          tone={
            !uploadsEnabled
              ? 'ember'
              : featuredAsset?.status === VideoAssetStatus.READY
                ? 'emerald'
                : featuredAsset?.status === VideoAssetStatus.FAILED
                  ? 'ember'
                  : featuredAsset?.status === VideoAssetStatus.PROCESSING || featuredAsset?.status === VideoAssetStatus.UPLOADING
                    ? 'gold'
                    : 'cobalt'
          }
          title={
            !uploadsEnabled
              ? 'Uploads are unavailable in this environment'
              : featuredAsset
                ? 'Short-performance composer'
                : 'Start your short-performance library with one standout vertical upload'
          }
          description={
            !uploadsEnabled
              ? 'This environment cannot create new media right now, but your existing library still stays visible.'
              : featuredAsset
                ? 'Select an asset, keep focus on preview, then move READY work into submission.'
                : 'Import one short vertical performance to activate composer flow and preview.'
          }
          primaryAction={
            uploadsEnabled
              ? <OpenUploadCameraButton />
              : <Link href="/app/submissions" className="foundation-hero-cta-primary">Open entries</Link>
          }
          secondaryAction={<Link href="/app/submissions" className="foundation-hero-cta-secondary">View entries</Link>}
          meta={
            <>
              <span>{readyAssets.length} ready</span>
              <span>{processingAssets.length} moving</span>
              <span>{failedAssets.length} attention</span>
            </>
          }
          media={
            <PremiumArtworkPanel
              theme={featuredAsset ? getAssetTheme(featuredAsset.status) : 'cobalt'}
              eyebrow="Featured media"
              title={featuredAsset?.originalName || 'Media library'}
              detail={
                featuredAsset
                  ? `${statusLabel[featuredAsset.status]} · ${(featuredAsset.size / (1024 * 1024)).toFixed(1)} MB`
                  : 'Once a performance lands here, BETALENT prepares it for submission attachment.'
              }
              imageUrl={featuredAsset?.thumbnailUrl}
              monogram={featuredAsset ? undefined : 'UP'}
              className="min-h-[15rem]"
            />
          }
          className="hidden sm:block"
        />
      }
    >
      <div className="foundation-page-stack">
        {uploadsEnabled ? (
          <div id="upload-panel">
            <DirectVideoUploadCard />
          </div>
        ) : (
          <SupportPanel
            eyebrow="Library access"
            title="This environment is view-only for uploads"
            description="Media creation is turned off here, so BETALENT keeps the screen focused on what is already available."
            tone="ember"
            action={<Link href="/app/submissions" className="foundation-quiet-link">Open entries instead</Link>}
          />
        )}

        <div className="foundation-support-grid">
          <SupportPanel
            eyebrow="Library health"
            title={
              readyAssets.length > 0
                ? `${readyAssets.length} ${readyAssets.length === 1 ? 'asset is' : 'assets are'} ready to attach`
                : processingAssets.length > 0
                  ? 'Upload pipeline is active'
                  : 'Ready for first vertical upload'
            }
            description={
              readyAssets.length > 0
                ? 'READY assets can be attached immediately in the submission workspace.'
                : processingAssets.length > 0
                  ? 'Uploaded files move through transfer and preparation before READY unlocks.'
                  : 'Import one short mobile-first performance to begin.'
            }
            tone={readyAssets.length > 0 ? 'emerald' : processingAssets.length > 0 ? 'gold' : 'cobalt'}
            action={<Link href="/app/submissions#submission-workspace" className="foundation-quiet-link">Attach media in submissions</Link>}
          />
          <SupportPanel
            eyebrow="Delivery"
            title={uploadsEnabled ? 'R2 upload storage is turned on' : 'R2 upload storage is not configured'}
            description={
              uploadsEnabled
                ? 'Uploads are stored in Cloudflare R2 and become READY after the multipart transfer completes.'
                : `Missing upload configuration: ${uploadStorageConfig.missing.join(', ')}.`
            }
            tone={uploadsEnabled ? 'emerald' : 'gold'}
          />
        </div>

        {assets.length === 0 ? (
          <PremiumEmptyState title="Media workspace">
            <div className="space-y-3">
              <p>Your upload composer activates when the first short performance lands.</p>
              <p>Use this space to move from selected file to READY asset before entering submissions.</p>
              <Link href="#upload-panel" className="foundation-inline-action">Upload your first performance</Link>
            </div>
          </PremiumEmptyState>
        ) : (
          <section className="foundation-panel rounded-[1.55rem] p-5 sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="foundation-kicker">Media workspace</p>
                <h2 className="mt-2 text-[1.35rem] font-semibold text-white sm:text-[1.6rem]">Library + focused preview</h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/62">
                  Track each asset state clearly: selected, uploading, preparing, ready, or retry needed.
                </p>
              </div>
              <Link href="/app/submissions#submission-workspace" className="foundation-inline-action">
                Open submission attachment
              </Link>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
              <div className="rounded-[1.25rem] border border-white/8 bg-white/[0.03] p-4 lg:order-2">
                <p className="text-xs uppercase tracking-[0.12em] text-white/48">Focused asset</p>
                <div className="mt-3 space-y-4">
                  <div className="overflow-hidden rounded-[1.1rem] border border-white/10 bg-black/30">
                    {detailAsset && detailAsset.status === VideoAssetStatus.READY && detailPlaybackUrl ? (
                      <video
                        controls
                        preload="metadata"
                        poster={detailAsset.thumbnailUrl || undefined}
                        className="aspect-[9/16] w-full bg-black"
                        src={detailPlaybackUrl}
                      />
                    ) : (
                      <PremiumArtworkPanel
                        theme={detailAsset ? getAssetTheme(detailAsset.status) : 'cobalt'}
                        eyebrow={detailAsset ? statusLabel[detailAsset.status] : 'Preview'}
                        title={detailAsset?.originalName || 'Selected asset'}
                        detail={
                          detailAsset
                            ? detailAsset.status === VideoAssetStatus.FAILED
                              ? 'Upload did not complete. Retry with a final short-performance file.'
                              : detailAsset.status === VideoAssetStatus.PROCESSING || detailAsset.status === VideoAssetStatus.UPLOADING
                                ? 'Transfer or preparation is in progress. Playable preview appears automatically at READY.'
                                : 'Choose an asset from the library to inspect here.'
                            : 'Choose an asset from the library to inspect here.'
                        }
                        imageUrl={detailAsset?.thumbnailUrl}
                        monogram={detailAsset ? undefined : 'PV'}
                        className="min-h-[16rem] rounded-none border-0"
                      />
                    )}
                  </div>

                  <div className="rounded-[1rem] border border-white/8 bg-white/[0.03] px-4 py-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-white/12 bg-white/[0.05] px-3 py-1 text-xs uppercase tracking-[0.1em] text-white/70">
                        {detailAsset ? statusLabel[detailAsset.status] : 'No selection'}
                      </span>
                      {detailAsset ? (
                        <span className="rounded-full border border-white/12 bg-white/[0.05] px-3 py-1 text-xs uppercase tracking-[0.1em] text-white/58">
                          {(detailAsset.size / (1024 * 1024)).toFixed(1)} MB
                        </span>
                      ) : null}
                      {detailAsset?.mimeType ? (
                        <span className="rounded-full border border-white/12 bg-white/[0.05] px-3 py-1 text-xs uppercase tracking-[0.1em] text-white/58">
                          {detailAsset.mimeType}
                        </span>
                      ) : null}
                    </div>

                    <h3 className="mt-4 text-lg font-semibold text-white">
                      {detailAsset?.originalName || 'Media detail preview'}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/64">
                      {detailAsset
                        ? detailAsset.status === VideoAssetStatus.READY
                          ? 'This short performance is READY and can now move into a submission draft.'
                          : detailAsset.status === VideoAssetStatus.FAILED
                            ? 'Replace or retry this upload to return it to the READY pipeline.'
                            : 'Keep this asset selected while upload and preparation complete.'
                        : 'Select an asset from your library to see focused detail, status, and next action.'}
                    </p>

                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                      <Link href={detailPrimaryAction.href} className="foundation-primary-button min-h-[2.9rem] px-5 py-2.5 text-sm font-semibold uppercase tracking-[0.08em]">
                        {detailPrimaryAction.label}
                      </Link>
                      <Link href="/app/uploads" className="foundation-quiet-link">
                        Return to library
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.25rem] border border-white/8 bg-white/[0.03] p-4 lg:order-1">
                <p className="text-xs uppercase tracking-[0.12em] text-white/48">Library</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {assets.slice(0, 8).map((asset) => (
                    <PremiumStageCard
                      key={asset.id}
                      href={`/app/uploads?asset=${asset.id}`}
                      imageUrl={asset.thumbnailUrl}
                      theme={getAssetTheme(asset.status)}
                      eyebrow={statusLabel[asset.status]}
                      title={asset.originalName}
                      subtitle={
                        asset.status === VideoAssetStatus.READY
                          ? 'Ready for submission attachment.'
                          : asset.status === VideoAssetStatus.FAILED
                            ? 'Retry needed.'
                            : asset.status === VideoAssetStatus.UPLOADING
                              ? 'Uploading.'
                              : 'Preparing preview.'
                      }
                      meta={
                        <>
                          <span>{(asset.size / (1024 * 1024)).toFixed(1)} MB</span>
                          <span>{detailAsset?.id === asset.id ? 'Selected' : 'Open detail'}</span>
                        </>
                      }
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </AppPage>
  );
}
