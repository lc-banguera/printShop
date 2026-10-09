import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/utils/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-control border text-sm font-medium transition-all duration-normal active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/30 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-[var(--primary)] text-[var(--text-inverse)] shadow-subtle hover:bg-[var(--primary-hover)] active:bg-[var(--primary-active)]',
        secondary:
          'border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] shadow-subtle hover:bg-[var(--surface-muted)]',
        outline:
          'border-[var(--primary)]/30 bg-transparent text-[var(--primary)] hover:bg-[var(--accent-muted)]',
        ghost:
          'border-transparent bg-transparent text-[var(--text-secondary)] hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)]',
        destructive:
          'border-transparent bg-[var(--danger)] text-[var(--text-inverse)] shadow-subtle hover:brightness-[0.98] active:brightness-[0.95]',
      },
      size: {
        default: 'h-11 px-5 py-2',
        sm: 'h-9 px-3 text-sm',
        lg: 'h-12 px-6 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return <Comp className={cn(buttonVariants({ variant, size }), className)} ref={ref} {...props} />;
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
