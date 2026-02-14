'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { ProfileDropdownMenu } from '@/components/common/ProfileDropdownMenu';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://dukefarm-backend.onrender.com/api";

interface RecordListStepProps {
  onAddNew: () => void;
  onViewDetails: (id: string) => void;
  onBack: () => void;
  farmType: string;
  pondId?: string;
}

type RecordItem = {
  id: string;
  farmType: string;
  recordedAt: string;
  fishAgeLabel: string;
  fishAgeDays: number | null;
  fishCount: number | null;
  fishCountText: string | null;
  foodAmountKg: number | null;
  notes: string | null;
};

export const RecordListStep: React.FC<RecordListStepProps> = ({ onAddNew, onViewDetails, onBack, farmType, pondId }) => {
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<RecordItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Cycle state
  const [cycleNumber, setCycleNumber] = useState<number>(0);
  const [activeCycle, setActiveCycle] = useState<{ id: string; startDate: string; status: string } | null>(null);
  const [isStartingCycle, setIsStartingCycle] = useState(false);
  const [isConfirmNewCycleOpen, setIsConfirmNewCycleOpen] = useState(false);

  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const url = new URL(`${API_BASE_URL}/records`);
      url.searchParams.append('limit', '200');
      // Always filter by farmType
      url.searchParams.append('farmType', farmType);

      if (pondId) {
        url.searchParams.append('pondId', pondId);
      }

      // Filter by active production cycle
      if (activeCycle?.id) {
        url.searchParams.append('productionCycleId', activeCycle.id);
      }

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const result = await res.json();
        setRecords(result.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch records", err);
    } finally {
      setLoading(false);
    }
  }, [farmType, pondId, activeCycle]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleDelete = async () => {
    if (!selectedRecord) return;
    try {
      setIsDeleting(true);
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const res = await fetch(`${API_BASE_URL}/records/${selectedRecord.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setRecords(prev => prev.filter(r => r.id !== selectedRecord.id));
        setIsDeleteModalOpen(false);
        setSelectedRecord(null);
      }
    } catch (err) {
      console.error("Failed to delete record", err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Fetch cycle info and auto-start first cycle if none exists
  const fetchCycleInfo = useCallback(async () => {
    if (!pondId) return;
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const [cycleRes, countRes] = await Promise.all([
        fetch(`${API_BASE_URL}/ponds/${pondId}/active-cycle`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/ponds/${pondId}/cycle-count`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      let cycle = null;
      if (cycleRes.ok) {
        const { data } = await cycleRes.json();
        cycle = data;
      }

      let count = 0;
      if (countRes.ok) {
        const { data } = await countRes.json();
        count = data?.count || 0;
      }

      // Auto-start first cycle if no active cycle and no cycles ever existed
      if (!cycle && count === 0) {
        const startRes = await fetch(`${API_BASE_URL}/ponds/${pondId}/start-cycle`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ farmType }),
        });
        if (startRes.ok) {
          const { data } = await startRes.json();
          cycle = data;
          count = 1;
        }
      }

      setActiveCycle(cycle);
      setCycleNumber(count);
    } catch (err) {
      console.error("Failed to fetch cycle info", err);
    }
  }, [pondId, farmType]);

  useEffect(() => {
    fetchCycleInfo();
  }, [fetchCycleInfo]);

  const handleStartNewCycle = async () => {
    if (!pondId) return;
    try {
      setIsStartingCycle(true);
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const res = await fetch(`${API_BASE_URL}/ponds/${pondId}/start-cycle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ farmType }),
      });

      if (res.ok) {
        await fetchCycleInfo();
        setIsConfirmNewCycleOpen(false);
        // Navigate to data entry form
        onAddNew();
      } else {
        alert('ไม่สามารถเริ่มรอบการเลี้ยงใหม่ได้');
      }
    } catch (err) {
      console.error("Failed to start new cycle", err);
      alert('เกิดข้อผิดพลาด กรุณาลองใหม่');
    } finally {
      setIsStartingCycle(false);
    }
  };

  const paginatedRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return records.slice(startIndex, startIndex + pageSize);
  }, [records, currentPage, pageSize]);

  const totalPages = Math.ceil(records.length / pageSize);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const date = d.toLocaleDateString('th-TH', { year: 'numeric', month: '2-digit', day: '2-digit' });
    const time = d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    return { date, time };
  };

  return (
    <div className="min-h-screen bg-white relative pb-32">
      {/* Header */}
      <div className="bg-[#093832] text-white px-4 pt-5 pb-4 rounded-b-3xl shadow-md relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="p-1 hover:bg-white/10 rounded-full transition-colors">
            <ChevronLeft className="w-8 h-8" />
          </button>
          <h1 className="text-2xl font-bold">รายการบันทึกข้อมูล</h1>
        </div>
        <ProfileDropdownMenu showGreeting={false} />
      </div>

      <div className="px-4 mt-6">
        {/* --- Cycle Card --- */}
        {pondId && (
          <div className="bg-gradient-to-r from-[#093832] to-[#0f5e4e] rounded-2xl p-5 mb-6 shadow-lg text-white">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold">รอบการเลี้ยงที่ {cycleNumber || '-'}</h2>
              </div>
            </div>

            {activeCycle ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/70">สถานะ</span>
                  {activeCycle.status === 'PLANNING' ? (
                    <span className="bg-yellow-400/20 text-yellow-200 px-2.5 py-0.5 rounded-full text-xs font-bold">
                      รอการบันทึกข้อมูล
                    </span>
                  ) : (
                    <span className="bg-emerald-400/20 text-emerald-200 px-2.5 py-0.5 rounded-full text-xs font-bold">
                      กำลังดำเนินการ
                    </span>
                  )}
                </div>
                {activeCycle.status !== 'PLANNING' && (
                  <>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/70">วันที่เริ่มปล่อยปลา</span>
                      <span className="font-semibold">
                        {new Date(activeCycle.startDate).toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/70">ระยะเวลา</span>
                      <span className="font-semibold">
                        {Math.max(1, Math.ceil((Date.now() - new Date(activeCycle.startDate).getTime()) / (1000 * 60 * 60 * 24)))} วัน
                      </span>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <p className="text-white/60 text-sm">กำลังเตรียมรอบการเลี้ยง...</p>
            )}

            {activeCycle && activeCycle.status !== 'PLANNING' && (
              <button
                onClick={() => setIsConfirmNewCycleOpen(true)}
                className="mt-4 w-full border-2 border-dashed border-white/30 text-white/70 text-sm font-bold py-3 rounded-xl hover:bg-white/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                เริ่มรอบการเลี้ยงใหม่
              </button>
            )}
          </div>
        )}

        {/* Table & Footer */}
        <div className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm bg-white">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#093832] text-white text-xs">
                <th className="py-4 px-3 text-center w-12 border-r border-white/10 font-bold text-white">No.</th>
                <th className="py-4 px-4 border-r border-white/10 font-bold text-white">วันที่เก็บข้อมูล</th>
                <th className="py-4 px-3 text-center font-bold text-white">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={3} className="py-20 text-center">
                    <div className="flex justify-center">
                      <div className="w-8 h-8 border-4 border-emerald-100 border-t-[#0F3B35] rounded-full animate-spin"></div>
                    </div>
                  </td>
                </tr>
              ) : paginatedRecords.length > 0 ? paginatedRecords.map((record, index) => {
                const { date, time } = formatDate(record.recordedAt);
                return (
                  <tr key={record.id} className="text-sm">
                    <td className="py-4 px-3 text-center text-gray-500 font-medium">
                      {(currentPage - 1) * pageSize + index + 1}
                    </td>
                    <td className="py-4 px-4 text-[#093832] font-bold">
                      {date} - {time}
                    </td>
                    <td className="py-4 px-3 flex items-center justify-center gap-4">
                      <button onClick={() => onViewDetails(record.id)} className="hover:scale-110 transition-transform">
                        <Image src="/records/prime_search.svg" alt="v" width={22} height={22} />
                      </button>
                      <button onClick={() => { setSelectedRecord(record); setIsDeleteModalOpen(true); }} className="hover:scale-110 transition-transform">
                        <Image src="/records/proicons_delete.svg" alt="d" width={22} height={22} />
                      </button>
                    </td>
                  </tr>
                )
              }) : (
                <tr>
                  <td colSpan={3} className="py-20 text-center text-gray-400 font-medium font-bold">ไม่พบข้อมูล</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Footer Pagination */}
          <div className="bg-gray-50 px-4 py-3 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-medium font-bold">แสดง</span>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                className="bg-white border border-gray-300 rounded-md px-1.5 py-1 text-xs font-bold text-[#093832] focus:outline-none"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className={`p-1.5 rounded-full transition-colors ${currentPage === 1 ? 'text-gray-200' : 'text-[#093832] bg-[#E4F5E7] hover:bg-[#c9e9d1]'}`}
              >
                <ChevronLeft className="w-5 h-5 stroke-[3px]" />
              </button>

              <span className="text-xs font-extrabold text-[#093832] min-w-[40px] text-center font-bold">
                {currentPage} / {totalPages || 1}
              </span>

              <button
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className={`p-1.5 rounded-full transition-colors ${currentPage === totalPages || totalPages === 0 ? 'text-gray-200' : 'text-[#093832] bg-[#E4F5E7] hover:bg-[#c9e9d1]'}`}
              >
                <ChevronRight className="w-5 h-5 stroke-[3px]" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal ยืนยันการลบ */}
      {isDeleteModalOpen && selectedRecord && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsDeleteModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-sm rounded-[35px] p-8 text-center animate-in zoom-in duration-200">
            <div className="flex justify-center mb-5">
              <div className="bg-red-50 p-5 rounded-full ring-8 ring-red-50/50">
                <Image src="/records/proicons_delete.svg" alt="d" width={42} height={42} />
              </div>
            </div>
            <h3 className="text-[#093832] text-xl font-bold mb-2">ยืนยันการลบข้อมูล?</h3>
            <p className="text-gray-500 text-sm mb-2 px-2 font-bold">บันทึกวันที่ {formatDate(selectedRecord.recordedAt).date}</p>
            <p className="text-[#FF3B30] font-bold text-sm mb-8">เวลา {formatDate(selectedRecord.recordedAt).time} น.</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="w-full bg-[#FF3B30] text-white font-bold py-4 rounded-2xl shadow-lg disabled:opacity-50"
              >
                {isDeleting ? 'กำลังลบ...' : 'ยืนยันการลบ'}
              </button>
              <button onClick={() => setIsDeleteModalOpen(false)} className="w-full bg-gray-100 text-[#093832] font-bold py-4 rounded-2xl">ยกเลิก</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal ยืนยันเริ่มรอบการเลี้ยงใหม่ */}
      {isConfirmNewCycleOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsConfirmNewCycleOpen(false)}></div>
          <div className="relative bg-white w-full max-w-sm rounded-[35px] p-8 text-center animate-in zoom-in duration-200">
            <div className="flex justify-center mb-5">
              <div className="bg-emerald-50 p-5 rounded-full ring-8 ring-emerald-50/50">
                <RefreshCw className="w-10 h-10 text-[#093832]" />
              </div>
            </div>
            <h3 className="text-[#093832] text-xl font-bold mb-2">
              ยืนยันการเริ่มรอบการเลี้ยงใหม่?
            </h3>
            <p className="text-gray-700 text-base mb-2 px-2 font-semibold leading-relaxed">
              รอบการเลี้ยงที่ {cycleNumber} จะสิ้นสุดลง และเริ่มรอบการเลี้ยงที่ {cycleNumber + 1}
            </p>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              โดยข้อมูลรอบเดิมจะถูกเก็บไว้ในระบบ และสามารถเรียกดูย้อนหลังได้
            </p>
            <div className="flex flex-col gap-3">
              <button onClick={() => setIsConfirmNewCycleOpen(false)} className="w-full bg-gray-100 text-[#093832] font-bold py-4 rounded-2xl">ยกเลิก</button>
              <button
                onClick={handleStartNewCycle}
                disabled={isStartingCycle}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-2xl shadow-lg disabled:opacity-50 transition-colors"
              >
                {isStartingCycle ? 'กำลังดำเนินการ...' : 'ยืนยัน'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ปุ่มเพิ่มข้อมูล */}
      <div className="fixed bottom-8 left-0 right-0 px-6 z-20 flex justify-center">
        <button
          onClick={onAddNew}
          className="w-full max-w-md bg-[#EF6E11] text-white text-xl font-bold py-4 rounded-[20px] shadow-xl active:scale-95 transition-all"
        >
          เพิ่มการบันทึกข้อมูล
        </button>
      </div>
    </div>
  );
};