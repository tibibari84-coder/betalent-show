import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { captureException } from '@/lib/sentry';
import { AccessError, requireApiOnboarded } from '@/server/auth/guard';
import {
  ProfileValidationError,
  saveCreatorProfileTransaction,
} from '@/server/profile/profile.service';

const profileRequestSchema = z.object({
  displayName: z.string().min(1),
  username: z.string().min(3),
  city: z.string().min(1),
  country: z.string().min(1),
  bio: z.string().max(1000).optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
  avatarUrl: z.string().url().optional().nullable(),
  avatarUploadKey: z.string().min(1).optional().nullable(),
});

export async function PUT(request: NextRequest) {
  try {
    const session = await requireApiOnboarded();
    const body = profileRequestSchema.parse(await request.json());

    const result = await saveCreatorProfileTransaction(session.user.id, {
      displayName: body.displayName,
      username: body.username,
      city: body.city,
      country: body.country,
      bio: body.bio || undefined,
      website: body.website || undefined,
      avatarUrl: body.avatarUrl ?? null,
      avatarUploadKey: body.avatarUploadKey ?? null,
    });

    return NextResponse.json({
      ok: true,
      user: result.user,
      creatorProfile: result.creatorProfile,
    });
  } catch (error) {
    if (error instanceof AccessError) {
      const status = error.code === 'UNAUTHENTICATED' ? 401 : 403;
      return NextResponse.json({ error: error.message }, { status });
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }

    if (error instanceof ProfileValidationError) {
      const cleanedError =
        error.message === 'Avatar storage is not configured in this environment.'
          ? 'Avatar save is temporarily unavailable. Please try again later.'
          : error.message;

      return NextResponse.json(
        { error: cleanedError, fieldErrors: error.fieldErrors },
        { status: error.fieldErrors ? 400 : 409 },
      );
    }

    captureException(error, { route: 'api/profile' });
    return NextResponse.json(
      { error: 'Unable to update your profile.' },
      { status: 500 },
    );
  }
}
