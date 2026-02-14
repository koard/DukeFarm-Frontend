"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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

const getSurvivalStatusStyles = (percentage: number | null) => {
  if (percentage === null) {
    return {
      bg: "bg-gray-50",
      text: "text-gray-400",
      label: "-"
    };
  }
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

const getThaiWeatherCondition = (condition: string): string => {
  const weatherMap: Record<string, string> = {
    'sunny': 'ท้องฟ้าแจ่มใส',
    'clear': 'ท้องฟ้าแจ่มใส',
    'partly cloudy': 'เมฆบางส่วน',
    'cloudy': 'เมฆปกคลุม',
    'overcast': 'เมฆปกคลุมมาก',
    'mist': 'มีหมอก',
    'fog': 'หมอกลึก',
    'light drizzle': 'ฝนเบาบาง',
    'drizzle': 'ฝนเบาบาง',
    'light rain': 'ฝนเบา',
    'rain': 'ฝนตก',
    'moderate rain': 'ฝนตกปานกลาง',
    'heavy rain': 'ฝนตกหนัก',
    'thunderstorm': 'พายุฝนฟ้าคั่นกลาง',
    'thunder': 'พายุฝนฟ้า',
    'storm': 'พายุ',
    'snow': 'หิมะตกลง',
    'sleet': 'ฝนปะปนกับหิมะ',
    'hail': 'ตกลูกเห็บ',
    'unknown': 'สภาพอากาศไม่ชัดเจน'
  };

  const lowerCondition = (condition || '').toLowerCase().trim();
  
  // Check for exact match first
  if (weatherMap[lowerCondition]) {
    return weatherMap[lowerCondition];
  }
  
  // Check for partial match
  for (const [key, value] of Object.entries(weatherMap)) {
    if (lowerCondition.includes(key)) {
      return value;
    }
  }
  
  // Default: return original condition
  return condition || 'ไม่ทราบสภาพอากาศ';
};

// ----------------------------------------------------------------------
// Skeleton Loading Component
// ----------------------------------------------------------------------

const DashboardLoadingSkeleton = () => (
  <div className="px-5 mt-4 max-w-7xl mx-auto space-y-6">
    {/* Date skeleton */}
    <div className="flex items-center gap-2 ml-1">
      <div className="w-[22px] h-[22px] rounded-md bg-emerald-100 animate-pulse" />
      <div className="relative overflow-hidden h-4 w-52 rounded-full bg-gray-200">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
      </div>
    </div>

    {/* Weather card skeleton - animated gradient with floating orbs */}
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative overflow-hidden rounded-[35px] bg-gradient-to-br from-[#a8d8ea] via-[#88c4e0] to-[#4FACFE] min-h-[280px]"
    >
      {/* Animated floating orbs */}
      <motion.div
        animate={{ y: [-10, 10, -10], x: [-5, 5, -5] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-16 -right-16 w-72 h-72 bg-white/25 rounded-full blur-[100px]"
      />
      <motion.div
        animate={{ y: [8, -8, 8], x: [5, -5, 5] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-0 -left-12 w-48 h-48 bg-white/20 rounded-full blur-[80px]"
      />
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute top-1/3 right-1/4 w-32 h-32 bg-white/15 rounded-full blur-[60px]"
      />

      {/* Shimmer sweep across card */}
      <motion.div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ x: ["-100%", "200%"] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
          className="h-full w-1/3 bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-12"
        />
      </motion.div>

      {/* Content skeleton placeholders */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[280px] gap-4 px-8">
        <motion.div
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="h-7 w-28 rounded-full bg-white/35"
        />
        <motion.div
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: 0.3 }}
          className="h-[72px] w-36 rounded-2xl bg-white/25"
        />
        <motion.div
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
          className="h-5 w-32 rounded-full bg-white/30"
        />
        <motion.div
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.9 }}
          className="h-4 w-44 rounded-full bg-white/25"
        />
        <div className="w-4/5 pt-4 border-t-2 border-white/20 flex flex-col items-center gap-2">
          <motion.div
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, delay: 1.2 }}
            className="h-4 w-52 rounded-full bg-white/20"
          />
        </div>
      </div>
    </motion.div>

    {/* Forecast skeleton with staggered row animations */}
    <div className="space-y-4">
      <div className="flex items-center gap-2 ml-2">
        <div className="w-[18px] h-[18px] rounded bg-gray-200 animate-pulse" />
        <div className="relative overflow-hidden h-4 w-44 rounded-full bg-gray-200">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
        </div>
      </div>

      <div className="bg-white/60 backdrop-blur-xl rounded-[25px] p-5 shadow-sm border border-gray-100 space-y-1">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.08, duration: 0.4 }}
            className="flex items-center gap-3 py-3 px-2 border-b border-gray-100 last:border-none"
          >
            <div className="w-12 h-4 rounded-full bg-gray-200 animate-pulse" />
            <div className="w-7 h-7 rounded-full bg-gray-200 animate-pulse" />
            <div className="flex-1 flex items-center gap-2">
              <div className="w-6 h-3 rounded bg-gray-200 animate-pulse" />
              <div className="flex-1 h-1.5 rounded-full bg-gray-100 animate-pulse" />
              <div className="w-6 h-3 rounded bg-gray-200 animate-pulse" />
            </div>
            <div className="w-11 h-5 rounded-full bg-gray-200 animate-pulse" />
          </motion.div>
        ))}
      </div>
    </div>

    {/* Summary header skeleton */}
    <div className="flex items-center gap-2 mt-8 ml-1">
      <div className="w-[22px] h-[22px] rounded bg-gray-200 animate-pulse" />
      <div className="relative overflow-hidden h-4 w-36 rounded-full bg-gray-200">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
      </div>
    </div>

    {/* Fish type + weight card skeleton with shimmer sweep */}
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="relative bg-gradient-to-r from-[#FFF6E2] via-[#FFF6E2] to-[#E6DAFF] rounded-2xl h-28 flex overflow-hidden border border-orange-50/20"
      >
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.5 }}
            className="h-full w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12"
          />
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-3 p-4 relative">
          <div className="h-3 w-20 rounded-full bg-orange-200/60 animate-pulse" />
          <div className="h-7 w-24 rounded-lg bg-orange-200/40 animate-pulse" />
          <div className="absolute right-0 top-3 bottom-3 w-px bg-white/80" />
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-3 p-4">
          <div className="h-3 w-24 rounded-full bg-purple-200/60 animate-pulse" />
          <div className="h-7 w-20 rounded-lg bg-purple-200/40 animate-pulse" />
        </div>
      </motion.div>

      {/* Release date skeleton */}
      <div className="flex items-center justify-between px-2 pt-1">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-gray-200 animate-pulse" />
          <div className="h-4 w-28 rounded-full bg-gray-200 animate-pulse" />
        </div>
        <div className="h-4 w-32 rounded-full bg-gray-200 animate-pulse" />
      </div>
    </div>

    {/* Quantity cards skeleton */}
    <div className="grid grid-cols-2 gap-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="relative bg-[#4A59FF]/30 rounded-2xl h-28 p-4 overflow-hidden"
      >
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 2 }}
            className="h-full w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
          />
        </div>
        <div className="h-4 w-20 rounded-full bg-white/40 animate-pulse mb-4" />
        <div className="flex justify-center">
          <div className="h-8 w-24 rounded-lg bg-white/30 animate-pulse" />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="relative bg-[#E0A84D]/30 rounded-2xl h-28 p-4 overflow-hidden"
      >
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 2.5 }}
            className="h-full w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
          />
        </div>
        <div className="h-4 w-16 rounded-full bg-white/40 animate-pulse mb-4" />
        <div className="flex justify-center">
          <div className="h-8 w-24 rounded-lg bg-white/30 animate-pulse" />
        </div>
      </motion.div>
    </div>

    {/* Survival rate skeleton */}
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
      className="relative bg-gray-50 rounded-2xl p-4 overflow-hidden border border-gray-100"
    >
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ x: ["-100%", "200%"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", repeatDelay: 2 }}
          className="h-full w-1/3 bg-gradient-to-r from-transparent via-gray-200/60 to-transparent -skew-x-12"
        />
      </div>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-[22px] h-[22px] rounded bg-gray-200 animate-pulse" />
        <div className="h-4 w-24 rounded-full bg-gray-200 animate-pulse" />
      </div>
      <div className="flex justify-center">
        <div className="h-8 w-20 rounded-lg bg-gray-200 animate-pulse" />
      </div>
    </motion.div>

    {/* Market size skeleton */}
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.9 }}
      className="relative bg-[#F1DFFF]/40 rounded-2xl p-4 overflow-hidden border border-purple-100/30"
    >
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ x: ["-100%", "200%"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.5 }}
          className="h-full w-1/3 bg-gradient-to-r from-transparent via-purple-100/50 to-transparent -skew-x-12"
        />
      </div>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-5 h-5 rounded bg-purple-200 animate-pulse" />
        <div className="h-4 w-44 rounded-full bg-purple-200/60 animate-pulse" />
      </div>
      <div className="flex justify-center">
        <div className="h-8 w-24 rounded-lg bg-purple-100 animate-pulse" />
      </div>
    </motion.div>
  </div>
);

// ----------------------------------------------------------------------
// Component
// ----------------------------------------------------------------------

function DashboardContent() {
  const searchParams = useSearchParams();
  const pondId = searchParams.get("pondId") || undefined;
  const initialType = (searchParams.get("type") as FarmTypeOption) || "SMALL";

  const [farmType, setFarmType] = useState<FarmTypeOption>(initialType);

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

  const { data: dashboardData, loading } = useDashboardData<DashboardData>(farmType, pondId);

  // Derive weather state from actual time + weather data
  const weatherState = (() => {
    const hour = currentTime ? currentTime.getHours() : 12;
    const condition = (dashboardData?.summary?.weather?.conditionText ?? "").toLowerCase();
    const rainMm = dashboardData?.summary?.weather?.rainMm ?? 0;
    const temp = dashboardData?.summary?.weather?.temperatureC ?? 28;

    // Rain takes priority
    if (rainMm > 0 || condition.includes("rain") || condition.includes("thunder") || condition.includes("storm") || condition.includes("drizzle") || condition.includes("ฝน")) {
      return "rain";
    }
    // Night: 18:00 - 05:59
    if (hour >= 18 || hour < 6) {
      return "night";
    }
    // Hot day: temp >= 35
    if (temp >= 35) {
      return "hot_day";
    }
    // Sunrise/sunset golden hour
    if (hour >= 6 && hour < 8) {
      return "sunrise";
    }
    if (hour >= 16 && hour < 18) {
      return "sunset";
    }
    // Cloudy
    if (condition.includes("cloud") || condition.includes("overcast") || condition.includes("เมฆ")) {
      return "cloudy";
    }
    // Default: sunny day
    return "sunny_day";
  })();

  const getWeatherBg = () => {
    switch (weatherState) {
      case "hot_day":  return "from-[#FF8C61] to-[#FFD54F]";  // Warm Orange/Yellow
      case "night":    return "from-[#0F2027] to-[#203A43]";   // Deep Dark Blue
      case "rain":     return "from-[#4B6CB7] to-[#182848]";   // Rainy Blue
      case "sunrise":  return "from-[#FF9A9E] to-[#FAD0C4]";   // Soft pink/peach
      case "sunset":   return "from-[#F7971E] to-[#FFD200]";   // Orange/Gold
      case "cloudy":   return "from-[#8E9EAB] to-[#667B87]";   // Grey-blue
      default:         return "from-[#4FACFE] to-[#00F2FE]";    // Bright Blue (Cyan)
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
    if (tempDelta === 0) return "อุณหภูมิอยู่ในเกณฑ์ที่เหมาะสม";
    if (tempDelta > 0) return `อุณหภูมิสูงกว่าปกติ ${tempDelta.toFixed(1)} องศา`;
    return `อุณหภูมิต่ำกว่าปกติ ${Math.abs(tempDelta).toFixed(1)} องศา`;
  })();

  const feedAdvice = (() => {
    const pct = dashboardData?.summary?.recommendedFeedAdjustmentPct ?? 0;
    if (pct === 0) return null;
    if (pct > 0) return `แนะนำให้เพิ่มอาหารขึ้น ${pct}%`;
    return `แนะนำให้ลดอาหารลง ${Math.abs(pct)}%`;
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
            const idx = ponds.findIndex((p: { id: string }) => p.id === pondId);
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
  const survivalRate = summary?.survivalRatePct ?? null;

  // Market size mapping (Mock/Approximation based on type)
  const marketSizeMap: Record<string, string> = {
    SMALL: "2-5",
    LARGE: "15-25",
    MARKET: "800-1000"
  };
  const marketSize = marketSizeMap[farmType] || "-";

  return (
    <div className="min-h-screen bg-white pb-10 font-sans">

      {/* -------------------------------------------------------------------------
          (ส่วนหัวฟาร์ม - ห้ามแก้ตามต้นฉบับเดิม)
          ------------------------------------------------------------------------- */}
      <div className="bg-[#093832] text-white px-4 pt-5 pb-4 rounded-b-3xl shadow-md relative z-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image src="/dashboard/Group.svg" alt="Overview" width={24} height={24} />
          <h1 className="text-2xl font-bold">ภาพรวมฟาร์ม</h1>
        </div>
        <ProfileDropdownMenu showGreeting={false} />
      </div>

      {/* -------------------------------------------------------------------------
          1. NAVIGATION
          ------------------------------------------------------------------------- */}
      <div className="sticky top-0 z-40 mx-0 pt-2 bg-white transition-all duration-300">
        <FarmNavigation />
      </div>

      {/* Skeleton loading state */}
      {loading && <DashboardLoadingSkeleton />}

      <div className={`px-5 mt-4 max-w-7xl mx-auto space-y-6 ${loading ? 'hidden' : ''}`}>

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
          className={`relative overflow-hidden rounded-[35px] text-white transition-all bg-gradient-to-b ${getWeatherBg()}`}
        >
          {/* Background decoration - Multi-layer blur effects */}
          {/* Top-right glow */}
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/25 rounded-full blur-[100px] opacity-60" />
          {/* Left side glow */}
          <div className="absolute top-1/2 -left-16 w-48 h-48 bg-white/15 rounded-full blur-[70px] opacity-50" />
          {/* Bottom-right accent */}
          <div className="absolute -bottom-10 right-12 w-56 h-56 bg-white/10 rounded-full blur-[85px] opacity-40" />
          
          {/* Subtle overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent" />

          <div className="relative z-10 flex flex-col items-center justify-center text-center px-8 py-6">

            <span className="text-2xl font-semibold tracking-wide drop-shadow-sm mb-2">
              {currentTime ? currentTime.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.' : (loading ? "กำลังโหลด..." : "--:--")}
            </span>

            <span className="text-[90px] font-semibold leading-none tracking-tighter drop-shadow-lg mb-3">
              {loading ? "--" : Math.round(currentTemp)}°
            </span>

            <span className="text-xl font-medium opacity-90 tracking-wide mb-2">
              {loading ? "..." : getThaiWeatherCondition(currentCondition)}
            </span>

            <div className="flex gap-3 text-lg font-medium opacity-90 pt">
              <span className="drop-shadow-sm">สูงสุด:{Math.round(highTemp)}°</span>
              <span>|</span>
              <span className="drop-shadow-sm">ต่ำสุด:{Math.round(lowTemp)}°</span>
            </div>
          </div>

          {/* ---- Temperature Report (inside weather card) ---- */}
          <div className="relative z-10 mx-6 border-t-2 border-white/30" />
          <div className="relative z-10 px-6 py-5">
            <div className="text-lg font-medium text-white text-center leading-snug drop-shadow-sm">
              {loading ? (
                <p className="animate-pulse">กำลังโหลดข้อมูล...</p>
              ) : (
                <>
                  <p>{tempAdvice || "ไม่มีข้อมูลอุณหภูมิ"}</p>
                  {feedAdvice && (
                    <p className="mt-1">{feedAdvice}</p>
                  )}
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* -------------------------------------------------------------------------
            5. FORECAST SECTION (iOS Style)
            ------------------------------------------------------------------------- */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 ml-2 opacity-80">
            <Image src="/dashboard/solar_calendar-outline.svg" alt="forecast" width={18} height={18} />
            <h3 className="text-base font-bold text-black">พยากรณ์ล่วงหน้า 7 วัน</h3>
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
            <Image 
              src="/dashboard/food.svg" 
              alt="summary" 
              width={22} 
              height={22} 
            />
            <h3 className="text-base font-bold text-[#093832]">
              สรุปข้อมูล {pondName}
            </h3>
          </div>

          <div className="space-y-4">
            <div className="bg-gradient-to-r from-[#FFF6E2] via-[#FFF6E2] to-[#E6DAFF] rounded-2xl shadow-sm flex overflow-hidden h-28 border border-orange-50/20">

              {/* ฝั่งซ้าย: ประเภทปลา */}
              <div className="flex-1 flex flex-col p-4 relative">
                <div className="flex items-center gap-1.5 mb-1">
                  <Image src="/dashboard/ion_fish.svg" alt="type" width={18} height={18} />
                  <span className="text-sm font-bold text-gray-900">ประเภทปลา</span>
                </div>

                <div className="flex-1 flex items-center justify-center">
                  <p className="text-2xl font-black text-black">
                    {loading ? "..." : fishType} 
                  </p>
                </div>
                
                {/* เส้นคั่นสีขาวแบบยาว */}
                <div className="absolute right-0 top-3 bottom-3 w-px bg-white shadow-sm opacity-80"></div>
              </div>

              {/* ฝั่งขวา: น้ำหนักปลาเฉลี่ย */}
              <div className="flex-1 flex flex-col p-4">
                <div className="flex items-center gap-1.5 mb-1">
                  <Image src="/dashboard/line.svg" alt="avg" width={18} height={18} />
                  <span className="text-sm font-bold text-gray-900">น้ำหนักปลาเฉลี่ย</span>
                </div>

                <div className="flex-1 flex items-center justify-center">
                  <p className="text-2xl font-black text-black">
                    {loading ? "..." : avgWeight} <span className="text-sm font-bold text-gray-900 ml-1">กรัม</span>
                  </p>
                </div>
              </div>
            </div>

            {/* วันที่ปล่อยลงบ่อ */}
            <div className="flex items-center justify-between px-2 pt-1 text-[#434343]">
              <div className="flex items-center gap-2">
                <Image src="/dashboard/solar_calendar-outline.svg" alt="date" width={20} height={20} />
                <span className="text-sm font-bold">วันที่ปล่อยลงบ่อ</span>
              </div>
              <span className="text-sm font-bold text-[#093832]">
                {loading ? "..." : releaseDate} 
              </span>
            </div>
          </div>

          {/* -------------------------------------------------------------------------
              7. QUANTITY & REMAINING 
              ------------------------------------------------------------------------- */}
          <div className="grid grid-cols-2 gap-4">
            {/* กล่องจำนวนที่ปล่อย */}
            <div className="bg-[#4A59FF] rounded-2xl p-4 relative overflow-hidden text-white shadow-md h-28 flex flex-col">
              <span className="text-base font-medium opacity-90">จำนวนที่ปล่อย</span>
              
              <div className="flex-1 flex items-center justify-center">
                <p className="text-3xl font-black leading-none">
                  {loading ? "..." : releaseCount} 
                </p>
              </div>

              <Image 
                src="/dashboard/ix_water-fish.svg" 
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
                <p className="text-3xl font-black leading-none">
                  {loading ? "..." : remainingCount}
                </p>
              </div>

              <Image 
                src="/dashboard/Group 1000003034.svg" 
                alt="group" 
                width={60} 
                height={50} 
                className="absolute bottom-0 right-0 opacity-90 translate-x-1 translate-y-1" 
              />
            </div>
          </div>

          {/* -------------------------------------------------------------------------
              8. SURVIVAL RATE 
              ------------------------------------------------------------------------- */}
          {(() => {
            const status = getSurvivalStatusStyles(survivalRate);
            
            return (
              <div className={`${status.bg} rounded-2xl p-4 flex flex-col shadow-sm border border-white/40 transition-colors duration-300`}>
                
                <div className="flex items-center gap-2 mb-2">
                  <Image src="/dashboard/famicons_fish-bb.svg" alt="survival" width={22} height={22} />
                  <span className="text-base font-bold text-gray-700">อัตราการรอด</span>
                </div>
                
                <div className="flex flex-col items-center justify-center">
                  <div className="flex items-baseline gap-1">
                    <span className={`text-3xl font-black ${status.text}`}>
                      {loading ? "..." : (survivalRate !== null ? `${survivalRate}%` : "-")}
                    </span>
                    <span className={`text-xs font-bold ${status.text}`}>
                      {status.label}
                    </span>
                  </div>
                </div>

              </div>
            );
          })()}

          {/* -------------------------------------------------------------------------
            9. MARKET SIZE 
            ------------------------------------------------------------------------- */}
            <div className="bg-[#F1DFFF] rounded-2xl p-4 flex flex-col shadow-sm border border-purple-100/30">
              <div className="flex items-center gap-2 mb-2">
                <Image src="/dashboard/weight.svg" alt="weight" width={20} height={20} />
                <span className="text-base font-bold text-gray-700">ขนาดที่เหมาะสำหรับการขาย</span>
              </div>
              
              <div className="flex justify-center items-baseline gap-1">
                <p className="text-2xl font-black text-black">
                  {loading ? "..." : marketSize}
                </p>
                <span className="text-lg font-bold text-black">กรัม</span>
              </div>
            </div>
          </div> 

          {/* -------------------------------------------------------------------------
              ACTION BUTTONS 
              ------------------------------------------------------------------------- */}
          <div className={`px-5 max-w-7xl mx-auto mt-4 ${loading ? 'hidden' : ''}`}>
            <div className="pt-2 space-y-3 md:space-y-0 md:grid md:grid-cols-3 md:gap-4">
              
              {/* 1. สภาพอากาศ */}
              <Link href={getSubLink("weather")} className="block w-full">
                <button className="w-full bg-[#0084FF] hover:bg-blue-700 text-white py-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition-colors text-lg cursor-pointer font-bold">
                  <Image src="/dashboard/fluent_weather-hail-day-w.svg" alt="icon" width={24} height={24} />
                  สภาพอากาศ
                </button>
              </Link>

              {/* 2. ตรวจสอบราคาตลาด */}
              <Link href={getSubLink("price")} className="block w-full">
                <button className="w-full bg-[#FF4242] hover:bg-[#e03535] text-white py-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition-colors text-lg cursor-pointer font-bold">
                  <Image src="/dashboard/healthicons_money-bag.svg" alt="icon" width={24} height={24} />
                  ตรวจสอบราคาตลาด
                </button>
              </Link>

              {/* 3. การให้อาหาร */}
              <Link href={getSubLink("feeding")} className="block w-full">
                <button className="w-full bg-[#EF6E11] hover:bg-orange-700 text-white py-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition-colors text-lg cursor-pointer font-bold">
                  <Image src="/dashboard/fluent_food-grains-w.svg" alt="icon" width={24} height={24} />
                  การให้อาหาร
                </button>
              </Link>

              {/* 4. การรักษาโรค */}
              <Link href={getSubLink("disease-info")} className="block w-full">
                <button className="w-full bg-[#A530FF] hover:bg-[#8a2be2] text-white py-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition-colors text-lg cursor-pointer font-bold">
                  <Image src="/dashboard/famicons_fish-w.svg" alt="icon" width={24} height={24} />
                  การรักษาโรค
                </button>
              </Link>

              {/* 5. บันทึกข้อมูล */}
              <Link href={getSubLink("record")} className="block w-full">
                <button className="w-full bg-[#72B544] hover:bg-green-700 text-white py-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition-colors text-lg cursor-pointer font-bold">
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