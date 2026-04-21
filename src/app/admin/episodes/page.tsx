import { EpisodeService } from '@/lib/services/episode.service';
import { Badge } from '@/components/ui/Badge';

type EpisodeWithRelations = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  orderIndex: number;
  seasonId: string;
  premiereAt: Date | null;
  publishedAt: Date | null;
  stageId: string | null;
  season: {
    id: string;
    title: string;
  };
  stage: {
    id: string;
    title: string;
  } | null;
  performances: Array<{
    id: string;
  }>;
};

export default async function AdminEpisodesPage() {
  const episodes = await EpisodeService.getAllEpisodes() as EpisodeWithRelations[];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Episodes</h1>
          <p className="text-gray-400 mt-2">Manage individual show episodes and performances.</p>
        </div>
        <p className="text-sm text-gray-400">
          Episode creation remains schema-backed and intentionally out of the public admin UI for now.
        </p>
      </div>

      {episodes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400">No episodes created yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {episodes.map((episode) => (
            <div key={episode.id} className="bg-gray-800 p-6 rounded-lg">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold">{episode.title}</h3>
                  <p className="text-gray-400 text-sm">
                    {episode.stage ? `${episode.season.title} → ${episode.stage.title}` : episode.season.title}
                  </p>
                </div>
                <Badge variant={episode.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                  {episode.status || 'Draft'}
                </Badge>
              </div>

              {episode.description && (
                <p className="text-gray-400 mb-4">{episode.description}</p>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500 mb-4">
                <div>
                  <p className="font-medium">Order</p>
                  <p>{episode.orderIndex}</p>
                </div>
                <div>
                  <p className="font-medium">Air Date</p>
                  <p>{episode.premiereAt?.toLocaleDateString() || 'TBD'}</p>
                </div>
                <div>
                  <p className="font-medium">Performances</p>
                  <p>{episode.performances?.length || 0}</p>
                </div>
                <div>
                  <p className="font-medium">Status</p>
                  <p>{episode.status || 'Draft'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
