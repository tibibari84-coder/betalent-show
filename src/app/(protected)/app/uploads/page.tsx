import Link from 'next/link';
import { VideoAssetStatus } from '@prisma/client';

import { DirectVideoUploadCard } from '@/components/uploads/DirectVideoUploadCard';
import {
  AppPage,
  ContentRail,
  FeatureSurface,
  PremiumArtworkPanel,
  PremiumEmptyState,
  PremiumStageCard,
  SupportPanel,
} from '@/components/premium';
import { getAssetTheme } from '@/lib/content-presentation';
import { streamEnabled, streamWebhookVerificationEnabled } from '@/lib/stream';
import { VideoAssetService } from '@/lib/services/video-asset.service';
import { requireAuthenticatedOnboarded } from '@/server/auth/guard';

const statusLabel: Record<VideoAssetStatus, string> = {
  UPLOADING: 'Uploading',
  PROCESSING: 'Processing',
  READY: 'Ready',
  FAILED: 'Needs another try',
  DELETED: 'Removed',
};

export const dynamic = 'force-dynamic';

export default async function UploadsPage() {
  const session = await requireAuthenticatedOnboarded('/app/uploads');
  const assets = await VideoAssetService.getVideoAssetsByUser(session.user.id);
  const readyAssets = assets.filter((asset) => asset.status === VideoAssetStatus.READY);
  const processingAssets = assets.filter((asset) => asset.status === VideoAssetStatus.PROCESSING || asset.status === VideoAssetStatus.UPLOADING);
  const failedAssets = assets.filter((asset) => asset.status === VideoAssetStatus.FAILED);
  const featuredAsset = readyAssets[0] ?? processingAssets[0] ?? failedAssets[0] ?? assets[0] ?? null;

  return (
    <AppPage
      hero={
        <FeatureSurface
          eyebrow="Uploads"
          tone={
            !streamEnabled
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
            !streamEnabled
              ? 'Uploads are unavailable in this environment'
              : featuredAsset
                ? 'Build a library that feels worth opening'
                : 'Your media library starts with one standout performance'
          }
          description={
            !streamEnabled
              ? 'This environment cannot create new media right now, but your existing library still stays visible.'
              : featuredAsset
                ? 'Every ready upload becomes a reusable BETALENT asset with its own cover treatment and momentum.'
                : 'The first upload turns this screen from empty space into something cinematic.'
          }
          primaryAction={
            streamEnabled
              ? <Link href="#upload-panel" className="foundation-hero-cta-primary">Add media</Link>
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
                  : 'Once a piece lands here, BETALENT can use it across the product.'
              }
              imageUrl={featuredAsset?.thumbnailUrl}
              monogram={featuredAsset ? undefined : 'UP'}
              className="min-h-[15rem]"
            />
          }
        />
      }
    >
      <div className="foundation-page-stack">
        {streamEnabled ? (
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
            eyebrow="Ready to use"
            title={
              readyAssets.length > 0
                ? `${readyAssets.length} ${readyAssets.length === 1 ? 'piece is' : 'pieces are'} ready to feature`
                : 'Nothing is ready just yet'
            }
            description={
              readyAssets.length > 0
                ? 'Use your strongest ready media wherever you need it next.'
                : 'As soon as processing finishes, the library becomes much more useful.'
            }
            tone={readyAssets.length > 0 ? 'emerald' : 'cobalt'}
            action={<Link href="/app/submissions" className="foundation-quiet-link">Use media in entries</Link>}
          />
          <SupportPanel
            eyebrow="Delivery"
            title={streamWebhookVerificationEnabled ? 'Automatic readiness is turned on' : 'Readiness updates are limited here'}
            description={
              streamWebhookVerificationEnabled
                ? 'The moment a piece becomes ready, BETALENT can treat it like a finished asset.'
                : 'Pieces may take a little longer to reflect their final status in this environment.'
            }
            tone={streamWebhookVerificationEnabled ? 'violet' : 'gold'}
          />
        </div>

        {assets.length === 0 ? (
          <PremiumEmptyState title="Media library">
            Bring in one strong performance and this space immediately starts to feel like a real collection.
          </PremiumEmptyState>
        ) : (
          <ContentRail
            eyebrow="Library"
            title="Recent media"
            subtitle="A cleaner, more editorial look at what is available now."
          >
            {assets.slice(0, 6).map((asset) => (
              <PremiumStageCard
                key={asset.id}
                imageUrl={asset.thumbnailUrl}
                theme={getAssetTheme(asset.status)}
                eyebrow={statusLabel[asset.status]}
                title={asset.originalName}
                subtitle={
                  asset.status === VideoAssetStatus.READY
                    ? 'Ready to feature in the next move.'
                    : asset.status === VideoAssetStatus.FAILED
                      ? 'This upload needs another attempt.'
                      : 'Still settling into the library.'
                }
                meta={<span>{(asset.size / (1024 * 1024)).toFixed(1)} MB</span>}
              />
            ))}
          </ContentRail>
        )}
      </div>
    </AppPage>
  );
}
