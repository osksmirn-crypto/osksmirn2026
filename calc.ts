import type { Norm, Employee, WorkRecord, EfficiencyRow, EmployeeStats } from '@/types';

export function normTimeInHours(norm: Norm): number {
  return norm.unit === 'minutes' ? norm.timePerUnit / 60 : norm.timePerUnit;
}

export function computeEfficiency(normTimeTotal: number, actualHours: number): number {
  if (actualHours <= 0) return 0;
  return Math.round((normTimeTotal / actualHours) * 1000) / 10;
}

export function buildEfficiencyRows(
  norms: Norm[],
  employees: Employee[],
  records: WorkRecord[]
): EfficiencyRow[] {
  const normMap = new Map(norms.map((n) => [n.id, n]));
  const empMap = new Map(employees.map((e) => [e.id, e]));

  return records.map((r) => {
    const norm = normMap.get(r.normId);
    const emp = empMap.get(r.employeeId);
    const perUnit = norm ? normTimeInHours(norm) : 0;
    const normTimeTotal = +(perUnit * r.quantity).toFixed(2);
    const efficiency = computeEfficiency(normTimeTotal, r.actualHours);
    return {
      recordId: r.id,
      employeeId: r.employeeId,
      employeeName: emp?.name ?? '—',
      department: emp?.department ?? '—',
      workName: norm?.name ?? '—',
      quantity: r.quantity,
      normTimeTotal,
      actualHours: r.actualHours,
      efficiency,
      date: r.date,
    };
  });
}

export function buildEmployeeStats(
  norms: Norm[],
  employees: Employee[],
  records: WorkRecord[]
): EmployeeStats[] {
  const rows = buildEfficiencyRows(norms, employees, records);
  const map = new Map<string, EmployeeStats>();

  for (const row of rows) {
    let stat = map.get(row.employeeId);
    if (!stat) {
      stat = {
        employeeId: row.employeeId,
        employeeName: row.employeeName,
        department: row.department,
        totalNormHours: 0,
        totalActualHours: 0,
        efficiency: 0,
        recordCount: 0,
      };
      map.set(row.employeeId, stat);
    }
    stat.totalNormHours += row.normTimeTotal;
    stat.totalActualHours += row.actualHours;
    stat.recordCount += 1;
  }

  const result = Array.from(map.values());
  for (const s of result) {
    s.totalNormHours = +s.totalNormHours.toFixed(2);
    s.totalActualHours = +s.totalActualHours.toFixed(2);
    s.efficiency = computeEfficiency(s.totalNormHours, s.totalActualHours);
  }
  return result;
}

export function teamAverageEfficiency(stats: EmployeeStats[]): number {
  if (stats.length === 0) return 0;
  const totalNorm = stats.reduce((sum, s) => sum + s.totalNormHours, 0);
  const totalActual = stats.reduce((sum, s) => sum + s.totalActualHours, 0);
  return computeEfficiency(totalNorm, totalActual);
}
