import { useState } from 'react';
import type { Employee, Norm, WorkRecord } from '@/types';
import { buildEmployeeStats } from '@/lib/calc';
import { getEfficiencyLevel } from '@/types';
import { uid } from '@/lib/storage';
import { Modal } from '@/components/Modal';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { EfficiencyBadge } from '@/components/EfficiencyBadge';
import { Input, Button } from '@/components/ui';
import { Plus, Pencil, Trash2, User } from 'lucide-react';

interface EmployeesModuleProps {
  employees: Employee[];
  setEmployees: (e: Employee[]) => void;
  norms: Norm[];
  records: WorkRecord[];
}

export function EmployeesModule({ employees, setEmployees, norms, records }: EmployeesModuleProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');

  const stats = buildEmployeeStats(norms, employees, records);
  const statMap = new Map(stats.map((s) => [s.employeeId, s]));

  const openAdd = () => {
    setEditing(null);
    setName('');
    setDepartment('');
    setModalOpen(true);
  };

  const openEdit = (e: Employee) => {
    setEditing(e);
    setName(e.name);
    setDepartment(e.department);
    setModalOpen(true);
  };

  const save = () => {
    if (!name.trim()) return;
    if (editing) {
      setEmployees(employees.map((e) => (e.id === editing.id ? { ...e, name: name.trim(), department: department.trim() } : e)));
    } else {
      const newEmp: Employee = { id: uid(), name: name.trim(), department: department.trim(), createdAt: Date.now() };
      setEmployees([newEmp, ...employees]);
    }
    setModalOpen(false);
  };

  const confirmDelete = () => {
    if (deleteId) {
      setEmployees(employees.filter((e) => e.id !== deleteId));
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Сотрудники</h2>
          <p className="text-sm text-slate-400">Учёт персонала и отделов</p>
        </div>
        <Button onClick={openAdd}>
          <Plus size={16} /> Добавить
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {employees.length === 0 && (
          <p className="col-span-full py-10 text-center text-slate-400">Нет сотрудников. Добавьте первого.</p>
        )}
        {employees.map((e) => {
          const stat = statMap.get(e.id);
          const level = stat ? getEfficiencyLevel(stat.efficiency) : null;
          return (
            <div key={e.id} className="group rounded-2xl border border-slate-200/70 bg-white p-4 transition hover:shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-500">
                    <User size={18} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{e.name}</p>
                    <p className="text-xs text-slate-400">{e.department || 'Без отдела'}</p>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 transition group-hover:opacity-100">
                  <button onClick={() => openEdit(e)} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-sky-50 hover:text-sky-600">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => setDeleteId(e.id)} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-slate-50 pt-3">
                <span className="text-xs text-slate-400">
                  {stat ? `${stat.recordCount} записей` : 'Нет записей'}
                </span>
                {stat && level ? (
                  <EfficiencyBadge efficiency={stat.efficiency} level={level} size="sm" />
                ) : (
                  <span className="text-xs text-slate-300">—</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Редактировать сотрудника' : 'Новый сотрудник'}>
        <div className="space-y-4">
          <Input label="ФИО" placeholder="Иван Иванов" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Должность / Отдел" placeholder="Отдел продаж" value={department} onChange={(e) => setDepartment(e.target.value)} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Отмена</Button>
            <Button onClick={save}>{editing ? 'Сохранить' : 'Добавить'}</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteId !== null}
        message="Удалить этого сотрудника? Записи о его работах останутся в системе."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
