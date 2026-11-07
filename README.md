# UAV Mission

เว็บแอปจัดการภารกิจโดรน (UAV) ทำด้วย Next.js + React + TypeScript + Tailwind CSS

- ดูรายการภารกิจ ค้นหา กรองสถานะ เรียงวันที่ แบ่งหน้า
- ดูรายละเอียดภารกิจ เส้นทางบิน (waypoints) แผนที่ และกราฟ
- สร้างและแก้ไขภารกิจผ่านฟอร์มที่มีการตรวจสอบข้อมูล
- ข้อมูล telemetry แบบเรียลไทม์ (จำลอง) ของภารกิจที่กำลังบิน

ไม่ต้องมีฐานข้อมูล ไม่ต้องตั้งค่า `.env` ข้อมูลทั้งหมดเป็นข้อมูลจำลอง (mock) ในโค้ด

---

## 1. สิ่งที่ต้องติดตั้งก่อน

| โปรแกรม | เวอร์ชัน | วิธีเช็ก |
|---|---|---|
| [Node.js](https://nodejs.org/) | **20.9 ขึ้นไป** (แนะนำ LTS ล่าสุด) | `node -v` |
| npm | มาพร้อม Node.js | `npm -v` |
| [Git](https://git-scm.com/) | เวอร์ชันใดก็ได้ | `git --version` |

ถ้ายังไม่มี Node.js ให้ดาวน์โหลดเวอร์ชัน **LTS** จาก https://nodejs.org แล้วติดตั้งตามค่าเริ่มต้น จากนั้นปิดแล้วเปิด Terminal ใหม่ แล้วลองพิมพ์ `node -v` ต้องได้ตัวเลขเวอร์ชันออกมา เช่น `v24.x.x`

> คำสั่งทั้งหมดด้านล่างใช้ได้ทั้ง Windows (PowerShell / Command Prompt), macOS และ Linux

---

## 2. ดาวน์โหลดโค้ด

```bash
git clone https://github.com/piyatidadev/uav-mission.git
cd uav-mission
```

(ถ้าได้ไฟล์มาเป็น .zip ให้แตกไฟล์ แล้ว `cd` เข้าไปในโฟลเดอร์ที่มีไฟล์ `package.json`)

---

## 3. ติดตั้ง dependencies

```bash
npm install
```

รอจนเสร็จ (ครั้งแรกอาจใช้เวลา 1–3 นาที) จะได้โฟลเดอร์ `node_modules` เพิ่มขึ้นมา

---

## 4. รันโปรเจกต์

### แบบ development (ใช้ตอนตรวจงาน / แก้โค้ด)

```bash
npm run dev
```

เมื่อขึ้นข้อความประมาณ `Ready` / `Local: http://localhost:3000` ให้เปิดเบราว์เซอร์ไปที่

**http://localhost:3000**

ระบบจะพาไปหน้ารายการภารกิจ (`/missions`) ให้อัตโนมัติ

หยุดเซิร์ฟเวอร์: กด `Ctrl + C` ใน Terminal

### แบบ production (ทางเลือก)

```bash
npm run build
npm start
```

แล้วเปิด http://localhost:3000 เหมือนกัน

### ตรวจคุณภาพโค้ด (ทางเลือก)

```bash
npm run lint
```

---

## 5. ลองใช้งาน

| หน้า | URL | สิ่งที่ลองได้ |
|---|---|---|
| รายการภารกิจ | `/missions` | ค้นหาชื่อภารกิจหรือชื่อโดรน, กรองหลายสถานะ, เรียงวันที่, เปลี่ยนหน้า (ค่าที่เลือกจะอยู่ใน URL รีเฟรชแล้วยังอยู่) |
| รายละเอียด | `/missions/MSN-001` | ข้อมูลภารกิจ, ตาราง waypoints, แผนที่, กราฟแบตเตอรี่/ความสูง |
| ไม่พบภารกิจ | `/missions/MSN-999` | หน้า not found |
| สร้างภารกิจ | `/missions/new` | กดบันทึกโดยไม่กรอกเพื่อดู error, กดยกเลิกหลังกรอกแล้วจะถามยืนยัน |
| แก้ไขภารกิจ | `/missions/MSN-001/edit` | ฟอร์มที่มีข้อมูลเดิมกรอกไว้ให้ |
| Telemetry เรียลไทม์ | `/missions/MSN-024` (หรือ `MSN-025`, `MSN-026`) | ภารกิจสถานะ "กำลังบิน" ค่าจะอัปเดตทุก 1.5 วินาที รอประมาณ 20–30 วินาที แบตจะต่ำกว่า 20% และขึ้นแจ้งเตือนสีแดง |

### ดูสถานะต่าง ๆ (loading / error / empty)

ทุกหน้ามีการหน่วงเวลาจำลองการโหลด จึงจะเห็น skeleton สีเทาก่อนข้อมูลขึ้น

| สถานะ | URL |
|---|---|
| Error + ปุ่มลองใหม่ | `/missions?demo=error` หรือ `/missions/MSN-001?demo=error` (ครั้งแรกจะพลาด กด "ลองใหม่" แล้วจะสำเร็จ) |
| ยังไม่มีข้อมูลในระบบ | `/missions?demo=empty` |
| ค้นหาไม่พบ | พิมพ์คำที่ไม่มีอยู่ในช่องค้นหา เช่น `zzz` |

### ทดสอบ responsive

เปิด DevTools ของเบราว์เซอร์ (`F12`) → กดไอคอนมือถือ (Toggle device toolbar) → ตั้งความกว้างเป็น 375, 768 หรือ 1440

---

## 6. หมายเหตุสำคัญ

- **ข้อมูลเก็บในหน่วยความจำ (in-memory)** ภารกิจที่สร้างหรือแก้ไขจะอยู่จนกว่าจะหยุดเซิร์ฟเวอร์ เมื่อรัน `npm run dev` ใหม่ ข้อมูลจะกลับเป็นข้อมูลตัวอย่างเริ่มต้น 34 รายการ
- **แผนที่** ในหน้ารายละเอียดใช้ OpenStreetMap จึงต้องต่ออินเทอร์เน็ตถึงจะแสดง (ส่วนอื่นใช้ได้แบบออฟไลน์)
- ไม่ได้ใช้ UI library ใด ๆ คอมโพเนนต์ Multi-select ที่ใช้กรองสถานะเขียนเองทั้งหมด

---

## 7. ปัญหาที่อาจเจอ

| อาการ | วิธีแก้ |
|---|---|
| `'npm' is not recognized` / `command not found: npm` | ยังไม่ได้ติดตั้ง Node.js หรือยังไม่ได้เปิด Terminal ใหม่หลังติดตั้ง |
| PowerShell ขึ้น `running scripts is disabled on this system` | ใช้ Command Prompt (`cmd`) แทน หรือพิมพ์ `npm.cmd install` / `npm.cmd run dev` |
| `Port 3000 is in use` | ปิดโปรแกรมที่ใช้พอร์ตนั้นอยู่ หรือรันพอร์ตอื่น: `npm run dev -- -p 3001` แล้วเปิด http://localhost:3001 |
| Node.js เวอร์ชันต่ำกว่า 20.9 แล้ว error | อัปเดต Node.js เป็นเวอร์ชัน LTS ล่าสุด |
| ติดตั้งไม่ผ่าน / แปลก ๆ | ลบโฟลเดอร์ `node_modules` และ `.next` แล้วรัน `npm install` ใหม่ |

---

## 8. โครงสร้างโปรเจกต์

```
app/
  missions/
    page.tsx              หน้ารายการภารกิจ
    MissionList.tsx       ตาราง/การ์ด ค้นหา กรอง เรียง แบ่งหน้า
    MissionForm.tsx       ฟอร์มสร้าง/แก้ไข (ใช้ร่วมกัน)
    actions.ts            Server Action บันทึกข้อมูล (ตรวจข้อมูลซ้ำฝั่ง server)
    Skeletons.tsx         skeleton ตอนโหลด
    error.tsx             หน้า error + ปุ่มลองใหม่
    new/page.tsx          หน้าสร้างภารกิจ
    [id]/page.tsx         หน้ารายละเอียด
    [id]/edit/page.tsx    หน้าแก้ไข
    [id]/LiveTelemetry.tsx  แผง telemetry เรียลไทม์
    [id]/LineChart.tsx    กราฟเส้น (SVG เขียนเอง)
    [id]/not-found.tsx    หน้าไม่พบภารกิจ
  components/
    MultiSelect.tsx       Multi-select dropdown เขียนเอง (รองรับคีย์บอร์ด)
  api/missions/route.ts   API ดึงรายการภารกิจ
lib/
  missions.ts             type, ข้อมูลตัวอย่าง, สร้าง waypoints/telemetry จำลอง
  mission-store.ts        ที่เก็บข้อมูลในหน่วยความจำ
  mission-form.ts         กฎการตรวจสอบข้อมูลในฟอร์ม
```

### งานแต่ละข้อ

| ข้อ | หัวข้อ | Branch |
|---|---|---|
| 1 | Mission List | `dev` |
| 2 | Mission Detail | `dev` |
| 3 | ฟอร์มสร้าง/แก้ไข + validation | `form` |
| 4 | Telemetry เรียลไทม์ | `Telemetry` |
| 5 | Loading / Error / Empty + Responsive | `stats` |
| 6 | Multi-select เขียนเอง | `Component` |

branch `dev` มีงานครบทุกข้อ
