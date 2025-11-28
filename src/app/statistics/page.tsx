"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  FiArrowLeft,
  FiTrendingUp,
  FiPieChart,
  FiBarChart,
  FiActivity
} from "react-icons/fi";

interface GrowthData {
  month: string;
  weight: number;
  length: number;
  mortality: number;
}

export default function StatisticsPage() {
  const router = useRouter();
  
  const [growthData] = useState<GrowthData[]>([
    { month: "ม.ค.", weight: 0.5, length: 5, mortality: 2 },
    { month: "ก.พ.", weight: 1.2, length: 8, mortality: 1 },
    { month: "มี.ค.", weight: 2.1, length: 12, mortality: 1 },
    { month: "เม.ย.", weight: 3.5, length: 15, mortality: 0 },
    { month: "พ.ค.", weight: 4.8, length: 18, mortality: 1 },
    { month: "มิ.ย.", weight: 6.2, length: 21, mortality: 0 },
  ]);

  const [totalStats] = useState({
    totalPonds: 12,
    totalFish: 1200,
    totalEggs: 201908,
    averageWeight: 4.8,
    survivalRate: 96.5,
    feedEfficiency: 1.8
  });

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      router.push("/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-emerald-600 text-white p-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-emerald-500 rounded-lg transition-colors"
          >
            <FiArrowLeft className="text-xl" />
          </button>
          <h1 className="text-lg font-semibold">สถิติการจัดการฟาร์ม</h1>
        </div>
      </header>

      <div className="p-6 max-w-6xl mx-auto">
        {/* Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">จำนวนบ่อ</span>
              <FiPieChart className="text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-gray-800">{totalStats.totalPonds}</div>
            <div className="text-xs text-green-600">↑ 100% เต็มกำลัง</div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">จำนวนปลา</span>
              <FiActivity className="text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-800">{totalStats.totalFish.toLocaleString()}</div>
            <div className="text-xs text-green-600">↑ มีชีวิต</div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">น้ำหนักเฉลี่ย</span>
              <FiTrendingUp className="text-yellow-600" />
            </div>
            <div className="text-2xl font-bold text-gray-800">{totalStats.averageWeight} kg</div>
            <div className="text-xs text-green-600">↑ เติบโตดี</div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">อัตราการรอดตาย</span>
              <FiBarChart className="text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-800">{totalStats.survivalRate}%</div>
            <div className="text-xs text-green-600">↑ ดีเยี่ยม</div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">ไข่ปลา</span>
              <FiActivity className="text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-800">{totalStats.totalEggs.toLocaleString()}</div>
            <div className="text-xs text-green-600">↑ พร้อมฟัก</div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">ประสิทธิภาพอาหาร</span>
              <FiTrendingUp className="text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-gray-800">{totalStats.feedEfficiency}</div>
            <div className="text-xs text-green-600">↑ ดีมาก</div>
          </div>
        </div>

        {/* Growth Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <FiTrendingUp className="mr-2 text-emerald-600" />
            กราฟการเจริญเติบโต (6 เดือนที่ผ่านมา)
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-600 border-b">
                  <th className="pb-3">เดือน</th>
                  <th className="pb-3">น้ำหนักเฉลี่ย (kg)</th>
                  <th className="pb-3">ความยาวเฉลี่ย (cm)</th>
                  <th className="pb-3">อัตราการตาย (%)</th>
                  <th className="pb-3">การเจริญเติบโต</th>
                </tr>
              </thead>
              <tbody>
                {growthData.map((data, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-4 font-medium">{data.month}</td>
                    <td className="py-4">{data.weight} kg</td>
                    <td className="py-4">{data.length} cm</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        data.mortality === 0 ? 'bg-green-100 text-green-700' : 
                        data.mortality <= 1 ? 'bg-yellow-100 text-yellow-700' : 
                        'bg-red-100 text-red-700'
                      }`}>
                        {data.mortality}%
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-emerald-600 h-2 rounded-full transition-all"
                          style={{ width: `${Math.min((data.weight / 7) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">ประสิทธิภาพการให้อาหาร</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">อาหารต่อน้ำหนักปลา</span>
                <span className="font-semibold text-emerald-600">1.8:1</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">ต้นทุนอาหารต่อกิโลกรัม</span>
                <span className="font-semibold">42 บาท</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">อาหารรวมต่อเดือน</span>
                <span className="font-semibold">850 กก.</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">คุณภาพน้ำ</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">ค่า pH เฉลี่ย</span>
                <span className="font-semibold text-blue-600">7.2</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">อุณหภูมิเฉลี่ย</span>
                <span className="font-semibold">28°C</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">ออกซิเจนละลาย</span>
                <span className="font-semibold text-green-600">6.5 mg/L</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white">
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <FiActivity className="mr-2" />
            คำแนะนำจากการวิเคราะห์
          </h3>
          <ul className="space-y-2 text-sm opacity-90">
            <li>• ปลาเจริญเติบโตดีในช่วง 3 เดือนที่ผ่านมา แนะนำให้คงอัตราการให้อาหารเดิม</li>
            <li>• ค่า pH อยู่ในเกณฑ์ดี ควรตรวจสอบทุก 2 วัน</li>
            <li>• อัตราการรอดตายสูงมาก แสดงว่าการจัดการดีเยี่ยม</li>
            <li>• แนะนำเพิ่มจำนวนปลาในบ่อที่ 3 และ 7 ในเดือนหน้า</li>
          </ul>
        </div>

        {/* Spacing for bottom navigation */}
        <div className="h-20"></div>
      </div>
    </div>
  );
}
