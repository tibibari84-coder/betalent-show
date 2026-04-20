import type { ReactNode } from "react";

import {
  PremiumHero,
  type PremiumHeroTone,
} from "@/components/premium/PremiumHero";
import { cn } from "@/lib/utils/cn";

/** Member entry hero — full-bleed `PremiumHero` for show routes. */
export function MemberHero(props: {
  eyebrow: string;
  title: ReactNode;
  subtitle?: ReactNode;
  className?: string;
  tone?: PremiumHeroTone;
}) {
  return (
    <PremiumHero
      eyebrow={props.eyebrow}
      title={props.title}
      subtitle={props.subtitle}
      tone={props.tone}
      className={cn(props.className)}
    />
  );
}
