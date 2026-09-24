// ============================================================
// Payment.ts — คลาสบันทึกการชำระเงิน
//
// ★ ENCAPSULATION: สถานะเปลี่ยนผ่าน method เท่านั้น
//   (เงินที่ชำระแล้ว/ถูกยกเลิกแล้วจะย้อนสถานะไม่ได้)
// ============================================================

import { PaymentMethod, PaymentStatus, PackageType } from './enums';

export class Payment {
  private _id: string;
  private _memberId: string;
  private _memberName: string;
  private _packageType: PackageType;
  private _packageLabel: string;
  private _amount: number;
  private _method: PaymentMethod;
  private _status: PaymentStatus;
  private _createdAt: Date;

  constructor(
    id: string,
    memberId: string,
    memberName: string,
    packageType: PackageType,
    packageLabel: string,
    amount: number,
    method: PaymentMethod,
  ) {
    this._id = id;
    this._memberId = memberId;
    this._memberName = memberName;
    this._packageType = packageType;
    this._packageLabel = packageLabel;
    this._amount = amount;
    this._method = method;
    this._status = PaymentStatus.PENDING; // เริ่มต้นรอชำระ
    this._createdAt = new Date();
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

  get packageType(): PackageType {
    return this._packageType;
  }

  get packageLabel(): string {
    return this._packageLabel;
  }

  get amount(): number {
    return this._amount;
  }

  get method(): PaymentMethod {
    return this._method;
  }

  get status(): PaymentStatus {
    return this._status;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  /** Encapsulation: มีแต่ PENDING เท่านั้นที่ยืนยันชำระได้ (ผ่าน method เดียว) */
  process(): void {
    if (this._status !== PaymentStatus.PENDING) {
      throw new Error('ไม่สามารถยืนยันการชำระนี้ได้ (สถานะไม่ใช่รอชำระ)');
    }
    this._status = PaymentStatus.PAID;
  }

  /** Encapsulation: มีแต่ PENDING เท่านั้นที่ยกเลิกได้ */
  cancel(): void {
    if (this._status !== PaymentStatus.PENDING) {
      throw new Error('ไม่สามารถยกเลิกการชำระนี้ได้');
    }
    this._status = PaymentStatus.CANCELED;
  }

  getStatusLabel(): string {
    switch (this._status) {
      case PaymentStatus.PAID:
        return 'ชำระแล้ว';
      case PaymentStatus.PENDING:
        return 'รอชำระ';
      case PaymentStatus.CANCELED:
        return 'ยกเลิก';
    }
  }

  /** ใช้โหลดข้อมูลกลับจาก localStorage */
  static fromRaw(raw: any): Payment {
    const p = new Payment(raw._id, raw._memberId, raw._memberName, raw._packageType, raw._packageLabel, raw._amount, raw._method);
    p._status = raw._status;
    p._createdAt = new Date(raw._createdAt);
    return p;
  }
}