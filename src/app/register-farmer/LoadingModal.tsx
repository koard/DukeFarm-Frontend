"use client";

import { useEffect } from "react";

export default function LoadingModal() {

  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">

      <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center justify-center min-w-[200px] min-h-[180px]">
        
        <div className="relative w-16 h-16 mb-4">
            <div className="absolute w-full h-full border-4 border-gray-200 rounded-full"></div>
            <div className="absolute w-full h-full border-4 border-t-[#093832] rounded-full animate-spin"></div>
        </div>
        
        <p className="text-[#093832] font-bold text-lg">กำลังดำเนินการ</p>
      </div>
    </div>
  );
}