// components/ui/ConfirmDialog.tsx — Modal ยืนยันการลบ/การกระทำอันตราย

import { Modal } from './Modal';

export function ConfirmDialog({
  open,
  title,
  message,
  confirmText = 'ยืนยัน',
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <p className="text-sm text-slate-600">{message}</p>
      <div className="mt-5 flex justify-end gap-2">
        <button onClick={onCancel} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100">
          ยกเลิก
        </button>
        <button
          onClick={onConfirm}
          className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
}