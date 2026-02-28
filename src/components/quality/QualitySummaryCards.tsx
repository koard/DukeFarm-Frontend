/**
 * QualitySummaryCards — การ์ดสรุปดัชนีคุณภาพการเลี้ยง
 *
 * แสดงผล GPI, ADG, Survival Rate, FCR และต้นทุนรวม
 * ออกแบบสำหรับเกษตรกร — ฟอนต์ใหญ่อ่านง่าย + คำอธิบายภาษาไทย
 * พร้อมคงข้อมูลทางวิทยาศาสตร์ (ชื่อย่อ + ค่ามาตรฐาน) ไว้ในส่วนรอง
 */
"use client";

import type { QualityAssessment } from "@/utils/catfishGrowth";
import { calculateOverallStars } from "@/utils/catfishGrowth";

interface Props {
  assessment: QualityAssessment;
}

export default function QualitySummaryCards({ assessment }: Props) {
  const {
    daysSinceRelease,
    gpi,
    gpiRating,
    actualADG,
    standardADG,
    survivalRate,
    srRating,
    fcr,
    fcrRating,
    initialWeightGr,
    latestWeightGr,
    standardWeightGr,
  } = assessment;

  const overall = calculateOverallStars(assessment);

  return (
    <div className="space-y-4">
      {/* ส่วนหัว: ข้อมูลทั่วไปของรอบการเลี้ยง */}
      <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-5">
        <div className="flex items-center gap-2.5 mb-4">
          <span className="text-xl">📊</span>
          <h3 className="text-base font-bold text-[#093832]">ภาพรวมรอบการเลี้ยง</h3>
        </div>

        {/* ⭐ คะแนนคุณภาพโดยรวม */}
        <div className="text-center mb-4 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-center gap-1 mb-1.5">
            {[1, 2, 3, 4, 5].map((i) => {
              const fill =
                i <= Math.floor(overall.stars)
                  ? "text-yellow-400"
                  : i - 0.5 <= overall.stars
                    ? "text-yellow-400 opacity-50"
                    : "text-gray-200";
              return (
                <svg
                  key={i}
                  className={`w-7 h-7 ${fill}`}
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              );
            })}
          </div>
          <p className="text-sm font-black text-[#093832]">
            {overall.label} ({overall.stars} / 5)
          </p>
          <p className="text-xs text-gray-400 mt-1 leading-relaxed max-w-[280px] mx-auto">
            {overall.description}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2.5 text-center">
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs font-semibold text-gray-500 mb-1">เลี้ยงมาแล้ว</p>
            <p className="text-xl font-black text-[#093832]">{daysSinceRelease}</p>
            <p className="text-xs font-bold text-gray-400">วัน</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs font-semibold text-gray-500 mb-1">น้ำหนักแรก</p>
            <p className="text-xl font-black text-[#093832]">{initialWeightGr.toFixed(1)}</p>
            <p className="text-xs font-bold text-gray-400">กรัม</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs font-semibold text-gray-500 mb-1">น้ำหนักล่าสุด</p>
            <p className="text-xl font-black text-[#093832]">{latestWeightGr.toFixed(1)}</p>
            <p className="text-xs font-bold text-gray-400">กรัม</p>
          </div>
        </div>
      </div>

      {/* การ์ดดัชนี 4 ช่อง  */}
      <div className="grid grid-cols-2 gap-3">

        {/* GPI — ดัชนีเจริญเติบโต */}
        <div
          className="rounded-2xl border shadow-sm p-4 relative overflow-hidden"
          style={{ backgroundColor: gpiRating.bgColor, borderColor: `${gpiRating.color}30` }}
        >
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-sm font-bold text-gray-700">ดัชนีเจริญเติบโต (GPI)</span>
          </div>
          <p className="text-3xl font-black" style={{ color: gpiRating.color }}>
            {gpi.toFixed(0)}%
          </p>
          <p className="text-sm font-bold mt-1" style={{ color: gpiRating.color }}>
            {gpiRating.label}
          </p>
          <p className="text-xs text-gray-400 mt-1.5">
            ควรได้ {standardWeightGr.toFixed(1)} ก. ได้จริง {latestWeightGr.toFixed(1)} ก.
          </p>
        </div>

        {/* ADG — อัตราการเจริญเติบโตต่อวัน */}
        <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-4">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-sm font-bold text-gray-700">น้ำหนักเพิ่มต่อวัน (ADG)</span>
          </div>
          <p className="text-3xl font-black text-[#093832]">
            {actualADG.toFixed(2)}
          </p>
          <p className="text-sm font-bold text-[#093832] mt-1">กรัม/วัน</p>
          <p className="text-xs text-gray-400 mt-1.5">
            มาตรฐาน: {standardADG.toFixed(2)} กรัม/วัน
          </p>
        </div>

        {/* SR — อัตราการรอดชีวิค */}
        <div
          className="rounded-2xl border shadow-sm p-4"
          style={{
            backgroundColor: srRating?.bgColor ?? "#f9fafb",
            borderColor: srRating ? `${srRating.color}30` : "#e5e7eb",
          }}
        >
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-sm font-bold text-gray-700">อัตราการรอดชีวิค (SR)</span>
          </div>
          {survivalRate != null ? (
            <>
              <p className="text-3xl font-black" style={{ color: srRating?.color ?? "#374151" }}>
                {survivalRate.toFixed(0)}%
              </p>
              <p className="text-sm font-bold mt-1" style={{ color: srRating?.color ?? "#374151" }}>
                {srRating?.label ?? "-"}
              </p>
            </>
          ) : (
            <p className="text-xl font-black text-gray-300 mt-2">ไม่มีข้อมูล</p>
          )}
          <p className="text-xs text-gray-400 mt-1.5">
            คงเหลือ {assessment.fishRemaining?.toLocaleString() ?? "-"} จาก {assessment.fishReleased?.toLocaleString() ?? "-"} ตัว
          </p>
        </div>

        {/* FCR — อัตราการเปลี่ยนอาหารเป็นเนื้อ */}
        <div
          className="rounded-2xl border shadow-sm p-4"
          style={{
            backgroundColor: fcrRating?.bgColor ?? "#f9fafb",
            borderColor: fcrRating ? `${fcrRating.color}30` : "#e5e7eb",
          }}
        >
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-sm font-bold text-gray-700">อัตราการเปลี่ยนอาหารเป็นเนื้อ (FCR)</span>
          </div>
          {fcr != null ? (
            <>
              <p className="text-3xl font-black" style={{ color: fcrRating?.color ?? "#374151" }}>
                {fcr.toFixed(2)}
              </p>
              <p className="text-sm font-bold mt-1" style={{ color: fcrRating?.color ?? "#374151" }}>
                {fcrRating?.label ?? "-"}
              </p>
            </>
          ) : (
            <p className="text-xl font-black text-gray-300 mt-2">ไม่มีข้อมูล</p>
          )}
        </div>
      </div>
    </div>
  );
}
