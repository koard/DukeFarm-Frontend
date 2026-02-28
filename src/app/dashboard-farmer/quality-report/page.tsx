"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronDown } from "lucide-react";
import { API_BASE_URL } from "@/config/api";
import {
  computeQualityAssessment,
  generateStandardCurve,
  type QualityAssessment,
  type RecordEntry,
} from "@/utils/catfishGrowth";
import QualitySummaryCards from "@/components/quality/QualitySummaryCards";
import GrowthChart from "@/components/quality/GrowthChart";
import CostSummary from "@/components/quality/CostSummary";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ProductionCycle {
  id: string;
  startDate: string;
  endDate: string | null;
  status: string;
  farmType: string | null;
  initialStockCount: number | null;
  initialAvgWeightKg: string | null; // Decimal comes as string from Prisma
  createdAt: string;
}

interface RecordApiEntry {
  id: string;
  recordedAt: string;
  fishAgeDays?: number | null;
  fishReleased?: number | null;
  fishRemaining?: number | null;
  averageFishWeightGr?: number | null;
  foodAmountKg?: number | null;
  foodCostBaht?: number | null;
  medicineCostBaht?: number | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const formatThaiDate = (isoDate?: string | null): string => {
  if (!isoDate) return "-";
  const d = new Date(isoDate);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const FARM_TYPE_LABELS: Record<string, string> = {
  SMALL: "ปลาตุ้ม",
  LARGE: "ปลานิ้ว",
  MARKET: "ปลาตลาด",
};

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

function QualityReportContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const pondId = searchParams.get("pondId") || undefined;
  const farmType = searchParams.get("type") || "SMALL";

  // State
  const [cycles, setCycles] = useState<ProductionCycle[]>([]);
  const [selectedCycleId, setSelectedCycleId] = useState<string | null>(null);
  const [records, setRecords] = useState<RecordEntry[]>([]);
  const [assessment, setAssessment] = useState<QualityAssessment | null>(null);
  const [chartData, setChartData] = useState<
    { day: number; standard: number; upperBound: number; lowerBound: number; actual?: number }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [loadingRecords, setLoadingRecords] = useState(false);

  const getToken = () => localStorage.getItem("authToken") || "";

  // -------------------------------------------------------------------------
  // 1. โหลดรายการรอบการเลี้ยง
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!pondId) return;

    const fetchCycles = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/ponds/${pondId}/cycles`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        if (!res.ok) throw new Error("Failed to fetch cycles");
        const json = await res.json();
        const data: ProductionCycle[] = json.data ?? [];
        setCycles(data);

        // เลือกรอบล่าสุดอัตโนมัติ
        if (data.length > 0) {
          setSelectedCycleId(data[0].id);
        }
      } catch (err) {
        console.error("Error fetching cycles:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCycles();
  }, [pondId]);

  // -------------------------------------------------------------------------
  // 2. โหลด records ของรอบที่เลือก
  // -------------------------------------------------------------------------
  const fetchRecords = useCallback(async () => {
    if (!selectedCycleId) return;

    setLoadingRecords(true);
    try {
      // ดึง records ทั้งหมดของรอบ (limit สูงสุด)
      const url = new URL(`${API_BASE_URL}/records`);
      url.searchParams.set("productionCycleId", selectedCycleId);
      url.searchParams.set("limit", "500");
      url.searchParams.set("page", "1");

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error("Failed to fetch records");

      const json = await res.json();
      const entries: RecordApiEntry[] = json.data ?? [];

      // แปลงเป็น RecordEntry
      const mapped: RecordEntry[] = entries.map((e) => ({
        recordedAt: e.recordedAt,
        fishAgeDays: e.fishAgeDays,
        fishReleased: e.fishReleased,
        fishRemaining: e.fishRemaining,
        averageFishWeightGr: e.averageFishWeightGr,
        foodAmountKg: e.foodAmountKg,
        foodCostBaht: e.foodCostBaht,
        medicineCostBaht: e.medicineCostBaht,
      }));

      setRecords(mapped);
    } catch (err) {
      console.error("Error fetching records:", err);
      setRecords([]);
    } finally {
      setLoadingRecords(false);
    }
  }, [selectedCycleId]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // -------------------------------------------------------------------------
  // 3. คำนวณ Quality Assessment เมื่อ records หรือ cycle เปลี่ยน
  // -------------------------------------------------------------------------
  useEffect(() => {
    const cycle = cycles.find((c) => c.id === selectedCycleId);
    if (!cycle || records.length === 0) {
      setAssessment(null);
      setChartData([]);
      return;
    }

    // แปลง initialAvgWeightKg (กก.) → กรัม
    const initialWeightGr = cycle.initialAvgWeightKg
      ? Number(cycle.initialAvgWeightKg) * 1000
      : null;

    const result = computeQualityAssessment(
      records,
      cycle.startDate,
      initialWeightGr,
      cycle.initialStockCount,
    );

    setAssessment(result);

    // สร้างข้อมูลกราฟ
    if (result) {
      // สร้างเส้นมาตรฐาน
      const standardCurve = generateStandardCurve(result.initialWeightGr, result.totalDays);

      // สร้าง map จริงจาก records (วัน → น้ำหนักจริง)
      const startDate = new Date(cycle.startDate);
      const actualMap = new Map<number, number>();

      records.forEach((r) => {
        if (r.averageFishWeightGr != null) {
          const d = Math.floor(
            (new Date(r.recordedAt).getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000),
          );
          if (d >= 0) {
            actualMap.set(d, r.averageFishWeightGr);
          }
        }
      });

      // รวมข้อมูลมาตรฐาน + ข้อมูลจริง
      const merged = standardCurve.map((point) => ({
        ...point,
        actual: actualMap.get(point.day) ?? undefined,
      }));

      setChartData(merged);
    }
  }, [records, selectedCycleId, cycles]);

  // -------------------------------------------------------------------------
  // Derived data
  // -------------------------------------------------------------------------
  const selectedCycle = cycles.find((c) => c.id === selectedCycleId);

  const backHref = pondId
    ? `/dashboard-farmer?type=${farmType}&pondId=${pondId}`
    : `/dashboard-farmer?type=${farmType}`;

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8faf8] to-white pb-10 font-sans">
      {/* Header */}
      <div className="bg-[#093832] text-white px-4 pt-5 pb-4 rounded-b-3xl shadow-md flex items-center gap-3">
        <button
          onClick={() => router.push(backHref)}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold">สรุปคุณภาพการเลี้ยง</h1>
        </div>
      </div>

      <div className="px-4 mt-5 max-w-3xl mx-auto space-y-5">
        {/* Cycle selector */}
        {!loading && cycles.length > 0 && (
          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={selectedCycleId || ""}
                onChange={(e) => setSelectedCycleId(e.target.value)}
                className="appearance-none bg-[#093832] text-white text-sm font-bold pl-3.5 pr-9 py-2 rounded-xl cursor-pointer focus:outline-none shadow-sm"
              >
                {cycles.map((cycle, idx) => (
                  <option
                    key={cycle.id}
                    value={cycle.id}
                    className="bg-white text-gray-900"
                  >
                    รอบที่ {cycles.length - idx}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white pointer-events-none" />
            </div>

            {selectedCycle && (
              <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1.5 rounded-lg">
                {formatThaiDate(selectedCycle.startDate)}
                {" — "}
                {selectedCycle.endDate ? formatThaiDate(selectedCycle.endDate) : "ปัจจุบัน"}
              </span>
            )}
          </div>
        )}

        {/* Loading states */}
        {(loading || loadingRecords) && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-[#093832]/20 border-t-[#093832] rounded-full animate-spin" />
            <p className="text-sm text-gray-400 mt-4 font-medium">กำลังโหลดข้อมูล...</p>
          </div>
        )}

        {/* No pond selected */}
        {!pondId && !loading && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <span className="text-3xl">🐟</span>
            </div>
            <p className="text-base font-semibold text-gray-400">ไม่พบข้อมูลบ่อ</p>
            <p className="text-sm text-gray-300 mt-1">กรุณาเลือกบ่อจากหน้าแดชบอร์ดก่อน</p>
          </div>
        )}

        {/* No cycles */}
        {pondId && !loading && cycles.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <span className="text-3xl">📋</span>
            </div>
            <p className="text-base font-semibold text-gray-400">ไม่พบรอบการเลี้ยง</p>
            <p className="text-sm text-gray-300 mt-1">ยังไม่มีรอบการเลี้ยงในบ่อนี้</p>
          </div>
        )}

        {/* No records / can't assess */}
        {!loading && !loadingRecords && selectedCycleId && records.length > 0 && !assessment && (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-gray-200/60 shadow-sm">
            <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mb-3">
              <span className="text-2xl">⚠️</span>
            </div>
            <p className="text-base font-semibold text-gray-500">ข้อมูลไม่เพียงพอสำหรับการประเมิน</p>
            <p className="text-sm text-gray-400 mt-1">ต้องมีข้อมูลน้ำหนักปลาอย่างน้อย 1 รายการ</p>
          </div>
        )}

        {/* ===== Main Content: Quality Assessment ===== */}
        {!loading && !loadingRecords && assessment && (
          <>
            {/* ส่วน A: การ์ดสรุปภาพรวม */}
            <QualitySummaryCards assessment={assessment} />

            {/* ส่วน B: กราฟเทียบน้ำหนักจริง vs มาตรฐาน */}
            <GrowthChart data={chartData} />

            {/* ส่วน C: สรุปค่าใช้จ่าย */}
            <CostSummary assessment={assessment} />
          </>
        )}
      </div>
    </div>
  );
}

export default function QualityReportPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <QualityReportContent />
    </Suspense>
  );
}
