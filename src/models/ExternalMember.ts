// ============================================================
// ExternalMember.ts — คลาสลูกของ Member (Inheritance สายที่ 1)
//
// ★ POLYMORPHISM: override เช่นเดียวกับ StudentMember
//   แต่ให้ข้อมูล "บุคคลภายนอก" แตกต่างกัน
// ============================================================

import { Member } from './Member';
import { MemberKind, MemberStatus } from './enums';
import type { Package } from './Package';
import { createPackageFromRaw } from './factories';

export class ExternalMember extends Member {
  private _idCardNo: string;

  constructor(
    id: string,
    name: string,
    phone: string,
    email: string,
    memberNo: string,
    idCardNo: string,
    pkg: Package | null = null,
    expiresAt: Date | null = null,
    status: MemberStatus = MemberStatus.ACTIVE,
  ) {
    super(id, name, phone, email, memberNo, pkg, expiresAt, status);
    this._idCardNo = idCardNo;
  }

  // ---- Encapsulation ----
  get idCardNo(): string {
    return this._idCardNo;
  }

  set idCardNo(value: string) {
    this._idCardNo = value.trim();
  }

  /** Polymorphism: บุคคลภายนอกไม่ได้ส่วนลดนิสิต */
  hasStudentDiscount(): boolean {
    return false;
  }

  // ---- Override (Polymorphism) ----
  getRoleLabel(): string {
    return 'บุคคลภายนอก';
  }

  getTypeCode(): string {
    return MemberKind.EXTERNAL;
  }

  getExtraInfo(): string {
    return `บัตรประชาชน ${this._idCardNo}`;
  }

  /** ใช้โหลดข้อมูลกลับจาก localStorage */
  static fromRaw(raw: any): ExternalMember {
    const m = new ExternalMember(raw._id, raw._name, raw._phone, raw._email, raw._memberNo, raw._idCardNo);
    m._status = raw._status;
    m._package = raw._package ? createPackageFromRaw(raw._package) : null;
    m._expiresAt = raw._expiresAt ? new Date(raw._expiresAt) : null;
    return m;
  }
}