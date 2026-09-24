// components/ui/EmptyState.tsx — แสดงเมื่อยังไม่มีข้อมูล

export function EmptyState({ title, detail }: { title: string; detail?: string }) {
  return (
    <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/60 px-6 py-10 text-center">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      {detail && <p className="mt-1 text-xs text-slate-400">{detail}</p>}
    </div>
  );
}