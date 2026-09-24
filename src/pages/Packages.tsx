// pages/Packages.tsx — หน้าแพ็กเกจ (แก้ไขราคา ชื่อ สิทธิ์การใช้งาน)

import { useState } from 'react';
import { useFitness } from '../hooks/useFitness';
import { PackageType } from '../models/enums';
import { TagIcon } from '../components/icons';
import { Field, TextInput } from '../components/ui/Field';
import { Alert, useNotice } from '../components/ui/Alert';
import { money } from '../utils/format';
import type { Package } from '../models/Package';

function PackageCard({ pkg, onSave }: { pkg: Package; onSave: (data: { name: string; basePrice: number; usageRight: string }) => void }) {
  const isMonthly = pkg.type === PackageType.MONTHLY;
  const [name, setName] = useState(pkg.name);
  const [price, setPrice] = useState(String(pkg.basePrice));
  const [usage, setUsage] = useState(pkg.usageRight);
  const [dirty, setDirty] = useState(false);

  const save = () => {
    onSave({ name, basePrice: Number(price) || 0, usageRight: usage });
    setDirty(false);
  };

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
          <TagIcon className="h-5 w-5" />
        </div>
        <div>
          {isMonthly ? (
            <span className="inline-block rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-semibold text-violet-700">รายเดือน</span>
          ) : (
            <span className="inline-block rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-semibold text-sky-700">รายวัน</span>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <Field label="ชื่อแพ็กเกจ">
          <TextInput value={name} onChange={(e) => { setName(e.target.value); setDirty(true); }} />
        </Field>
        <Field label="ราคา (บาท)" hint={isMonthly ? 'นิสิตได้ส่วนลด 20% โดยอัตโนมัติ' : undefined}>
          <TextInput type="number" min={0} value={price} onChange={(e) => { setPrice(e.target.value); setDirty(true); }} />
        </Field>
        <Field label="สิทธิ์การใช้งาน">
          <TextInput value={usage} onChange={(e) => { setUsage(e.target.value); setDirty(true); }} />
        </Field>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
        <div className="text-sm">
          <p className="text-slate-500">ราคาปัจจุบัน</p>
          {isMonthly ? (
            <p className="font-bold text-slate-800">
              {money(pkg.basePrice)} <span className="text-xs font-normal text-slate-400">· นิสิต {money(Math.round(pkg.basePrice * 0.8))}</span>
            </p>
          ) : (
            <p className="font-bold text-slate-800">{money(pkg.basePrice)}</p>
          )}
        </div>
        <button
          onClick={save}
          disabled={!dirty}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition enabled:hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          บันทึกการแก้ไข
        </button>
      </div>
    </div>
  );
}

export function PackagesPage() {
  const svc = useFitness();
  const [notice, show] = useNotice();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">จัดการแพ็กเกจ</h2>
          <p className="text-sm text-slate-500">แก้ไขชื่อ ราคา และสิทธิ์การใช้งานของแพ็กเกจ</p>
        </div>
      </div>

      {notice && <Alert notice={notice} />}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {svc.packages.map((pkg) => (
          <PackageCard
            key={pkg.type}
            pkg={pkg}
            onSave={(data) => {
              // Encapsulation: แก้ไขผ่าน service เท่านั้น ไม่แตะ field ตรง ๆ
              svc.updatePackage(pkg.type, data);
              show('success', 'บันทึกแพ็กเกจเรียบร้อยแล้ว');
            }}
          />
        ))}
      </div>
    </div>
  );
}