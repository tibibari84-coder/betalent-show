import { SeasonService } from '@/lib/services/season.service';
import { PremiumHero } from '@/components/premium/PremiumHero';
import { PremiumEmptyState } from '@/components/premium/PremiumEmptyState';
import Link from 'next/link';

export default async function SeasonsPage() {
  const seasons = await SeasonService.getAllSeasons();

  return (
    <div className="space-y-8">
      <PremiumHero
        eyebrow="Programming"
        tone="show"
        title={<>A season-led view of the BETALENT platform.</>}
        subtitle="Seasons stay at the center of the product identity: not a feed, not a creator dashboard, but a structured competition universe with an intentional viewing hierarchy."
      />

      {seasons.length === 0 ? (
        <PremiumEmptyState title="No seasons configured">
          Once production season data is entered through Prisma and Neon, this page becomes the public catalog entrance into stages, episodes, and competition pacing.
        </PremiumEmptyState>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {seasons.map((season) => (
            <Link
              key={season.id}
              href={`/app/seasons/${season.slug}`}
              className="foundation-panel rounded-[1.6rem] p-6 transition-transform hover:-translate-y-0.5"
            >
              <p className="foundation-kicker">{season.status}</p>
              <h3 className="mt-3 text-xl font-semibold text-white">{season.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/66">
                {season.description || 'Configured season metadata ready for public presentation.'}
              </p>
              <div className="flex items-center justify-between">
                <span className="mt-6 text-sm font-semibold text-[#f06b55]">Open season view</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
