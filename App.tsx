import { useState } from 'react';
import type { ReactNode } from 'react';
import { LayoutDashboard, SlidersHorizontal, Users, ClipboardList, BarChart3, Menu, X, Zap, ChevronRight } from 'lucide-react';
import type { Norm, Employee, WorkRecord } from '@/types';
import { useLocalStorage } from '@/lib/storage';
import { seedData } from '@/lib/seed';
import { Dashboard } from '@/modules/Dashboard';
import { NormsModule } from '@/modules/NormsModule';
import { EmployeesModule } from '@/modules/EmployeesModule';
import { WorkRecordsModule } from '@/modules/WorkRecordsModule';
import { AnalyticsModule } from '@/modules/AnalyticsModule';

export type View = 'dashboard' | 'norms' | 'employees' | 'records' | 'analytics';

const navItems: { id: View; label: string; icon: typeof LayoutDashboard; description: string }[] = [
  { id: 'dashboard', label: 'Панель управления', icon: LayoutDashboard, description: 'Обзор команды' },
  { id: 'norms', label: 'Нормативы', icon: SlidersHorizontal, description: 'Справочник норм' },
  { id: 'employees', label: 'Сотрудники', icon: Users, description: 'Учёт персонала' },
  { id: 'records', label: 'Учёт работ', icon: ClipboardList, description: 'Время и объёмы' },
  { id: 'analytics', label: 'Аналитика', icon: BarChart3, description: 'Отчёты и фильтры' },
];

function App() {
  const seed = seedData();
  const [norms, setNorms] = useLocalStorage<Norm[]>('efficiency-norms', seed.norms);
  const [employees, setEmployees] = useLocalStorage<Employee[]>('efficiency-employees', seed.employees);
  const [records, setRecords] = useLocalStorage<WorkRecord[]>('efficiency-records', seed.records);
  const [view, setView] = useState<View>('dashboard');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const activeNav = navItems.find((item) => item.id === view) ?? navItems[0];

  const goTo = (nextView: View) => {
    setView(nextView);
    setMobileNavOpen(false);
  };

  let content: ReactNode;
  switch (view) {
    case 'norms':
      content = <NormsModule norms={norms} setNorms={setNorms} />;
      break;
    case 'employees':
      content = <EmployeesModule employees={employees} setEmployees={setEmployees} norms={norms} records={records} />;
      break;
    case 'records':
      content = <WorkRecordsModule norms={norms} employees={employees} records={records} setRecords={setRecords} />;
      break;
    case 'analytics':
      content = <AnalyticsModule norms={norms} employees={employees} records={records} />;
      break;
    default:
      content = <Dashboard norms={norms} employees={employees} records={records} />;
  }

  return (
    <div className="min-h-screen bg-[#f7f9fc] text-slate-800">
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-slate-200/80 bg-white transition-transform duration-300 lg:translate-x-0 ${mobileNavOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-full flex-col">
          <div className="flex h-20 items-center gap-3 border-b border-slate-100 px-6">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-600 text-white shadow-sm shadow-sky-200">
              <Zap size={19} fill="currentColor" />
            </span>
            <div>
              <p className="text-sm font-bold tracking-tight text-slate-800">Ритм</p>
              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400">Эффективность</p>
            </div>
            <button onClick={() => setMobileNavOpen(false)} className="ml-auto rounded-lg p-1 text-slate-400 lg:hidden">
              <X size={18} />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-3 py-5">
            <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Рабочая область</p>
            {navItems.map((item) => {
              const isActive = view === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => goTo(item.id)}
                  className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${isActive ? 'bg-sky-50 text-sky-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
                >
                  <item.icon size={18} className={isActive ? 'text-sky-600' : 'text-slate-400 group-hover:text-slate-500'} />
                  <span className="flex-1">
                    <span className="block text-sm font-medium">{item.label}</span>
                    <span className={`mt-0.5 block text-[11px] ${isActive ? 'text-sky-500' : 'text-slate-400'}`}>{item.description}</span>
                  </span>
                  {isActive && <ChevronRight size={15} className="text-sky-400" />}
                </button>
              );
            })}
          </nav>
          <div className="m-3 rounded-xl bg-slate-50 p-4">
            <div className="mb-2 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-semibold text-slate-600">Данные сохранены</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400">Все изменения доступны после перезагрузки браузера.</p>
          </div>
        </div>
      </aside>

      {mobileNavOpen && <button aria-label="Закрыть меню" onClick={() => setMobileNavOpen(false)} className="fixed inset-0 z-30 bg-slate-900/20 lg:hidden" />}

      <main className="min-h-screen lg:pl-64">
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-slate-200/70 bg-[#f7f9fc]/90 px-4 backdrop-blur-md sm:px-6 lg:px-10">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileNavOpen(true)} className="rounded-lg p-2 text-slate-500 hover:bg-white lg:hidden">
              <Menu size={20} />
            </button>
            <div>
              <p className="text-xs font-medium text-slate-400">Рабочая область / {activeNav.label}</p>
              <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-800">{activeNav.label}</h1>
            </div>
          </div>
          <div className="hidden items-center gap-3 sm:flex">
            <div className="text-right">
              <p className="text-xs font-semibold text-slate-700">Сегодня</p>
              <p className="text-[11px] text-slate-400">{new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-xs font-semibold text-white">HR</span>
          </div>
        </header>
        <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
          {content}
        </div>
      </main>
    </div>
  );
}

export default App;
