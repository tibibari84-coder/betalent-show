import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { POSTHOG_EVENTS, trackEvent } from '@/lib/analytics/posthog';
import { captureException, captureMessage } from '@/lib/sentry';
import { CreatorProfileService } from '@/lib/services/creator-profile.service';
import { AccessError, requireApiOnboarded } from '@/server/auth/guard';

const creatorProfileSchema = z.object({
  bio: z.string().max(1000).optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
});

export async function PUT(request: NextRequest) {
  try {
    const session = await requireApiOnboarded();
    const body = creatorProfileSchema.parse(await request.json());

    const creatorProfile = await CreatorProfileService.createOrUpdateCreatorProfile(
      session.user.id,
      {
        bio: body.bio?.trim() || undefined,
        website: body.website?.trim() || undefined,
      },
    );

    await trackEvent(POSTHOG_EVENTS.creator_profile_completed, {
      distinctId: session.user.id,
      creatorProfileId: creatorProfile.id,
    });
    captureMessage('Creator profile updated.', 'info', {
      userId: session.user.id,
      creatorProfileId: creatorProfile.id,
      hasBio: Boolean(creatorProfile.bio),
      hasWebsite: Boolean(creatorProfile.website),
    });

    return NextResponse.json({ ok: true, creatorProfile });
  } catch (error) {
    if (error instanceof AccessError) {
      const status = error.code === 'UNAUTHENTICATED' ? 401 : 403;
      return NextResponse.json({ error: error.message }, { status });
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }

    captureException(error, { route: 'api/creator/profile' });
    return NextResponse.json(
      { error: 'Unable to update your creator profile.' },
      { status: 500 },
    );
  }
}
