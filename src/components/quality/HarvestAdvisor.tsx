/**
 * HarvestAdvisor — การ์ดคำแนะนำจับ/ส่งต่อปลา
 *
 * รองรับ 3 ระยะ:
 * - SMALL (ปลาตุ้ม) → เป้าหมาย: ส่งต่อเป็นปลานิ้ว (≥5 ก.)
 * - LARGE (ปลานิ้ว) → เป้าหมาย: ส่งต่อเป็นปลาตลาด (≥30 ก.)
 * - MARKET (ปลาตลาด) → เป้าหมาย: จับขาย (≥150 ก. ตลาดทั่วไป / ≥500 ก. พรีเมียม)
 */
"use client";

import type {
  QualityAssessment,
  HarvestAdvice,
  HarvestSignal,
  FarmType,
} from "@/utils/catfishGrowth";
import { computeHarvestAdvice } from "@/utils/catfishGrowth";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  ChevronRight,
} from "lucide-react";

interface Props {
  assessment: QualityAssessment;
  farmType: FarmType;
}

/* ── helpers ──────────────────────────────────────────────── */

function SignalIcon({ type }: { type: HarvestSignal["type"] }) {
  const base = "w-[18px] h-[18px] flex-shrink-0";
  switch (type) {
    case "positive":
      return <CheckCircle2 className={`${base} text-emerald-500`} />;
    case "warning":
      return <AlertTriangle className={`${base} text-amber-500`} />;
    case "critical":
      return <AlertTriangle className={`${base} text-red-500`} />;
    default:
      return <Info className={`${base} text-sky-500`} />;
  }
}

function signalBorder(type: HarvestSignal["type"]) {
  switch (type) {
    case "positive":
      return "border-l-emerald-400";
    case "warning":
      return "border-l-amber-400";
    case "critical":
      return "border-l-red-400";
    default:
      return "border-l-sky-400";
  }
}

/* ── Progress bar ────────────────────────────────────────── */

function ProgressSection({
  currentWeight,
  advice,
}: {
  currentWeight: number;
  advice: HarvestAdvice;
}) {
  const { markers, scaleMaxGr } = advice.progressBar;
  const currentPct = Math.min(100, (currentWeight / scaleMaxGr) * 100);

  const fillColor = (() => {
    switch (advice.readiness) {
      case "optimal-sell":
      case "ready-premium":
        return "linear-gradient(90deg, #059669, #10b981)";
      case "ready-general":
      case "ready-transfer":
        return "linear-gradient(90deg, #34d399, #6ee7b7)";
      case "approaching":
        return "linear-gradient(90deg, #f59e0b, #fbbf24)";
      default:
        return "linear-gradient(90deg, #94a3b8, #cbd5e1)";
    }
  })();

  const remaining = advice.nextTarget
    ? advice.nextTarget.weightGr - currentWeight
    : 0;

  return (
    <div className="space-y-3">
      {/* ── bar ── */}
      <div>
        <div className="relative h-7 bg-gray-100 rounded-full overflow-hidden border border-gray-200/60">
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
            style={{ width: `${currentPct}%`, background: fillColor }}
          />
          {markers.map((m, i) => {
            const pct = Math.min(100, (m.weightGr / scaleMaxGr) * 100);
            return (
              <div
                key={i}
                className="absolute top-0 bottom-0 w-[2px]"
                style={{ left: `${pct}%`, backgroundColor: m.color, opacity: 0.45 }}
              />
            );
          })}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-extrabold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.45)]">
              {currentWeight < 10
                ? currentWeight.toFixed(1)
                : currentWeight.toFixed(0)}{" "}
              ก.
            </span>
          </div>
        </div>

        {/* legend */}
        <div
          className={`flex items-center mt-1.5 ${
            markers.length > 1 ? "justify-between" : "justify-end"
          } text-[11px] font-bold text-gray-400`}
        >
          {markers.map((m, i) => (
            <span key={i} className="flex items-center gap-1" style={{ color: m.color }}>
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{ backgroundColor: m.color }}
              />
              {m.label}
            </span>
          ))}
        </div>
      </div>

      {/* ── target row (integrated) ── */}
      {advice.nextTarget && (
        <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-800 flex items-center gap-1">
              <ChevronRight className="w-4 h-4 text-gray-400" />
              {advice.nextTarget.label}
            </p>
            <p className="text-xs text-gray-500 mt-0.5 pl-5">
              เป้าหมาย {advice.nextTarget.weightGr} ก.
              {remaining > 0 && <> &middot; เหลืออีก <strong className="text-gray-700">{remaining.toFixed(0)} ก.</strong></>}
            </p>
          </div>
          {advice.estimatedDaysToTarget != null && (
            <div className="text-right flex-shrink-0 bg-[#093832] rounded-lg px-3 py-1.5">
              <p className="text-lg font-black text-white leading-tight">
                ~{advice.estimatedDaysToTarget}
              </p>
              <p className="text-[10px] font-bold text-white/60">วัน</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Main ─────────────────────────────────────────────────── */

export default function HarvestAdvisor({ assessment, farmType }: Props) {
  const advice = computeHarvestAdvice(assessment, farmType);

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

  const cardTitle =
    farmType === "MARKET" ? "คำแนะนำการจับปลา" : "คำแนะนำการส่งต่อปลา";

  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
      {/* ── header strip ── */}
      <div
        className="px-5 pt-5 pb-4"
        style={{
          background: `linear-gradient(135deg, ${advice.bgColor}, white)`,
        }}
      >
        <div className="flex items-start gap-3">
          <span className="text-2xl leading-none mt-0.5">{statusIcon}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-[15px] font-extrabold text-[#093832]">
                {cardTitle}
              </h3>
              <span
                className="text-[11px] font-bold px-2.5 py-0.5 rounded-full"
                style={{
                  color: advice.color,
                  backgroundColor: `${advice.color}14`,
                  border: `1px solid ${advice.color}25`,
                }}
              >
                {advice.readinessLabel}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">
              {advice.description}
            </p>
          </div>
        </div>
      </div>

      {/* ── progress + target ── */}
      <div className="px-5 pb-4">
        <ProgressSection
          currentWeight={assessment.latestWeightGr}
          advice={advice}
        />
      </div>

      {/* ── signals (FCR, ADG, days) ── */}
      {advice.signals.length > 0 && (
        <div className="px-5 pb-4 space-y-2">
          {advice.signals.map((sig) => (
            <div
              key={sig.key}
              className={`flex items-start gap-3 rounded-lg bg-gray-50 border-l-[3px] px-3.5 py-2.5 ${signalBorder(sig.type)}`}
            >
              <SignalIcon type={sig.type} />
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-800">{sig.title}</p>
                <p className="text-xs text-gray-500 leading-relaxed mt-0.5">
                  {sig.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

