"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useDashboardData } from "@/hooks/useDashboardData";
import { ProfileDropdownMenu } from "@/components/common/ProfileDropdownMenu";
import AgeAdvisoryCard from "@/components/dashboard/AgeAdvisoryCard";
import FarmNavigation from "@/components/navigation/FarmNavigation";

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
      stroke: "#10B981",
      icon: "/nursery-large/famicons_fish-outline.svg"
    };
  } else if (percentage >= 75) {
    return {
      bg: "bg-[#FFF9C4]",
      text: "text-[#854D0E]",
      stroke: "#EAB308",
      icon: "/nursery-large/famicons_fish-outline.svg"
    };
  } else if (percentage >= 50) {
    return {
      bg: "bg-[#FFCCBC]",
      text: "text-[#BF360C]",
      stroke: "#F97316",
      icon: "/nursery-large/famicons_fish-outline.svg"
    };
  } else {
    return {
      bg: "bg-[#FFCDD2]",
      text: "text-[#B91C1C]",
      stroke: "#EF4444",
      icon: "/nursery-large/famicons_fish-outline.svg"
    };
  }
};

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

const LARGE_STAGE_COMFORT_RANGE: ComfortRange = { min: 27, max: 35 };
const LARGE_STAGE_COMFORT_ZONE = `${LARGE_STAGE_COMFORT_RANGE.min}-${LARGE_STAGE_COMFORT_RANGE.max}°C`;

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

const buildTemperatureDeltaText = (actual?: number | null, comfortRange?: ComfortRange): string => {
  if (!comfortRange || typeof actual !== "number" || Number.isNaN(actual)) {
    return "ไม่มีข้อมูล";
  }
  if (actual < comfortRange.min) {
    return `อุณหภูมิต่ำกว่าปกติ ${(comfortRange.min - actual).toFixed(1)}°C`;
  }
  if (actual > comfortRange.max) {
    return `อุณหภูมิสูงกว่าปกติ ${(actual - comfortRange.max).toFixed(1)}°C`;
  }
  return "อุณหภูมิอยู่ในช่วงเหมาะสม";
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


const formatSurvivalPct = (value?: number | null): string => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "-";
  }
  const formatter = new Intl.NumberFormat("th-TH", {
    maximumFractionDigits: 0,
  });
  return `${formatter.format(value)}%`;
};


export default function NurseryLargePage() {
  const [hoverData, setHoverData] = useState<HoverData | null>(null);
  const { data: dashboardData, loading, error } = useDashboardData<DashboardData>("LARGE");

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const currentAgeDays = calculateRealTimeAge(
    dashboardData?.summary?.asOf,
    dashboardData?.summary?.latestFishAgeDays
  );

  const hasDashboardData = dashboardData?.hasData;

  const rawSeries = hasDashboardData ? dashboardData?.summary?.survivalSeries ?? [] : [];

  const uniqueSeriesMap = new Map();
  rawSeries.forEach((item) => {
    uniqueSeriesMap.set(item.month, item);
  });
  const survivalSeries: GraphDataPoint[] = Array.from(uniqueSeriesMap.values());

  const graphData: GraphDataPoint[] = (survivalSeries.length ? survivalSeries : []).map((point) => ({
    ...point,
    value: typeof point.value === "number" && Number.isFinite(point.value)
      ? Math.max(0, Math.min(100, point.value))
      : 0,
  }));

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
    }
  }, [graphData]);

  const forecastData: ForecastData[] = hasDashboardData ? dashboardData?.feedingPlan || [] : [];

  const currentSurvivalRate = (() => {
    if (survivalSeries.length === 0) {
      return dashboardData?.summary?.survivalRatePct ?? 0;
    }
    const sum = survivalSeries.reduce((acc, curr) => acc + curr.value, 0);
    return sum / survivalSeries.length;
  })();

  const hasSurvival = hasDashboardData && (survivalSeries.length > 0 || typeof dashboardData?.summary?.survivalRatePct === 'number');

  const statusStyles = getSurvivalStatusStyles(currentSurvivalRate);


  const SVG_HEIGHT = 150;
  const PADDING_X = 20;
  const MIN_POINT_GAP = 60;
  const MAX_GRAPH_VALUE = 100;

  const requiredWidth = (graphData.length - 1) * MIN_POINT_GAP + (PADDING_X * 2);
  const SVG_WIDTH = Math.max(280, requiredWidth);

  const getY = (val: number): number => {
    const clamped = Math.max(0, Math.min(MAX_GRAPH_VALUE, val));
    return 130 - (clamped / MAX_GRAPH_VALUE) * 110;
  };

  const getX = (index: number): number => {
    if (graphData.length <= 1) return SVG_WIDTH / 2;
    const step = (SVG_WIDTH - (PADDING_X * 2)) / (graphData.length - 1);
    return PADDING_X + (index * step);
  };

  const axisValues = [100, 75, 50, 25, 0];

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

        {/* 2. รายงานอุณหภูมิ (Config LARGE) */}
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
                  {buildTemperatureDeltaText(dashboardData?.summary?.airTemperatureC, LARGE_STAGE_COMFORT_RANGE)}
                </p>
                <p className="text-xl font-medium text-[#054DD3]">
                  {buildFeedAdviceText(dashboardData?.summary?.recommendedFeedAdjustmentPct)}
                </p>
              </div>
              <div>
                <h4 className="text-base font-bold text-black mb-1">คำแนะนำ :</h4>
                <p className="text-base text-black leading-relaxed">
                  หากอุณหภูมิน้ำอยู่ในช่วงที่เหมาะสม ({LARGE_STAGE_COMFORT_ZONE}) ปลามักจะกินอาหารและเจริญเติบโตได้ดี ควรเฝ้าดูแนวโน้มอุณหภูมิทุกวัน
                </p>
              </div>
            </>
          )}
        </div>

        <AgeAdvisoryCard
          group="LARGE"
          latestFishAgeLabel={dashboardData?.summary?.latestFishAgeLabel ?? null}
          latestFishAgeDays={currentAgeDays}
          loading={loading}
        />

        {/* 5. กราฟแนวโน้มอัตราการรอด (Fixed Y-Axis) */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h3 className="text-base font-bold text-[#093832] mb-3 ml-1">แนวโน้มอัตราการรอด</h3>

          <div className="flex items-start">

            {/* แกน Y Fixed */}
            <div
              className="w-9 shrink-0 relative mr-1 border-r border-gray-100"
              style={{ height: SVG_HEIGHT }}
            >
              <svg width="100%" height="100%" className="overflow-visible">
                {axisValues.map((val) => (
                  <text
                    key={val}
                    x="100%"
                    y={getY(val) + 4}
                    fontSize="10"
                    fill="#999"
                    textAnchor="end"
                    className="pr-1"
                  >
                    {formatSurvivalPct(val)}
                  </text>
                ))}
              </svg>
            </div>

            {/* พื้นที่กราฟ Scrollable */}
            <div
              ref={scrollContainerRef}
              className="flex-1 overflow-x-auto pb-2 scrollbar-hide relative"
              style={{ scrollBehavior: 'smooth' }}
            >
              <div className="relative" style={{ width: SVG_WIDTH, height: SVG_HEIGHT }}>
                {hoverData && (() => {
                  const isHighValue = hoverData.value > 80;
                  return (
                    <div
                      className="absolute bg-white rounded-lg px-3 py-2 shadow-lg border border-gray-100 pointer-events-none z-30 transition-all duration-100"
                      style={{
                        left: `${(hoverData.x / SVG_WIDTH) * 100}%`,
                        top: `${(hoverData.y / SVG_HEIGHT) * 100}%`,
                        marginTop: isHighValue ? '12px' : '-12px',
                        transform: isHighValue ? 'translate(-50%, 0)' : 'translate(-50%, -100%)'
                      }}
                    >
                      <div className="text-xs text-gray-600 font-medium">ค่าเฉลี่ย</div>
                      <div className="text-sm font-bold" style={{ color: statusStyles.stroke }}>{formatSurvivalPct(hoverData.value)}</div>
                      <div className={`absolute left-1/2 -translate-x-1/2 border-8 border-transparent drop-shadow-sm ${isHighValue ? 'bottom-full border-b-white' : 'top-full border-t-white'
                        }`}></div>
                    </div>
                  );
                })()}

                <svg viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} className="w-full h-full overflow-visible">
                  {axisValues.map((val) => (
                    <line
                      key={val}
                      x1="0" y1={getY(val)}
                      x2={SVG_WIDTH} y2={getY(val)}
                      stroke="#f0f0f0" strokeWidth="1"
                    />
                  ))}

                  <path
                    d={smoothPathD}
                    fill="none"
                    stroke={statusStyles.stroke}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-colors duration-300"
                  />

                  {graphData.map((item, index) => {
                    const xCenter = getX(index);
                    return (
                      <g key={index}>
                        <rect
                          x={xCenter - 15}
                          y="0"
                          width="30"
                          height={SVG_HEIGHT}
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
                          y={SVG_HEIGHT - 5}
                          fontSize="9"
                          fill="#999"
                          textAnchor="middle"
                          className={`transition-colors ${hoverData?.x === xCenter ? 'font-bold' : ''}`}
                          style={{ fill: hoverData?.x === xCenter ? statusStyles.stroke : '#999' }}
                        >
                          {item.month}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

          </div>

          {!loading && graphData.length === 0 && (
            <div className="flex items-center justify-center text-gray-500 text-sm h-40">
              ไม่มีข้อมูล
            </div>
          )}
        </div>

        {/* 6. รูปปลา & อัตราการรอดชีวิต (Dynamic Color) */}
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

          <div className={`rounded-2xl p-5 flex flex-col justify-center h-full text-center relative transition-colors duration-300 ${statusStyles.bg}`}>
            <div className="mb-2 flex items-center justify-center gap-2">
              <Image src={statusStyles.icon} alt="survival-rate" width={24} height={24} className="text-black shrink-0" />
              <span className="text-black text-base font-semibold leading-tight text-left">
                อัตราการรอด
              </span>
            </div>

            <div className="flex flex-col items-center gap-1 mt-1">
              {hasSurvival ? (
                <span className={`text-3xl font-bold ${statusStyles.text}`}>
                  {formatSurvivalPct(currentSurvivalRate)}
                </span>
              ) : (
                <span className="text-3xl font-bold text-black">-</span>
              )}
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

        {/* 8. Action Buttons (Links updated for LARGE) */}
        <div className="pt-2 space-y-3 md:space-y-0 md:grid md:grid-cols-3 md:gap-4 md:col-span-2 lg:col-span-4">
          <Link href="/large/weather-large" className="block w-full">
            <button className="w-full bg-[#0084FF] hover:bg-blue-700 text-white py-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition-colors text-lg cursor-pointer">
              <Image src="/nursery-large/fluent_weather-hail-day-w.svg" alt="icon" width={24} height={24} />
              สภาพอากาศ
            </button>
          </Link>

          <Link href="/large/price-large" className="block w-full">
            <button className="w-full bg-[#FF4242] hover:bg-[#e03535] text-white py-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition-colors text-lg cursor-pointer">
              <Image src="/nursery-large/healthicons_money-bag.svg" alt="icon" width={24} height={24} />
              ตรวจสอบราคาตลาด
            </button>
          </Link>

          <Link href="/large/feeding-large" className="block w-full">
            <button className="w-full bg-[#EF6E11] hover:bg-orange-700 text-white py-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition-colors text-lg cursor-pointer">
              <Image src="/nursery-large/fluent_food-grains-w.svg" alt="icon" width={24} height={24} />
              การให้อาหาร
            </button>
          </Link>

          <Link href="/large/disease-info-large" className="block w-full">
            <button className="w-full bg-[#A530FF] hover:bg-[#8a2be2] text-white py-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition-colors text-lg cursor-pointer">
              <Image src="/nursery-large/famicons_fish-w.svg" alt="icon" width={24} height={24} />
              การรักษาโรค
            </button>
          </Link>

          <Link href="/large/record-large" className="block w-full">
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