// กราฟเส้นแบบง่าย วาดด้วย SVG เอง ไม่ใช้ library

type Point = { x: number; y: number };

type Props = {
  title: string;
  data: Point[];
  yMax: number;
  yUnit: string;
  color: string;
};

const WIDTH = 600;
const HEIGHT = 240;
const PADDING_LEFT = 50;
const PADDING_RIGHT = 20;
const PADDING_TOP = 20;
const PADDING_BOTTOM = 40;

export default function LineChart({ title, data, yMax, yUnit, color }: Props) {
  const chartWidth = WIDTH - PADDING_LEFT - PADDING_RIGHT;
  const chartHeight = HEIGHT - PADDING_TOP - PADDING_BOTTOM;
  const xMax = data[data.length - 1].x || 1;

  // แปลงค่าข้อมูลเป็นตำแหน่งบน SVG
  function toX(x: number) {
    return PADDING_LEFT + (x / xMax) * chartWidth;
  }
  function toY(y: number) {
    return PADDING_TOP + chartHeight - (y / yMax) * chartHeight;
  }

  const linePoints = data.map((p) => `${toX(p.x)},${toY(p.y)}`).join(" ");
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((r) => Math.round(r * yMax));
  // ถ้าจุดเยอะเกินไป แสดงป้ายแกน X แค่บางจุด
  const xLabelStep = Math.ceil(data.length / 8);

  return (
    <div>
      <h3 className="mb-2 font-medium">{title}</h3>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full">
        {/* เส้นตารางและป้ายแกน Y */}
        {yTicks.map((tick) => (
          <g key={tick}>
            <line
              x1={PADDING_LEFT}
              x2={WIDTH - PADDING_RIGHT}
              y1={toY(tick)}
              y2={toY(tick)}
              stroke="#e5e7eb"
            />
            <text x={PADDING_LEFT - 8} y={toY(tick) + 4} textAnchor="end" fontSize="12" fill="#6b7280">
              {tick}
            </text>
          </g>
        ))}

        {/* ป้ายแกน X (นาที) */}
        {data.map((p, i) =>
          // ป้ายจุดสุดท้ายแสดงเสมอ ส่วนป้ายอื่นที่อยู่ใกล้จุดสุดท้ายเกินไปให้ข้าม
          i === data.length - 1 || (i % xLabelStep === 0 && data.length - 1 - i >= xLabelStep / 2) ? (
            <text key={p.x} x={toX(p.x)} y={HEIGHT - PADDING_BOTTOM + 18} textAnchor="middle" fontSize="12" fill="#6b7280">
              {p.x}
            </text>
          ) : null
        )}
        <text x={PADDING_LEFT + chartWidth / 2} y={HEIGHT - 4} textAnchor="middle" fontSize="12" fill="#6b7280">
          เวลา (นาที)
        </text>
        <text x={12} y={PADDING_TOP - 6} fontSize="12" fill="#6b7280">
          {yUnit}
        </text>

        {/* เส้นกราฟและจุด */}
        <polyline points={linePoints} fill="none" stroke={color} strokeWidth="2.5" />
        {data.map((p) => (
          <circle key={p.x} cx={toX(p.x)} cy={toY(p.y)} r="3" fill={color}>
            <title>{`นาทีที่ ${p.x}: ${p.y} ${yUnit}`}</title>
          </circle>
        ))}
      </svg>
    </div>
  );
}
