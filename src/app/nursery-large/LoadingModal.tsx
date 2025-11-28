"use client";

import { useEffect } from "react";
import { Check } from "lucide-react";

type LoadingStatus = 'idle' | 'saving' | 'success';

export default function LoadingModal({ status }: { status: LoadingStatus }) {
  
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
       <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center justify-center min-w-[260px] min-h-[220px] animate-in zoom-in duration-300">
          
          {/* กำลังบันทึก */}
          {status === 'saving' && (
            <>
              <div className="relative w-16 h-16 mb-6">
                <div className="absolute w-full h-full border-4 border-gray-200 rounded-full"></div>
                <div className="absolute w-full h-full border-4 border-t-[#093832] rounded-full animate-spin"></div>
              </div>
              <p className="text-[#093832] font-bold text-xl">กำลังบันทึกข้อมูล</p>
            </>
          )}

          {/* สำเร็จ */}
          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-[#22C55E] rounded-full flex items-center justify-center mb-6 shadow-md animate-in zoom-in duration-300">
                <Check className="w-10 h-10 text-white" strokeWidth={4} />
              </div>
              <p className="text-[#093832] font-bold text-xl">บันทึกข้อมูลสำเร็จ</p>
            </>
          )}

       </div>
    </div>
  );
}