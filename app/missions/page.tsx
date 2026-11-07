import { connection } from "next/server";
import { Suspense } from "react";
import { getAllMissions } from "@/lib/mission-store";
import MissionList from "./MissionList";

export default function MissionsPage() {
  // ใช้ useSearchParams ใน MissionList เลยต้องครอบด้วย Suspense
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <MissionListLoader />
    </Suspense>
  );
}

async function MissionListLoader() {
  // ข้อมูลเปลี่ยนได้ (เพิ่ม/แก้ไขภารกิจ) ต้องอ่านใหม่ทุกครั้งที่เปิดหน้า
  await connection();
  return <MissionList missions={getAllMissions()} />;
}
