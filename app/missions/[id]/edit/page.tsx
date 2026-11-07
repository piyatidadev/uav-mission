import { notFound } from "next/navigation";
import { Suspense } from "react";
import { missionToForm } from "@/lib/mission-form";
import { getMissionById, simulateNetwork } from "@/lib/mission-store";
import MissionForm from "../../MissionForm";
import { FormSkeleton } from "../../Skeletons";

export default function EditMissionPage({ params, searchParams }: PageProps<"/missions/[id]/edit">) {
  return (
    <Suspense fallback={<FormSkeleton />}>
      {Promise.all([params, searchParams]).then(([{ id }, query]) => (
        <EditForm id={id} demo={typeof query.demo === "string" ? query.demo : undefined} />
      ))}
    </Suspense>
  );
}

async function EditForm({ id, demo }: { id: string; demo?: string }) {
  // จำลองการโหลดข้อมูล (?demo=error จะโหลดพลาดเพื่อดูหน้า error)
  await simulateNetwork(demo);
  const mission = getMissionById(id);
  if (!mission) {
    notFound();
  }
  return <MissionForm missionId={mission.id} initialData={missionToForm(mission)} />;
}
