// ============================================================
// Package.ts — คลาสนามธรรมสำหรับแพ็กเกจบริการ
//
// ★ นี้คือ "หัว" ของสายสืบทอดที่ 2
//   Package (abstract) ─┬─ DailyPackage
//                       └─ MonthlyPackage
//
// ★ POLYMORPHISM: ราคาที่คำนวณได้ (calcPrice) ต่างกันตามคลาสลูก
//   (คลาสลูกถูกสร้างที่ factories.ts — แยกโมดูลเพื่อไม่ให้เกิดวงรอบ import)
// ============================================================

import { PackageType } from './enums';
import type { Member } from './Member';

export abstract class Package {
  protected _name: string;
  protected _basePrice: number;
  protected _usageRight: string;
  protected _type: PackageType;

  constructor(name: string, basePrice: number, usageRight: string, type: PackageType) {
    this._name = name;
    this._basePrice = basePrice;
    this._usageRight = usageRight;
    this._type = type;
  }

  // ---- Encapsulation ----
  get name(): string {
    return this._name;
  }

  set name(value: string) {
    if (value && value.trim()) this._name = value.trim();
  }

  get basePrice(): number {
    return this._basePrice;
  }

  set basePrice(value: number) {
    if (value >= 0) this._basePrice = value;
  }

  /** สิทธิ์การใช้งานที่สมาชิกจะได้รับจากแพ็กเกจนี้ */
  get usageRight(): string {
    return this._usageRight;
  }

  set usageRight(value: string) {
    this._usageRight = value.trim();
  }

  get type(): PackageType {
    return this._type;
  }

  /** Abstraction: ราคาที่ต้องชำระ คำนวณต่างกันตามชนิดแพ็กเกจและชนิดสมาชิก */
  abstract calcPrice(member: Member | null): number;

  /** Abstraction: ข้อความแสดงระยะเวลา เช่น 'รายวัน (1 วัน)' */
  abstract getDurationLabel(): string;

  /** Abstraction: สร้างสำเนาแพ็กเกจใหม่จากข้อมูลเดิม
   *  ใช้ตอนซื้อ/ต่ออายุ เพื่อไม่ให้การแก้ไขราคาครั้งหลังส่งผลย้อนหลัง
   *  (Polymorphism — คลาสลูกสร้างสำเนาที่เป็นชนิดเดียวกัน) */
  abstract clone(): Package;
}