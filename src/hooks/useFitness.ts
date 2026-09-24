// hooks/useFitness.ts — hook สำหรับเชื่อม React กับ Singleton Service
// re-render อัตโนมัติทุกครั้งที่ข้อมูลในระบบเปลี่ยน (ผ่าน version counter)

import { useSyncExternalStore } from 'react';
import { FitnessCenterService } from '../services/FitnessCenterService';

export function useFitness(): FitnessCenterService {
  const svc = FitnessCenterService.getInstance();
  useSyncExternalStore(
    (cb) => svc.subscribe(cb),
    () => svc.version,
    () => svc.version,
  );
  return svc;
}