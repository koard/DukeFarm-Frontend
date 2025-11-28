"use client";

import Image from "next/image";
import Link from "next/link";
import { useLineUser } from "@/hooks/useLineUser";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// ตาม API spec response structure
interface ForecastData {
  date: string;
  highTemperatureC: number;
  lowTemperatureC: number;
  feedAdjustmentPct: number;
  feedingRecommendation: "increase" | "decrease" | "normal";
  weatherCode: number;
}

// Map weather code to icon file name based on WMO standard and available icons
const getWeatherIconFromCode = (code: number): string => {
  if (code <= 1) return 'fluent_weather-sunny.svg'; // WMO 0-1: Clear, Mainly clear
  if (code <= 3) return 'fluent-color_weather-sunny.svg'; // WMO 2-3: Partly cloudy, Overcast
  if (code >= 51 && code <= 67) return 'fluent_weather-rain-snow.svg'; // WMO 51-67: Drizzle, Rain
  if (code >= 80 && code <= 82) return 'fluent_weather-rain-snow.svg'; // WMO 80-82: Rain showers
  if (code >= 95 && code <= 99) return 'fluent_weather-hail-day.svg'; // WMO 95-99: Thunderstorm
  // Default for fog, snow, etc.
  return 'fluent-color_weather-sunny.svg';
};

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

export default function NurserySmallPage() {
  const lineUser = useLineUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          router.push("/login");
          return;
        }

        // ตาม API spec: GET /dashboard/groups/:groupType
        const response = await fetch("https://dukefarm-backend.onrender.com/api/dashboard/groups/NURSERY_SMALL", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        if (!response.ok) {
          throw new Error("ไม่สามารถดึงข้อมูลได้");
        }

        const result = await response.json();
        setDashboardData(result.data);
      } catch (err) {
        console.error("Dashboard error:", err);
        setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  const forecastData: ForecastData[] = dashboardData?.feedingPlan || [];

  return (
    <div className="min-h-screen bg-white pb-10">
      
      <div className="bg-[#093832] text-white px-4 pt-8 pb-10 rounded-b-[40px] shadow-md relative z-10">
              <div className="max-w-7xl mx-auto flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Image src="/nursery-large/Group.svg" alt="Overview" width={24} height={24} />
                  <h1 className="text-2xl font-bold">ภาพรวมฟาร์ม</h1>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm text-gray-300">ยินดีต้อนรับ</p>
                    <p className="text-sm font-bold">{lineUser.displayName}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-gray-200">
                     <img src={lineUser.pictureUrl} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                </div>
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
                  {loading ? "..." : new Date(dashboardData?.summary?.asOf || "").toLocaleDateString('th-TH') || "17/05/25"}
                </p>
            </div>
            <div className="w-px h-16 bg-gray-300 mx-2"></div>
            <div className="flex-1 flex flex-col items-center justify-center">
                <div className="flex items-center gap-2 mb-3">
                    <Image src="/nursery-large/fluent_temperature.svg" alt="temp" width={20} height={20} />
                    <span className="text-[#0F614E] text-lg font-medium">อุณหภูมิ</span>
                </div>
                <p className="text-2xl font-bold text-[#0F614E]">
                  {loading ? "..." : `${(dashboardData?.summary?.airTemperatureC ?? 37.5).toFixed(1)} °C`}
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
                        {
                          dashboardData?.summary?.temperatureDeltaC !== null && dashboardData?.summary?.temperatureDeltaC !== undefined
                            ? `อุณหภูมิ${dashboardData?.summary?.temperatureDeltaC > 0 ? 'สูง' : 'ต่ำ'}กว่าปกติ ${Math.abs(dashboardData.summary.temperatureDeltaC).toFixed(1)}°C`
                            : "วันนี้อุณหภูมิลดลงจากเมื่อวาน 2°C"
                        }
                    </p>
                    <p className="text-xl font-medium text-[#054DD3]">
                        {
                          dashboardData?.summary?.recommendedFeedAdjustmentPct !== null && dashboardData?.summary?.recommendedFeedAdjustmentPct !== undefined
                            ? dashboardData?.summary?.recommendedFeedAdjustmentPct > 0
                              ? `แนะนำให้เพิ่มอาหารขึ้น ${dashboardData.summary.recommendedFeedAdjustmentPct}%`
                              : dashboardData?.summary?.recommendedFeedAdjustmentPct < 0
                                ? `แนะนำให้ลดอาหารลง ${Math.abs(dashboardData.summary.recommendedFeedAdjustmentPct)}%`
                                : "ให้อาหารตามปกติ"
                            : "แนะนำให้ลดอาหารลง"
                        }
                    </p>
                </div>
                <div>
                    <h4 className="text-base font-bold text-black mb-1">คำแนะนำ :</h4>
                    <p className="text-base text-black leading-relaxed">
                        ให้ 2 มื้อใหญ่ต่อวัน (เช้า-เย็น) เพิ่มสัดส่วนพลังงาน (ข้าวโพด, รำ) ลดโปรตีนลงเล็กน้อย อัตราโปรตีน 28-32% ก็เพียงพอติดตาม FCR เพื่อควบคุมต้นทุนอาหาร
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
                {loading || forecastData.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">กำลังโหลด...</p>
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