"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronDown } from "lucide-react";
import { useDashboardData } from "@/hooks/useDashboardData";
import { ProfileDropdownMenu } from "@/components/common/ProfileDropdownMenu";

type FarmType = "SMALL" | "LARGE" | "MARKET";

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

interface ForecastData {
  date: string;
  meanTemperatureC: number;
  highTemperatureC: number;
  lowTemperatureC: number;
  weatherCode?: number;
  conditionText?: string;
  feedAdjustmentPct: number;
  feedingRecommendation: string;
}

interface DashboardData {
  group: string;
  hasData: boolean;
  summary: DashboardSummary;
  feedingPlan: ForecastData[];
}

interface FeedFormula {
  id: string;
  name: string;
  targetStage: string;
  description: string;
  recommendations: string;
  farmType?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface FeedingInfo {
  name: string;
  targetStage: string;
  description?: string;
  feedCharacteristics: string[];
  advice: string[];
  weightRange: string;
}

interface FeedingViewProps {
  farmType: FarmType;
  backHref: string;
}

export const FeedingView = ({ farmType, backHref }: FeedingViewProps) => {
  const [selectedFormula, setSelectedFormula] = useState<FeedFormula | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const { data: dashboardData, loading, error } = useDashboardData<DashboardData>(farmType);
  const [feedingInfo, setFeedingInfo] = useState<FeedingInfo | null>(null);
  const [feedFormulas, setFeedFormulas] = useState<FeedFormula[]>([]);

  useEffect(() => {
    const fetchFeedFormulas = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) return;

                const response = await fetch("https://dukefarm-backend.onrender.com/api/feed-formulas?limit=100", {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });

                if (response.ok) {
                    const result = await response.json();
                    const formulas = Array.isArray(result.data?.data) ? result.data.data : [];
                    const filteredFormulas = formulas.filter(
                        (formula: FeedFormula) => formula.farmType?.toUpperCase() === farmType
                    );
                    setFeedFormulas(filteredFormulas);
                }
      } catch (err) {
        console.error("Failed to fetch feed formulas:", err);
      }
    };

        fetchFeedFormulas();
    }, [farmType]);

    const handleViewData = (formula?: FeedFormula) => {
        const target = formula ?? selectedFormula;
        if (!target) return;

        const recommendations = target.recommendations
            ? target.recommendations.split('\n').filter((line: string) => line.trim())
            : [];

        setSelectedFormula(target);
        setFeedingInfo({
            name: target.name,
            targetStage: target.targetStage,
            description: target.description,
            feedCharacteristics: target.description
                ? target.description.split('\n').filter((line: string) => line.trim())
                : [],
            advice: recommendations,
            weightRange: "N/A"
        });

        setShowResult(true);
        setIsDropdownOpen(false);
    };
  
  const getFeedingRecommendationText = () => {
    if (loading) return "กำลังโหลด...";
    if (error || !dashboardData?.hasData || dashboardData?.summary?.recommendedFeedAdjustmentPct === null) {
      return "N/A";
    }
    const pct = dashboardData?.summary?.recommendedFeedAdjustmentPct;
    if (pct === undefined) return "N/A";
    if (pct > 0) return `เพิ่มอาหาร ${pct}%`;
    if (pct < 0) return `กินน้อยลง ${Math.abs(pct)}%`;
    return "ปกติ";
  };

  return (
    <div className="min-h-screen bg-white pb-10">
      
      <div className="bg-[#093832] text-white px-4 pt-8 pb-10 rounded-b-[40px] shadow-md relative z-30 flex items-center justify-between">
        <div className="flex items-center gap-2">
            <Link 
              href={backHref} 
              className="p-1 hover:bg-white/10 rounded-full transition-colors"
            >
              <ChevronLeft className="w-8 h-8" />
            </Link>
            <h1 className="text-2xl font-bold">การให้อาหาร</h1>
        </div>
        <ProfileDropdownMenu />
      </div>

      <div className="px-6 mt-4 w-full max-w-5xl mx-auto">

        
        <label className="block text-lg font-bold text-black mb-2 mt-4">
            เลือกสูตรอาหารที่ต้องการดูข้อมูล
        </label>

        <div className="relative mb-6">
            <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 flex items-center justify-between text-lg text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#093832]"
            >
                <span className={selectedFormula ? "text-black" : "text-gray-400"}>
                    {selectedFormula?.name || "เลือกข้อมูลช่วงอายุ"}
                </span>
                <ChevronDown className={`w-6 h-6 text-gray-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-20 max-h-64 overflow-y-auto">
                    {feedFormulas.length > 0 ? (
                        feedFormulas.map((formula) => (
                            <div 
                                key={formula.id}
                                onClick={() => handleViewData(formula)}
                                className="px-4 py-3 text-lg text-black hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-none"
                            >
                                {formula.name}
                            </div>
                        ))
                    ) : (
                        <div className="px-4 py-3 text-gray-400 text-center">ไม่พบข้อมูลสูตรอาหาร</div>
                    )}
                </div>
            )}
        </div>

        {/* สภาพอากาศปัจจุบัน */}
        {!showResult && (
           <div className="mb-6">
                <h2 className="text-lg font-bold text-black mb-2">สภาพอากาศปัจจุบัน</h2>
                {loading ? (
                    <div className="text-center p-4 bg-[#D8EFFF] rounded-xl shadow-sm">กำลังโหลดข้อมูลสภาพอากาศ...</div>
                ) : error ? (
                    <div className="text-center p-4 bg-red-100 text-red-600 rounded-xl shadow-sm">เกิดข้อผิดพลาด: {error}</div>
                ) : dashboardData?.hasData ? (
                    <div className="flex items-center bg-[#D8EFFF] rounded-xl overflow-hidden shadow-sm">
                        <div className="flex-1 py-4 flex flex-col items-center justify-center">
                            <div className="flex items-center gap-1 mb-1">
                                <Image src="/nursery-large/fluent_temperature-b.svg" alt="temp" width={20} height={20} />
                                <span className="text-sm text-black">อุณหภูมิ</span>
                            </div>
                            <p className="text-xl font-bold text-black">{dashboardData?.summary?.airTemperatureC?.toFixed(1) ?? 'N/A'} °C</p>
                        </div>
                        <div className="w-[2px] h-[40px] bg-white"></div>
                        <div className="flex-1 py-4 flex flex-col items-center justify-center">
                            <div className="flex items-center gap-1 mb-1">
                                <Image src="/nursery-large/fluent_weather-rain-snow-b.svg" alt="rain" width={20} height={20} />
                                <span className="text-sm text-black">ปริมาณน้ำฝน</span>
                            </div>
                            <p className="text-xl font-bold text-black">{dashboardData?.summary?.weather?.rainMm !== undefined ? `${dashboardData?.summary?.weather?.rainMm} mm` : 'N/A'}</p>
                        </div>
                        <div className="w-[2px] h-[40px] bg-white"></div>
                        <div className="flex-1 py-4 flex flex-col items-center justify-center">
                            <div className="flex items-center gap-1 mb-1">
                                <Image src="/nursery-large/mdi_dots-triangle.svg" alt="humidity" width={20} height={20} />
                                <span className="text-sm text-black">ความชื้น</span>
                            </div>
                            <p className="text-xl font-bold text-black">{dashboardData?.summary?.weather?.humidityPct !== undefined ? `${dashboardData?.summary?.weather?.humidityPct}%` : 'N/A'}</p>
                        </div>
                    </div>
                ) : (
                    <div className="text-center p-4 bg-gray-100 rounded-xl shadow-sm">ไม่มีข้อมูลสภาพอากาศ</div>
                )}
            </div>
        )}

        {showResult && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-500 w-full">
                
                <div className="flex items-center gap-2 mb-3 text-[#093832]">
                    <Image src="/nursery-large/fluent_food-grains.svg" alt="icon" width={24} height={24} />
                    <span className="text-base font-bold">การให้อาหาร</span>
                </div>

                {/* Yellow Card Info */}
                <div className="flex items-center bg-[#FFEFBC] rounded-2xl overflow-hidden mb-6 w-full shadow-sm min-h-[100px]">
                    
                    <div className="flex-1 p-5 flex flex-col items-center justify-center">
                        <div className="flex items-center gap-2 mb-1 text-black">
                            <Image src="/nursery-large/fluent_food-grains.svg" alt="formula" width={20} height={20} />
                            <span className="text-base font-medium text-center">สูตรอาหาร</span>
                        </div>
                        <p className="text-lg font-bold text-black text-center">
                            {feedingInfo?.name || 'N/A'}
                        </p>
                    </div>

                    <div className="w-[1px] h-[90px] bg-white"></div>

                    <div className="flex-1 p-5 flex flex-col items-center justify-center">
                        <div className="flex items-center gap-2 mb-1 text-black">
                            <Image src="/nursery-large/famicons_fish-outline.svg" alt="age" width={20} height={20} />
                            <span className="text-base font-medium text-center">อายุปลา</span>
                        </div>
                        <p className="text-xl font-bold text-black text-center">
                            {feedingInfo?.targetStage || 'N/A'}
                        </p>
                    </div>
                </div>

                {/* Blue Card Info */}
                <div className="flex items-center bg-[#D8EFFF] rounded-2xl overflow-hidden shadow-sm min-h-[100px] mb-4">
                    <div className="flex-1 p-4 flex flex-col items-center justify-center">
                        <div className="flex items-center gap-2 mb-1 text-black">
                            <Image src="/nursery-large/fluent_temperature-b.svg" alt="temp" width={20} height={20} />
                            <span className="text-base font-medium">อุณหภูมิ</span>
                        </div>
                        <p className="text-2xl font-bold text-black">
                            {loading ? '...' : `${dashboardData?.summary?.airTemperatureC?.toFixed(1) ?? 'N/A'} °C`}
                        </p>
                    </div>
 
                    <div className="w-[2px] h-[50px] bg-white"></div>
 
                    <div className="flex-1 p-4 flex flex-col items-center justify-center">
                        <div className="flex items-center gap-2 mb-1 text-black">
                            <Image src="/nursery-large/famicons_fish-outline.svg" alt="eat" width={20} height={20} />
                            <span className="text-base font-medium">การทานอาหาร</span>
                        </div>
                        <p className="text-xl font-bold text-black text-center">{getFeedingRecommendationText()}</p> 
                    </div>
                </div>

                <div className="space-y-6 w-full">
                    
                    {/* Block 1: ลักษณะอาหาร */}
                    {feedingInfo?.feedCharacteristics && feedingInfo.feedCharacteristics.length > 0 && (
                        <div className="w-full">
                            <h3 className="text-sm font-bold text-black mb-2 pl-1">ลักษณะอาหารที่เหมาะสม</h3>
                            <div className="bg-[#F4FFFC] rounded-xl p-4 w-full shadow-sm border border-emerald-50/50">
                                <div className="space-y-1">
                                    {feedingInfo.feedCharacteristics.map((text: string, i: number) => (
                                        <p key={i} className="text-sm text-black">{text}</p>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Block 2: คำแนะนำ */}
                    {feedingInfo?.advice && feedingInfo.advice.length > 0 && (
                        <div className="w-full">
                            <h3 className="text-sm font-bold text-black mb-2 pl-1">คำแนะนำเพิ่มเติม</h3>
                            <div className="bg-[#F4FFFC] rounded-xl p-4 w-full shadow-sm border border-emerald-50/50">
                                <ul className="list-disc pl-5 space-y-1">
                                    {feedingInfo.advice.map((text: string, i: number) => (
                                        <li key={i} className="text-sm text-black pl-1">{text}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                </div>

            </div>
        )}

      </div>
    </div>
  );
};