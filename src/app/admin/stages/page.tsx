import { StageService } from '@/lib/services/stage.service';
import { Badge } from '@/components/ui/Badge';

type StageWithRelations = {
  id: string;
  seasonId: string;
  slug: string;
  title: string;
  description: string | null;
  orderIndex: number;
  stageType: string;
  status: string;
  submissionsOpenAt: Date | null;
  submissionsCloseAt: Date | null;
  judgingOpenAt: Date | null;
  judgingCloseAt: Date | null;
  votingOpenAt: Date | null;
  votingCloseAt: Date | null;
  resultsAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  season: {
    id: string;
    title: string;
  };
  episodes: Array<{
    id: string;
  }>;
  _count: {
    episodes: number;
  };
};

export default async function AdminStagesPage() {
  const stages = await StageService.getAllStages() as StageWithRelations[];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Stages</h1>
          <p className="text-gray-400 mt-2">Manage competition stages within seasons.</p>
        </div>
        <p className="text-sm text-gray-400">
          Stage editing is not exposed until the admin workflow is fully productized.
        </p>
      </div>

      {stages.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400">No stages created yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {stages.map((stage) => (
            <div key={stage.id} className="bg-gray-800 p-6 rounded-lg">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold">{stage.title}</h3>
                  <p className="text-gray-400 text-sm">Season: {stage.season.title}</p>
                </div>
                <Badge variant={stage.status === 'OPEN' || stage.status === 'JUDGING' ? 'default' : 'secondary'}>
                  {stage.status}
                </Badge>
              </div>

              {stage.description && (
                <p className="text-gray-400 mb-4">{stage.description}</p>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500 mb-4">
                <div>
                  <p className="font-medium">Order</p>
                  <p>{stage.orderIndex}</p>
                </div>
                <div>
                  <p className="font-medium">Episodes</p>
                  <p>{stage._count.episodes}</p>
                </div>
                <div>
                  <p className="font-medium">Start Date</p>
                  <p>{stage.submissionsOpenAt?.toLocaleDateString() || 'TBD'}</p>
                </div>
                <div>
                  <p className="font-medium">End Date</p>
                  <p>{stage.submissionsCloseAt?.toLocaleDateString() || 'TBD'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
