"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import { ProfileDropdownMenu } from "@/components/common/ProfileDropdownMenu";

export default function NurserySmallPage() {
  // -------------------------------------------------------------------------
  // (ข้อมูล Mock Data สำหรับเปลี่ยนตามบ่อที่เลือก)
  // -------------------------------------------------------------------------
  const pondDataMock: Record<number, any> = {
    0: { fishType: "ปลานิ้ว", avgWeight: "6.0", releaseDate: "17/05/25", releaseCount: 20, remainingCount: 17, survivalRate: 95, marketSize: "15-25" },
    1: { fishType: "ปลาตุ้ม", avgWeight: "2.5", releaseDate: "10/05/25", releaseCount: 50, remainingCount: 45, survivalRate: 90, marketSize: "10-20" },
    2: { fishType: "ปลาตลาด", avgWeight: "500", releaseDate: "01/01/25", releaseCount: 100, remainingCount: 98, survivalRate: 98, marketSize: "800-1000" }
  };

  const [activePond, setActivePond] = useState(0); 
  const currentPond = pondDataMock[activePond];

  const mockPlan = [
    { date: "17/05/25", temp: "31 / 26 °C", icon: "fluent_weather-sunny.svg", advice: "เพิ่มขึ้น 5%" },
    { date: "18/05/25", temp: "31 / 30 °C", icon: "fluent-color_weather-sunny.svg", advice: "เพิ่มขึ้น 5%" },
    { date: "19/05/25", temp: "31 / 27 °C", icon: "fluent_weather-rain-snow.svg", advice: "เพิ่มขึ้น 5%" },
  ];

  const [weatherState] = useState("sunny_day"); 
  const getWeatherBg = () => {
    switch (weatherState) {
      case "hot_day": return "from-[#FF5F6D] to-[#FFC371]";
      case "night": return "from-[#1A2A6C] via-[#B21F1F] to-[#FDBB2D]";
      default: return "from-[#4facfe] to-[#00f2fe]";
    }
  };

  const getSurvivalStatusStyles = (percentage: number) => {
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

  return (
    <div className="min-h-screen bg-white pb-10 font-sans">
      
      {/* -------------------------------------------------------------------------
          (ส่วนหัวฟาร์ม - ห้ามแก้ตามต้นฉบับเดิม)
          ------------------------------------------------------------------------- */}
      <div className="bg-[#093832] text-white px-4 pt-8 pb-10 rounded-b-[40px] shadow-md relative z-30">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Image src="/nursery-large/Group.svg" alt="Overview" width={24} height={24} />
            <h1 className="text-2xl font-bold">ภาพรวมฟาร์ม</h1>
          </div>
          <ProfileDropdownMenu />
        </div>
      </div>

      {/* -------------------------------------------------------------------------
          1. NAVIGATION
          ------------------------------------------------------------------------- */}
      <div className="relative z-20 mt-4 mx-5">
        <div className="grid grid-cols-3 gap-3 w-full">
          {["บ่อที่ 1", "บ่อที่ 2", "บ่อที่ 3"].map((label, idx) => (
            <div 
              key={idx} 
              onClick={() => setActivePond(idx)}
              className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-full text-sm font-bold border transition-all cursor-pointer ${
                activePond === idx 
                  ? "bg-[#009D64] border-[#009D64] text-white shadow-md" 
                  : "bg-white border-gray-300 text-black"
              }`}
            >
              <Image 
                src={activePond === idx ? "/nursery-large/famicons_fish-w.svg" : "/nursery-large/famicons_fish-bb.svg"} 
                alt="fish" width={18} height={18} 
              />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 mt-6 max-w-7xl mx-auto space-y-6">
        
        {/* -------------------------------------------------------------------------
            2. DATE VIEW
            ------------------------------------------------------------------------- */}
        <div className="flex items-center gap-2 ml-1">
           <Image src="/records/calendar.svg" alt="cal" width={22} height={22} />
           <span className="text-base font-bold text-[#093832]">ข้อมูล ณ วันที่ 17/05/25</span>
        </div>

        {/* -------------------------------------------------------------------------
            3. IPHONE WEATHER CARD
            ------------------------------------------------------------------------- */}
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`relative overflow-hidden rounded-[35px] p-8 text-white bg-gradient-to-br ${getWeatherBg()} shadow-2xl transition-all`}
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -mr-20 -mt-20" />
                
                <div className="relative z-10 flex flex-col items-center">
                    <div className="flex items-center gap-1 opacity-80 mb-1">
                    <span className="text-[10px] transform -rotate-45">▲</span>
                    <span className="text-xl font-medium tracking-wide font-medium">Khlong Sam Wa District</span>
                    </div>

                    <span className="text-[110px] font-extralight leading-none my-4 drop-shadow-md">
                    26°
                    </span>

                    <span className="text-xl font-medium opacity-90">Mostly Clear</span>
                    <div className="flex gap-4 mt-3 font-bold text-lg font-bold">
                        <span>H:33°</span>
                        <span>L:23°</span>
                    </div>
                </div>
            </motion.div>

        {/* -------------------------------------------------------------------------
            4. TEMPERATURE REPORT
            ------------------------------------------------------------------------- */}
        <div className="bg-gradient-to-r from-[#BBE3FB] to-[#CFFFD5] rounded-[25px] p-6 shadow-sm border border-white/50">
           <div className="flex items-center gap-3 mb-2 text-[#093832]">
              <Image src="/nursery-large/fluent_temperature.svg" alt="temp" width={22} height={22} />
              <span className="text-base font-bold">รายงานอุณหภูมิ</span>
           </div>
           <p className="text-xl font-black text-[#093832] text-center leading-relaxed font-black">
              วันนี้อุณหภูมิลดลงจากเมื่อวาน 2°C <br/>แนะนำให้ลดอาหารลง
           </p>
        </div>

        {/* -------------------------------------------------------------------------
            5. FORECAST SECTION
            ------------------------------------------------------------------------- */}
        <div className="space-y-4">
        <div className="flex items-center gap-2 ml-1">
            <Image src="/nursery-large/fluent_weather-hail-day.svg" alt="forecast" width={24} height={24} />
            <h3 className="text-base font-bold text-[#093832]">คาดการณ์สภาพอากาศและการให้อาหาร</h3>
        </div>

        <div className="bg-[#F4FFFC] rounded-[30px] p-6 shadow-sm border border-emerald-50">
            <div className="grid grid-cols-3 mb-5 border-b border-emerald-100 pb-4">
            <div className="text-sm font-bold text-[#75CFB6] text-center">วันที่</div>
            <div className="text-sm font-bold text-[#75CFB6] text-center">สภาพอากาศ</div>
            <div className="text-sm font-bold text-[#75CFB6] text-center font-bold">ปริมาณอาหารที่แนะนำ</div>
            </div>

            <div className="space-y-6">
            {mockPlan.map((item, index) => (
                <div key={index} className="grid grid-cols-3 items-center hover:bg-[#E0F7FA] rounded-xl transition-colors duration-200 -mx-2 px-2 py-1">
                <div className="text-sm font-bold text-[#0F614E] text-center font-bold">
                    {item.date}
                </div>
            
                <div className="flex items-center justify-center gap-3">
                    <Image src={`/nursery-large/${item.icon}`} alt="weather" width={24} height={24} />
                    <span className="text-sm font-bold text-[#0F614E] font-bold">
                    {item.temp}
                    </span>
                </div>

                <div className="text-sm font-bold text-[#0F614E] text-center uppercase font-bold">
                    {item.advice}
                </div>
                </div>
            ))}
            </div>
        </div>
        </div>

        {/* -------------------------------------------------------------------------
            6. POND SUMMARY 
            ------------------------------------------------------------------------- */}
        <div className="flex items-center gap-2 mt-8 ml-1">
          <Image src="/dashboard/food.svg" alt="summary" width={22} height={22} />
          <h3 className="text-base font-bold text-[#093832] font-bold">สรุปข้อมูล บ่อที่ {activePond + 1}</h3>
        </div>

        <div className="space-y-4">
          {/* (ประเภทปลา และ ขนาดเฉลี่ย */}
            <div className="bg-gradient-to-r from-[#FFF6E2] via-[#FFF6E2] to-[#E6DAFF] rounded-2xl shadow-sm flex overflow-hidden h-28 border border-orange-50/20">
            
            {/* ฝั่งซ้าย: ประเภทปลา */}
            <div className="flex-1 flex flex-col p-4 relative">
                <div className="flex items-center gap-1.5 mb-1">
                <Image src="/dashboard/ion_fish.svg" alt="type" width={18} height={18} />
                <span className="text-sm font-bold text-gray-900">ประเภทปลา</span>
                </div>
  
                <div className="flex-1 flex items-center justify-center">
                <p className="text-2xl font-black text-black">{currentPond.fishType}</p>
                </div>
                {/* เส้นคั่นสีขาว */}
                <div className="absolute right-0 top-2 bottom-2 w-px bg-white shadow-sm"></div>
            </div>

            {/* ฝั่งขวา: ขนาดเฉลี่ย */}
            <div className="flex-1 flex flex-col p-4">
                <div className="flex items-center gap-1.5 mb-1">
                <Image src="/dashboard/line.svg" alt="avg" width={18} height={18} />
                <span className="text-sm font-bold text-gray-900 ">ขนาดเฉลี่ย</span>
                </div>

                <div className="flex-1 flex items-center justify-center">
                <p className="text-2xl font-black text-black">
                    {currentPond.avgWeight} <span className="text-sm font-bold text-gray-900">กรัม</span>
                </p>
                </div>
            </div>
            </div>

          {/* (วันที่ปล่อยลงบ่อ) */}
          <div className="flex items-center justify-between px-2 pt-1 text-[#434343]">
            <div className="flex items-center gap-2">
              <Image src="/dashboard/solar_calendar-outline.svg" alt="date" width={20} height={20} />
              <span className="text-base font-bold">วันที่ปล่อยลงบ่อ</span>
            </div>
            <span className="text-base font-bold">{currentPond.releaseDate}</span>
          </div>

          {/* 7. QUANTITY & REMAINING */}
            <div className="grid grid-cols-2 gap-4">
            {/* กล่องจำนวนที่ปล่อย */}
            <div className="bg-[#4A59FF] rounded-2xl p-4 relative overflow-hidden text-white shadow-md h-28 flex flex-col">
                <span className="text-base font-medium opacity-90">จำนวนที่ปล่อย</span>
                
                <div className="flex-1 flex items-center justify-center">
                <p className="text-3xl font-black leading-none">{currentPond.releaseCount}</p>
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
                <p className="text-3xl font-black leading-none">{currentPond.remainingCount}</p>
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

          {/* 8. SURVIVAL RATE */}
            {(() => {
            const status = getSurvivalStatusStyles(currentPond.survivalRate);
            return (
                <div className={`${status.bg} rounded-2xl p-4 flex flex-col shadow-sm border border-white/40 transition-colors duration-300`}>
                
                <div className="flex items-center gap-2 mb-2">
                    <Image src="/dashboard/ion_fish (1).svg" alt="survival" width={22} height={22} />
                    <span className="text-base font-bold text-gray-700">อัตราการรอด</span>
                </div>
                
                <div className="flex flex-col items-center justify-center">
                    <div className="flex items-baseline gap-1">
                    <span className={`text-3xl font-black ${status.text}`}>
                        {currentPond.survivalRate}%
                    </span>
                    <span className={`text-xs font-bold ${status.text}`}>
                        {status.label}
                    </span>
                    </div>
                </div>

                </div>
            );
            })()}

          {/* 9. MARKET SIZE */}
          <div className="bg-[#F1DFFF] rounded-2xl p-4 flex flex-col shadow-sm border border-purple-100/30">
            <div className="flex items-center gap-2 mb-2">
                <Image src="/dashboard/weight.svg" alt="weight" width={20} height={20} />
                <span className="text-base font-bold text-gray-700">ขนาดที่เหมาะสำหรับการขาย</span>
            </div>
            
            <div className="flex justify-center items-baseline gap-1">
                <p className="text-2xl font-black text-black">{currentPond.marketSize}</p>
                <span className="text-lg font-bold text-black">กรัม</span>
            </div>
            </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 space-y-3 md:space-y-0 md:grid md:grid-cols-3 md:gap-4 md:col-span-2 lg:col-span-4">
          <Link href="/small/weather-small" className="block w-full">
            <button className="w-full bg-[#0084FF] hover:bg-blue-700 text-white py-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition-colors text-lg cursor-pointer">
              <Image src="/nursery-large/fluent_weather-hail-day-w.svg" alt="icon" width={24} height={24} />
              สภาพอากาศ
            </button>
          </Link>

          <Link href="/small/price-small" className="block w-full">
            <button className="w-full bg-[#FF4242] hover:bg-[#e03535] text-white py-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition-colors text-lg cursor-pointer">
              <Image src="/nursery-large/healthicons_money-bag.svg" alt="icon" width={24} height={24} />
              ตรวจสอบราคาตลาด
            </button>
          </Link>

          <Link href="/small/feeding-small" className="block w-full">
            <button className="w-full bg-[#EF6E11] hover:bg-orange-700 text-white py-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition-colors text-lg cursor-pointer">
              <Image src="/nursery-large/fluent_food-grains-w.svg" alt="icon" width={24} height={24} />
              การให้อาหาร
            </button>
          </Link>

          <Link href="/small/disease-info-small" className="block w-full">
            <button className="w-full bg-[#A530FF] hover:bg-[#8a2be2] text-white py-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition-colors text-lg cursor-pointer">
              <Image src="/nursery-large/famicons_fish-w.svg" alt="icon" width={24} height={24} />
              การรักษาโรค
            </button>
          </Link>

          <Link href="/small/record-small" className="block w-full">
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