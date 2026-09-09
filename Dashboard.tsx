import type { Norm, Employee, WorkRecord } from '@/types';
import { buildEmployeeStats, teamAverageEfficiency } from '@/lib/calc';
import { getEfficiencyLevel, getEfficiencyColor, getEfficiencyDot } from '@/types';
import { RankingChart } from '@/components/RankingChart';
import { Users, ClipboardList, Gauge, Activity } from 'lucide-react';

interface DashboardProps {
  norms: Norm[];
  employees: Employee[];
  records: WorkRecord[];
}

export function Dashboard({ norms, employees, records }: DashboardProps) {
  const stats = buildEmployeeStats(norms, employees, records);
  const avg = teamAverageEfficiency(stats);
  const avgLevel = getEfficiencyLevel(avg);

  const sorted = [...stats].sort((a, b) => b.efficiency - a.efficiency);
  const top5 = sorted.slice(0, 5);
  const bottom5 = sorted.slice(-5).reverse();

  const highCount = stats.filter((s) => s.efficiency > 100).length;
  const medCount = stats.filter((s) => s.efficiency >= 85 && s.efficiency <= 100).length;
  const lowCount = stats.filter((s) => s.efficiency < 85).length;

  const cards = [
    {
      label: 'Средняя эффективность',
      value: `${avg.toFixed(1)}%`,
      icon: Gauge,
      color: getEfficiencyColor(avgLevel),
      dot: getEfficiencyDot(avgLevel),
    },
    { label: 'Сотрудников', value: String(employees.length), icon: Users, color: 'text-sky-600', dot: 'bg-sky-500' },
    { label: 'Записей о работах', value: String(records.length), icon: ClipboardList, color: 'text-violet-600', dot: 'bg-violet-500' },
    { label: 'Видов работ', value: String(norms.length), icon: Activity, color: 'text-amber-600', dot: 'bg-amber-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-slate-200/70 bg-white p-5">
            <div className="flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50">
                <c.icon size={20} className={c.color} />
              </span>
              {c.label === 'Средняя эффективность' && (
                <span className={`h-2.5 w-2.5 rounded-full ${c.dot}`} />
              )}
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-800">{c.value}</p>
            <p className="mt-0.5 text-xs font-medium text-slate-400">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200/70 bg-white p-5">
        <h3 className="mb-4 text-sm font-semibold text-slate-700">Распределение по эффективности</h3>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span className="text-sm font-medium text-emerald-700">Высокая (&gt;100%)</span>
            <span className="text-sm font-bold text-emerald-800">{highCount}</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <span className="text-sm font-medium text-amber-700">Средняя (85–100%)</span>
            <span className="text-sm font-bold text-amber-800">{medCount}</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
            <span className="text-sm font-medium text-rose-700">Низкая (&lt;85%)</span>
            <span className="text-sm font-bold text-rose-800">{lowCount}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <RankingChart title="Топ-5 самых эффективных" stats={top5} type="top" />
        <RankingChart title="Топ-5 отстающих" stats={bottom5} type="bottom" />
      </div>
    </div>
  );
}
