import Link from 'next/link';
import { VideoAssetStatus } from '@prisma/client';

import { DirectVideoUploadCard } from '@/components/uploads/DirectVideoUploadCard';
import {
  AppPage,
  ContentRail,
  PremiumArtworkPanel,
  PremiumCtaModule,
  PremiumEmptyState,
  PremiumErrorState,
  PremiumHero,
  PremiumMetricCard,
  PremiumStageCard,
  PremiumStatusChip,
} from '@/components/premium';
import { getAssetTheme } from '@/lib/content-presentation';
import { streamEnabled, streamWebhookVerificationEnabled } from '@/lib/stream';
import { VideoAssetService } from '@/lib/services/video-asset.service';
import { requireAuthenticatedOnboarded } from '@/server/auth/guard';

const statusLabel: Record<VideoAssetStatus, string> = {
  UPLOADING: 'Waiting for upload',
  PROCESSING: 'Processing',
  READY: 'Ready',
  FAILED: 'Needs attention',
  DELETED: 'Removed',
};

type UploadsState = 'setup' | 'empty' | 'processing' | 'ready' | 'failed' | 'mixed';

export const dynamic = 'force-dynamic';

export default async function UploadsPage() {
  const session = await requireAuthenticatedOnboarded('/app/uploads');
  const assets = await VideoAssetService.getVideoAssetsByUser(session.user.id);
  const readyAssets = assets.filter((asset) => asset.status === VideoAssetStatus.READY);
  const processingAssets = assets.filter((asset) => asset.status === VideoAssetStatus.PROCESSING || asset.status === VideoAssetStatus.UPLOADING);
  const failedAssets = assets.filter((asset) => asset.status === VideoAssetStatus.FAILED);

  const uploadsState: UploadsState = !streamEnabled
    ? 'setup'
    : assets.length === 0
      ? 'empty'
      : failedAssets.length > 0 && readyAssets.length === 0
        ? 'failed'
        : processingAssets.length > 0 && readyAssets.length === 0
          ? 'processing'
          : readyAssets.length > 0 && failedAssets.length === 0
            ? 'ready'
            : 'mixed';

  return (
    <AppPage
      hero={
        <PremiumHero
          eyebrow="Uploads"
          tone="auditions"
          title={
            uploadsState === 'setup'
              ? 'Media service unavailable'
              : uploadsState === 'empty'
                ? 'Start your media library'
                : uploadsState === 'processing'
                  ? 'Media in processing'
                  : uploadsState === 'failed'
                    ? 'Uploads need attention'
                    : uploadsState === 'ready'
                      ? 'READY media on file'
                      : 'Mixed media states'
          }
          subtitle={
            uploadsState === 'setup'
              ? 'This environment cannot create new uploads right now.'
              : uploadsState === 'empty'
                ? 'Your upload workspace is empty. Add the first performance file here.'
                : uploadsState === 'processing'
                  ? `${processingAssets.length} asset${processingAssets.length === 1 ? '' : 's'} are still moving through the pipeline.`
                  : uploadsState === 'failed'
                    ? `${failedAssets.length} asset${failedAssets.length === 1 ? '' : 's'} need another attempt.`
                    : uploadsState === 'ready'
                      ? `${readyAssets.length} READY asset${readyAssets.length === 1 ? '' : 's'} can be used next.`
                      : 'Some media is READY while other assets still need time or attention.'
          }
          artwork={
            <PremiumArtworkPanel
              theme={
                uploadsState === 'failed'
                  ? 'ember'
                  : uploadsState === 'processing'
                    ? 'gold'
                    : uploadsState === 'ready'
                      ? 'emerald'
                      : 'cobalt'
              }
              eyebrow="Library preview"
              title={assets[0]?.originalName || 'Media workspace'}
              detail={
                assets[0]
                  ? `${statusLabel[assets[0].status]} · ${(assets[0].size / (1024 * 1024)).toFixed(1)} MB`
                  : 'Upload thumbnails become the visual spine of this workspace.'
              }
              imageUrl={assets[0]?.thumbnailUrl}
              monogram={assets[0] ? undefined : 'UP'}
            />
          }
          meta={
            <>
              <PremiumStatusChip label="Ready" value={readyAssets.length} />
              <PremiumStatusChip label="Moving" value={processingAssets.length} />
              <PremiumStatusChip label="Failed" value={failedAssets.length} />
            </>
          }
        />
      }
    >
      <section className="foundation-panel rounded-[1.55rem] p-4 sm:rounded-[1.95rem] sm:p-6">
        <div className="grid gap-3 sm:grid-cols-3">
          <PremiumMetricCard label="State" value={uploadsState} />
          <PremiumMetricCard label="Ready assets" value={`${readyAssets.length} ready`} />
          <PremiumMetricCard label="Needs attention" value={`${failedAssets.length} issue${failedAssets.length === 1 ? '' : 's'}`} />
        </div>
      </section>

      {uploadsState === 'setup' ? (
        <PremiumCtaModule
          eyebrow="Setup state"
          title="Upload service not available here"
          description="This BETALENT environment is in internal/dev mode, so new media uploads are currently turned off. Existing assets still appear below when available."
          action={<span className="foundation-chip text-[0.7rem]">Internal environment</span>}
        />
      ) : (
        <DirectVideoUploadCard />
      )}

      {(uploadsState === 'processing' || uploadsState === 'mixed') && processingAssets.length > 0 ? (
        <ContentRail eyebrow="Processing" title="Moving through pipeline" subtitle="These assets are not submission-ready yet.">
          {processingAssets.map((asset) => (
            <PremiumStageCard
              key={asset.id}
              imageUrl={asset.thumbnailUrl}
              theme={getAssetTheme(asset.status)}
              eyebrow={statusLabel[asset.status]}
              title={asset.originalName}
              subtitle="Wait for READY before using this asset in submissions."
              meta={<span>{asset.mimeType}</span>}
            />
          ))}
        </ContentRail>
      ) : null}

      {uploadsState === 'failed' || (uploadsState === 'mixed' && failedAssets.length > 0) ? (
        <PremiumErrorState title="Assets need another attempt">
          Retry the failed upload path for media that did not complete processing.
        </PremiumErrorState>
      ) : null}

      <ContentRail
        eyebrow="Pipeline"
        title="Media status"
        subtitle="A real asset strategy: thumbnails when available, explicit state when not."
      >
        <PremiumStageCard
          theme="cobalt"
          eyebrow="Upload service"
          title={streamEnabled ? 'Available' : 'Unavailable'}
          subtitle={streamEnabled ? 'New media can be added from this screen.' : 'New uploads are currently paused in this environment.'}
        />
        <PremiumStageCard
          theme="emerald"
          eyebrow="Readiness updates"
          title={streamWebhookVerificationEnabled ? 'Automatic' : 'Limited'}
          subtitle={streamWebhookVerificationEnabled ? 'Assets update to READY automatically.' : 'Automatic READY confirmation is not fully enabled here yet.'}
        />
        <PremiumStageCard
          theme="ember"
          eyebrow="Next step"
          title="Use READY assets for submissions"
          subtitle="Uploads stay separate from official entry status."
        />
      </ContentRail>

      {assets.length === 0 ? (
        <PremiumEmptyState title="No uploads yet">
          {streamEnabled ? 'Start your first upload here, then return once the asset is READY.' : 'Uploads will appear here when this environment has media service access.'}
        </PremiumEmptyState>
      ) : (
        <section className="space-y-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="foundation-kicker">Assets</p>
              <h2 className="mt-2 text-[1.4rem] font-semibold text-white sm:text-2xl">Your media library</h2>
            </div>
            <Link href="/app/submissions" className="foundation-inline-action">
              Review submissions
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {assets.map((asset) => (
              <PremiumStageCard
                key={asset.id}
                imageUrl={asset.thumbnailUrl}
                theme={getAssetTheme(asset.status)}
                eyebrow={statusLabel[asset.status]}
                title={asset.originalName}
                subtitle={
                  asset.status === VideoAssetStatus.READY
                    ? 'READY for submission use.'
                    : asset.status === VideoAssetStatus.FAILED
                      ? 'Needs another upload attempt.'
                      : 'Still moving through the media pipeline.'
                }
                meta={
                  <>
                    <span>{asset.mimeType}</span>
                    <span>{(asset.size / (1024 * 1024)).toFixed(1)} MB</span>
                  </>
                }
                className="min-h-[13rem]"
              />
            ))}
          </div>
        </section>
      )}
    </AppPage>
  );
}
