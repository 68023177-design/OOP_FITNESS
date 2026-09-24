// ============================================================
// FitnessCenterService.ts — คลาสหลักควบคุมระบบ (Singleton + Facade)
//
// ★ ผู้จัดการข้อมูลทั้งหมด: สมาชิก, แพ็กเกจ, การชำระ, เข้า-ออก,
//   เทรนเนอร์ และแจ้งปัญหา
// ★ ทำงานร่วมกับ Repository (localStorage) เพื่อให้ข้อมูลอยู่ครบ
// ★ สนับสนุนหลักการ OOP ครบ 4 ข้อ:
//   - Abstraction : UI เรียกใช้ผ่านเมธอดเหล่านี้โดยไม่ต้องแตะข้อมูลตรง ๆ
//   - Encapsulation : ข้อมูลถูกเก็บ private และเปลี่ยนผ่านเมธอดเท่านั้น
//   - Inheritance  : ของคลาสลูก (Member, Package, ...)
//   - Polymorphism : purchasePackage() ใช้ calcPrice() ของแพ็กเกจจริง
// ============================================================

import { Repository } from './Repository';
import { Member } from '../models/Member';
import { MemberKind, PackageType, PaymentMethod, PaymentStatus } from '../models/enums';
import { Package } from '../models/Package';
import { StudentMember } from '../models/StudentMember';
import { ExternalMember } from '../models/ExternalMember';
import { Payment } from '../models/Payment';
import { Visit } from '../models/Visit';
import { Trainer } from '../models/Trainer';
import { IssueReport } from '../models/IssueReport';
import { createMember, createPackage, createPackageFromRaw } from '../models/factories';

export interface MemberInput {
  kind: MemberKind;
  name: string;
  phone: string;
  email: string;
  studentId?: string;
  faculty?: string;
  idCardNo?: string;
}

export interface TrainerInput {
  name: string;
  phone: string;
  email: string;
  specialties: string[];
  hourlyRate: number;
  schedule: string[];
}

export interface IssueInput {
  title: string;
  description: string;
  location: string;
  reporterName: string;
}

type Counters = {
  member: number;
  trainer: number;
  payment: number;
  visit: number;
  issue: number;
};

export class FitnessCenterService {
  private static _instance: FitnessCenterService;

  // ---- Encapsulation: ข้อมูลทั้งหมดถูกซ่อนไว้เป็น private ----
  private _members: Member[] = [];
  private _packages: Package[] = [];
  private _payments: Payment[] = [];
  private _visits: Visit[] = [];
  private _trainers: Trainer[] = [];
  private _issues: IssueReport[] = [];
  private _counters: Counters = { member: 0, trainer: 0, payment: 0, visit: 0, issue: 0 };
  private _listeners = new Set<() => void>();
  private _version = 0;

  // Generic Repository — class เดียวใช้กับทุกชนิดข้อมูล
  private readonly membersRepo = new Repository<Member>('ess_members', (raw) =>
    typeof raw._studentId === 'string' ? StudentMember.fromRaw(raw) : ExternalMember.fromRaw(raw),
  );
  private readonly packagesRepo = new Repository<Package>('ess_packages', (raw) => createPackageFromRaw(raw));
  private readonly paymentsRepo = new Repository<Payment>('ess_payments', (raw) => Payment.fromRaw(raw));
  private readonly visitsRepo = new Repository<Visit>('ess_visits', (raw) => Visit.fromRaw(raw));
  private readonly trainersRepo = new Repository<Trainer>('ess_trainers', (raw) => Trainer.fromRaw(raw));
  private readonly issuesRepo = new Repository<IssueReport>('ess_issues', (raw) => IssueReport.fromRaw(raw));

  /** Singleton: ระบบมี Service กลางเพียงตัวเดียว */
  static getInstance(): FitnessCenterService {
    if (!FitnessCenterService._instance) {
      FitnessCenterService._instance = new FitnessCenterService();
    }
    return FitnessCenterService._instance;
  }

  private constructor() {
    this._members = this.membersRepo.load();
    this._packages = this.packagesRepo.load();
    this._payments = this.paymentsRepo.load();
    this._visits = this.visitsRepo.load();
    this._trainers = this.trainersRepo.load();
    this._issues = this.issuesRepo.load();
    this.loadCounters();
    if (this._packages.length === 0) {
      this._packages = [createPackage(PackageType.DAILY), createPackage(PackageType.MONTHLY)];
      this.persist();
    }
  }

  // ---------- Event (ให้ React re-render) ----------
  subscribe(listener: () => void): () => void {
    this._listeners.add(listener);
    return () => this._listeners.delete(listener);
  }

  /** จำนวนครั้งที่ข้อมูลเปลี่ยน (ใช้กับ useSyncExternalStore ให้ UI re-render) */
  get version(): number {
    return this._version;
  }

  private notify(): void {
    this._version += 1;
    this._listeners.forEach((fn) => fn());
  }

  // ---------- Persist ----------
  private persist(): void {
    this.membersRepo.save(this._members);
    this.packagesRepo.save(this._packages);
    this.paymentsRepo.save(this._payments);
    this.visitsRepo.save(this._visits);
    this.trainersRepo.save(this._trainers);
    this.issuesRepo.save(this._issues);
    localStorage.setItem('ess_counters', JSON.stringify(this._counters));
    this.notify();
  }

  private loadCounters(): void {
    try {
      const raw = localStorage.getItem('ess_counters');
      if (raw) this._counters = { ...this._counters, ...JSON.parse(raw) };
    } catch {
      /* ค่าเริ่มต้น */
    }
  }

  private nextNo(prefix: string, key: keyof Counters): string {
    this._counters[key] += 1;
    return `${prefix}-${String(this._counters[key]).padStart(3, '0')}`;
  }

  // ============================================================
  // ข้อมูลเข้าถึง (getters)
  // ============================================================
  get members(): Member[] {
    return this._members;
  }

  get packages(): Package[] {
    return this._packages;
  }

  get payments(): Payment[] {
    return this._payments;
  }

  get visits(): Visit[] {
    return this._visits;
  }

  get trainers(): Trainer[] {
    return this._trainers;
  }

  get issues(): IssueReport[] {
    return this._issues;
  }

  get activeVisits(): Visit[] {
    return this._visits.filter((v) => v.isActive());
  }

  get totalRevenue(): number {
    return this._payments.filter((p) => p.status === PaymentStatus.PAID).reduce((sum, p) => sum + p.amount, 0);
  }

  get openIssueCount(): number {
    return this._issues.filter((i) => !i.isResolved).length;
  }

  getPackageByType(type: PackageType): Package | undefined {
    return this._packages.find((p) => p.type === type);
  }

  getMemberById(id: string): Member | undefined {
    return this._members.find((m) => m.id === id);
  }

  getVisitById(id: string): Visit | undefined {
    return this._visits.find((v) => v.id === id);
  }

  getActiveVisitByMember(memberId: string): Visit | undefined {
    return this._visits.find((v) => v.memberId === memberId && v.isActive());
  }

  // ============================================================
  // สมาชิก — CRUD
  // ============================================================
  addMember(data: MemberInput): Member {
    // Polymorphism: factory สร้าง StudentMember / ExternalMember ให้อัตโนมัติ
    const member = createMember(data.kind, {
      id: this.nextNo('mem', 'member'),
      name: data.name,
      phone: data.phone,
      email: data.email,
      memberNo: this.nextNo('MBR', 'member'),
      studentId: data.studentId,
      faculty: data.faculty,
      idCardNo: data.idCardNo,
    });
    this._members.push(member);
    this.persist();
    return member;
  }

  updateMember(id: string, data: Partial<MemberInput>): void {
    const m = this.getMemberById(id);
    if (!m) throw new Error('ไม่พบสมาชิกที่ต้องการแก้ไข');
    m.name = data.name ?? m.name;
    m.phone = data.phone ?? m.phone;
    m.email = data.email ?? m.email;
    if (m instanceof StudentMember) {
      m.studentId = data.studentId ?? m.studentId;
      m.faculty = data.faculty ?? m.faculty;
    } else if (m instanceof ExternalMember) {
      m.idCardNo = data.idCardNo ?? m.idCardNo;
    }
    this.persist();
  }

  deleteMember(id: string): void {
    this._members = this._members.filter((m) => m.id !== id);
    this.persist();
  }

  suspendMember(id: string): void {
    const m = this.getMemberById(id);
    if (!m) throw new Error('ไม่พบสมาชิก');
    m.suspend();
    this.persist();
  }

  activateMember(id: string): void {
    const m = this.getMemberById(id);
    if (!m) throw new Error('ไม่พบสมาชิก');
    m.activate();
    this.persist();
  }

  // ============================================================
  // แพ็กเกจ
  // ============================================================
  updatePackage(type: PackageType, data: { name: string; basePrice: number; usageRight: string }): void {
    const pkg = this.getPackageByType(type);
    if (!pkg) throw new Error('ไม่พบแพ็กเกจ');
    pkg.name = data.name;
    pkg.basePrice = data.basePrice;
    pkg.usageRight = data.usageRight;
    this.persist();
  }

  // ============================================================
  // การชำระเงิน + การซื้อแพ็กเกจ
  // ============================================================
  purchasePackage(memberId: string, type: PackageType, method: PaymentMethod, status: PaymentStatus): Payment {
    const member = this.getMemberById(memberId);
    if (!member) throw new Error('ไม่พบสมาชิก');
    const template = this.getPackageByType(type);
    if (!template) throw new Error('ไม่พบแพ็กเกจ');

    // Polymorphism: ราคาคำนวณจากชนิดจริงของแพ็กเกจและชนิดสมาชิก
    // (DailyPackage คิดเต็ม / MonthlyPackage ลดให้ StudentMember)
    const amount = template.calcPrice(member);

    const payment = new Payment(
      this.nextNo('PAY', 'payment'),
      member.id,
      member.name,
      type,
      template.name,
      amount,
      method,
    );

    if (status === PaymentStatus.PAID) {
      payment.process();
      member.assignPackage(template.clone());
    }

    this._payments.push(payment);
    this.persist();
    return payment;
  }

  /** ยืนยันการชำระเงินที่ค้างชำระ -> สมาชิกจึงจะได้สิทธิ์เข้าศูนย์ */
  confirmPayment(paymentId: string): void {
    const payment = this._payments.find((p) => p.id === paymentId);
    if (!payment) throw new Error('ไม่พบรายการชำระเงิน');
    payment.process();
    const member = this.getMemberById(payment.memberId);
    if (member) {
      const template = this.getPackageByType(payment.packageType);
      if (template) member.assignPackage(template.clone());
    }
    this.persist();
  }

  cancelPayment(paymentId: string): void {
    const payment = this._payments.find((p) => p.id === paymentId);
    if (!payment) throw new Error('ไม่พบรายการชำระเงิน');
    payment.cancel();
    this.persist();
  }

  // ============================================================
  // การเข้าใช้บริการ (Check-in / Check-out)
  // ============================================================
  checkIn(memberId: string): Visit {
    const member = this.getMemberById(memberId);
    if (!member) throw new Error('ไม่พบสมาชิก');
    if (member.isSuspended) throw new Error('สมาชิกถูกระงับการใช้งาน');
    if (!member.hasAccess()) throw new Error('สมาชิกไม่มีสิทธิ์เข้าใช้ (แพ็กเกจหมดอายุ)');
    if (this.getActiveVisitByMember(memberId)) throw new Error('สมาชิกกำลังใช้บริการอยู่แล้ว');

    // Polymorphism: ชื่อแพ็กเกจที่แสดงเป็นของ object จริง (+ ใช้ instanceof ตรวจชนิด)
    const pkgLabel = member.package?.name ?? '-';
    const visit = new Visit(this.nextNo('VIS', 'visit'), member.id, member.name, pkgLabel);
    this._visits.push(visit);
    this.persist();
    return visit;
  }

  checkOut(visitId: string): number {
    const visit = this.getVisitById(visitId);
    if (!visit) throw new Error('ไม่พบบันทึกการเข้าใช้');
    const minutes = visit.checkOut();
    this.persist();
    return minutes;
  }

  /** สำหรับนำเข้าข้อมูลย้อนหลัง (ใช้กับปุ่มเติมข้อมูลตัวอย่าง) */
  seedVisit(memberId: string, checkInAt: Date, checkOutAt: Date | null): void {
    const member = this.getMemberById(memberId);
    if (!member) throw new Error('ไม่พบสมาชิก');
    const visit = new Visit(this.nextNo('VIS', 'visit'), member.id, member.name, member.package?.name ?? '-', checkInAt);
    if (checkOutAt) visit.checkOut(checkOutAt);
    this._visits.push(visit);
    this.persist();
  }

  // ============================================================
  // เทรนเนอร์ — CRUD
  // ============================================================
  addTrainer(data: TrainerInput): Trainer {
    const trainer = new Trainer(
      this.nextNo('TR', 'trainer'),
      data.name,
      data.phone,
      data.email,
      data.specialties,
      data.hourlyRate,
      data.schedule,
    );
    this._trainers.push(trainer);
    this.persist();
    return trainer;
  }

  updateTrainer(id: string, data: TrainerInput): void {
    const t = this._trainers.find((x) => x.id === id);
    if (!t) throw new Error('ไม่พบเทรนเนอร์');
    t.name = data.name;
    t.phone = data.phone;
    t.email = data.email;
    t.specialties = data.specialties;
    t.hourlyRate = data.hourlyRate;
    t.schedule = data.schedule;
    this.persist();
  }

  deleteTrainer(id: string): void {
    this._trainers = this._trainers.filter((t) => t.id !== id);
    this.persist();
  }

  // ============================================================
  // การแจ้งปัญหา — CRUD + workflow สถานะ
  // ============================================================
  addIssue(data: IssueInput): IssueReport {
    const issue = new IssueReport(this.nextNo('ISS', 'issue'), data.title, data.description, data.location, data.reporterName);
    this._issues.push(issue);
    this.persist();
    return issue;
  }

  updateIssue(id: string, data: Partial<IssueInput>): void {
    const issue = this._issues.find((x) => x.id === id);
    if (!issue) throw new Error('ไม่พบการแจ้งปัญหา');
    if (data.title !== undefined) issue.title = data.title;
    if (data.description !== undefined) issue.description = data.description;
    if (data.location !== undefined) issue.location = data.location;
    this.persist();
  }

  deleteIssue(id: string): void {
    this._issues = this._issues.filter((x) => x.id !== id);
    this.persist();
  }

  startFix(id: string): void {
    const issue = this._issues.find((x) => x.id === id);
    if (!issue) throw new Error('ไม่พบการแจ้งปัญหา');
    issue.startFix();
    this.persist();
  }

  resolveIssue(id: string, note: string): void {
    const issue = this._issues.find((x) => x.id === id);
    if (!issue) throw new Error('ไม่พบการแจ้งปัญหา');
    issue.resolve(note);
    this.persist();
  }

  // ============================================================
  // ข้อมูลตัวอย่างสำหรับนำเสนอ (Demo)
  // ============================================================
  loadDemoData(): void {
    // ---- สมาชิก ----
    const s1 = this.addMember({ kind: MemberKind.STUDENT, name: 'สมชาย ใจดี', phone: '080-000-0001', email: 'somchai@up.ac.th', studentId: '641111001', faculty: 'วิศวกรรมศาสตร์' });
    const s2 = this.addMember({ kind: MemberKind.STUDENT, name: 'สมหญิง รักสุขภาพ', phone: '080-000-0002', email: 'somying@up.ac.th', studentId: '641222002', faculty: 'วิทยาลัยแพทยศาสตร์' });
    const s3 = this.addMember({ kind: MemberKind.STUDENT, name: 'ณัฐวุฒิ แข็งแรง', phone: '080-000-0003', email: 'natthawut@up.ac.th', studentId: '650333003', faculty: 'วิทยาศาสตร์' });
    const e1 = this.addMember({ kind: MemberKind.EXTERNAL, name: 'อนุชา นักกีฬา', phone: '081-111-1111', email: 'anut@example.com', idCardNo: '1509900000011' });
    const e2 = this.addMember({ kind: MemberKind.EXTERNAL, name: 'พิชญา ออกกำลัง', phone: '081-222-2222', email: 'pitchaya@example.com', idCardNo: '1509900000022' });

    // ---- ซื้อแพ็กเกจ ----
    const now = new Date();
    this.purchasePackage(s1.id, PackageType.MONTHLY, PaymentMethod.QR, PaymentStatus.PAID);
    this.purchasePackage(s3.id, PackageType.MONTHLY, PaymentMethod.TRANSFER, PaymentStatus.PAID);
    this.purchasePackage(e1.id, PackageType.MONTHLY, PaymentMethod.CASH, PaymentStatus.PAID);
    this.purchasePackage(e2.id, PackageType.DAILY, PaymentMethod.CARD, PaymentStatus.PAID);
    // บันทึกค้างชำระ (รอชำระเงิน) ให้เห็นสถานะ PENDING
    this.purchasePackage(s2.id, PackageType.MONTHLY, PaymentMethod.CASH, PaymentStatus.PENDING);

    // ---- การเข้าใช้งาน (ย้อนหลัง + กำลังใช้งาน) ----
    const y1 = new Date(now);
    y1.setDate(y1.getDate() - 1);
    y1.setHours(9, 0, 0, 0);
    const y1out = new Date(y1);
    y1out.setHours(10, 45, 0, 0);
    this.seedVisit(s1.id, y1, y1out);

    const y2 = new Date(now);
    y2.setDate(y2.getDate() - 2);
    y2.setHours(16, 0, 0, 0);
    const y2out = new Date(y2);
    y2out.setHours(17, 30, 0, 0);
    this.seedVisit(e1.id, y2, y2out);

    // check-in จริงตอนนี้ (กำลังใช้บริการ)
    try {
      this.checkIn(s3.id);
    } catch {
      /* ข้ามถ้าซ้ำ */
    }

    // ---- เทรนเนอร์ ----
    this.addTrainer({ name: 'โค้ชป๊อป', phone: '082-333-3333', email: 'pop@ess.ac.th', specialties: ['ฟิตเนส', 'โยคะ'], hourlyRate: 300, schedule: ['จันทร์:เช้า', 'จันทร์:บ่าย', 'พุธ:เช้า', 'ศุกร์:บ่าย', 'เสาร์:เย็น'] });
    this.addTrainer({ name: 'โค้ชยิ่ง', phone: '082-444-4444', email: 'ying@ess.ac.th', specialties: ['เวทเทรนนิ่ง'], hourlyRate: 400, schedule: ['อังคาร:บ่าย', 'พฤหัส:บ่าย', 'เสาร์:เช้า'] });
    this.addTrainer({ name: 'โค้ชแอน', phone: '082-555-5555', email: 'ann@ess.ac.th', specialties: ['คาร์ดิโอ', 'HIIT'], hourlyRate: 350, schedule: ['จันทร์:เย็น', 'อังคาร:เย็น', 'พุธ:เย็น', 'ศุกร์:เย็น'] });

    // ---- แจ้งปัญหา ----
    const i1 = this.addIssue({ title: 'ลู่วิ่งสายพานดังผิดปกติ', description: 'เครื่องที่ 3 มีเสียงดังตอนวิ่งที่ความเร็วเกิน 8 กม./ชม.', location: 'โซนคาร์ดิโอ ชั้น 1', reporterName: 'พนักงานประจำห้อง' });
    const i2 = this.addIssue({ title: 'ดัมเบลชุด 10 กก. ชำรุด', description: 'ด้ามจับหลวม น็อตหาย 1 ตัว', location: 'โซนเวทเทรนนิ่ง', reporterName: 'สมชาย ใจดี' });
    this.startFix(i1.id);
    const i3 = this.addIssue({ title: 'เครื่องปรับอากาศห้องโยคะไม่เย็น', description: 'แอร์หยดน้ำและลมไม่เย็น', location: 'ห้องโยคะ ชั้น 2', reporterName: 'โค้ชป๊อป' });
    this.resolveIssue(i3.id, 'ล้างแอร์และเติมแก๊สเรียบร้อยแล้ว');
    void i2;

    this.persist();
  }
}