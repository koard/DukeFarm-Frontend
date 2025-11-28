"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  FiArrowLeft,
  FiSave,
  FiCalendar,
  FiThermometer,
  FiDroplet,
  FiPackage,
  FiCloudRain
} from "react-icons/fi";

export default function AddFeedingPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().split(' ')[0].substring(0, 5),
    // ข้อมูลการให้อาหาร
    fishAgeMonths: "",
    fishAgeDays: "",
    pondType: "",
    feedType: "",
    feedAmount: "",
    feedPrice: "",
    fishBehavior: "",
    // ข้อมูลคุณภาพน้ำ
    waterTempMin: "",
    waterTempMax: "",
    dissolvedOxygen: "",
    fishCount: "",
    survivalRate: "",
    // สภาพอากาศ
    airTemp: "",
    rainfall: "",
    humidity: "",
    notes: ""
  });

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      router.push("/login");
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // บันทึกข้อมูลลง localStorage
    localStorage.setItem("lastFeedingRecord", JSON.stringify(formData));
    
    console.log("Feeding record:", formData);
    
    // เปลี่ยนเส้นทางไปหน้าผลวิเคราะห์
    router.push("/feeding-result");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-gray-100">
      {/* Header */}
      <header className="bg-[#093832] text-white px-4 base:px-6 py-4 base:py-5 rounded-b-3xl relative">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-teal-600 rounded-lg transition-colors"
          >
            <FiArrowLeft className="text-xl" />
          </button>
          <h1 className="text-lg font-semibold flex items-center">
            <FiPackage className="mr-2" />
            กรอกข้อมูล
          </h1>
        </div>
      </header>

      {/* Form */}
      <div className="p-4 pb-24">
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-4">
          {/* วันที่และเวลา */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="bg-[#093832] text-white px-4 py-3 rounded-t-xl">
              <h2 className="text-base font-semibold flex items-center">
                <FiCalendar className="mr-2" />
                วันที่และเวลา
              </h2>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3">
              <div>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-sm bg-white"
                  required
                />
              </div>
              
              <div>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-sm bg-white"
                  required
                />
              </div>
            </div>
          </div>

          {/* ข้อมูลการให้อาหาร */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="bg-[#093832] text-white px-4 py-3 rounded-t-xl">
              <h2 className="text-base font-semibold flex items-center">
                <FiPackage className="mr-2" />
                ข้อมูลการให้อาหาร
              </h2>
            </div>
            <div className="p-4 space-y-3">
              {/* อายุปลา */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  อายุปลา
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    name="fishAgeMonths"
                    value={formData.fishAgeMonths || ""}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-sm bg-gray-50"
                    placeholder="เดือน"
                    min="0"
                  />
                  
                  <input
                    type="number"
                    name="fishAgeDays"
                    value={formData.fishAgeDays || ""}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-sm bg-gray-50"
                    placeholder="วัน"
                    min="0"
                  />
                </div>
              </div>

              {/* ประเภทบ่อ */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  ประเภทบ่อ
                </label>
                <select
                  name="pondType"
                  value={formData.pondType || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-sm bg-gray-50"
                >
                  <option value="">เลือกประเภทบ่อ เช่น บ่อปูน บ่อดิน</option>
                  <option value="บ่อดิน">บ่อดิน</option>
                  <option value="บ่อซีเมนต์">บ่อซีเมนต์</option>
                  <option value="บ่อผ้าใบ">บ่อผ้าใบ</option>
                  <option value="บ่อไฟเบอร์">บ่อไฟเบอร์</option>
                </select>
              </div>

              {/* ประเภทอาหาร และ ปริมาณอาหาร */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    ประเภทอาหาร
                  </label>
                  <select
                    name="feedType"
                    value={formData.feedType || ""}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-sm bg-gray-50"
                  >
                    <option value="">กรุณาเลือกประเภท</option>
                    <option value="เม็ดลอยน้ำ">เม็ดลอยน้ำ</option>
                    <option value="เม็ดจมน้ำ">เม็ดจมน้ำ</option>
                    <option value="อาหารสด">อาหารสด</option>
                    <option value="อาหารเสริม">อาหารเสริม</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    ปริมาณอาหาร (กิโลกรัม)
                  </label>
                  <input
                    type="text"
                    name="feedAmount"
                    value={formData.feedAmount || ""}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-sm bg-gray-50"
                    placeholder="ระบุข้อมูล เช่น 10, 15, 20"
                  />
                </div>
              </div>

              {/* ราคาอาหาร และ พฤติกรรมปลา */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    ราคาอาหาร (บาท)
                  </label>
                  <input
                    type="text"
                    name="feedPrice"
                    value={formData.feedPrice || ""}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-sm bg-gray-50"
                    placeholder="ระบุข้อมูล เช่น 5,000 เป็นต้น"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    พฤติกรรมปลา
                  </label>
                  <select
                    name="fishBehavior"
                    value={formData.fishBehavior || ""}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-sm bg-gray-50"
                  >
                    <option value="">กรุณาเลือกประเภท</option>
                    <option value="กินอาหารปกติ">กินอาหารปกติ</option>
                    <option value="กินอาหารดี">กินอาหารดี</option>
                    <option value="กินอาหารน้อย">กินอาหารน้อย</option>
                    <option value="ไม่กินอาหาร">ไม่กินอาหาร</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* ข้อมูลการเลี้ยง */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="bg-[#093832] text-white px-4 py-3 rounded-t-xl">
              <h2 className="text-base font-semibold flex items-center">
                <FiDroplet className="mr-2" />
                ข้อมูลการเลี้ยง
              </h2>
            </div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    จำนวนปลาที่เลี้ยง (ตัว)
                  </label>
                  <input
                    type="number"
                    name="fishCount"
                    value={formData.fishCount || ""}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-sm bg-gray-50"
                    placeholder="ตัวอย่าง เช่น 250, 250-450"
                    step="0.1"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    อัตราการรอด (%)
                  </label>
                  <input
                    type="number"
                    name="survivalRate"
                    value={formData.survivalRate || ""}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-sm bg-gray-50"
                    placeholder="ตัวอย่าง เช่น 80, 90, 78"
                    step="0.1"
                    min="0"
                    max="100"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* สภาพอากาศเรียลไทม์ */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="bg-[#093832] text-white px-4 py-3 rounded-t-xl">
              <h2 className="text-base font-semibold flex items-center">
                <FiCloudRain className="mr-2" />
                สภาพอากาศเรียลไทม์
              </h2>
            </div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    อุณหภูมิอากาศ (°C)
                  </label>
                  <input
                    type="number"
                    name="airTemp"
                    value={formData.airTemp || ""}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-sm bg-gray-50"
                    placeholder="32 °C"
                    step="0.1"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    ปริมาณฝน (มม.)
                  </label>
                  <input
                    type="number"
                    name="rainfall"
                    value={formData.rainfall || ""}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-sm bg-gray-50"
                    placeholder="30"
                    step="0.1"
                    min="0"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    ความชื้นสัมพัทธ์ (%)
                  </label>
                  <input
                    type="number"
                    name="humidity"
                    value={formData.humidity || ""}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-sm bg-gray-50"
                    placeholder="27"
                    step="0.1"
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              {/* ปุ่มใช้ข้อมูลจากอุปกรณ์ตรวจอากาศ */}
              <button
                type="button"
                className="w-full bg-teal-50 text-teal-700 py-2.5 px-4 rounded-lg font-medium text-sm hover:bg-teal-100 transition-colors flex items-center justify-center space-x-2 border border-teal-200"
                onClick={() => {
                  // ฟังก์ชันนี้จะดึงข้อมูลจากอุปกรณ์ตรวจวัดอากาศ
                  alert("กำลังดึงข้อมูลจากอุปกรณ์...");
                }}
              >
                <FiThermometer className="text-lg" />
                <span>ใช้ตำแหน่งปัจจุบันเพื่อดึงอากาศ</span>
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3.5 px-6 rounded-xl font-semibold text-base hover:from-green-600 hover:to-green-700 transition-all shadow-lg flex items-center justify-center space-x-2"
          >
            <span>เริ่มวิเคราะห์ข้อมูล</span>
          </button>

          {/* Spacing for bottom navigation */}
          <div className="h-4"></div>
        </form>
      </div>
    </div>
  );
}
