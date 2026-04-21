import { AdminSubmissionStatusForm } from '@/components/admin/AdminSubmissionStatusForm';
import { PremiumHero } from '@/components/premium';
import { allowedSubmissionTransitions, listAdminRecentSubmissions, listAdminSubmissionQueue } from '@/server/admin/show-admin.service';

export default async function AdminSubmissionsPage() {
  const [queue, recent] = await Promise.all([
    listAdminSubmissionQueue(),
    listAdminRecentSubmissions(),
  ]);

  return (
    <div className="space-y-8">
      <PremiumHero
        eyebrow="Admin Review"
        tone="results"
        title={<>Submission review queue</>}
        subtitle="Pending and under-review submissions now move through real server-side lifecycle rules."
      />

      {queue.length === 0 ? (
        <div className="foundation-panel rounded-[1.55rem] p-6 text-center text-white/62">
          No pending or reviewable submissions are in the queue right now.
        </div>
      ) : (
        <div className="grid gap-4">
          {queue.map((submission) => (
            <section key={submission.id} className="foundation-panel rounded-[1.55rem] p-5 sm:p-6">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3">
                  <div>
                    <p className="foundation-kicker">{submission.status.replace('_', ' ')}</p>
                    <h3 className="mt-2 text-[1.2rem] font-semibold text-white sm:text-xl">{submission.title}</h3>
                    <p className="mt-2 text-sm text-white/62">{submission.description || 'No submission description provided.'}</p>
                  </div>
                  <div className="grid gap-2 text-sm text-white/54 sm:grid-cols-2">
                    <p>Creator: {submission.user.displayName || submission.user.username || submission.user.email}</p>
                    <p>Asset: {submission.videoAsset.originalName}</p>
                    <p>Asset status: {submission.videoAsset.status}</p>
                    <p>Submitted: {submission.submittedAt?.toLocaleString() || submission.createdAt.toLocaleString()}</p>
                  </div>
                  <div className="rounded-[1rem] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-white/66">
                    Allowed next states: {allowedSubmissionTransitions[submission.status].length > 0 ? allowedSubmissionTransitions[submission.status].join(', ') : 'none'}
                  </div>
                </div>
                <div className="w-full max-w-sm space-y-4">
                  <AdminSubmissionStatusForm
                    submissionId={submission.id}
                    currentStatus={submission.status}
                    allowedNext={allowedSubmissionTransitions[submission.status]}
                  />
                </div>
              </div>
            </section>
          ))}
        </div>
      )}

      <section className="space-y-4">
        <div>
          <p className="foundation-kicker">Recent submission history</p>
          <h2 className="mt-2 text-[1.4rem] font-semibold text-white sm:text-2xl">Latest updated submissions</h2>
        </div>
        <div className="grid gap-4">
          {recent.map((submission) => (
            <div key={submission.id} className="foundation-panel rounded-[1.35rem] p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">{submission.title}</p>
                  <p className="text-sm text-white/56">
                    {submission.user.displayName || submission.user.username || submission.user.email} · {submission.status.replace('_', ' ')}
                  </p>
                </div>
                <p className="text-xs text-white/44">{submission.updatedAt.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
