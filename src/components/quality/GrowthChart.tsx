/**
 * GrowthChart — กราฟเทียบน้ำหนักจริง vs น้ำหนักมาตรฐาน (Gompertz)
 *
 * แสดง Line Chart ด้วย recharts:
 * - เส้นมาตรฐาน (เขียว) = น้ำหนักที่ควรเป็นตามโมเดล Gompertz
 * - แถบช่วงปกติ (เขียวอ่อน) = ±20% ของมาตรฐาน
 * - จุดข้อมูลจริง (น้ำเงิน) = น้ำหนักที่เกษตรกรบันทึกจริง
 */
"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Scatter,
} from "recharts";

interface DataPoint {
  day: number;
  standard: number;
  upperBound: number;
  lowerBound: number;
  actual?: number;
}

interface Props {
  data: DataPoint[];
}

/**
 * Custom Tooltip: แสดงรายละเอียด ณ วันที่ hover
 */
function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { dataKey: string; value: number; color: string }[];
  label?: number;
}) {
  if (!active || !payload) return null;

  const standard = payload.find((p) => p.dataKey === "standard");
  const actual = payload.find((p) => p.dataKey === "actual");

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 px-4 py-3 text-sm">
      <p className="font-bold text-gray-700 mb-2">วันที่ {label} ของการเลี้ยง</p>
      {standard && (
        <p className="text-[#22c55e] font-semibold">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#22c55e] mr-2" />
          ควรได้: {standard.value.toFixed(1)} กรัม
        </p>
      )}
      {actual && actual.value != null && (
        <p className="text-[#3b82f6] font-semibold mt-1">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#3b82f6] mr-2" />
          ได้จริง: {actual.value.toFixed(1)} กรัม
        </p>
      )}
    </div>
  );
}

export default function GrowthChart({ data }: Props) {
  if (!data || data.length === 0) return null;

  // สุ่มเฉพาะจุดที่มีข้อมูลจริง เพื่อแสดงเป็น Scatter
  const actualPoints = data.filter((d) => d.actual != null);

  // กำหนดช่วง Y-axis ที่เหมาะสม
  const maxWeight = Math.max(
    ...data.map((d) => d.upperBound),
    ...actualPoints.map((d) => d.actual ?? 0),
  );
  const yMax = Math.ceil(maxWeight / 50) * 50 + 50;

  // ลดจำนวนจุดบน X-axis ถ้ามีข้อมูลเยอะเกิน
  const totalDays = data[data.length - 1]?.day ?? 0;
  const xInterval = totalDays <= 30 ? 5 : totalDays <= 90 ? 10 : totalDays <= 180 ? 15 : 30;

  // สร้าง data ที่มี band สำหรับ Area
  const chartData = data
    .filter((_, i) => i % Math.max(1, Math.floor(data.length / 300)) === 0 || data[i].actual != null)
    .map((d) => ({
      day: d.day,
      standard: Math.round(d.standard * 10) / 10,
      band: [Math.round(d.lowerBound * 10) / 10, Math.round(d.upperBound * 10) / 10] as [number, number],
      actual: d.actual != null ? Math.round(d.actual * 10) / 10 : undefined,
    }));

  return (
    <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-5">
      <div className="flex items-center gap-2.5 mb-2">
        <h3 className="text-base font-bold text-[#093832]">กราฟเปรียบเทียบน้ำหนักปลา</h3>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 mb-4 text-xs font-semibold text-gray-500">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 bg-[#22c55e] rounded-full" />
          <span>ค่ามาตรฐาน</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 bg-[#22c55e]/15 rounded-sm border border-[#22c55e]/30" />
          <span>ช่วงปกติ (±20%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-[#3b82f6] rounded-full" />
          <span>น้ำหนักจริง</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: -5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />

          <XAxis
            dataKey="day"
            tick={{ fontSize: 12, fill: "#6b7280" }}
            tickLine={false}
            axisLine={{ stroke: "#e5e7eb" }}
            interval={Math.max(0, Math.floor(chartData.length / (totalDays / xInterval)) - 1)}
            label={{ value: "วัน", position: "insideBottomRight", offset: -5, fontSize: 12, fill: "#6b7280" }}
          />

          <YAxis
            domain={[0, yMax]}
            tick={{ fontSize: 12, fill: "#6b7280" }}
            tickLine={false}
            axisLine={{ stroke: "#e5e7eb" }}
            label={{ value: "กรัม", angle: -90, position: "insideLeft", offset: 15, fontSize: 12, fill: "#6b7280" }}
          />

          <Tooltip content={<CustomTooltip />} />

          {/* แถบช่วงปกติ (±20%) */}
          <Area
            dataKey="band"
            fill="#22c55e"
            fillOpacity={0.1}
            stroke="none"
            type="monotone"
            isAnimationActive={false}
          />

          {/* เส้นมาตรฐาน Gompertz */}
          <Line
            dataKey="standard"
            stroke="#22c55e"
            strokeWidth={2}
            dot={false}
            type="monotone"
            name="มาตรฐาน"
            isAnimationActive={false}
          />

          {/* จุดข้อมูลจริงจากเกษตรกร */}
          <Scatter
            dataKey="actual"
            fill="#3b82f6"
            name="ข้อมูลจริง"
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>

      <p className="text-[11px] text-gray-400 text-center mt-3 leading-relaxed">
        💡 เส้นมาตรฐานคำนวณจากโมเดลการเจริญเติบโต (Gompertz)
      </p>
    </div>
  );
}
