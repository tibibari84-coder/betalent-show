import { NextRequest, NextResponse } from 'next/server';

export async function PUT(request: NextRequest) {
  void request;

  return NextResponse.json(
    {
      error:
        'Profile mutations are disabled in the current public-only BETALENT foundation.',
    },
    { status: 503 },
  );
}
