import { PremiumHero } from '@/components/premium/PremiumHero';
import { SpotlightCard } from '@/components/premium/SpotlightCard';
import { PremiumEmptyState } from '@/components/premium/PremiumEmptyState';

export default function SubmissionsPage() {
  return (
    <div className="space-y-8">
      <PremiumHero
        eyebrow="Competition flow"
        tone="results"
        title={<>Submission logic remains part of the product, even in public mode.</>}
        subtitle="The current release keeps the route, states, and data model visible without faking private creator actions. What exists is the structure, not a simulated signed-in experience."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <SpotlightCard>
          <p className="foundation-kicker">Entry state</p>
          <h2 className="mt-3 text-lg font-semibold text-white">Draft to review lifecycle</h2>
          <p className="mt-3 text-sm leading-relaxed text-white/66">
            Submissions stay modeled as real objects with review progression and show-facing outcomes.
          </p>
        </SpotlightCard>
        <SpotlightCard>
          <p className="foundation-kicker">Media boundary</p>
          <h2 className="mt-3 text-lg font-semibold text-white">Uploads are not submissions</h2>
          <p className="mt-3 text-sm leading-relaxed text-white/66">
            BETALENT keeps official submission truth separate from uploaded media assets and provider processing.
          </p>
        </SpotlightCard>
        <SpotlightCard>
          <p className="foundation-kicker">Public posture</p>
          <h2 className="mt-3 text-lg font-semibold text-white">No simulated creator queue</h2>
          <p className="mt-3 text-sm leading-relaxed text-white/66">
            The route remains calm and intentional instead of inventing personal submission history that does not exist publicly.
          </p>
        </SpotlightCard>
      </div>

      <PremiumEmptyState title="Public release">
        Formal creator submission management returns in a later phase. For now, this surface establishes the exact route where submission lists, states, and review outcomes will live inside the finished BETALENT product.
      </PremiumEmptyState>
    </div>
  );
}
