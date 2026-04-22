import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { captureException } from '@/lib/sentry';
import { AccessError, requireApiOnboarded } from '@/server/auth/guard';
import { SubmissionEngagementService } from '@/server/engagement/submission-engagement.service';

const viewSchema = z.object({
  submissionId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const session = await requireApiOnboarded();
    const body = viewSchema.parse(await request.json());

    await SubmissionEngagementService.recordSubmissionView({
      userId: session.user.id,
      submissionId: body.submissionId,
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
    captureException(error, { route: 'api/engagement/submissions/view:POST' });
    return NextResponse.json({ error: 'Unable to record view.' }, { status: 500 });
  }
}
