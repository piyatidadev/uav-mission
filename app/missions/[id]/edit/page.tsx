import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { missionToForm } from "@/lib/mission-form";
import { getMissionById } from "@/lib/mission-store";
import MissionForm from "../../MissionForm";

export default function EditMissionPage({ params }: PageProps<"/missions/[id]/edit">) {
  return (
    <Suspense fallback={<p className="p-6">กำลังโหลด...</p>}>
      {params.then(({ id }) => (
        <EditForm id={id} />
      ))}
    </Suspense>
  );
}

async function EditForm({ id }: { id: string }) {
  // ข้อมูลเปลี่ยนได้ ต้องอ่านใหม่ทุกครั้งที่เปิดหน้า
  await connection();
  const mission = getMissionById(id);
  if (!mission) {
    notFound();
  }
  return <MissionForm missionId={mission.id} initialData={missionToForm(mission)} />;
}
