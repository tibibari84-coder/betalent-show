import { AdminSeasonCreateForm } from '@/components/admin/AdminSeasonCreateForm';
import { AdminSeasonEditForm } from '@/components/admin/AdminSeasonEditForm';
import { PremiumHero } from '@/components/premium';
import { listAdminSeasons } from '@/server/admin/show-admin.service';

export default async function AdminSeasonsPage() {
  const seasons = await listAdminSeasons();

  return (
    <div className="space-y-8">
      <PremiumHero
        eyebrow="Admin Seasons"
        tone="show"
        title={<>Season operations</>}
        subtitle="Create, edit, and archive season records with explicit state control."
      />

      <section className="foundation-panel rounded-[1.55rem] p-5 sm:p-6">
        <p className="foundation-kicker">Create season</p>
        <h2 className="mt-2 text-[1.35rem] font-semibold text-white sm:text-2xl">New season record</h2>
        <div className="mt-6">
          <AdminSeasonCreateForm />
        </div>
      </section>

      {seasons.length === 0 ? (
        <div className="foundation-panel rounded-[1.55rem] p-6 text-center text-white/62">
          No seasons created yet.
        </div>
      ) : (
        <div className="grid gap-4">
          {seasons.map((season) => (
            <section key={season.id} className="foundation-panel rounded-[1.55rem] p-5 sm:p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="foundation-kicker">{season.status}</p>
                  <h3 className="mt-2 text-[1.2rem] font-semibold text-white sm:text-xl">{season.title}</h3>
                  <p className="mt-1 text-sm text-white/52">{season.slug}</p>
                </div>
                <p className="text-xs text-white/42">Updated {season.updatedAt.toLocaleString()}</p>
              </div>
              <div className="mt-6">
                <AdminSeasonEditForm season={season} />
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
