import Link from "next/link";

import { LoginForm } from "@/components/auth/LoginForm";
import { sanitizeRedirectPath } from "@/lib/auth/redirect";
import { redirectAuthenticatedAway } from "@/server/auth/guard";

type LoginPageProps = {
  searchParams?: Promise<{
    redirect?: string;
    signedOut?: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = (await searchParams) ?? {};
  const redirectParam = params.redirect ?? null;

  await redirectAuthenticatedAway(redirectParam);

  return (
    <div className="foundation-shell flex min-h-screen items-center justify-center px-6 py-12 text-white">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <p className="foundation-kicker">BETALENT</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[0.12em] text-white">
            MEMBER ACCESS
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-white/64">
            Sign in to reach your creator workspace, uploads, and submission flow.
          </p>
        </div>

        <LoginForm
          defaultRedirect={sanitizeRedirectPath(redirectParam)}
          signedOut={params.signedOut === "1"}
        />

        <p className="text-center text-sm text-white/52">
          New to BETALENT?{" "}
          <Link
            href="/register"
            className="font-medium text-white underline underline-offset-4"
          >
            Create your account
          </Link>
        </p>
      </div>
    </div>
  );
}
