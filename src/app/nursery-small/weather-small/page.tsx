"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useLineUser } from "@/hooks/useLineUser";

export default function WeatherLargePage() {
  const router = useRouter();
  const lineUser = useLineUser();

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="bg-[#093832] text-white px-4 pt-8 pb-10 rounded-b-[40px] shadow-md relative z-10 flex items-center justify-between">
        
        <div className="flex items-center gap-3">
            <Link 
              href="/nursery-small" 
              className="p-1 hover:bg-white/10 rounded-full transition-colors"
            >
              <ChevronLeft className="w-8 h-8" />
            </Link>
            
            <h1 className="text-2xl font-bold">อุณหภูมิ</h1>
        </div>

        <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm text-gray-300 leading-tight">ยินดีต้อนรับ</p>
              <p className="text-sm font-bold leading-tight">{lineUser.displayName}</p>
            </div>
            
            <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-gray-200">
               <img src={lineUser.pictureUrl} alt="Profile" className="w-full h-full object-cover" />
            </div>
        </div>

      </div>

      <div className="px-4 mt-5 pb-10 space-y-4">
        
        {/* Block 1: Map Section */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            
            <div className="mb-3">
                <p className="text-[#D66D58] text-xs font-medium">May 13, 09:11pm</p>
                <h2 className="text-[#1E1E1E] text-xl font-bold leading-tight">Lam Luk Ka, TH</h2>
                <div className="flex justify-between items-end mt-1">
                    <span className="text-[#4A4A4A] text-[10px] font-semibold tracking-wide">THAILAND CURRENT TEMPERATURES</span>
                    <div className="w-3.5 h-3.5 rounded-full border border-gray-300 flex items-center justify-center text-gray-400 text-[9px] cursor-help">?</div>
                </div>
            </div>

            <div className="relative w-full h-[280px] bg-slate-100 rounded border border-gray-200 overflow-hidden mb-3 flex items-center justify-center group">
                
                <div className="text-center select-none">
                     <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                            <polygon points="3 6 9 3 15 6 21 3 21 21 15 18 9 21 3 18 3 6"></polygon>
                            <line x1="9" y1="3" x2="9" y2="21"></line>
                            <line x1="15" y1="6" x2="15" y2="18"></line>
                        </svg>
                     </div>
                     <p className="text-xs text-gray-500 font-medium">พื้นที่สำหรับ Map API</p>
                     <p className="text-[10px] text-gray-400">(Leaflet / Google Maps / AccuWeather)</p>
                </div>
                
                <div className="absolute top-2 left-2 bg-white rounded border border-gray-300 shadow-sm flex flex-col z-10">
                    <button className="w-6 h-6 flex items-center justify-center text-gray-600 hover:bg-gray-50 border-b border-gray-200 font-bold text-lg leading-none" title="Zoom In">+</button>
                    <button className="w-6 h-6 flex items-center justify-center text-gray-600 hover:bg-gray-50 font-bold text-lg leading-none" title="Zoom Out">-</button>
                </div>

                <div className="absolute bottom-8 right-2 bg-white w-7 h-7 rounded border border-gray-300 shadow-sm flex items-center justify-center z-10 cursor-pointer hover:bg-gray-50">
                     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <polyline points="9 21 3 21 3 15"></polyline>
                        <line x1="21" y1="3" x2="14" y2="10"></line>
                        <line x1="3" y1="21" x2="10" y2="14"></line>
                    </svg>
                </div>

                <div className="absolute bottom-0 left-0 right-0 flex justify-between items-end px-1 pb-0.5 pointer-events-none">
                    <span className="bg-white/70 px-1 text-[8px] text-gray-600 pointer-events-auto rounded-tr">© OpenStreetMap</span>
                    <span className="flex items-center gap-1 bg-white/70 px-1 pointer-events-auto rounded-tl">
                         <span className="text-[8px] font-bold text-gray-700">AccuWeather</span>
                    </span>
                </div>
            </div>

            <div>
                <p className="text-[10px] text-gray-500 mb-2 leading-tight">
                    All values are displayed in Celsius. Click on a point for location details.
                </p>
                
                <div className="h-1.5 w-full rounded-full bg-[linear-gradient(to_right,#4b2a4b,#5e3b78,#2a52be,#1aa89e,#69b34c,#c9a023,#cc4e23,#5c1818)] mb-1"></div>
                
                <div className="flex justify-between text-[8px] text-gray-400 font-medium px-1">
                    <span>-46°C</span>
                    <span>-29°</span>
                    <span>-12°</span>
                    <span>4°</span>
                    <span>21°</span>
                    <span>38°</span>
                    <span>54°C</span>
                </div>
            </div>
            
             <div className="mt-4 border-t border-gray-100 pt-2">
                 <h3 className="text-[#4A4A4A] text-sm font-bold">Hourly forecast</h3>
            </div>
        </div>

        {/* Block 2: Hourly Forecast */}
        <div className="mt-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 min-h-[200px]">
            <h3 className="text-[#4A4A4A] text-lg font-bold mb-4">Hourly forecast</h3>
            
            <div className="flex flex-col items-center justify-center h-[120px]">
                <div className="w-full max-w-[200px] h-20 bg-gray-50 rounded border border-dashed border-gray-200 flex items-center justify-center mb-2">
                    <span className="text-xs text-gray-400">Graph Area</span>
                </div>
                <p className="text-gray-400 text-sm font-medium">รอเชื่อมต่อ API กราฟ</p>
            </div>
        </div>

        {/* Block 3: 8-day Forecast (Header inside) */}
        <div className="mt-4 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
             <div className="p-4 pb-2">
                <h3 className="text-[#4A4A4A] text-lg font-bold">8-day forecast</h3>
             </div>
             
             <div>
                {[
                    { day: "Tue, May 13", temp: "31 / 26°C", desc: "moderate rain" },
                    { day: "Wed, May 14", temp: "34 / 26°C", desc: "moderate rain" },
                    { day: "Thu, May 15", temp: "34 / 26°C", desc: "moderate rain" },
                    { day: "Fri, May 16", temp: "35 / 27°C", desc: "light rain" },
                    { day: "Sat, May 17", temp: "35 / 28°C", desc: "overcast clouds" },
                    { day: "Sun, May 18", temp: "35 / 28°C", desc: "light rain" },
                    { day: "Mon, May 19", temp: "35 / 28°C", desc: "light rain" },
                    { day: "Tue, May 20", temp: "37 / 29°C", desc: "light rain" },
                ].map((item, index) => (
                    <div 
                        key={index} 
                        className="flex items-center justify-between p-4 border-b border-gray-50 last:border-none hover:bg-gray-50 transition-colors"
                    >
                        <div className="w-28 text-sm font-medium text-gray-600">{item.day}</div>
                        
                        <div className="flex items-center gap-4 flex-1">
                             <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                             
                             <span className="text-sm font-bold text-gray-700">{item.temp}</span>
                        </div>

                        <div className="hidden sm:block text-xs text-gray-400 text-right min-w-[100px]">
                            {item.desc}
                        </div>
                    </div>
                ))}
             </div>
        </div>

      </div>

    </div>
  );
}