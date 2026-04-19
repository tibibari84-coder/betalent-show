import type { Metadata } from "next";

import { RegisterForm } from "@/components/auth/RegisterForm";
import { AppContainer } from "@/components/shell/AppContainer";
import { MobilePageShell } from "@/components/shell/MobilePageShell";
import { sanitizeRedirectPath } from "@/lib/auth/redirect";
import { redirectAuthenticatedAway } from "@/server/auth/guard";

export const metadata: Metadata = {
  title: "Create account · BeTalent",
  description: "Create your BeTalent member account.",
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const params = await searchParams;
  await redirectAuthenticatedAway(params.redirect);

  const defaultRedirect = sanitizeRedirectPath(params.redirect);

  return (
    <MobilePageShell>
      <AppContainer>
        <RegisterForm defaultRedirect={defaultRedirect} />
      </AppContainer>
    </MobilePageShell>
  );
}
