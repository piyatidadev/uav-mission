import Link from "next/link";

export default function MissionNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6 text-gray-900">
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
        <p className="text-5xl font-bold text-gray-300">404</p>
        <h1 className="mt-4 text-xl font-bold">ไม่พบภารกิจนี้</h1>
        <p className="mt-2 text-gray-500">
          รหัสภารกิจที่คุณเปิดอาจไม่ถูกต้อง หรือภารกิจนี้ถูกลบไปแล้ว
        </p>
        <Link
          href="/missions"
          className="mt-6 inline-block rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          กลับไปหน้ารายการภารกิจ
        </Link>
      </div>
    </div>
  );
}
