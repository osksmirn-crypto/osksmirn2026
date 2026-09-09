import type { EmployeeStats } from '@/types';
import { getEfficiencyLevel, getEfficiencyColor, getEfficiencyDot } from '@/types';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface RankingChartProps {
  title: string;
  stats: EmployeeStats[];
  type: 'top' | 'bottom';
}

export function RankingChart({ title, stats, type }: RankingChartProps) {
  const Icon = type === 'top' ? TrendingUp : TrendingDown;
  const accentText = type === 'top' ? 'text-emerald-600' : 'text-rose-600';
  const accentBg = type === 'top' ? 'bg-emerald-50' : 'bg-rose-50';

  const maxEff = Math.max(...stats.map((s) => s.efficiency), 1);

  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${accentBg}`}>
          <Icon size={18} className={accentText} />
        </span>
        <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
      </div>
      <div className="space-y-3">
        {stats.length === 0 && (
          <p className="py-6 text-center text-sm text-slate-400">Нет данных</p>
        )}
        {stats.map((s, i) => {
          const level = getEfficiencyLevel(s.efficiency);
          const widthPct = Math.min((s.efficiency / maxEff) * 100, 100);
          return (
            <div key={s.employeeId} className="flex items-center gap-3">
              <span className="w-5 text-right text-xs font-semibold text-slate-400">{i + 1}</span>
              <div className="flex-1">
                <div className="mb-1 flex items-center justify-between">
                  <span className="truncate text-sm font-medium text-slate-700">{s.employeeName}</span>
                  <span className={`text-sm font-semibold ${getEfficiencyColor(level)}`}>
                    {s.efficiency.toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${getEfficiencyDot(level)}`}
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
                <span className="mt-0.5 block text-xs text-slate-400">{s.department}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
