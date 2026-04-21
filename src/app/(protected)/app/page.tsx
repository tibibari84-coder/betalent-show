import { SeasonService } from '@/lib/services/season.service';
import { PremiumHero } from '@/components/premium/PremiumHero';
import { SpotlightCard } from '@/components/premium/SpotlightCard';
import { PremiumEmptyState } from '@/components/premium/PremiumEmptyState';
import { SectionHeader } from '@/components/premium/SectionHeader';
import Link from 'next/link';

export default async function AppDashboardPage() {
  const seasons = await SeasonService.getAllSeasons();

  return (
    <div className="space-y-8">
      <PremiumHero
        eyebrow="BETALENT"
        tone="lobby"
        title={<>The public foundation for a premium show-first platform.</>}
        subtitle={
          <>
            The current release keeps the architecture open, cinematic, and deployable.
            Identity, creator actions, and audience flows return later without changing the route map.
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <SpotlightCard>
          <p className="foundation-kicker">Profile surface</p>
          <h2 className="mt-3 text-xl font-semibold text-white">Creator identity, held in reserve</h2>
          <p className="mt-3 text-sm leading-relaxed text-white/68">
            The profile route is already part of the product architecture, but the public baseline keeps it editorial and read-only.
          </p>
          <Link href="/app/profile" className="mt-5 inline-flex text-sm font-semibold text-[#f06b55] hover:text-[#ff8876]">
            Open profile surface
          </Link>
        </SpotlightCard>

        <SpotlightCard>
          <p className="foundation-kicker">Submission logic</p>
          <h2 className="mt-3 text-xl font-semibold text-white">Competition flow without fake actions</h2>
          <p className="mt-3 text-sm leading-relaxed text-white/68">
            Submission objects, review states, and advancement logic remain intact in the data layer while public actions stay intentionally offline.
          </p>
          <Link href="/app/submissions" className="mt-5 inline-flex text-sm font-semibold text-[#f06b55] hover:text-[#ff8876]">
            Review submission framework
          </Link>
        </SpotlightCard>

        <SpotlightCard>
          <p className="foundation-kicker">Media pipeline</p>
          <h2 className="mt-3 text-xl font-semibold text-white">Stream and storage architecture in place</h2>
          <p className="mt-3 text-sm leading-relaxed text-white/68">
            Cloudflare Stream and R2 integrations stay visible as premium infrastructure, not as unfinished consumer-facing upload promises.
          </p>
          <Link href="/app/uploads" className="mt-5 inline-flex text-sm font-semibold text-[#f06b55] hover:text-[#ff8876]">
            Explore upload architecture
          </Link>
        </SpotlightCard>
      </div>

      <section className="space-y-4">
        <SectionHeader
          eyebrow="Program"
          title="Season runway"
          subtitle="Structured seasons, stages, and episodes remain the central public expression of the BETALENT foundation."
        />

        {seasons.length === 0 ? (
          <PremiumEmptyState title="No live season data">
            The foundation is ready for programming. Once seasons are entered through Prisma and Neon, this surface becomes the public index into the competition timeline.
          </PremiumEmptyState>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {seasons.slice(0, 6).map((season) => (
              <Link
                key={season.id}
                href={`/app/seasons/${season.slug}`}
                className="foundation-panel rounded-[1.5rem] p-5 transition-transform hover:-translate-y-0.5"
              >
                <p className="foundation-kicker">{season.status}</p>
                <h3 className="mt-3 text-xl font-semibold text-white">{season.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/66">
                  {season.description || 'A structured BETALENT season configured in the production data model.'}
                </p>
                <span className="mt-6 inline-flex text-sm font-semibold text-[#f06b55]">
                  Enter season overview
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
