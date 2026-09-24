// components/ui/Modal.tsx — กล่อง Modal แบบง่ายสำหรับหน้าต่างฟอร์ม/ยืนยัน

import type { ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}

export function Modal({ open, onClose, title, children, footer, wide }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50" onClick={onClose} />
      <div
        className={`relative w-full rounded-2xl bg-white shadow-2xl ${wide ? 'max-w-2xl' : 'max-w-md'} max-h-[90vh] overflow-y-auto`}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          <button onClick={onClose} className="text-2xl leading-none text-slate-400 transition hover:text-slate-600">
            ×
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2 rounded-b-2xl border-t border-slate-100 bg-slate-50 px-6 py-4">{footer}</div>
        )}
      </div>
    </div>
  );
}