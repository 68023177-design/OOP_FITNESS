// ============================================================
// DailyPackage.ts — คลาสลูกของ Package (Inheritance สายที่ 2)
//
// ★ POLYMORPHISM: override calcPrice() ให้คิดราคาเต็ม ไม่มีส่วนลด
// ============================================================

import { Package } from './Package';
import { PackageType } from './enums';
import type { Member } from './Member';

export class DailyPackage extends Package {
  constructor(name = 'แพ็กเกจรายวัน', basePrice = 50, usageRight = 'เข้าใช้ได้ไม่จำกัดครั้งภายใน 1 วัน') {
    super(name, basePrice, usageRight, PackageType.DAILY);
  }

  /**
   * Polymorphism: ราคาสำหรับแพ็กเกจรายวัน = ราคาเต็มเสมอ
   * (Override method นามธรรมจากคลาสแม่)
   */
  calcPrice(_member: Member | null): number {
    return this._basePrice;
  }

  getDurationLabel(): string {
    return 'รายวัน (1 วัน)';
  }

  /** Polymorphism: สร้างสำเนาแพ็กเกจรายวัน */
  clone(): DailyPackage {
    return new DailyPackage(this._name, this._basePrice, this._usageRight);
  }
}