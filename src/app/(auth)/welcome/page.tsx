import { OnboardingForm } from "@/components/onboarding/OnboardingForm";
import { requireIncompleteOnboarding } from "@/server/auth/guard";

export const dynamic = "force-dynamic";

export default async function WelcomePage() {
  const session = await requireIncompleteOnboarding("/welcome");

  return (
    <div className="foundation-shell flex min-h-screen items-center justify-center px-6 py-12 text-white">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <p className="foundation-kicker">BETALENT</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[0.12em] text-white">
            CREATOR SETUP
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-white/64">
            Finish your creator identity to unlock uploads, profile editing, and your protected workspace.
          </p>
          <p className="mt-2 text-xs uppercase tracking-[0.18em] text-white/42">
            Signed in as {session.user.email}
          </p>
        </div>

        <OnboardingForm />
      </div>
    </div>
  );
}
