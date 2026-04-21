import Link from 'next/link';

import { PremiumCtaModule, PremiumHero, PremiumStageCard } from '@/components/premium';
import { listRecentAuditLogs } from '@/server/admin/audit-log.service';
import { listAdminDashboardMetrics, listAdminRecentSubmissions } from '@/server/admin/show-admin.service';

export default async function AdminDashboardPage() {
  const [metrics, recentAuditLogs, recentSubmissions] = await Promise.all([
    listAdminDashboardMetrics(),
    listRecentAuditLogs(),
    listAdminRecentSubmissions(),
  ]);

  return (
    <div className="space-y-8">
      <PremiumHero
        eyebrow="Admin"
        tone="archive"
        title={<>Show control is live</>}
        subtitle="Operate structure, review submissions, and verify audit-backed change history."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {[
          ['Seasons', metrics.seasonCount],
          ['Stages', metrics.stageCount],
          ['Episodes', metrics.episodeCount],
          ['Submissions', metrics.submissionCount],
          ['Creator Profiles', metrics.creatorCount],
        ].map(([label, value]) => (
          <div key={String(label)} className="foundation-panel rounded-[1.45rem] p-5">
            <p className="foundation-kicker">{label}</p>
            <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
          </div>
        ))}
      </div>

      <PremiumCtaModule
        eyebrow="Operations"
        title="Admin is now an operating surface"
        description="Create and edit seasons, stages, and episodes from UI. Review queue status changes are lifecycle-guarded and audit-backed."
        action={<Link href="/admin/submissions" className="foundation-chip text-[0.7rem]">Open review queue</Link>}
        secondaryAction={<Link href="/admin/seasons" className="foundation-chip text-[0.7rem]">Manage show structure</Link>}
      />

      <section className="space-y-4">
        <div>
          <p className="foundation-kicker">Recent queue</p>
          <h2 className="mt-2 text-[1.4rem] font-semibold text-white sm:text-2xl">Latest reviewable work</h2>
        </div>
        {recentSubmissions.length === 0 ? (
          <div className="foundation-panel rounded-[1.55rem] p-6 text-sm text-white/62">
            No recent submissions are available for review.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {recentSubmissions.map((submission) => (
              <PremiumStageCard
                key={submission.id}
                href="/admin/submissions"
                imageUrl={submission.videoAsset.thumbnailUrl}
                eyebrow={submission.status}
                title={submission.title}
                subtitle={submission.user.displayName || submission.user.username || submission.user.email}
                meta={<span>{submission.videoAsset.status}</span>}
              />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div>
          <p className="foundation-kicker">Audit trail</p>
          <h2 className="mt-2 text-[1.4rem] font-semibold text-white sm:text-2xl">Recent mutations</h2>
        </div>
        {recentAuditLogs.length === 0 ? (
          <div className="foundation-panel rounded-[1.55rem] p-6 text-sm text-white/62">
            No audit-backed admin mutations have been recorded yet.
          </div>
        ) : (
          <div className="grid gap-4">
            {recentAuditLogs.map((entry) => (
              <div key={entry.id} className="foundation-panel rounded-[1.35rem] p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">{entry.action}</p>
                    <p className="text-sm text-white/56">
                      {entry.entityType} · {entry.entityId}
                    </p>
                  </div>
                  <p className="text-xs text-white/44">
                    {entry.user?.displayName || entry.user?.username || entry.user?.email || 'System'} · {entry.createdAt.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
