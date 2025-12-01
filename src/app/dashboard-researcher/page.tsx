"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FaChartPie, FaCloudSun } from "react-icons/fa";
import { IoWaterOutline } from "react-icons/io5";
import { PiPlant } from "react-icons/pi";
import { 
  FiPlus,
  FiBox,
  FiCloudRain,
  FiSun,
  FiCloud,
  FiPieChart,
  FiChevronDown,
  FiLogOut
} from "react-icons/fi";

export default function Dashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  type FeedingRecord = {
    date: string;
    weather: string;
    weatherIcon: string;
    amountKg: number;
  };

  const feedingHistory: FeedingRecord[] = [];

  const summaryMetrics = useMemo(
    () => ({
      pondCount: null as number | null,
      fishCount: null as number | null,
      eggCount: null as number | null,
      pH: null as number | null,
      feedKg: null as number | null,
      feedDeltaPct: null as number | null,
    }),
    [],
  );

  useEffect(() => {
    // Check if user is logged in and has token
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const token = localStorage.getItem("authToken");
    if (!isLoggedIn || !token) {
      router.push("/login");
    }

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (typeof parsed?.name === "string" && parsed.name.trim()) {
          setCurrentUser(parsed.name.trim());
          return;
        }
      } catch (error) {
        console.warn("Unable to parse stored user", error);
      }
    }

    setCurrentUser(null);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    localStorage.removeItem("registrationStatus");
    router.push("/login");
  };

  const getWeatherIcon = (type: string) => {
    switch(type) {
      case "rain":
        return <FiCloudRain className="text-blue-500 text-base" />;
      case "sunny":
        return <FiSun className="text-orange-500 text-base" />;
      case "cloudy":
        return <FiCloud className="text-gray-500 text-base" />;
      default:
        return <FiCloud className="text-gray-500 text-base" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-emerald-800 text-white px-4 base:px-6 py-4 base:py-5 rounded-b-3xl relative">
        <div className="flex items-center justify-end">
          {/* User Info - Right Aligned */}
          <div className="flex items-center space-x-2 base:space-x-4">
            <div className="text-right">
              <p className="text-base base:text-base opacity-90">ยินดีต้อนรับ</p>
              <p className="font-semibold text-base base:text-lg">{currentUser || "-"}</p>
            </div>
            
            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-1 base:space-x-2 p-1 rounded-full hover:bg-emerald-900 transition-colors"
              >
                <div className="w-10 h-10 base:w-14 base:h-14 bg-white rounded-full flex items-center justify-center overflow-hidden border-2 border-green-800">
                  {/* Profile Image Placeholder */}
                  <img 
                    src="https://placehold.co/400x400.png?text=Profile" 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <FiChevronDown className={`transition-transform text-base base:text-base ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="py-2">
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-gray-900 hover:bg-gray-100 transition-colors"
                    >
                      <FiLogOut className="text-base" />
                      <span className="text-base">ออกจากระบบ</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 base:p-6 max-w-6xl mx-auto">
        {/* Growth Analysis Section */}
        <div className="mb-6 base:mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <FaChartPie className="text-emerald-900 text-lg base:text-xl" />
            <h2 className="text-base base:text-lg font-semibold text-emerald-900">
              วิเคราะห์การเจริญเติบโตการทานอาหาร (ปลาดุก)
            </h2>
          </div>
          
          {/* Stats Grid */}
          <div className="bg-[#F4FFFC] rounded-xl p-4 mb-4 shadow-base">
            <div className="grid divide-x divide-gray-300 h-20" style={{gridTemplateColumns: '1fr 1fr 1fr'}}>
              <div className="pr-4 flex flex-col justify-center">
                <div className="flex items-center space-x-1 mb-1">
                  <FiBox className="text-emerald-900 text-base" />
                  <p className="text-sm text-emerald-900">จำนวนบ่อ</p>
                </div>
                <p className="text-xl base:text-3xl font-bold text-emerald-900 text-center">
                  {summaryMetrics.pondCount ?? "-"}
                </p>
              </div>
              <div className="px-4 flex flex-col justify-center">
                <div className="flex items-center space-x-1 mb-1">
                  <FiBox className="text-emerald-900 text-base" />
                  <p className="text-sm text-emerald-900">จำนวนปลาดุก</p>
                </div>
                <p className="text-xl base:text-3xl font-bold text-emerald-900 text-center">
                  {summaryMetrics.fishCount ?? "-"}
                </p>
              </div>
              <div className="pl-4 flex flex-col justify-center">
                <div className="flex items-center space-x-1 mb-1">
                  <FiBox className="text-emerald-900 text-base" />
                  <p className="text-sm text-emerald-900">ไข่ปลา</p>
                </div>
                <p className="text-xl base:text-3xl font-bold text-emerald-900 text-center">
                  {summaryMetrics.eggCount ?? "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Water Quality */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-xl p-4 shadow-base">
              <div className="flex items-center space-x-2 mb-2">
                <IoWaterOutline className="text-blue-900" />
                <span className="text-base text-emerald-900">ค่า (pH)</span>
              </div>
              <p className="text-3xl font-bold text-blue-900 text-center">
                {summaryMetrics.pH ?? "-"}
              </p>
            </div>
            <div className="bg-red-50 rounded-xl p-4 shadow-base">
              <div className="flex items-center space-x-2 mb-2">
                <PiPlant className="text-red-900" />
                <span className="text-base text-red-900">การกินอาหาร (Kg.)</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <p className="text-3xl font-bold text-red-900">
                  {summaryMetrics.feedKg ?? "-"}
                </p>
                <span className="text-base text-red-500 px-2 py-1 font-bold rounded">
                  {summaryMetrics.feedDeltaPct !== null ? `▼ (${summaryMetrics.feedDeltaPct}%)` : "ไม่มีข้อมูล"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Feeding History */}
        <div className="mb-20 base:mb-24">
          <div className="flex items-center space-x-2 mb-4">
            <FaCloudSun className="text-emerald-900 text-lg base:text-xl" />
            <h2 className="text-base base:text-lg font-semibold text-emerald-900">
              คาดการณ์สภาพอากาศและการให้อาหาร 7 วันล่วงหน้า
            </h2>
          </div>
          
          <div className="rounded-2xl p-4 shadow-base bg-[#F4FFFC]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[350px]">
                <thead>
                  <tr className="text-left text-base text-[#75CFB6] border-b border-gray-200">
                    <th className="pb-3 text-center">วันที่</th>
                    <th className="pb-3 text-center">สภาพอากาศ</th>
                    <th className="pb-3 text-center">ปริมาณอาหารที่แนะนำ</th>
                  </tr>
                </thead>
                <tbody>
                  {feedingHistory.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-4 text-center text-gray-500 text-base">
                        ไม่มีข้อมูล
                      </td>
                    </tr>
                  ) : (
                    feedingHistory.map((record, index) => (
                      <tr key={index} className="border-t border-gray-100 text-emerald-900">
                        <td className="py-3 text-base text-center">{record.date}</td>
                        <td className="py-3 text-base text-center">
                          <div className="flex items-center justify-center space-x-2">
                            {getWeatherIcon(record.weatherIcon)}
                            <span className="whitespace-nowrap">{record.weather}</span>
                          </div>
                        </td>
                        <td className="py-3 text-base font-medium text-center">{record.amountKg} Kg.</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-emerald-900 text-white rounded-t-xl">
        <div className="grid grid-cols-3 items-center py-3 base:py-4 px-3 base:px-4">
          {/* Left Button */}
          <button 
            onClick={() => router.push("/weather")}
            className="flex flex-col items-center space-y-1 justify-self-start"
          >
            <FiCloudRain className="text-lg base:text-xl" />
            <span className="text-[14px] base:text-base">สภาพอากาศ</span>
          </button>
          
          {/* Center Button */}
          <button 
            onClick={() => router.push("/add-feeding")}
            className="flex flex-col items-center space-y-1 bg-[#72B544] border-3 border-emerald-900 rounded-full p-5 base:p-8 -mt-8 base:-mt-10 shadow-lg justify-self-center"
          >
            <FiPlus className="text-xl base:text-2xl" />
            <span className="text-[14px] base:text-lg mt-1 base:mt-2 whitespace-nowrap">บันทึกข้อมูล</span>
          </button>
          
          {/* Right Button */}
          <button 
            onClick={() => router.push("/statistics")}
            className="flex flex-col items-center space-y-1 justify-self-end"
          >
            <FiPieChart className="text-lg base:text-xl" />
            <span className="text-[14px] base:text-base text-center leading-tight">สถิติการ<br className="base:hidden"/>เจริญเติบโต</span>
          </button>
        </div>
      </div>
      
      {/* Click outside to close dropdown */}
      {dropdownOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setDropdownOpen(false)}
        />
      )}
    </div>
  );
}