"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useDashboardData } from "@/hooks/useDashboardData";
import { ProfileDropdownMenu } from "@/components/common/ProfileDropdownMenu";
import FarmNavigation from "@/components/navigation/FarmNavigation"; 

interface GraphDataPoint {
  month: string;
  value: number;
}

interface HoverData {
  x: number;
  y: number;
  value: number;
  month?: string;
}

interface Coordinate {
  x: number;
  y: number;
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
  averageFishWeight: number | null;
  weightChange: number | null;
  latestFishAgeLabel: string | null;
  pelletFoodCost: number;
  freshFoodCost: number;
  monthlyFeedingData: GraphDataPoint[];
}

interface DashboardData {
  group: string;
  hasData: boolean;
  summary: DashboardSummary;
  feedingPlan: ForecastData[];
}

const MARKET_GROWER_COMFORT_ZONE = "26-36°C";

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

const formatAverageWeight = (value?: number | null): string => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "-";
  }

  const grams = value * 1000;
  const formatter = new Intl.NumberFormat("th-TH", {
    minimumFractionDigits: grams < 100 ? 1 : 0,
    maximumFractionDigits: grams < 100 ? 1 : 0,
  });

  return `${formatter.format(grams)} กรัม`;
};

const formatGraphWeight = (value?: number | null): string => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "-";
  }
  const formatter = new Intl.NumberFormat("th-TH", {
    maximumFractionDigits: 0,
  });
  return `${formatter.format(value)} กรัม`;
};

const formatFishAgeLabel = (label?: string | null): string => {
  if (!label || !label.trim().length) {
    return "-";
  }
  return label;
};

export default function MarketGrowerPage() {
  const [hoverData, setHoverData] = useState<HoverData | null>(null);
  const { data: dashboardData, loading, error } = useDashboardData<DashboardData>("MARKET");

  const hasDashboardData = dashboardData?.hasData;

  const graphDataRaw: GraphDataPoint[] = hasDashboardData
    ? dashboardData?.summary?.monthlyFeedingData ?? []
    : [];

  const graphData: GraphDataPoint[] = graphDataRaw.map((point) => ({
    ...point,
    value:
      typeof point.value === "number" && Number.isFinite(point.value)
        ? point.value * 1000
        : 0,
  }));

  const forecastData: ForecastData[] = hasDashboardData ? dashboardData?.feedingPlan || [] : [];

  const summary = dashboardData?.summary;
  const averageFishWeightValue = summary?.averageFishWeight ?? null;
  const latestFishAgeLabel = summary?.latestFishAgeLabel ?? null;

  const MAX_GRAPH_VALUE = 2000; // grams
  const axisValues = [2000, 1500, 1000, 500, 0];
  const getY = (val: number): number => {
    const clamped = Math.max(0, Math.min(MAX_GRAPH_VALUE, val));
    return 130 - (clamped / MAX_GRAPH_VALUE) * 110;
  };
  const getX = (index: number): number => 35 + index * 25; 

  const generateSmoothPath = (data: Coordinate[], tension: number = 0.4): string => {
    if (data.length < 2) return "";
    let path = `M${data[0].x},${data[0].y}`;
    for (let i = 0; i < data.length - 1; i++) {
      const p0 = i > 0 ? data[i - 1] : data[i];
      const p1 = data[i];
      const p2 = data[i + 1];
      const p3 = i < data.length - 2 ? data[i + 2] : p2;
      
      const cp1x = p1.x + (p2.x - p0.x) / 6 * tension;
      const cp1y = p1.y + (p2.y - p0.y) / 6 * tension;
      const cp2x = p2.x - (p3.x - p1.x) / 6 * tension;
      const cp2y = p2.y - (p3.y - p1.y) / 6 * tension;
      
      path += `C${cp1x},${cp1y},${cp2x},${cp2y},${p2.x},${p2.y}`;
    }
    return path;
  };

  const smoothPathD = generateSmoothPath(
    graphData.map((d, i) => ({ x: getX(i), y: getY(d.value) }))
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

      <div className="relative z-20 -mt-6 mx-4">
         <FarmNavigation />
      </div>

      <div className="px-5 relative z-10 max-w-7xl mx-auto space-y-5">
        
        {/* 1. ข้อมูลวันที่ & อุณหภูมิ */}
        <div className="bg-[#F4FFFC] rounded-2xl p-4 shadow-sm border border-emerald-50 flex items-center justify-center h-full mt-2">
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
                    หากอุณหภูมิน้ำอยู่ในช่วงที่เหมาะสม ({MARKET_GROWER_COMFORT_ZONE}) ปลามักจะกินอาหารและเจริญเติบโตได้ดี ควรเฝ้าดูแนวโน้มอุณหภูมิทุกวัน
                  </p>
                </div>
              </>
            )}
        </div>

        {/* 3. อายุปลา & น้ำหนักเฉลี่ย */}
        <div className="flex items-center bg-[#FFEFBC] rounded-2xl overflow-hidden shadow-sm min-h-[100px]">
            <div className="flex-1 p-4 flex flex-col items-center justify-center">
                <div className="flex items-center gap-2 mb-1 text-black">
                    <Image src="/nursery-large/famicons_fish-outline.svg" alt="age" width={20} height={20} />
                    <span className="text-base font-medium">อายุปลา</span>
                </div>
                <p className="text-xl font-bold text-black text-center">
                  {loading ? "..." : formatFishAgeLabel(latestFishAgeLabel)}
                </p>
            </div>
            
            <div className="w-px h-16 bg-gray-300 mx-2"></div>

            <div className="flex-1 p-4 flex flex-col items-center justify-center">
                <div className="flex items-center justify-center gap-2 mb-1 text-black">
                    <Image src="/nursery-large/hugeicons_weight.svg" alt="weight" width={20} height={20} className="shrink-0" />
                    <span className="text-base font-medium text-center leading-tight">น้ำหนักเฉลี่ย</span>
                </div>
                <p className="text-xl font-bold text-black">
                  {loading ? "..." : formatAverageWeight(averageFishWeightValue)}
                </p> 
            </div>
        </div>

        {/* 4. ช่วงอายุที่เหมาะกับการจับขาย (เอา E badge ออกแล้ว) */}
        <div className="bg-[#DDF8C2] rounded-2xl p-4 shadow-sm border border-emerald-50 flex items-center justify-center relative min-h-[100px]">
            <div className="flex flex-col items-center justify-center">
                <div className="flex items-center gap-2 mb-2">
                    <Image src="/nursery-large/solar_calendar-outline.svg" alt="calendar" width={20} height={20} />
                    <span className="text-black text-base font-medium">ช่วงอายุที่เหมาะกับการจับขาย</span>
                </div>
                <p className="text-2xl font-bold text-black">
                   2-6 เดือน
                </p>
            </div>
        </div>

        {/* 5. กราฟ */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="w-full h-40 relative">
                {hoverData && (
                    <div 
                        className="absolute bg-white rounded-lg px-3 py-2 shadow-lg border border-gray-100 pointer-events-none transform -translate-x-1/2 -translate-y-full z-30 transition-all duration-100"
                        style={{ 
                            left: `${(hoverData.x / 320) * 100}%`, 
                            top: `${(hoverData.y / 150) * 100}%`,
                            marginTop: '-12px',
                        }}
                    >
                        <div className="text-xs text-gray-600 font-medium">ค่าเฉลี่ย</div>
                    <div className="text-sm font-bold text-[#10B981]">{formatGraphWeight(hoverData.value)}</div>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-white drop-shadow-sm"></div>
                    </div>
                )}

                <svg viewBox="0 0 320 150" className="w-full h-full overflow-visible">
                    {axisValues.map((val) => (
                        <g key={val}>
                            <line x1="35" y1={getY(val)} x2="310" y2={getY(val)} stroke="#f0f0f0" strokeWidth="1" />
                        <text x="25" y={getY(val) + 3} fontSize="10" fill="#999" textAnchor="end">{formatGraphWeight(val)}</text>
                        </g>
                    ))}
                    <path 
                        d={smoothPathD}
                        fill="none" 
                        stroke="#179678" 
                        strokeWidth="3" 
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    {graphData.map((item, index) => {
                        const xCenter = getX(index);
                        return (
                            <g key={index}>
                                <rect
                                    x={xCenter - 12}
                                    y="0"
                                    width="24"
                                    height="150"
                                    fill="transparent"
                                    className="cursor-pointer"
                                    onMouseEnter={() => setHoverData({ 
                                        x: xCenter, 
                                        y: getY(item.value), 
                                        value: item.value,
                                        month: item.month
                                    })}
                                    onMouseLeave={() => setHoverData(null)}
                                />
                                <text 
                                    x={xCenter} 
                                    y="145" 
                                    fontSize="9" 
                                    fill="#999" 
                                    textAnchor="middle"
                                    className={`transition-colors ${hoverData?.x === xCenter ? 'fill-[#179678] font-bold' : ''}`}
                                >
                                    {item.month}
                                </text>
                            </g>
                        );
                    })}
                </svg>
                {!loading && graphData.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">
                    ไม่มีข้อมูล
                  </div>
                )}
            </div>
        </div> 

        {/* 6. รูปปลา & อัตราการรอดชีวิต */}
        <div className="grid grid-cols-2 gap-4 items-stretch">
            <div className="bg-[#EEF8FF] rounded-2xl p-2 flex items-center justify-center h-full min-h-[120px]">
                <Image 
                    src="/nursery-large/duke.png" 
                    alt="Catfish" 
                    width={160} 
                    height={100} 
                    className="object-contain drop-shadow-sm"
                />
            </div>
            
            <div className="bg-[#FFE3E3] rounded-2xl p-5 flex flex-col justify-center h-full text-center relative">
                <div className="mb-2 flex items-center justify-center gap-2">
                  <Image src="/nursery-large/famicons_fish-outline.svg" alt="survival-rate" width={24} height={24} className="text-black shrink-0" />
                  <span className="text-black text-base font-semibold leading-tight text-left">
                      อัตราการรอดชีวิต (ตัว)
                  </span>
                </div>

                <div className="flex flex-col items-center gap-1 mt-1">

                  <span className="text-3xl font-bold text-black">
                     -
                  </span>
                   <span className="text-[#FF2424] text-xs font-bold">
                    ไม่มีข้อมูล
                  </span>
                </div>
            </div>
        </div>

        {/* 7. ตารางพยากรณ์ */}
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

        {/* 8. Action Buttons */}
        <div className="pt-2 space-y-3 md:space-y-0 md:grid md:grid-cols-3 md:gap-4 md:col-span-2 lg:col-span-4">
            <Link href="/market/weather-market" className="block w-full">
                <button className="w-full bg-[#0084FF] hover:bg-blue-700 text-white py-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition-colors text-lg cursor-pointer">
                    <Image src="/nursery-large/fluent_weather-hail-day-w.svg" alt="icon" width={24} height={24} />
                    สภาพอากาศ
                </button>
            </Link>

            <Link href="/market/price-market" className="block w-full">
                <button className="w-full bg-[#FF4242] hover:bg-[#e03535] text-white py-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition-colors text-lg cursor-pointer">
                    <Image src="/nursery-large/healthicons_money-bag.svg" alt="icon" width={24} height={24} />
                    ตรวจสอบราคาตลาด
                </button>
            </Link>

            <Link href="/market/feeding-market" className="block w-full">
                <button className="w-full bg-[#EF6E11] hover:bg-orange-700 text-white py-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition-colors text-lg cursor-pointer">
                    <Image src="/nursery-large/fluent_food-grains-w.svg" alt="icon" width={24} height={24} />
                    การให้อาหาร
                </button>
            </Link>

            {/* เพิ่มปุ่มใหม่ สีม่วง */}
            <Link href="/market/disease-info-market" className="block w-full">
                <button className="w-full bg-[#A530FF] hover:bg-[#8a2be2] text-white py-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition-colors text-lg cursor-pointer">
                    <Image src="/nursery-large/famicons_fish-w.svg" alt="icon" width={24} height={24} />
                    ข้อมูลการรักษาโรค
                </button>
            </Link>

            <Link href="/market/record-market" className="block w-full">
                <button className="w-full bg-[#72B544] hover:bg-green-700 text-white py-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition-colors text-lg cursor-pointer">
                    <Image src="/nursery-large/uil_plus.svg" alt="icon" width={24} height={24} />
                    บันทึกข้อมูล
                </button>
            </Link>
        </div>

      </div>
    </div>
  );
}