'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { useLineUser } from '@/hooks/useLineUser';

interface DiseaseInfo {
  name: string;
  symptoms: string;
  treatment: string;
}

const DISEASE_DATA: DiseaseInfo[] = [
  {
    name: 'โรคขาดสารอาหาร',
    symptoms: 'ปลาหัวโต, ตัวลีบ, คลีบมีสีเหลืองขุ่นทั้ง 2 ข้าง',
    treatment: 'เพิ่มสัดส่วนพลังงาน (ข้าวโพด, รำ)\nเพิ่มโปรตีนลงเล็กน้อย อัตราโปรตีน 28-32% ก็เพียงพอ',
  },
  {
    name: 'โรคลำไส้อักเสบปลาดุก',
    symptoms: 'รอข้อมูลลักษณะที่พบ...',
    treatment: 'รอข้อมูลแนวทางการรักษา...',
  },
  {
    name: 'โรคแผลเลือดออก/แบคทีเรียแกรมลบ',
    symptoms: 'รอข้อมูลลักษณะที่พบ...',
    treatment: 'รอข้อมูลแนวทางการรักษา...',
  },
  {
    name: 'โรคตัวด่าง/ตัวลาย',
    symptoms: 'รอข้อมูลลักษณะที่พบ...',
    treatment: 'รอข้อมูลแนวทางการรักษา...',
  },
  {
    name: 'โรคสเตรปโตค็อกคัส/ติดเชื้อสมอง',
    symptoms: 'รอข้อมูลลักษณะที่พบ...',
    treatment: 'รอข้อมูลแนวทางการรักษา...',
  },
  {
    name: 'โรคไวรัสทำลายสมองลูกปลา',
    symptoms: 'รอข้อมูลลักษณะที่พบ...',
    treatment: 'รอข้อมูลแนวทางการรักษา...',
  },
  {
    name: 'โรคจุดขาว/ไอค์',
    symptoms: 'รอข้อมูลลักษณะที่พบ...',
    treatment: 'รอข้อมูลแนวทางการรักษา...',
  },
  {
    name: 'เห็บปลา/หนอนสมอ',
    symptoms: 'รอข้อมูลลักษณะที่พบ...',
    treatment: 'รอข้อมูลแนวทางการรักษา...',
  },
  {
    name: 'โปรโตซัวผิวหนัง/เหงือก',
    symptoms: 'รอข้อมูลลักษณะที่พบ...',
    treatment: 'รอข้อมูลแนวทางการรักษา...',
  },
  {
    name: 'พยาธิหนอนลำไส้',
    symptoms: 'รอข้อมูลลักษณะที่พบ...',
    treatment: 'รอข้อมูลแนวทางการรักษา...',
  },
  {
    name: 'โรครา/เชื้อราผิวหนังปลา',
    symptoms: 'รอข้อมูลลักษณะที่พบ...',
    treatment: 'รอข้อมูลแนวทางการรักษา...',
  },
  {
    name: 'โรคแผลเน่ารุนแรง',
    symptoms: 'รอข้อมูลลักษณะที่พบ...',
    treatment: 'รอข้อมูลแนวทางการรักษา...',
  },
  {
    name: 'โรคดีซ่านปลา/ตับอักเสบ',
    symptoms: 'รอข้อมูลลักษณะที่พบ...',
    treatment: 'รอข้อมูลแนวทางการรักษา...',
  },
  {
    name: 'อาการเครียดปลาดุก',
    symptoms: 'รอข้อมูลลักษณะที่พบ...',
    treatment: 'รอข้อมูลแนวทางการรักษา...',
  },
];

interface DiseaseInfoProps {
  backHref: string; 
}

export const DiseaseInfo = ({ backHref }: DiseaseInfoProps) => {
  const router = useRouter();
  const lineUser = useLineUser();
  const [selectedDisease, setSelectedDisease] = useState<DiseaseInfo | null>(null);

  const handleBack = () => {
    if (selectedDisease) {
      setSelectedDisease(null);
    } else {
      router.push(backHref);
    }
  };

  return (
    <div className="min-h-screen bg-white pb-10 relative">
      <div className="bg-[#093832] text-white px-4 pt-8 pb-10 rounded-b-[40px] shadow-md relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button 
            onClick={handleBack} 
            className="p-1 rounded-full transition-colors hover:bg-white/10"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <h1 className="text-2xl font-bold">
            {selectedDisease ? selectedDisease.name : 'ข้อมูลการรักษาโรค'}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm text-gray-300">ยินดีต้อนรับ</p>
            <p className="text-sm font-bold">{lineUser.displayName}</p>
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-gray-200">
            <Image
              src={lineUser.pictureUrl || '/default-avatar.png'}
              alt="Profile"
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      <div className="px-6 mt-8 w-full max-w-md mx-auto flex flex-col min-h-[calc(100vh-180px)] justify-between">
        
        {!selectedDisease && (
          <div className="flex flex-col gap-3">
            {DISEASE_DATA.map((disease, index) => (
              <button
                key={index}
                onClick={() => setSelectedDisease(disease)}
                className="bg-[#DDF8C2] p-4 rounded-2xl text-left text-[#093832] font-bold text-lg shadow-sm hover:bg-[#cceeaf] transition-colors"
              >
                {disease.name}
              </button>
            ))}
          </div>
        )}

        {selectedDisease && (
          <div className="space-y-6">
            <div className="bg-[#FFF6DB] p-5 rounded-2xl shadow-sm">
              <h3 className="font-bold text-black mb-3 text-lg">ลักษณะที่พบ</h3>
              <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                {selectedDisease.symptoms}
              </p>
            </div>

            <div className="bg-[#DDE5FF] p-5 rounded-2xl shadow-sm">
              <h3 className="font-bold text-black mb-3 text-lg">แนวทางการรักษา</h3>
              <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                {selectedDisease.treatment}
              </p>
            </div>
          </div>
        )}

        <div className="mt-8">
            <button
              type="button"
              onClick={() => router.push(backHref)} 
              className="w-full py-3.5 rounded-xl text-xl font-bold text-[#EF6E11] border-2 border-[#EF6E11] bg-white hover:bg-orange-50 transition-colors"
            >
              ปิด
            </button>
        </div>

      </div>
    </div>
  );
};