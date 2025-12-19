"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { ProfileDropdownMenu } from "@/components/common/ProfileDropdownMenu"; 

export default function DiseaseResultPage() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white pb-10">
      <header className="bg-[#093832] text-white px-4 pt-8 pb-10 rounded-b-[40px] shadow-md relative z-30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={handleBack}
            className="p-1 rounded-full transition-all hover:bg-white/10 active:scale-95"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <h1 className="text-2xl font-bold">ผลการวิเคราะห์โรค</h1>
        </div>

        <ProfileDropdownMenu />
      </header>

      <div className="px-5 mt-8 w-full max-w-2xl mx-auto space-y-5">
        <div className="bg-white rounded-2xl shadow-md border border-emerald-100 p-5">
          <h2 className="text-lg font-bold text-[#093832] mb-2">สรุปผลเบื้องต้น</h2>
          <p className="text-sm text-gray-700 leading-relaxed">
            หน้านี้แสดงผลการวิเคราะห์โรคจากข้อมูลอาการที่บันทึกไว้
            หากยังไม่ได้บันทึกข้อมูล สามารถกลับไปกรอกอาการและอัปโหลดรูปภาพเพื่อทำการวิเคราะห์ได้
          </p>
        </div>

        <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-5 shadow-sm">
          <p className="text-sm text-emerald-900 leading-relaxed">
            • ผลวิเคราะห์ละเอียดจะปรากฏที่นี่หลังจากประมวลผลสำเร็จ<br />
            • ตรวจสอบการเชื่อมต่ออินเทอร์เน็ตและลองใหม่อีกครั้ง หากไม่มีข้อมูลปรากฏ
          </p>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={handleBack}
            className="w-full py-4 rounded-xl text-lg font-bold text-white bg-gradient-to-r from-emerald-500 to-green-600 shadow-md hover:shadow-lg hover:from-emerald-600 hover:to-green-700 transition-all active:scale-95"
          >
            กลับไปบันทึกอาการ
          </button>
        </div>
      </div>
    </div>
  );
}