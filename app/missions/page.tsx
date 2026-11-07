import { Suspense } from "react";
import MissionList from "./MissionList";

export default function MissionsPage() {
  // ใช้ useSearchParams ใน MissionList เลยต้องครอบด้วย Suspense
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <MissionList />
    </Suspense>
  );
}
