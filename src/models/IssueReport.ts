// ============================================================
// IssueReport.ts — คลาสการแจ้งปัญหา/แจ้งซ่อมอุปกรณ์ชำรุด
//
// ★ ENCAPSULATION: สถานะเดินหน้าได้ตามลำดับผ่าน method เท่านั้น
//   workflow: รายงาน (REPORTED) → ดำเนินการ (IN_PROGRESS) → เสร็จสิ้น (RESOLVED)
// ============================================================

import { IssueStatus } from './enums';

export class IssueReport {
  private _id: string;
  private _title: string;
  private _description: string;
  private _location: string;
  private _reporterName: string;
  private _createdAt: Date;
  private _status: IssueStatus;
  private _resolutionNote: string;

  constructor(id: string, title: string, description: string, location: string, reporterName: string) {
    this._id = id;
    this._title = title;
    this._description = description;
    this._location = location;
    this._reporterName = reporterName;
    this._createdAt = new Date();
    this._status = IssueStatus.REPORTED;
    this._resolutionNote = '';
  }

  // ---- Encapsulation ----
  get id(): string {
    return this._id;
  }

  get title(): string {
    return this._title;
  }

  set title(value: string) {
    if (value && value.trim()) this._title = value.trim();
  }

  get description(): string {
    return this._description;
  }

  set description(value: string) {
    this._description = value.trim();
  }

  get location(): string {
    return this._location;
  }

  set location(value: string) {
    this._location = value.trim();
  }

  get reporterName(): string {
    return this._reporterName;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get status(): IssueStatus {
    return this._status;
  }

  get resolutionNote(): string {
    return this._resolutionNote;
  }

  /** Encapsulation: เริ่มดำเนินการได้จาก REPORTED เท่านั้น */
  startFix(): void {
    if (this._status !== IssueStatus.REPORTED) {
      throw new Error('แจ้งนี้ไม่ได้อยู่ในสถานะรอดำเนินการ');
    }
    this._status = IssueStatus.IN_PROGRESS;
  }

  /** Encapsulation: เสร็จสิ้นได้จาก REPORTED หรือ IN_PROGRESS เท่านั้น */
  resolve(note: string): void {
    if (this._status === IssueStatus.RESOLVED) {
      throw new Error('แจ้งนี้เสร็จสิ้นแล้ว');
    }
    this._status = IssueStatus.RESOLVED;
    this._resolutionNote = note.trim();
  }

  getStatusLabel(): string {
    switch (this._status) {
      case IssueStatus.REPORTED:
        return 'แจ้งใหม่';
      case IssueStatus.IN_PROGRESS:
        return 'กำลังดำเนินการ';
      case IssueStatus.RESOLVED:
        return 'เสร็จสิ้น';
    }
  }

  get isResolved(): boolean {
    return this._status === IssueStatus.RESOLVED;
  }

  /** ใช้โหลดข้อมูลกลับจาก localStorage */
  static fromRaw(raw: any): IssueReport {
    const r = new IssueReport(raw._id, raw._title, raw._description, raw._location, raw._reporterName);
    r._createdAt = new Date(raw._createdAt);
    r._status = raw._status;
    r._resolutionNote = raw._resolutionNote ?? '';
    return r;
  }
}