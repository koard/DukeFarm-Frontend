'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { ProfileDropdownMenu } from '@/components/common/ProfileDropdownMenu';

import { fetchDiseases, Disease } from '@/services/diseaseService';


const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'แบคทีเรีย': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  'ปรสิต': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  'เชื้อรา': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  'โภชนาการ': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  'default': { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' }
};

export default function DiseaseInformationPage() {
  const router = useRouter();

  const [diseaseList, setDiseaseList] = useState<Disease[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ทั้งหมด');

  const [selectedDisease, setSelectedDisease] = useState<Disease | null>(null);

  useEffect(() => {
    const loadDiseases = async () => {
      setIsLoading(true);
      try {
        const response = await fetchDiseases({
          category: selectedCategory === 'ทั้งหมด' ? undefined : selectedCategory,
          limit: 100
        });
        setDiseaseList(response.data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!selectedDisease) {
      loadDiseases();
    }
  }, [selectedCategory, selectedDisease]);

  const handleBack = () => {
    if (selectedDisease) {
      setSelectedDisease(null);
    } else {
      router.back();
    }
  };

  const handleClose = () => {
    setSelectedDisease(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cleanDiseaseName = (name: string) => {
    if (!name) return '';
    return name.replace(/\s*\(.*?\)/g, '').trim();
  };

  const openDisease = (disease: Disease) => {
    setSelectedDisease(disease);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white pb-10 relative">

      {/* Header */}
      <header className="bg-[#093832] text-white px-4 pt-5 pb-6 rounded-b-3xl shadow-md relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={handleBack}
            className="p-1 rounded-full transition-all hover:bg-white/10 active:scale-95"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>

          <h1 className="text-2xl font-bold">
            {selectedDisease ? cleanDiseaseName(selectedDisease.name) : 'ข้อมูลโรคทั้งหมด'}
          </h1>
        </div>

        <div >
          {!selectedDisease && <ProfileDropdownMenu showGreeting={false} />}
        </div>
      </header>

      <div className="px-5 mt-8 w-full max-w-2xl mx-auto flex flex-col min-h-[calc(100vh-180px)] justify-between gap-6">

        {/* List */}
        {!selectedDisease && (
          <div className="space-y-5">
            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {['ทั้งหมด', 'แบคทีเรีย', 'ปรสิต', 'เชื้อรา', 'โภชนาการ'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${selectedCategory === cat
                    ? 'bg-[#093832] text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Disease List */}
            {isLoading ? (
              <div className="text-center py-10 text-gray-500">
                <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                กำลังโหลดข้อมูล...
              </div>
            ) : diseaseList.length === 0 ? (
              <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-xl border border-gray-100">
                <p>ไม่พบข้อมูลโรค</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {diseaseList.map((disease, index) => {
                  const colors = CATEGORY_COLORS[disease.category] || CATEGORY_COLORS['default'];
                  return (
                    <button
                      key={disease.id || index}
                      onClick={() => openDisease(disease)}
                      className={`${colors.bg} ${colors.border} border-2 p-4 rounded-2xl text-left shadow-sm hover:shadow-md transition-all hover:scale-[1.02]`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{disease.icon || '🦠'}</span>
                        <div className="flex-1">
                          <h3 className="text-[#093832] font-bold text-base leading-tight mb-1">
                            {disease.name}
                          </h3>
                          <span className={`${colors.text} text-xs font-semibold px-2 py-1 rounded-full ${colors.bg}`}>
                            {disease.category}
                          </span>
                        </div>
                        <ChevronLeft className="w-5 h-5 text-gray-400 rotate-180" />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Detail */}
        {selectedDisease && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Category Badge */}
            <div className="flex items-center justify-center gap-2">
              <span className="text-4xl">{selectedDisease.icon || '🦠'}</span>
              <span
                className={`${CATEGORY_COLORS[selectedDisease.category]?.text || 'text-gray-700'
                  } text-sm font-bold px-3 py-1.5 rounded-full ${CATEGORY_COLORS[selectedDisease.category]?.bg || 'bg-gray-100'
                  } border-2 ${CATEGORY_COLORS[selectedDisease.category]?.border || 'border-gray-200'
                  }`}
              >
                {selectedDisease.category}
              </span>
            </div>

            {/* Symptoms */}
            <div className="bg-gradient-to-br from-red-50 to-orange-50 p-5 rounded-2xl shadow-md border-2 border-red-100">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">🔴</span>
                <h3 className="font-bold text-red-900 text-lg">อาการที่พบ</h3>
              </div>
              <p className="text-gray-800 leading-relaxed whitespace-pre-line text-sm">
                {selectedDisease.symptoms}
              </p>
            </div>

            {/* Causes */}
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-5 rounded-2xl shadow-md border-2 border-amber-100">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">⚠️</span>
                <h3 className="font-bold text-amber-900 text-lg">สาเหตุ & ปัจจัยเสี่ยง</h3>
              </div>
              <p className="text-gray-800 leading-relaxed whitespace-pre-line text-sm">
                {selectedDisease.causes}
              </p>
            </div>

            {/* Treatment */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-5 rounded-2xl shadow-md border-2 border-blue-100">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">💊</span>
                <h3 className="font-bold text-blue-900 text-lg">วิธีการรักษา</h3>
              </div>
              <p className="text-gray-800 leading-relaxed whitespace-pre-line text-sm">
                {selectedDisease.treatment}
              </p>
            </div>

            {/* Prevention */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-2xl shadow-md border-2 border-green-100">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">🛡️</span>
                <h3 className="font-bold text-green-900 text-lg">การป้องกัน</h3>
              </div>
              <p className="text-gray-800 leading-relaxed whitespace-pre-line text-sm">
                {selectedDisease.prevention}
              </p>
            </div>

            {/* Warning Note */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border-2 border-purple-200">
              <div className="flex gap-3 items-start">
                <span className="text-2xl">💡</span>
                <div className="flex-1">
                  <p className="text-purple-900 text-base font-semibold mb-1">
                    คำแนะนำสำคัญ
                  </p>
                  <p className="text-purple-800 text-sm leading-relaxed">
                    หากพบอาการรุนแรงหรือไม่แน่ใจในการรักษา ควรปรึกษาสัตวแพทย์ผู้เชี่ยวชาญด้านสัตว์น้ำ
                    การใช้ยาควรเป็นไปตามคำแนะนำและขนาดที่เหมาะสม
                  </p>
                </div>
              </div>
            </div>

            {/* ปุ่มปิด */}
            <div className="pt-4 pb-4">
              <button
                type="button"
                onClick={handleClose}
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