export type EmailSendResult =
  | { ok: true; skipped: false; id: string | null }
  | { ok: false; skipped: true; reason: string }
  | { ok: false; skipped: false; reason: string };

type SendEmailDeps = {
  providerEnabled: boolean;
  defaultFrom: string | null;
  send: (input: {
    from: string;
    to: string;
    subject: string;
    html: string;
  }) => Promise<{ data?: { id?: string | null } | null }>;
  onError: (error: unknown, context?: Record<string, unknown>) => void;
};

export async function sendEmailWithDeps(
  deps: SendEmailDeps,
  args: {
    to: string;
    subject: string;
    html: string;
    tag: string;
  },
): Promise<EmailSendResult> {
  if (!deps.providerEnabled || !deps.defaultFrom) {
    return {
      ok: false,
      skipped: true,
      reason: 'Resend is not configured for this environment.',
    };
  }

  try {
    const response = await deps.send({
      from: deps.defaultFrom,
      to: args.to,
      subject: args.subject,
      html: args.html,
    });

    return {
      ok: true,
      skipped: false,
      id: typeof response.data?.id === 'string' ? response.data.id : null,
    };
  } catch (error) {
    deps.onError(error, {
      provider: 'resend',
      tag: args.tag,
      to: args.to,
    });

    return {
      ok: false,
      skipped: false,
      reason: error instanceof Error ? error.message : 'Resend send failed.',
    };
  }
}
