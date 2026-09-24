// components/ui/StatCard.tsx — การ์ดแสดงสถิติบน Dashboard

import type { ReactNode } from 'react';

const ACCENTS = {
  emerald: 'from-emerald-500 to-teal-500',
  sky: 'from-sky-500 to-cyan-500',
  violet: 'from-violet-500 to-purple-500',
  amber: 'from-amber-500 to-orange-500',
} as const;

export function StatCard({
  title,
  value,
  sub,
  icon,
  accent,
}: {
  title: string;
  value: string;
  sub?: string;
  icon: ReactNode;
  accent: keyof typeof ACCENTS;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white ${ACCENTS[accent]}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm text-slate-500">{title}</p>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        {sub && <p className="truncate text-xs text-slate-400">{sub}</p>}
      </div>
    </div>
  );
}