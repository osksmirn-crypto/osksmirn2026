import { useState } from 'react';
import type { Norm, WorkUnit } from '@/types';
import { normTimeInHours } from '@/lib/calc';
import { uid } from '@/lib/storage';
import { Modal } from '@/components/Modal';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Input, Select, Button } from '@/components/ui';
import { Plus, Pencil, Trash2, Clock } from 'lucide-react';

interface NormsModuleProps {
  norms: Norm[];
  setNorms: (n: Norm[]) => void;
}

export function NormsModule({ norms, setNorms }: NormsModuleProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Norm | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [unitName, setUnitName] = useState('');
  const [timePerUnit, setTimePerUnit] = useState('');
  const [unit, setUnit] = useState<WorkUnit>('hours');

  const openAdd = () => {
    setEditing(null);
    setName('');
    setUnitName('');
    setTimePerUnit('');
    setUnit('hours');
    setModalOpen(true);
  };

  const openEdit = (n: Norm) => {
    setEditing(n);
    setName(n.name);
    setUnitName(n.unitName);
    setTimePerUnit(String(n.timePerUnit));
    setUnit(n.unit);
    setModalOpen(true);
  };

  const save = () => {
    const time = parseFloat(timePerUnit);
    if (!name.trim() || !unitName.trim() || isNaN(time) || time <= 0) return;

    if (editing) {
      setNorms(norms.map((n) => (n.id === editing.id ? { ...n, name: name.trim(), unitName: unitName.trim(), timePerUnit: time, unit } : n)));
    } else {
      const newNorm: Norm = { id: uid(), name: name.trim(), unitName: unitName.trim(), timePerUnit: time, unit, createdAt: Date.now() };
      setNorms([newNorm, ...norms]);
    }
    setModalOpen(false);
  };

  const confirmDelete = () => {
    if (deleteId) {
      setNorms(norms.filter((n) => n.id !== deleteId));
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Справочник норм</h2>
          <p className="text-sm text-slate-400">Нормативное время выполнения по видам работ</p>
        </div>
        <Button onClick={openAdd}>
          <Plus size={16} /> Добавить
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50 text-left text-xs font-medium uppercase tracking-wide text-slate-400">
              <th className="px-5 py-3">Вид работы</th>
              <th className="px-5 py-3">Единица</th>
              <th className="px-5 py-3">Норма на единицу</th>
              <th className="px-5 py-3">В часах</th>
              <th className="px-5 py-3 text-right">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {norms.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-slate-400">
                  Нет нормативов. Добавьте первый.
                </td>
              </tr>
            )}
            {norms.map((n) => (
              <tr key={n.id} className="transition hover:bg-slate-50/50">
                <td className="px-5 py-3 font-medium text-slate-700">{n.name}</td>
                <td className="px-5 py-3 text-slate-500">{n.unitName}</td>
                <td className="px-5 py-3 text-slate-600">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock size={14} className="text-slate-300" />
                    {n.timePerUnit} {n.unit === 'hours' ? 'ч' : 'мин'}
                  </span>
                </td>
                <td className="px-5 py-3 text-slate-500">{normTimeInHours(n).toFixed(3)} ч</td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => openEdit(n)} className="rounded-lg p-2 text-slate-400 transition hover:bg-sky-50 hover:text-sky-600">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => setDeleteId(n.id)} className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Редактировать норму' : 'Новая норма'}>
        <div className="space-y-4">
          <Input label="Вид работы" placeholder="Напр. Обработка документов" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Единица измерения" placeholder="Напр. документ" value={unitName} onChange={(e) => setUnitName(e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Норма на единицу" type="number" step="0.01" placeholder="0.5" value={timePerUnit} onChange={(e) => setTimePerUnit(e.target.value)} />
            <Select label="Единица времени" value={unit} onChange={(e) => setUnit(e.target.value as WorkUnit)}>
              <option value="hours">Часы</option>
              <option value="minutes">Минуты</option>
            </Select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Отмена</Button>
            <Button onClick={save}>{editing ? 'Сохранить' : 'Добавить'}</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteId !== null}
        message="Удалить этот норматив? Связанные записи останутся, но норма для них не будет рассчитываться."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
