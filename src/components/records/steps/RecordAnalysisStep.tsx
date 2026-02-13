'use client';

import React from 'react';
import Image from 'next/image';
import { ChevronLeft } from 'lucide-react';
import { ProfileDropdownMenu } from '@/components/common/ProfileDropdownMenu';

interface RecordAnalysisStepProps {
  onClose: () => void;
  onBack: () => void;
}

export const RecordAnalysisStep: React.FC<RecordAnalysisStepProps> = ({ onClose, onBack }) => {
  return (
    <div className="min-h-screen bg-white relative pb-32 font-sans">
      <div className="bg-[#093832] text-white px-4 pt-5 pb-4 rounded-b-3xl shadow-md relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="p-1 hover:bg-white/10 rounded-full transition-colors">
            <ChevronLeft className="w-8 h-8" />
          </button>
          <h1 className="text-2xl font-bold">ผลวิเคราะห์</h1>
        </div>
        <ProfileDropdownMenu showGreeting={false} />
      </div>

      <div className="px-5 mt-6 space-y-4">

        <div className="flex items-center gap-2 text-[#093832]">
          <Image src="/records/famicons_fish.svg" alt="fish-icon" width={24} height={24} />
          <h2 className="text-lg font-bold">ผลวิเคราะห์การเจริญเติบโต (ปลาดุก)</h2>
        </div>

        <div className="rounded-[30px] overflow-hidden shadow-lg border border-gray-100 bg-white pb-6 space-y-4">
          {/* ส่วนหัวบ่อ */}
          <div className="bg-[#093832] px-6 py-4 text-white font-bold text-lg">
            − บ่อที่ 1
          </div>

          {/* ข้อมูลขนาดบ่อ */}
          <div className="px-6 text-xs text-[#093832] font-semibold leading-relaxed">
            <p>บ่อปูน - กว้าง 3 x ยาว 5 x ลึก 1</p>
            <p>ปริมาตร = 15 ลูกบาศก์เมตร หรือ 15,000 ลิตร</p>
          </div>

          <div className="px-4 space-y-3">
            {/* 3. ประเภทปลา และขนาดปลา */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#D8EFFF] p-4 rounded-[20px] space-y-2">
                <div className="flex items-center gap-2 text-[#093832]">
                  <Image src="/records/fish.svg" alt="fish" width={18} height={18} />
                  <span className="text-sm font-bold">ประเภทปลา</span>
                </div>
                <p className="text-lg font-extrabold text-[#093832] text-center">ปลานิ้ว</p>
              </div>
              <div className="bg-[#D8EFFF] p-4 rounded-[20px] space-y-2">
                <div className="flex items-center gap-2 text-[#093832]">
                  <Image src="/records/ri_ruler-2-line.svg" alt="ruler" width={18} height={18} />
                  <span className="text-sm font-bold">ขนาดปลา</span>
                </div>
                <p className="text-lg font-extrabold text-[#093832] text-center">6 เซนติเมตร</p>
              </div>
            </div>

            {/* 4. วันที่ปล่อย จำนวน เหลือ */}
            <div className="bg-[#FFEFBC] p-4 rounded-[20px] grid grid-cols-3 divide-x divide-[#093832]/10">
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-1.5 text-[#093832] mb-1">
                  <Image src="/records/calendar.svg" alt="calendar" width={14} height={14} />
                  <span className="text-sm font-bold">วันที่ปล่อย</span>
                </div>
                <p className="text-base font-extrabold text-[#093832]">25/06/2025</p>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-1.5 text-[#093832] mb-1">
                  <Image src="/records/fish.svg" alt="fish" width={14} height={14} />
                  <span className="text-sm font-bold">จำนวน</span>
                </div>
                <p className="text-base font-extrabold text-[#093832]">20</p>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-1.5 text-[#093832] mb-1">
                  <Image src="/records/fish.svg" alt="fish" width={14} height={14} />
                  <span className="text-sm font-bold">เหลือ</span>
                </div>
                <p className="text-base font-extrabold text-[#093832]">18</p>
              </div>
            </div>

            {/* 5. ประเภทอาหารและปริมาณอาหาร*/}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#D0F4E8] p-4 rounded-[20px] space-y-2">
                <div className="flex items-center gap-2 text-[#093832]">
                  <Image src="/records/fluent_food-grains-20-regular.svg" alt="food" width={18} height={18} />
                  <span className="text-sm font-bold">ประเภทอาหาร</span>
                </div>
                <p className="text-lg font-extrabold text-[#093832] text-center">อาหารสด</p>
              </div>
              <div className="bg-[#D0F4E8] p-4 rounded-[20px] space-y-2">
                <div className="flex items-center gap-2 text-[#093832]">
                  <Image src="/records/hugeicons_weight-scale-01.svg" alt="scale" width={18} height={18} />
                  <span className="text-sm font-bold">ปริมาณอาหาร</span>
                </div>
                <p className="text-lg font-extrabold text-[#093832] text-center">15 กิโลกรัม</p>
              </div>
            </div>

            {/* 6. คำแนะนำการให้อาหาร */}
            <div className="bg-[#DDE5FF] p-5 rounded-[25px] space-y-3 mx-1">
              <h3 className="text-[#093832] font-extrabold text-sm">คำแนะนำการให้อาหาร</h3>
              <div className="bg-white p-4 rounded-[18px] text-xs text-black leading-relaxed font-semibold">
                <p>ให้ 2 มื้อใหญ่ต่อวัน (เช้า-เย็น)</p>
                <p>เพิ่มสัดส่วนพลังงาน (ข้าวโพด, รำ)</p>
                <p>ลดโปรตีนลงเล็กน้อยอัตราโปรตีน 28-32% ก็เพียงพอ</p>
                <p>ติดตาม FCR เพื่อควบคุมต้นทุนอาหาร</p>
              </div>
            </div>

            {/* 7. คำแนะนำการให้ยา */}
            <div className="bg-[#F3DBF5] p-5 rounded-[25px] space-y-3 mx-1">
              <h3 className="text-[#093832] font-extrabold text-sm">คำแนะนำการให้ยา</h3>
              <div className="bg-white p-4 rounded-[18px] text-xs text-black leading-relaxed font-semibold">
                <p>ให้ในปริมาณที่พอเหมาะ 2 เวลา (เช้า-เย็น)</p>
                <p>โดยผสมในอาหาร</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- ปุ่มปิด --- */}
      <div className="fixed bottom-8 left-0 right-0 px-6 z-20 flex justify-center">
        <button
          onClick={onClose}
          className="w-full max-w-md bg-white border border-[#EF6E11] text-[#EF6E11] text-xl font-bold py-4 rounded-[15px] active:scale-95 transition-all"
        >
          ปิด
        </button>
      </div>
    </div>
  );
};