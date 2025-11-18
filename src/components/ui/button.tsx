import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-base font-medium transition-all duration-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-tertiary focus-visible:ring-offset-2 focus-visible:ring-offset-primary disabled:pointer-events-none disabled:opacity-40 letter-spacing-tight',
  {
    variants: {
      variant: {
        // Primary: Inverted (white text on dark bg, or dark text on white bg)
        default: 'bg-text text-primary hover:bg-text-secondary hover:shadow-lg active:transform active:scale-[0.98]',
        // Outline: Border with no fill
        outline: 'border border-border bg-transparent text-text hover:bg-primary-hover hover:border-text-tertiary',
        // Secondary: Subtle elevated background
        secondary: 'bg-primary-elevated text-text hover:bg-primary-hover border border-border-subtle hover:border-border',
        // Ghost: No background, subtle hover
        ghost: 'hover:bg-primary-hover text-text-secondary hover:text-text',
        // Link: Text only with underline
        link: 'text-text-secondary underline-offset-4 hover:underline hover:text-text',
        // Destructive: Muted red for dangerous actions
        destructive: 'bg-text-tertiary/20 text-text hover:bg-text-tertiary/30 border border-text-tertiary/40',
      },
      size: {
        default: 'h-11 px-6 py-2.5 text-[15px]',
        sm: 'h-9 px-4 text-[14px]',
        lg: 'h-12 px-8 text-[16px]',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
