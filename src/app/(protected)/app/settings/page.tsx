import { AppPage, PremiumCtaModule, PremiumHero, PremiumStatusChip, StatusCard } from '@/components/premium';
import { logoutAction } from '@/server/auth/actions';
import { requireAuthenticatedOnboarded } from '@/server/auth/guard';

export default async function SettingsPage() {
  const session = await requireAuthenticatedOnboarded('/app/settings');

  return (
    <AppPage
      hero={
        <PremiumHero
          eyebrow="Settings"
          tone="archive"
          title={<>Account control</>}
          subtitle="Session, role, and sign-out"
          meta={
            <>
              <PremiumStatusChip label="Role" value={session.user.role} />
              <PremiumStatusChip label="ID" value={session.user.username ? `@${session.user.username}` : 'No handle'} />
            </>
          }
        />
      }
    >
      <div className="foundation-page-cluster" data-columns="split">
        <StatusCard eyebrow="Email" title={session.user.email} />
        <StatusCard eyebrow="Role" title={session.user.role} />
      </div>

      <PremiumCtaModule
        eyebrow="Session"
        title="Secure account session"
        description="Secure session cookies keep this creator shell signed in across BETALENT."
        action={
          <form action={logoutAction}>
            <button
              type="submit"
              className="foundation-primary-button px-5 py-2.5 text-sm font-semibold uppercase tracking-[0.08em] transition"
            >
              Sign out
            </button>
          </form>
        }
      />
    </AppPage>
  );
}
