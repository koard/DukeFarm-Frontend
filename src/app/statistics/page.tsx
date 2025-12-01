"use client";

import { useEffect } from "react";
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

interface TotalStats {
  totalPonds?: number;
  totalFish?: number;
  totalEggs?: number;
  averageWeight?: number;
  survivalRate?: number;
  feedEfficiency?: number;
}

interface FeedingStats {
  feedToWeightRatio?: number;
  feedCostPerKg?: number;
  monthlyFeedTotalKg?: number;
}

interface WaterQualityStats {
  ph?: number;
  temperature?: number;
  dissolvedOxygen?: number;
}

const formatNumber = (value?: number | null, options?: Intl.NumberFormatOptions) => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "-";
  }

  try {
    return value.toLocaleString("th-TH", options);
  } catch {
    return "-";
  }
};

const formatWithUnit = (value?: number | null, unit?: string) => {
  const formatted = formatNumber(value);
  if (formatted === "-") {
    return formatted;
  }
  return unit ? `${formatted} ${unit}` : formatted;
};

const formatPercentage = (value?: number | null) => {
  const formatted = formatNumber(value);
  return formatted === "-" ? formatted : `${formatted}%`;
};

const formatRatio = (value?: number | null, suffix = "") => {
  const formatted = formatNumber(value);
  return formatted === "-" ? formatted : `${formatted}${suffix}`;
};

const getMortalityBadgeColor = (mortality: number) => {
  if (mortality === 0) {
    return "bg-green-100 text-green-700";
  }
  if (mortality <= 1) {
    return "bg-yellow-100 text-yellow-700";
  }
  return "bg-red-100 text-red-700";
};

export default function StatisticsPage() {
  const router = useRouter();

  const growthData: GrowthData[] = [];
  const totalStats: TotalStats | null = null;
  const feedingStats: FeedingStats | null = null;
  const waterQualityStats: WaterQualityStats | null = null;
  const recommendations: string[] = [];

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
            <div className="text-2xl font-bold text-gray-800">{formatNumber(totalStats?.totalPonds)}</div>
            <div className="text-xs text-gray-500">
              {totalStats ? "ข้อมูลอัปเดตล่าสุด" : "ไม่มีข้อมูลอัปเดต"}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">จำนวนปลา</span>
              <FiActivity className="text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-800">{formatNumber(totalStats?.totalFish)}</div>
            <div className="text-xs text-gray-500">
              {totalStats ? "ข้อมูลอัปเดตล่าสุด" : "ไม่มีข้อมูลอัปเดต"}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">น้ำหนักเฉลี่ย</span>
              <FiTrendingUp className="text-yellow-600" />
            </div>
            <div className="text-2xl font-bold text-gray-800">{formatWithUnit(totalStats?.averageWeight, "kg")}</div>
            <div className="text-xs text-gray-500">
              {totalStats ? "ข้อมูลอัปเดตล่าสุด" : "ไม่มีข้อมูลอัปเดต"}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">อัตราการรอดตาย</span>
              <FiBarChart className="text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-800">{formatPercentage(totalStats?.survivalRate)}</div>
            <div className="text-xs text-gray-500">
              {totalStats ? "ข้อมูลอัปเดตล่าสุด" : "ไม่มีข้อมูลอัปเดต"}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">ไข่ปลา</span>
              <FiActivity className="text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-800">{formatNumber(totalStats?.totalEggs)}</div>
            <div className="text-xs text-gray-500">
              {totalStats ? "ข้อมูลอัปเดตล่าสุด" : "ไม่มีข้อมูลอัปเดต"}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">ประสิทธิภาพอาหาร</span>
              <FiTrendingUp className="text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-gray-800">{formatNumber(totalStats?.feedEfficiency)}</div>
            <div className="text-xs text-gray-500">
              {totalStats ? "ข้อมูลอัปเดตล่าสุด" : "ไม่มีข้อมูลอัปเดต"}
            </div>
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
                {growthData.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-sm text-gray-500">
                      ยังไม่มีข้อมูลการเจริญเติบโต
                    </td>
                  </tr>
                )}
                {growthData.map((data) => (
                  <tr key={data.month} className="border-b border-gray-100">
                    <td className="py-4 font-medium">{data.month}</td>
                    <td className="py-4">{formatWithUnit(data.weight, "kg")}</td>
                    <td className="py-4">{formatWithUnit(data.length, "cm")}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${getMortalityBadgeColor(data.mortality)}`}>
                        {formatPercentage(data.mortality)}
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
                <span className="font-semibold text-emerald-600">
                  {formatRatio(feedingStats?.feedToWeightRatio, ":1")}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">ต้นทุนอาหารต่อกิโลกรัม</span>
                <span className="font-semibold">{formatWithUnit(feedingStats?.feedCostPerKg, "บาท")}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">อาหารรวมต่อเดือน</span>
                <span className="font-semibold">{formatWithUnit(feedingStats?.monthlyFeedTotalKg, "กก.")}</span>
              </div>
            </div>
            {!feedingStats && (
              <p className="text-xs text-gray-500 mt-4">ไม่มีข้อมูลประสิทธิภาพการให้อาหาร</p>
            )}
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">คุณภาพน้ำ</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">ค่า pH เฉลี่ย</span>
                <span className="font-semibold text-blue-600">{formatNumber(waterQualityStats?.ph)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">อุณหภูมิเฉลี่ย</span>
                <span className="font-semibold">{formatWithUnit(waterQualityStats?.temperature, "°C")}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">ออกซิเจนละลาย</span>
                <span className="font-semibold text-green-600">{formatWithUnit(waterQualityStats?.dissolvedOxygen, "mg/L")}</span>
              </div>
            </div>
            {!waterQualityStats && (
              <p className="text-xs text-gray-500 mt-4">ไม่มีข้อมูลคุณภาพน้ำ</p>
            )}
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white">
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <FiActivity className="mr-2" />
            คำแนะนำจากการวิเคราะห์
          </h3>
          {recommendations.length > 0 ? (
            <ul className="space-y-2 text-sm opacity-90">
              {recommendations.map((recommendation) => (
                <li key={recommendation}>• {recommendation}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm opacity-90">ยังไม่มีคำแนะนำจากการวิเคราะห์</p>
          )}
        </div>

        {/* Spacing for bottom navigation */}
        <div className="h-20"></div>
      </div>
    </div>
  );
}
