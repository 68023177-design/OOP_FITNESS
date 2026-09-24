// pages/Visits.tsx — หน้า Check-in / Check-out พร้อมระยะเวลาการใช้งาน

import { useState } from 'react';
import { useFitness } from '../hooks/useFitness';
import { LogInIcon, ArrowRightIcon, ClockIcon } from '../components/icons';
import { Badge } from '../components/ui/Badge';
import { Field, Select } from '../components/ui/Field';
import { Alert, useNotice } from '../components/ui/Alert';
import { EmptyState } from '../components/ui/EmptyState';
import { fmtDateTime, fmtTime } from '../utils/format';

export function VisitsPage() {
  const svc = useFitness();
  const [notice, show] = useNotice();
  const [selectedMemberId, setSelectedMemberId] = useState('');

  // สมาชิกที่เข้าใช้ได้: ยัง active, มีสิทธิ์ และยังไม่มีการใช้งานค้างอยู่
  const canCheckIn = svc.members.filter(
    (m) => m.isActive && m.hasAccess() && !svc.getActiveVisitByMember(m.id),
  );

  const visits = [...svc.visits].sort((a, b) => b.checkInAt.getTime() - a.checkInAt.getTime());

  const doCheckIn = () => {
    if (!selectedMemberId) {
      show('error', 'กรุณาเลือกสมาชิกก่อน');
      return;
    }
    try {
      const visit = svc.checkIn(selectedMemberId);
      show('success', `Check-in สำเร็จ: ${visit.memberName} เข้าใช้บริการแล้ว`);
    } catch (e) {
      show('error', e instanceof Error ? e.message : 'เกิดข้อผิดพลาด');
    }
  };

  const doCheckOut = (visitId: string) => {
    try {
      const minutes = svc.checkOut(visitId);
      show('info', `Check-out สำเร็จ ใช้บริการ ${Math.floor(minutes / 60)} ชม. ${minutes % 60} นาที`);
    } catch (e) {
      show('error', e instanceof Error ? e.message : 'เกิดข้อผิดพลาด');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">บันทึกการเข้าใช้บริการ</h2>
        <p className="text-sm text-slate-500">Check-in / Check-out พร้อมคำนวณระยะเวลาการใช้งาน</p>
      </div>

      {notice && <Alert notice={notice} />}

      {/* แผง Check-in */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-slate-800">
          <LogInIcon className="h-5 w-5 text-emerald-600" />
          Check-in สมาชิกเข้าใช้บริการ
        </h3>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Field label="เลือกสมาชิก">
              <Select value={selectedMemberId} onChange={(e) => setSelectedMemberId(e.target.value)}>
                <option value="">— เลือกสมาชิก —</option>
                {canCheckIn.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.memberNo} · {m.name} ({m.getRoleLabel()})
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <button
            onClick={doCheckIn}
            className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            เข้าใช้บริการ
          </button>
        </div>
        {canCheckIn.length === 0 && (
          <p className="mt-3 text-xs text-slate-400">ยังไม่มีสมาชิกที่เข้าใช้ได้ (เพิ่มสมาชิกหรือซื้อแพ็กเกจก่อน)</p>
        )}
      </div>

      {/* ตารางบันทึก */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">เวลาเข้า</th>
                <th className="px-4 py-3 font-semibold">สมาชิก</th>
                <th className="px-4 py-3 font-semibold">แพ็กเกจ</th>
                <th className="px-4 py-3 font-semibold">เวลาออก</th>
                <th className="px-4 py-3 font-semibold">ระยะเวลา</th>
                <th className="px-4 py-3 font-semibold">สถานะ</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visits.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8">
                    <EmptyState title="ยังไม่มีบันทึกการเข้าใช้บริการ" />
                  </td>
                </tr>
              ) : (
                visits.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-700">{fmtDateTime(v.checkInAt)}</p>
                      <p className="text-xs text-slate-400">{v.id}</p>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-700">{v.memberName}</td>
                    <td className="px-4 py-3 text-slate-600">{v.packageLabel}</td>
                    <td className="px-4 py-3 text-slate-600">{fmtTime(v.checkOutAt)}</td>
                    <td className="px-4 py-3">
                      {v.isActive() ? (
                        <span className="inline-flex items-center gap-1 text-sm text-slate-500">
                          <ClockIcon className="h-4 w-4" />
                          กำลังใช้งาน ({Math.max(1, Math.round((Date.now() - v.checkInAt.getTime()) / 60_000))} นาที)
                        </span>
                      ) : (
                        <span className="font-medium text-slate-700">{v.getDurationLabel()}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {v.isActive() ? <Badge tone="sky">กำลังใช้บริการ</Badge> : <Badge tone="slate">ออกจากระบบแล้ว</Badge>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {v.isActive() && (
                        <button
                          onClick={() => doCheckOut(v.id)}
                          className="inline-flex items-center gap-1 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-700"
                        >
                          <ArrowRightIcon className="h-4 w-4" />
                          Check-out
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}