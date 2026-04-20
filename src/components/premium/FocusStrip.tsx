import { cn } from "@/lib/utils/cn";

export function FocusStrip(props: {
  items: { label: string; value: string }[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "member-bleed relative overflow-hidden rounded-[1.25rem] border border-white/[0.07] bg-gradient-to-r from-white/[0.06] via-white/[0.03] to-white/[0.05] px-4 py-5 sm:rounded-[1.75rem] sm:px-8 sm:py-7",
        props.className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.35] bg-[radial-gradient(ellipse_70%_120%_at_20%_50%,rgba(255,255,255,0.09),transparent)]" />
      <div
        className={cn(
          "relative grid grid-cols-1 gap-5 sm:gap-8",
          props.items.length >= 3 && "sm:grid-cols-3",
          props.items.length === 2 && "sm:grid-cols-2",
        )}
      >
        {props.items.map((item, i) => (
          <div
            key={`${item.label}-${i}`}
            className={cn(
              "flex flex-col gap-1",
              i > 0 && "sm:border-l sm:border-white/[0.07] sm:pl-8",
            )}
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-foreground/45">
              {item.label}
            </p>
            <p className="text-sm font-medium leading-snug text-foreground sm:text-[15px]">
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
