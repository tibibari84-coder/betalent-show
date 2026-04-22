import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { captureException } from '@/lib/sentry';
import { AccessError, requireApiOnboarded } from '@/server/auth/guard';
import { FollowService } from '@/server/engagement/follow.service';

const followSchema = z.object({
  creatorId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const session = await requireApiOnboarded();
    const body = followSchema.parse(await request.json());

    await FollowService.followCreator({
      followerUserId: session.user.id,
      creatorId: body.creatorId,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof AccessError) {
      return NextResponse.json({ error: error.message }, { status: error.code === 'UNAUTHENTICATED' ? 401 : 403 });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    captureException(error, { route: 'api/engagement/creators/follow:POST' });
    return NextResponse.json({ error: 'Unable to follow creator.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await requireApiOnboarded();
    const body = followSchema.parse(await request.json());

    await FollowService.unfollowCreator({
      followerUserId: session.user.id,
      creatorId: body.creatorId,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof AccessError) {
      return NextResponse.json({ error: error.message }, { status: error.code === 'UNAUTHENTICATED' ? 401 : 403 });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    captureException(error, { route: 'api/engagement/creators/follow:DELETE' });
    return NextResponse.json({ error: 'Unable to unfollow creator.' }, { status: 500 });
  }
}
