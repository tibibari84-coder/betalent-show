import { cn } from '@/lib/utils/cn';
import { HTMLAttributes, forwardRef } from 'react';

interface ErrorStateProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  message: string;
  icon?: React.ReactNode;
}

const ErrorState = forwardRef<HTMLDivElement, ErrorStateProps>(
  ({ className, title = 'Error', message, icon, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex flex-col items-center justify-center space-y-4 text-center',
        className
      )}
      {...props}
    >
      {icon && <div className="text-destructive">{icon}</div>}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-destructive">{title}</h3>
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  )
);
ErrorState.displayName = 'ErrorState';

export { ErrorState };