import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { captureException } from '@/lib/sentry';
import { AccessError, requireApiOnboarded } from '@/server/auth/guard';
import { prisma } from '@/server/db/prisma';
import {
  ProfileValidationError,
  saveCreatorProfileTransaction,
} from '@/server/profile/profile.service';

const userProfileCompatibilitySchema = z.object({
  displayName: z.string().min(1),
  username: z.string().min(3),
  city: z.string().min(1),
  country: z.string().min(1),
  avatarUrl: z.string().url().optional().nullable(),
  avatarUploadKey: z.string().min(1).optional().nullable(),
});

export async function PUT(request: NextRequest) {
  try {
    const session = await requireApiOnboarded();
    const body = userProfileCompatibilitySchema.parse(await request.json());
    const current = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { creatorProfile: true },
    });

    if (!current) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    const result = await saveCreatorProfileTransaction(session.user.id, {
      displayName: body.displayName,
      username: body.username,
      city: body.city,
      country: body.country,
      avatarUrl: body.avatarUrl ?? current.avatarUrl,
      avatarUploadKey: body.avatarUploadKey ?? null,
      bio: current.creatorProfile?.bio || undefined,
      website: current.creatorProfile?.website || undefined,
    });

    return NextResponse.json({ ok: true, user: result.user });
  } catch (error) {
    if (error instanceof AccessError) {
      const status = error.code === 'UNAUTHENTICATED' ? 401 : 403;
      return NextResponse.json({ error: error.message }, { status });
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }

    if (error instanceof ProfileValidationError) {
      return NextResponse.json(
        { error: error.message, fieldErrors: error.fieldErrors },
        { status: error.fieldErrors ? 400 : 409 },
      );
    }

    captureException(error, { route: 'api/user/profile' });
    return NextResponse.json({ error: 'Unable to update your profile.' }, { status: 500 });
  }
}
