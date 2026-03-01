/**
 * HarvestAdvisor — การ์ดคำแนะนำจับ/ส่งต่อปลา
 *
 * รองรับ 3 ระยะ:
 * - SMALL (ปลาตุ้ม) → เป้าหมาย: ส่งต่อเป็นปลานิ้ว (≥5 ก.)
 * - LARGE (ปลานิ้ว) → เป้าหมาย: ส่งต่อเป็นปลาตลาด (≥30 ก.)
 * - MARKET (ปลาตลาด) → เป้าหมาย: จับขาย (≥150 ก. ตลาดทั่วไป / ≥500 ก. พรีเมียม)
 */
"use client";

import type { QualityAssessment, HarvestAdvice, HarvestSignal, FarmType } from "@/utils/catfishGrowth";
import { computeHarvestAdvice } from "@/utils/catfishGrowth";
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Info,
  Target,
  Timer,
  Package,
  Banknote,
} from "lucide-react";

interface Props {
  assessment: QualityAssessment;
  farmType: FarmType;
}

/* ── Signal Icon ────────────────────────────────────────────── */

function SignalIcon({ type }: { type: HarvestSignal["type"] }) {
  switch (type) {
    case "positive":
      return <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />;
    case "warning":
      return <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />;
    case "critical":
      return <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />;
    default:
      return <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />;
  }
}

function signalBg(type: HarvestSignal["type"]) {
  switch (type) {
    case "positive":
      return "bg-emerald-50 border-emerald-100";
    case "warning":
      return "bg-amber-50 border-amber-100";
    case "critical":
      return "bg-red-50 border-red-100";
    default:
      return "bg-blue-50 border-blue-100";
  }
}

/* ── Progress bar (ขนาดปลา vs เป้าหมาย) ────────────────────── */

function StageProgressBar({
  currentWeight,
  advice,
}: {
  currentWeight: number;
  advice: HarvestAdvice;
}) {
  const { markers, scaleMaxGr } = advice.progressBar;

  const currentPct = Math.min(100, (currentWeight / scaleMaxGr) * 100);

  // เลือกสี fill bar ตาม readiness
  const fillGradient = (() => {
    switch (advice.readiness) {
      case "optimal-sell":
      case "ready-premium":
        return "linear-gradient(90deg, #22c55e, #15803d)";
      case "ready-general":
      case "ready-transfer":
        return "linear-gradient(90deg, #22c55e, #86efac)";
      case "approaching":
        return "linear-gradient(90deg, #f59e0b, #fbbf24)";
      default:
        return "linear-gradient(90deg, #94a3b8, #cbd5e1)";
    }
  })();

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>0 ก.</span>
        <span>{scaleMaxGr.toFixed(0)} ก.</span>
      </div>
      <div className="relative h-5 bg-gray-100 rounded-full overflow-hidden">
        {/* Fill bar */}
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
          style={{ width: `${currentPct}%`, background: fillGradient }}
        />

        {/* Markers */}
        {markers.map((m, i) => {
          const markerPct = Math.min(100, (m.weightGr / scaleMaxGr) * 100);
          return (
            <div
              key={i}
              className="absolute top-0 bottom-0 w-0.5"
              style={{ left: `${markerPct}%`, backgroundColor: `${m.color}80` }}
            />
          );
        })}

        {/* Current weight label */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[10px] font-black text-white drop-shadow-sm">
            {currentWeight < 10 ? currentWeight.toFixed(1) : currentWeight.toFixed(0)} ก.
          </span>
        </div>
      </div>

      {/* Markers legend */}
      <div className={`flex items-center ${markers.length > 1 ? "justify-between" : "justify-center"} text-[10px] font-semibold`}>
        {markers.map((m, i) => (
          <div key={i} className="flex items-center gap-1" style={{ color: m.color }}>
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: `${m.color}80` }} />
            {m.label}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Stat Pill ──────────────────────────────────────────────── */

function StatPill({
  icon,
  label,
  value,
  unit,
  gradient,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit?: string;
  gradient: string;
}) {
  return (
    <div className={`rounded-xl p-3 flex flex-col gap-1 bg-gradient-to-br ${gradient}`}>
      <div className="flex items-center gap-1.5 text-white/60">
        {icon}
        <span className="text-[11px] font-semibold">{label}</span>
      </div>
      <p className="text-base font-black text-white leading-none">
        {value}
        {unit && <span className="text-xs font-semibold ml-1 opacity-70">{unit}</span>}
      </p>
    </div>
  );
}

/* ── Main Component ────────────────────────────────────────── */

export default function HarvestAdvisor({ assessment, farmType }: Props) {
  const advice = computeHarvestAdvice(assessment, farmType);

  // ไอคอนตามสถานะ
  const statusIcon = (() => {
    switch (advice.readiness) {
      case "optimal-sell":
        return "🔔";
      case "ready-premium":
        return "🏆";
      case "ready-general":
        return "✅";
      case "ready-transfer":
        return "🚚";
      case "approaching":
        return "⏳";
      default:
        return "🐟";
    }
  })();

  // หัวข้อการ์ดตาม farmType
  const cardTitle = farmType === 'MARKET'
    ? 'คำแนะนำการจับปลา'
    : 'คำแนะนำการส่งต่อปลา';

  return (
    <div
      className="rounded-2xl border shadow-sm overflow-hidden"
      style={{ backgroundColor: advice.bgColor, borderColor: `${advice.color}20` }}
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center gap-2.5 mb-2">
          <span className="text-2xl">{statusIcon}</span>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-[#093832]">{cardTitle}</h3>
            <span
              className="inline-block text-xs font-bold px-2 py-0.5 rounded-full mt-1"
              style={{ color: advice.color, backgroundColor: `${advice.color}15` }}
            >
              {advice.readinessLabel}
            </span>
          </div>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">{advice.description}</p>
      </div>

      {/* Progress bar */}
      <div className="px-5 py-3">
        <StageProgressBar
          currentWeight={assessment.latestWeightGr}
          advice={advice}
        />
      </div>

      {/* Signals */}
      {advice.signals.length > 0 && (
        <div className="px-5 pb-3 space-y-2">
          {advice.signals.map((sig) => (
            <div
              key={sig.key}
              className={`flex items-start gap-2.5 rounded-xl border px-3 py-2.5 ${signalBg(sig.type)}`}
            >
              <SignalIcon type={sig.type} />
              <div className="min-w-0">
                <p className="text-xs font-bold text-gray-700">{sig.title}</p>
                <p className="text-[11px] text-gray-500 leading-snug mt-0.5">{sig.detail}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Target & estimates */}
      <div className="px-5 pb-5 space-y-3">
        {/* เป้าหมายถัดไป */}
        {advice.nextTarget && (
          <div className="flex items-center gap-3 bg-white/70 rounded-xl px-4 py-3 border border-white">
            <Target className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-bold text-gray-600">เป้าหมายถัดไป: {advice.nextTarget.label}</p>
              <p className="text-[11px] text-gray-400">
                ต้องได้น้ำหนัก {advice.nextTarget.weightGr} ก. (เหลืออีก{" "}
                {(advice.nextTarget.weightGr - assessment.latestWeightGr).toFixed(0)} ก.)
              </p>
            </div>
            {advice.estimatedDaysToTarget != null && (
              <div className="text-right flex-shrink-0">
                <p className="text-lg font-black text-[#093832]">~{advice.estimatedDaysToTarget}</p>
                <p className="text-[10px] text-gray-400 font-semibold">วัน</p>
              </div>
            )}
          </div>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2">
          {/* ผลผลิตโดยประมาณ */}
          {advice.estimatedYieldKg != null && (
            <StatPill
              icon={<Package className="w-3.5 h-3.5" />}
              label="ผลผลิตประมาณ"
              value={advice.estimatedYieldKg.toFixed(1)}
              unit="กก."
              gradient="from-[#093832] to-[#0f6554]"
            />
          )}

          {/* วันที่เลี้ยง */}
          {advice.estimatedDaysToTarget != null && (
            <StatPill
              icon={<Timer className="w-3.5 h-3.5" />}
              label="อีกประมาณ"
              value={`~${advice.estimatedDaysToTarget}`}
              unit="วัน"
              gradient="from-[#1e40af] to-[#0ea5e9]"
            />
          )}

          {/* ถ้าไม่มี target แต่มี yield → แสดง revenue แทน */}
          {advice.estimatedDaysToTarget == null && advice.estimatedRevenue != null && (
            <StatPill
              icon={<Banknote className="w-3.5 h-3.5" />}
              label="รายได้ประมาณ"
              value={`${(advice.estimatedRevenue.min / 1000).toFixed(1)}–${(advice.estimatedRevenue.max / 1000).toFixed(1)}`}
              unit="พันบาท"
              gradient="from-[#1e40af] to-[#0ea5e9]"
            />
          )}
        </div>

        {/* กำไร/ขาดทุน — แสดงเฉพาะ MARKET และเมื่อปลาพร้อมจับ */}
        {farmType === 'MARKET' &&
          (advice.readiness === "ready-general" ||
            advice.readiness === "ready-premium" ||
            advice.readiness === "optimal-sell") &&
          advice.estimatedProfit != null && (
            <div className="bg-white/80 rounded-xl border border-white px-4 py-3">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-gray-500" />
                <span className="text-xs font-bold text-gray-600">ประมาณการกำไร (ถ้าจับตอนนี้)</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-[10px] text-gray-400 font-semibold">ต้นทุนรวม</p>
                  <p className="text-sm font-bold text-gray-700">{assessment.totalCost.toLocaleString()} ฿</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-semibold">รายได้ประมาณ</p>
                  <p className="text-sm font-bold text-emerald-600">
                    {advice.estimatedRevenue
                      ? `${(advice.estimatedRevenue.min / 1000).toFixed(0)}–${(advice.estimatedRevenue.max / 1000).toFixed(0)}k`
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-semibold">กำไรประมาณ</p>
                  <p
                    className={`text-sm font-bold ${
                      advice.estimatedProfit.min >= 0 ? "text-emerald-600" : "text-red-500"
                    }`}
                  >
                    {advice.estimatedProfit.min >= 0 ? "+" : ""}
                    {(advice.estimatedProfit.min / 1000).toFixed(0)}–
                    {advice.estimatedProfit.max >= 0 ? "+" : ""}
                    {(advice.estimatedProfit.max / 1000).toFixed(0)}k
                  </p>
                </div>
              </div>
              <p className="text-[10px] text-gray-400 text-center mt-2">
                * คำนวณจากราคาปลาดุกสด 40–60 บาท/กก. (ราคาอาจเปลี่ยนแปลง)
              </p>
            </div>
          )}
      </div>
    </div>
  );
}
