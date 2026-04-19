import type { Metadata } from "next";

import { OnboardingForm } from "@/components/onboarding/OnboardingForm";
import { AppContainer } from "@/components/shell/AppContainer";
import { MobilePageShell } from "@/components/shell/MobilePageShell";

export const metadata: Metadata = {
  title: "Welcome · BETALENT",
  description: "Complete a short onboarding to join the BETALENT platform.",
};

export default function WelcomePage() {
  return (
    <MobilePageShell>
      <AppContainer>
        <OnboardingForm />
      </AppContainer>
    </MobilePageShell>
  );
}
