"use client";

// แผงข้อมูล telemetry แบบเรียลไทม์ (จำลองด้วย setInterval)
// แยกเป็น component ของตัวเอง state อยู่ในนี้ที่เดียว
// เวลาข้อมูลอัปเดตจะ re-render แค่แผงนี้ ไม่กระทบส่วนอื่นของหน้า (ซึ่งเป็น Server Component)

import { useEffect, useState } from "react";

const UPDATE_INTERVAL_MS = 1500;
const LOW_BATTERY = 20;

type Props = {
  startBattery: number;
  startAltitude: number;
  waypoints: { lat: number; lng: number }[];
};

type TelemetryState = {
  battery: number;
  altitude: number;
  speed: number;
  lat: number;
  lng: number;
  // ตำแหน่งบนเส้นทาง: กำลังบินจาก waypoint ที่ segment ไปยังจุดถัดไป ได้ progress (0-1) แล้ว
  segment: number;
  progress: number;
  updatedAt: number;
};

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

// คำนวณค่าถัดไปจากค่าเดิม
function nextTelemetry(prev: TelemetryState, waypoints: Props["waypoints"]): TelemetryState {
  // แบตลดลงทีละนิด ไม่ต่ำกว่า 0
  const battery = Math.max(0, prev.battery - randomBetween(0.4, 1.2));

  // ความสูงแกว่งขึ้นลงรอบ ๆ 100-130 เมตร
  const altitude = Math.min(130, Math.max(90, prev.altitude + randomBetween(-4, 4)));

  // ความเร็วแกว่งระหว่าง 8-15 m/s
  const speed = Math.min(15, Math.max(8, prev.speed + randomBetween(-1.5, 1.5)));

  // ขยับตำแหน่งไปตามเส้นทาง พอถึงจุดสุดท้ายแล้วเริ่มรอบใหม่
  let segment = prev.segment;
  let progress = prev.progress + 0.15;
  if (progress >= 1) {
    progress = 0;
    segment = (segment + 1) % (waypoints.length - 1);
  }
  const from = waypoints[segment];
  const to = waypoints[segment + 1];

  return {
    battery,
    altitude,
    speed,
    lat: from.lat + (to.lat - from.lat) * progress,
    lng: from.lng + (to.lng - from.lng) * progress,
    segment,
    progress,
    updatedAt: Date.now(),
  };
}

export default function LiveTelemetry({ startBattery, startAltitude, waypoints }: Props) {
  const [data, setData] = useState<TelemetryState>(() => ({
    battery: startBattery,
    altitude: startAltitude,
    speed: 11,
    lat: waypoints[0].lat,
    lng: waypoints[0].lng,
    segment: 0,
    progress: 0,
    updatedAt: Date.now(),
  }));

  useEffect(() => {
    // ต้องมีอย่างน้อย 2 จุดถึงจะขยับตำแหน่งได้
    if (waypoints.length < 2) return;

    const timer = setInterval(() => {
      // ใช้ฟังก์ชันใน setData เพื่อให้ได้ค่าล่าสุดเสมอ ไม่ต้องใส่ data ใน dependency
      setData((prev) => nextTelemetry(prev, waypoints));
    }, UPDATE_INTERVAL_MS);

    // cleanup: หยุด interval เมื่อออกจากหน้านี้ (component ถูก unmount)
    return () => clearInterval(timer);
  }, [waypoints]);

  const isLowBattery = data.battery < LOW_BATTERY;
  const updatedTime = new Date(data.updatedAt).toLocaleTimeString("th-TH", { timeZone: "Asia/Bangkok" });

  return (
    <section
      className={`mb-6 rounded-lg border-2 bg-white p-4 ${
        isLowBattery ? "border-red-500" : "border-yellow-300"
      }`}
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="size-3 animate-pulse rounded-full bg-red-500" />
        <h2 className="text-lg font-semibold">ข้อมูลเรียลไทม์</h2>
        <span className="ml-auto text-sm text-gray-500">อัปเดตล่าสุด {updatedTime}</span>
      </div>

      {isLowBattery && (
        <div role="alert" className="mb-4 animate-pulse rounded bg-red-600 p-3 font-bold text-white">
          ⚠ แบตเตอรี่ต่ำ ({data.battery.toFixed(0)}%) ควรนำโดรนกลับจุดขึ้นบินทันที
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className={`rounded p-3 ${isLowBattery ? "bg-red-50" : "bg-gray-50"}`}>
          <p className="text-sm text-gray-500">แบตเตอรี่</p>
          <p className={`text-2xl font-bold ${isLowBattery ? "text-red-600" : ""}`}>
            {data.battery.toFixed(1)}%
          </p>
          <div className="mt-2 h-2 rounded bg-gray-200">
            <div
              className={`h-2 rounded ${isLowBattery ? "bg-red-500" : "bg-green-500"}`}
              style={{ width: `${data.battery}%` }}
            />
          </div>
        </div>
        <div className="rounded bg-gray-50 p-3">
          <p className="text-sm text-gray-500">ความสูง</p>
          <p className="text-2xl font-bold">{data.altitude.toFixed(1)} ม.</p>
        </div>
        <div className="rounded bg-gray-50 p-3">
          <p className="text-sm text-gray-500">ความเร็ว</p>
          <p className="text-2xl font-bold">{data.speed.toFixed(1)} m/s</p>
        </div>
        <div className="rounded bg-gray-50 p-3">
          <p className="text-sm text-gray-500">พิกัดปัจจุบัน</p>
          <p className="font-bold">{data.lat.toFixed(5)}</p>
          <p className="font-bold">{data.lng.toFixed(5)}</p>
        </div>
      </div>
    </section>
  );
}
