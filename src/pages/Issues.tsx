// pages/Issues.tsx — หน้า แจ้งปัญหา/แจ้งซ่อม + ติดตามสถานะ (REPORTED → IN_PROGRESS → RESOLVED)

import { useState } from 'react';
import { useFitness } from '../hooks/useFitness';
import type { IssueReport } from '../models/IssueReport';
import { IssueStatus } from '../models/enums';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Field, TextInput, TextArea, ErrorText } from '../components/ui/Field';
import { Badge } from '../components/ui/Badge';
import { Alert, useNotice } from '../components/ui/Alert';
import { EmptyState } from '../components/ui/EmptyState';
import { AlertIcon, CheckIcon, PencilIcon, PlusIcon, TrashIcon, WrenchIcon } from '../components/icons';
import { fmtDateTime } from '../utils/format';
import { ISSUE_STATUS_TONES, issueStatusLabel } from '../utils/labels';

interface IssueForm {
  title: string;
  location: string;
  description: string;
}

function emptyForm(): IssueForm {
  return { title: '', location: '', description: '' };
}

function fromIssue(i: IssueReport): IssueForm {
  return { title: i.title, location: i.location, description: i.description };
}

export function IssuesPage() {
  const svc = useFitness();
  const [notice, show] = useNotice();
  const [modalOpen, setModalOpen] = useState(false);
  const [resolveTarget, setResolveTarget] = useState<IssueReport | null>(null);
  const [resolveNote, setResolveNote] = useState('');
  const [editing, setEditing] = useState<IssueReport | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<IssueReport | null>(null);
  const [form, setForm] = useState<IssueForm>(emptyForm());
  const [formError, setFormError] = useState('');

  const issues = [...svc.issues].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm());
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (i: IssueReport) => {
    setEditing(i);
    setForm(fromIssue(i));
    setFormError('');
    setModalOpen(true);
  };

  const submit = () => {
    if (!form.title.trim()) {
      setFormError('กรุณากรอกหัวข้อ');
      return;
    }
    try {
      if (editing) {
        svc.updateIssue(editing.id, form);
        show('success', 'แก้ไขการแจ้งปัญหาเรียบร้อย');
      } else {
        svc.addIssue({ ...form, reporterName: 'ผู้ดูแลระบบ' });
        show('success', 'บันทึกการแจ้งปัญหาแล้ว');
      }
      setModalOpen(false);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'เกิดข้อผิดพลาด');
    }
  };

  const doResolve = () => {
    if (resolveTarget) {
      try {
        svc.resolveIssue(resolveTarget.id, resolveNote || 'ซ่อมแซมเสร็จสิ้น');
        show('success', 'ทำเครื่องหมายเสร็จสิ้นแล้ว');
      } catch (e) {
        show('error', e instanceof Error ? e.message : 'เกิดข้อผิดพลาด');
      }
    }
    setResolveTarget(null);
    setResolveNote('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">แจ้งปัญหา / แจ้งซ่อม</h2>
          <p className="text-sm text-slate-500">แจ้งซ่อมหรืออุปกรณ์ชำรุด พร้อมติดตามสถานะการแก้ไข</p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          <PlusIcon className="h-4 w-4" />
          แจ้งปัญหาใหม่
        </button>
      </div>

      {notice && <Alert notice={notice} />}

      {issues.length === 0 ? (
        <EmptyState title="ยังไม่มีการแจ้งปัญหา" detail="กดปุ่ม 'แจ้งปัญหาใหม่' เพื่อเริ่มต้น" />
      ) : (
        <div className="space-y-3">
          {issues.map((i) => (
            <div key={i.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-500">
                    <AlertIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold text-slate-800">{i.title}</p>
                      <Badge tone={ISSUE_STATUS_TONES[i.status]}>{issueStatusLabel(i.status)}</Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {i.id} · {i.location} · แจ้งเมื่อ {fmtDateTime(i.createdAt)} โดย {i.reporterName}
                    </p>
                    {i.description && <p className="mt-2 text-sm text-slate-600">{i.description}</p>}
                    {i.status === IssueStatus.RESOLVED && i.resolutionNote && (
                      <p className="mt-2 inline-flex items-start gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200">
                        <CheckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        สรุปผล: {i.resolutionNote}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {i.status === IssueStatus.REPORTED && (
                    <button
                      onClick={() => {
                        try {
                          svc.startFix(i.id);
                          show('info', 'เริ่มดำเนินการแก้ไขแล้ว');
                        } catch (e) {
                          show('error', e instanceof Error ? e.message : 'เกิดข้อผิดพลาด');
                        }
                      }}
                      className="inline-flex items-center gap-1 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-amber-600"
                    >
                      <WrenchIcon className="h-3.5 w-3.5" />
                      เริ่มดำเนินการ
                    </button>
                  )}
                  {i.status !== IssueStatus.RESOLVED && (
                    <button
                      onClick={() => {
                        setResolveTarget(i);
                        setResolveNote('');
                      }}
                      className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700"
                    >
                      <CheckIcon className="h-3.5 w-3.5" />
                      เสร็จสิ้น
                    </button>
                  )}
                  <button onClick={() => openEdit(i)} title="แก้ไข" className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button onClick={() => setDeleteTarget(i)} title="ลบ" className="rounded-lg p-2 text-rose-400 transition hover:bg-rose-50 hover:text-rose-600">
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal เพิ่ม/แก้ไข */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'แก้ไขการแจ้งปัญหา' : 'แจ้งปัญหาใหม่'}
        footer={
          <>
            <button onClick={() => setModalOpen(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100">
              ยกเลิก
            </button>
            <button onClick={submit} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700">
              {editing ? 'บันทึกการแก้ไข' : 'ส่งการแจ้ง'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="หัวข้อปัญหา">
            <TextInput value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="เช่น ลู่วิ่งเครื่องที่ 3 เสีย" />
          </Field>
          <Field label="สถานที่ / โซนอุปกรณ์">
            <TextInput value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="เช่น โซนเวทเทรนนิ่ง" />
          </Field>
          <Field label="รายละเอียดเพิ่มเติม">
            <TextArea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="อธิบายอาการ/ความเสียหายที่พบ..." />
          </Field>
          {formError && <ErrorText>{formError}</ErrorText>}
        </div>
      </Modal>

      {/* Modall บันทึกผลเสร็จสิ้น */}
      <Modal
        open={resolveTarget !== null}
        onClose={() => setResolveTarget(null)}
        title="ระบุผลการซ่อมแซม"
        footer={
          <>
            <button onClick={() => setResolveTarget(null)} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100">
              ยกเลิก
            </button>
            <button onClick={doResolve} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700">
              ยืนยันเสร็จสิ้น
            </button>
          </>
        }
      >
        <Field label="สรุปผลการแก้ไข (หมายเหตุ)" hint="ถ้าเว้นว่างจะใช้ข้อความเริ่มต้น">
          <TextArea value={resolveNote} onChange={(e) => setResolveNote(e.target.value)} placeholder="เช่น เปลี่ยนยางสายพานและหล่อลื่นลูกปืนแล้ว" />
        </Field>
      </Modal>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="ลบการแจ้งปัญหา"
        message={`ต้องการลบการแจ้งปัญหานี้ ("${deleteTarget?.title}") หรือไม่?`}
        confirmText="ลบ"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            svc.deleteIssue(deleteTarget.id);
            show('success', 'ลบการแจ้งปัญหาแล้ว');
          }
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}