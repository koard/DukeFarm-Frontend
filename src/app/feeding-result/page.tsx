"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FiArrowLeft,
  FiCalendar,
  FiClock,
  FiThermometer,
  FiTrendingDown,
  FiDollarSign,
  FiAlertCircle,
  FiActivity
} from "react-icons/fi";
import { GiFishEggs, GiWeight } from "react-icons/gi";
import { ProfileDropdownMenu } from "@/components/common/ProfileDropdownMenu";

export default function FeedingResultPage() {
  const router = useRouter();

  // ดึงข้อมูลจาก URL parameters หรือ localStorage
  const [resultData, setResultData] = useState({
    date: "",
    time: "",
    fishAge: "",
    pondType: "",
    feedType: "",
    feedAmount: "",
    feedPrice: "",
    fishBehavior: "",
    temperature: "",
    pricePerKg: "4.8",
    priceChange: "-20",
    totalCost: "3,000",
    recommendation: "วันนี้อุณหภูมิลดลง 2°C\nและน้ำใช้อาหารสง 5%"
  });

  useEffect(() => {
    // โหลดข้อมูลจาก localStorage
    const savedData = localStorage.getItem("lastFeedingRecord");
    if (savedData) {
      const data = JSON.parse(savedData);
      setResultData({
        date: data.date || "",
        time: data.time || "",
        fishAge: `${data.fishAgeMonths || 0} วัน`,
        pondType: data.pondType || "",
        feedType: data.feedType || "",
        feedAmount: data.feedAmount || "",
        feedPrice: data.feedPrice || "",
        fishBehavior: data.fishBehavior || "",
        temperature: data.airTemp || "32",
        pricePerKg: "4.8",
        priceChange: "-20",
        totalCost: data.feedPrice || "3,000",
        recommendation: "วันนี้อุณหภูมิลดลง 2°C\nและน้ำใช้อาหารสง 5%"
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-gray-100">
      {/* Header */}
      <header className="bg-[#093832] text-white px-4 pt-5 pb-4 rounded-b-3xl shadow-lg relative z-50 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-teal-600 rounded-lg transition-colors"
        >
          <FiArrowLeft className="text-xl" />
        </button>

        <h1 className="text-xl font-bold">ผลวิเคราะห์</h1>

        <ProfileDropdownMenu showGreeting={false} />
      </header>

      <div className="p-4 pb-24">
        {/* Card หลัก */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
          {/* ส่วนหัว - ข้อมูลการเข้าระบบ */}
          <div className="bg-teal-50 px-4 py-3 border-b border-teal-100">
            <div className="flex items-center space-x-2">
              <GiFishEggs className="text-lg text-teal-700" />
              <h2 className="text-sm font-semibold text-teal-800">
                ผลวิเคราะห์การเจริญเติบโตการทานอาหาร (ปลาดุก)
              </h2>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {/* วันที่และเวลา */}
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2 bg-[#E3F5E7] px-3 py-2 rounded-lg">
                <FiCalendar className="text-teal-600" />
                <span className="text-teal-800 font-medium">{resultData.date || "05/13/2025"}</span>
              </div>
              <div className="flex items-center space-x-2 bg-[#E3F5E7] px-3 py-2 rounded-lg">
                <FiClock className="text-teal-600" />
                <span className="text-teal-800 font-medium">{resultData.time || "7:00 น."}</span>
              </div>
            </div>

            {/* Grid ข้อมูล 2x2 */}
            <div className="grid grid-cols-2 gap-3">
              {/* อายุปลา */}
              <div className="bg-teal-50 rounded-xl p-4 border border-teal-200">
                <div className="flex items-center space-x-2 mb-2">
                  <GiFishEggs className="text-teal-700 text-base" />
                  <span className="text-teal-700 text-xs font-medium">อายุปลา</span>
                </div>
                <p className="text-3xl font-bold text-teal-800">
                  {resultData.fishAge || "45 วัน"}
                </p>
              </div>

              {/* น้ำหนักเฉลี่ย (กิโลกรัม) */}
              <div className="bg-teal-50 rounded-xl p-4 border border-teal-200">
                <div className="flex items-center space-x-2 mb-2">
                  <GiWeight className="text-teal-700 text-base" />
                  <span className="text-teal-700 text-xs font-medium">น้ำหนักเฉลี่ย (กิโลกรัม)</span>
                </div>
                <p className="text-3xl font-bold text-teal-800">2.0</p>
              </div>

              {/* อุณหภูมิ */}
              <div className="bg-teal-50 rounded-xl p-4 border border-teal-200">
                <div className="flex items-center space-x-2 mb-2">
                  <FiThermometer className="text-teal-700 text-base" />
                  <span className="text-teal-700 text-xs font-medium">อุณหภูมิ</span>
                </div>
                <p className="text-3xl font-bold text-teal-800">
                  {resultData.temperature || "32"} °C
                </p>
              </div>

              {/* พฤติกรรมปลา */}
              <div className="bg-teal-50 rounded-xl p-4 border border-teal-200">
                <div className="flex items-center space-x-2 mb-2">
                  <FiActivity className="text-teal-700 text-base" />
                  <span className="text-teal-700 text-xs font-medium">ผลต่อพฤติกรรมปลา</span>
                </div>
                <p className="text-base font-bold text-teal-800">
                  {resultData.fishBehavior || "ปลากินดี ไต่เร้"}
                </p>
              </div>
            </div>

            {/* การทานอาหาร และ ต้นทุน */}
            <div className="grid grid-cols-2 gap-3">
              {/* ราคาอาหาร */}
              <div className="bg-pink-50 rounded-xl p-4 border border-pink-200">
                <div className="flex items-center space-x-2 mb-2">
                  <FiTrendingDown className="text-red-600 text-base" />
                  <span className="text-red-700 text-xs font-medium">การทานอาหาร (Kg.)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <p className="text-3xl font-bold text-red-700">
                    {resultData.pricePerKg}
                  </p>
                  <span className="text-sm font-semibold text-red-600">
                    ▼ ({resultData.priceChange}%)
                  </span>
                </div>
              </div>

              {/* ต้นทุน */}
              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <div className="flex items-center space-x-2 mb-2">
                  <FiDollarSign className="text-green-700 text-base" />
                  <span className="text-green-700 text-xs font-medium">ต้นทุน (บาท)</span>
                </div>
                <p className="text-3xl font-bold text-green-700">
                  {resultData.totalCost}
                </p>
              </div>
            </div>

            {/* แนะนำการใช้อาหาร */}
            <div className="bg-[#F4FFFC] rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-3">
                <FiAlertCircle className="text-teal-700 text-xl flex-shrink-0" />
                <h3 className="text-base font-bold text-teal-800">แนะนำการใช้อาหาร</h3>
              </div>
              <p className="text-xl font-bold text-teal-800 text-center leading-relaxed">
                วันนี้อุณหภูมิลดลง 2°C<br />
                แนะนำให้ลดอาหารลง 5%
              </p>
            </div>

            {/* คำแนะนำ */}
            <div className="bg-[#F4FFFC] rounded-xl p-4">
              <h3 className="text-sm font-bold text-gray-900 mb-3">คำแนะนำ :</h3>
              <p className="text-sm text-gray-800 leading-relaxed">
                ให้ 2 มื้อใหญ่ต่อวัน (เช้า-เย็น)
                เพิ่มสัดส่วนพลังงาน (ข้าวโพด, รำ) ลดโปรตีนลงเล็กน้อย
                อัตราโปรตีน 28-32% ก็เพียงพอ
                ติดตาม FCR เพื่อควบคุมต้นทุนอาหาร
              </p>
            </div>
          </div>
        </div>

        {/* ปุ่มบันทึกข้อมูล */}
        <button
          onClick={() => router.push("/dashboard")}
          className="w-full mt-4 bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-green-600 hover:to-green-700 transition-all shadow-lg"
        >
          บันทึกข้อมูล
        </button>
      </div>
    </div>
  );
}
