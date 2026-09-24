// pages/Members.tsx — หน้า CRUD สมาชิก (นิสิต / บุคคลภายนอก)

import { useMemo, useState } from 'react';
import { useFitness } from '../hooks/useFitness';
import type { Member } from '../models/Member';
import { MemberKind, MemberStatus } from '../models/enums';
import { StudentMember } from '../models/StudentMember';
import { ExternalMember } from '../models/ExternalMember';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Field, Select, TextInput, ErrorText } from '../components/ui/Field';
import { Alert, useNotice } from '../components/ui/Alert';
import { EmptyState } from '../components/ui/EmptyState';
import { PencilIcon, PlusIcon, TrashIcon, UsersIcon } from '../components/icons';
import { MEMBER_STATUS_TONES, memberStatusLabel } from '../utils/labels';

interface MemberForm {
  kind: MemberKind;
  name: string;
  phone: string;
  email: string;
  studentId: string;
  faculty: string;
  idCardNo: string;
}

function emptyForm(): MemberForm {
  return { kind: MemberKind.STUDENT, name: '', phone: '', email: '', studentId: '', faculty: '', idCardNo: '' };
}

export function MembersPage() {
  const svc = useFitness();
  const [notice, show] = useNotice();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Member | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Member | null>(null);
  const [form, setForm] = useState<MemberForm>(emptyForm());
  const [formError, setFormError] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = [...svc.members];
    if (!q) return list;
    return list.filter((m) => m.name.toLowerCase().includes(q) || m.memberNo.toLowerCase().includes(q) || m.getRoleLabel().includes(q));
  }, [svc.members, search]);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm());
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (m: Member) => {
    setEditing(m);
    setForm({
      kind: m.getTypeCode() === MemberKind.STUDENT ? MemberKind.STUDENT : MemberKind.EXTERNAL,
      name: m.name,
      phone: m.phone,
      email: m.email,
      studentId: m instanceof StudentMember ? m.studentId : '',
      faculty: m instanceof StudentMember ? m.faculty : '',
      idCardNo: m instanceof ExternalMember ? m.idCardNo : '',
    });
    setFormError('');
    setModalOpen(true);
  };

  const submit = () => {
    if (!form.name.trim()) {
      setFormError('กรุณากรอกชื่อสมาชิก');
      return;
    }
    try {
      if (editing) {
        svc.updateMember(editing.id, {
          kind: form.kind,
          name: form.name,
          phone: form.phone,
          email: form.email,
          studentId: form.kind === MemberKind.STUDENT ? form.studentId : undefined,
          faculty: form.kind === MemberKind.STUDENT ? form.faculty : undefined,
          idCardNo: form.kind === MemberKind.EXTERNAL ? form.idCardNo : undefined,
        });
        show('success', `แก้ไขข้อมูล ${form.name} เรียบร้อย`);
      } else {
        svc.addMember({
          kind: form.kind,
          name: form.name,
          phone: form.phone,
          email: form.email,
          studentId: form.kind === MemberKind.STUDENT ? form.studentId : undefined,
          faculty: form.kind === MemberKind.STUDENT ? form.faculty : undefined,
          idCardNo: form.kind === MemberKind.EXTERNAL ? form.idCardNo : undefined,
        });
        show('success', `เพิ่มสมาชิก ${form.name} เรียบร้อย`);
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
          <h2 className="text-xl font-bold text-slate-800">จัดการสมาชิก</h2>
          <p className="text-sm text-slate-500">เพิ่ม / แก้ไข / ลบ นิสิตและบุคคลภายนอก</p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          <PlusIcon className="h-4 w-4" />
          เพิ่มสมาชิก
        </button>
      </div>

      {notice && <Alert notice={notice} />}

      <div className="flex items-center gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ค้นหาตามชื่อ รหัสสมาชิก หรือประเภท..."
          className="w-full max-w-sm rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">สมาชิก</th>
                <th className="px-4 py-3 font-semibold">ประเภท</th>
                <th className="px-4 py-3 font-semibold">ข้อมูลเพิ่มเติม</th>
                <th className="px-4 py-3 font-semibold">แพ็กเกจ</th>
                <th className="px-4 py-3 font-semibold">สถานะ</th>
                <th className="px-4 py-3 font-semibold text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8">
                    <EmptyState title="ไม่พบสมาชิก" detail="กดปุ่ม 'เพิ่มสมาชิก' เพื่อเพิ่มสมาชิกใหม่" />
                  </td>
                </tr>
              ) : (
                filtered.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-800">{m.name}</p>
                      <p className="text-xs text-slate-400">{m.memberNo}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5">
                        <UsersIcon className="h-4 w-4 text-slate-300" />
                        <span className="font-medium text-slate-700">{m.getRoleLabel()}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{m.getExtraInfo()}</td>
                    <td className="px-4 py-3">
                      {m.package ? (
                        <div>
                          <p className="font-medium text-slate-700">{m.package.name}</p>
                          <p className="text-xs text-slate-400">เหลือ {m.getRemainingDays()} วัน</p>
                        </div>
                      ) : (
                        <span className="text-slate-400">ไม่มีแพ็กเกจ</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={MEMBER_STATUS_TONES[m.status]}>{memberStatusLabel(m.status)}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => openEdit(m)}
                          title="แก้ไข"
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        {m.status === MemberStatus.ACTIVE ? (
                          <button
                            onClick={() => {
                              svc.suspendMember(m.id);
                              show('info', `ระงับสมาชิก ${m.name} แล้ว`);
                            }}
                            title="ระงับการใช้งาน"
                            className="rounded-lg p-2 text-amber-500 transition hover:bg-amber-50"
                          >
                            ระงับ
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              svc.activateMember(m.id);
                              show('success', `เปิดใช้งาน ${m.name} แล้ว`);
                            }}
                            title="เปิดใช้งาน"
                            className="rounded-lg p-2 text-emerald-600 transition hover:bg-emerald-50"
                          >
                            เปิดใช้งาน
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteTarget(m)}
                          title="ลบ"
                          className="rounded-lg p-2 text-rose-400 transition hover:bg-rose-50 hover:text-rose-600"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal เพิ่ม/แก้ไข */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'แก้ไขสมาชิก' : 'เพิ่มสมาชิกใหม่'}
        footer={
          <>
            <button onClick={() => setModalOpen(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100">
              ยกเลิก
            </button>
            <button onClick={submit} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700">
              {editing ? 'บันทึกการแก้ไข' : 'เพิ่มสมาชิก'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {!editing && (
            <Field label="ประเภทสมาชิก">
              <Select
                value={form.kind}
                onChange={(e) => setForm({ ...form, kind: e.target.value as MemberKind })}
              >
                <option value={MemberKind.STUDENT}>นิสิต (มหาวิทยาลัยพะเยา)</option>
                <option value={MemberKind.EXTERNAL}>บุคคลภายนอก</option>
              </Select>
            </Field>
          )}
          <Field label="ชื่อ-นามสกุล">
            <TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="เช่น สมชาย ใจดี" />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="เบอร์โทรศัพท์">
              <TextInput value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="080-xxx-xxxx" />
            </Field>
            <Field label="อีเมล">
              <TextInput value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="name@up.ac.th" />
            </Field>
          </div>

          {/* ฟอร์มเปลี่ยนตามชนิดสมาชิก (Polymorphism — ข้อมูลเฉพาะแต่ละชนิด) */}
          {form.kind === MemberKind.STUDENT ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="รหัสนิสิต">
                <TextInput value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} placeholder="641111001" />
              </Field>
              <Field label="คณะ">
                <TextInput value={form.faculty} onChange={(e) => setForm({ ...form, faculty: e.target.value })} placeholder="วิศวกรรมศาสตร์" />
              </Field>
            </div>
          ) : (
            <Field label="เลขบัตรประชาชน">
              <TextInput value={form.idCardNo} onChange={(e) => setForm({ ...form, idCardNo: e.target.value })} placeholder="13 หลัก" />
            </Field>
          )}

          {formError && <ErrorText>{formError}</ErrorText>}
        </div>
      </Modal>

      {/* ยืนยันการลบ */}
      <ConfirmDialog
        open={deleteTarget !== null}
        title="ลบสมาชิก"
        message={`ต้องการลบสมาชิก "${deleteTarget?.name}" (${deleteTarget?.memberNo}) ออกจากระบบหรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้`}
        confirmText="ลบสมาชิก"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            svc.deleteMember(deleteTarget.id);
            show('success', `ลบสมาชิก ${deleteTarget.name} แล้ว`);
          }
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}