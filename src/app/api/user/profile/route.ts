import { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { POSTHOG_EVENTS, identifyUser, trackEvent } from '@/lib/analytics/posthog';
import { captureException, captureMessage } from '@/lib/sentry';
import { UserService } from '@/lib/services/user.service';
import { requireApiOnboarded, AccessError } from '@/server/auth/guard';
import {
  normalizeUsername,
  validateCity,
  validateCountry,
  validateDisplayName,
  validateUsername,
} from '@/server/onboarding/validators';

const profileRequestSchema = z.object({
  displayName: z.string().min(1),
  username: z.string().min(3),
  city: z.string().min(1),
  country: z.string().min(1),
  avatarUrl: z.string().url().optional().nullable(),
});

function validationErrorMessage(input: z.infer<typeof profileRequestSchema>) {
  return {
    displayName: validateDisplayName(input.displayName),
    username: validateUsername(input.username),
    city: validateCity(input.city),
    country: validateCountry(input.country),
  };
}

export async function PUT(request: NextRequest) {
  try {
    const session = await requireApiOnboarded();
    const body = profileRequestSchema.parse(await request.json());
    const fieldErrors = validationErrorMessage(body);

    if (fieldErrors.displayName || fieldErrors.username || fieldErrors.city || fieldErrors.country) {
      return NextResponse.json(
        { error: 'Invalid profile payload.', fieldErrors },
        { status: 400 },
      );
    }

    const updatedUser = await UserService.updateUserProfile(session.user.id, {
      displayName: body.displayName.trim(),
      username: normalizeUsername(body.username),
      city: body.city.trim(),
      country: body.country.trim(),
      avatarUrl: body.avatarUrl ?? null,
    });

    await identifyUser(updatedUser.id, {
      email: updatedUser.email,
      username: updatedUser.username,
      displayName: updatedUser.displayName,
      role: updatedUser.role,
      city: updatedUser.city,
      country: updatedUser.country,
    });
    await trackEvent(POSTHOG_EVENTS.creator_profile_started, {
      distinctId: updatedUser.id,
      username: updatedUser.username,
      role: updatedUser.role,
    });
    captureMessage('User profile updated.', 'info', {
      userId: updatedUser.id,
      role: updatedUser.role,
      hasAvatar: Boolean(updatedUser.avatarUrl),
    });

    return NextResponse.json({ ok: true, user: updatedUser });
  } catch (error) {
    if (error instanceof AccessError) {
      const status = error.code === 'UNAUTHENTICATED' ? 401 : 403;
      return NextResponse.json({ error: error.message }, { status });
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return NextResponse.json(
        { error: 'That username is already taken.' },
        { status: 409 },
      );
    }

    captureException(error, { route: 'api/user/profile' });
    return NextResponse.json(
      { error: 'Unable to update your profile.' },
      { status: 500 },
    );
  }
}
