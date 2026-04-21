import { VideoAssetStatus } from '@prisma/client';

import { DirectVideoUploadCard } from '@/components/uploads/DirectVideoUploadCard';
import { PremiumHero } from '@/components/premium/PremiumHero';
import { SpotlightCard } from '@/components/premium/SpotlightCard';
import { streamEnabled, streamWebhookVerificationEnabled } from '@/lib/stream';

const statusLabel: Record<VideoAssetStatus, string> = {
  UPLOADING: 'Upload created',
  PROCESSING: 'Processing',
  READY: 'Ready for submission',
  FAILED: 'Failed',
  DELETED: 'Deleted',
};

export default async function UploadsPage() {
  return (
    <div className="space-y-8">
      <PremiumHero
        eyebrow="Media infrastructure"
        tone="auditions"
        title={<>Upload architecture with a premium public presentation.</>}
        subtitle="Cloudflare Stream and R2 are already part of the BETALENT foundation. This surface documents the media pipeline clearly while keeping public deploys free from unfinished account-bound actions."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <SpotlightCard>
          <p className="text-sm text-gray-400">Stream direct upload init</p>
          <p className="mt-2 text-lg font-semibold text-white">{streamEnabled ? 'Configured' : 'Missing config'}</p>
          <p className="mt-3 text-sm text-white/64">`POST /api/assets/stream-init`</p>
        </SpotlightCard>
        <SpotlightCard>
          <p className="text-sm text-gray-400">Webhook verification</p>
          <p className="mt-2 text-lg font-semibold text-white">
            {streamWebhookVerificationEnabled ? 'Configured' : 'Missing secret'}
          </p>
          <p className="mt-3 text-sm text-white/64">`POST /api/webhooks/cloudflare-stream`</p>
        </SpotlightCard>
        <SpotlightCard>
          <p className="text-sm text-gray-400">Submission boundary</p>
          <p className="mt-2 text-lg font-semibold text-white">READY asset required</p>
          <p className="mt-3 text-sm text-white/64">
            Uploads and official submissions remain separate persisted objects.
          </p>
        </SpotlightCard>
      </div>

      <div className="foundation-panel rounded-[1.5rem] p-5 text-sm text-white/72">
        Contract summary: init an upload, POST the file directly to Cloudflare Stream, wait for
        the verified webhook to mark the asset `READY`, then attach that asset to a formal
        `Submission`. In the current public-only baseline, this remains documented architecture.
      </div>

      <DirectVideoUploadCard />

      <div className="foundation-panel rounded-[1.5rem] p-6 text-white/72">
        <p className="foundation-kicker">Public behavior</p>
        <p className="mt-3 text-sm leading-relaxed text-white/64">
          Direct upload creation is intentionally disabled without a user identity boundary, so
          public deploys do not generate orphaned assets.
        </p>
        <div className="mt-5 flex flex-wrap gap-3 text-xs text-white/60">
          {Object.entries(statusLabel).map(([status, label]) => (
            <span key={status} className="rounded-full border border-white/8 bg-white/[0.05] px-3 py-1">
              {status}: {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
