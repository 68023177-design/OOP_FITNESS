// ============================================================
// Repository.ts — คลาส Generic สำหรับบันทึก/โหลดข้อมูล (localStorage)
//
// ★ Abstraction + Polymorphism (Generics): T เปลี่ยนได้ตามชนิดข้อมูล
//   ใช้ class เดียวจัดการทุก collection
// ============================================================

export class Repository<T> {
  constructor(
    private readonly key: string,
    private readonly hydrate: (raw: any) => T,
  ) {}

  /** โหลดข้อมูลทั้งหมดจาก localStorage แล้วแปลงกลับเป็น object ชนิดที่ต้องการ */
  load(): T[] {
    try {
      const raw = localStorage.getItem(this.key);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.map((r) => this.hydrate(r));
    } catch {
      return [];
    }
  }

  /** บันทึกข้อมูลทั้งหมดลง localStorage (JSON.stringify ผ่าน instance โดยตรง) */
  save(items: T[]): void {
    localStorage.setItem(this.key, JSON.stringify(items));
  }

  clear(): void {
    localStorage.removeItem(this.key);
  }
}