// utils/labels.ts — แผนที่ข้อความภาษาไทยสำหรับ enum ต่าง ๆ

import { IssueStatus, MemberStatus, PackageType, PaymentMethod, PaymentStatus } from '../models/enums';
import type { Tone } from '../components/ui/Badge';

export const paymentMethodLabel = (m: PaymentMethod): string => {
  switch (m) {
    case PaymentMethod.CASH:
      return 'เงินสด';
    case PaymentMethod.CARD:
      return 'บัตรเครดิต/เดบิต';
    case PaymentMethod.TRANSFER:
      return 'โอนเงิน';
    case PaymentMethod.QR:
      return 'QR Payment';
  }
};

export const paymentStatusLabel = (s: PaymentStatus): string => {
  switch (s) {
    case PaymentStatus.PAID:
      return 'ชำระแล้ว';
    case PaymentStatus.PENDING:
      return 'รอชำระ';
    case PaymentStatus.CANCELED:
      return 'ยกเลิก';
  }
};

export const memberStatusLabel = (s: MemberStatus): string => {
  return s === MemberStatus.ACTIVE ? 'ใช้งาน' : 'ระงับ';
};

export const packageTypeLabel = (t: PackageType): string => {
  return t === PackageType.DAILY ? 'รายวัน' : 'รายเดือน';
};

export const issueStatusLabel = (s: IssueStatus): string => {
  // เรียกผ่าน IssueReport.getStatusLabel() เป็นหลัก; แผนที่นี้ไว้ใช้กับ Badge
  switch (s) {
    case IssueStatus.REPORTED:
      return 'แจ้งใหม่';
    case IssueStatus.IN_PROGRESS:
      return 'กำลังดำเนินการ';
    case IssueStatus.RESOLVED:
      return 'เสร็จสิ้น';
  }
};

export const MEMBER_STATUS_TONES: Record<MemberStatus, Tone> = {
  [MemberStatus.ACTIVE]: 'emerald',
  [MemberStatus.SUSPENDED]: 'rose',
};

export const PAYMENT_STATUS_TONES: Record<PaymentStatus, Tone> = {
  [PaymentStatus.PAID]: 'emerald',
  [PaymentStatus.PENDING]: 'amber',
  [PaymentStatus.CANCELED]: 'slate',
};

export const ISSUE_STATUS_TONES: Record<IssueStatus, Tone> = {
  [IssueStatus.REPORTED]: 'rose',
  [IssueStatus.IN_PROGRESS]: 'amber',
  [IssueStatus.RESOLVED]: 'emerald',
};