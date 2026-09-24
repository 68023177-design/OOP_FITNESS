// pages/Dashboard.tsx — หน้าแรก สรุปสถิติของระบบ

import { useFitness } from '../hooks/useFitness';
import { StatCard } from '../components/ui/StatCard';
import { Badge } from '../components/ui/Badge';
import { AlertIcon, ClockIcon, DumbbellIcon, UsersIcon, WalletIcon } from '../components/icons';
import { money, fmtDateTime } from '../utils/format';
import { ISSUE_STATUS_TONES, issueStatusLabel } from '../utils/labels';
import { EmptyState } from '../components/ui/EmptyState';

export function DashboardPage() {
  const svc = useFitness();

  // ---- ข้อมูลสำหรับการ์ดสถิติ ----
  const memberCount = svc.members.length;
  const activeVisitCount = svc.activeVisits.length;
  const revenue = svc.totalRevenue;
  const openIssues = svc.openIssueCount;

  // สมาชิกที่แพ็กเกจใกล้หมดอายุ (ภายใน 7 วัน)
  const expiring = svc.members
    .filter((m) => m.package && m.getRemainingDays() > 0 && m.getRemainingDays() <= 7)
    .sort((a, b) => a.getRemainingDays() - b.getRemainingDays());

  const recentIssues = [...svc.issues].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 3);

  const isEmpty = svc.members.length === 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">ภาพรวมศูนย์ฟิตเนส</h2>
          <p className="text-sm text-slate-500">ESS Fitness Center · มหาวิทยาลัยพะเยา</p>
        </div>
        {isEmpty && (
          <button
            onClick={() => svc.loadDemoData()}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            เติมข้อมูลตัวอย่าง (Demo)
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="สมาชิกทั้งหมด" value={String(memberCount)} sub={`นิสิต ${svc.members.filter((m) => m.getTypeCode() === 'STUDENT').length} · ภายนอก ${svc.members.filter((m) => m.getTypeCode() === 'EXTERNAL').length}`} icon={<UsersIcon className="h-6 w-6" />} accent="emerald" />
        <StatCard title="กำลังใช้บริการ" value={String(activeVisitCount)} sub="คนที่ check-in แล้วยังไม่ check-out" icon={<DumbbellIcon className="h-6 w-6" />} accent="sky" />
        <StatCard title="รายได้รวม (ชำระแล้ว)" value={money(revenue)} sub="จากรายการชำระเงินทั้งหมด" icon={<WalletIcon className="h-6 w-6" />} accent="violet" />
        <StatCard title="ปัญหาที่ยังค้าง" value={String(openIssues)} sub="แจ้งซ่อม/อุปกรณ์ชำรุด" icon={<AlertIcon className="h-6 w-6" />} accent="amber" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* แพ็กเกจใกล้หมดอายุ */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-slate-800">
            <ClockIcon className="h-5 w-5 text-amber-500" />
            แพ็กเกจใกล้หมดอายุ (ภายใน 7 วัน)
          </h3>
          {expiring.length === 0 ? (
            <EmptyState title="ยังไม่มีสมาชิกที่แพ็กเกจใกล้หมดอายุ" />
          ) : (
            <ul className="divide-y divide-slate-100">
              {expiring.map((m) => (
                <li key={m.id} className="flex items-center justify-between py-2.5">
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {m.name} <span className="text-slate-400">· {m.memberNo}</span>
                    </p>
                    <p className="text-xs text-slate-500">{m.package?.name} · หมดอายุ {m.expiresAt ? new Date(m.expiresAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }) : '-'}</p>
                  </div>
                  <Badge tone={m.getRemainingDays() <= 3 ? 'rose' : 'amber'}>เหลือ {m.getRemainingDays()} วัน</Badge>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* การแจ้งปัญหาล่าสุด */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-slate-800">
            <AlertIcon className="h-5 w-5 text-rose-500" />
            การแจ้งปัญหาล่าสุด
          </h3>
          {recentIssues.length === 0 ? (
            <EmptyState title="ยังไม่มีการแจ้งปัญหา" />
          ) : (
            <ul className="divide-y divide-slate-100">
              {recentIssues.map((i) => (
                <li key={i.id} className="py-2.5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-800">{i.title}</p>
                    <Badge tone={ISSUE_STATUS_TONES[i.status]}>{issueStatusLabel(i.status)}</Badge>
                  </div>
                  <p className="text-xs text-slate-500">
                    {i.location} · {fmtDateTime(i.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}