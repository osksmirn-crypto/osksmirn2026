export type WorkUnit = 'hours' | 'minutes';

export interface Norm {
  id: string;
  name: string;
  unitName: string;
  timePerUnit: number;
  unit: WorkUnit;
  createdAt: number;
}

export interface Employee {
  id: string;
  name: string;
  department: string;
  createdAt: number;
}

export interface WorkRecord {
  id: string;
  employeeId: string;
  normId: string;
  quantity: number;
  actualHours: number;
  date: string;
  createdAt: number;
}

export interface EfficiencyRow {
  recordId: string;
  employeeId: string;
  employeeName: string;
  department: string;
  workName: string;
  quantity: number;
  normTimeTotal: number;
  actualHours: number;
  efficiency: number;
  date: string;
}

export interface EmployeeStats {
  employeeId: string;
  employeeName: string;
  department: string;
  totalNormHours: number;
  totalActualHours: number;
  efficiency: number;
  recordCount: number;
}

export type EfficiencyLevel = 'high' | 'medium' | 'low';

export function getEfficiencyLevel(efficiency: number): EfficiencyLevel {
  if (efficiency > 100) return 'high';
  if (efficiency >= 85) return 'medium';
  return 'low';
}

export function getEfficiencyColor(level: EfficiencyLevel): string {
  switch (level) {
    case 'high':
      return 'text-emerald-600';
    case 'medium':
      return 'text-amber-500';
    case 'low':
      return 'text-rose-600';
  }
}

export function getEfficiencyBg(level: EfficiencyLevel): string {
  switch (level) {
    case 'high':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'medium':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'low':
      return 'bg-rose-50 text-rose-700 border-rose-200';
  }
}

export function getEfficiencyDot(level: EfficiencyLevel): string {
  switch (level) {
    case 'high':
      return 'bg-emerald-500';
    case 'medium':
      return 'bg-amber-400';
    case 'low':
      return 'bg-rose-500';
  }
}
