'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ExternalLink } from 'lucide-react';
import { ProfileDropdownMenu } from '@/components/common/ProfileDropdownMenu';

const MARKETS = [
  {
    id: 'talaadthai',
    name: 'ตลาดไท',
    url: 'https://talaadthai.com/search/%E0%B8%9B%E0%B8%A5%E0%B8%B2%E0%B8%94%E0%B8%B8%E0%B8%81%E0%B9%80%E0%B8%A5%E0%B8%B5%E0%B9%89%E0%B8%A2%E0%B8%87',
    color: 'bg-[#00A550]',
    logo: '/dashboard/Talat Thai.png'
  },
  {
    id: 'simummuang',
    name: 'สี่มุมเมือง',
    url: 'https://www.simummuangonline.com/search?searchtype=all&search=%E0%B8%9B%E0%B8%A5%E0%B8%B2%E0%B8%94%E0%B8%B8%E0%B8%81',
    color: 'bg-[#B02427]',
    logo: '/dashboard/Si mum mueang.png'
  },
  {
    id: 'freshket',
    name: 'Freshket',
    url: 'https://freshket.co/search?q=%E0%B8%9B%E0%B8%A5%E0%B8%B2%E0%B8%94%E0%B8%B8%E0%B8%81',
    color: 'bg-black',
    logo: '/dashboard/Freshket.png',
  },
  {
    id: 'yingcharoen',
    name: 'ตลาดยิ่งเจริญ',
    url: 'https://songsod.com/search/%E0%B8%9B%E0%B8%A5%E0%B8%B2%E0%B8%94%E0%B8%B8%E0%B8%81',
    color: 'bg-[#182A4E]',
    logo: '/dashboard/Song Sot.png'
  }
];

interface MarketPriceViewProps {
  backHref: string;
}

export const MarketPriceView = ({ backHref }: MarketPriceViewProps) => {
  const [selectedMarket, setSelectedMarket] = useState<typeof MARKETS[0] | null>(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  const handleSelectMarket = (market: typeof MARKETS[0]) => {
    setSelectedMarket(market);
    setIframeLoaded(false);
  };

  const handleBackToList = () => {
    setSelectedMarket(null);
  };

  return (
    <div className="min-h-screen bg-white pb-10">

      {/*Header*/}
      <div className="bg-[#093832] text-white px-4 pt-5 pb-4 rounded-b-3xl shadow-md relative z-30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {selectedMarket ? (
            <button onClick={handleBackToList} className="p-1 hover:bg-white/10 rounded-full transition-colors">
              <ChevronLeft className="w-8 h-8" />
            </button>
          ) : (
            <Link href={backHref} className="p-1 hover:bg-white/10 rounded-full transition-colors">
              <ChevronLeft className="w-8 h-8" />
            </Link>
          )}
          <h1 className="text-2xl font-bold">
            {selectedMarket ? selectedMarket.name : 'ตรวจสอบราคาตลาด'}
          </h1>
        </div>

        <ProfileDropdownMenu showGreeting={false} />
      </div>

      <div className="px-6 mt-6 w-full max-w-5xl mx-auto space-y-4">

        {/* --- Grid View --- */}
        {!selectedMarket && (
          <>
            <h2 className="text-lg font-bold text-black mb-6">
              เว็บไซต์ตรวจสอบราคา
            </h2>

            <div className="grid grid-cols-2 gap-x-4 gap-y-6">
              {MARKETS.map((market) => (
                <div key={market.id} className="flex flex-col items-center gap-2">

                  <button
                    onClick={() => handleSelectMarket(market)}
                    className={`
                      ${market.color} 
                      w-full aspect-[4/3] rounded-3xl shadow-md hover:shadow-xl hover:scale-[1.02] transition-all 
                      flex items-center justify-center p-6 relative overflow-hidden
                    `}
                  >
                    <div className="relative w-full h-full flex items-center justify-center">
                      <img
                        src={market.logo}
                        alt={market.name}
                        className="w-full h-full object-contain drop-shadow-md"
                      />
                    </div>
                  </button>

                  <span className="text-gray-900 font-medium text-lg">
                    {market.name}
                  </span>

                </div>
              ))}
            </div>
          </>
        )}

        {selectedMarket && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="bg-[#E8F3ED] border border-emerald-100 rounded-2xl p-4 shadow-sm mb-4">
              <p className="text-sm text-[#0B3C32]">
                กำลังแสดงผลจาก <strong>{selectedMarket.name}</strong>
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                <a
                  href={selectedMarket.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200 text-[#0B3C32] font-semibold text-xs shadow-sm hover:bg-gray-50"
                >
                  เปิดในเว็บไซต์จริง <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="relative rounded-3xl border border-gray-200 overflow-hidden shadow-lg bg-white min-h-[70vh]">
              {!iframeLoaded && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-500 text-sm bg-white/80 z-10">
                  <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
                  กำลังโหลดข้อมูล...
                </div>
              )}
              <iframe
                src={selectedMarket.url}
                className="w-full h-[75vh]"
                loading="lazy"
                title={`ราคา ${selectedMarket.name}`}
                onLoad={() => setIframeLoaded(true)}
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              />
            </div>
          </div>
        )}

      </div>
    </div>
  );
};