// utils/format.ts — การจัดรูปแบบวันที่/เวล/เงินเป็นภาษาไทย

export function money(n: number): string {
  return `฿${n.toLocaleString('th-TH')}`;
}

export function fmtDate(d: Date | null | undefined): string {
  if (!d) return '-';
  return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function fmtTime(d: Date | null | undefined): string {
  if (!d) return '-';
  return d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
}

export function fmtDateTime(d: Date | null | undefined): string {
  if (!d) return '-';
  const date = d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
  const time = d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
  return `${date} ${time}`;
}

export function todayHeading(): string {
  return new Date().toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}