"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import MultiSelect from "@/app/components/MultiSelect";
import { Mission, statusList } from "@/lib/missions";
import { ListRowsSkeleton } from "./Skeletons";

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

function StatusBadge({ status }: { status: Mission["status"] }) {
  const s = statusList.find((item) => item.value === status)!;
  return (
    <span className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${s.className}`}>
      {s.label}
    </span>
  );
}

export default function MissionList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // อ่านค่าจาก URL
  const q = searchParams.get("q") || "";
  const statusParam = searchParams.get("status");
  const selectedStatus = statusParam ? statusParam.split(",") : [];
  const sort = searchParams.get("sort") === "asc" ? "asc" : "desc";
  const page = Number(searchParams.get("page")) || 1;
  const demo = searchParams.get("demo"); // ?demo=error หรือ ?demo=empty สำหรับดูสถานะต่าง ๆ

  const [searchText, setSearchText] = useState(q);

  // สถานะการโหลดข้อมูล
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "error" | "success">("loading");
  const [reloadCount, setReloadCount] = useState(0);

  // โหลดข้อมูลจาก API (โหลดใหม่เมื่อกด "ลองใหม่")
  useEffect(() => {
    let ignore = false; // กันกรณีออกจากหน้าไปก่อนโหลดเสร็จ

    fetch(`/api/missions${demo ? `?demo=${demo}&attempt=${reloadCount}` : ""}`)
      .then((res) => {
        if (!res.ok) throw new Error("load failed");
        return res.json();
      })
      .then((data: Mission[]) => {
        if (ignore) return;
        setMissions(data);
        setLoadState("success");
      })
      .catch(() => {
        if (!ignore) setLoadState("error");
      });

    return () => {
      ignore = true;
    };
  }, [demo, reloadCount]);

  function retry() {
    setLoadState("loading");
    setReloadCount((c) => c + 1);
  }

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

  function clearFilters() {
    setSearchText("");
    updateParams({ q: "", status: "", page: "" });
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

  const hasNoData = loadState === "success" && missions.length === 0;

  return (
    <div className="min-h-screen bg-gray-50 p-4 text-gray-900 sm:p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold">รายการภารกิจ</h1>
          <Link href="/missions/new" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
            + สร้างภารกิจใหม่
          </Link>
        </div>

        {/* ส่วนค้นหาและตัวกรอง (ซ่อนถ้ายังไม่มีข้อมูลในระบบเลย เพราะไม่มีอะไรให้ค้น) */}
        {!hasNoData && (
          <div className="mb-4 rounded-lg border border-gray-200 bg-white p-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_1fr_auto]">
              <div>
                <label htmlFor="search" className="mb-1 block text-sm font-medium">ค้นหา</label>
                <input
                  id="search"
                  type="text"
                  placeholder="พิมพ์ชื่อภารกิจหรือชื่อโดรน"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2"
                />
              </div>
              <MultiSelect
                label="สถานะ"
                placeholder="ทุกสถานะ"
                options={statusList}
                selected={selectedStatus}
                onChange={(values) => {
                  // เรียงตามลำดับใน statusList เพื่อให้ URL เหมือนเดิมไม่ว่าจะเลือกอะไรก่อน
                  const ordered = statusList.map((s) => s.value).filter((v) => values.includes(v));
                  updateParams({ status: ordered.join(","), page: "" });
                }}
              />
              <div>
                <label htmlFor="sort" className="mb-1 block text-sm font-medium">เรียงตามวันที่บิน</label>
                <select
                  id="sort"
                  value={sort}
                  onChange={(e) => updateParams({ sort: e.target.value, page: "" })}
                  className="w-full rounded border border-gray-300 bg-white px-3 py-2"
                >
                  <option value="desc">ใหม่ไปเก่า</option>
                  <option value="asc">เก่าไปใหม่</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* 1) กำลังโหลด */}
        {loadState === "loading" && (
          <div aria-busy="true">
            <p className="sr-only">กำลังโหลดรายการภารกิจ</p>
            <ListRowsSkeleton />
          </div>
        )}

        {/* 2) โหลดไม่สำเร็จ */}
        {loadState === "error" && (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-8 text-center">
            <p className="text-lg font-semibold text-red-700">โหลดรายการภารกิจไม่สำเร็จ</p>
            <p className="mt-1 text-sm text-red-600">อาจเกิดจากปัญหาการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง</p>
            <button
              onClick={retry}
              className="mt-4 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
            >
              ลองใหม่
            </button>
          </div>
        )}

        {/* 3a) ยังไม่มีข้อมูลในระบบเลย -> ชวนสร้างภารกิจแรก */}
        {hasNoData && (
          <div className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center">
            <p className="text-lg font-semibold">ยังไม่มีภารกิจในระบบ</p>
            <p className="mt-1 text-sm text-gray-500">เริ่มต้นด้วยการสร้างภารกิจแรกของคุณ</p>
            <Link
              href="/missions/new"
              className="mt-4 inline-block rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              + สร้างภารกิจแรก
            </Link>
          </div>
        )}

        {/* 3b) มีข้อมูล แต่ค้นหา/กรองแล้วไม่เจอ -> ชวนล้างตัวกรอง */}
        {loadState === "success" && !hasNoData && sorted.length === 0 && (
          <div className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center">
            <p className="text-lg font-semibold">ไม่พบภารกิจที่ตรงกับเงื่อนไข</p>
            <p className="mt-1 break-words text-sm text-gray-500">
              {q && <>คำค้นหา &quot;{q}&quot; </>}
              ลองเปลี่ยนคำค้นหาหรือตัวกรองสถานะ
            </p>
            <button
              onClick={clearFilters}
              className="mt-4 rounded border border-gray-300 px-4 py-2 hover:bg-gray-50"
            >
              ล้างตัวกรอง
            </button>
          </div>
        )}

        {/* 4) มีข้อมูล */}
        {loadState === "success" && sorted.length > 0 && (
          <>
            <p className="mb-2 text-sm text-gray-600">พบ {sorted.length} รายการ</p>

            {/* จอใหญ่ (tablet ขึ้นไป): ตาราง */}
            <div className="hidden overflow-hidden rounded-lg border border-gray-200 bg-white md:block">
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
                  {pageItems.map((m) => (
                    <tr
                      key={m.id}
                      onClick={() => router.push(`/missions/${m.id}`)}
                      className="cursor-pointer border-t border-gray-200 hover:bg-gray-50"
                    >
                      <td className="whitespace-nowrap px-4 py-3 text-gray-500">{m.id}</td>
                      <td className="px-4 py-3 font-medium">
                        <Link href={`/missions/${m.id}`} className="text-blue-700 hover:underline">
                          {m.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3">{m.drone}</td>
                      <td className="px-4 py-3">{formatDate(m.flightAt)}</td>
                      <td className="whitespace-nowrap px-4 py-3">{formatDuration(m.durationMin)}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={m.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* จอมือถือ: การ์ด */}
            <ul className="space-y-3 md:hidden">
              {pageItems.map((m) => (
                <li key={m.id}>
                  <Link
                    href={`/missions/${m.id}`}
                    className="block rounded-lg border border-gray-200 bg-white p-4 hover:bg-gray-50"
                  >
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm text-gray-500">{m.id}</p>
                        <p className="break-words font-medium text-blue-700">{m.name}</p>
                      </div>
                      <StatusBadge status={m.status} />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-gray-500">โดรน</p>
                        <p>{m.drone}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">ระยะเวลาบิน</p>
                        <p>{formatDuration(m.durationMin)}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-gray-500">วันและเวลาที่บิน</p>
                        <p>{formatDate(m.flightAt)}</p>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>

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
          </>
        )}
      </div>
    </div>
  );
}
