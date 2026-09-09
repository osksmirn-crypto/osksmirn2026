import type { EfficiencyLevel } from '@/types';
import { getEfficiencyBg, getEfficiencyDot } from '@/types';

interface EfficiencyBadgeProps {
  efficiency: number;
  level: EfficiencyLevel;
  size?: 'sm' | 'md';
}

export function EfficiencyBadge({ efficiency, level, size = 'md' }: EfficiencyBadgeProps) {
  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold ${getEfficiencyBg(level)} ${padding}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${getEfficiencyDot(level)}`} />
      {efficiency.toFixed(1)}%
    </span>
  );
}
