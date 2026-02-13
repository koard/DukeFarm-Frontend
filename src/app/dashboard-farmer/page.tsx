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
  totalReleased?: number;
  currentCount?: number;
  releaseDate?: string;
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
  return parsed.toLocaleDateString("th-TH", { day: 'numeric', month: 'long', year: 'numeric' });
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

  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const { data: dashboardData, loading, error } = useDashboardData<DashboardData>(farmType, pondId);

  const getWeatherBg = () => {
    switch (weatherState) {
      case "hot_day": return "from-[#FF8C61] to-[#FFD54F]"; // Warm Orange/Yellow
      case "night": return "from-[#101820] to-[#2C3E50]";   // Deep Dark Blue/Black
      case "rain": return "from-[#4B6CB7] to-[#182848]";    // Rainy Blue
      default: return "from-[#4FACFE] to-[#00F2FE]";         // Bright Blue (Cyan)
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

  const [pondName, setPondName] = useState<string>("");

  useEffect(() => {
    const fetchPondInfo = async () => {
      try {
        // Simple client-side fetch to get pond index
        const res = await fetch('/api/farmers/me/profile');
        if (res.ok) {
          const data = await res.json();
          const ponds = data.ponds || [];
          if (pondId) {
            const idx = ponds.findIndex((p: any) => p.id === pondId);
            setPondName(idx !== -1 ? `บ่อที่ ${idx + 1}` : "บ่อที่ 1");
          } else {
            setPondName(ponds.length > 0 ? "บ่อที่ 1" : "ยังไม่มีบ่อ");
          }
        }
      } catch (e) {
        console.error("Failed to fetch profile for pond index", e);
        setPondName("บ่อที่ 1");
      }
    };
    fetchPondInfo();
  }, [pondId]);

  // Pond Summary Data
  const summary = dashboardData?.summary;
  const fishType = summary?.latestFishStageName || "ไม่ระบุ";
  const avgWeight = summary?.averageFishWeight ? summary.averageFishWeight.toFixed(1) : "-";
  const releaseDate = formatThaiDate(summary?.releaseDate);
  const releaseCount = summary?.totalReleased ? summary.totalReleased.toLocaleString() : "-";
  const remainingCount = summary?.currentCount ? summary.currentCount.toLocaleString() : "-";
  const survivalRate = summary?.survivalRatePct ?? 100;

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
      <div className="bg-[#093832] text-white px-4 pt-8 pb-10 rounded-b-[40px] shadow-md relative z-50">
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
      <div className="sticky top-0 z-40 -mt-6 mx-0 pt-4 pb-2 bg-white shadow-sm transition-all duration-300">
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
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className={`relative overflow-hidden rounded-[35px] p-8 text-white shadow-2xl transition-all bg-gradient-to-b ${getWeatherBg()}`}
        >
          {/* Background decoration */}
          <div className="absolute -top-10 -right-10 w-64 h-64 bg-white/20 rounded-full blur-[90px]" />
          <div className="absolute top-1/2 -left-10 w-40 h-40 bg-white/10 rounded-full blur-[60px]" />

          <div className="relative z-10 flex flex-col items-center justify-center text-center">

            <span className="text-2xl font-medium tracking-wide drop-shadow-sm mb-2">
              {currentTime ? currentTime.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) : (loading ? "กำลังโหลด..." : "--:--")}
            </span>

            <span className="text-[90px] font-thin leading-none tracking-tighter drop-shadow-lg my-1">
              {loading ? "--" : Math.round(currentTemp)}°
            </span>

            <span className="text-xl font-medium opacity-90 tracking-wide mb-1">
              {currentCondition}
            </span>

            <div className="flex gap-3 text-lg font-medium opacity-90">
              <span className="drop-shadow-sm">สูงสุด:{Math.round(highTemp)}°</span>
              <span>|</span>
              <span className="drop-shadow-sm">ต่ำสุด:{Math.round(lowTemp)}°</span>
            </div>
          </div>
        </motion.div>

        {/* -------------------------------------------------------------------------
            4. TEMPERATURE REPORT
            ------------------------------------------------------------------------- */}
        <div className="rounded-[25px] p-6 shadow-sm border border-white/20 bg-white/60 backdrop-blur-md">
          <div className="flex items-center gap-2 mb-3 text-[#093832]/80">
            <Image src="/dashboard/fluent_temperature.svg" alt="temp" width={20} height={20} className="opacity-70" />
            <span className="text-base font-bold uppercase tracking-wider">รายงานอุณหภูมิ</span>
          </div>
          <p className="text-lg font-medium text-[#093832] leading-relaxed">
            {loading ? "..." : (
              <>
                วันนี้{tempAdvice} <br />
                แนะนำให้{feedAdvice}
              </>
            )}
          </p>
        </div>

        {/* -------------------------------------------------------------------------
            5. FORECAST SECTION (iOS Style)
            ------------------------------------------------------------------------- */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 ml-2 opacity-80">
            <Image src="/dashboard/solar_calendar-outline.svg" alt="forecast" width={18} height={18} />
            <h3 className="text-base font-bold text-black uppercase tracking-widest">พยากรณ์ล่วงหน้า 7 วัน</h3>
          </div>

          <div className="bg-white/40 backdrop-blur-xl rounded-[25px] p-5 shadow-sm border border-white/30">
            <div className="space-y-1">
              {loading ? (
                <div className="text-center text-gray-400 py-4">Loading...</div>
              ) : (
                dashboardData?.feedingPlan?.slice(0, 7).map((item, index) => {
                  const dayName = new Date(item.date).toLocaleDateString("th-TH", { weekday: 'short' });
                  // Simple mock progress bar for temp range visualization
                  // Assuming range 20-40 for width calc
                  const min = 20;
                  const max = 40;
                  const leftPct = ((item.lowTemperatureC - min) / (max - min)) * 100;
                  const widthPct = ((item.highTemperatureC - item.lowTemperatureC) / (max - min)) * 100;

                  return (
                    <div key={index} className="flex items-center justify-between py-3 px-2 border-b border-gray-100 last:border-none hover:bg-white/30 rounded-lg transition-colors">

                      {/* Day */}
                      <div className="w-16 text-base font-semibold text-[#093832]">
                        {index === 0 ? "วันนี้" : dayName}
                      </div>

                      {/* Icon */}
                      <div className="flex justify-center w-10">
                        <Image src={`/dashboard/${getWeatherIconFromCode(item.weatherCode)}`} alt="weather" width={24} height={24} />
                      </div>

                      {/* Temp Bar (iOS style) */}
                      <div className="flex-1 flex items-center gap-2 mx-4 text-sm font-semibold text-gray-500">
                        <span className="w-6 text-right opacity-80">{Math.round(item.lowTemperatureC)}°</span>
                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full relative overflow-hidden">
                          <div
                            className="absolute h-full rounded-full bg-gradient-to-r from-blue-400 to-orange-400 opacity-80"
                            style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                          />
                        </div>
                        <span className="w-6 text-left opacity-80">{Math.round(item.highTemperatureC)}°</span>
                      </div>

                      {/* Feed Advice */}
                      <div className="w-16 text-right">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${item.feedAdjustmentPct > 0
                          ? "bg-green-100 text-green-700"
                          : item.feedAdjustmentPct < 0
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-600"
                          }`}>
                          {item.feedAdjustmentPct > 0 ? `+${item.feedAdjustmentPct}%` : item.feedAdjustmentPct < 0 ? `${item.feedAdjustmentPct}%` : "ปกติ"}
                        </span>
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
          <h3 className="text-base font-bold text-[#093832]">สรุปข้อมูล {pondName}</h3>
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