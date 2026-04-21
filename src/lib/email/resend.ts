import 'server-only';

import { Resend } from 'resend';

import { env } from '@/lib/env';
import { captureException, captureMessage } from '@/lib/sentry';

export type EmailSendResult =
  | { ok: true; skipped: false; id: string | null }
  | { ok: false; skipped: true; reason: string }
  | { ok: false; skipped: false; reason: string };

const resendClient = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;
const defaultFrom = env.RESEND_FROM_EMAIL || null;

export const resendEnabled = Boolean(resendClient && defaultFrom);

async function sendEmail(args: {
  to: string;
  subject: string;
  html: string;
  tag: string;
}): Promise<EmailSendResult> {
  if (!resendClient || !defaultFrom) {
    captureMessage('Resend send skipped because provider is not configured.', 'info', {
      tag: args.tag,
      to: args.to,
    });
    return {
      ok: false,
      skipped: true,
      reason: 'Resend is not configured for this environment.',
    };
  }

  try {
    const response = await resendClient.emails.send({
      from: defaultFrom,
      to: args.to,
      subject: args.subject,
      html: args.html,
    });

    captureMessage('Resend email sent.', 'info', {
      tag: args.tag,
      to: args.to,
      emailId: typeof response.data?.id === 'string' ? response.data.id : null,
    });

    return {
      ok: true,
      skipped: false,
      id: typeof response.data?.id === 'string' ? response.data.id : null,
    };
  } catch (error) {
    captureException(error, {
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

export async function sendWelcomeEmail(to: string, displayName: string | null) {
  const name = displayName || 'Creator';
  return sendEmail({
    to,
    subject: 'Welcome to BETALENT',
    tag: 'welcome',
    html: `
      <div style="font-family: system-ui, sans-serif; color: #111;">
        <h1>Welcome to BETALENT, ${name}!</h1>
        <p>Thanks for joining the show-first creator platform for original talent.</p>
        <p>We&apos;re excited to help you launch your performance journey.</p>
      </div>
    `,
  });
}

export async function sendSubmissionReceivedEmail(
  to: string,
  title: string,
  displayName: string | null,
) {
  const name = displayName || 'Creator';
  return sendEmail({
    to,
    subject: 'Your submission has been received',
    tag: 'submission-received',
    html: `
      <div style="font-family: system-ui, sans-serif; color: #111;">
        <h1>Submission received</h1>
        <p>Hi ${name},</p>
        <p>We received your submission titled <strong>${title}</strong>. Our team will review it and update you with next steps.</p>
      </div>
    `,
  });
}

export async function sendSubmissionStatusChangedEmail(
  to: string,
  title: string,
  status: string,
  displayName: string | null,
) {
  const name = displayName || 'Creator';
  return sendEmail({
    to,
    subject: 'Your submission status has updated',
    tag: 'submission-status-updated',
    html: `
      <div style="font-family: system-ui, sans-serif; color: #111;">
        <h1>Submission update</h1>
        <p>Hi ${name},</p>
        <p>Your submission titled <strong>${title}</strong> is now <strong>${status}</strong>.</p>
      </div>
    `,
  });
}
