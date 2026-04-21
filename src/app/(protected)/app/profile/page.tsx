import { ProfileForm } from '@/components/forms/ProfileForm';
import { AppPage, FormSectionShell, PremiumAvatar, PremiumHero, PremiumStatusChip, StatusCard } from '@/components/premium';
import { requireAuthenticatedOnboarded } from '@/server/auth/guard';
import { prisma } from '@/server/db/prisma';

type ProfileState = 'setup' | 'identity' | 'complete';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const session = await requireAuthenticatedOnboarded('/app/profile');
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { creatorProfile: true },
  });

  if (!user) {
    throw new Error('Authenticated BETALENT user could not be loaded.');
  }

  const profileState: ProfileState = !user.displayName || !user.username
    ? 'setup'
    : !user.avatarUrl || !user.creatorProfile?.bio
      ? 'identity'
      : 'complete';

  return (
    <AppPage
      hero={
        <PremiumHero
          eyebrow="Profile"
          tone="profile"
          title={
            profileState === 'setup'
              ? 'Create your creator identity'
              : profileState === 'identity'
                ? 'Refine your profile presentation'
                : 'Profile presentation is ready'
          }
          subtitle={user.username ? `@${user.username}` : 'Creator handle pending'}
          artwork={
            <div className="flex items-end justify-end">
              <PremiumAvatar
                name={user.displayName || user.email}
                imageUrl={user.avatarUrl}
                className="h-36 w-36 shadow-[0_28px_70px_-32px_rgba(0,0,0,0.9)]"
              />
            </div>
          }
          meta={
            <>
              <PremiumStatusChip label="Role" value={user.role} />
              <PremiumStatusChip label="State" value={profileState} />
            </>
          }
        />
      }
    >
      <div className="foundation-page-cluster" data-columns="split">
        <FormSectionShell
          eyebrow="Profile editor"
          title="Identity control surface"
          description="Edit the details that shape your public creator identity."
        >
          <ProfileForm user={user} creatorProfile={user.creatorProfile} />
        </FormSectionShell>

        <div className="foundation-section-stack">
          <StatusCard eyebrow="Preview" title={user.displayName || 'Creator name'}>
            <div className="mt-1 text-sm text-white/54">
              {user.username ? `@${user.username}` : 'Handle pending'}
            </div>
            <div className="mt-4">
              <PremiumAvatar
                name={user.displayName || user.email}
                imageUrl={user.avatarUrl}
                className="h-24 w-24"
              />
            </div>
            <p className="mt-5 text-[13px] leading-relaxed text-white/62 sm:text-sm">
              {user.creatorProfile?.bio || 'Add a short bio to frame your presence with more intention.'}
            </p>
          </StatusCard>

          <StatusCard eyebrow="Account summary" title={profileState === 'complete' ? 'Profile complete' : 'Profile in progress'}>
            <dl className="mt-2 space-y-4 text-sm text-white/68">
              <div>
                <dt className="text-white/42">Email</dt>
                <dd className="mt-1 text-white">{user.email}</dd>
              </div>
              <div>
                <dt className="text-white/42">Location</dt>
                <dd className="mt-1 text-white">
                  {[user.city, user.country].filter(Boolean).join(', ') || 'Add your location'}
                </dd>
              </div>
              <div>
                <dt className="text-white/42">Onboarding</dt>
                <dd className="mt-1 text-white">
                  {user.onboardingCompletedAt ? 'Completed' : 'Incomplete'}
                </dd>
              </div>
            </dl>
          </StatusCard>
        </div>
      </div>
    </AppPage>
  );
}
