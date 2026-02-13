'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
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
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<RecordItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const startInputRef = useRef<HTMLInputElement>(null);
  const endInputRef = useRef<HTMLInputElement>(null);

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
  }, [farmType, pondId]);

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

  const handleOpenPicker = (ref: React.RefObject<HTMLInputElement | null>) => {
    if (ref.current) {
      try {
        const inputElement = ref.current as any;
        if (typeof inputElement.showPicker === 'function') {
          inputElement.showPicker();
        } else {
          inputElement.click();
        }
      } catch (error) {
        ref.current.click();
      }
    }
  };

  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      if (!startDate && !endDate) return true;
      const d = record.recordedAt.substring(0, 10);
      if (startDate && endDate) return d >= startDate && d <= endDate;
      if (startDate) return d >= startDate;
      if (endDate) return d <= endDate;
      return true;
    });
  }, [records, startDate, endDate]);

  const paginatedRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredRecords.slice(startIndex, startIndex + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredRecords.length / pageSize);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const date = d.toLocaleDateString('th-TH', { year: 'numeric', month: '2-digit', day: '2-digit' });
    const time = d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    return { date, time };
  };

  return (
    <div className="min-h-screen bg-white relative pb-32">
      {/* Header */}
      <div className="bg-[#093832] text-white px-4 pt-6 pb-4 rounded-b-3xl shadow-md relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="p-1 hover:bg-white/10 rounded-full transition-colors">
            <ChevronLeft className="w-8 h-8" />
          </button>
          <h1 className="text-2xl font-bold">รายการบันทึกข้อมูล</h1>
        </div>
        <ProfileDropdownMenu showGreeting={false} />
      </div>

      <div className="px-4 mt-6">
        {/* --- Date Filter --- */}
        <div className="bg-[#E4F5E7] flex items-center gap-2 px-3 py-2.5 rounded-xl mb-6 shadow-sm border border-[#093832]/5">
          <div className="p-1">
            <Image src="/records/solar_calendar-outline.svg" alt="calendar" width={22} height={22} />
          </div>

          <div className="flex items-center flex-1 gap-2">
            <div
              onClick={() => handleOpenPicker(startInputRef)}
              className="relative flex-1 bg-white border border-[#093832]/10 rounded-lg px-3 py-2 shadow-sm active:scale-95 transition-transform cursor-pointer flex items-center justify-between"
            >
              <span className={`text-xs font-bold block ${startDate ? 'text-[#093832]' : 'text-[#093832]/80'}`}>
                {startDate ? new Date(startDate).toLocaleDateString('th-TH') : "เริ่ม"}
              </span>
              <Calendar className="w-3 h-3 text-[#093832]/90" />
              <input
                ref={startInputRef}
                type="date"
                className="absolute inset-0 opacity-0 pointer-events-none"
                style={{ colorScheme: 'light' }}
                onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
              />
            </div>

            <span className="text-[#093832]/80 font-bold">-</span>

            <div
              onClick={() => handleOpenPicker(endInputRef)}
              className="relative flex-1 bg-white border border-[#093832]/10 rounded-lg px-3 py-2 shadow-sm active:scale-95 transition-transform cursor-pointer flex items-center justify-between"
            >
              <span className={`text-xs font-bold block ${endDate ? 'text-[#093832]' : 'text-[#093832]/80'}`}>
                {endDate ? new Date(endDate).toLocaleDateString('th-TH') : "สิ้นสุด"}
              </span>
              <Calendar className="w-3 h-3 text-[#093832]/90" />
              <input
                ref={endInputRef}
                type="date"
                className="absolute inset-0 opacity-0 pointer-events-none"
                style={{ colorScheme: 'light' }}
                onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
              />
            </div>
          </div>

          {(startDate || endDate) && (
            <button
              onClick={() => { setStartDate(''); setEndDate(''); setCurrentPage(1); }}
              className="bg-[#EF6E11] text-white px-3 py-2 rounded-lg text-xs font-bold shadow-md hover:bg-[#d65d0a] active:scale-95 transition-all whitespace-nowrap"
            >
              ล้างค่า
            </button>
          )}
        </div>

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