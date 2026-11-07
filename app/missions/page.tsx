import { Suspense } from "react";
import MissionList from "./MissionList";
import { ListSkeleton } from "./Skeletons";

export default function MissionsPage() {
  // ใช้ useSearchParams ใน MissionList เลยต้องครอบด้วย Suspense
  // ข้อมูลภารกิจโหลดจาก /api/missions ภายใน MissionList (มีสถานะ loading/error/empty ของตัวเอง)
  return (
    <Suspense fallback={<ListSkeleton />}>
      <MissionList />
    </Suspense>
  );
}
