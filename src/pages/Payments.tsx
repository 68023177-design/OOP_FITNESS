// pages/Payments.tsx — หน้า บันทึกการชำระเงิน สถานะ และวิธีชำระ

import { useState } from 'react';
import { useFitness } from '../hooks/useFitness';
import { PackageType, PaymentMethod, PaymentStatus } from '../models/enums';
import { StudentMember } from '../models/StudentMember';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { Field, Select, ErrorText } from '../components/ui/Field';
import { Alert, useNotice } from '../components/ui/Alert';
import { EmptyState } from '../components/ui/EmptyState';
import { CheckIcon, PlusIcon, WalletIcon, XIcon } from '../components/icons';
import { fmtDateTime, money } from '../utils/format';
import { PAYMENT_STATUS_TONES, paymentMethodLabel, paymentStatusLabel } from '../utils/labels';

export function PaymentsPage() {
  const svc = useFitness();
  const [notice, show] = useNotice();
  const [modalOpen, setModalOpen] = useState(false);
  const [memberId, setMemberId] = useState('');
  const [type, setType] = useState<PackageType>(PackageType.MONTHLY);
  const [method, setMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [status, setStatus] = useState<PaymentStatus>(PaymentStatus.PAID);
  const [formError, setFormError] = useState('');

  const member = svc.getMemberById(memberId);
  const template = svc.getPackageByType(type);

  // ★ Polymorphism: ราคาคำนวณจากชนิดจริงของแพ็กเกจ + ชนิดสมาชิก
  //   (MonthlyPackage ลดให้ StudentMember / DailyPackage คิดราคาเต็ม)
  const amount = member && template ? template.calcPrice(member) : 0;
  const isDiscounted = member instanceof StudentMember && type === PackageType.MONTHLY;

  const payments = [...svc.payments].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const openModal = () => {
    setMemberId('');
    setType(PackageType.MONTHLY);
    setMethod(PaymentMethod.CASH);
    setStatus(PaymentStatus.PAID);
    setFormError('');
    setModalOpen(true);
  };

  const submit = () => {
    if (!memberId) {
      setFormError('กรุณาเลือกสมาชิก');
      return;
    }
    try {
      const p = svc.purchasePackage(memberId, type, method, status);
      if (status === PaymentStatus.PAID) {
        show('success', `ชำระเงิน ${p.memberName} เรียบร้อย ${money(p.amount)}`);
      } else {
        show('info', `บันทึกรายการรอชำระ ${money(p.amount)} แล้ว`);
      }
      setModalOpen(false);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'เกิดข้อผิดพลาด');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">ระบบชำระเงิน</h2>
          <p className="text-sm text-slate-500">บันทึกการชำระเงิน สถานะ และวิธีชำระเงิน</p>
        </div>
        <button
          onClick={openModal}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          <PlusIcon className="h-4 w-4" />
          บันทึกการชำระเงิน
        </button>
      </div>

      {notice && <Alert notice={notice} />}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">เลขที่</th>
                <th className="px-4 py-3 font-semibold">สมาชิก</th>
                <th className="px-4 py-3 font-semibold">แพ็กเกจ</th>
                <th className="px-4 py-3 font-semibold">จำนวนเงิน</th>
                <th className="px-4 py-3 font-semibold">วิธีชำระ</th>
                <th className="px-4 py-3 font-semibold">สถานะ</th>
                <th className="px-4 py-3 font-semibold">วันที่</th>
                <th className="px-4 py-3 font-semibold text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8">
                    <EmptyState title="ยังไม่มีรายการชำระเงิน" detail="กดปุ่ม 'บันทึกการชำระเงิน' เพื่อเริ่มต้น" />
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{p.id}</td>
                    <td className="px-4 py-3 font-medium text-slate-700">{p.memberName}</td>
                    <td className="px-4 py-3 text-slate-600">{p.packageLabel}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{money(p.amount)}</td>
                    <td className="px-4 py-3 text-slate-600">{paymentMethodLabel(p.method)}</td>
                    <td className="px-4 py-3">
                      <Badge tone={PAYMENT_STATUS_TONES[p.status]}>{paymentStatusLabel(p.status)}</Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{fmtDateTime(p.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      {p.status === PaymentStatus.PENDING && (
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => {
                              try {
                                svc.confirmPayment(p.id);
                                show('success', `ยืนยันการชำระ ${p.memberName} แล้ว สมาชิกได้รับสิทธิ์เข้าใช้`);
                              } catch (e) {
                                show('error', e instanceof Error ? e.message : 'เกิดข้อผิดพลาด');
                              }
                            }}
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700"
                          >
                            <CheckIcon className="h-3.5 w-3.5" />
                            ยืนยันชำระ
                          </button>
                          <button
                            onClick={() => {
                              try {
                                svc.cancelPayment(p.id);
                                show('info', 'ยกเลิกรายการชำระเงินแล้ว');
                              } catch (e) {
                                show('error', e instanceof Error ? e.message : 'เกิดข้อผิดพลาด');
                              }
                            }}
                            className="inline-flex items-center gap-1 rounded-lg bg-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-300"
                          >
                            <XIcon className="h-3.5 w-3.5" />
                            ยกเลิก
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal บันทึกการชำระเงิน */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="บันทึกการชำระเงิน"
        footer={
          <>
            <button onClick={() => setModalOpen(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100">
              ยกเลิก
            </button>
            <button onClick={submit} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700">
              <WalletIcon className="h-4 w-4" />
              บันทึกการชำระเงิน
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="สมาชิก">
            <Select value={memberId} onChange={(e) => setMemberId(e.target.value)}>
              <option value="">— เลือกสมาชิก —</option>
              {svc.members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.memberNo} · {m.name} ({m.getRoleLabel()})
                </option>
              ))}
            </Select>
          </Field>

          <Field label="แพ็กเกจ">
            <Select value={type} onChange={(e) => setType(e.target.value as PackageType)}>
              {svc.packages.map((p) => (
                <option key={p.type} value={p.type}>
                  {p.name} — {money(p.basePrice)} ({p.usageRight})
                </option>
              ))}
            </Select>
          </Field>

          {/* สรุปราคา (แสดง Polymorphism ของ calcPrice ปัจจุบัน) */}
          <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-inset ring-slate-200">
            {member && template ? (
              <>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">ราคาสำหรับ {member.getRoleLabel()}</span>
                  <span className="text-lg font-bold text-slate-800">{money(amount)}</span>
                </div>
                {isDiscounted && (
                  <p className="mt-1 text-xs font-medium text-emerald-600">ได้รับส่วนลดนิสิต 20% จากราคาเต็ม {money(template.basePrice)}</p>
                )}
                <p className="mt-1 text-xs text-slate-400">สิทธิ์: {template.usageRight}</p>
              </>
            ) : (
              <p className="text-sm text-slate-400">เลือกสมาชิกและแพ็กเกจเพื่อดูราคา</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="วิธีชำระเงิน">
              <Select value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)}>
                <option value={PaymentMethod.CASH}>เงินสด</option>
                <option value={PaymentMethod.CARD}>บัตรเครดิต/เดบิต</option>
                <option value={PaymentMethod.TRANSFER}>โอนเงิน</option>
                <option value={PaymentMethod.QR}>QR Payment</option>
              </Select>
            </Field>
            <Field label="สถานะการชำระ">
              <Select value={status} onChange={(e) => setStatus(e.target.value as PaymentStatus)}>
                <option value={PaymentStatus.PAID}>ชำระแล้ว (ได้รับสิทธิ์ทันที)</option>
                <option value={PaymentStatus.PENDING}>รอชำระเงิน (ค้างชำระ)</option>
              </Select>
            </Field>
          </div>

          {status === PaymentStatus.PENDING && (
            <p className="text-xs text-amber-600">สมาชิกจะได้รับสิทธิ์เข้าใช้เมื่อกด "ยืนยันชำระ" แล้ว</p>
          )}

          {formError && <ErrorText>{formError}</ErrorText>}
        </div>
      </Modal>
    </div>
  );
}