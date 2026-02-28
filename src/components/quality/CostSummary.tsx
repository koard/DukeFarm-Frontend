/**
 * CostSummary  สรุปต้นทุนรอบการเลี้ยง
 *
 * ออกแบบเป็นใบเสร็จ: แจกแจงรายการ  รวมยอด
 * เกษตรกรเห็นชัดว่า อาหาร + ยา = ต้นทุนรวม
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
    <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-5">
      <div className="flex items-center gap-2.5 mb-4">
        <span className="text-xl"></span>
        <h3 className="text-base font-bold text-[#093832]">สรุปต้นทุนรอบการเลี้ยง</h3>
      </div>

      {/* รายการค่าใช้จ่าย (แบบใบเสร็จ) */}
      <div className="space-y-0">
        {/* ค่าอาหาร */}
        <div className="flex items-center justify-between py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-base"></span>
            <span className="text-sm font-semibold text-gray-600">ค่าอาหาร</span>
          </div>
          <span className="text-base font-bold text-gray-800">{fmt(totalFoodCost)} บาท</span>
        </div>

        {/* ค่ายา */}
        <div className="flex items-center justify-between py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-base"></span>
            <span className="text-sm font-semibold text-gray-600">ค่ายา</span>
          </div>
          <span className="text-base font-bold text-gray-800">{fmt(totalMedicineCost)} บาท</span>
        </div>

        {/* ปริมาณอาหาร */}
        <div className="flex items-center justify-between py-3 border-b border-dashed border-gray-200">
          <div className="flex items-center gap-2">
            <span className="text-base"></span>
            <span className="text-sm font-semibold text-gray-600">อาหารที่ใช้ทั้งหมด</span>
          </div>
          <span className="text-base font-bold text-gray-800">{fmt(totalFoodKg, 1)} กก.</span>
        </div>

        {/* ยอดรวม */}
        <div className="flex items-center justify-between pt-4 pb-1">
          <div className="flex items-center gap-2">
            <span className="text-lg"></span>
            <span className="text-base font-black text-[#093832]">รวมทั้งหมด</span>
          </div>
          <span className="text-2xl font-black text-[#093832]">{fmt(totalCost)} บาท</span>
        </div>
      </div>

      {/* ต้นทุนเฉลี่ย */}
      <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-gray-100">
        <div className="bg-gray-50 rounded-xl p-3.5 text-center">
          <p className="text-xs text-gray-400 mb-1"> เฉลี่ยต่อปลา 1 ตัว</p>
          {costPerFish != null ? (
            <p className="text-xl font-black text-[#093832]">
              {costPerFish.toFixed(2)} <span className="text-xs font-bold">บาท</span>
            </p>
          ) : (
            <p className="text-base font-black text-gray-300">ไม่มีข้อมูล</p>
          )}
        </div>
        <div className="bg-gray-50 rounded-xl p-3.5 text-center">
          <p className="text-xs text-gray-400 mb-1"> เฉลี่ยต่อ 1 กก.</p>
          {costPerKg != null ? (
            <p className="text-xl font-black text-[#093832]">
              {costPerKg.toFixed(1)} <span className="text-xs font-bold">บาท</span>
            </p>
          ) : (
            <p className="text-base font-black text-gray-300">ไม่มีข้อมูล</p>
          )}
        </div>
      </div>
    </div>
  );
}
