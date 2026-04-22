import { ProfileForm } from '@/components/forms/ProfileForm';
import { EngagementCountChip } from '@/components/engagement/EngagementCountChip';
import { AppPage, FeatureSurface, FormSectionShell, PremiumAvatar, PremiumStatusChip, StatusCard } from '@/components/premium';
import { requireAuthenticatedOnboarded } from '@/server/auth/guard';
import { prisma } from '@/server/db/prisma';
import { FollowService } from '@/server/engagement/follow.service';

type ProfileState = 'setup' | 'identity' | 'complete';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const session = await requireAuthenticatedOnboarded('/app/profile');
  const [user, followCounts] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      include: { creatorProfile: true },
    }),
    FollowService.getUserEngagementCounts(session.user.id),
  ]);

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
        <FeatureSurface
          eyebrow="Profile"
          tone="violet"
          title={
            profileState === 'setup'
              ? 'Build your public identity'
              : profileState === 'identity'
                ? 'Refine your public profile'
                : 'Profile is ready'
          }
          description={
            user.username
              ? `@${user.username} · Profile is who you are across BETALENT`
              : 'Profile is who you are across BETALENT'
          }
          media={
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
              <EngagementCountChip icon="followers" label="Followers" value={followCounts.followerCount} />
              <EngagementCountChip icon="following" label="Following" value={followCounts.followingCount} />
            </>
          }
        />
      }
    >
      <div className="foundation-page-cluster" data-columns="split">
        <FormSectionShell
          eyebrow="Profile editor"
          title="Identity controls"
          description="Set avatar, name, handle, bio, and location. Workflow stays in Creator."
        >
          <ProfileForm user={user} creatorProfile={user.creatorProfile} />
        </FormSectionShell>

        <div className="foundation-section-stack">
          <StatusCard eyebrow="Public preview" title={user.displayName || 'Your name'}>
            <div className="mt-1 text-sm text-white/54">
              {user.username ? `@${user.username}` : 'Add a handle'}
            </div>
            <div className="mt-4">
              <PremiumAvatar
                name={user.displayName || user.email}
                imageUrl={user.avatarUrl}
                className="h-24 w-24"
              />
            </div>
            <p className="mt-5 text-[13px] leading-relaxed text-white/62 sm:text-sm">
              {user.creatorProfile?.bio || 'Add a short bio so this profile reads like a finished introduction.'}
            </p>
          </StatusCard>

          <StatusCard eyebrow="Identity status" title={profileState === 'complete' ? 'Profile complete' : 'Profile in progress'}>
            <dl className="mt-2 space-y-4 text-sm text-white/68">
              <div>
                <dt className="text-white/42">Email</dt>
                <dd className="mt-1 text-white">{user.email}</dd>
              </div>
              <div>
                <dt className="text-white/42">Avatar</dt>
                <dd className="mt-1 text-white">{user.avatarUrl ? 'Ready' : 'Add portrait image'}</dd>
              </div>
              <div>
                <dt className="text-white/42">Location</dt>
                <dd className="mt-1 text-white">
                  {[user.city, user.country].filter(Boolean).join(', ') || 'Set city and country'}
                </dd>
              </div>
              <div>
                <dt className="text-white/42">Bio</dt>
                <dd className="mt-1 text-white">{user.creatorProfile?.bio ? 'Ready' : 'Add short bio'}</dd>
              </div>
              <div>
                <dt className="text-white/42">Creator workspace</dt>
                <dd className="mt-1 text-white">
                  Uploads and submissions live in Creator
                </dd>
              </div>
            </dl>
          </StatusCard>
        </div>
      </div>
    </AppPage>
  );
}
