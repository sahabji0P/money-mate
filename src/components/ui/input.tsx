import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-11 w-full rounded-base border border-border bg-primary-elevated px-4 py-2.5 text-[15px] text-text font-normal transition-all duration-fast',
          'placeholder:text-text-tertiary placeholder:font-normal',
          'hover:border-text-tertiary',
          'focus-visible:outline-none focus-visible:border-text-secondary focus-visible:bg-primary focus-visible:ring-1 focus-visible:ring-text-tertiary/20',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-text-secondary',
          'disabled:cursor-not-allowed disabled:opacity-40',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
