export type MissionStatus = "planned" | "in-progress" | "completed" | "failed";

export type Mission = {
  id: string;
  name: string;
  drone: string;
  flightAt: string;
  durationMin: number;
  status: MissionStatus;
};

export const missions: Mission[] = [
  { id: "MSN-001", name: "สำรวจแปลงนาข้าว สุพรรณบุรี", drone: "AgriDrone T40", flightAt: "2026-09-02T07:30:00+07:00", durationMin: 42, status: "completed" },
  { id: "MSN-002", name: "ตรวจสอบเสาส่งไฟฟ้าแรงสูง สาย 3", drone: "Matrice 350 RTK", flightAt: "2026-09-05T09:00:00+07:00", durationMin: 75, status: "completed" },
  { id: "MSN-003", name: "ทำแผนที่ 3 มิติ นิคมอุตสาหกรรมอมตะ", drone: "Mavic 3 Enterprise", flightAt: "2026-09-08T10:15:00+07:00", durationMin: 58, status: "completed" },
  { id: "MSN-004", name: "ลาดตระเวนชายฝั่ง ระยอง", drone: "Sky Hawk-01", flightAt: "2026-09-11T06:00:00+07:00", durationMin: 95, status: "failed" },
  { id: "MSN-005", name: "พ่นสารชีวภัณฑ์ สวนทุเรียน จันทบุรี", drone: "AgriDrone T40", flightAt: "2026-09-14T06:45:00+07:00", durationMin: 35, status: "completed" },
  { id: "MSN-006", name: "ตรวจรอยร้าวสะพานพระราม 8", drone: "Matrice 350 RTK", flightAt: "2026-09-17T13:30:00+07:00", durationMin: 64, status: "completed" },
  { id: "MSN-007", name: "สำรวจพื้นที่ไฟป่า ดอยสุเทพ", drone: "Falcon X2", flightAt: "2026-09-20T15:00:00+07:00", durationMin: 110, status: "completed" },
  { id: "MSN-008", name: "ถ่ายภาพมุมสูงโครงการคอนโด บางนา", drone: "Mavic 3 Enterprise", flightAt: "2026-09-23T16:20:00+07:00", durationMin: 25, status: "completed" },
  { id: "MSN-009", name: "นับจำนวนปศุสัตว์ ฟาร์มโคนม มวกเหล็ก", drone: "Phantom Scout", flightAt: "2026-09-26T08:10:00+07:00", durationMin: 38, status: "failed" },
  { id: "MSN-010", name: "ตรวจแผงโซลาร์ฟาร์ม ลพบุรี", drone: "Matrice 350 RTK", flightAt: "2026-09-29T11:00:00+07:00", durationMin: 82, status: "completed" },
  { id: "MSN-011", name: "สำรวจแปลงอ้อย กาญจนบุรี", drone: "AgriDrone T40", flightAt: "2026-10-02T07:00:00+07:00", durationMin: 47, status: "completed" },
  { id: "MSN-012", name: "ค้นหาผู้สูญหาย อุทยานเขาใหญ่", drone: "Falcon X2", flightAt: "2026-10-04T17:40:00+07:00", durationMin: 130, status: "completed" },
  { id: "MSN-013", name: "ตรวจสอบท่อส่งก๊าซ ชลบุรี", drone: "Sky Hawk-01", flightAt: "2026-10-07T09:30:00+07:00", durationMin: 120, status: "completed" },
  { id: "MSN-014", name: "ทำแผนที่น้ำท่วม อยุธยา", drone: "Falcon X2", flightAt: "2026-10-10T08:00:00+07:00", durationMin: 98, status: "failed" },
  { id: "MSN-015", name: "ตรวจหลังคาโรงงาน แหลมฉบัง", drone: "Mavic 3 Enterprise", flightAt: "2026-10-13T14:00:00+07:00", durationMin: 33, status: "completed" },
  { id: "MSN-016", name: "สำรวจป่าชายเลน สมุทรสงคราม", drone: "Phantom Scout", flightAt: "2026-10-16T07:20:00+07:00", durationMin: 55, status: "completed" },
  { id: "MSN-017", name: "ตรวจสอบเสาส่งไฟฟ้าแรงสูง สาย 7", drone: "Matrice 350 RTK", flightAt: "2026-10-19T10:00:00+07:00", durationMin: 70, status: "completed" },
  { id: "MSN-018", name: "พ่นปุ๋ยแปลงข้าวโพด เพชรบูรณ์", drone: "AgriDrone T40", flightAt: "2026-10-22T06:30:00+07:00", durationMin: 40, status: "completed" },
  { id: "MSN-019", name: "ลาดตระเวนชายแดน ตาก", drone: "Sky Hawk-01", flightAt: "2026-10-25T05:45:00+07:00", durationMin: 145, status: "failed" },
  { id: "MSN-020", name: "ถ่ายทำสารคดี เกาะพีพี", drone: "Mavic 3 Enterprise", flightAt: "2026-10-28T16:00:00+07:00", durationMin: 28, status: "completed" },
  { id: "MSN-021", name: "สำรวจเขื่อนศรีนครินทร์", drone: "Falcon X2", flightAt: "2026-10-31T09:15:00+07:00", durationMin: 88, status: "completed" },
  { id: "MSN-022", name: "ตรวจกังหันลม ห้วยบง", drone: "Matrice 350 RTK", flightAt: "2026-11-03T08:30:00+07:00", durationMin: 66, status: "completed" },
  { id: "MSN-023", name: "นับต้นปาล์มน้ำมัน กระบี่", drone: "Phantom Scout", flightAt: "2026-11-05T07:50:00+07:00", durationMin: 52, status: "completed" },
  { id: "MSN-024", name: "ลาดตระเวนชายฝั่ง ระยอง", drone: "Sky Hawk-01", flightAt: "2026-11-07T06:00:00+07:00", durationMin: 61, status: "in-progress" },
  { id: "MSN-025", name: "สำรวจแปลงนาข้าว สุพรรณบุรี รอบ 2", drone: "AgriDrone T40", flightAt: "2026-11-07T08:15:00+07:00", durationMin: 22, status: "in-progress" },
  { id: "MSN-026", name: "ตรวจรอยร้าวสะพานพระราม 9", drone: "Matrice 350 RTK", flightAt: "2026-11-07T09:40:00+07:00", durationMin: 12, status: "in-progress" },
  { id: "MSN-027", name: "ทำแผนที่ 3 มิติ ชุมชนคลองเตย", drone: "Mavic 3 Enterprise", flightAt: "2026-11-10T10:00:00+07:00", durationMin: 50, status: "planned" },
  { id: "MSN-028", name: "ตรวจแผงโซลาร์ฟาร์ม นครราชสีมา", drone: "Matrice 350 RTK", flightAt: "2026-11-12T09:00:00+07:00", durationMin: 90, status: "planned" },
  { id: "MSN-029", name: "สำรวจพื้นที่ไฟป่า ดอยอินทนนท์", drone: "Falcon X2", flightAt: "2026-11-15T15:30:00+07:00", durationMin: 120, status: "planned" },
  { id: "MSN-030", name: "พ่นสารชีวภัณฑ์ สวนลำไย ลำพูน", drone: "AgriDrone T40", flightAt: "2026-11-18T06:30:00+07:00", durationMin: 45, status: "planned" },
  { id: "MSN-031", name: "ตรวจสอบท่อส่งก๊าซ ระยอง", drone: "Sky Hawk-01", flightAt: "2026-11-21T08:00:00+07:00", durationMin: 115, status: "planned" },
  { id: "MSN-032", name: "สำรวจแนวปะการัง เกาะเต่า", drone: "Phantom Scout", flightAt: "2026-11-24T07:30:00+07:00", durationMin: 40, status: "planned" },
  { id: "MSN-033", name: "ถ่ายภาพมุมสูงงานลอยกระทง สุโขทัย", drone: "Mavic 3 Enterprise", flightAt: "2026-11-24T19:00:00+07:00", durationMin: 30, status: "planned" },
  { id: "MSN-034", name: "ทำแผนที่ภูมิประเทศ น่าน", drone: "Falcon X2", flightAt: "2026-11-28T08:45:00+07:00", durationMin: 105, status: "planned" },
];

