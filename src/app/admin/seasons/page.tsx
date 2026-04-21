import { SeasonService } from '@/lib/services/season.service';
import { Badge } from '@/components/ui/Badge';

export default async function AdminSeasonsPage() {
  const seasons = await SeasonService.getAllSeasons();

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Seasons</h1>
          <p className="text-gray-400 mt-2">Manage show seasons and their configurations.</p>
        </div>
        <p className="text-sm text-gray-400">
          Creation is handled through Prisma seeds or direct admin workflows, not stub UI controls.
        </p>
      </div>

      {seasons.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400">No seasons created yet.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {seasons.map((season) => (
            <div key={season.id} className="bg-gray-800 p-6 rounded-lg">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-semibold">{season.title}</h3>
                <Badge variant={season.status === 'LIVE' ? 'default' : 'secondary'}>
                  {season.status}
                </Badge>
              </div>

              {season.description && (
                <p className="text-gray-400 mb-4">{season.description}</p>
              )}

              <div className="text-sm text-gray-500 space-y-1">
                <p>Slug: {season.slug}</p>
                <p>Created: {season.createdAt.toLocaleDateString()}</p>
                <p>Updated: {season.updatedAt.toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
