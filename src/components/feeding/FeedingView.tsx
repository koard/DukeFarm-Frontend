"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronDown, Fish } from "lucide-react";
import { useDashboardData } from "@/hooks/useDashboardData";
import { ProfileDropdownMenu } from "@/components/common/ProfileDropdownMenu";
import { API_BASE_URL } from "@/config/api";

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
    const router = useRouter();
    const searchParams = useSearchParams();
    const [selectedFormula, setSelectedFormula] = useState<FeedFormula | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [expandedFoodTypes, setExpandedFoodTypes] = useState<Set<FoodType>>(new Set());



    const { data: dashboardData, loading, error } = useDashboardData<DashboardData>(farmType);
    const [feedingInfo, setFeedingInfo] = useState<FeedingInfo | null>(null);
    const [feedFormulas, setFeedFormulas] = useState<FeedFormula[]>([]);



    useEffect(() => {
        const fetchFeedFormulas = async () => {
            try {
                const token = localStorage.getItem("authToken");
                if (!token) return;

                const response = await fetch(`${API_BASE_URL}/feed-formulas?limit=100`, {
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

    // Handle changing fish type
    const handleTypeChange = (newType: FarmType) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("type", newType);
        router.push(`/dashboard-farmer/feeding?${params.toString()}`);
    };

    return (
        <div className="min-h-screen bg-white pb-10">

            <div className="bg-[#093832] text-white px-4 pt-5 pb-4 rounded-b-3xl shadow-md relative z-30 flex items-center justify-between">
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

                {/* Fish Type Chips */}
                {!showResult && (
                    <div className="flex gap-2 mb-4 overflow-x-auto pb-2 no-scrollbar">
                        {(Object.keys(FARM_TYPE_LABELS) as FarmType[]).map((type) => {
                            const isActive = farmType === type;
                            return (
                                <button
                                    key={type}
                                    onClick={() => handleTypeChange(type)}
                                    className={`
                                        flex-1 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border
                                        ${isActive
                                            ? 'bg-[#093832] text-white border-[#093832] shadow-md'
                                            : 'bg-white text-gray-500 border-gray-200 hover:border-[#093832] hover:text-[#093832]'
                                        }
                                    `}
                                >
                                    {FARM_TYPE_LABELS[type]}
                                </button>
                            );
                        })}
                    </div>
                )}

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



                        </div>

                    </div>
                )}


            </div>
        </div>
    );
};