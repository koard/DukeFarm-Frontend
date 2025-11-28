"use client";

import { useState } from "react";
import Image from "next/image"; 
import Link from "next/link";
import { ChevronLeft, Search, LayoutGrid, List, ChevronDown, MapPin } from "lucide-react";
import { useLineUser } from "@/hooks/useLineUser";

export default function PriceMarketPage() {
  const lineUser = useLineUser();
  
  const [activeTab, setActiveTab] = useState<'product' | 'merchant'>('product');

  const products = [
    {
      id: 1,
      name: "ปลาดุกนา – เบอร์กลาง",
      market: "ตลาดไท",
      location: "ตลาดสดและศูนย์อาหาร",
      price: "฿85 - 95 / กิโลกรัม",
      image: "https://placehold.co/200x200/e6f7e6/2d5a2d?text=TalaadThai", 
      bgBar: "bg-[#B8E6B8]" 
    },
    {
      id: 2,
      name: "ปลาดุกแดดเดียว",
      market: "ตลาดไท",
      location: "ตลาดสดและศูนย์อาหาร",
      price: "฿120 - 130 / กิโลกรัม",
      image: "https://placehold.co/200x200/e6f7e6/2d5a2d?text=TalaadThai",
      bgBar: "bg-[#D4E4BC]" 
    },
    {
      id: 3,
      name: "ปลาดุกบิ๊กอุย (ไซส์จัมโบ้)",
      market: "ตลาดสี่มุมเมือง",
      location: "โซนปลา",
      price: "฿60 - 70 / กิโลกรัม",
      image: "https://placehold.co/200x200/e0f2fe/1e40af?text=Simummuang",
      bgBar: "bg-[#BAE6FD]" 
    },
    {
      id: 4,
      name: "ลูกปลาดุก (สำหรับเลี้ยง)",
      market: "ฟาร์มลุงสมหมาย",
      location: "ปทุมธานี",
      price: "฿2 - 3 / ตัว",
      image: "https://placehold.co/200x200/fef3c7/92400e?text=Farm",
      bgBar: "bg-[#FDE68A]" 
    }
  ];

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

      <div className="px-4 mt-4 w-full max-w-5xl mx-auto">
        
        {/* 1. Search Bar + Back Arrow */}
        <div className="flex items-center gap-3 mb-4">
            <Link href="/market-grower" className="text-black hover:text-gray-600 transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
            </Link>
            <div className="relative flex-1">
                <input 
                    type="text" 
                    placeholder="พิมพ์สิ่งที่คุณกำลังมองหา เช่น ชื่อสินค้า" 
                    className="w-full bg-[#F5F5F5] rounded-xl py-3 pl-4 pr-10 text-sm text-black focus:outline-none focus:ring-2 focus:ring-[#093832]"
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
        </div>

        {/* 2. Tabs (สินค้า / ผู้ค้า) */}
        <div className="flex border-b border-gray-200 mb-6 relative">
            <button 
                onClick={() => setActiveTab('product')}
                className={`flex-1 pb-3 text-center font-bold transition-colors ${activeTab === 'product' ? 'text-[#093832] border-b-2 border-[#093832]' : 'text-gray-400'}`}
            >
                สินค้า
            </button>
            <button 
                onClick={() => setActiveTab('merchant')}
                className={`flex-1 pb-3 text-center font-bold transition-colors ${activeTab === 'merchant' ? 'text-[#093832] border-b-2 border-[#093832]' : 'text-gray-400'}`}
            >
                ผู้ค้า
            </button>
        </div>

        {/* 3. Result Title */}
        <div className="mb-4">
            <h2 className="text-xl font-bold text-black">ผลการค้นหาสำหรับ “ปลาดุก”</h2>
            <p className="text-sm text-gray-500">{products.length} รายการ</p>
        </div>

        {/* 4. Sort & Filter */}
        <div className="flex gap-2 mb-6">
            <div className="flex items-center gap-2 bg-[#F5F5F5] rounded-lg px-3 py-2 flex-1">
                <span className="text-xs text-gray-500 whitespace-nowrap">เรียงตาม</span>
                <span className="text-sm font-bold text-black flex-1">รายการแนะนำ</span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
            </div>
            
            <div className="flex bg-[#F5F5F5] rounded-lg p-1">
                <button className="p-1.5 rounded bg-white shadow-sm text-black"><List className="w-4 h-4" /></button>
                <button className="p-1.5 rounded text-gray-400"><LayoutGrid className="w-4 h-4" /></button>
            </div>
        </div>

        <div className="flex justify-center mb-6">
             <button className="flex items-center gap-2 bg-[#F5F5F5] px-4 py-2 rounded-full">
                <span className="text-sm font-bold text-black">ตลาด</span>
                <ChevronDown className="w-4 h-4 text-black" />
             </button>
        </div>

        {/* 5. Product Grid (Cards) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
                <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                    
                    <div className="h-32 bg-gray-50 flex items-center justify-center relative p-4">
                        <img 
                            src={product.image} 
                            alt={product.name} 
                            className="max-w-full max-h-full object-contain mix-blend-multiply"
                        />
                    </div>

                    <div className="p-3 flex-1 flex flex-col">
                        <h3 className="font-bold text-black text-sm mb-1 line-clamp-2">{product.name}</h3>
                        
                        <div className="mt-auto flex items-start gap-1 text-gray-500 mb-3">
                            <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
                            <div className="text-[10px] leading-tight">
                                <p>{product.location}</p>
                            </div>
                        </div>
                    </div>

                    <div className={`px-3 py-2 ${product.bgBar}`}>
                        <p className="text-xs font-bold text-black text-center">{product.price}</p>
                    </div>

                </div>
            ))}
        </div>

      </div>
    </div>
  );
}