"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Loader2, AlertCircle, ImageIcon, Activity, Trophy } from "lucide-react";
import Image from "next/image";
import { ProfileDropdownMenu } from "@/components/common/ProfileDropdownMenu"; 
import { diseaseAnalyzerService, AnalyzeResult } from "@/services/diseaseAnalyzerService";

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'แบคทีเรีย': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  'ปรสิต': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  'เชื้อรา': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  'โภชนาการ': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  'สิ่งแวดล้อม': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  'default': { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' }
};

export default function DiseaseResultPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestId = searchParams.get("id");

  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDisease, setSelectedDisease] = useState<any | null>(null);

  const [userUploadedImage, setUserUploadedImage] = useState<string | null>(null);

  useEffect(() => {
    const storedImage = sessionStorage.getItem("analyzedImage");
    if (storedImage) {
      setUserUploadedImage(storedImage);
    }
  }, []);

  useEffect(() => {
    if (!requestId) {
      setError("ไม่พบรหัสการวิเคราะห์ (Request ID)");
      setLoading(false);
      return;
    }

    const fetchResult = async () => {
      try {
        const data = await diseaseAnalyzerService.getAnalysisResult(requestId);
        setResult(data);
      } catch (err) {
        setError("ไม่สามารถดึงผลการวิเคราะห์ได้ กรุณาลองใหม่อีกครั้ง");
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [requestId]);

  useEffect(() => {
    if (selectedDisease) {
      window.scrollTo(0, 0);
    }
  }, [selectedDisease]);

  const handleBackToMain = () => {
    sessionStorage.removeItem("analyzedImage");
    router.back(); 
  };

  const handleBack = () => {
    if (selectedDisease) {
      setSelectedDisease(null);
      window.scrollTo(0, 0);
    } else {
      handleBackToMain();
    }
  };

  const handleSelectDisease = (item: any) => {
    setSelectedDisease(item);
  };

  const handleNavigateDisease = (direction: 'next' | 'prev') => {
    if (!result || !selectedDisease) return;
    
    const currentIndex = result.results.findIndex(r => r.diseaseId === selectedDisease.diseaseId);
    if (currentIndex === -1) return;

    let newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;

    if (newIndex >= 0 && newIndex < result.results.length) {
      setSelectedDisease(result.results[newIndex]);
      window.scrollTo(0, 0);
    }
  };

  const getImageUrl = (path: string | null | undefined) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://dukefarm-backend.onrender.com/api';
    const baseUrl = apiUrl.endsWith('/api') ? apiUrl.replace('/api', '') : apiUrl;
    return `${baseUrl}${path}`;
  };

  const cleanDiseaseName = (name: string) => {
    if (!name) return '';
    return name.replace(/\s*\(.*?\)/g, '').trim(); 
  };

  const getCurrentIndex = () => {
    if (!result || !selectedDisease) return -1;
    return result.results.findIndex(r => r.diseaseId === selectedDisease.diseaseId);
  };
  const currentIndex = getCurrentIndex();
  const totalResults = result?.results.length || 0;

  return (
    <div className="min-h-screen bg-white pb-10 relative">
      
      {/* Header */}
      <header className="bg-[#093832] text-white px-4 pt-8 pb-10 rounded-b-[40px] shadow-md relative z-30 flex items-center justify-between">
        <div className="flex items-center gap-2 max-w-[80%]">
          <button
            onClick={handleBack}
            className="p-1 rounded-full transition-all hover:bg-white/10 active:scale-95 shrink-0"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <h1 className="text-2xl font-bold truncate">
            {selectedDisease ? cleanDiseaseName(selectedDisease.name) : 'ผลการวิเคราะห์'}
          </h1>
        </div>
        <ProfileDropdownMenu />
      </header>

      <div className="px-5 mt-8 w-full max-w-2xl mx-auto space-y-6">
        
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <Loader2 className="w-12 h-12 animate-spin text-[#009D64] mb-4" />
            <p>กำลังประมวลผลข้อมูล...</p>
          </div>
        )}

        {!loading && error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-2" />
            <p className="text-red-700 font-semibold">{error}</p>
            <button onClick={handleBackToMain} className="mt-4 px-6 py-2 bg-red-100 text-red-700 rounded-full font-bold">
              กลับไปลองใหม่
            </button>
          </div>
        )}

          {!loading && result && !selectedDisease && (
            <>
              {(() => {
                const hasImage = !!(userUploadedImage || result.photoPath);
                const hasText = !!(result.symptomText && result.symptomText.trim() !== '');
                const hasTags = !!(result.symptomTags && result.symptomTags.length > 0);
                const hasContent = hasText || hasTags; 

                if (!hasImage && !hasContent) return null;

                return (
                  <div className="bg-white rounded-[32px] shadow-[0_10px_40px_rgba(0,0,0,0.05)] border border-gray-300 overflow-hidden mb-10">
                  
                    {hasImage && (
                      <div className="w-full bg-gray-50/30 border-b border-gray-100 p-6 flex items-center justify-center">
                        <div className="relative w-full max-w-sm aspect-[4/3] shadow-lg rounded-2xl overflow-hidden border-4 border-white ring-1 ring-gray-100">
                          <Image 
                            src={userUploadedImage || getImageUrl(result.photoPath)} 
                            alt="รูปภาพอาการ"
                            fill
                            className="object-cover hover:scale-105 transition-transform duration-700"
                          />
                        </div>
                      </div>
                    )}

                    {hasContent && (
                      <div className="p-6 md:p-8">
                        
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-full bg-emerald-100 text-[#009D64] flex items-center justify-center">
                             <Activity className="w-5 h-5" />
                          </div>
                          <h3 className="text-xl font-bold text-[#093832]">
                            อาการที่คุณระบุ
                          </h3>
                        </div>

                        {hasText && (
                          <div className={hasTags ? "mb-6" : "mb-0"}> 
                            <div className="bg-[#F0FDF4] border border-emerald-100 rounded-2xl p-5 w-full">
                              <p className="text-[#093832] text-lg leading-relaxed font-medium">
                                {result.symptomText}
                              </p>
                            </div>
                          </div>
                        )}

                        {hasTags && (
                          <div className={hasText ? "pt-4 border-t border-gray-100" : ""}>
                            <span className="text-sm font-bold text-gray-400 mb-3 block">Tags ที่เกี่ยวข้อง:</span>
                            <div className="flex flex-wrap gap-2">
                              {result.symptomTags!.map((tag, i) => (
                                <span key={i} className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold bg-[#F0FDF4] border border-emerald-100 text-[#166534]">
                                  # {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                      </div>
                    )}
                  </div>
                );
              })()}

            {/* List Result */}
            <div>
              <h2 className="text-lg font-bold text-[#093832] mb-4 flex items-center gap-2">
                  🏆 ผลการวินิจฉัย
              </h2>
                
              <div className="space-y-4">
                  {result.results.map((item, index) => {
                  const colors = CATEGORY_COLORS[item.category] || CATEGORY_COLORS['default'];
                  const isTopOne = index === 0;
    
                  return (
                      <button
                      key={index}
                        onClick={() => handleSelectDisease(item)}
                        className={`w-full text-left p-4 rounded-2xl border-2 transition-all relative overflow-hidden
                          ${colors.bg} ${colors.border}
                          ${isTopOne ? 'border-yellow-400 shadow-md scale-[1.02] z-10' : 'shadow-sm hover:scale-[1.01]'}
                      `}
                        >
                          {/* % Badge */}
                          <div className={`absolute top-0 right-0 px-3 py-1 rounded-bl-xl text-xs font-bold
                          ${item.score >= 0.8 ? 'bg-[#009D64] text-white' : 'bg-yellow-400 text-yellow-900'}`}>
                               {(item.score * 100).toFixed(0)}%
                          </div>
    
                          <div className="flex items-start gap-3">
                              {/* เลขอันดับ */}
                              <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold shrink-0 mt-1
                               ${isTopOne ? 'bg-yellow-400 text-yellow-950 shadow-sm' : 'bg-white/80 text-gray-500'}`}>
                                   {index + 1}
                              </div>
    
                               <div className="flex-1 pr-10">
                                   <div className="flex items-center gap-2 mb-1">
                                       <span className="text-3xl shrink-0">{item.icon}</span>
                                       <h3 className={`font-bold text-[#093832] leading-tight ${isTopOne ? 'text-lg' : 'text-base'}`}>
                                            {item.name}
                                       </h3>
                                  </div>
                                   
                                  <div className="mb-2">
                                       <span className={`${colors.text} text-xs font-bold px-2 py-0.5 rounded-full bg-white/60 inline-block`}>
                                          {item.category}
                                       </span>
                                  </div>
    
                                  {item.treatmentSummary && (
                                      <p className="text-sm text-gray-600 bg-white/50 p-3 rounded-xl leading-relaxed border border-gray-100/50">
                                          💡 {item.treatmentSummary}
                                      </p>
                                  )}
                                   
                                  <p className="text-sm text-[#093832] font-bold mt-3 flex items-center gap-1 opacity-90">
                                       แตะเพื่อดูรายละเอียด <ChevronLeft className="w-4 h-4 rotate-180" />
                                  </p>
                              </div>
                          </div>
                      </button>
                  );
                  })}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleBackToMain}
                className="w-full py-4 rounded-xl text-lg font-bold text-white bg-gradient-to-r from-emerald-500 to-green-600 shadow-md hover:shadow-lg transition-all active:scale-95"
              >
                ตรวจสอบอาการใหม่อีกครั้ง
              </button>
            </div>
          </>
        )}

        {/* Modal รายละเอียด */}
        {!loading && selectedDisease && (
           <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
             
             <div className="flex flex-col items-center justify-center py-2">
               <span className="text-6xl mb-3 shadow-sm bg-gray-50 rounded-full p-4 border border-gray-100">
                 {selectedDisease.icon}
               </span>
               
               <div className="flex items-center gap-3">
                 {selectedDisease.rank === 1 ? (
                   <span className="bg-yellow-400 text-yellow-950 text-sm font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                      <Trophy className="w-3 h-3" />
                      อันดับ {selectedDisease.rank || '-'}
                   </span>
                 ) : (
                   <span className="bg-gray-100 text-gray-500 text-sm font-bold px-3 py-1 rounded-full flex items-center gap-1 border border-gray-200">
                      อันดับ {selectedDisease.rank || '-'}
                   </span>
                 )}

                 <span className={`text-sm font-bold px-3 py-1 rounded-full border ${
                    CATEGORY_COLORS[selectedDisease.category]?.bg || 'bg-gray-100'
                  } ${CATEGORY_COLORS[selectedDisease.category]?.text} ${CATEGORY_COLORS[selectedDisease.category]?.border}`}>
                  {selectedDisease.category}
                 </span>
               </div>
             </div>

             {/* เนื้อหา */}
             <div className="bg-gradient-to-br from-red-50 to-orange-50 p-5 rounded-2xl shadow-md border-2 border-red-100">
               <div className="flex items-center gap-2 mb-3">
                 <span className="text-xl">🔴</span>
                 <h3 className="font-bold text-red-900 text-lg">อาการที่พบ</h3>
               </div>
               <p className="text-gray-800 leading-relaxed whitespace-pre-line text-sm">
                 {selectedDisease.symptoms || "ไม่มีข้อมูล"}
               </p>
             </div>

             <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-5 rounded-2xl shadow-md border-2 border-amber-100">
               <div className="flex items-center gap-2 mb-3">
                 <span className="text-xl">⚠️</span>
                 <h3 className="font-bold text-amber-900 text-lg">สาเหตุ & ปัจจัยเสี่ยง</h3>
               </div>
               <p className="text-gray-800 leading-relaxed whitespace-pre-line text-sm">
                 {selectedDisease.causes || "ไม่มีข้อมูล"}
               </p>
             </div>

             <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-5 rounded-2xl shadow-md border-2 border-blue-100">
               <div className="flex items-center gap-2 mb-3">
                 <span className="text-xl">💊</span>
                 <h3 className="font-bold text-blue-900 text-lg">วิธีการรักษา</h3>
               </div>
               <p className="text-gray-800 leading-relaxed whitespace-pre-line text-sm">
                 {selectedDisease.treatment || "ไม่มีข้อมูล"}
               </p>
             </div>

             <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-2xl shadow-md border-2 border-green-100">
               <div className="flex items-center gap-2 mb-3">
                 <span className="text-xl">🛡️</span>
                 <h3 className="font-bold text-green-900 text-lg">การป้องกัน</h3>
               </div>
               <p className="text-gray-800 leading-relaxed whitespace-pre-line text-sm">
                 {selectedDisease.prevention || "ไม่มีข้อมูล"}
               </p>
             </div>

             {/* ปุ่ม Navigation */}
             <div className="grid grid-cols-2 gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => handleNavigateDisease('prev')}
                  disabled={currentIndex <= 0}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl border font-bold transition-all
                    ${currentIndex <= 0 
                       ? 'border-gray-100 text-gray-300 bg-gray-50 cursor-not-allowed' 
                       : 'border-gray-300 text-gray-600 bg-white hover:bg-gray-50 active:scale-95 shadow-sm'
                    }`}
                >
                  <ChevronLeft className="w-5 h-5" /> โรคก่อนหน้า
                </button>

                <button
                  type="button"
                  onClick={() => handleNavigateDisease('next')}
                  disabled={currentIndex >= totalResults - 1}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl border font-bold transition-all
                    ${currentIndex >= totalResults - 1
                       ? 'border-gray-100 text-gray-300 bg-gray-50 cursor-not-allowed' 
                       : 'border-[#093832] text-white bg-[#093832] hover:bg-[#072d28] active:scale-95 shadow-md'
                    }`}
                >
                  โรคถัดไป <ChevronRight className="w-5 h-5" />
                </button>
             </div>

             <div className="pb-6">
               <button
                 type="button"
                 onClick={handleBack}
                 className="w-full py-4 rounded-xl border-2 border-[#EF6E11] text-[#EF6E11] text-lg font-bold bg-white hover:bg-orange-50 transition-all active:scale-95 shadow-sm"
               >
                 ปิด
               </button>
             </div>
           </div>
        )}
      </div>
    </div>
  );
}