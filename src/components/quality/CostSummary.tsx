/**
 * CostSummary  สรุปต้นทุนรอบการเลี้ยง
 *
 * ออกแบบใหม่เป็นแนว Graphical Dashboard:
 *   - Donut chart (SVG) แสดงสัดส่วนค่าอาหาร vs ค่ายา
 *   - Progress bar สำหรับแต่ละรายการ
 *   - Stat cards สำหรับต้นทุนเฉลี่ย
 */
"use client";

import type { QualityAssessment } from "@/utils/catfishGrowth";

interface Props {
  assessment: QualityAssessment;
}

// ─── Donut Chart ─────────────────────────────────────────────────────────────

interface DonutProps {
  food: number;
  medicine: number;
  total: number;
}

function DonutChart({ food, medicine, total }: DonutProps) {
  const R = 52;
  const stroke = 14;
  const cx = 70;
  const cy = 70;
  const circumference = 2 * Math.PI * R;

  const foodPct = total > 0 ? food / total : 1;
  const medPct = total > 0 ? medicine / total : 0;

  const foodDash = foodPct * circumference;
  const medDash = medPct * circumference;
  // gap offset
  const gapFraction = total > 0 && medicine > 0 ? 0.02 : 0;
  const foodOffset = 0; // starts at 12 o'clock (rotate -90deg on svg)
  const medOffset = foodDash + gapFraction * circumference;

  return (
    <svg width="140" height="140" viewBox="0 0 140 140" className="drop-shadow-sm">
      {/* background ring */}
      <circle
        cx={cx} cy={cy} r={R}
        fill="none"
        stroke="#f1f5f9"
        strokeWidth={stroke}
      />
      {/* food arc */}
      <circle
        cx={cx} cy={cy} r={R}
        fill="none"
        stroke="#22c55e"
        strokeWidth={stroke}
        strokeDasharray={`${foodDash} ${circumference}`}
        strokeDashoffset={-foodOffset}
        strokeLinecap="round"
        style={{ transform: "rotate(-90deg)", transformOrigin: `${cx}px ${cy}px` }}
      />
      {/* medicine arc */}
      {medicine > 0 && (
        <circle
          cx={cx} cy={cy} r={R}
          fill="none"
          stroke="#f59e0b"
          strokeWidth={stroke}
          strokeDasharray={`${medDash} ${circumference}`}
          strokeDashoffset={-medOffset}
          strokeLinecap="round"
          style={{ transform: "rotate(-90deg)", transformOrigin: `${cx}px ${cy}px` }}
        />
      )}
      {/* center text */}
      <text
        x={cx} y={cy - 8}
        textAnchor="middle"
        dominantBaseline="middle"
        className="fill-[#093832]"
        style={{ fontSize: 11, fontWeight: 500, fill: "#64748b" }}
      >
        รวม
      </text>
      <text
        x={cx} y={cy + 10}
        textAnchor="middle"
        dominantBaseline="middle"
        style={{ fontSize: 15, fontWeight: 800, fill: "#093832" }}
      >
        {total.toLocaleString()}
      </text>
      <text
        x={cx} y={cy + 26}
        textAnchor="middle"
        dominantBaseline="middle"
        style={{ fontSize: 10, fontWeight: 500, fill: "#64748b" }}
      >
        บาท
      </text>
    </svg>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────

interface BarProps {
  label: string;
  value: number;
  total: number;
  color: string;
  bgColor: string;
  emoji: string;
  unit?: string;
}

function CostBar({ label, value, total, color, bgColor, emoji, unit = "บาท" }: BarProps) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">{emoji}</span>
          <span className="text-sm font-semibold text-gray-600">{label}</span>
        </div>
        <div className="text-right">
          <span className="text-sm font-bold text-gray-800">
            {value.toLocaleString(undefined, { minimumFractionDigits: unit === "กก." ? 1 : 0, maximumFractionDigits: unit === "กก." ? 1 : 0 })}
          </span>
          <span className="text-xs text-gray-400 ml-1">{unit}</span>
          {unit === "บาท" && total > 0 && (
            <span className="text-xs text-gray-400 ml-1">({pct}%)</span>
          )}
        </div>
      </div>
      <div className="h-2 w-full rounded-full" style={{ backgroundColor: bgColor }}>
        <div
          className="h-2 rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string | null;
  unit: string;
  gradient: string;
  emoji: string;
}

function StatCard({ label, value, unit, gradient, emoji }: StatCardProps) {
  return (
    <div
      className="rounded-2xl p-4 flex flex-col items-center text-center gap-1"
      style={{ background: gradient }}
    >
      <span className="text-2xl">{emoji}</span>
      <p className="text-xs text-white/80 font-medium leading-tight">{label}</p>
      {value != null ? (
        <p className="text-xl font-black text-white leading-none">
          {value}
          <span className="text-xs font-semibold ml-1 opacity-80">{unit}</span>
        </p>
      ) : (
        <p className="text-sm font-bold text-white/50">ไม่มีข้อมูล</p>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CostSummary({ assessment }: Props) {
  const {
    totalFoodCost,
    totalMedicineCost,
    totalFoodKg,
    totalCost,
    costPerFish,
    costPerKg,
  } = assessment;

  return (
    <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <span className="text-xl">💰</span>
        <h3 className="text-base font-bold text-[#093832]">สรุปต้นทุนรอบการเลี้ยง</h3>
      </div>

      {/* Donut + Legend */}
      <div className="flex items-center gap-4">
        <DonutChart
          food={totalFoodCost}
          medicine={totalMedicineCost}
          total={totalCost}
        />
        {/* Legend */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0" />
            <span className="text-xs text-gray-500">ค่าอาหาร</span>
            <span className="ml-auto text-xs font-bold text-gray-700">
              {totalCost > 0
                ? Math.round((totalFoodCost / totalCost) * 100)
                : 0}%
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-400 flex-shrink-0" />
            <span className="text-xs text-gray-500">ค่ายา</span>
            <span className="ml-auto text-xs font-bold text-gray-700">
              {totalCost > 0
                ? Math.round((totalMedicineCost / totalCost) * 100)
                : 0}%
            </span>
          </div>
          <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
            <span className="w-3 h-3 rounded-full bg-blue-300 flex-shrink-0" />
            <span className="text-xs text-gray-500">อาหาร (นน.)</span>
            <span className="ml-auto text-xs font-bold text-gray-700">
              {totalFoodKg.toFixed(1)} กก.
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="space-y-4 pt-1 border-t border-gray-100">
        <CostBar
          label="ค่าอาหาร"
          value={totalFoodCost}
          total={totalCost}
          color="#22c55e"
          bgColor="#dcfce7"
          emoji="🌾"
        />
        <CostBar
          label="ค่ายา"
          value={totalMedicineCost}
          total={totalCost}
          color="#f59e0b"
          bgColor="#fef3c7"
          emoji="💊"
        />
        <CostBar
          label="ปริมาณอาหาร"
          value={totalFoodKg}
          total={totalFoodKg}
          color="#60a5fa"
          bgColor="#dbeafe"
          emoji="⚖️"
          unit="กก."
        />
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-3 pt-1 border-t border-gray-100">
        <StatCard
          label="เฉลี่ยต่อปลา 1 ตัว"
          value={costPerFish != null ? costPerFish.toFixed(2) : null}
          unit="บาท"
          gradient="linear-gradient(135deg, #093832 0%, #0f6554 100%)"
          emoji="🐟"
        />
        <StatCard
          label="เฉลี่ยต่อ 1 กก."
          value={costPerKg != null ? costPerKg.toFixed(1) : null}
          unit="บาท"
          gradient="linear-gradient(135deg, #1d4ed8 0%, #0ea5e9 100%)"
          emoji="📦"
        />
      </div>
    </div>
  );
}
