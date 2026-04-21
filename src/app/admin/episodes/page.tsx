import { AdminEpisodeCreateForm } from '@/components/admin/AdminEpisodeCreateForm';
import { AdminEpisodeEditForm } from '@/components/admin/AdminEpisodeEditForm';
import { PremiumHero } from '@/components/premium';
import { listAdminEpisodes, listAdminSeasons, listAdminStages } from '@/server/admin/show-admin.service';

export default async function AdminEpisodesPage() {
  const [episodes, seasons, stages] = await Promise.all([
    listAdminEpisodes(),
    listAdminSeasons(),
    listAdminStages(),
  ]);

  return (
    <div className="space-y-8">
      <PremiumHero
        eyebrow="Admin Episodes"
        tone="archive"
        title={<>Episode operations</>}
        subtitle="Create, edit, publish-state, and archive episode records from the UI."
      />

      <section className="foundation-panel rounded-[1.55rem] p-5 sm:p-6">
        <p className="foundation-kicker">Create episode</p>
        <h2 className="mt-2 text-[1.35rem] font-semibold text-white sm:text-2xl">New episode record</h2>
        <div className="mt-6">
          <AdminEpisodeCreateForm
            seasons={seasons.map((season) => ({ id: season.id, title: season.title, status: season.status }))}
            stages={stages.map((stage) => ({ id: stage.id, title: stage.title, season: { title: stage.season.title } }))}
          />
        </div>
      </section>

      {episodes.length === 0 ? (
        <div className="foundation-panel rounded-[1.55rem] p-6 text-center text-white/62">
          No episodes created yet.
        </div>
      ) : (
        <div className="grid gap-4">
          {episodes.map((episode) => (
            <section key={episode.id} className="foundation-panel rounded-[1.55rem] p-5 sm:p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="foundation-kicker">{episode.status}</p>
                  <h3 className="mt-2 text-[1.2rem] font-semibold text-white sm:text-xl">{episode.title}</h3>
                  <p className="mt-1 text-sm text-white/52">
                    {episode.stage ? `${episode.season.title} → ${episode.stage.title}` : episode.season.title} · order {episode.orderIndex}
                  </p>
                </div>
                <p className="text-xs text-white/42">Updated {episode.updatedAt.toLocaleString()}</p>
              </div>
              <div className="mt-6">
                <AdminEpisodeEditForm
                  episode={episode}
                  seasons={seasons.map((season) => ({ id: season.id, title: season.title, status: season.status }))}
                  stages={stages.map((stage) => ({
                    id: stage.id,
                    title: stage.title,
                    seasonId: stage.seasonId,
                    season: { title: stage.season.title },
                  }))}
                />
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
