// pages/Trainers.tsx — หน้า CRUD เทรนเนอร์ + ความเชี่ยวชาญ + ตารางเวลาว่าง

import { useState } from 'react';
import { useFitness } from '../hooks/useFitness';
import { DAYS, SHIFTS } from '../models/enums';
import type { Trainer } from '../models/Trainer';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Field, TextInput, ErrorText } from '../components/ui/Field';
import { Alert, useNotice } from '../components/ui/Alert';
import { EmptyState } from '../components/ui/EmptyState';
import { DumbbellIcon, PencilIcon, PlusIcon, TrashIcon } from '../components/icons';
import { money } from '../utils/format';

interface TrainerForm {
  name: string;
  phone: string;
  email: string;
  specialtiesText: string;
  hourlyRate: string;
  schedule: string[];
}

function emptyForm(): TrainerForm {
  return { name: '', phone: '', email: '', specialtiesText: '', hourlyRate: '', schedule: [] };
}

function fromTrainer(t: Trainer): TrainerForm {
  return {
    name: t.name,
    phone: t.phone,
    email: t.email,
    specialtiesText: t.specialties.join(', '),
    hourlyRate: String(t.hourlyRate || ''),
    schedule: t.schedule,
  };
}

function toggleSchedule(form: TrainerForm, key: string): TrainerForm {
  const has = form.schedule.includes(key);
  return { ...form, schedule: has ? form.schedule.filter((s) => s !== key) : [...form.schedule, key] };
}

export function TrainersPage() {
  const svc = useFitness();
  const [notice, show] = useNotice();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Trainer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Trainer | null>(null);
  const [form, setForm] = useState<TrainerForm>(emptyForm());
  const [formError, setFormError] = useState('');

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm());
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (t: Trainer) => {
    setEditing(t);
    setForm(fromTrainer(t));
    setFormError('');
    setModalOpen(true);
  };

  const submit = () => {
    if (!form.name.trim()) {
      setFormError('กรุณากรอกชื่อเทรนเนอร์');
      return;
    }
    const data = {
      name: form.name,
      phone: form.phone,
      email: form.email,
      specialties: form.specialtiesText.split(',').filter((s) => s.trim()),
      hourlyRate: Number(form.hourlyRate) || 0,
      schedule: form.schedule,
    };
    try {
      if (editing) {
        svc.updateTrainer(editing.id, data);
        show('success', `แก้ไขเทรนเนอร์ ${data.name} เรียบร้อย`);
      } else {
        svc.addTrainer(data);
        show('success', `เพิ่มเทรนเนอร์ ${data.name} เรียบร้อย`);
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
          <h2 className="text-xl font-bold text-slate-800">จัดการเทรนเนอร์</h2>
          <p className="text-sm text-slate-500">ข้อมูลเทรนเนอร์ ความเชี่ยวชาญ และตารางเวลาว่าง</p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          <PlusIcon className="h-4 w-4" />
          เพิ่มเทรนเนอร์
        </button>
      </div>

      {notice && <Alert notice={notice} />}

      {svc.trainers.length === 0 ? (
        <EmptyState title="ยังไม่มีเทรนเนอร์" detail="กดปุ่ม 'เพิ่มเทรนเนอร์' เพื่อเริ่มต้น" />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {svc.trainers.map((t) => (
            <div key={t.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                    <DumbbellIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{t.name}</p>
                    <p className="text-xs text-slate-400">{t.id} · {t.phone}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(t)} title="แก้ไข" className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button onClick={() => setDeleteTarget(t)} title="ลบ" className="rounded-lg p-2 text-rose-400 transition hover:bg-rose-50 hover:text-rose-600">
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {t.specialties.length === 0 ? (
                  <span className="text-xs text-slate-400">ยังไม่ระบุความเชี่ยวชาญ</span>
                ) : (
                  t.specialties.map((s) => (
                    <span key={s} className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200">
                      {s}
                    </span>
                  ))
                )}
              </div>

              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-slate-500">{t.hourlyRate > 0 ? `ค่าโค้ช ${money(t.hourlyRate)}/ชม.` : 'ยังไม่ระบุค่าโค้ช'}</span>
              </div>

              <div className="mt-3 rounded-xl bg-slate-50 p-3 ring-1 ring-inset ring-slate-100">
                <p className="mb-1 text-xs font-semibold text-slate-500">ตารางเวลาว่าง</p>
                <p className="text-xs leading-relaxed text-slate-700">{t.getScheduleSummary()}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal เพิ่ม/แก้ไข */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'แก้ไขเทรนเนอร์' : 'เพิ่มเทรนเนอร์ใหม่'}
        wide
        footer={
          <>
            <button onClick={() => setModalOpen(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100">
              ยกเลิก
            </button>
            <button onClick={submit} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700">
              {editing ? 'บันทึกการแก้ไข' : 'เพิ่มเทรนเนอร์'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="ชื่อเทรนเนอร์">
            <TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="เช่น โค้ชป๊อป" />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="เบอร์โทรศัพท์">
              <TextInput value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </Field>
            <Field label="อีเมล">
              <TextInput value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </Field>
            <Field label="ค่าโค้ช (บาท/ชม.)">
              <TextInput type="number" min={0} value={form.hourlyRate} onChange={(e) => setForm({ ...form, hourlyRate: e.target.value })} />
            </Field>
          </div>
          <Field label="ความเชี่ยวชาญ" hint="คั่นด้วยเครื่องหมาย , เช่น ฟิตเนส, โยคะ, เวทเทรนนิ่ง">
            <TextInput value={form.specialtiesText} onChange={(e) => setForm({ ...form, specialtiesText: e.target.value })} />
          </Field>

          <div>
            <span className="mb-1 block text-sm font-medium text-slate-700">ตารางเวลาว่าง</span>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-center text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500">
                    <th className="px-2 py-2 font-medium">วัน / ช่วง</th>
                    {SHIFTS.map((s) => (
                      <th key={s} className="px-2 py-2 font-medium">
                        {s}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {DAYS.map((day) => (
                    <tr key={day}>
                      <td className="px-2 py-1.5 font-medium text-slate-600">{day}</td>
                      {SHIFTS.map((shift) => {
                        const key = `${day}:${shift}`;
                        const checked = form.schedule.includes(key);
                        return (
                          <td key={key} className="px-2 py-1.5">
                            <button
                              onClick={() => setForm(toggleSchedule(form, key))}
                              className={`h-6 w-6 rounded-md border-2 transition ${
                                checked
                                  ? 'border-emerald-600 bg-emerald-600 text-white'
                                  : 'border-slate-300 text-transparent hover:border-emerald-400'
                              }`}
                            >
                              ✓
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {formError && <ErrorText>{formError}</ErrorText>}
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="ลบเทรนเนอร์"
        message={`ต้องการลบเทรนเนอร์ "${deleteTarget?.name}" หรือไม่?`}
        confirmText="ลบเทรนเนอร์"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            svc.deleteTrainer(deleteTarget.id);
            show('success', `ลบเทรนเนอร์ ${deleteTarget.name} แล้ว`);
          }
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}