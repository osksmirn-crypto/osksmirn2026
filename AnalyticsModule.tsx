import { useState, useMemo } from 'react';
import type { Norm, Employee, WorkRecord } from '@/types';
import { buildEfficiencyRows, computeEfficiency } from '@/lib/calc';
import { getEfficiencyLevel } from '@/types';
import { EfficiencyBadge } from '@/components/EfficiencyBadge';
import { Input, Select } from '@/components/ui';
import { Search, Filter, Download } from 'lucide-react';

interface AnalyticsModuleProps {
  norms: Norm[];
  employees: Employee[];
  records: WorkRecord[];
}

export function AnalyticsModule({ norms, employees, records }: AnalyticsModuleProps) {
  const [empFilter, setEmpFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const departments = useMemo(() => {
    const set = new Set(employees.map((e) => e.department).filter(Boolean));
    return Array.from(set).sort();
  }, [employees]);

  const rows = useMemo(() => {
    let r = buildEfficiencyRows(norms, employees, records);
    if (empFilter) r = r.filter((row) => row.employeeId === empFilter);
    if (deptFilter) r = r.filter((row) => row.department === deptFilter);
    if (fromDate) r = r.filter((row) => row.date >= fromDate);
    if (toDate) r = r.filter((row) => row.date <= toDate);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter((row) => row.employeeName.toLowerCase().includes(q) || row.workName.toLowerCase().includes(q));
    }
    return r.sort((a, b) => b.date.localeCompare(a.date));
  }, [norms, employees, records, empFilter, deptFilter, search, fromDate, toDate]);

  const totalNorm = useMemo(() => rows.reduce((s, r) => s + r.normTimeTotal, 0), [rows]);
  const totalActual = useMemo(() => rows.reduce((s, r) => s + r.actualHours, 0), [rows]);
  const avg = useMemo(() => computeEfficiency(totalNorm, totalActual), [totalNorm, totalActual]);
  const avgLevel = getEfficiencyLevel(avg);

  const exportCsv = () => {
    const headers = ['ФИО', 'Отдел', 'Работа', 'Объём', 'Норма, ч', 'Факт, ч', 'Эффективность, %', 'Дата'];
    const lines = rows.map((r) =>
      [r.employeeName, r.department, r.workName, r.quantity, r.normTimeTotal, r.actualHours, r.efficiency, r.date]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(',')
    );
    const csv = [headers.join(','), ...lines].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'аналитика_эффективности.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Аналитика и отчёты</h2>
          <p className="text-sm text-slate-400">Сводная таблица эффективности по сотрудникам</p>
        </div>
        <button
          onClick={exportCsv}
          disabled={rows.length === 0}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
        >
          <Download size={16} /> Экспорт CSV
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200/70 bg-white p-4">
          <p className="text-xs font-medium text-slate-400">Средняя эффективность</p>
          <p className={`mt-1 text-2xl font-bold ${avgLevel === 'high' ? 'text-emerald-600' : avgLevel === 'medium' ? 'text-amber-500' : 'text-rose-600'}`}>
            {avg.toFixed(1)}%
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200/70 bg-white p-4">
          <p className="text-xs font-medium text-slate-400">Записей</p>
          <p className="mt-1 text-2xl font-bold text-slate-800">{rows.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200/70 bg-white p-4">
          <p className="text-xs font-medium text-slate-400">Суммарная норма, ч</p>
          <p className="mt-1 text-2xl font-bold text-slate-800">{totalNorm.toFixed(1)}</p>
        </div>
        <div className="rounded-2xl border border-slate-200/70 bg-white p-4">
          <p className="text-xs font-medium text-slate-400">Суммарный факт, ч</p>
          <p className="mt-1 text-2xl font-bold text-slate-800">{totalActual.toFixed(1)}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200/70 bg-white p-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
          <input
            placeholder="Поиск по имени или работе…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-slate-300" />
          <Select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} className="min-w-[160px]">
            <option value="">Все отделы</option>
            {departments.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </Select>
          <Select value={empFilter} onChange={(e) => setEmpFilter(e.target.value)} className="min-w-[180px]">
            <option value="">Все сотрудники</option>
            {employees
              .filter((e) => !deptFilter || e.department === deptFilter)
              .map((e) => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
          </Select>
          <Input label="Дата от" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="min-w-[145px]" />
          <Input label="Дата до" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="min-w-[145px]" />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-left text-xs font-medium uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3">ФИО</th>
                <th className="px-5 py-3">Отдел</th>
                <th className="px-5 py-3">Выполненная работа</th>
                <th className="px-5 py-3 text-right">Объём</th>
                <th className="px-5 py-3 text-right">Норма, ч</th>
                <th className="px-5 py-3 text-right">Факт, ч</th>
                <th className="px-5 py-3 text-center">Эффективность</th>
                <th className="px-5 py-3">Дата</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-slate-400">
                    Нет данных по выбранным фильтрам
                  </td>
                </tr>
              )}
              {rows.map((r) => {
                const level = getEfficiencyLevel(r.efficiency);
                return (
                  <tr key={r.recordId} className="transition hover:bg-slate-50/50">
                    <td className="px-5 py-3 font-medium text-slate-700">{r.employeeName}</td>
                    <td className="px-5 py-3 text-slate-500">{r.department}</td>
                    <td className="px-5 py-3 text-slate-500">{r.workName}</td>
                    <td className="px-5 py-3 text-right text-slate-600">{r.quantity}</td>
                    <td className="px-5 py-3 text-right text-slate-500">{r.normTimeTotal.toFixed(2)}</td>
                    <td className="px-5 py-3 text-right text-slate-600">{r.actualHours.toFixed(2)}</td>
                    <td className="px-5 py-3 text-center">
                      <EfficiencyBadge efficiency={r.efficiency} level={level} size="sm" />
                    </td>
                    <td className="px-5 py-3 text-slate-400">{r.date}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
