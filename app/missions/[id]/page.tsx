import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getMissionById, simulateNetwork } from "@/lib/mission-store";
import { getTelemetry, getWaypoints, statusList } from "@/lib/missions";
import LineChart from "./LineChart";
import LiveTelemetry from "./LiveTelemetry";
import { DetailSkeleton } from "../Skeletons";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("th-TH", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Asia/Bangkok",
  });
}

function formatDuration(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h > 0) return `${h} ชม. ${m} นาที`;
  return `${m} นาที`;
}

// params/searchParams เป็นข้อมูลจาก URL ต้องอ่านใน Suspense (เพราะเปิด cacheComponents ไว้)
// ระหว่างโหลดแสดง skeleton, ถ้าโหลดพลาดจะไปที่ error.tsx, ถ้าไม่เจอ id ไปที่ not-found.tsx
export default function MissionDetailPage({ params, searchParams }: PageProps<"/missions/[id]">) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      {Promise.all([params, searchParams]).then(([{ id }, query]) => (
        <MissionDetail id={id} demo={typeof query.demo === "string" ? query.demo : undefined} />
      ))}
    </Suspense>
  );
}

async function MissionDetail({ id, demo }: { id: string; demo?: string }) {
  // จำลองการโหลดข้อมูล (?demo=error จะโหลดพลาดเพื่อดูหน้า error)
  await simulateNetwork(demo);
  const mission = getMissionById(id);

  // ไม่มี id นี้ในข้อมูล -> ไปหน้า not-found.tsx
  if (!mission) {
    notFound();
  }

  const status = statusList.find((s) => s.value === mission.status)!;
  const waypoints = getWaypoints(mission);
  const telemetry = getTelemetry(mission);

  // ขอบเขตแผนที่ให้ครอบคลุมทุก waypoint (เผื่อขอบไว้นิดหน่อย)
  const lats = waypoints.map((w) => w.lat);
  const lngs = waypoints.map((w) => w.lng);
  const pad = 0.004;
  const bbox = [
    Math.min(...lngs) - pad,
    Math.min(...lats) - pad,
    Math.max(...lngs) + pad,
    Math.max(...lats) + pad,
  ].join(",");
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${mission.lat},${mission.lng}`;

  const info = [
    { label: "รหัสภารกิจ", value: mission.id },
    { label: "ชื่อภารกิจ", value: mission.name },
    { label: "โดรน", value: mission.drone },
    { label: "นักบิน", value: mission.pilot || "-" },
    { label: "จังหวัด", value: mission.province || "-" },
    { label: "จุดขึ้นบิน", value: `${mission.lat}, ${mission.lng}` },
    { label: "วันและเวลาที่บิน", value: formatDate(mission.flightAt) },
    {
      label: "วันและเวลาสิ้นสุด",
      value: formatDate(new Date(new Date(mission.flightAt).getTime() + mission.durationMin * 60000).toISOString()),
    },
    {
      label: mission.status === "planned" ? "ระยะเวลาบิน (ที่วางแผนไว้)" : "ระยะเวลาบิน",
      value: formatDuration(mission.durationMin),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 text-gray-900 sm:p-6">
      <div className="mx-auto max-w-6xl">
        <Link href="/missions" className="text-sm text-blue-600 hover:underline">
          ← กลับไปหน้ารายการภารกิจ
        </Link>

        <div className="mb-6 mt-3 flex flex-wrap items-center gap-3">
          <h1 className="break-words text-2xl font-bold">{mission.name}</h1>
          <span className={`rounded-full px-3 py-1 text-sm font-medium ${status.className}`}>
            {status.label}
          </span>
          <Link
            href={`/missions/${mission.id}/edit`}
            className="ml-auto rounded border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50"
          >
            แก้ไขภารกิจ
          </Link>
        </div>

        {/* ข้อมูลทั่วไป */}
        <section className="mb-6 rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="mb-4 text-lg font-semibold">ข้อมูลทั่วไป</h2>
          <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {info.map((item) => (
              <div key={item.label}>
                <dt className="text-sm text-gray-500">{item.label}</dt>
                <dd className="break-words font-medium">{item.value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-4 border-t border-gray-200 pt-4">
            <p className="text-sm text-gray-500">หมายเหตุ</p>
            <p className="whitespace-pre-wrap break-words">{mission.note || "-"}</p>
          </div>
        </section>

        {/* ข้อมูลเรียลไทม์ แสดงเฉพาะภารกิจที่กำลังบิน (เริ่มจากค่าล่าสุดของกราฟ) */}
        {mission.status === "in-progress" && (
          <LiveTelemetry
            startBattery={telemetry[telemetry.length - 1]?.battery ?? 100}
            startAltitude={telemetry[telemetry.length - 1]?.altitude || 100}
            waypoints={waypoints.map((w) => ({ lat: w.lat, lng: w.lng }))}
          />
        )}

        {/* เส้นทางบิน */}
        <section className="mb-6 rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="mb-4 text-lg font-semibold">เส้นทางบิน ({waypoints.length} จุด)</h2>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div>
              <iframe
                title="แผนที่พื้นที่บิน"
                src={mapUrl}
                className="h-80 w-full rounded border border-gray-200"
              />
              <p className="mt-1 text-xs text-gray-500">
                หมุดบนแผนที่คือจุดขึ้นบิน (แผนที่จาก OpenStreetMap)
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-3 py-2">จุดที่</th>
                    <th className="px-3 py-2">Latitude</th>
                    <th className="px-3 py-2">Longitude</th>
                    <th className="px-3 py-2">ความสูง (ม.)</th>
                  </tr>
                </thead>
                <tbody>
                  {waypoints.map((w) => (
                    <tr key={w.no} className="border-t border-gray-200">
                      <td className="px-3 py-2">
                        {w.no}
                        {w.no === 1 && <span className="ml-1 text-gray-500">(ขึ้นบิน)</span>}
                        {w.no === waypoints.length && <span className="ml-1 text-gray-500">(ลงจอด)</span>}
                      </td>
                      <td className="px-3 py-2">{w.lat.toFixed(5)}</td>
                      <td className="px-3 py-2">{w.lng.toFixed(5)}</td>
                      <td className="px-3 py-2">{w.altitude ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* กราฟ */}
        <section className="rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="mb-4 text-lg font-semibold">ข้อมูลระหว่างบิน</h2>
          {telemetry.length === 0 ? (
            <p className="py-8 text-center text-gray-500">
              ยังไม่มีข้อมูล เนื่องจากภารกิจนี้ยังไม่ได้เริ่มบิน
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <LineChart
                title="ระดับแบตเตอรี่ตามเวลา"
                data={telemetry.map((t) => ({ x: t.minute, y: t.battery }))}
                yMax={100}
                yUnit="%"
                color="#16a34a"
              />
              <LineChart
                title="ระดับความสูงตามเวลา"
                data={telemetry.map((t) => ({ x: t.minute, y: t.altitude }))}
                yMax={160}
                yUnit="ม."
                color="#2563eb"
              />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
