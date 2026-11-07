"use client"; // error boundary ต้องเป็น Client Component

import Link from "next/link";
import { useEffect } from "react";

// แสดงเมื่อโหลดข้อมูลในหน้าภารกิจไม่สำเร็จ (ครอบทุกหน้าภายใต้ /missions)
export default function MissionsError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 text-gray-900">
      <div role="alert" className="w-full max-w-md rounded-lg border border-red-200 bg-white p-8 text-center">
        <p className="text-lg font-semibold text-red-700">โหลดข้อมูลไม่สำเร็จ</p>
        <p className="mt-2 text-sm text-gray-500">อาจเกิดจากปัญหาการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => retry()}
            className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            ลองใหม่
          </button>
          <Link href="/missions" className="rounded border border-gray-300 px-4 py-2 hover:bg-gray-50">
            กลับหน้ารายการ
          </Link>
        </div>
      </div>
    </div>
  );
}
