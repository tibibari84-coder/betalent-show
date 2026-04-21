import Link from "next/link";

import { RegisterForm } from "@/components/auth/RegisterForm";
import { sanitizeRedirectPath } from "@/lib/auth/redirect";
import { redirectAuthenticatedAway } from "@/server/auth/guard";

type RegisterPageProps = {
  searchParams?: Promise<{
    redirect?: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function RegisterPage({
  searchParams,
}: RegisterPageProps) {
  const params = (await searchParams) ?? {};
  const redirectParam = params.redirect ?? null;

  await redirectAuthenticatedAway(redirectParam);

  return (
    <div className="foundation-shell flex min-h-screen items-center justify-center px-6 py-12 text-white">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <p className="foundation-kicker">BETALENT</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[0.12em] text-white">
            CREATE ACCOUNT
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-white/64">
            Start with email and password, then complete your creator identity in one guided step.
          </p>
        </div>

        <RegisterForm defaultRedirect={sanitizeRedirectPath(redirectParam)} />

        <p className="text-center text-sm text-white/52">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-white underline underline-offset-4"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
