// ============================================================
// Member.ts — คลาสนามธรรม ตัวกลางของสายสืบทอดที่ 1
//
//   Person (abstract)
//     └─ Member (abstract) ─┬─ StudentMember
//                           └─ ExternalMember
//
// ★ การจัดองค์ประกอบ (Composition): Member "มี" Package (has-a)
//
// ★ POLYMORPHISM: factory create() ถูกย้ายไป factories.ts
//   (แยกโมดูลเพื่อไม่ให้เกิดวงรอบ import ระหว่างคลาสแม่กับคลาสลูก)
// ============================================================

import { Person } from './Person';
import { MemberStatus } from './enums';
import type { Package } from './Package';

export abstract class Member extends Person {
  protected _memberNo: string;
  protected _status: MemberStatus;
  protected _package: Package | null; // composition: สมาชิกถือแพ็กเกจที่ซื้อไว้
  protected _expiresAt: Date | null; // วันหมดอายุการใช้งาน

  constructor(
    id: string,
    name: string,
    phone: string,
    email: string,
    memberNo: string,
    pkg: Package | null = null,
    expiresAt: Date | null = null,
    status: MemberStatus = MemberStatus.ACTIVE,
  ) {
    super(id, name, phone, email);
    this._memberNo = memberNo;
    this._package = pkg;
    this._expiresAt = expiresAt;
    this._status = status;
  }

  // ---- Encapsulation ----
  get memberNo(): string {
    return this._memberNo;
  }

  get status(): MemberStatus {
    return this._status;
  }

  get package(): Package | null {
    return this._package;
  }

  get expiresAt(): Date | null {
    return this._expiresAt;
  }

  get isActive(): boolean {
    return this._status === MemberStatus.ACTIVE;
  }

  get isSuspended(): boolean {
    return this._status === MemberStatus.SUSPENDED;
  }

  /** สถานะเข้าถึง service: ต้อง active + ยังไม่หมดอายุ */
  hasAccess(now: Date = new Date()): boolean {
    return this._status === MemberStatus.ACTIVE && this._package !== null && this._expiresAt !== null && this._expiresAt > now;
  }

  /** จำนวนวันคงเหลือของแพ็กเกจปัจจุบัน */
  getRemainingDays(now: Date = new Date()): number {
    if (!this._expiresAt) return 0;
    const diff = this._expiresAt.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / 86_400_000));
  }

  /**
   * Encapsulation: สถานะเปลี่ยนผ่าน method เท่านั้น (ห้ามแก้ field ตรง ๆ)
   */
  suspend(): void {
    this._status = MemberStatus.SUSPENDED;
  }

  activate(): void {
    this._status = MemberStatus.ACTIVE;
  }

  /**
   * ซื้อ/ต่ออายุแพ็กเกจ: ขยายวันหมดอายุจากเดิม (ถ้ายังไม่หมด) + ระยะเวลาของแพ็กเกจ
   */
  assignPackage(pkg: Package): void {
    const now = new Date();
    const from = this._expiresAt && this._expiresAt > now ? this._expiresAt : now;
    const expiry = new Date(from);
    expiry.setDate(expiry.getDate() + this.durationDaysOf(pkg));
    this._expiresAt = expiry;
    this._package = pkg;
  }

  private durationDaysOf(pkg: Package): number {
    return pkg.type === 'DAILY' ? 1 : 30;
  }

  /** Abstraction: ข้อมูลเฉพาะของสมาชิกแต่ละชนิด (นิสิต=คณะ, ภายนอก=บัตรประชาชน) */
  abstract getExtraInfo(): string;
}