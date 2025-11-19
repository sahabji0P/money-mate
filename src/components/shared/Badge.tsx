'use client';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'emerald' | 'rose' | 'blue' | 'amber' | 'purple';
  size?: 'sm' | 'md';
  className?: string;
}

const variantClasses = {
  default: 'bg-primary-hover text-text-secondary',
  emerald: 'bg-accent-emerald/15 text-accent-emerald',
  rose: 'bg-accent-rose/15 text-accent-rose',
  blue: 'bg-accent-blue/15 text-accent-blue',
  amber: 'bg-accent-amber/15 text-accent-amber',
  purple: 'bg-accent-purple/15 text-accent-purple',
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-1 text-xs',
};

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center rounded-md font-medium
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
