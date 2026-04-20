"use client";

import { useFormStatus } from "react-dom";

import { cn } from "@/lib/utils/cn";

type SubmitButtonProps = {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
};

export function SubmitButton({
  children,
  className,
  disabled = false,
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className={cn(
        "inline-flex h-12 w-full items-center justify-center rounded-2xl bg-foreground text-sm font-semibold tracking-tight text-background shadow-[0_12px_40px_-16px_rgba(0,0,0,0.55)] transition-[opacity,transform] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-neutral-950 dark:shadow-[0_16px_44px_-18px_rgba(255,255,255,0.25)]",
        className,
      )}
    >
      {pending ? "Please wait…" : children}
    </button>
  );
}
