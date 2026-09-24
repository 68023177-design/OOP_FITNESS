// ============================================================
// Person.ts — คลาสพื้นฐาน (Base / Abstract class)
//
// ★ ABSTRACTION: เป็นคลาสนามธรรม กำหนด "สัญญา" (abstract method)
//   ที่คลาสลูกทุกตัวต้อง implement ให้ครบ แต่ตัวคลาสเองไม่ถูก
//   instantiate โดยตรง (ใช้ new Person() ไม่ได้)
//
// ★ ENCAPSULATION: ข้อมูล private/protected เข้าถึงได้ผ่าน
//   getter/setter เท่านั้น
// ============================================================

export abstract class Person {
  // ข้อมูลถูกซ่อนเป็น protected — ภายนอกเข้าถึงผ่าน getter ได้อย่างเดียว
  protected _id: string;
  protected _name: string;
  protected _phone: string;
  protected _email: string;

  constructor(id: string, name: string, phone: string, email: string) {
    this._id = id;
    this._name = name;
    this._phone = phone;
    this._email = email;
  }

  // ---- Encapsulation: getter / setter พร้อม validate ข้อมูล ----
  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  set name(value: string) {
    if (value && value.trim()) this._name = value.trim();
  }

  get phone(): string {
    return this._phone;
  }

  set phone(value: string) {
    this._phone = value.trim();
  }

  get email(): string {
    return this._email;
  }

  set email(value: string) {
    this._email = value.trim();
  }

  /**
   * Abstraction: คลาสลูกต้อง override เพื่อระบุบทบาทของบุคคล
   * เช่น 'นิสิต' / 'บุคคลภายนอก' / 'เทรนเนอร์'
   * (Polymorphism — ผลลัพธ์ต่างกันตามชนิดของคลาสจริง ณ runtime)
   */
  abstract getRoleLabel(): string;

  /** Abstraction: รหัสชนิดบุคคล ใช้แยกแยะชนิดของ object */
  abstract getTypeCode(): string;
}