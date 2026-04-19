import type { Metadata } from "next";

import { AppContainer } from "@/components/shell/AppContainer";
import { LoginForm } from "@/components/auth/LoginForm";
import { MobilePageShell } from "@/components/shell/MobilePageShell";
import { sanitizeRedirectPath } from "@/lib/auth/redirect";
import { redirectAuthenticatedAway } from "@/server/auth/guard";

export const metadata: Metadata = {
  title: "Sign in · BETALENT",
  description: "Sign in to your BETALENT member account.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; signedOut?: string }>;
}) {
  const params = await searchParams;
  await redirectAuthenticatedAway(params.redirect);

  const defaultRedirect = sanitizeRedirectPath(params.redirect);
  const signedOut =
    params.signedOut === "1" || params.signedOut === "true";

  return (
    <MobilePageShell>
      <AppContainer>
        <LoginForm defaultRedirect={defaultRedirect} signedOut={signedOut} />
      </AppContainer>
    </MobilePageShell>
  );
}
