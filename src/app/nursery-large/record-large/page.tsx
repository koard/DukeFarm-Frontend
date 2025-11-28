"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image"; 
import Link from "next/link";
import { ChevronLeft, ChevronDown } from "lucide-react";
import { useLineUser } from "@/hooks/useLineUser";

export default function RecordLargePage() {
  const router = useRouter();
  const lineUser = useLineUser();
  const [selectedAge, setSelectedAge] = useState("");
  const [selectedPondType, setSelectedPondType] = useState("");
  const [pondCount, setPondCount] = useState("");
  const [fishCount, setFishCount] = useState("");

  const [isAgeOpen, setIsAgeOpen] = useState(false);
  const [isPondTypeOpen, setIsPondTypeOpen] = useState(false);
  
  const [showResult, setShowResult] = useState(false);

  const ageOptions = [
    "0–15 วัน (ระยะลูกปลา)",
    "16–30 วัน (ลูกปลาขนาดกลาง)",
    "31–60 วัน (ปลาขุนระยะต้น)",
    "61–90 วัน (ปลาขุนระยะกลาง)",
    "91–120 วัน (ปลาขุนระยะสุดท้าย)",
    ">120 วัน (ขนาดตลาด)"
  ];

  const pondTypeOptions = ["บ่อดิน", "บ่อปูน"];
  const isFormValid = selectedAge && selectedPondType && pondCount && fishCount;

  const getDisplayAge = (fullString: string) => fullString.split(" (")[0];

  const handleClose = () => {
      router.push("/nursery-large"); 
  };

  return (
    <div className="min-h-screen bg-white pb-10 relative">
      
      <div className="bg-[#093832] text-white px-4 pt-8 pb-10 rounded-b-[40px] shadow-md relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
            <Link 
              href="/nursery-large" 
              className="p-1 hover:bg-white/10 rounded-full transition-colors"
            >
              <ChevronLeft className="w-8 h-8" />
            </Link>
            <h1 className="text-2xl font-bold">
                {showResult ? "ผลวิเคราะห์" : "กรอกข้อมูล"}
            </h1>
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
      
      {!showResult ? (
        <div className="px-6 mt-6 w-full max-w-5xl mx-auto space-y-5 animate-in fade-in duration-300">
            
            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#E4F5E7] rounded-xl py-3 px-4 flex items-center justify-between shadow-sm">
                    <span className="text-[#093832] text-lg font-bold">25/06/2025</span>
                    <Image src="/nursery-large/solar_calendar-outline.svg" alt="calendar" width={24} height={24} />
                </div>
                <div className="bg-[#E4F5E7] rounded-xl py-3 px-4 flex items-center justify-between shadow-sm">
                    <span className="text-[#093832] text-lg font-bold">7:00 น.</span>
                    <Image src="/nursery-large/formkit_time.svg" alt="time" width={24} height={24} />
                </div>
            </div>

            {/* สภาพอากาศ Auto */}
            <div>
                <h2 className="text-base text-black mb-2">สภาพอากาศ Auto</h2>
                <div className="flex items-center bg-[#D8EFFF] rounded-xl overflow-hidden shadow-sm">
                    <div className="flex-1 py-4 flex flex-col items-center justify-center">
                        <div className="flex items-center gap-1 mb-1">
                            <Image src="/nursery-large/fluent_temperature-b.svg" alt="temp" width={20} height={20} />
                            <span className="text-sm text-black">อุณหภูมิ</span>
                        </div>
                        <p className="text-xl font-bold text-black">32 °C</p>
                    </div>
                    <div className="w-[2px] h-[40px] bg-white"></div>
                    <div className="flex-1 py-4 flex flex-col items-center justify-center">
                        <div className="flex items-center gap-1 mb-1">
                            <Image src="/nursery-large/fluent_weather-rain-snow-b.svg" alt="rain" width={20} height={20} />
                            <span className="text-sm text-black">ปริมาณน้ำฝน</span>
                        </div>
                        <p className="text-xl font-bold text-black">30</p>
                    </div>
                    <div className="w-[2px] h-[40px] bg-white"></div>
                    <div className="flex-1 py-4 flex flex-col items-center justify-center">
                        <div className="flex items-center gap-1 mb-1">
                            <Image src="/nursery-large/mdi_dots-triangle.svg" alt="humidity" width={20} height={20} />
                            <span className="text-sm text-black">ความชื้นสัมพัทธ์</span>
                        </div>
                        <p className="text-xl font-bold text-black">27</p>
                    </div>
                </div>
            </div>

            {/* ฟอร์มต่างๆ */}
            <div className="relative">
                <label className="block text-lg text-black mb-2">เลือกช่วงอายุปลา</label>
                <button 
                    onClick={() => setIsAgeOpen(!isAgeOpen)}
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 flex items-center justify-between text-lg text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#093832]"
                >
                    <span className={selectedAge ? "text-black" : "text-gray-400"}>
                        {selectedAge ? getDisplayAge(selectedAge) : "เลือกข้อมูลช่วงอายุ"}
                    </span>
                    <ChevronDown className={`w-6 h-6 text-gray-400 transition-transform ${isAgeOpen ? "rotate-180" : ""}`} />
                </button>
                {isAgeOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-20 max-h-60 overflow-y-auto">
                        {ageOptions.map((option, index) => (
                            <div 
                                key={index}
                                onClick={() => { setSelectedAge(option); setIsAgeOpen(false); }}
                                className="px-4 py-3 text-lg text-black hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-none"
                            >
                                {getDisplayAge(option)}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="relative">
                <label className="block text-lg text-black mb-2">ประเภทบ่อ</label>
                <button 
                    onClick={() => setIsPondTypeOpen(!isPondTypeOpen)}
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 flex items-center justify-between text-lg text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#093832]"
                >
                    <span className={selectedPondType ? "text-black" : "text-gray-400"}>
                        {selectedPondType || "ระบุข้อมูล เช่น บ่อดิน, บ่อปูน"}
                    </span>
                    <ChevronDown className={`w-6 h-6 text-gray-400 transition-transform ${isPondTypeOpen ? "rotate-180" : ""}`} />
                </button>
                {isPondTypeOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-20">
                        {pondTypeOptions.map((option, index) => (
                            <div 
                                key={index}
                                onClick={() => { setSelectedPondType(option); setIsPondTypeOpen(false); }}
                                className="px-4 py-3 text-lg text-black hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-none"
                            >
                                {option}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div>
                <label className="block text-lg text-black mb-2">จำนวนบ่อ</label>
                <input 
                    type="number" 
                    value={pondCount}
                    onChange={(e) => setPondCount(e.target.value)}
                    placeholder="ระบุข้อจำนวน เช่น 10, 15, 20"
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-lg text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#093832]"
                />
            </div>

            <div>
                <label className="block text-lg text-black mb-2">จำนวนปลาที่เลี้ยง (ตัว)</label>
                <input 
                    type="text" 
                    value={fishCount}
                    onChange={(e) => setFishCount(e.target.value)}
                    placeholder="ระบุข้อมูล เช่น 250, 250-350"
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-lg text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#093832]"
                />
            </div>

            <button
                disabled={!isFormValid}
                onClick={() => setShowResult(true)}
                className={`w-full py-3.5 rounded-xl text-xl font-bold text-white transition-all duration-200 shadow-md mt-4 ${
                    isFormValid 
                    ? "bg-[#EF6E11] hover:bg-[#d65d0a] active:scale-95" 
                    : "bg-[#A0A0A0] cursor-not-allowed" 
                }`}
            >
                เริ่มวิเคราะห์ข้อมูล
            </button>
        </div>

      ) : (
        <div className="px-6 mt-6 w-full max-w-5xl mx-auto space-y-5 animate-in slide-in-from-right-8 duration-300">
            
            <div className="flex items-center gap-2">
                <Image src="/nursery-large/famicons_fish-g.svg" alt="icon" width={24} height={24} className="text-[#093832]" />
                <h2 className="text-lg font-bold text-[#093832]">ผลวิเคราะห์การเจริญเติบโต (ปลาดุก)</h2>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#E4F5E7] rounded-xl py-3 px-4 flex items-center justify-between shadow-sm">
                    <span className="text-[#093832] text-lg font-bold">25/06/2025</span>
                    <Image src="/nursery-large/solar_calendar-outline.svg" alt="calendar" width={24} height={24} />
                </div>
                <div className="bg-[#E4F5E7] rounded-xl py-3 px-4 flex items-center justify-between shadow-sm">
                    <span className="text-[#093832] text-lg font-bold">7:00 น.</span>
                    <Image src="/nursery-large/formkit_time.svg" alt="time" width={24} height={24} />
                </div>
            </div>

            {/* Stats Card 1 (Yellow) */}
            <div className="flex items-center bg-[#FFEFBC] rounded-2xl overflow-hidden shadow-sm min-h-[100px]">
                <div className="flex-1 p-4 flex flex-col items-center justify-center">
                    <div className="flex items-center gap-2 mb-1 text-black">
                        <Image src="/nursery-large/famicons_fish-outline.svg" alt="age" width={20} height={20} />
                        <span className="text-base font-medium">ช่วงอายุปลา</span>
                    </div>
                    <p className="text-2xl font-bold text-black text-center">
                        {getDisplayAge(selectedAge)}
                    </p>
                </div>
                
                <div className="w-[2px] h-[50px] bg-white"></div>

                <div className="flex-1 p-4 flex flex-col items-center justify-center">
                    <div className="flex items-center justify-center gap-2 mb-1 text-black">
                        <Image src="/nursery-large/hugeicons_weight.svg" alt="weight" width={20} height={20} className="shrink-0" />
                        <span className="text-base font-medium text-center leading-tight">
                            น้ำหนักเฉลี่ย (Kg.)
                        </span>
                    </div>
                    <p className="text-2xl font-bold text-black">2.0</p> 
                </div>
            </div>

            {/* Stats Card 2 (Blue) */}
            <div className="flex items-center bg-[#D8EFFF] rounded-2xl overflow-hidden shadow-sm min-h-[100px]">
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

            {/* Analysis Box */}
            <div className="bg-[#E0E7FF] rounded-2xl p-5 space-y-4 shadow-sm">
                <h3 className="text-base font-bold text-black">แนวทางการให้อาหาร</h3>
                
                <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                    <p className="text-lg font-medium text-black">วันนี้อุณหภูมิลดลง 2°C</p>
                    <p className="text-lg font-medium text-black">แนะนำให้ลดอาหารลง 5%</p>
                </div>

                <div>
                    <h4 className="text-base font-bold text-black mb-2">คำแนะนำ :</h4>
                    <ul className="list-none space-y-1 text-sm text-black">
                        <li>ให้ 2 มื้อใหญ่ต่อวัน (เช้า-เย็น)</li>
                        <li>เพิ่มสัดส่วนพลังงาน (ข้าวโพด, รำ)</li>
                        <li>ลดโปรตีนลงเล็กน้อยอัตราโปรตีน 28-32% ก็เพียงพอ</li>
                        <li>ติดตาม FCR เพื่อควบคุมต้นทุนอาหาร</li>
                    </ul>
                </div>
            </div>

            {/* ปุ่มปิด */}
            <button
                onClick={handleClose}
                className="w-full py-4 rounded-xl text-xl font-bold text-[#EF6E11] bg-white border-2 border-[#EF6E11] hover:bg-[#FFF3E0] active:scale-95 transition-all duration-200 shadow-sm mb-8"
            >
                ปิด
            </button>

        </div>
      )}

    </div>
  );
}