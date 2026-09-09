import type { Norm, Employee, WorkRecord } from '@/types';
import { uid } from './storage';

export function seedData(): { norms: Norm[]; employees: Employee[]; records: WorkRecord[] } {
  const now = Date.now();

  const norms: Norm[] = [
    { id: uid(), name: 'Обработка документов', unitName: 'документ', timePerUnit: 0.25, unit: 'hours', createdAt: now },
    { id: uid(), name: 'Звонок клиенту', unitName: 'звонок', timePerUnit: 5, unit: 'minutes', createdAt: now },
    { id: uid(), name: 'Сборка заказа', unitName: 'заказ', timePerUnit: 0.5, unit: 'hours', createdAt: now },
    { id: uid(), name: 'Проверка качества', unitName: 'единица', timePerUnit: 10, unit: 'minutes', createdAt: now },
    { id: uid(), name: 'Консультация', unitName: 'консультация', timePerUnit: 0.4, unit: 'hours', createdAt: now },
  ];

  const employees: Employee[] = [
    { id: uid(), name: 'Анна Смирнова', department: 'Отдел продаж', createdAt: now },
    { id: uid(), name: 'Иван Петров', department: 'Отдел продаж', createdAt: now },
    { id: uid(), name: 'Мария Кузнецова', department: 'Склад', createdAt: now },
    { id: uid(), name: 'Дмитрий Соколов', department: 'Склад', createdAt: now },
    { id: uid(), name: 'Елена Волкова', department: 'Контроль качества', createdAt: now },
    { id: uid(), name: 'Сергей Иванов', department: 'Контроль качества', createdAt: now },
    { id: uid(), name: 'Ольга Новикова', department: 'Администрация', createdAt: now },
  ];

  const records: WorkRecord[] = [];

  const today = new Date();
  const dateStr = (d: number) => {
    const dt = new Date(today);
    dt.setDate(dt.getDate() - d);
    return dt.toISOString().slice(0, 10);
  };

  const normTimeHours = (n: Norm) => (n.unit === 'minutes' ? n.timePerUnit / 60 : n.timePerUnit);

  const addRecord = (empIdx: number, normIdx: number, qty: number, effFactor: number, daysAgo: number) => {
    const norm = norms[normIdx];
    const normH = normTimeHours(norm) * qty;
    const actual = +(normH / effFactor).toFixed(2);
    records.push({
      id: uid(),
      employeeId: employees[empIdx].id,
      normId: norm.id,
      quantity: qty,
      actualHours: actual,
      date: dateStr(daysAgo),
      createdAt: now,
    });
  };

  // Анна — высокая эффективность
  addRecord(0, 0, 40, 1.25, 1);
  addRecord(0, 1, 30, 1.15, 2);
  addRecord(0, 4, 8, 1.2, 3);

  // Иван — средняя
  addRecord(1, 0, 20, 0.92, 1);
  addRecord(1, 1, 15, 0.88, 2);

  // Мария — высокая
  addRecord(2, 2, 12, 1.3, 1);
  addRecord(2, 2, 10, 1.18, 3);

  // Дмитрий — низкая
  addRecord(3, 2, 6, 0.7, 1);
  addRecord(3, 2, 8, 0.75, 2);

  // Елена — средняя
  addRecord(4, 3, 25, 0.95, 1);
  addRecord(4, 3, 20, 0.9, 2);

  // Сергей — низкая
  addRecord(5, 3, 15, 0.65, 1);
  addRecord(5, 3, 18, 0.72, 2);

  // Ольга — высокая
  addRecord(6, 0, 35, 1.22, 1);
  addRecord(6, 4, 10, 1.1, 2);

  return { norms, employees, records };
}
