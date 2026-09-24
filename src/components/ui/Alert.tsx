// components/ui/Alert.tsx — แสดงข้อความแจ้งเตือน + hook ตั้งเวลาให้หายเอง

import { useEffect, useRef, useState } from 'react';

export type Notice = { type: 'success' | 'error' | 'info'; text: string };

const STYLES: Record<Notice['type'], string> = {
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  error: 'bg-rose-50 text-rose-700 ring-rose-200',
  info: 'bg-sky-50 text-sky-700 ring-sky-200',
};

export function Alert({ notice, onClose }: { notice: Notice; onClose?: () => void }) {
  return (
    <div className={`flex items-center justify-between rounded-lg px-4 py-3 text-sm font-medium ring-1 ring-inset ${STYLES[notice.type]}`}>
      <span>{notice.text}</span>
      {onClose && (
        <button onClick={onClose} className="ml-3 opacity-60 hover:opacity-100">
          ×
        </button>
      )}
    </div>
  );
}

export function useNotice(): [Notice | null, (type: Notice['type'], text: string) => void] {
  const [notice, setNotice] = useState<Notice | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = (type: Notice['type'], text: string) => {
    setNotice({ type, text });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setNotice(null), 4500);
  };

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  return [notice, show];
}