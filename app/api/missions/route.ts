import { NextRequest } from "next/server";
import { getAllMissions, simulateNetwork } from "@/lib/mission-store";

// GET /api/missions ใช้ในหน้ารายการภารกิจ
export async function GET(request: NextRequest) {
  const demo = request.nextUrl.searchParams.get("demo") ?? undefined;
  // attempt = ครั้งที่โหลด (0 = ครั้งแรก) ใช้กับ ?demo=error: ครั้งแรกพลาด กดลองใหม่แล้วสำเร็จ
  const attempt = Number(request.nextUrl.searchParams.get("attempt") ?? 0);

  await simulateNetwork();
  if (demo === "error" && attempt === 0) {
    return Response.json({ message: "โหลดข้อมูลไม่สำเร็จ" }, { status: 500 });
  }

  if (demo === "empty") {
    return Response.json([]);
  }
  return Response.json(getAllMissions());
}
