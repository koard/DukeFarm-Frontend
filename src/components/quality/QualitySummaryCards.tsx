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
import { TrendingUp, Scale, Calendar } from "lucide-react";

interface Props {
  assessment: QualityAssessment;
}

export default function QualitySummaryCards({ assessment }: Props) {
  const {
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

  /* หา color scheme ตาม overall rating */
  const ratingTheme = (() => {
    if (overall.stars >= 4.5) return { gradient: "from-emerald-500 to-teal-600", accent: "#059669", bg: "bg-emerald-50" };
    if (overall.stars >= 3.5) return { gradient: "from-teal-500 to-cyan-600", accent: "#0d9488", bg: "bg-teal-50" };
    if (overall.stars >= 2.5) return { gradient: "from-amber-400 to-orange-500", accent: "#d97706", bg: "bg-amber-50" };
    if (overall.stars >= 1.5) return { gradient: "from-orange-400 to-red-500", accent: "#ea580c", bg: "bg-orange-50" };
    return { gradient: "from-red-400 to-rose-600", accent: "#dc2626", bg: "bg-red-50" };
  })();

  const weightGain = latestWeightGr - initialWeightGr;

  return (
    <div className="space-y-3">

      {/* ────────── Hero Card: คะแนนรวม + สรุปน้ำหนัก ────────── */}
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${ratingTheme.gradient} p-5 shadow-lg`}>
        {/* Star rating row */}
        <div className="relative flex items-center justify-between mb-4">
          <div>
            <p className="text-white/70 text-sm font-semibold tracking-wide uppercase mb-1">คุณภาพการเลี้ยงโดยรวม</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-white">{overall.stars}</span>
              <span className="text-white/60 text-lg font-bold">/ 5</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => {
                const isFull = i <= Math.floor(overall.stars);
                const isHalf = !isFull && i - 0.5 <= overall.stars;
                return (
                  <svg key={i} className="w-6 h-6" viewBox="0 0 24 24" fill={isFull ? "#FCD34D" : isHalf ? "#FCD34D" : "rgba(255,255,255,0.25)"} opacity={isHalf ? 0.6 : 1}>
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                );
              })}
            </div>
            <span className="text-sm font-bold text-white/90 bg-white/15 px-2.5 py-0.5 rounded-full">
              {overall.label}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="relative text-sm text-white/70 leading-relaxed mb-4">
          {overall.description}
        </p>

        {/* Stats row */}
        <div className="relative grid grid-cols-3 gap-2">
          {[
            { label: "เลี้ยงมาแล้ว", value: `${assessment.totalDays}`, unit: "วัน", icon: <Calendar className="w-3.5 h-3.5" /> },
            { label: "น้ำหนักเพิ่ม", value: `+${weightGain.toFixed(1)}`, unit: "กรัม", icon: <TrendingUp className="w-3.5 h-3.5" /> },
            { label: "น้ำหนักล่าสุด", value: latestWeightGr.toFixed(1), unit: "กรัม", icon: <Scale className="w-3.5 h-3.5" /> },
          ].map((s, i) => (
            <div key={i} className="bg-white/15 backdrop-blur-sm rounded-xl px-2.5 py-2.5 text-center">
              <div className="flex items-center justify-center gap-1 text-white/60 mb-1">
                {s.icon}
                <span className="text-xs font-semibold">{s.label}</span>
              </div>
              <p className="text-lg font-black text-white leading-tight">{s.value}</p>
              <p className="text-xs font-bold text-white/50">{s.unit}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ────────── 4 Index Cards (2×2) ────────── */}
      <div className="grid grid-cols-2 gap-3">

        {/* GPI */}
        <IndexCard
          title="ดัชนีเจริญเติบโต"
          abbr="GPI"
          value={`${gpi.toFixed(0)}%`}
          ratingLabel={gpiRating.label}
          ratingColor={gpiRating.color}
          bgColor={gpiRating.bgColor}
          subtitle={`มาตรฐาน ${standardWeightGr.toFixed(0)} ก. / จริง ${latestWeightGr.toFixed(0)} ก.`}
        />

        {/* SR */}
        <IndexCard
          title="อัตราการรอดชีวิต"
          abbr="SR"
          value={survivalRate != null ? `${survivalRate.toFixed(0)}%` : null}
          ratingLabel={srRating?.label ?? "-"}
          ratingColor={srRating?.color ?? "#9ca3af"}
          bgColor={srRating?.bgColor ?? "#f9fafb"}
          subtitle={`คงเหลือ ${assessment.fishRemaining?.toLocaleString() ?? "-"} จาก ${assessment.fishReleased?.toLocaleString() ?? "-"} ตัว`}
        />

        {/* ADG */}
        <IndexCard
          title="อัตราการเจริญเติบโตเฉลี่ยต่อวัน"
          abbr="ADG"
          value={actualADG.toFixed(2)}
          ratingLabel="กรัม/วัน"
          ratingColor="#0d9488"
          bgColor="#f0fdfa"
          subtitle={`มาตรฐาน ${standardADG.toFixed(2)} กรัม/วัน`}
        />

        {/* FCR */}
        <IndexCard
          title="อัตราการเปลี่ยนอาหารเป็นเนื้อปลา"
          abbr="FCR"
          value={fcr != null ? fcr.toFixed(2) : null}
          ratingLabel={fcrRating?.label ?? "-"}
          ratingColor={fcrRating?.color ?? "#9ca3af"}
          bgColor={fcrRating?.bgColor ?? "#f9fafb"}
          subtitle={fcr != null ? `อาหาร ${fcr.toFixed(2)} กก. ต่อเนื้อปลา 1 กก.` : undefined}
        />
      </div>
    </div>
  );
}

/* ────────── Sub-component: IndexCard ────────── */

function IndexCard({
  title,
  abbr,
  value,
  ratingLabel,
  ratingColor,
  bgColor,
  subtitle,
}: {
  title: string;
  abbr: string;
  value: string | null;
  ratingLabel: string;
  ratingColor: string;
  bgColor: string;
  subtitle?: string;
}) {
  return (
    <div
      className="rounded-2xl border shadow-sm p-4 flex flex-col justify-between min-h-[140px] relative overflow-hidden"
      style={{ backgroundColor: bgColor, borderColor: `${ratingColor}20` }}
    >
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-bold text-gray-500">{title}</span>
          <span
            className="text-[10px] font-black px-1.5 py-0.5 rounded-md"
            style={{ color: ratingColor, backgroundColor: `${ratingColor}15` }}
          >
            {abbr}
          </span>
        </div>
        {value != null ? (
          <p className="text-3xl font-black leading-tight" style={{ color: ratingColor }}>
            {value}
          </p>
        ) : (
          <p className="text-lg font-black text-gray-300 mt-1">ไม่มีข้อมูล</p>
        )}
      </div>

      <div className="mt-2">
        {value != null && (
          <span
            className="inline-block text-xs font-bold px-2 py-0.5 rounded-full mb-1"
            style={{ color: ratingColor, backgroundColor: `${ratingColor}15` }}
          >
            {ratingLabel}
          </span>
        )}
        {subtitle && (
          <p className="text-[11px] text-gray-400 leading-snug">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
