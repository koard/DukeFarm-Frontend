"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronDown, Calculator, Fish } from "lucide-react";
import { useDashboardData } from "@/hooks/useDashboardData";
import { ProfileDropdownMenu } from "@/components/common/ProfileDropdownMenu";

type FarmType = "SMALL" | "LARGE" | "MARKET";
type FoodType = "FRESH" | "PELLET" | "SUPPLEMENT";

interface DashboardSummary {
    asOf: string;
    airTemperatureC: number | null;
    temperatureDeltaC: number | null;
    comfortRangeC: { min: number; max: number };
    recommendedFeedAdjustmentPct: number | null;
    weather: {
        time: string;
        temperatureC: number;
        humidityPct: number;
        windSpeedKph: number;
        rainMm: number;
        conditionText: string;
    } | null;
}

interface DashboardData {
    group: string;
    hasData: boolean;
    summary: DashboardSummary;
}

interface FeedFormula {
    id: string;
    name: string;
    targetStage: string;
    foodType: FoodType;
    nutrients?: string;
    usage?: string;
    recommendations?: string;
    farmType?: string;
}

interface FeedingInfo {
    name: string;
    targetStage: string;
    nutrients: string[];
    usage: string[];
    recommendations: string[];
}

interface FeedingViewProps {
    farmType: FarmType;
    backHref: string;
}

// FCR และอัตราให้อาหารตามขนาดปลา (จากกรมประมง)
const getFeedingParams = (fishWeightGr: number): { fcr: number; feedingRate: number; feedingRateLabel: string } => {
    if (fishWeightGr < 5) {
        return { fcr: 1.8, feedingRate: 0.12, feedingRateLabel: "10-15%" };
    } else if (fishWeightGr < 20) {
        return { fcr: 1.6, feedingRate: 0.07, feedingRateLabel: "6-8%" };
    } else if (fishWeightGr < 100) {
        return { fcr: 1.5, feedingRate: 0.05, feedingRateLabel: "4-6%" };
    } else {
        return { fcr: 1.3, feedingRate: 0.032, feedingRateLabel: "3-3.2%" };
    }
};

const FARM_TYPE_LABELS: Record<FarmType, string> = {
    SMALL: "ปลาตุ่ม",
    LARGE: "ปลานิ้ว",
    MARKET: "ปลาตลาด"
};

const FARM_TYPE_SIZE: Record<FarmType, string> = {
    SMALL: "2-5 ซม.",
    LARGE: "5-10 ซม.",
    MARKET: ">10 ซม."
};

const FOOD_TYPE_OPTIONS: { value: FoodType; label: string; icon: string }[] = [
    { value: "FRESH", label: "อาหารสด", icon: "🥩" },
    { value: "PELLET", label: "อาหารเม็ด", icon: "🟤" },
    { value: "SUPPLEMENT", label: "อาหารเสริม", icon: "💊" }
];

export const FeedingView = ({ farmType, backHref }: FeedingViewProps) => {
    const [selectedFormula, setSelectedFormula] = useState<FeedFormula | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [expandedFoodTypes, setExpandedFoodTypes] = useState<Set<FoodType>>(new Set());

    // Calculator states
    const [fishWeight, setFishWeight] = useState<number>(50);
    const [fishCount, setFishCount] = useState<number>(1000);
    const [showCalculator, setShowCalculator] = useState(false);

    const { data: dashboardData, loading, error } = useDashboardData<DashboardData>(farmType);
    const [feedingInfo, setFeedingInfo] = useState<FeedingInfo | null>(null);
    const [feedFormulas, setFeedFormulas] = useState<FeedFormula[]>([]);

    // Calculator result
    const calculatorResult = useMemo(() => {
        const totalWeightKg = (fishWeight * fishCount) / 1000;
        const params = getFeedingParams(fishWeight);
        const dailyFeedKg = totalWeightKg * params.feedingRate;

        return {
            totalWeightKg: totalWeightKg.toFixed(2),
            fcr: params.fcr,
            feedingRate: params.feedingRateLabel,
            dailyFeedKg: dailyFeedKg.toFixed(2)
        };
    }, [fishWeight, fishCount]);

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

        const nutrients = target.nutrients
            ? target.nutrients.split('\n').filter((line: string) => line.trim())
            : [];

        const usage = target.usage
            ? target.usage.split('\n').filter((line: string) => line.trim())
            : [];

        const recommendations = target.recommendations
            ? target.recommendations.split('\n').filter((line: string) => line.trim())
            : [];

        setSelectedFormula(target);
        setFeedingInfo({
            name: target.name,
            targetStage: target.targetStage,
            nutrients,
            usage,
            recommendations
        });

        setShowResult(true);
    };

    const handleBack = () => {
        setShowResult(false);
        setSelectedFormula(null);
    };

    return (
        <div className="min-h-screen bg-white pb-10">

            <div className="bg-[#093832] text-white px-4 pt-5 pb-6 rounded-b-3xl shadow-md relative z-30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Link
                        href={backHref}
                        className="p-1 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <ChevronLeft className="w-8 h-8" />
                    </Link>
                    <h1 className="text-2xl font-bold">การให้อาหาร</h1>
                </div>
                <ProfileDropdownMenu showGreeting={false} />
            </div>

            <div className="px-6 mt-4 w-full max-w-5xl mx-auto">

                {/* Food Type Accordion */}
                {!showResult && (
                    <div className="space-y-3">
                        {FOOD_TYPE_OPTIONS.map((option) => {
                            const isExpanded = expandedFoodTypes.has(option.value as FoodType);
                            const formulas = feedFormulas.filter(f => f.foodType === option.value);

                            const toggleExpand = () => {
                                setExpandedFoodTypes(prev => {
                                    const next = new Set(prev);
                                    if (next.has(option.value as FoodType)) {
                                        next.delete(option.value as FoodType);
                                    } else {
                                        next.add(option.value as FoodType);
                                    }
                                    return next;
                                });
                            };

                            return (
                                <div key={option.value} className="border-2 border-gray-200 rounded-xl overflow-hidden">
                                    <button
                                        onClick={toggleExpand}
                                        className={`w-full p-4 flex items-center gap-4 transition-all text-left ${isExpanded ? 'bg-gray-50' : 'bg-white hover:bg-[#F4FFFC]'}`}
                                    >
                                        <span className="text-3xl">{option.icon}</span>
                                        <span className="text-lg font-medium text-black">{option.label}</span>
                                        <ChevronDown className={`w-5 h-5 ml-auto text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                                    </button>

                                    {isExpanded && (
                                        <div className="p-3 bg-gray-50 space-y-2">
                                            {formulas.length > 0 ? (
                                                formulas.map((formula) => (
                                                    <button
                                                        key={formula.id}
                                                        onClick={() => handleViewData(formula)}
                                                        className="w-full p-4 flex items-center justify-between bg-white border border-gray-200 rounded-xl hover:border-[#093832] hover:bg-[#F4FFFC] transition-all text-left"
                                                    >
                                                        <div>
                                                            <p className="text-base font-medium text-black">{formula.name}</p>
                                                            <p className="text-sm text-gray-500">สำหรับปลาขนาด {formula.targetStage}</p>
                                                        </div>
                                                        <ChevronDown className="w-5 h-5 text-gray-400 -rotate-90" />
                                                    </button>
                                                ))
                                            ) : (
                                                <div className="p-4 text-center text-gray-500">
                                                    ไม่พบสูตรอาหารในหมวดนี้
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Formula Details */}
                {showResult && (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-500 w-full">

                        <button
                            onClick={handleBack}
                            className="flex items-center gap-1 text-[#093832] mb-3 hover:underline"
                        >
                            <ChevronLeft className="w-5 h-5" />
                            <span>กลับ</span>
                        </button>

                        <div className="inline-flex items-center gap-2 bg-[#093832] text-white px-4 py-2 rounded-full mb-4">
                            <span>{FOOD_TYPE_OPTIONS.find(o => o.value === selectedFormula?.foodType)?.icon}</span>
                            <span className="font-medium">{FOOD_TYPE_OPTIONS.find(o => o.value === selectedFormula?.foodType)?.label}</span>
                        </div>

                        <div className="bg-[#F4FFFC] rounded-xl p-4 mb-4 border border-emerald-100">
                            <h3 className="text-lg font-bold text-black mb-1">{feedingInfo?.name}</h3>
                            <p className="text-sm text-gray-600">สำหรับปลาขนาด {feedingInfo?.targetStage}</p>
                        </div>

                        <div className="space-y-4 w-full">

                            {/* สารอาหาร */}
                            {feedingInfo?.nutrients && feedingInfo.nutrients.length > 0 && (
                                <div className="w-full">
                                    <h3 className="text-sm font-bold text-black mb-2 pl-1">สารอาหาร</h3>
                                    <div className="bg-[#F4FFFC] rounded-xl p-4 w-full shadow-sm border border-emerald-50/50">
                                        <div className="space-y-1">
                                            {feedingInfo.nutrients.map((text: string, i: number) => (
                                                <p key={i} className="text-sm text-black">{text}</p>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* วิธีการให้ */}
                            {feedingInfo?.usage && feedingInfo.usage.length > 0 && (
                                <div className="w-full">
                                    <h3 className="text-sm font-bold text-black mb-2 pl-1">วิธีการให้</h3>
                                    <div className="bg-[#F4FFFC] rounded-xl p-4 w-full shadow-sm border border-emerald-50/50">
                                        <div className="space-y-1">
                                            {feedingInfo.usage.map((text: string, i: number) => (
                                                <p key={i} className="text-sm text-black">{text}</p>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* คำแนะนำ */}
                            {feedingInfo?.recommendations && feedingInfo.recommendations.length > 0 && (
                                <div className="w-full">
                                    <h3 className="text-sm font-bold text-black mb-2 pl-1">คำแนะนำ</h3>
                                    <div className="bg-[#FFF4E5] rounded-xl p-4 w-full shadow-sm border border-orange-100">
                                        <div className="space-y-1">
                                            {feedingInfo.recommendations.map((text: string, i: number) => (
                                                <p key={i} className="text-sm text-black">{text}</p>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* FCR Calculator Toggle */}
                            <button
                                onClick={() => setShowCalculator(!showCalculator)}
                                className="w-full bg-[#093832] text-white rounded-xl p-4 flex items-center justify-center gap-4 hover:bg-[#0a4a42] transition-colors"
                            >
                                <span className="font-medium">
                                    {showCalculator ? "ซ่อนเครื่องคำนวณ" : "คำนวณปริมาณอาหาร"}
                                </span>
                            </button>

                            {/* FCR Calculator */}
                            {showCalculator && (
                                <div className="bg-[#D8EFFF] rounded-xl p-5 w-full shadow-sm border border-blue-100">
                                    <h3 className="text-base font-bold text-black mb-4 flex items-center gap-2">
                                        <Calculator className="w-5 h-5" />
                                        คำนวณปริมาณอาหาร
                                    </h3>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            น้ำหนักปลาเฉลี่ย (กรัม)
                                        </label>
                                        <div className="flex items-center gap-3 mb-2">
                                            <input
                                                type="number"
                                                min="0.1"
                                                max="500"
                                                step="0.1"
                                                value={fishWeight}
                                                onChange={(e) => setFishWeight(Math.max(0.1, Number(e.target.value) || 0.1))}
                                                className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-center font-bold focus:outline-none focus:ring-2 focus:ring-[#093832]"
                                            />
                                            <span className="text-sm text-gray-600">กรัม</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0.1"
                                            max="500"
                                            step="0.1"
                                            value={fishWeight}
                                            onChange={(e) => setFishWeight(Number(e.target.value))}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#093832]"
                                        />
                                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                                            <span>0.1 กรัม</span>
                                            <span>500 กรัม</span>
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            จำนวนปลา (ตัว)
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="100000"
                                            value={fishCount}
                                            onChange={(e) => setFishCount(Number(e.target.value) || 1)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-lg text-center font-bold focus:outline-none focus:ring-2 focus:ring-[#093832]"
                                        />
                                    </div>

                                    <div className="bg-white rounded-xl p-4 space-y-3">
                                        <h4 className="font-bold text-gray-700 flex items-center gap-2">
                                            📊 ผลการคำนวณ
                                        </h4>

                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div className="bg-gray-50 rounded-lg p-3">
                                                <p className="text-gray-500">น้ำหนักปลารวม</p>
                                                <p className="font-bold text-black">{calculatorResult.totalWeightKg} กก.</p>
                                            </div>
                                            <div className="bg-gray-50 rounded-lg p-3">
                                                <p className="text-gray-500">FCR</p>
                                                <p className="font-bold text-black">{calculatorResult.fcr}</p>
                                            </div>
                                            <div className="bg-gray-50 rounded-lg p-3 col-span-2">
                                                <p className="text-gray-500">อัตราให้อาหาร</p>
                                                <p className="font-bold text-black">{calculatorResult.feedingRate} ต่อวัน</p>
                                            </div>
                                        </div>

                                        <div className="bg-[#093832] text-white rounded-xl p-4 text-center">
                                            <p className="text-sm opacity-80">🎯 ปริมาณอาหารต่อวัน</p>
                                            <p className="text-3xl font-bold">{calculatorResult.dailyFeedKg} กก.</p>
                                        </div>
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