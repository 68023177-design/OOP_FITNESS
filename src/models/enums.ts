// ============================================================
// enums.ts — ค่าคงที่ชนิดข้อมูลต่าง ๆ ในระบบ
// ============================================================

/** ชนิดของสมาชิก (ใช้เป็น discriminator สำหรับ Polymorphism) */
export enum MemberKind {
  STUDENT = 'STUDENT',
  EXTERNAL = 'EXTERNAL',
}

/** ชนิดของแพ็กเกจ */
export enum PackageType {
  DAILY = 'DAILY',
  MONTHLY = 'MONTHLY',
}

/** สถานะการเป็นสมาชิก */
export enum MemberStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
}

/** วิธีชำระเงิน */
export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  TRANSFER = 'TRANSFER',
  QR = 'QR',
}

/** สถานะการชำระเงิน */
export enum PaymentStatus {
  PAID = 'PAID',
  PENDING = 'PENDING',
  CANCELED = 'CANCELED',
}

/** สถานะการใช้บริการเข้า-ออก */
export enum VisitStatus {
  ACTIVE = 'ACTIVE',
  DONE = 'DONE',
}

/** สถานะการแจ้งปัญหา */
export enum IssueStatus {
  REPORTED = 'REPORTED',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
}

/** วันในสัปดาห์ สำหรับตารางเวลาว่างของเทรนเนอร์ */
export const DAYS = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัส', 'ศุกร์', 'เสาร์', 'อาทิตย์'] as const;

/** ช่วงเวลา สำหรับตารางเวลาว่างของเทรนเนอร์ */
export const SHIFTS = ['เช้า', 'บ่าย', 'เย็น'] as const;