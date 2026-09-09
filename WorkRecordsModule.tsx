import { useState } from 'react';
import type { Norm, Employee, WorkRecord } from '@/types';
import { normTimeInHours, computeEfficiency } from '@/lib/calc';
import { getEfficiencyLevel } from '@/types';
import { uid } from '@/lib/storage';
import { Modal } from '@/components/Modal';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { EfficiencyBadge } from '@/components/EfficiencyBadge';
import { Input, Select, Button } from '@/components/ui';
import { Plus, Trash2, Calendar } from 'lucide-react';

interface WorkRecordsModuleProps {
  norms: Norm[];
  employees: Employee[];
  records: WorkRecord[];
  setRecords: (r: WorkRecord[]) => void;
}

export function WorkRecordsModule({ norms, employees, records, setRecords }: WorkRecordsModuleProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [employeeId, setEmployeeId] = useState('');
  const [normId, setNormId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [actualHours, setActualHours] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const normMap = new Map(norms.map((n) => [n.id, n]));
  const empMap = new Map(employees.map((e) => [e.id, e]));

  const openAdd = () => {
    setEmployeeId(employees[0]?.id ?? '');
    setNormId(norms[0]?.id ?? '');
    setQuantity('');
    setActualHours('');
    setDate(new Date().toISOString().slice(0, 10));
    setModalOpen(true);
  };

  const previewEfficiency = () => {
    const norm = normMap.get(normId);
    const qty = parseFloat(quantity);
    const hrs = parseFloat(actualHours);
    if (!norm || isNaN(qty) || isNaN(hrs) || hrs <= 0) return null;
    const normTotal = normTimeInHours(norm) * qty;
    return computeEfficiency(normTotal, hrs);
  };

  const preview = previewEfficiency();

  const save = () => {
    const qty = parseFloat(quantity);
    const hrs = parseFloat(actualHours);
    if (!employeeId || !normId || isNaN(qty) || qty <= 0 || isNaN(hrs) || hrs <= 0) return;
    const newRecord: WorkRecord = {
      id: uid(),
      employeeId,
      normId,
      quantity: qty,
      actualHours: hrs,
      date,
      createdAt: Date.now(),
    };
    setRecords([newRecord, ...records]);
    setModalOpen(false);
  };

  const confirmDelete = () => {
    if (deleteId) {
      setRecords(records.filter((r) => r.id !== deleteId));
      setDeleteId(null);
    }
  };

  const sorted = [...records].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Учёт работ</h2>
          <p className="text-sm text-slate-400">Фактически отработанное время и объёмы</p>
        </div>
        <Button onClick={openAdd} disabled={employees.length === 0 || norms.length === 0}>
          <Plus size={16} /> Добавить запись
        </Button>
      </div>

      {employees.length === 0 || norms.length === 0 ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
          Для добавления записей сначала добавьте сотрудников и нормативы.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-left text-xs font-medium uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-3">Дата</th>
                  <th className="px-5 py-3">Сотрудник</th>
                  <th className="px-5 py-3">Работа</th>
                  <th className="px-5 py-3 text-right">Объём</th>
                  <th className="px-5 py-3 text-right">Норма, ч</th>
                  <th className="px-5 py-3 text-right">Факт, ч</th>
                  <th className="px-5 py-3 text-center">Эфф.</th>
                  <th className="px-5 py-3 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {sorted.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-5 py-10 text-center text-slate-400">
                      Нет записей. Добавьте первую.
                    </td>
                  </tr>
                )}
                {sorted.map((r) => {
                  const norm = normMap.get(r.normId);
                  const emp = empMap.get(r.employeeId);
                  const normTotal = norm ? normTimeInHours(norm) * r.quantity : 0;
                  const eff = computeEfficiency(normTotal, r.actualHours);
                  const level = getEfficiencyLevel(eff);
                  return (
                    <tr key={r.id} className="transition hover:bg-slate-50/50">
                      <td className="px-5 py-3 text-slate-400">
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar size={13} className="text-slate-300" />
                          {r.date}
                        </span>
                      </td>
                      <td className="px-5 py-3 font-medium text-slate-700">{emp?.name ?? '—'}</td>
                      <td className="px-5 py-3 text-slate-500">{norm?.name ?? '—'}</td>
                      <td className="px-5 py-3 text-right text-slate-600">{r.quantity}</td>
                      <td className="px-5 py-3 text-right text-slate-500">{normTotal.toFixed(2)}</td>
                      <td className="px-5 py-3 text-right text-slate-600">{r.actualHours.toFixed(2)}</td>
                      <td className="px-5 py-3 text-center">
                        <EfficiencyBadge efficiency={eff} level={level} size="sm" />
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button onClick={() => setDeleteId(r.id)} className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600">
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Новая запись о работе">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Select label="Сотрудник" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </Select>
            <Select label="Работа" value={normId} onChange={(e) => setNormId(e.target.value)}>
              {norms.map((n) => (
                <option key={n.id} value={n.id}>{n.name}</option>
              ))}
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Количество (объём)" type="number" step="0.01" placeholder="10" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
            <Input label="Фактическое время, ч" type="number" step="0.01" placeholder="5.5" value={actualHours} onChange={(e) => setActualHours(e.target.value)} />
          </div>
          <Input label="Дата" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          {preview !== null && (
            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
              <span className="text-sm text-slate-500">Прогноз эффективности:</span>
              <EfficiencyBadge efficiency={preview} level={getEfficiencyLevel(preview)} size="sm" />
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Отмена</Button>
            <Button onClick={save}>Добавить</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteId !== null}
        message="Удалить эту запись?"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
