// ============================================================
// Trainer.ts — คลาสลูกของ Person (Inheritance สายที่ 1)
// เป็น "พนักงาน" ไม่ใช่สมาชิก
//
// มีคุณสมบัติพิเศษ: ความเชี่ยวชาญ, ค่าโค้ชต่อชั่วโมง, ตารางเวลาว่าง
// ============================================================

import { Person } from './Person';
import { DAYS, SHIFTS } from './enums';

export type Shift = (typeof SHIFTS)[number];
export type DayName = (typeof DAYS)[number];

export class Trainer extends Person {
  private _specialties: string[];
  private _hourlyRate: number;
  /** ตารางเวลาว่าง เช่น ['จันทร์:เช้า', 'ศุกร์:บ่าย', ...] */
  private _schedule: string[];

  constructor(
    id: string,
    name: string,
    phone: string,
    email: string,
    specialties: string[] = [],
    hourlyRate = 0,
    schedule: string[] = [],
  ) {
    super(id, name, phone, email);
    this._specialties = specialties;
    this._hourlyRate = hourlyRate;
    this._schedule = schedule;
  }

  // ---- Encapsulation ----
  get specialties(): string[] {
    return [...this._specialties];
  }

  set specialties(values: string[]) {
    this._specialties = values.filter(Boolean).map((v) => v.trim());
  }

  get hourlyRate(): number {
    return this._hourlyRate;
  }

  set hourlyRate(value: number) {
    if (value >= 0) this._hourlyRate = value;
  }

  get schedule(): string[] {
    return [...this._schedule];
  }

  set schedule(values: string[]) {
    this._schedule = [...new Set(values.filter(Boolean))];
  }

  /** ตรวจว่าว่างในช่วงที่กำหนดไหม (วัน+ช่วง) */
  isAvailable(day: DayName, shift: Shift): boolean {
    return this._schedule.includes(`${day}:${shift}`);
  }

  toggleAvailability(day: DayName, shift: Shift, available: boolean): void {
    const key = `${day}:${shift}`;
    if (available) {
      if (!this._schedule.includes(key)) this._schedule.push(key);
    } else {
      this._schedule = this._schedule.filter((s) => s !== key);
    }
  }

  /** ข้อความสั้นสรุปตารางเวลาว่าง เช่น 'จ.-ศ. เช้า/บ่าย' */
  getScheduleSummary(): string {
    if (this._schedule.length === 0) return 'ยังไม่มีข้อมูล';
    const byDay = new Map<string, string[]>();
    for (const s of this._schedule) {
      const [day, shift] = s.split(':');
      if (!byDay.has(day)) byDay.set(day, []);
      byDay.get(day)!.push(shift);
    }
    return [...byDay.entries()]
      .map(([day, shifts]) => `${day} (${shifts.join(', ')})`)
      .join(' · ');
  }

  // ---- Override (Polymorphism ตาม Person) ----
  getRoleLabel(): string {
    return 'เทรนเนอร์';
  }

  getTypeCode(): string {
    return 'TRAINER';
  }

  /** ใช้โหลดข้อมูลกลับจาก localStorage */
  static fromRaw(raw: any): Trainer {
    return new Trainer(raw._id, raw._name, raw._phone, raw._email, raw._specialties ?? [], raw._hourlyRate ?? 0, raw._schedule ?? []);
  }
}