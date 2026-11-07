// ที่เก็บข้อมูลภารกิจ (เก็บไว้ในหน่วยความจำของ server แทนฐานข้อมูล)
// ข้อมูลที่เพิ่ม/แก้ไขจะหายไปเมื่อรีสตาร์ท server
// ใช้ globalThis เพื่อไม่ให้ข้อมูลรีเซ็ตทุกครั้งที่ dev server โหลดโค้ดใหม่
import { Mission, seedMissions } from "./missions";

const globalStore = globalThis as unknown as { missionStore?: Mission[] };

if (!globalStore.missionStore) {
  globalStore.missionStore = [...seedMissions];
}

const store = globalStore.missionStore;

export function getAllMissions() {
  return store;
}

export function getMissionById(id: string) {
  return store.find((m) => m.id === id);
}

export type MissionInput = Omit<Mission, "id" | "status">;

export function createMission(input: MissionInput) {
  // หาเลขรหัสล่าสุดแล้ว +1 เช่น MSN-034 -> MSN-035
  const maxNumber = Math.max(0, ...store.map((m) => Number(m.id.replace("MSN-", ""))));
  const id = `MSN-${String(maxNumber + 1).padStart(3, "0")}`;
  store.push({ ...input, id, status: "planned" });
  return id;
}

export function updateMission(id: string, input: MissionInput) {
  const index = store.findIndex((m) => m.id === id);
  if (index === -1) return false;
  store[index] = { ...store[index], ...input };
  return true;
}

// ---------- จำลองการโหลดข้อมูลผ่านเครือข่าย ----------
// ใส่ ?demo=error ใน URL เพื่อดูหน้า error: ครั้งแรกจะโหลดพลาด กด "ลองใหม่" แล้วจะสำเร็จ
// ใส่ ?demo=empty ในหน้ารายการ เพื่อดูหน้าตอนที่ยังไม่มีข้อมูลในระบบ

const demoState = globalThis as unknown as { demoErrorCount?: number };

export async function simulateNetwork(demo?: string) {
  await new Promise((resolve) => setTimeout(resolve, 700));
  if (demo === "error") {
    demoState.demoErrorCount = (demoState.demoErrorCount ?? 0) + 1;
    if (demoState.demoErrorCount % 2 === 1) {
      throw new Error("โหลดข้อมูลไม่สำเร็จ (จำลอง)");
    }
  }
}
