// App.tsx — โครงสร้างหลัก: Sidebar + หัวหน้า + เนื้อหาหน้าต่าง ๆ

import { useState } from 'react';
import { DashboardPage } from './pages/Dashboard';
import { MembersPage } from './pages/Members';
import { PackagesPage } from './pages/Packages';
import { PaymentsPage } from './pages/Payments';
import { VisitsPage } from './pages/Visits';
import { TrainersPage } from './pages/Trainers';
import { IssuesPage } from './pages/Issues';
import {
  AlertIcon,
  DumbbellIcon,
  HomeIcon,
  LogInIcon,
  TagIcon,
  UsersIcon,
  WalletIcon,
} from './components/icons';
import { todayHeading } from './utils/format';

type TabKey = 'dashboard' | 'members' | 'packages' | 'payments' | 'visits' | 'trainers' | 'issues';

const NAV: { key: TabKey; label: string; icon: (p: { className?: string }) => React.ReactNode }[] = [
  { key: 'dashboard', label: 'ภาพรวม', icon: HomeIcon },
  { key: 'members', label: 'สมาชิก', icon: UsersIcon },
  { key: 'packages', label: 'แพ็กเกจ', icon: TagIcon },
  { key: 'payments', label: 'ชำระเงิน', icon: WalletIcon },
  { key: 'visits', label: 'เข้า-ออก', icon: LogInIcon },
  { key: 'trainers', label: 'เทรนเนอร์', icon: DumbbellIcon },
  { key: 'issues', label: 'แจ้งปัญหา', icon: AlertIcon },
];

export default function App() {
  const [tab, setTab] = useState<TabKey>('dashboard');

  const activeLabel = NAV.find((n) => n.key === tab)?.label ?? '';

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-300">
        <div className="flex h-full flex-col">
          <div className="border-b border-slate-800 px-5 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-lg font-black text-white">
                ESS
              </div>
              <div>
                <p className="text-base font-bold text-white">Fitness Center</p>
                <p className="text-xs text-slate-400">มหาวิทยาลัยพะเยา</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
            {NAV.map((n) => {
              const Icon = n.icon;
              const active = tab === n.key;
              return (
                <button
                  key={n.key}
                  onClick={() => setTab(n.key)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    active ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {n.label}
                </button>
              );
            })}
          </nav>

          <div className="border-t border-slate-800 px-5 py-4 text-xs text-slate-500">
            Mini Project · การเขียนโปรแกรมเชิงวัตถุ (OOP)
          </div>
        </div>
      </aside>

      {/* เนื้อหาหลัก */}
      <main className="ml-64">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 px-8 py-4 backdrop-blur">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-slate-800">{activeLabel}</h1>
            <p className="text-sm text-slate-500">{todayHeading()}</p>
          </div>
        </header>

        <div className="px-8 py-6">
          {tab === 'dashboard' && <DashboardPage />}
          {tab === 'members' && <MembersPage />}
          {tab === 'packages' && <PackagesPage />}
          {tab === 'payments' && <PaymentsPage />}
          {tab === 'visits' && <VisitsPage />}
          {tab === 'trainers' && <TrainersPage />}
          {tab === 'issues' && <IssuesPage />}
        </div>
      </main>
    </div>
  );
}