"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { missions, MissionStatus } from "@/lib/missions";

const PAGE_SIZE = 10;

const statusList: { value: MissionStatus; label: string; color: string }[] = [
  { value: "planned", label: "วางแผนไว้", color: "blue" },
  { value: "in-progress", label: "กำลังบิน", color: "orange" },
  { value: "completed", label: "เสร็จสิ้น", color: "green" },
  { value: "failed", label: "ล้มเหลว", color: "red" },
];

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
    <div style={{ padding: 20 }}>
      <h1>รายการภารกิจ</h1>

      <div style={{ marginBottom: 10 }}>
        <input
          type="text"
          placeholder="ค้นหาชื่อภารกิจหรือชื่อโดรน"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ border: "1px solid gray", padding: 4, width: 300 }}
        />
      </div>

      <div style={{ marginBottom: 10 }}>
        สถานะ:{" "}
        {statusList.map((s) => (
          <label key={s.value} style={{ marginRight: 10 }}>
            <input
              type="checkbox"
              checked={selectedStatus.includes(s.value)}
              onChange={() => toggleStatus(s.value)}
            />{" "}
            {s.label}
          </label>
        ))}
      </div>

      <div style={{ marginBottom: 10 }}>
        เรียงตามวันที่บิน:{" "}
        <select
          value={sort}
          onChange={(e) => updateParams({ sort: e.target.value, page: "" })}
          style={{ border: "1px solid gray" }}
        >
          <option value="desc">ใหม่ไปเก่า</option>
          <option value="asc">เก่าไปใหม่</option>
        </select>
      </div>

      <p>พบ {sorted.length} รายการ</p>

      <table border={1} cellPadding={6} style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>รหัสภารกิจ</th>
            <th>ชื่อภารกิจ</th>
            <th>โดรน</th>
            <th>วันและเวลาที่บิน</th>
            <th>ระยะเวลาบิน</th>
            <th>สถานะ</th>
          </tr>
        </thead>
        <tbody>
          {pageItems.map((m) => {
            const status = statusList.find((s) => s.value === m.status)!;
            return (
              <tr key={m.id}>
                <td>{m.id}</td>
                <td>{m.name}</td>
                <td>{m.drone}</td>
                <td>{formatDate(m.flightAt)}</td>
                <td>{formatDuration(m.durationMin)}</td>
                <td>
                  <span
                    style={{
                      backgroundColor: status.color,
                      color: "white",
                      padding: "2px 8px",
                      borderRadius: 4,
                    }}
                  >
                    {status.label}
                  </span>
                </td>
              </tr>
            );
          })}
          {pageItems.length === 0 && (
            <tr>
              <td colSpan={6}>ไม่พบข้อมูล</td>
            </tr>
          )}
        </tbody>
      </table>

      <div style={{ marginTop: 10 }}>
        <button style={{ border: "1px solid gray", padding: "2px 8px" }}
          disabled={currentPage <= 1}
          onClick={() => updateParams({ page: String(currentPage - 1) })}
        >
          ก่อนหน้า
        </button>
        <span style={{ margin: "0 10px" }}>
          หน้า {currentPage} / {totalPages}
        </span>
        <button style={{ border: "1px solid gray", padding: "2px 8px" }}
          disabled={currentPage >= totalPages}
          onClick={() => updateParams({ page: String(currentPage + 1) })}
        >
          ถัดไป
        </button>
      </div>
    </div>
  );
}
