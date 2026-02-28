/**
 * CostSummary — สรุปต้นทุนรอบการเลี้ยง
 *
 * ออกแบบเป็น 3 ส่วน:
 *  1. ต้นทุนรวม (banner เด่น)
 *  2. รายละเอียดค่าใช้จ่าย (อาหาร / ยา / ปริมาณอาหาร)
 *  3. ตัวชี้วัดประสิทธิภาพต้นทุน (ต้นทุน/ตัว, ต้นทุน/กก.)
 */
"use client";

import type { QualityAssessment } from "@/utils/catfishGrowth";

interface Props {
  assessment: QualityAssessment;
}

/** แถบแสดงสัดส่วน */
function CostBar({ food, medicine }: { food: number; medicine: number }) {
  const total = food + medicine;
  if (total <= 0) return null;
  const foodPct = Math.round((food / total) * 100);
  const medPct = 100 - foodPct;

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1.5">
        <span>🍚 ค่าอาหาร {foodPct}%</span>
        <span>💊 ค่ายา {medPct}%</span>
      </div>
      <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden flex">
        <div
          className="h-full rounded-l-full bg-[#0A8865] transition-all"
          style={{ width: `${foodPct}%` }}
        />
        <div
          className="h-full rounded-r-full bg-amber-400 transition-all"
          style={{ width: `${medPct}%` }}
        />
      </div>
    </div>
  );
}

export default function CostSummary({ assessment }: Props) {
  const {
    totalFoodCost,
    totalMedicineCost,
    totalFoodKg,
    totalCost,
    costPerFish,
    costPerKg,
  } = assessment;

  const fmt = (n: number, dec = 0) =>
    n.toLocaleString(undefined, { minimumFractionDigits: dec, maximumFractionDigits: dec });

  return (
    <div className="space-y-3">
      {/* ─── ส่วน 1: ต้นทุนรวม (banner) ─── */}
      <div className="bg-gradient-to-br from-[#093832] to-[#0A8865] rounded-2xl p-5 text-white shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">💰</span>
          <span className="text-sm font-bold text-white/80">ต้นทุนรวมทั้งรอบ</span>
        </div>
        <p className="text-4xl font-black tracking-tight">
          {fmt(totalCost)} <span className="text-xl font-bold">บาท</span>
        </p>

        <CostBar food={totalFoodCost} medicine={totalMedicineCost} />

        {/* ค่าอาหาร / ค่ายา แยก */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-white/10 rounded-xl px-3.5 py-2.5">
            <p className="text-xs text-white/60 mb-0.5">ค่าอาหาร</p>
            <p className="text-lg font-black">{fmt(totalFoodCost)} ฿</p>
          </div>
          <div className="bg-white/10 rounded-xl px-3.5 py-2.5">
            <p className="text-xs text-white/60 mb-0.5">ค่ายา</p>
            <p className="text-lg font-black">{fmt(totalMedicineCost)} ฿</p>
          </div>
        </div>

        {/* ปริมาณอาหาร */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/15">
          <div className="flex items-center gap-2">
            <span className="text-sm">📦</span>
            <span className="text-xs font-semibold text-white/70">อาหารที่ใช้ทั้งหมด</span>
          </div>
          <span className="text-base font-black">{fmt(totalFoodKg, 1)} กก.</span>
        </div>
      </div>

      {/* ─── ส่วน 2: ตัวชี้วัดประสิทธิภาพต้นทุน ─── */}
      <div className="grid grid-cols-2 gap-3">
        {/* ต้นทุน / ตัว */}
        <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-4">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-lg">🐟</span>
            <span className="text-sm font-bold text-gray-700">ต้นทุน/ตัว</span>
          </div>
          <p className="text-[11px] text-gray-400 mb-2">ต้นทุนเฉลี่ยต่อปลา 1 ตัวที่ยังมีชีวิต</p>
          {costPerFish != null ? (
            <p className="text-2xl font-black text-[#093832]">
              {costPerFish.toFixed(2)} <span className="text-sm font-bold">บาท</span>
            </p>
          ) : (
            <p className="text-lg font-black text-gray-300">ไม่มีข้อมูล</p>
          )}
        </div>

        {/* ต้นทุน / กก. ผลผลิต */}
        <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-4">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-lg">⚖️</span>
            <span className="text-sm font-bold text-gray-700">ต้นทุน/กก.</span>
          </div>
          <p className="text-[11px] text-gray-400 mb-2">ต้นทุนต่อน้ำหนักปลารวม 1 กก.</p>
          {costPerKg != null ? (
            <p className="text-2xl font-black text-[#093832]">
              {costPerKg.toFixed(1)} <span className="text-sm font-bold">บาท</span>
            </p>
          ) : (
            <p className="text-lg font-black text-gray-300">ไม่มีข้อมูล</p>
          )}
        </div>
      </div>
    </div>
  );
}
