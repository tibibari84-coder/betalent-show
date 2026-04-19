"use client";

import { useFormStatus } from "react-dom";

import { cn } from "@/lib/utils/cn";

type SubmitButtonProps = {
  children: React.ReactNode;
  className?: string;
};

export function SubmitButton({ children, className }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "inline-flex h-11 w-full items-center justify-center rounded-xl bg-foreground text-sm font-medium text-background transition-opacity disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
    >
      {pending ? "Please wait…" : children}
    </button>
  );
}
