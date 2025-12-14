"use client";

import { DashboardGroup } from "@/hooks/useDashboardData";

const EXTRACT_DIGITS = /(\d+)/;

const clamp = (value: number, min = 0, max = 1) => Math.max(min, Math.min(max, value));

const extractAgeDays = (label?: string | null): number | null => {
  if (!label) return null;
  const match = label.match(EXTRACT_DIGITS);
  if (!match) return null;
  const parsed = Number.parseInt(match[1], 10);
  return Number.isNaN(parsed) ? null : parsed;
};

type StageConfig = {
  label: string;
  min: number;
  max: number;
};

type FarmProgressConfig = {
  title: string;
  subtitle: string;
  stage: StageConfig;
  gradient: [string, string];
  accent: string;
  tipTitle: string;
  description: string;
  milestoneAction: string;
  milestoneDay: number;
  readyText: string;
};

const FARM_PROGRESS_CONFIG: Record<DashboardGroup, FarmProgressConfig> = {
  SMALL: {
    title: "สถานะรอบอนุบาล",
    subtitle: "ติดตามลูกปลาตุ้มก่อนย้ายไปบ่อปลานิ้ว",
    stage: { label: "ปลาตุ้ม (7-10 วัน)", min: 7, max: 10 },
    gradient: ["#FFEDD5", "#FDBA74"],
    accent: "#F97316",
    tipTitle: "เตรียมย้ายบ่อ",
    description: "รักษาอุณหภูมิให้นิ่ง ให้อาหารถี่และเบา เฝ้าดูพฤติกรรมการกินทุกมื้อเพื่อคัดลูกปลาที่อ่อนแรงออกก่อนแพร่เชื้อ",
    milestoneAction: " เตรียมย้ายไปบ่อปลานิ้ว",
    milestoneDay: 10,
    readyText: "ถึงรอบย้ายไปบ่อปลานิ้วหรือเริ่มรอบใหม่แล้ว",
  },
  LARGE: {
    title: "ช่วงปลานิ้ว",
    subtitle: "เร่งโตให้พร้อมย้ายบ่อขุนใหญ่",
    stage: { label: "ปลานิ้ว (11-30 วัน)", min: 11, max: 30 },
    gradient: ["#DBEAFE", "#A5B4FC"],
    accent: "#2563EB",
    tipTitle: "โฟกัสการเตรียมย้าย",
    description: "คุมความหนาแน่นไม่ให้แออัด เพิ่มโปรตีนตามอัตราการกินจริง และติดตามค่าออกซิเจนละลายน้ำทุกวัน",
    milestoneAction: " เตรียมส่งต่อเข้าบ่อปลาตลาด",
    milestoneDay: 30,
    readyText: "พร้อมย้ายเข้าบ่อปลาตลาดแล้ว",
  },
  MARKET: {
    title: "รอบขุนปลาตลาด",
    subtitle: "วางแผนวันจับขายลอตถัดไป",
    stage: { label: "ปลาตลาด (31-180 วัน)", min: 31, max: 180 },
    gradient: ["#DCFCE7", "#86EFAC"],
    accent: "#16A34A",
    tipTitle: "วางแผนจับขาย",
    description: "ตรวจสุขภาพเหงือกและสีผิวสัปดาห์ละครั้ง จัดการอาหารให้ตรงกับเป้าหมาย FCR และติดตามน้ำหนักเฉลี่ยทุก 7 วัน",
    milestoneAction: " เตรียมจับขายล็อตแรก",
    milestoneDay: 90,
    readyText: "ถึงช่วงจับขายได้เลย จัดคิวรถขนส่งและแจ้งลูกค้าได้ทันที",
  },
};

type AgeAdvisoryCardProps = {
  group: DashboardGroup;
  latestFishAgeLabel?: string | null;
  loading: boolean;
};

const AgeAdvisoryCard = ({ group, latestFishAgeLabel, loading }: AgeAdvisoryCardProps) => {
  const config = FARM_PROGRESS_CONFIG[group];
  const ageDays = extractAgeDays(latestFishAgeLabel);
  const stageSpan = Math.max(1, config.stage.max - config.stage.min);
  const progressRatio = typeof ageDays === "number"
    ? clamp((ageDays - config.stage.min) / stageSpan)
    : 0;

  const milestoneDelta = typeof ageDays === "number"
    ? Math.ceil(config.milestoneDay - ageDays)
    : null;

  const statusBadge = (() => {
    if (typeof ageDays !== "number") {
      return { label: "รอข้อมูลล่าสุด", className: "bg-gray-100 text-gray-600" };
    }
    if (ageDays < config.stage.min) {
      return { label: "ยังไม่ถึงช่วงหลัก", className: "bg-amber-50 text-amber-700" };
    }
    if (ageDays > config.stage.max) {
      return { label: "เกินช่วงแนะนำ", className: "bg-red-50 text-red-700" };
    }
    return { label: "อยู่ในช่วงเหมาะสม", className: "bg-emerald-50 text-emerald-700" };
  })();

  return (
    <section className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-gray-400">อายุรอบล่าสุด</p>
          <h3 className="text-xl font-bold text-[#093832]">{config.title}</h3>
          <p className="text-sm text-gray-600">{config.subtitle}</p>
        </div>
        <span className={`text-xs font-semibold px-4 py-1 rounded-full ${statusBadge.className}`}>
          {statusBadge.label}
        </span>
      </div>

      {loading ? (
        <div className="py-6 text-center text-sm text-gray-500">กำลังโหลดข้อมูล...</div>
      ) : (
        <>
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">อายุเฉลี่ยที่รายงาน</p>
              <p className="text-3xl font-extrabold text-[#0F3B35]">
                {typeof ageDays === "number" ? ageDays : "-"}
                <span className="text-base font-bold text-gray-500 ml-1">วัน</span>
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {latestFishAgeLabel ?? "ยังไม่มีข้อมูลการบันทึกรอบล่าสุด"}
              </p>
            </div>
            <div className="text-sm text-gray-600">
              <p className="text-xs text-gray-500 text-right">ช่วงที่ต้องจับตา</p>
              <p className="text-right text-base font-semibold text-[#093832]">
                {config.stage.min} – {config.stage.max} วัน
              </p>
              <p className="text-right text-xs text-gray-500">{config.stage.label}</p>
            </div>
          </div>

          <div className="mt-4">
            <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full transition-[width] duration-700"
                style={{
                  width: `${progressRatio * 100}%`,
                  backgroundImage: `linear-gradient(90deg, ${config.gradient[0]}, ${config.gradient[1]})`,
                }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-gray-500 mt-1">
              <span>{config.stage.min} วัน</span>
              <span>{config.stage.max} วัน</span>
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-[#F4FFFC] border border-emerald-50 p-4 text-sm text-[#0F3B35] space-y-2">
            <p className="font-semibold text-[#093832]">{config.tipTitle}</p>
            <p>{config.description}</p>
            <p className="font-semibold text-[#0F614E]">
              {milestoneDelta === null
                ? "ยังไม่มีข้อมูลอายุพอสำหรับคำแนะนำ"
                : milestoneDelta > 0
                  ? `อีก ${milestoneDelta} วัน${config.milestoneAction}`
                  : config.readyText}
            </p>
          </div>
        </>
      )}
    </section>
  );
};

export default AgeAdvisoryCard;
