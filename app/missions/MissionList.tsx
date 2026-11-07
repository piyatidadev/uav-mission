"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Mission, statusList } from "@/lib/missions";

const PAGE_SIZE = 10;

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("th-TH", {
    dateStyle: "medium",
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

export default function MissionList({ missions }: { missions: Mission[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // อ่านค่าจาก URL
  const q = searchParams.get("q") || "";
  const statusParam = searchParams.get("status");
  const selectedStatus = statusParam ? statusParam.split(",") : [];
  const sort = searchParams.get("sort") === "asc" ? "asc" : "desc";
  const page = Number(searchParams.get("page")) || 1;

  const [searchText, setSearchText] = useState(q);

  // อัปเดต query string แล้วเปลี่ยน URL
  function updateParams(newValues: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const key in newValues) {
      if (newValues[key]) {
        params.set(key, newValues[key]);
      } else {
        params.delete(key);
      }
    }
    router.replace(`${pathname}?${params.toString()}`);
  }

  // debounce: รอให้หยุดพิมพ์ 500ms ก่อนค่อยอัปเดต URL
  useEffect(() => {
    if (searchText === q) return;
    const timer = setTimeout(() => {
      updateParams({ q: searchText, page: "" });
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  function toggleStatus(status: string) {
    let newStatus;
    if (selectedStatus.includes(status)) {
      newStatus = selectedStatus.filter((s) => s !== status);
    } else {
      newStatus = [...selectedStatus, status];
    }
    updateParams({ status: newStatus.join(","), page: "" });
  }

  function clearFilters() {
    setSearchText("");
    router.replace(pathname);
  }

  // ค้นหา + กรอง
  const keyword = q.toLowerCase();
  const filtered = missions.filter((m) => {
    const matchText =
      m.name.toLowerCase().includes(keyword) ||
      m.drone.toLowerCase().includes(keyword);
    const matchStatus =
      selectedStatus.length === 0 || selectedStatus.includes(m.status);
    return matchText && matchStatus;
  });

  // เรียงตามวันที่บิน
  const sorted = [...filtered].sort((a, b) => {
    const diff = new Date(a.flightAt).getTime() - new Date(b.flightAt).getTime();
    return sort === "asc" ? diff : -diff;
  });

  // แบ่งหน้า
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = sorted.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6 text-gray-900">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">รายการภารกิจ</h1>
          <Link href="/missions/new" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
            + สร้างภารกิจใหม่
          </Link>
        </div>

        {/* ส่วนค้นหาและตัวกรอง */}
        <div className="mb-4 rounded-lg border border-gray-200 bg-white p-4">
          <div className="mb-4 flex flex-wrap gap-4">
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium">ค้นหา</label>
              <input
                type="text"
                placeholder="พิมพ์ชื่อภารกิจหรือชื่อโดรน"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full rounded border border-gray-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">เรียงตามวันที่บิน</label>
              <select
                value={sort}
                onChange={(e) => updateParams({ sort: e.target.value, page: "" })}
                className="rounded border border-gray-300 bg-white px-3 py-2"
              >
                <option value="desc">ใหม่ไปเก่า</option>
                <option value="asc">เก่าไปใหม่</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-2 text-sm font-medium">สถานะ:</span>
            {statusList.map((s) => (
              <label
                key={s.value}
                className="flex cursor-pointer items-center gap-2 rounded border border-gray-300 px-3 py-1 text-sm"
              >
                <input
                  type="checkbox"
                  checked={selectedStatus.includes(s.value)}
                  onChange={() => toggleStatus(s.value)}
                />
                {s.label}
              </label>
            ))}
            <button
              onClick={clearFilters}
              className="ml-auto text-sm text-blue-600 hover:underline"
            >
              ล้างตัวกรอง
            </button>
          </div>
        </div>

        <p className="mb-2 text-sm text-gray-600">พบ {sorted.length} รายการ</p>

        {/* ตาราง */}
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="whitespace-nowrap px-4 py-3">รหัสภารกิจ</th>
                <th className="whitespace-nowrap px-4 py-3">ชื่อภารกิจ</th>
                <th className="whitespace-nowrap px-4 py-3">โดรน</th>
                <th className="whitespace-nowrap px-4 py-3">วันและเวลาที่บิน</th>
                <th className="whitespace-nowrap px-4 py-3">ระยะเวลาบิน</th>
                <th className="whitespace-nowrap px-4 py-3">สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((m) => {
                const status = statusList.find((s) => s.value === m.status)!;
                return (
                  <tr
                    key={m.id}
                    onClick={() => router.push(`/missions/${m.id}`)}
                    className="cursor-pointer border-t border-gray-200 hover:bg-gray-50"
                  >
                    <td className="whitespace-nowrap px-4 py-3 text-gray-500">{m.id}</td>
                    <td className="min-w-48 px-4 py-3 font-medium">
                      <Link href={`/missions/${m.id}`} className="text-blue-700 hover:underline">
                        {m.name}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">{m.drone}</td>
                    <td className="whitespace-nowrap px-4 py-3">{formatDate(m.flightAt)}</td>
                    <td className="whitespace-nowrap px-4 py-3">{formatDuration(m.durationMin)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {pageItems.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    ไม่พบข้อมูล
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* แบ่งหน้า */}
        <div className="mt-4 flex items-center justify-center gap-4">
          <button
            disabled={currentPage <= 1}
            onClick={() => updateParams({ page: String(currentPage - 1) })}
            className="rounded border border-gray-300 bg-white px-4 py-2 text-sm disabled:opacity-40"
          >
            ก่อนหน้า
          </button>
          <span className="text-sm">
            หน้า {currentPage} / {totalPages}
          </span>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => updateParams({ page: String(currentPage + 1) })}
            className="rounded border border-gray-300 bg-white px-4 py-2 text-sm disabled:opacity-40"
          >
            ถัดไป
          </button>
        </div>
      </div>
    </div>
  );
}
