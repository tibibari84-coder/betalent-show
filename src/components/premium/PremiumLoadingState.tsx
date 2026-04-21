import { PremiumEmptyState } from "./PremiumEmptyState";

export function PremiumLoadingState(props: {
  title: string;
  message?: string;
  className?: string;
}) {
  return (
    <PremiumEmptyState title={props.title} className={props.className}>
      {props.message || "Loading the next available view."}
    </PremiumEmptyState>
  );
}
