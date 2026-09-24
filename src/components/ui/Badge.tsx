// components/ui/Badge.tsx — ป้ายสถานะหลายโทนสี

type Tone = 'emerald' | 'rose' | 'amber' | 'slate' | 'sky' | 'violet';

const TONES: Record<Tone, string> = {
  emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  rose: 'bg-rose-50 text-rose-700 ring-rose-200',
  amber: 'bg-amber-50 text-amber-700 ring-amber-200',
  slate: 'bg-slate-100 text-slate-600 ring-slate-200',
  sky: 'bg-sky-50 text-sky-700 ring-sky-200',
  violet: 'bg-violet-50 text-violet-700 ring-violet-200',
};

export function Badge({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${TONES[tone]}`}>
      {children}
    </span>
  );
}

export type { Tone };