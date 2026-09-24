// ============================================================
// Visit.ts — คลาสบันทึกการเข้าใช้บริการ (Check-in / Check-out)
//
// ★ ENCAPSULATION: checkOut() ทำได้ครั้งเดียว ผ่าน method เท่านั้น
//   และคำนวณระยะเวลาการใช้งานให้อัตโนมัติ
// ============================================================

export class Visit {
  private _id: string;
  private _memberId: string;
  private _memberName: string;
  private _packageLabel: string;
  private _checkInAt: Date;
  private _checkOutAt: Date | null;
  private _durationMinutes: number;

  constructor(id: string, memberId: string, memberName: string, packageLabel: string, checkInAt: Date = new Date()) {
    this._id = id;
    this._memberId = memberId;
    this._memberName = memberName;
    this._packageLabel = packageLabel;
    this._checkInAt = checkInAt;
    this._checkOutAt = null;
    this._durationMinutes = 0;
  }

  // ---- Encapsulation ----
  get id(): string {
    return this._id;
  }

  get memberId(): string {
    return this._memberId;
  }

  get memberName(): string {
    return this._memberName;
  }

  get packageLabel(): string {
    return this._packageLabel;
  }

  get checkInAt(): Date {
    return this._checkInAt;
  }

  get checkOutAt(): Date | null {
    return this._checkOutAt;
  }

  get durationMinutes(): number {
    return this._durationMinutes;
  }

  /** กำลังใช้บริการอยู่หรือยัง (ยังไม่ check-out) */
  isActive(): boolean {
    return this._checkOutAt === null;
  }

  /**
   * Encapsulation: check-out ทำได้ครั้งเดียว ผ่าน method นี้เท่านั้น
   * คืนค่าระยะเวลาการใช้งานเป็นนาที และเก็บลง property ให้อัตโนมัติ
   */
  checkOut(at: Date = new Date()): number {
    if (this._checkOutAt !== null) {
      throw new Error('ได้ทำการ check-out ไปแล้ว');
    }
    if (at < this._checkInAt) {
      throw new Error('เวลาออกจากระบบต้องไม่ก่อนเวลาเข้า');
    }
    this._checkOutAt = at;
    this._durationMinutes = Math.max(1, Math.round((at.getTime() - this._checkInAt.getTime()) / 60_000));
    return this._durationMinutes;
  }

  /** แสดงระยะเวลา เช่น '1 ชม. 30 นาที' */
  getDurationLabel(): string {
    if (!this._checkOutAt) return '-';
    const h = Math.floor(this._durationMinutes / 60);
    const m = this._durationMinutes % 60;
    if (h === 0) return `${m} นาที`;
    return `${h} ชม. ${m} นาที`;
  }

  /** ใช้โหลดข้อมูลกลับจาก localStorage */
  static fromRaw(raw: any): Visit {
    const v = new Visit(raw._id, raw._memberId, raw._memberName, raw._packageLabel, new Date(raw._checkInAt));
    v._checkOutAt = raw._checkOutAt ? new Date(raw._checkOutAt) : null;
    v._durationMinutes = raw._durationMinutes ?? 0;
    return v;
  }
}