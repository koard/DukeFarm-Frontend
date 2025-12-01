"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image"; 
import Link from "next/link";
import { ChevronLeft, ChevronDown } from "lucide-react";
import { useLineUser } from "@/hooks/useLineUser";

const API_BASE_URL = "https://dukefarm-backend.onrender.com/api";

interface WeatherData {
  airTemperatureC: number | null;
  humidityPct: number | null;
  rainMm: number | null;
}

export default function FeedingLargePage() {
  const router = useRouter();
  const lineUser = useLineUser();
  const [selectedAge, setSelectedAge] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showResult, setShowResult] = useState(false);
    const [weatherData, setWeatherData] = useState<WeatherData | null>(null);

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                const token = localStorage.getItem("authToken");
                if (!token) {
                    router.push("/login");
                    return;
                }

                const response = await fetch(`${API_BASE_URL}/dashboard/groups/NURSERY_LARGE`, {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch dashboard data");
                }

                const result = await response.json();
                setWeatherData(result.data?.summary?.weather ?? null);
            } catch (err) {
                console.error("ไม่สามารถโหลดข้อมูลสภาพอากาศ:", err);
                setWeatherData(null);
            }
        };

        fetchWeather();
    }, [router]);

  const ageOptions = [
    "0–15 วัน (ระยะลูกปลา)",
    "16–30 วัน (ลูกปลาขนาดกลาง)",
    "31–60 วัน (ปลาขุนระยะต้น)",
    "61–90 วัน (ปลาขุนระยะกลาง)",
    "91–120 วัน (ปลาขุนระยะสุดท้าย)",
    ">120 วัน (ขนาดตลาด)"
  ];

  const feedingInfo = {
    weightRange: "0.01-0.02",
    feedCharacteristics: [
       "อาหารเม็ดเล็ก ขนาด 0.5–1.0 มม.",
       "โปรตีน 35–40%"
    ],
    advice: [
       "ให้ 2 มื้อใหญ่ต่อวัน (เช้า-เย็น)",
       "เพิ่มสัดส่วนพลังงาน (ข้าวโพด, รำ) ลดโปรตีนลงเล็กน้อย",
       "อัตราโปรตีน 28-32% ก็เพียงพอ",
       "ติดตาม FCR เพื่อควบคุมต้นทุนอาหาร"
    ]
  };

  const handleViewData = () => {
      if (!selectedAge) return;
      setShowResult(true);
      setIsDropdownOpen(false);
  };

  const getDisplayAge = (fullString: string) => {
      return fullString.split(" (")[0];
  };

  return (
    <div className="min-h-screen bg-white pb-10">
      
      <div className="bg-[#093832] text-white px-4 pt-8 pb-10 rounded-b-[40px] shadow-md relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
            <Link 
              href="/nursery-large" 
              className="p-1 hover:bg-white/10 rounded-full transition-colors"
            >
              <ChevronLeft className="w-8 h-8" />
            </Link>
            <h1 className="text-2xl font-bold">การให้อาหาร</h1>
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

      <div className="px-6 mt-4 w-full max-w-5xl mx-auto">

        {/* สภาพอากาศ Auto */}
                {!showResult && (
                    <div className="mb-6">
                        <h2 className="text-lg font-bold text-black mb-2">สภาพอากาศปัจจุบัน</h2>
                        <div className="flex items-center bg-[#D8EFFF] rounded-xl overflow-hidden shadow-sm">
                            <div className="flex-1 py-4 flex flex-col items-center justify-center">
                                <div className="flex items-center gap-1 mb-1">
                                    <Image src="/nursery-large/fluent_temperature-b.svg" alt="temp" width={20} height={20} />
                                    <span className="text-sm text-black">อุณหภูมิ</span>
                                </div>
                                <p className="text-xl font-bold text-black">{weatherData?.airTemperatureC ?? '--'} °C</p>
                            </div>
                            <div className="w-[2px] h-[40px] bg-white"></div>
                            <div className="flex-1 py-4 flex flex-col items-center justify-center">
                                <div className="flex items-center gap-1 mb-1">
                                    <Image src="/nursery-large/fluent_weather-rain-snow-b.svg" alt="rain" width={20} height={20} />
                                    <span className="text-sm text-black">ปริมาณน้ำฝน</span>
                                </div>
                                <p className="text-xl font-bold text-black">{weatherData?.rainMm ?? '--'} mm</p>
                            </div>
                            <div className="w-[2px] h-[40px] bg-white"></div>
                            <div className="flex-1 py-4 flex flex-col items-center justify-center">
                                <div className="flex items-center gap-1 mb-1">
                                    <Image src="/nursery-large/mdi_dots-triangle.svg" alt="humidity" width={20} height={20} />
                                    <span className="text-sm text-black">ความชื้นสัมพัทธ์</span>
                                </div>
                                <p className="text-xl font-bold text-black">{weatherData?.humidityPct ?? '--'}%</p>
                            </div>
                        </div>
                    </div>
                )}
        
        <label className="block text-lg font-bold text-black mb-2 mt-4">
            เลือกช่วงอายุปลา
        </label>

        <div className="relative mb-6">
            <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 flex items-center justify-between text-lg text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#093832]"
            >
                <span className={selectedAge ? "text-black" : "text-gray-400"}>
                    {selectedAge ? getDisplayAge(selectedAge) : "เลือกข้อมูลช่วงอายุ"}
                </span>
                <ChevronDown className={`w-6 h-6 text-gray-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-20 max-h-64 overflow-y-auto">
                    {ageOptions.map((option, index) => (
                        <div 
                            key={index}
                            onClick={() => {
                                setSelectedAge(option);
                                setIsDropdownOpen(false);
                                setShowResult(false);
                            }}
                            className="px-4 py-3 text-lg text-black hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-none"
                        >
                            {getDisplayAge(option)}
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* Button */}
        <button
            onClick={handleViewData}
            disabled={!selectedAge}
            className={`w-full py-4 rounded-xl text-xl font-bold text-white transition-all duration-200 shadow-md mb-8 ${
                selectedAge 
                ? "bg-[#EF6E11] hover:bg-[#d65d0a] active:scale-95" 
                : "bg-[#A0A0A0] cursor-not-allowed" 
            }`}
        >
            ดูข้อมูลการให้อาหาร
        </button>

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
                            <Image src="/nursery-large/famicons_fish-outline.svg" alt="age" width={20} height={20} />
                            <span className="text-base font-medium text-center">อายุปลา</span>
                        </div>
                        <p className="text-xl font-bold text-black text-center">
                            {getDisplayAge(selectedAge)}
                        </p>
                    </div>

                    <div className="w-[1px] h-[90px] bg-white"></div>

                    <div className="flex-1 p-5 flex flex-col items-center justify-center">
                        <div className="flex items-center gap-2 mb-1 text-black">
                            <Image src="/nursery-large/hugeicons_weight.svg" alt="weight" width={20} height={20} />
                            <span className="text-base font-medium text-center">น้ำหนักเฉลี่ย (Kg.)</span>
                        </div>
                        <p className="text-xl font-bold text-black">
                            {feedingInfo.weightRange}
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
                                                    <p className="text-2xl font-bold text-black">32 °C</p>
                                                </div>
                                
                                                <div className="w-[2px] h-[50px] bg-white"></div>
                                
                                                <div className="flex-1 p-4 flex flex-col items-center justify-center">
                                                    <div className="flex items-center gap-2 mb-1 text-black">
                                                        <Image src="/nursery-large/famicons_fish-outline.svg" alt="eat" width={20} height={20} />
                                                        <span className="text-base font-medium">การทานอาหาร</span>
                                                    </div>
                                                    <p className="text-xl font-bold text-black text-center">ปลากินดี โตเร็ว</p> 
                                                </div>
                                            </div>

                <div className="space-y-6 w-full">
                    
                    {/* Block 1: ลักษณะอาหาร */}
                    <div className="w-full">
                        <h3 className="text-sm font-bold text-black mb-2 pl-1">ลักษณะอาหารที่เหมาะสม</h3>
                        <div className="bg-[#F4FFFC] rounded-xl p-4 w-full shadow-sm border border-emerald-50/50">
                            <div className="space-y-1">
                                {feedingInfo.feedCharacteristics.map((text, i) => (
                                    <p key={i} className="text-sm text-black">{text}</p>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Block 2: คำแนะนำ */}
                    <div className="w-full">
                        <h3 className="text-sm font-bold text-black mb-2 pl-1">คำแนะนำเพิ่มเติม</h3>
                        <div className="bg-[#F4FFFC] rounded-xl p-4 w-full shadow-sm border border-emerald-50/50">
                            <ul className="list-disc pl-5 space-y-1">
                                {feedingInfo.advice.map((text, i) => (
                                    <li key={i} className="text-sm text-black pl-1">{text}</li>
                                ))}
                            </ul>
                        </div>
                    </div>

                </div>

            </div>
        )}

      </div>
    </div>
  );
}