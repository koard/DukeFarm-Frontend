"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ExternalLink } from "lucide-react";
import { useLineUser } from "@/hooks/useLineUser";

const TALAADTHAI_URL = "https://talaadthai.com/search/%E0%B8%9B%E0%B8%A5%E0%B8%B2%E0%B8%94%E0%B8%B8%E0%B8%81%E0%B9%80%E0%B8%A5%E0%B8%B5%E0%B9%89%E0%B8%A2%E0%B8%87";

export default function PriceMarketPage() {
  const lineUser = useLineUser();
  const [iframeLoaded, setIframeLoaded] = useState(false);

  return (
    <div className="min-h-screen bg-white pb-10">
      
      <div className="bg-[#093832] text-white px-4 pt-8 pb-10 rounded-b-[40px] shadow-md relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link
            href="/market-grower"
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
          >
            <ChevronLeft className="w-8 h-8" />
          </Link>
          <h1 className="text-2xl font-bold">ตรวจสอบราคาตลาด</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm text-gray-300">ยินดีต้อนรับ</p>
            <p className="text-sm font-bold">{lineUser.displayName}</p>
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-gray-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={lineUser.pictureUrl} alt="Profile" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      <div className="px-4 mt-4 w-full max-w-5xl mx-auto space-y-4">
        <div className="bg-[#E8F3ED] border border-emerald-100 rounded-2xl p-4 shadow-sm">
          <p className="text-sm text-[#0B3C32]">
            ระบบจะเปิดหน้าผลการค้นหา “ปลาดุกเลี้ยง” จากเว็บไซต์ตลาดไทภายในแอพเพื่อให้คุณตรวจสอบราคาได้ทันที
          </p>
          <a
            href={TALAADTHAI_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[#0B3C32] font-semibold mt-2 text-sm"
          >
            เปิดในแท็บใหม่ <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        <div className="relative rounded-3xl border border-gray-200 overflow-hidden shadow-lg bg-white min-h-[70vh]">
          {!iframeLoaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-500 text-sm bg-white/80 z-10">
              <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
              กำลังโหลดข้อมูลราคาจากตลาดไท...
            </div>
          )}
          <iframe
            src={TALAADTHAI_URL}
            className="w-full h-[75vh]"
            loading="lazy"
            title="ราคา ปลาดุก ตลาดไท"
            onLoad={() => setIframeLoaded(true)}
          />
        </div>
      </div>
    </div>
  );
}