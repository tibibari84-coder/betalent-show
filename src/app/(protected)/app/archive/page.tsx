import { prisma } from '@/server/db/prisma';

export default async function ArchivePage() {
  const [archivedSeasons, archivedResults, archiveRecords] = await Promise.all([
    prisma.season.count({ where: { status: 'ARCHIVED' } }),
    prisma.stageResult.count({ where: { status: 'ARCHIVED' } }),
    prisma.archiveRecord.count(),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Archive</h1>
      <p className="text-gray-400">
        Archive browsing is only exposed when archived competition data exists. This page reports
        the current persisted archive state without implying a currently running public broadcast surface.
      </p>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          ['Archived Seasons', archivedSeasons],
          ['Archived Result Packages', archivedResults],
          ['Archive Records', archiveRecords],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg bg-gray-800 p-5">
            <p className="text-sm text-gray-400">{label}</p>
            <p className="mt-2 text-3xl font-semibold">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
