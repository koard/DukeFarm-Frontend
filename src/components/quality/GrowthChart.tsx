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
  Legend,
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
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-3 text-xs">
      <p className="font-bold text-gray-700 mb-1.5">วันที่ {label}</p>
      {standard && (
        <p className="text-[#22c55e]">
          <span className="inline-block w-2 h-2 rounded-full bg-[#22c55e] mr-1.5" />
          มาตรฐาน: {standard.value.toFixed(1)} ก.
        </p>
      )}
      {actual && actual.value != null && (
        <p className="text-[#3b82f6] mt-0.5">
          <span className="inline-block w-2 h-2 rounded-full bg-[#3b82f6] mr-1.5" />
          จริง: {actual.value.toFixed(1)} ก.
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
    <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-4">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">📉</span>
        <h3 className="text-sm font-bold text-[#093832]">กราฟเปรียบเทียบการเจริญเติบโต</h3>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 mb-3 text-[10px] font-semibold text-gray-500">
        <div className="flex items-center gap-1">
          <div className="w-3 h-0.5 bg-[#22c55e] rounded-full" />
          <span>มาตรฐาน (Gompertz)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-[#22c55e]/15 rounded-sm border border-[#22c55e]/30" />
          <span>ช่วงปกติ (±20%)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 bg-[#3b82f6] rounded-full" />
          <span>ข้อมูลจริง</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />

          <XAxis
            dataKey="day"
            tick={{ fontSize: 10, fill: "#9ca3af" }}
            tickLine={false}
            axisLine={{ stroke: "#e5e7eb" }}
            interval={Math.max(0, Math.floor(chartData.length / (totalDays / xInterval)) - 1)}
            label={{ value: "วัน", position: "insideBottomRight", offset: -5, fontSize: 10, fill: "#9ca3af" }}
          />

          <YAxis
            domain={[0, yMax]}
            tick={{ fontSize: 10, fill: "#9ca3af" }}
            tickLine={false}
            axisLine={{ stroke: "#e5e7eb" }}
            label={{ value: "กรัม", angle: -90, position: "insideLeft", offset: 15, fontSize: 10, fill: "#9ca3af" }}
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

      <p className="text-[10px] text-gray-400 text-center mt-2">
        * เส้นมาตรฐานคำนวณจากโมเดล Gompertz Growth Model
        ปรับตามน้ำหนักเริ่มต้นจริง
      </p>
    </div>
  );
}
