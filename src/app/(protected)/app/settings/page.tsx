import { AppPage, FeatureSurface, PremiumArtworkPanel, PremiumStatusChip, SupportPanel } from '@/components/premium';
import { logoutAction } from '@/server/auth/actions';
import { requireAuthenticatedOnboarded } from '@/server/auth/guard';

export default async function SettingsPage() {
  const session = await requireAuthenticatedOnboarded('/app/settings');

  return (
    <AppPage
      hero={
        <FeatureSurface
          eyebrow="Settings"
          tone="cobalt"
          title="Account control"
          description="Session, role, and sign-out"
          meta={
            <>
              <PremiumStatusChip label="Role" value={session.user.role} />
              <PremiumStatusChip label="ID" value={session.user.username ? `@${session.user.username}` : 'No handle'} />
            </>
          }
          media={
            <PremiumArtworkPanel
              theme="cobalt"
              eyebrow="Account"
              title={session.user.username ? `@${session.user.username}` : 'No handle'}
              detail="Secure session and account access."
              monogram="AC"
              className="min-h-[12rem]"
            />
          }
        />
      }
    >
      <div className="foundation-page-stack">
        <div className="foundation-support-grid">
          <SupportPanel
            eyebrow="Email"
            title={session.user.email}
            description="Primary account identity for this BETALENT session."
            tone="cobalt"
          />
          <SupportPanel
            eyebrow="Role"
            title={session.user.role}
            description="Current permission level in the creator workspace."
            tone="violet"
          />
        </div>

        <SupportPanel
          eyebrow="Session"
          title="Secure account session"
          description="Secure session cookies keep this creator shell signed in across BETALENT."
          tone="cobalt"
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
      </div>
    </AppPage>
  );
}
