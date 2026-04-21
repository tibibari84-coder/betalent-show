import { PremiumHero } from '@/components/premium/PremiumHero';
import { SpotlightCard } from '@/components/premium/SpotlightCard';
import { PremiumEmptyState } from '@/components/premium/PremiumEmptyState';

export default function ProfilePage() {
  return (
    <div className="space-y-8">
      <PremiumHero
        eyebrow="Creator profile"
        tone="profile"
        title={<>A premium profile surface, staged before identity returns.</>}
        subtitle="BETALENT keeps the creator profile route in place so the public foundation already reflects the final product map, even while account-specific editing remains paused."
      />

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <SpotlightCard className="rounded-[1.75rem]">
          <p className="foundation-kicker">Foundation note</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Profile architecture is present without simulated ownership.</h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/68">
            The public release does not manufacture a fake signed-in identity. Instead, this surface establishes the future location for creator biography, presentation assets, and show-facing profile metadata.
          </p>
        </SpotlightCard>

        <div className="foundation-panel rounded-[1.75rem] p-6">
          <p className="foundation-kicker">Visual identity</p>
          <div className="mt-4 flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-xs font-semibold uppercase tracking-[0.24em] text-white/46">
              BT
            </div>
            <div>
              <p className="text-sm text-white/54">Avatar surface</p>
              <p className="mt-1 text-lg font-semibold text-white">Held for future identity layer</p>
            </div>
          </div>
        </div>
      </div>

      <PremiumEmptyState title="Public mode">
        Once authentication returns, this page becomes the creator-facing profile editor. Until then, the surface stays intentional, stable, and route-complete without implying private account ownership.
      </PremiumEmptyState>
    </div>
  );
}
