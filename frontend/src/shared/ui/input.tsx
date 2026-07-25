import * as React from 'react';
import { cn } from '@/shared/utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
  return <input ref={ref} className={cn('flex h-11 w-full rounded-lg border border-border bg-surface px-4 py-2 text-sm text-text-primary shadow-sm transition duration-150 placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-50', className)} {...props} />;
});
Input.displayName = 'Input';

export { Input };
