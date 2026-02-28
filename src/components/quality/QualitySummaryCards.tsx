/**
 * QualitySummaryCards — การ์ดสรุปดัชนีคุณภาพการเลี้ยง
 *
 * แสดงผล GPI, ADG, Survival Rate, FCR และต้นทุนรวม
 * ในรูปแบบการ์ดแนวนอน 5 ช่อง พร้อมเกณฑ์สีและไอคอน
 */
"use client";

import type { QualityAssessment } from "@/utils/catfishGrowth";

interface Props {
  assessment: QualityAssessment;
}

export default function QualitySummaryCards({ assessment }: Props) {
  const {
    totalDays,
    gpi,
    gpiRating,
    actualADG,
    standardADG,
    survivalRate,
    srRating,
    fcr,
    fcrRating,
    totalCost,
    initialWeightGr,
    latestWeightGr,
    standardWeightGr,
  } = assessment;

  return (
    <div className="space-y-3">
      {/* ส่วนหัว: ข้อมูลทั่วไป */}
      <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">📊</span>
          <h3 className="text-sm font-bold text-[#093832]">ภาพรวมคุณภาพการเลี้ยง</h3>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-gray-50 rounded-xl p-2.5">
            <p className="text-[10px] font-semibold text-gray-400 mb-0.5">เลี้ยงมาแล้ว</p>
            <p className="text-base font-black text-[#093832]">{totalDays} <span className="text-xs font-bold">วัน</span></p>
          </div>
          <div className="bg-gray-50 rounded-xl p-2.5">
            <p className="text-[10px] font-semibold text-gray-400 mb-0.5">น้ำหนักเริ่มต้น</p>
            <p className="text-base font-black text-[#093832]">{initialWeightGr.toFixed(1)} <span className="text-xs font-bold">ก.</span></p>
          </div>
          <div className="bg-gray-50 rounded-xl p-2.5">
            <p className="text-[10px] font-semibold text-gray-400 mb-0.5">น้ำหนักล่าสุด</p>
            <p className="text-base font-black text-[#093832]">{latestWeightGr.toFixed(1)} <span className="text-xs font-bold">ก.</span></p>
          </div>
        </div>
      </div>

      {/* การ์ดดัชนี 4 ช่อง */}
      <div className="grid grid-cols-2 gap-3">

        {/* GPI — ดัชนีการเจริญเติบโต */}
        <div
          className="rounded-2xl border shadow-sm p-4 relative overflow-hidden"
          style={{ backgroundColor: gpiRating.bgColor, borderColor: `${gpiRating.color}30` }}
        >
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-base">{gpiRating.icon}</span>
            <span className="text-[10px] font-bold text-gray-500">GPI (การเจริญเติบโต)</span>
          </div>
          <p className="text-2xl font-black" style={{ color: gpiRating.color }}>
            {gpi.toFixed(0)}%
          </p>
          <p className="text-[11px] font-bold mt-0.5" style={{ color: gpiRating.color }}>
            {gpiRating.label}
          </p>
          <p className="text-[10px] text-gray-400 mt-1">
            มาตรฐาน: {standardWeightGr.toFixed(1)}ก.
          </p>
        </div>

        {/* ADG — อัตราการเจริญเติบโตรายวัน */}
        <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-4">
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-base">📈</span>
            <span className="text-[10px] font-bold text-gray-500">ADG (โตต่อวัน)</span>
          </div>
          <p className="text-2xl font-black text-[#093832]">
            {actualADG.toFixed(2)}
          </p>
          <p className="text-[11px] font-bold text-[#093832] mt-0.5">กรัม/วัน</p>
          <p className="text-[10px] text-gray-400 mt-1">
            มาตรฐาน: {standardADG.toFixed(2)} ก./วัน
          </p>
        </div>

        {/* SR — อัตราการรอดตาย */}
        <div
          className="rounded-2xl border shadow-sm p-4"
          style={{
            backgroundColor: srRating?.bgColor ?? "#f9fafb",
            borderColor: srRating ? `${srRating.color}30` : "#e5e7eb",
          }}
        >
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-base">🐟</span>
            <span className="text-[10px] font-bold text-gray-500">อัตราการรอดตาย</span>
          </div>
          {survivalRate != null ? (
            <>
              <p className="text-2xl font-black" style={{ color: srRating?.color ?? "#374151" }}>
                {survivalRate.toFixed(0)}%
              </p>
              <p className="text-[11px] font-bold mt-0.5" style={{ color: srRating?.color ?? "#374151" }}>
                {srRating?.label ?? "-"}
              </p>
            </>
          ) : (
            <p className="text-lg font-black text-gray-300 mt-1">-</p>
          )}
          <p className="text-[10px] text-gray-400 mt-1">
            คงเหลือ {assessment.fishRemaining?.toLocaleString() ?? "-"} / {assessment.fishReleased?.toLocaleString() ?? "-"} ตัว
          </p>
        </div>

        {/* FCR — อัตราการแลกเนื้อ */}
        <div
          className="rounded-2xl border shadow-sm p-4"
          style={{
            backgroundColor: fcrRating?.bgColor ?? "#f9fafb",
            borderColor: fcrRating ? `${fcrRating.color}30` : "#e5e7eb",
          }}
        >
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-base">🍚</span>
            <span className="text-[10px] font-bold text-gray-500">FCR (แลกเนื้อ)</span>
          </div>
          {fcr != null ? (
            <>
              <p className="text-2xl font-black" style={{ color: fcrRating?.color ?? "#374151" }}>
                {fcr.toFixed(2)}
              </p>
              <p className="text-[11px] font-bold mt-0.5" style={{ color: fcrRating?.color ?? "#374151" }}>
                {fcrRating?.label ?? "-"}
              </p>
            </>
          ) : (
            <p className="text-lg font-black text-gray-300 mt-1">-</p>
          )}
          <p className="text-[10px] text-gray-400 mt-1">
            อาหารรวม {assessment.totalFoodKg.toFixed(1)} กก.
          </p>
        </div>
      </div>

      {/* ต้นทุนรวม */}
      <div className="bg-gradient-to-r from-[#093832] to-[#0A8865] rounded-2xl p-4 text-white shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">💰</span>
            <span className="text-xs font-bold text-white/80">ต้นทุนรวม (อาหาร+ยา)</span>
          </div>
          <p className="text-xl font-black">{totalCost.toLocaleString()} ฿</p>
        </div>
      </div>
    </div>
  );
}
