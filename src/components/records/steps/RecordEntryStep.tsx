'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, Calendar, RefreshCw, ChevronDown, Check } from 'lucide-react'; 
import { ProfileDropdownMenu } from '@/components/common/ProfileDropdownMenu';

interface RecordEntryStepProps {
  onAnalyze: () => void;
  onBack: () => void;
}

export const RecordEntryStep: React.FC<RecordEntryStepProps> = ({ onAnalyze, onBack }) => {
  const [releaseDate, setReleaseDate] = useState('2025-06-25');
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const dateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isResetModalOpen || isSuccessModalOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isResetModalOpen, isSuccessModalOpen]);

  const handleOpenPicker = () => {
    if (dateInputRef.current) {
      try {
        (dateInputRef.current as any).showPicker();
      } catch (error) {
        dateInputRef.current.click();
      }
    }
  };

  const handleAnalyzeClick = () => {
    setIsSuccessModalOpen(true);
    setTimeout(() => {
      setIsSuccessModalOpen(false);
      onAnalyze();
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-white relative pb-32">
      {/* Header */}
      <div className="bg-[#093832] text-white px-4 pt-8 pb-10 rounded-b-[40px] shadow-md relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="p-1 hover:bg-white/10 rounded-full transition-colors">
            <ChevronLeft className="w-8 h-8" />
          </button>
          <h1 className="text-2xl font-bold">กรอกข้อมูล</h1>
        </div>
        <ProfileDropdownMenu showGreeting={false} />
      </div>

      <div className="px-5 mt-6 space-y-6">
        <div className="border border-gray-100 rounded-3xl shadow-lg overflow-hidden pb-6 bg-white">
          <div className="bg-[#093832] px-5 py-4 text-white">
            <span className="font-extrabold text-lg tracking-wide">− บ่อที่ 1</span>
          </div>

          <div className="px-4 pt-4 space-y-5">
            <div className="flex justify-end pr-1">
              <button 
                onClick={() => setIsResetModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#EF6E11]/10 border border-[#EF6E11] rounded-full text-[#EF6E11] text-[11px] font-bold active:scale-95 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                เริ่มรอบการเลี้ยงใหม่
              </button>
            </div>

            <div className="text-xs text-[#093832] font-bold leading-relaxed bg-[#CEF2D6]/40 p-4 rounded-2xl border border-[#CEF2D6]">
              <p>บ่อปูน</p>
              <p>กว้าง 3 x ยาว 5 x ลึก 1</p>
              <p>ปริมาตร = 15 ลูกบาศก์เมตร หรือ 15,000 ลิตร</p>
            </div>

            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-5 space-y-1.5">
                <label className="text-sm font-bold text-black ml-1">ประเภทปลา</label>
                <div className="relative">
                  <select defaultValue="" className="w-full appearance-none bg-white border border-gray-200 rounded-xl pl-3 pr-9 py-3 text-xs font-bold text-gray-700 focus:text-black focus:border-[#093832] outline-none">
                    <option value="" disabled>เลือกประเภท</option>
                    <option value="SMALL">ปลาตุ้ม</option>
                    <option value="LARGE">ปลานิ้ว</option>
                    <option value="MARKET">ปลาตลาด</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div className="col-span-3 space-y-1.5">
                <label className="text-sm font-bold text-black text-center block">ขนาดปลา</label>
                <input type="number" placeholder="0" className="w-full bg-white border border-gray-200 rounded-xl px-2 py-3 text-xs font-bold text-center text-gray-700 focus:text-black focus:border-[#093832] outline-none placeholder:text-gray-400" />
              </div>
              <div className="col-span-4 space-y-1.5">
                <label className="text-sm font-bold text-black ml-1">หน่วย</label>
                <div className="relative">
                  <select defaultValue="" className="w-full appearance-none bg-white border border-gray-200 rounded-xl pl-3 pr-8 py-3 text-xs font-bold text-gray-700 focus:text-black focus:border-[#093832] outline-none">
                    <option value="" disabled>เลือกหน่วย</option>
                    <option value="G">กรัม</option>
                    <option value="KG">กิโลกรัม</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-black ml-1">วันที่เริ่มปล่อยลงบ่อ</label>
              <div onClick={handleOpenPicker} className="relative w-full bg-[#CEF2D6] border border-[#093832]/10 rounded-xl px-4 py-3.5 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all">
                <span className="text-sm font-extrabold text-[#093832]">{new Date(releaseDate).toLocaleDateString('th-TH')}</span>
                <Calendar className="w-5 h-5 text-[#093832]" />
                <input ref={dateInputRef} type="date" value={releaseDate} onChange={(e) => setReleaseDate(e.target.value)} className="absolute inset-0 opacity-0 pointer-events-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-black ml-1">จำนวนปลาที่ปล่อย (ตัว)</label>
                <input type="number" placeholder="ระบุจำนวน" className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-bold text-gray-700 focus:text-black focus:border-[#093832] outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-black ml-1">จำนวนปลาที่เหลือ</label>
                <input type="number" placeholder="ระบุจำนวน" className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-bold text-gray-700 focus:text-black focus:border-[#093832] outline-none" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-black ml-1">ประเภทอาหาร</label>
              <div className="relative">
                <select defaultValue="" className="w-full appearance-none border border-gray-200 rounded-xl pl-4 pr-10 py-3.5 text-sm font-bold text-gray-700 focus:text-black focus:border-[#093832] outline-none">
                  <option value="" disabled>ระบุข้อมูล เช่น อาหารสด, อาหารเม็ด</option>
                  <option value="FRESH">อาหารสด</option>
                  <option value="PELLET">อาหารเม็ด</option>
                  <option value="SUPPLEMENT">อาหารเสริม</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-8 space-y-1.5">
                <label className="text-sm font-bold text-black ml-1">ปริมาณอาหาร</label>
                <input type="text" placeholder="ระบุจำนวน เช่น 5, 10, 15" className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-bold text-gray-700 focus:text-black focus:border-[#093832] outline-none" />
              </div>
              <div className="col-span-4 space-y-1.5">
                <label className="text-sm font-bold text-black ml-1">หน่วย</label>
                <div className="relative">
                  <select defaultValue="" className="w-full appearance-none border border-gray-200 rounded-xl pl-3 pr-8 py-3.5 text-sm font-bold text-gray-700 focus:text-black focus:border-[#093832] outline-none">
                    <option value="" disabled>หน่วย</option>
                    <option value="KG">กิโลกรัม</option>
                    <option value="G">กรัม</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-black ml-1">อาหารเสริม</label>
                <div className="relative">
                  <select defaultValue="" className="w-full appearance-none border border-gray-200 rounded-xl pl-4 pr-10 py-3.5 text-sm font-bold text-gray-700 focus:text-black focus:border-[#093832] outline-none">
                    <option value="" disabled>ระบุข้อมูล เช่น จุลินทรีย์, วิตามิน</option>
                    <option value="EM">จุลินทรีย์ EM</option>
                    <option value="VIT">วิตามินรวมเข้มข้น</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-black ml-1">การให้ยา</label>
                <div className="relative">
                  <select defaultValue="" className="w-full appearance-none border border-gray-200 rounded-xl pl-4 pr-10 py-3.5 text-sm font-bold text-gray-700 focus:text-black focus:border-[#093832] outline-none">
                    <option value="" disabled>ระบุข้อมูลยา</option>
                    <option value="ANTIBIOTIC">ยาปฏิชีวนะละลายน้ำ</option>
                    <option value="FUNGAL">ยารักษาเชื้อรา</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-black ml-1">ค่าอาหาร (บาท)</label>
                  <input type="number" placeholder="ระบุข้อมูล" className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-bold text-gray-700 focus:text-black outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-black ml-1">ค่ายา (บาท)</label>
                  <input type="number" placeholder="ระบุข้อมูล" className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-bold text-gray-700 focus:text-black outline-none" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ปุ่มวิเคราะห์ข้อมูลหลัก */}
      <div className="fixed bottom-8 left-0 right-0 px-6 z-20 flex justify-center">
        <button 
          onClick={handleAnalyzeClick} 
          className="w-full max-w-md bg-[#EF6E11] text-white text-xl font-extrabold py-4 rounded-[25px] active:scale-95 transition-all tracking-wide shadow-md"
        >
          เริ่มวิเคราะห์ข้อมูล
        </button>
      </div>

      {/* --- Reset Confirmation Modal --- */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsResetModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-sm rounded-[35px] p-8 text-center animate-in zoom-in duration-200 shadow-2xl">
            <div className="flex justify-center mb-5">
              <div className="bg-[#EF6E11]/10 p-5 rounded-full ring-8 ring-[#EF6E11]/5">
                <RefreshCw className="w-10 h-10 text-[#EF6E11]" />
              </div>
            </div>
            <h3 className="text-[#093832] text-xl font-extrabold mb-3">ยืนยันการเริ่มรอบใหม่?</h3>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed font-bold">ข้อมูลที่กรอกค้างไว้จะถูกล้างค่าทั้งหมด</p>
            <div className="flex flex-col gap-3">
              <button onClick={() => setIsResetModalOpen(false)} className="w-full bg-[#EF6E11] text-white font-bold py-4 rounded-2xl shadow-md">ยืนยันการเริ่มรอบใหม่</button>
              <button onClick={() => setIsResetModalOpen(false)} className="w-full bg-gray-100 text-[#093832] font-bold py-4 rounded-2xl">ยกเลิก</button>
            </div>
          </div>
        </div>
      )}

      {/* ---  Modal บันทึกข้อมูลสำเร็จ  --- */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
          <div className="relative bg-white w-full max-w-[280px] rounded-[32px] p-8 text-center animate-in zoom-in duration-300 shadow-2xl">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-[#22C55E] rounded-full flex items-center justify-center shadow-lg shadow-green-100">
                <Check className="w-10 h-10 text-white" strokeWidth={4} />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#093832]">บันทึกข้อมูลสำเร็จ</p>
          </div>
        </div>
      )}
    </div>
  );
};