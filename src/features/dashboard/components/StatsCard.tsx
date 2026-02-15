import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
  icon: LucideIcon;
  color?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'blue' | 'purple';
  className?: string;
}

const colorVariants = {
  indigo: {
    bg: 'bg-indigo-500/10',
    text: 'text-indigo-400',
    border: 'border-indigo-500/20',
  },
  emerald: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/20',
  },
  amber: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/20',
  },
  rose: {
    bg: 'bg-rose-500/10',
    text: 'text-rose-400',
    border: 'border-rose-500/20',
  },
  blue: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    border: 'border-blue-500/20',
  },
  purple: {
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    border: 'border-purple-500/20',
  },
};

export function StatsCard({
  title,
  value,
  change,
  icon: Icon,
  color = 'indigo',
  className,
}: StatsCardProps) {
  const colors = colorVariants[color];
  const TrendIcon = change?.isPositive ? TrendingUp : TrendingDown;
  const trendColor = change?.isPositive ? 'text-emerald-400' : 'text-rose-400';

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-400">{title}</p>
            <p className="text-3xl font-bold text-white">{value}</p>
            {change && (
              <div className="flex items-center gap-1.5">
                <TrendIcon className={cn('h-4 w-4', trendColor)} />
                <span className={cn('text-sm font-medium', trendColor)}>
                  {change.isPositive ? '+' : ''}{change.value}%
                </span>
                <span className="text-sm text-slate-500">{change.label}</span>
              </div>
            )}
          </div>
          <div
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-xl border',
              colors.bg,
              colors.text,
              colors.border
            )}
          >
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
