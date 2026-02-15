import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-950',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-indigo-600 text-white hover:bg-indigo-500',
        secondary: 'border-transparent bg-slate-800 text-slate-200 hover:bg-slate-700',
        outline: 'border-slate-600 text-slate-300 hover:bg-slate-800',
        success: 'border-transparent bg-emerald-600 text-white hover:bg-emerald-500',
        warning: 'border-transparent bg-amber-600 text-white hover:bg-amber-500',
        danger: 'border-transparent bg-red-600 text-white hover:bg-red-500',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
