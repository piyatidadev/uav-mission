"use server";

import { revalidatePath } from "next/cache";
import { FormErrors, inputToIso, MissionFormData, validateMission } from "@/lib/mission-form";
import { createMission, MissionInput, updateMission } from "@/lib/mission-store";

type SaveResult = { id?: string; errors?: FormErrors };

// id = null คือสร้างใหม่, มี id คือแก้ไข
export async function saveMission(id: string | null, data: MissionFormData): Promise<SaveResult> {
  // จำลองว่าส่งข้อมูลไป server ใช้เวลา 1 วินาที (จะได้เห็นสถานะ loading)
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // ตรวจซ้ำที่ฝั่ง server ด้วย เผื่อมีคนส่งข้อมูลมาโดยไม่ผ่านฟอร์ม
  const errors = validateMission(data);
  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  const waypoints = data.waypoints.map((w, i) => ({
    no: i + 1,
    lat: Number(w.lat),
    lng: Number(w.lng),
  }));
  const start = new Date(inputToIso(data.startAt)).getTime();
  const end = new Date(inputToIso(data.endAt)).getTime();

  const input: MissionInput = {
    name: data.name.trim(),
    drone: data.drone,
    flightAt: inputToIso(data.startAt),
    durationMin: Math.round((end - start) / 60000),
    lat: waypoints[0].lat,
    lng: waypoints[0].lng,
    waypoints,
    note: data.note.trim(),
  };

  let missionId = id;
  if (missionId) {
    const found = updateMission(missionId, input);
    if (!found) return { errors: { form: "ไม่พบภารกิจที่ต้องการแก้ไข" } };
  } else {
    missionId = createMission(input);
  }

  revalidatePath("/missions");
  revalidatePath(`/missions/${missionId}`);
  return { id: missionId };
}
