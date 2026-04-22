import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { captureException } from '@/lib/sentry';
import { AccessError, requireApiOnboarded } from '@/server/auth/guard';
import { prisma } from '@/server/db/prisma';
import {
  ProfileValidationError,
  saveCreatorProfileTransaction,
} from '@/server/profile/profile.service';

const creatorProfileCompatibilitySchema = z.object({
  bio: z.string().max(1000).optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
});

export async function PUT(request: NextRequest) {
  try {
    const session = await requireApiOnboarded();
    const body = creatorProfileCompatibilitySchema.parse(await request.json());
    const current = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { creatorProfile: true },
    });

    if (!current) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    const result = await saveCreatorProfileTransaction(session.user.id, {
      displayName: current.displayName || current.email,
      username: current.username || current.email.split('@')[0] || 'creator',
      city: current.city || 'Unknown',
      country: current.country || 'Unknown',
      avatarUrl: current.avatarUrl,
      bio: body.bio || undefined,
      website: body.website || undefined,
    });

    return NextResponse.json({ ok: true, creatorProfile: result.creatorProfile });
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

    captureException(error, { route: 'api/creator/profile' });
    return NextResponse.json(
      { error: 'Unable to update your creator profile.' },
      { status: 500 },
    );
  }
}
