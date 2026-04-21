import { cn } from '@/lib/utils/cn';
import { HTMLAttributes, forwardRef } from 'react';

interface SectionHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
}

const SectionHeader = forwardRef<HTMLDivElement, SectionHeaderProps>(
  ({ className, title, description, ...props }, ref) => (
    <div ref={ref} className={cn('space-y-1', className)} {...props}>
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      {description && <p className="text-muted-foreground">{description}</p>}
    </div>
  )
);
SectionHeader.displayName = 'SectionHeader';

export { SectionHeader };