// ============================================================
// MonthlyPackage.ts — คลาสลูกของ Package (Inheritance สายที่ 2)
//
// ★ POLYMORPHISM: override calcPrice() เพื่อให้ "นิสิต" ได้ส่วนลด 20%
//   โดยใช้ instanceof ตรวจชนิดจริงของสมาชิก ณ runtime
// ============================================================

import { Package } from './Package';
import { PackageType } from './enums';
import type { Member } from './Member';
import { StudentMember } from './StudentMember';

export class MonthlyPackage extends Package {
  private static readonly STUDENT_DISCOUNT = 0.2;

  constructor(name = 'แพ็กเกจรายเดือน', basePrice = 800, usageRight = 'เข้าใช้ได้ไม่จำกัดครั้งตลอดเดือน') {
    super(name, basePrice, usageRight, PackageType.MONTHLY);
  }

  /**
   * Polymorphism: คำนวณราคาตามชนิดจริงของ object (นิสิตได้ส่วนลด 20%)
   * ถ้าเป็น StudentMember -> คิด 80% ถ้าไม่ใช่ -> ราคาเต็ม
   */
  calcPrice(member: Member | null): number {
    if (member instanceof StudentMember) {
      return Math.round(this._basePrice * (1 - MonthlyPackage.STUDENT_DISCOUNT));
    }
    return this._basePrice;
  }

  getDurationLabel(): string {
    return 'รายเดือน (30 วัน)';
  }

  /** Polymorphism: สร้างสำเนาแพ็กเกจรายเดือน */
  clone(): MonthlyPackage {
    return new MonthlyPackage(this._name, this._basePrice, this._usageRight);
  }
}