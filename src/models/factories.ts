// ============================================================
// factories.ts — Factory Method ทั้งหมดของระบบ (แยกโมดูล)
//
// เพราะการ import คลาสลูกภายในคลาสแม่ (เช่น Member → StudentMember)
// ทำให้เกิดวงรอบ (circular dependency) ซึ่ง crash ตอน runtime
// จึงย้าย point ของการ "เลือกชนิดคลาสลูก" มาอยู่ที่นี้
//
// ★ POLYMORPHISM: ฟังก์ชันเดียวแต่สร้าง object ได้หลายชนิดตามชนิดที่ส่งเข้า
// ============================================================

import { Member } from './Member';
import { StudentMember } from './StudentMember';
import { ExternalMember } from './ExternalMember';
import { Package } from './Package';
import { DailyPackage } from './DailyPackage';
import { MonthlyPackage } from './MonthlyPackage';
import { MemberKind, PackageType } from './enums';

/** Polymorphism: สร้าง StudentMember หรือ ExternalMember ตาม MemberKind */
export function createMember(
  kind: MemberKind,
  data: { id: string; name: string; phone: string; email: string; memberNo: string; studentId?: string; faculty?: string; idCardNo?: string },
): Member {
  if (kind === MemberKind.STUDENT) {
    return new StudentMember(data.id, data.name, data.phone, data.email, data.memberNo, data.studentId ?? '', data.faculty ?? '');
  }
  return new ExternalMember(data.id, data.name, data.phone, data.email, data.memberNo, data.idCardNo ?? '');
}

/** Polymorphism: สร้าง DailyPackage หรือ MonthlyPackage ตาม PackageType */
export function createPackage(
  type: PackageType,
  name: string = type === PackageType.DAILY ? 'แพ็กเกจรายวัน' : 'แพ็กเกจรายเดือน',
  basePrice: number = type === PackageType.DAILY ? 50 : 800,
  usageRight: string = type === PackageType.DAILY ? 'เข้าใช้ได้ไม่จำกัดครั้งภายใน 1 วัน' : 'เข้าใช้ได้ไม่จำกัดครั้งตลอดเดือน',
): Package {
  return type === PackageType.DAILY
    ? new DailyPackage(name, basePrice, usageRight)
    : new MonthlyPackage(name, basePrice, usageRight);
}

/** สร้างแพ็กเกจจากข้อมูล localStorage (เลือกชนิดจาก _type ที่บันทึกไว้) */
export function createPackageFromRaw(raw: any): Package {
  return createPackage(raw._type, raw._name, raw._basePrice, raw._usageRight);
}