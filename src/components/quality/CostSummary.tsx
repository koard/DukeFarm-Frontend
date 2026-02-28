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
      {/* ─── ส่วน 1: ต้นทุนรวม ─── */}
      <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-5">
        <div className="flex items-center gap-2.5 mb-4">
          <span className="text-xl">💰</span>
          <h3 className="text-base font-bold text-[#093832]">สรุปต้นทุนรอบการเลี้ยง</h3>
        </div>

        {/* ต้นทุนรวม เด่น */}
        <div className="bg-gray-50 rounded-xl p-4 mb-4 text-center">
          <p className="text-xs font-semibold text-gray-400 mb-1">ต้นทุนรวมทั้งรอบ</p>
          <p className="text-3xl font-black text-[#093832]">
            {fmt(totalCost)} <span className="text-base font-bold">บาท</span>
          </p>
        </div>

        {/* ค่าอาหาร / ค่ายา แยก */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-[#f0fdf4] rounded-xl px-3.5 py-3">
            <p className="text-xs font-semibold text-gray-500 mb-0.5">🍚 ค่าอาหาร</p>
            <p className="text-lg font-black text-[#093832]">{fmt(totalFoodCost)} ฿</p>
          </div>
          <div className="bg-amber-50 rounded-xl px-3.5 py-3">
            <p className="text-xs font-semibold text-gray-500 mb-0.5">💊 ค่ายา</p>
            <p className="text-lg font-black text-[#093832]">{fmt(totalMedicineCost)} ฿</p>
          </div>
        </div>

        {/* ปริมาณอาหาร */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-sm">📦</span>
            <span className="text-sm font-semibold text-gray-600">อาหารที่ใช้ทั้งหมด</span>
          </div>
          <span className="text-base font-black text-[#093832]">{fmt(totalFoodKg, 1)} กก.</span>
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
