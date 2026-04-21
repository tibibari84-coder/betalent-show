import { cn } from '@/lib/utils/cn';
import { HTMLAttributes, forwardRef } from 'react';

interface LoadingStateProps extends HTMLAttributes<HTMLDivElement> {
  message?: string;
}

const LoadingState = forwardRef<HTMLDivElement, LoadingStateProps>(
  ({ className, message = 'Loading...', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex items-center justify-center space-x-2 text-muted-foreground',
        className
      )}
      {...props}
    >
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      <span>{message}</span>
    </div>
  )
);
LoadingState.displayName = 'LoadingState';

export { LoadingState };