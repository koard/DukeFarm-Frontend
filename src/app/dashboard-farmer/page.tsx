"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useDashboardData } from "@/hooks/useDashboardData";
import { ProfileDropdownMenu } from "@/components/common/ProfileDropdownMenu";
import FarmNavigation from "@/components/navigation/FarmNavigation";
import { FarmTypeOption } from "@/utils/farmTypes";

// ----------------------------------------------------------------------
// Types & Interfaces
// ----------------------------------------------------------------------

interface GraphDataPoint {
  month: string;
  value: number;
}

interface ComfortRange {
  min: number;
  max: number;
}

interface ForecastData {
  date: string;
  highTemperatureC: number;
  lowTemperatureC: number;
  feedAdjustmentPct: number;
  feedingRecommendation: "increase" | "decrease" | "normal";
  weatherCode: number;
}

interface WeatherData {
  time: string;
  temperatureC: number;
  humidityPct: number;
  windSpeedKph: number;
  rainMm: number;
  conditionText: string;
}

interface DashboardSummary {
  asOf: string;
  airTemperatureC: number | null;
  temperatureDeltaC: number | null;
  comfortRangeC: { min: number; max: number };
  recommendedFeedAdjustmentPct: number | null;
  weather: WeatherData | null;
  latestFishAgeLabel: string | null;
  latestFishAgeDays?: number;
  latestFishStageName?: string;
  averageFishWeight?: number;
  pelletFoodCost: number;
  freshFoodCost: number;
  survivalRatePct: number;
  survivalSeries: GraphDataPoint[];
}

interface DashboardData {
  group: string;
  hasData: boolean;
  summary: DashboardSummary;
  feedingPlan: ForecastData[];
}

// ----------------------------------------------------------------------
// Constants & Helpers
// ----------------------------------------------------------------------

const COMFORT_RANGES: Record<FarmTypeOption, ComfortRange> = {
  SMALL: { min: 28, max: 34 },
  LARGE: { min: 27, max: 35 },
  MARKET: { min: 26, max: 36 },
};

const getComfortRange = (type: FarmTypeOption) => COMFORT_RANGES[type] || COMFORT_RANGES.SMALL;

const calculateRealTimeAge = (asOfDate?: string | null, recordedAge?: number | null): number | undefined => {
  if (!asOfDate || typeof recordedAge !== 'number') {
    return undefined;
  }
  const lastUpdate = new Date(asOfDate);
  const now = new Date();
  lastUpdate.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  const diffTime = now.getTime() - lastUpdate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, recordedAge + diffDays);
};

const getSurvivalStatusStyles = (percentage: number) => {
  if (percentage >= 90) {
    return {
      bg: "bg-[#E6FFFA]",
      text: "text-[#047857]",
      label: "▲ (สูง)"
    };
  } else if (percentage >= 75) {
    return {
      bg: "bg-[#FFF9C4]",
      text: "text-[#854D0E]",
      label: "● (ปกติ)"
    };
  } else if (percentage >= 50) {
    return {
      bg: "bg-[#FFCCBC]",
      text: "text-[#BF360C]",
      label: "▼ (ค่อนข้างต่ำ)"
    };
  } else {
    return {
      bg: "bg-[#FFCDD2]",
      text: "text-[#B91C1C]",
      label: "▼ (ต่ำมาก)"
    };
  }
};

const getWeatherIconFromCode = (code: number): string => {
  if (code <= 1) return 'fluent_weather-sunny.svg';
  if (code <= 3) return 'fluent-color_weather-sunny.svg';
  if (code >= 51 && code <= 67) return 'fluent_weather-rain-snow.svg';
  if (code >= 80 && code <= 82) return 'fluent_weather-rain-snow.svg';
  if (code >= 95 && code <= 99) return 'fluent_weather-hail-day.svg';
  return 'fluent-color_weather-sunny.svg';
};

const formatThaiDate = (isoDate?: string | null): string => {
  if (!isoDate) return "-";
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }
  return parsed.toLocaleDateString("th-TH", { day: '2-digit', month: '2-digit', year: '2-digit' });
};

// ----------------------------------------------------------------------
// Component
// ----------------------------------------------------------------------

function DashboardContent() {
  const searchParams = useSearchParams();
  const pondId = searchParams.get("pondId") || undefined;
  const initialType = (searchParams.get("type") as FarmTypeOption) || "SMALL";

  const [farmType, setFarmType] = useState<FarmTypeOption>(initialType);
  const [weatherState] = useState("sunny_day"); // Could be dynamic based on time/code

  useEffect(() => {
    const typeParam = searchParams.get("type");
    if (typeParam) {
      setFarmType(typeParam as FarmTypeOption);
    }
  }, [searchParams]);

  const { data: dashboardData, loading, error } = useDashboardData<DashboardData>(farmType, pondId);

  const getWeatherBg = () => {
    switch (weatherState) {
      case "hot_day": return "from-[#FF5F6D] to-[#FFC371]";
      case "night": return "from-[#1A2A6C] via-[#B21F1F] to-[#FDBB2D]";
      default: return "from-[#4facfe] to-[#00f2fe]";
    }
  };

  const getSubLink = (sub: string) => {
    const params = new URLSearchParams();
    if (pondId) params.set("pondId", pondId);
    params.set("type", farmType);
    return `/dashboard-farmer/${sub}?${params.toString()}`;
  };

  const currentTemp = dashboardData?.summary?.weather?.temperatureC ?? 0;
  const currentCondition = dashboardData?.summary?.weather?.conditionText ?? "Unknown";
  const todayForecast = dashboardData?.feedingPlan?.[0];
  const highTemp = todayForecast?.highTemperatureC ?? 0;
  const lowTemp = todayForecast?.lowTemperatureC ?? 0;

  const tempDelta = dashboardData?.summary?.temperatureDeltaC ?? 0;
  const tempAdvice = (() => {
    if (tempDelta === 0) return "อุณหภูมิปกติ";
    if (tempDelta > 0) return `สูงกว่าปกติ ${tempDelta.toFixed(1)}°C`;
    return `ต่ำกว่าปกติ ${Math.abs(tempDelta).toFixed(1)}°C`;
  })();

  const feedAdvice = (() => {
    const pct = dashboardData?.summary?.recommendedFeedAdjustmentPct ?? 0;
    if (pct === 0) return "ให้อาหารปกติ";
    if (pct > 0) return `เพิ่มอาหาร ${pct}%`;
    return `ลดอาหาร ${Math.abs(pct)}%`;
  })();

  // Pond Summary Data
  const currentPondIdx = pondId ? parseInt(pondId.replace(/\D/g, '')) || 1 : 1; // Fallback aesthetics
  const fishType = dashboardData?.summary?.latestFishStageName || "ไม่ระบุ"; // e.g. "ปลานิ้ว"
  const avgWeight = dashboardData?.summary?.averageFishWeight ? dashboardData.summary.averageFishWeight.toFixed(1) : "-";
  const releaseDate = formatThaiDate(dashboardData?.summary?.asOf); // Using asOf as proxy for last record/release for now if explicit releaseDate missing
  const releaseCount = "-"; // Backend doesn't send total released yet in summary, might need enhancement
  const remainingCount = "-"; // Same
  const survivalRate = dashboardData?.summary?.survivalRatePct ?? 100;

  // Market size mapping (Mock/Approximation based on type)
  const marketSizeMap: Record<string, string> = {
    SMALL: "2-5",
    LARGE: "15-25",
    MARKET: "800-1000"
  };
  const marketSize = marketSizeMap[farmType] || "-";

  const survivalStatus = getSurvivalStatusStyles(survivalRate);

  return (
    <div className="min-h-screen bg-white pb-10 font-sans">

      {/* -------------------------------------------------------------------------
          (ส่วนหัวฟาร์ม - ห้ามแก้ตามต้นฉบับเดิม)
          ------------------------------------------------------------------------- */}
      <div className="bg-[#093832] text-white px-4 pt-8 pb-10 rounded-b-[40px] shadow-md relative z-30">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Image src="/dashboard/Group.svg" alt="Overview" width={24} height={24} />
            <h1 className="text-2xl font-bold">ภาพรวมฟาร์ม</h1>
          </div>
          <ProfileDropdownMenu />
        </div>
      </div>

      {/* -------------------------------------------------------------------------
          1. NAVIGATION
          ------------------------------------------------------------------------- */}
      <div className="relative z-20 -mt-6 mx-5">
        <FarmNavigation />
      </div>

      <div className="px-5 mt-6 max-w-7xl mx-auto space-y-6">

        {/* -------------------------------------------------------------------------
            2. DATE VIEW
            ------------------------------------------------------------------------- */}
        <div className="flex items-center gap-2 ml-1">
          <Image src="/dashboard/solar_calendar-outline.svg" alt="cal" width={22} height={22} />
          <span className="text-base font-bold text-[#093832]">
            ข้อมูล ณ วันที่ {formatThaiDate(dashboardData?.summary?.asOf)}
          </span>
        </div>

        {/* -------------------------------------------------------------------------
            3. IPHONE WEATHER CARD
            ------------------------------------------------------------------------- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`relative overflow-hidden rounded-[35px] p-8 text-white bg-gradient-to-br ${getWeatherBg()} shadow-2xl transition-all`}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -mr-20 -mt-20" />

          <div className="relative z-10 flex flex-col items-center">
            <div className="flex items-center gap-1 opacity-80 mb-1">
              <span className="text-[10px] transform -rotate-45">▲</span>
              <span className="text-xl font-medium tracking-wide">
                {loading ? "Loading..." : "สภาพอากาศปัจจุบัน"}
              </span>
            </div>

            <span className="text-[110px] font-extralight leading-none my-4 drop-shadow-md">
              {loading ? "--" : Math.round(currentTemp)}°
            </span>

            <span className="text-xl font-medium opacity-90">{currentCondition}</span>
            <div className="flex gap-4 mt-3 text-lg font-bold opacity-80">
              <span>H:{Math.round(highTemp)}°</span>
              <span>L:{Math.round(lowTemp)}°</span>
            </div>
          </div>
        </motion.div>

        {/* -------------------------------------------------------------------------
            4. TEMPERATURE REPORT
            ------------------------------------------------------------------------- */}
        <div className="bg-gradient-to-r from-[#BBE3FB] to-[#CFFFD5] rounded-[25px] p-6 shadow-sm border border-white/50">
          <div className="flex items-center gap-3 mb-2 text-[#093832]">
            <Image src="/dashboard/fluent_temperature.svg" alt="temp" width={22} height={22} />
            <span className="text-base font-bold">รายงานอุณหภูมิ</span>
          </div>
          <p className="text-xl font-black text-[#093832] text-center leading-relaxed">
            {loading ? "..." : (
              <>
                วันนี้{tempAdvice} <br />
                แนะนำให้{feedAdvice}
              </>
            )}
          </p>
        </div>

        {/* -------------------------------------------------------------------------
            5. FORECAST SECTION
            ------------------------------------------------------------------------- */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 ml-1">
            <Image src="/dashboard/fluent_weather-hail-day.svg" alt="forecast" width={24} height={24} />
            <h3 className="text-base font-bold text-[#093832]">คาดการณ์สภาพอากาศและการให้อาหาร</h3>
          </div>

          <div className="bg-[#F4FFFC] rounded-[30px] p-6 shadow-sm border border-emerald-50">
            <div className="grid grid-cols-3 mb-5 border-b border-emerald-100 pb-4">
              <div className="text-sm font-bold text-[#75CFB6] text-center">วันที่</div>
              <div className="text-sm font-bold text-[#75CFB6] text-center">สภาพอากาศ</div>
              <div className="text-sm font-bold text-[#75CFB6] text-center">ปริมาณอาหารที่แนะนำ</div>
            </div>

            <div className="space-y-6">
              {loading ? (
                <div className="text-center text-gray-400 py-4">Loading...</div>
              ) : (
                dashboardData?.feedingPlan?.slice(0, 5).map((item, index) => {
                  const tempRange = `${Math.round(item.highTemperatureC)} / ${Math.round(item.lowTemperatureC)} °C`;
                  const advice = item.feedAdjustmentPct > 0
                    ? `เพิ่มขึ้น ${item.feedAdjustmentPct}%`
                    : item.feedAdjustmentPct < 0
                      ? `ลดลง ${Math.abs(item.feedAdjustmentPct)}%`
                      : "ปกติ";

                  return (
                    <div key={index} className="grid grid-cols-3 items-center hover:bg-[#E0F7FA] rounded-xl transition-colors duration-200 -mx-2 px-2 py-1">
                      <div className="text-sm font-bold text-[#0F614E] text-center">
                        {formatThaiDate(item.date)}
                      </div>

                      <div className="flex items-center justify-center gap-3">
                        <Image src={`/dashboard/${getWeatherIconFromCode(item.weatherCode)}`} alt="weather" width={24} height={24} />
                        <span className="text-sm font-bold text-[#0F614E]">
                          {tempRange}
                        </span>
                      </div>

                      <div className="text-sm font-bold text-[#0F614E] text-center uppercase">
                        {advice}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* -------------------------------------------------------------------------
            6. POND SUMMARY 
            ------------------------------------------------------------------------- */}
        <div className="flex items-center gap-2 mt-8 ml-1">
          <Image src="/dashboard/fluent_food-grains-w.svg" alt="summary" width={22} height={22} className="text-[#093832]" style={{ filter: 'invert(16%) sepia(34%) saturate(996%) hue-rotate(124deg) brightness(95%) contrast(93%)' }} />
          {/* Note: Icon color adjustment or use a different colored icon if needed */}
          <h3 className="text-base font-bold text-[#093832]">สรุปข้อมูล {pondId ? `(Pond ID: ${pondId.slice(0, 4)}...)` : `บ่อที่ ${currentPondIdx}`}</h3>
        </div>

        <div className="space-y-4">
          {/* (ประเภทปลา และ ขนาดเฉลี่ย */}
          <div className="bg-gradient-to-r from-[#FFF6E2] via-[#FFF6E2] to-[#E6DAFF] rounded-2xl shadow-sm flex overflow-hidden h-28 border border-orange-50/20">

            {/* ฝั่งซ้าย: ประเภทปลา */}
            <div className="flex-1 flex flex-col p-4 relative">
              <div className="flex items-center gap-1.5 mb-1">
                <Image src="/dashboard/famicons_fish-outline.svg" alt="type" width={18} height={18} />
                <span className="text-sm font-bold text-gray-900">ประเภทปลา</span>
              </div>

              <div className="flex-1 flex items-center justify-center">
                <p className="text-2xl font-black text-black">{fishType}</p>
              </div>
              {/* เส้นคั่นสีขาว */}
              <div className="absolute right-0 top-2 bottom-2 w-px bg-white shadow-sm"></div>
            </div>

            {/* ฝั่งขวา: ขนาดเฉลี่ย */}
            <div className="flex-1 flex flex-col p-4">
              <div className="flex items-center gap-1.5 mb-1">
                {/* Use a weight icon if available, reusing temp or similar for now if specific weight icon missing from snippet */}
                <Image src="/dashboard/famicons_fish-outline.svg" alt="avg" width={18} height={18} />
                <span className="text-sm font-bold text-gray-900 ">ขนาดเฉลี่ย</span>
              </div>

              <div className="flex-1 flex items-center justify-center">
                <p className="text-2xl font-black text-black">
                  {avgWeight} <span className="text-sm font-bold text-gray-900">กรัม</span>
                </p>
              </div>
            </div>
          </div>

          {/* (วันที่ปล่อยลงบ่อ) */}
          <div className="flex items-center justify-between px-2 pt-1 text-[#434343]">
            <div className="flex items-center gap-2">
              <Image src="/dashboard/solar_calendar-outline.svg" alt="date" width={20} height={20} />
              <span className="text-base font-bold">วันที่ปล่อยลงบ่อ (บันทึกล่าสุด)</span>
            </div>
            <span className="text-base font-bold">{releaseDate}</span>
          </div>

          {/* 7. QUANTITY & REMAINING */}
          <div className="grid grid-cols-2 gap-4">
            {/* กล่องจำนวนที่ปล่อย */}
            <div className="bg-[#4A59FF] rounded-2xl p-4 relative overflow-hidden text-white shadow-md h-28 flex flex-col">
              <span className="text-base font-medium opacity-90">จำนวนที่ปล่อย</span>

              <div className="flex-1 flex items-center justify-center">
                <p className="text-3xl font-black leading-none">{releaseCount}</p>
              </div>

              <Image
                src="/dashboard/famicons_fish-w.svg"
                alt="fish"
                width={60}
                height={50}
                className="absolute bottom-0 right-0 opacity-90 translate-x-1 translate-y-1"
              />
            </div>

            {/* กล่องคงเหลือ */}
            <div className="bg-[#E0A84D] rounded-2xl p-4 relative overflow-hidden text-white shadow-md h-28 flex flex-col">
              <span className="text-base font-medium opacity-90">คงเหลือ</span>

              <div className="flex-1 flex items-center justify-center">
                <p className="text-3xl font-black leading-none">{remainingCount}</p>
              </div>
              {/* Reusing fish icon mostly as placeholder if group icon missing */}
              <Image
                src="/dashboard/famicons_fish-w.svg"
                alt="group"
                width={60}
                height={50}
                className="absolute bottom-0 right-0 opacity-90 translate-x-1 translate-y-1"
              />
            </div>
          </div>

          {/* 8. SURVIVAL RATE */}
          <div className={`${survivalStatus.bg} rounded-2xl p-4 flex flex-col shadow-sm border border-white/40 transition-colors duration-300`}>

            <div className="flex items-center gap-2 mb-2">
              <Image src="/dashboard/famicons_fish-outline.svg" alt="survival" width={22} height={22} />
              <span className="text-base font-bold text-gray-700">อัตราการรอด</span>
            </div>

            <div className="flex flex-col items-center justify-center">
              <div className="flex items-baseline gap-1">
                <span className={`text-3xl font-black ${survivalStatus.text}`}>
                  {survivalRate}%
                </span>
                <span className={`text-xs font-bold ${survivalStatus.text}`}>
                  {survivalStatus.label}
                </span>
              </div>
            </div>

          </div>

          {/* 9. MARKET SIZE */}
          <div className="bg-[#F1DFFF] rounded-2xl p-4 flex flex-col shadow-sm border border-purple-100/30">
            <div className="flex items-center gap-2 mb-2">
              <Image src="/dashboard/healthicons_money-bag.svg" alt="weight" width={20} height={20} className="filter grayscale opacity-50" />
              {/* Note: using money bag as weight icon proxy or need specific weight icon */}
              <span className="text-base font-bold text-gray-700">ขนาดที่เหมาะสำหรับการขาย</span>
            </div>

            <div className="flex justify-center items-baseline gap-1">
              <p className="text-2xl font-black text-black">{marketSize}</p>
              <span className="text-lg font-bold text-black">กรัม</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 space-y-3 md:space-y-0 md:grid md:grid-cols-3 md:gap-4 md:col-span-2 lg:col-span-4">
          <Link href={getSubLink("weather")} className="block w-full">
            <button className="w-full bg-[#0084FF] hover:bg-blue-700 text-white py-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition-colors text-lg cursor-pointer">
              <Image src="/dashboard/fluent_weather-hail-day-w.svg" alt="icon" width={24} height={24} />
              สภาพอากาศ
            </button>
          </Link>

          <Link href={getSubLink("price")} className="block w-full">
            <button className="w-full bg-[#FF4242] hover:bg-[#e03535] text-white py-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition-colors text-lg cursor-pointer">
              <Image src="/dashboard/healthicons_money-bag.svg" alt="icon" width={24} height={24} />
              ตรวจสอบราคาตลาด
            </button>
          </Link>

          <Link href={getSubLink("feeding")} className="block w-full">
            <button className="w-full bg-[#EF6E11] hover:bg-orange-700 text-white py-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition-colors text-lg cursor-pointer">
              <Image src="/dashboard/fluent_food-grains-w.svg" alt="icon" width={24} height={24} />
              การให้อาหาร
            </button>
          </Link>

          <Link href={getSubLink("disease-info")} className="block w-full">
            <button className="w-full bg-[#A530FF] hover:bg-[#8a2be2] text-white py-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition-colors text-lg cursor-pointer">
              <Image src="/dashboard/famicons_fish-w.svg" alt="icon" width={24} height={24} />
              การรักษาโรค
            </button>
          </Link>

          <Link href={getSubLink("record")} className="block w-full">
            <button className="w-full bg-[#72B544] hover:bg-green-700 text-white py-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition-colors text-lg cursor-pointer">
              <Image src="/dashboard/uil_plus.svg" alt="icon" width={24} height={24} />
              บันทึกข้อมูล
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function DashboardFarmerPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <DashboardContent />
    </Suspense>
  );
}