"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { droneList } from "@/lib/missions";
import {
  FormErrors,
  MissionFormData,
  NOTE_MAX_LENGTH,
  validateMission,
} from "@/lib/mission-form";
import { saveMission } from "./actions";

type Props = {
  missionId?: string; // ไม่มี = สร้างใหม่
  initialData: MissionFormData;
};

const inputClass = "w-full rounded border px-3 py-2";

function borderColor(error?: string) {
  return error ? "border-red-500" : "border-gray-300";
}

function ErrorText({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-sm text-red-600">{message}</p>;
}

export default function MissionForm({ missionId, initialData }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<MissionFormData>(initialData);
  const [errors, setErrors] = useState<FormErrors>({});
  // หลังกดบันทึกครั้งแรก จะตรวจสอบใหม่ทุกครั้งที่แก้ข้อมูล
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  // ใช้ ref กันกดซ้ำ เพราะ state จะยังไม่อัปเดตถ้ากดเร็ว ๆ ติดกันก่อน React render ใหม่
  const savingRef = useRef(false);

  const isEdit = Boolean(missionId);
  const cancelHref = isEdit ? `/missions/${missionId}` : "/missions";
  const isDirty = JSON.stringify(form) !== JSON.stringify(initialData);

  // เตือนเมื่อปิดแท็บ/รีเฟรช ขณะที่มีข้อมูลที่ยังไม่บันทึก
  useEffect(() => {
    if (!isDirty || saving) return;
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty, saving]);

  function changeForm(next: MissionFormData) {
    setForm(next);
    if (submitted) setErrors(validateMission(next));
  }

  function updateField(field: "name" | "drone" | "startAt" | "endAt" | "note", value: string) {
    changeForm({ ...form, [field]: value });
  }

  function updateWaypoint(index: number, field: "lat" | "lng", value: string) {
    const waypoints = form.waypoints.map((w, i) => (i === index ? { ...w, [field]: value } : w));
    changeForm({ ...form, waypoints });
  }

  function addWaypoint() {
    changeForm({ ...form, waypoints: [...form.waypoints, { lat: "", lng: "" }] });
  }

  function removeWaypoint(index: number) {
    changeForm({ ...form, waypoints: form.waypoints.filter((_, i) => i !== index) });
  }

  function handleCancel() {
    if (isDirty && !confirm("ข้อมูลที่กรอกไว้จะหายไป ต้องการออกจากหน้านี้หรือไม่?")) {
      return;
    }
    router.push(cancelHref);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (savingRef.current) return; // กันกดซ้ำ

    setSubmitted(true);
    const newErrors = validateMission(form);
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      // เลื่อนไปที่ช่องแรกที่ผิด
      setTimeout(() => {
        document.querySelector("[aria-invalid=true]")?.scrollIntoView({ block: "center" });
      }, 0);
      return;
    }

    savingRef.current = true;
    setSaving(true);
    try {
      const result = await saveMission(missionId ?? null, form);
      if (result.errors) {
        setErrors(result.errors);
        savingRef.current = false;
        setSaving(false);
        return;
      }
      // บันทึกสำเร็จ ไปหน้ารายละเอียด (ไม่ต้อง setSaving(false) เพราะกำลังเปลี่ยนหน้า)
      router.push(`/missions/${result.id}`);
    } catch {
      setErrors({ form: "บันทึกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง" });
      savingRef.current = false;
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 text-gray-900">
      <div className="mx-auto max-w-3xl">
        <button type="button" onClick={handleCancel} className="text-sm text-blue-600 hover:underline">
          ← กลับ
        </button>
        <h1 className="mb-6 mt-3 text-2xl font-bold">
          {isEdit ? `แก้ไขภารกิจ ${missionId}` : "สร้างภารกิจใหม่"}
        </h1>

        <form onSubmit={handleSubmit} noValidate className="space-y-6 rounded-lg border border-gray-200 bg-white p-6">
          {errors.form && (
            <p className="rounded bg-red-50 p-3 text-sm text-red-700">{errors.form}</p>
          )}

          {/* ชื่อภารกิจ */}
          <div>
            <label htmlFor="name" className="mb-1 block font-medium">
              ชื่อภารกิจ <span className="text-red-600">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              aria-invalid={Boolean(errors.name)}
              className={`${inputClass} ${borderColor(errors.name)}`}
            />
            <ErrorText message={errors.name} />
          </div>

          {/* โดรน */}
          <div>
            <label htmlFor="drone" className="mb-1 block font-medium">
              โดรนที่ใช้ <span className="text-red-600">*</span>
            </label>
            <select
              id="drone"
              value={form.drone}
              onChange={(e) => updateField("drone", e.target.value)}
              aria-invalid={Boolean(errors.drone)}
              className={`${inputClass} bg-white ${borderColor(errors.drone)}`}
            >
              <option value="">-- เลือกโดรน --</option>
              {droneList.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <ErrorText message={errors.drone} />
          </div>

          {/* วันเวลา */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="startAt" className="mb-1 block font-medium">
                วันและเวลาเริ่มบิน <span className="text-red-600">*</span>
              </label>
              <input
                id="startAt"
                type="datetime-local"
                value={form.startAt}
                onChange={(e) => updateField("startAt", e.target.value)}
                aria-invalid={Boolean(errors.startAt)}
                className={`${inputClass} ${borderColor(errors.startAt)}`}
              />
              <ErrorText message={errors.startAt} />
            </div>
            <div>
              <label htmlFor="endAt" className="mb-1 block font-medium">
                วันและเวลาสิ้นสุด <span className="text-red-600">*</span>
              </label>
              <input
                id="endAt"
                type="datetime-local"
                value={form.endAt}
                onChange={(e) => updateField("endAt", e.target.value)}
                aria-invalid={Boolean(errors.endAt)}
                className={`${inputClass} ${borderColor(errors.endAt)}`}
              />
              <ErrorText message={errors.endAt} />
            </div>
          </div>

          {/* Waypoints */}
          <div>
            <p className="mb-1 font-medium">
              พิกัด Waypoints <span className="text-red-600">*</span>
              <span className="ml-2 text-sm font-normal text-gray-500">(อย่างน้อย 2 จุด)</span>
            </p>
            <div className="space-y-3">
              {form.waypoints.map((w, i) => {
                const latError = errors[`waypoints.${i}.lat`];
                const lngError = errors[`waypoints.${i}.lng`];
                return (
                  <div key={i} className="flex items-start gap-3">
                    <span className="w-8 pt-2 text-gray-500">{i + 1}.</span>
                    <div className="flex-1">
                      <input
                        type="text"
                        inputMode="decimal"
                        placeholder="Latitude (-90 ถึง 90)"
                        aria-label={`Latitude จุดที่ ${i + 1}`}
                        value={w.lat}
                        onChange={(e) => updateWaypoint(i, "lat", e.target.value)}
                        aria-invalid={Boolean(latError)}
                        className={`${inputClass} ${borderColor(latError)}`}
                      />
                      <ErrorText message={latError} />
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        inputMode="decimal"
                        placeholder="Longitude (-180 ถึง 180)"
                        aria-label={`Longitude จุดที่ ${i + 1}`}
                        value={w.lng}
                        onChange={(e) => updateWaypoint(i, "lng", e.target.value)}
                        aria-invalid={Boolean(lngError)}
                        className={`${inputClass} ${borderColor(lngError)}`}
                      />
                      <ErrorText message={lngError} />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeWaypoint(i)}
                      className="rounded border border-gray-300 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      ลบ
                    </button>
                  </div>
                );
              })}
            </div>
            <ErrorText message={errors.waypoints} />
            <button
              type="button"
              onClick={addWaypoint}
              className="mt-3 rounded border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
            >
              + เพิ่มจุด
            </button>
          </div>

          {/* หมายเหตุ */}
          <div>
            <label htmlFor="note" className="mb-1 block font-medium">
              หมายเหตุ <span className="text-sm font-normal text-gray-500">(ไม่บังคับ)</span>
            </label>
            <textarea
              id="note"
              rows={4}
              value={form.note}
              onChange={(e) => updateField("note", e.target.value)}
              aria-invalid={Boolean(errors.note)}
              className={`${inputClass} ${borderColor(errors.note)}`}
            />
            <div className="flex justify-between">
              <ErrorText message={errors.note} />
              <p
                className={`ml-auto mt-1 text-sm ${
                  form.note.length > NOTE_MAX_LENGTH ? "text-red-600" : "text-gray-500"
                }`}
              >
                {form.note.length} / {NOTE_MAX_LENGTH}
              </p>
            </div>
          </div>

          {/* ปุ่ม */}
          <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="rounded border border-gray-300 px-4 py-2 hover:bg-gray-50 disabled:opacity-50"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "กำลังบันทึก..." : "บันทึก"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
