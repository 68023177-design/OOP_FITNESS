// ============================================================
// StudentMember.ts — คลาสลูกของ Member (Inheritance สายที่ 1)
//
// ★ POLYMORPHISM: override getRoleLabel()/getTypeCode()/getExtraInfo()
//   ให้ผลลัพธ์เฉพาะของ "นิสิต" ต่างจาก ExternalMember
// ============================================================

import { Member } from './Member';
import { MemberKind, MemberStatus } from './enums';
import type { Package } from './Package';
import { createPackageFromRaw } from './factories';

export class StudentMember extends Member {
  private _studentId: string;
  private _faculty: string;

  constructor(
    id: string,
    name: string,
    phone: string,
    email: string,
    memberNo: string,
    studentId: string,
    faculty: string,
    pkg: Package | null = null,
    expiresAt: Date | null = null,
    status: MemberStatus = MemberStatus.ACTIVE,
  ) {
    super(id, name, phone, email, memberNo, pkg, expiresAt, status);
    this._studentId = studentId;
    this._faculty = faculty;
  }

  // ---- Encapsulation ----
  get studentId(): string {
    return this._studentId;
  }

  set studentId(value: string) {
    this._studentId = value.trim();
  }

  get faculty(): string {
    return this._faculty;
  }

  set faculty(value: string) {
    this._faculty = value.trim();
  }

  /** Polymorphism: สมาชิกนิสิตเรียกได้ส่วนลดแพ็กเกจรายเดือน */
  hasStudentDiscount(): boolean {
    return true;
  }

  // ---- Override (Polymorphism) ----
  getRoleLabel(): string {
    return 'นิสิต';
  }

  getTypeCode(): string {
    return MemberKind.STUDENT;
  }

  getExtraInfo(): string {
    return `รหัสนิสิต ${this._studentId} · คณะ${this._faculty}`;
  }

  /** ใช้โหลดข้อมูลกลับจาก localStorage */
  static fromRaw(raw: any): StudentMember {
    const m = new StudentMember(raw._id, raw._name, raw._phone, raw._email, raw._memberNo, raw._studentId, raw._faculty);
    m._status = raw._status;
    m._package = raw._package ? createPackageFromRaw(raw._package) : null;
    m._expiresAt = raw._expiresAt ? new Date(raw._expiresAt) : null;
    return m;
  }
}