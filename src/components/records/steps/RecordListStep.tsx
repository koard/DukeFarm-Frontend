'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, RefreshCw, Search, Trash2, Calendar, ChevronDown } from 'lucide-react';
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

  // All cycles for selector
  type CycleItem = { id: string; startDate: string; endDate: string | null; status: string; farmType: string | null; createdAt: string };
  const [allCycles, setAllCycles] = useState<CycleItem[]>([]);
  const [selectedCycleId, setSelectedCycleId] = useState<string | null>(null);

  // The cycle currently being viewed (either selected or active)
  const viewingCycle = useMemo(() => {
    if (selectedCycleId) return allCycles.find(c => c.id === selectedCycleId) || null;
    return activeCycle;
  }, [selectedCycleId, allCycles, activeCycle]);

  const isViewingActiveCycle = !selectedCycleId || selectedCycleId === activeCycle?.id;

  const viewingCycleIndex = useMemo(() => {
    if (!viewingCycle) return 0;
    // allCycles is sorted newest first, so reverse for numbering
    const reversedIdx = [...allCycles].reverse().findIndex(c => c.id === viewingCycle.id);
    return reversedIdx >= 0 ? reversedIdx + 1 : 0;
  }, [viewingCycle, allCycles]);

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

      // Filter by selected/active production cycle
      const cycleId = selectedCycleId || activeCycle?.id;
      if (cycleId) {
        url.searchParams.append('productionCycleId', cycleId);
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
  }, [farmType, pondId, activeCycle, selectedCycleId]);

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

      const [cycleRes, countRes, cyclesListRes] = await Promise.all([
        fetch(`${API_BASE_URL}/ponds/${pondId}/active-cycle`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/ponds/${pondId}/cycle-count`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/ponds/${pondId}/cycles`, {
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

      let cyclesList: CycleItem[] = [];
      if (cyclesListRes.ok) {
        const { data } = await cyclesListRes.json();
        cyclesList = data || [];
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
          cyclesList = [data];
        }
      }

      setActiveCycle(cycle);
      setCycleNumber(count);
      setAllCycles(cyclesList);
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
        setSelectedCycleId(null);
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

        {/* --- Cycle Selector --- */}
        {pondId && allCycles.length > 1 && (
          <div className="mb-4">
            <div className="relative">
              <select
                value={selectedCycleId || activeCycle?.id || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedCycleId(val === activeCycle?.id ? null : val);
                  setCurrentPage(1);
                }}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-semibold text-[#093832] appearance-none focus:outline-none focus:ring-2 focus:ring-[#093832]/20 focus:border-[#093832]/40 transition-all"
              >
                {[...allCycles].reverse().map((cycle, idx) => {
                  const isActive = cycle.id === activeCycle?.id;
                  const dateLabel = new Date(cycle.startDate).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' });
                  const statusLabel = isActive ? '● ปัจจุบัน' : cycle.status === 'HARVESTED' ? 'สิ้นสุดแล้ว' : '';
                  return (
                    <option key={cycle.id} value={cycle.id}>
                      รอบที่ {idx + 1} — {dateLabel} {statusLabel ? `(${statusLabel})` : ''}
                    </option>
                  );
                })}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        )}

        {/* Viewing old cycle banner */}
        {!isViewingActiveCycle && viewingCycle && (
          <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-600" />
              <span className="text-sm text-amber-800 font-medium">
                กำลังดูรอบที่ {viewingCycleIndex} (ย้อนหลัง)
              </span>
            </div>
            <button 
              onClick={() => { setSelectedCycleId(null); setCurrentPage(1); }}
              className="text-xs text-amber-700 font-bold underline"
            >
              กลับรอบปัจจุบัน
            </button>
          </div>
        )}

        {/* Table & Footer */}
        <div className="overflow-hidden rounded-2xl shadow-sm bg-white border border-gray-100">
          {/* Table Header */}
          <div className="bg-[#093832] px-4 py-3.5 flex items-center">
            <span className="text-white text-xs font-bold w-12 text-center">No.</span>
            <span className="text-white text-xs font-bold flex-1 pl-3">วันที่เก็บข้อมูล</span>
            <span className="text-white text-xs font-bold w-20 text-center">จัดการ</span>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-50">
            {loading ? (
              <div className="py-20 flex justify-center">
                <div className="w-8 h-8 border-4 border-emerald-100 border-t-[#0F3B35] rounded-full animate-spin"></div>
              </div>
            ) : paginatedRecords.length > 0 ? paginatedRecords.map((record, index) => {
              const { date, time } = formatDate(record.recordedAt);
              return (
                <div key={record.id} className="flex items-center px-4 py-4 hover:bg-gray-50/50 transition-colors">
                  <span className="text-gray-400 text-sm font-medium w-12 text-center">
                    {(currentPage - 1) * pageSize + index + 1}
                  </span>
                  <div className="flex-1 pl-3">
                    <span className="text-[#093832] text-sm font-bold">{date}</span>
                    <span className="text-gray-400 text-sm font-medium ml-2">{time}</span>
                  </div>
                  <div className="flex items-center gap-3 w-20 justify-center">
                    <button 
                      onClick={() => onViewDetails(record.id)} 
                      className="p-1.5 rounded-lg hover:bg-emerald-50 transition-colors"
                    >
                      <Search className="w-[18px] h-[18px] text-[#093832]" />
                    </button>
                    {isViewingActiveCycle && (
                      <button 
                        onClick={() => { setSelectedRecord(record); setIsDeleteModalOpen(true); }} 
                        className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-[18px] h-[18px] text-red-400" />
                      </button>
                    )}
                  </div>
                </div>
              );
            }) : (
              <div className="py-20 text-center text-gray-400 font-medium">ไม่พบข้อมูล</div>
            )}
          </div>

          {/* Footer Pagination */}
          <div className="bg-gray-50/80 px-4 py-3 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-bold">แสดง</span>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs font-bold text-[#093832] focus:outline-none"
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

              <span className="text-xs font-extrabold text-[#093832] min-w-[40px] text-center">
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
            <h3 className="text-[#093832] text-xl font-bold mb-4 mt-2">
              ยืนยันการเริ่มรอบการเลี้ยงใหม่?
            </h3>
            <p className="text-gray-600 text-md mb-8 leading-normal">
              ข้อมูลรอบเก่าจะถูกเก็บไว้ในระบบ<br/>
              และสามารถเรียกดูย้อนหลังได้
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