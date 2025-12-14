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
  milestoneAction: string;
  milestoneDay: number;
  readyText: string;
};

const FARM_PROGRESS_CONFIG: Record<DashboardGroup, FarmProgressConfig> = {
  SMALL: {
    title: "สถานะรอบการเลี้ยงปลาตุ้ม",
    subtitle: "ติดตามลูกปลาตุ้มก่อนย้ายไปบ่อปลานิ้ว",
    stage: { label: "ปลาตุ้ม (7-10 วัน)", min: 7, max: 10 },
    gradient: ["#FFEDD5", "#FDBA74"],
    accent: "#F97316",
    milestoneAction: " เตรียมย้ายไปบ่อปลานิ้ว",
    milestoneDay: 10,
    readyText: "ถึงรอบย้ายไปบ่อปลานิ้วหรือเริ่มรอบใหม่แล้ว",
  },
  LARGE: {
    title: "สถานะรอบการเลี้ยงปลานิ้ว",
    subtitle: "เร่งโตให้พร้อมย้ายบ่อขุนใหญ่",
    stage: { label: "ปลานิ้ว (11-30 วัน)", min: 11, max: 30 },
    gradient: ["#DBEAFE", "#A5B4FC"],
    accent: "#2563EB",
    milestoneAction: " เตรียมส่งต่อเข้าบ่อปลาตลาด",
    milestoneDay: 30,
    readyText: "พร้อมย้ายเข้าบ่อปลาตลาดแล้ว",
  },
  MARKET: {
    title: "สถานะรอบการเลี้ยงปลาตลาด",
    subtitle: "วางแผนวันจับขายลอตถัดไป",
    stage: { label: "ปลาตลาด (31-180 วัน)", min: 31, max: 180 },
    gradient: ["#DCFCE7", "#86EFAC"],
    accent: "#16A34A",
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

  return (
    <section className="rounded-3xl p-5 shadow-sm border border-[#FECBA9] bg-gradient-to-br from-[#FFF7ED] to-[#FFEAD5]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-[#8C3A0C]">{config.title}</h3>
        </div>
      </div>

      {loading ? (
        <div className="py-6 text-center text-sm text-gray-500">กำลังโหลดข้อมูล...</div>
      ) : (
        <>
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">อายุเฉลี่ยที่รายงาน</p>
              <p className="text-3xl font-extrabold text-[#7C2D12]">
                {typeof ageDays === "number" ? ageDays : "-"}
                <span className="text-base font-bold text-gray-500 ml-1">วัน</span>
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {latestFishAgeLabel ?? "ยังไม่มีข้อมูลการบันทึกรอบล่าสุด"}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <div className="h-3 rounded-full bg-white/70 overflow-hidden">
              <div
                className="h-full rounded-full transition-[width] duration-700"
                style={{
                  width: `${progressRatio * 100}%`,
                  backgroundImage: `linear-gradient(90deg, ${config.gradient[0]}, ${config.gradient[1]})`,
                }}
              />
            </div>
            <div className="flex justify-between text-sm text-gray-500 mt-1">
              <span>{config.stage.min} วัน</span>
              <span>{config.stage.max} วัน</span>
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-white/70 border border-white/60 p-4 text-sm text-[#7C2D12]">
            <p className="text-xs uppercase tracking-[0.2em] text-[#B45309] mb-1">ขั้นถัดไป</p>
            <p className="text-base font-semibold">
              {milestoneDelta === null
                ? "รอข้อมูลรอบล่าสุด"
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
