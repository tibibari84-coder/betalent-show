import { prisma } from '@/server/db/prisma';

export default async function AdminDashboardPage() {
  const [seasonCount, stageCount, episodeCount, submissionCount, creatorCount] =
    await Promise.all([
      prisma.season.count(),
      prisma.stage.count(),
      prisma.episode.count(),
      prisma.submission.count(),
      prisma.creatorProfile.count(),
    ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="mt-2 text-gray-400">
          Read-only operational overview for the BETALENT foundation.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {[
          ['Seasons', seasonCount],
          ['Stages', stageCount],
          ['Episodes', episodeCount],
          ['Submissions', submissionCount],
          ['Creator Profiles', creatorCount],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg bg-gray-800 p-5">
            <p className="text-sm text-gray-400">{label}</p>
            <p className="mt-2 text-3xl font-semibold">{value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-gray-800 bg-gray-900/70 p-5 text-sm text-gray-300">
        Admin create/edit workflows are intentionally not exposed as fake buttons yet.
        The current shipped surface is a verified read-only console over the persisted
        Prisma models.
      </div>
    </div>
  );
}
