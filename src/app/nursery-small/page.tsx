"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useDashboardData } from "@/hooks/useDashboardData";
import { ProfileDropdownMenu } from "@/components/common/ProfileDropdownMenu";

// Types
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
}

interface DashboardData {
  group: string;
  hasData: boolean;
  summary: DashboardSummary;
  feedingPlan: ForecastData[];
}

// Constants
const NURSERY_SMALL_COMFORT_ZONE = "28-34°C";

// Utility functions
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
  return parsed.toLocaleDateString("th-TH");
};

const formatTemperature = (value?: number | null): string => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "-";
  }
  return `${value.toFixed(1)} °C`;
};

const buildTemperatureDeltaText = (delta?: number | null): string => {
  if (typeof delta !== "number" || Number.isNaN(delta)) {
    return "ไม่มีข้อมูล";
  }
  if (delta === 0) {
    return "อุณหภูมิคงที่เท่าเดิม";
  }
  const direction = delta > 0 ? "สูง" : "ต่ำ";
  return `อุณหภูมิ${direction}กว่าปกติ ${Math.abs(delta).toFixed(1)}°C`;
};

const buildFeedAdviceText = (adjustmentPct?: number | null): string => {
  if (typeof adjustmentPct !== "number" || Number.isNaN(adjustmentPct)) {
    return "ไม่มีข้อมูล";
  }
  if (adjustmentPct > 0) {
    return `แนะนำให้เพิ่มอาหารขึ้น ${adjustmentPct}%`;
  }
  if (adjustmentPct < 0) {
    return `แนะนำให้ลดอาหารลง ${Math.abs(adjustmentPct)}%`;
  }
  return "ให้อาหารตามปกติ";
};

export default function NurserySmallPage() {
  const { data: dashboardData, loading, error } = useDashboardData<DashboardData>("NURSERY_SMALL");

  const forecastData = useMemo(
    () => dashboardData?.feedingPlan || [],
    [dashboardData]
  );

  return (
    <div className="min-h-screen bg-white pb-10">
      
      <div className="bg-[#093832] text-white px-4 pt-8 pb-10 rounded-b-[40px] shadow-md relative z-30">
              <div className="max-w-7xl mx-auto flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Image src="/nursery-large/Group.svg" alt="Overview" width={24} height={24} />
                  <h1 className="text-2xl font-bold">ภาพรวมฟาร์ม</h1>
                </div>
                
                <ProfileDropdownMenu />
              </div>
            </div>

      <div className="px-5 mt-4 relative z-10 max-w-7xl mx-auto space-y-5">
        
        <div className="">
          <span className="inline-flex items-center gap-2 bg-[#FFF3CA] text-[#917618] px-4 py-1.5 rounded-full text-sm font-bold shadow-sm border border-yellow-200">
              <Image src="/nursery-large/famicons_fish-y.svg" alt="fish" width={20} height={20}/> 
              กลุ่มอนุบาลขนาดเล็ก
          </span>
        </div>

        {/* 1. ข้อมูลวันที่ & อุณหภูมิ */}
        <div className="bg-[#F4FFFC] rounded-2xl p-4 shadow-sm border border-emerald-50 flex items-center justify-center h-full">
            <div className="flex-1 flex flex-col items-center justify-center">
                <div className="flex items-center gap-2 mb-3">
                    <Image src="/nursery-large/solar_calendar-outline.svg" alt="date" width={20} height={20} />
                    <span className="text-[#0F614E] text-lg font-medium">ข้อมูล ณ วันที่</span>
                </div>
                <p className="text-2xl font-bold text-[#0F614E]">
                  {loading ? "..." : formatThaiDate(dashboardData?.summary?.asOf)}
                </p>
            </div>
            <div className="w-px h-16 bg-gray-300 mx-2"></div>
            <div className="flex-1 flex flex-col items-center justify-center">
                <div className="flex items-center gap-2 mb-3">
                    <Image src="/nursery-large/fluent_temperature.svg" alt="temp" width={20} height={20} />
                    <span className="text-[#0F614E] text-lg font-medium">อุณหภูมิ</span>
                </div>
                <p className="text-2xl font-bold text-[#0F614E]">
                  {loading ? "..." : formatTemperature(dashboardData?.summary?.airTemperatureC)}
                </p>
            </div>
        </div>

        {/* 2. รายงานอุณหภูมิ */}
        <div className="bg-[#E0F5FF] rounded-2xl p-5 shadow-sm border border-blue-100">
            <h3 className="text-base font-bold text-black mb-2">รายงานอุณหภูมิ</h3>
            {loading ? (
              <div className="text-center py-4">
                <p className="text-gray-500">กำลังโหลด...</p>
              </div>
            ) : error ? (
              <div className="text-center py-4">
                <p className="text-red-500">{error}</p>
              </div>
            ) : (
              <>
                        <div className="text-center mb-4">
                    <p className="text-xl font-medium text-[#054DD3]">
                      {buildTemperatureDeltaText(dashboardData?.summary?.temperatureDeltaC)}
                    </p>
                    <p className="text-xl font-medium text-[#054DD3]">
                      {buildFeedAdviceText(dashboardData?.summary?.recommendedFeedAdjustmentPct)}
                    </p>
                </div>
                <div>
                  <h4 className="text-base font-bold text-black mb-1">คำแนะนำ :</h4>
                  <p className="text-base text-black leading-relaxed">
                    หากอุณหภูมิน้ำอยู่ในช่วงที่เหมาะสม ({NURSERY_SMALL_COMFORT_ZONE}) ปลามักจะกินอาหารและเจริญเติบโตได้ดี ควรเฝ้าดูแนวโน้มอุณหภูมิทุกวัน
                  </p>
                </div>
              </>
            )}
        </div>

        {/* 3. ตารางพยากรณ์ */}
        <div>
            <div className="flex items-center gap-2 mb-3">
                <Image src="/nursery-large/fluent_weather-hail-day.svg" alt="forecast" width={24} height={24} />
                <h3 className="text-base font-bold text-[#093832]">คาดการณ์สภาพอากาศและการให้อาหาร</h3>
            </div>
            <div className="bg-[#F4FFFC] rounded-2xl pt-5 pb-6 p-2 shadow-sm">
                <div className="grid grid-cols-3 mb-4 border-b border-[#D0EBE5] pb-3">
                    <div className="text-sm font-bold text-[#75CFB6] text-center">วันที่</div>
                    <div className="text-sm font-bold text-[#75CFB6] text-center">สภาพอากาศ</div>
                    <div className="text-sm font-bold text-[#75CFB6] text-center">ปริมาณอาหารที่แนะนำ</div>
                </div>
                {loading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">กำลังโหลด...</p>
                  </div>
                ) : forecastData.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">ไม่มีข้อมูล</p>
                  </div>
                ) : (
                  <div className="space-y-5">
                      {forecastData.map((item, index) => {
                        const displayDate = new Date(item.date).toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: '2-digit' });
                        const displayTemp = `${Math.round(item.lowTemperatureC)} / ${Math.round(item.highTemperatureC)} °C`;
                        // แสดงตาม UI: "เพิ่มขึ้น 5%", "ลดลง 2%", "ปกติ"
                        const displayFeed = item.feedAdjustmentPct > 0 
                          ? `เพิ่มขึ้น ${item.feedAdjustmentPct}%`
                          : item.feedAdjustmentPct < 0
                            ? `ลดลง ${Math.abs(item.feedAdjustmentPct)}%`
                            : "ปกติ";
                        const weatherIcon = getWeatherIconFromCode(item.weatherCode);
                        
                        return (
                          <div key={index} className="grid grid-cols-3 items-center hover:bg-[#E0F7FA] rounded transition-colors duration-200 -mx-2 px-2 py-1">
                              <div className="text-xs font-medium text-[#0F614E] text-center">{displayDate}</div>
                              <div className="flex items-center justify-center gap-3">
                                  <Image src={`/nursery-large/${weatherIcon}`} alt="weather" width={20} height={20} />
                                  <span className="text-xs font-medium text-[#0F614E]">{displayTemp}</span>
                              </div>
                              <div className="text-xs font-medium text-[#0F614E] text-center">{displayFeed}</div>
                          </div>
                        );
                      })}
                  </div>
                )}
            </div>
        </div>

        {/* 4. Action Buttons (เหลือ 2 ปุ่มตามรูป) */}
        <div className="space-y-3">
            
            <Link href="/nursery-small/feeding-small" className="block w-full">
                <button className="w-full bg-[#EF6E11] hover:bg-orange-700 text-white py-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition-colors text-lg cursor-pointer">
                    <Image src="/nursery-large/fluent_food-grains-w.svg" alt="icon" width={24} height={24} />
                    การให้อาหาร
                </button>
            </Link>

            <Link href="/nursery-small/weather-small" className="block w-full">
                <button className="w-full bg-[#0084FF] hover:bg-blue-700 text-white py-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition-colors text-lg cursor-pointer">
                    <Image src="/nursery-large/fluent_weather-hail-day-w.svg" alt="icon" width={24} height={24} />
                    สภาพอากาศ
                </button>
            </Link>

        </div>

      </div>
    </div>
  );
}