// ข้อมูลฟอร์มและการตรวจสอบ ใช้ร่วมกันทั้งฝั่ง client (แสดง error) และ server (ตรวจซ้ำก่อนบันทึก)
import { droneList, getWaypoints, Mission } from "./missions";

export type MissionFormData = {
  name: string;
  drone: string;
  startAt: string; // รูปแบบของ <input type="datetime-local"> เช่น "2026-11-10T09:00"
  endAt: string;
  waypoints: { lat: string; lng: string }[];
  note: string;
};

// key ของ error ตรงกับชื่อช่อง เช่น "name", "waypoints.0.lat"
export type FormErrors = Record<string, string>;

export const NOTE_MAX_LENGTH = 500;

export const emptyForm: MissionFormData = {
  name: "",
  drone: "",
  startAt: "",
  endAt: "",
  waypoints: [
    { lat: "", lng: "" },
    { lat: "", lng: "" },
  ],
  note: "",
};

// เวลาทั้งหมดในระบบใช้เวลาประเทศไทย (+07:00)
export function inputToIso(value: string) {
  return `${value}:00+07:00`;
}

function msToInput(ms: number) {
  // บวก 7 ชั่วโมงแล้วตัดเอาแค่ "YYYY-MM-DDTHH:mm"
  return new Date(ms + 7 * 60 * 60 * 1000).toISOString().slice(0, 16);
}

// แปลงภารกิจที่มีอยู่เป็นค่าเริ่มต้นของฟอร์มแก้ไข
export function missionToForm(mission: Mission): MissionFormData {
  const start = new Date(mission.flightAt).getTime();
  return {
    name: mission.name,
    drone: mission.drone,
    startAt: msToInput(start),
    endAt: msToInput(start + mission.durationMin * 60 * 1000),
    waypoints: getWaypoints(mission).map((w) => ({ lat: String(w.lat), lng: String(w.lng) })),
    note: mission.note ?? "",
  };
}

function checkNumber(value: string, min: number, max: number, label: string) {
  if (value.trim() === "") return `กรุณากรอก ${label}`;
  const num = Number(value);
  if (Number.isNaN(num)) return `${label} ต้องเป็นตัวเลข`;
  if (num < min || num > max) return `${label} ต้องอยู่ระหว่าง ${min} ถึง ${max}`;
  return "";
}

export function validateMission(data: MissionFormData): FormErrors {
  const errors: FormErrors = {};

  const name = data.name.trim();
  if (name === "") {
    errors.name = "กรุณากรอกชื่อภารกิจ";
  } else if (name.length < 3) {
    errors.name = "ชื่อภารกิจต้องมีอย่างน้อย 3 ตัวอักษร";
  }

  if (data.drone === "") {
    errors.drone = "กรุณาเลือกโดรน";
  } else if (!droneList.includes(data.drone)) {
    errors.drone = "โดรนที่เลือกไม่อยู่ในรายการ";
  }

  if (data.startAt === "") {
    errors.startAt = "กรุณาเลือกวันและเวลาเริ่มบิน";
  }
  if (data.endAt === "") {
    errors.endAt = "กรุณาเลือกวันและเวลาสิ้นสุด";
  } else if (data.startAt !== "" && data.endAt <= data.startAt) {
    // รูปแบบ "YYYY-MM-DDTHH:mm" เทียบเป็น string ได้เลย
    errors.endAt = "เวลาสิ้นสุดต้องมากกว่าเวลาเริ่มบิน";
  }

  if (data.waypoints.length < 2) {
    errors.waypoints = "ต้องมี waypoint อย่างน้อย 2 จุด";
  }
  data.waypoints.forEach((w, i) => {
    const latError = checkNumber(w.lat, -90, 90, "Latitude");
    const lngError = checkNumber(w.lng, -180, 180, "Longitude");
    if (latError) errors[`waypoints.${i}.lat`] = latError;
    if (lngError) errors[`waypoints.${i}.lng`] = lngError;
  });

  if (data.note.length > NOTE_MAX_LENGTH) {
    errors.note = `หมายเหตุต้องไม่เกิน ${NOTE_MAX_LENGTH} ตัวอักษร`;
  }

  return errors;
}
