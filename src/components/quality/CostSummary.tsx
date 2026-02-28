/**
 * CostSummary  สรุปต้นทุนการเลี้ยง
 *
 * ออกแบบใหม่เป็นแนว Graphical Dashboard:
 *   - Donut chart (SVG) centered แสดงสัดส่วน
 *   - Clean cost item rows with inline bar
 *   - Stat pill cards ด้านล่าง
 */
"use client";

import type { QualityAssessment } from "@/utils/catfishGrowth";

interface Props {
  assessment: QualityAssessment;
}

// ─── SVG Donut Chart ──────────────────────────────────────────────────────────

function DonutChart({
  food,
  medicine,
  total,
}: {
  food: number;
  medicine: number;
  total: number;
}) {
  const R = 60;
  const stroke = 13;
  const size = 160;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * R;

  const foodFrac = total > 0 ? food / total : 1;
  const medFrac = total > 0 ? medicine / total : 0;
  const gap = total > 0 && medicine > 0 ? 0.025 : 0;

  const foodLen = Math.max(0, foodFrac - gap / 2) * circumference;
  const medLen = Math.max(0, medFrac - gap / 2) * circumference;
  const medOffsetDeg = foodFrac * 360;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ display: "block" }}
    >
      {/* track */}
      <circle cx={cx} cy={cy} r={R} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />

      {/* food arc */}
      <circle
        cx={cx} cy={cy} r={R}
        fill="none"
        stroke="#16a34a"
        strokeWidth={stroke}
        strokeDasharray={`${foodLen} ${circumference}`}
        strokeLinecap="round"
        style={{ transform: "rotate(-90deg)", transformOrigin: `${cx}px ${cy}px` }}
      />

      {/* medicine arc */}
      {medLen > 0 && (
        <circle
          cx={cx} cy={cy} r={R}
          fill="none"
          stroke="#f59e0b"
          strokeWidth={stroke}
          strokeDasharray={`${medLen} ${circumference}`}
          strokeLinecap="round"
          style={{
            transform: `rotate(${-90 + medOffsetDeg}deg)`,
            transformOrigin: `${cx}px ${cy}px`,
          }}
        />
      )}

      {/* center label */}
      <text x={cx} y={cy - 12} textAnchor="middle" style={{ fontSize: 14, fill: "#94a3b8", fontWeight: 500 }}>รั้งหมด</text>
      <text x={cx} y={cy + 8} textAnchor="middle" style={{ fontSize: 20, fill: "#0f172a", fontWeight: 800 }}>
        {total.toLocaleString()}
      </text>
      <text x={cx} y={cy + 24} textAnchor="middle" style={{ fontSize: 14, fill: "#94a3b8", fontWeight: 500 }}>บาท</text>
    </svg>
  );
}

// ─── Cost Row ─────────────────────────────────────────────────────────────────

function CostRow({
  label,
  value,
  pct,
  color,
  trackColor,
}: {
  label: string;
  value: number;
  pct: number;
  color: string;
  trackColor: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-baseline">
        <span className="text-sm text-gray-500 font-medium">{label}</span>
        <span className="text-sm font-bold text-gray-800">
          {value.toLocaleString()}
          <span className="text-xs font-normal text-gray-400 ml-1">บาท</span>
          <span className="text-xs font-normal text-gray-400 ml-1">({pct}%)</span>
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full" style={{ backgroundColor: trackColor }}>
        <div
          className="h-1.5 rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
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

  const foodPct = totalCost > 0 ? Math.round((totalFoodCost / totalCost) * 100) : 0;
  const medPct = totalCost > 0 ? Math.round((totalMedicineCost / totalCost) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* ── Header bar ──────────────────────────────── */}
      <div className="px-5 pt-5 pb-4 flex items-center gap-2 border-b border-gray-100">
        <span className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-base">💰</span>
        <h3 className="text-sm font-bold text-[#093832]">สรุปต้นทุนการเลี้ยง</h3>
      </div>

      <div className="px-5 py-5 space-y-5">
        {/* ── Donut + Legend ──────────────────────────── */}
        <div className="flex flex-col items-center gap-4">
          <DonutChart
            food={totalFoodCost}
            medicine={totalMedicineCost}
            total={totalCost}
          />
        </div>

        {/* ── Cost breakdown bars ─────────────────────── */}
        <div className="space-y-3.5 pt-1 border-t border-gray-100">
          <CostRow
            label="ค่าอาหาร"
            value={totalFoodCost}
            pct={foodPct}
            color="#16a34a"
            trackColor="#dcfce7"
          />
          <CostRow
            label="ค่ายา"
            value={totalMedicineCost}
            pct={medPct}
            color="#f59e0b"
            trackColor="#fef3c7"
          />
          {/* Food kg — separate info row, no bar */}
          <div className="flex justify-between items-baseline pt-0.5 border-t border-dashed border-gray-100">
            <span className="text-sm text-gray-400">ปริมาณอาหารที่ใช้</span>
            <span className="text-sm font-semibold text-gray-600">
              {totalFoodKg.toFixed(1)} กก.
            </span>
          </div>
        </div>

        {/* ── Average stat pills ──────────────────────── */}
        <div className="grid grid-cols-2 gap-3 pt-1 border-t border-gray-100">
          {/* per fish */}
          <div className="rounded-xl bg-gradient-to-br from-[#093832] to-[#0f6554] p-3.5 flex flex-col gap-1">
            <span className="text-sm font-medium text-white/60 uppercase">ต้นทุนต่อปลา 1 ตัว</span>
            {costPerFish != null ? (
              <p className="text-lg font-black text-white leading-none">
                {costPerFish.toFixed(2)}
                <span className="text-sm font-semibold ml-1 opacity-70"> บาท</span>
              </p>
            ) : (
              <p className="text-sm font-bold text-white/30">ไม่มีข้อมูล</p>
            )}
          </div>
          {/* per kg */}
          <div className="rounded-xl bg-gradient-to-br from-[#1e40af] to-[#0ea5e9] p-3.5 flex flex-col gap-1">
            <span className="text-sm font-medium text-white/60 uppercase">ต้นทุนต่อปลา 1 กก.</span>
            {costPerKg != null ? (
              <p className="text-lg font-black text-white leading-none">
                {costPerKg.toFixed(1)}
                <span className="text-sm font-semibold ml-1 opacity-70"> บาท</span>
              </p>
            ) : (
              <p className="text-sm font-bold text-white/30">ไม่มีข้อมูล</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
