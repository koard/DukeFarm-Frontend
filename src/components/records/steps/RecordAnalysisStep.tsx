'use client';

import React from 'react';
import Image from 'next/image';
import { ChevronLeft } from 'lucide-react';
import { ProfileDropdownMenu } from '@/components/common/ProfileDropdownMenu';

interface RecordAnalysisStepProps {
  onClose: () => void;
  onBack: () => void;
  recordId?: string;
}

export const RecordAnalysisStep: React.FC<RecordAnalysisStepProps> = ({ onClose, onBack, recordId }) => {
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!recordId) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/records/${recordId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const { data } = await res.json();
          setData(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [recordId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-100 border-t-[#0F3B35] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500">ไม่พบข้อมูลผลวิเคราะห์</p>
        <button onClick={onBack} className="text-[#EF6E11] font-bold">กลับ</button>
      </div>
    );
  }

  const pondName = data.pond?.pondType === 'EARTH' ? 'บ่อดิน' : 'บ่อปูน';
  const width = data.pond?.widthM || 0;
  const length = data.pond?.lengthM || 0;
  const depth = data.pond?.depthM || 0;
  const volume = width * length * depth; // m3
  const volumeLiters = volume * 1000;

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
          <h2 className="text-lg font-bold">ผลวิเคราะห์การเจริญเติบโต ({data.fishAgeLabel})</h2>
        </div>

        <div className="rounded-[30px] overflow-hidden shadow-lg border border-gray-100 bg-white pb-6 space-y-4">
          {/* ส่วนหัวบ่อ */}
          <div className="bg-[#093832] px-6 py-4 text-white font-bold text-lg">
            − บ่อที่ {data.pond?.id ? parseInt(data.pond.id.split('-').pop() || '0', 16) % 100 : '-'}
          </div>

          {/* ข้อมูลขนาดบ่อ */}
          <div className="px-6 text-xs text-[#093832] font-semibold leading-relaxed">
            <p>{pondName} - กว้าง {width} x ยาว {length} x ลึก {depth}</p>
            <p>ปริมาตร = {volume} ลูกบาศก์เมตร หรือ {volumeLiters.toLocaleString()} ลิตร</p>
          </div>

          <div className="px-4 space-y-3">
            {/* 3. ประเภทปลา และขนาดปลา */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#D8EFFF] p-4 rounded-[20px] space-y-2">
                <div className="flex items-center gap-2 text-[#093832]">
                  <Image src="/records/fish.svg" alt="fish" width={18} height={18} />
                  <span className="text-sm font-bold">อายุ/รุ่น</span>
                </div>
                <p className="text-lg font-extrabold text-[#093832] text-center">{data.fishAgeLabel}</p>
              </div>
              <div className="bg-[#D8EFFF] p-4 rounded-[20px] space-y-2">
                <div className="flex items-center gap-2 text-[#093832]">
                  <Image src="/records/ri_ruler-2-line.svg" alt="ruler" width={18} height={18} />
                  <span className="text-sm font-bold">ขนาดปลา</span>
                </div>
                <p className="text-lg font-extrabold text-[#093832] text-center">
                  {data.averageFishWeightGr ? `${data.averageFishWeightGr} กรัม` : '-'}
                </p>
              </div>
            </div>

            {/* 4. วันที่ปล่อย จำนวน เหลือ */}
            <div className="bg-[#FFEFBC] p-4 rounded-[20px] grid grid-cols-3 divide-x divide-[#093832]/10">
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-1.5 text-[#093832] mb-1">
                  <Image src="/records/calendar.svg" alt="calendar" width={14} height={14} />
                  <span className="text-sm font-bold">วันที่</span>
                </div>
                <p className="text-base font-extrabold text-[#093832]">
                  {new Date(data.recordedAt).toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                </p>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-1.5 text-[#093832] mb-1">
                  <Image src="/records/fish.svg" alt="fish" width={14} height={14} />
                  <span className="text-sm font-bold">ปล่อย</span>
                </div>
                <p className="text-base font-extrabold text-[#093832]">{data.fishReleased || '-'}</p>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-1.5 text-[#093832] mb-1">
                  <Image src="/records/fish.svg" alt="fish" width={14} height={14} />
                  <span className="text-sm font-bold">เหลือ</span>
                </div>
                <p className="text-base font-extrabold text-[#093832]">{data.fishRemaining || '-'}</p>
              </div>
            </div>

            {/* 5. ประเภทอาหารและปริมาณอาหาร*/}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#D0F4E8] p-4 rounded-[20px] space-y-2">
                <div className="flex items-center gap-2 text-[#093832]">
                  <Image src="/records/fluent_food-grains-20-regular.svg" alt="food" width={18} height={18} />
                  <span className="text-sm font-bold">สูตรอาหาร</span>
                </div>
                <p className="text-lg font-extrabold text-[#093832] text-center">{data.feedFormulaName || '-'}</p>
              </div>
              <div className="bg-[#D0F4E8] p-4 rounded-[20px] space-y-2">
                <div className="flex items-center gap-2 text-[#093832]">
                  <Image src="/records/hugeicons_weight-scale-01.svg" alt="scale" width={18} height={18} />
                  <span className="text-sm font-bold">ปริมาณ</span>
                </div>
                <p className="text-lg font-extrabold text-[#093832] text-center">
                  {data.foodAmountKg ? `${data.foodAmountKg} กก.` : '-'}
                </p>
              </div>
            </div>

            {/* 6. คำแนะนำการให้อาหาร */}
            <div className="bg-[#DDE5FF] p-5 rounded-[25px] space-y-3 mx-1">
              <h3 className="text-[#093832] font-extrabold text-sm">คำแนะนำการให้อาหาร</h3>
              <div className="bg-white p-4 rounded-[18px] text-xs text-black leading-relaxed font-semibold">
                <p>ระดับการกินอาหาร: {data.foodAmountKg ? 'ปกติ' : 'ไม่มีข้อมูล'}</p>
                <p>ต้นทุนอาหารมื้อนี้: {data.foodCostBaht ? `${data.foodCostBaht} บาท` : '-'}</p>
                {/* Logic for advice can be more complex later */}
                <p>ติดตาม FCR เพื่อควบคุมต้นทุนอาหาร</p>
              </div>
            </div>

            {/* 7. คำแนะนำการให้ยา */}
            <div className="bg-[#F3DBF5] p-5 rounded-[25px] space-y-3 mx-1">
              <h3 className="text-[#093832] font-extrabold text-sm">การใช้ยาและอาหารเสริม</h3>
              <div className="bg-white p-4 rounded-[18px] text-xs text-black leading-relaxed font-semibold">
                <p>ยา: {data.medicineName || '-'}</p>
                <p>อาหารเสริม: {data.supplementName || '-'}</p>
                <p>ต้นทุนยา: {data.medicineCostBaht ? `${data.medicineCostBaht} บาท` : '-'}</p>
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