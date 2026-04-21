import { AdminStageCreateForm } from '@/components/admin/AdminStageCreateForm';
import { AdminStageEditForm } from '@/components/admin/AdminStageEditForm';
import { PremiumHero } from '@/components/premium';
import { listAdminSeasons, listAdminStages } from '@/server/admin/show-admin.service';

export default async function AdminStagesPage() {
  const [stages, seasons] = await Promise.all([listAdminStages(), listAdminSeasons()]);

  return (
    <div className="space-y-8">
      <PremiumHero
        eyebrow="Admin Stages"
        tone="results"
        title={<>Stage operations</>}
        subtitle="Create, edit, and archive stage records with lifecycle guardrails."
      />

      <section className="foundation-panel rounded-[1.55rem] p-5 sm:p-6">
        <p className="foundation-kicker">Create stage</p>
        <h2 className="mt-2 text-[1.35rem] font-semibold text-white sm:text-2xl">New stage record</h2>
        <div className="mt-6">
          <AdminStageCreateForm seasons={seasons.map((season) => ({ id: season.id, title: season.title, status: season.status }))} />
        </div>
      </section>

      {stages.length === 0 ? (
        <div className="foundation-panel rounded-[1.55rem] p-6 text-center text-white/62">
          No stages created yet.
        </div>
      ) : (
        <div className="grid gap-4">
          {stages.map((stage) => (
            <section key={stage.id} className="foundation-panel rounded-[1.55rem] p-5 sm:p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="foundation-kicker">{stage.stageType} · {stage.status}</p>
                  <h3 className="mt-2 text-[1.2rem] font-semibold text-white sm:text-xl">{stage.title}</h3>
                  <p className="mt-1 text-sm text-white/52">{stage.season.title} · order {stage.orderIndex} · {stage._count.episodes} episodes</p>
                </div>
                <p className="text-xs text-white/42">Updated {stage.updatedAt.toLocaleString()}</p>
              </div>
              <div className="mt-6">
                <AdminStageEditForm
                  stage={stage}
                  seasons={seasons.map((season) => ({ id: season.id, title: season.title, status: season.status }))}
                />
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
