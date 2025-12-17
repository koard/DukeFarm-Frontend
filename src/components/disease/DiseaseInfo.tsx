'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { ProfileDropdownMenu } from '@/components/common/ProfileDropdownMenu';

import { fetchDiseases } from '@/services/diseaseService';
import { Disease } from '@/types/disease';

interface DiseaseInfoProps {
  backHref: string; 
}

type ViewMode = 'form' | 'list' | 'detail';

const SYMPTOM_TAGS = [
  'หัวโต', 'ตัวลีบ', 'ครีบเหลือง', 'ตาลึก', 'ตกใจง่าย',
  'จุดขาว', 'แผลเลือดออก', 'ตาโปน', 'ครีบเน่า', 'ผิวหนังมัว'
];

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'แบคทีเรีย': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  'ปรสิต': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  'เชื้อรา': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  'โภชนาการ': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  'สิ่งแวดล้อม': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  'default': { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' }
};

export const DiseaseInfo = ({ backHref }: DiseaseInfoProps) => {
  const router = useRouter();
  const [mode, setMode] = useState<ViewMode>('form');
  
  const [diseaseList, setDiseaseList] = useState<Disease[]>([]);
  const [selectedDisease, setSelectedDisease] = useState<Disease | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [symptomInput, setSymptomInput] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('ทั้งหมด');

  useEffect(() => {
    if (mode === 'list') {
      loadDiseases(undefined, selectedCategory);
    }
  }, [mode, selectedCategory]);

  const loadDiseases = async (symptoms?: string, category?: string) => {
    setIsLoading(true);
    try {
      const response = await fetchDiseases({ 
        symptoms: symptoms || undefined,
        category: category === 'ทั้งหมด' ? undefined : category,
        limit: 100 
      });
      setDiseaseList(response.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyze = () => {
    const allSymptoms = [
      symptomInput,
      ...selectedTags
    ].filter(Boolean).join(',');

    setMode('list');
    setSelectedCategory('ทั้งหมด');
    loadDiseases(allSymptoms, undefined);
  };

  const handleViewAll = () => {
    setMode('list');
    setSymptomInput('');
    setSelectedTags([]);
    setSelectedCategory('ทั้งหมด');
    loadDiseases();
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setImagePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return objectUrl;
    });
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag],
    );
  };

  const handleBack = () => {
    if (mode === 'detail') {
      setSelectedDisease(null);
      setMode('list');
      return;
    }
    if (mode === 'list') {
      setSymptomInput('');
      setSelectedTags([]);
      setMode('form');
      return;
    }
    router.push(backHref);
  };
  
  const handleClose = () => {
    router.push(backHref);
  };

  const openDisease = (disease: Disease) => {
    setSelectedDisease(disease);
    setMode('detail');
  };

  return (
    <div className="min-h-screen bg-white pb-10 relative">
      
      {/* Header */}
      <header className="bg-[#093832] text-white px-4 pt-8 pb-10 rounded-b-[40px] shadow-md relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={handleBack}
            className="p-1 rounded-full transition-all hover:bg-white/10 active:scale-95"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <h1 className="text-2xl font-bold">
            {selectedDisease ? selectedDisease.name : 'ข้อมูลการรักษาโรค'}
          </h1>
        </div>
        <ProfileDropdownMenu />
      </header>

      <div className="px-5 mt-8 w-full max-w-2xl mx-auto flex flex-col min-h-[calc(100vh-180px)] justify-between gap-6">
        
        {/* --- FORM MODE --- */}
        {mode === 'form' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-5 rounded-2xl border-2 border-cyan-500 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="text-3xl">🩺</span>
                <div>
                  <h3 className="text-[#093832] font-bold text-base mb-1">ตรวจสอบอาการปลา</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    บันทึกอาการที่พบเพื่อช่วยในการวินิจฉัยโรค
                    หรือเลือกดูข้อมูลโรคทั้งหมดได้ด้านล่าง
                  </p>
                </div>
              </div>
            </div>

            {/* Symptom Input */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-base text-[#093832] font-semibold">
                อาการที่พบ
              </label>
              <textarea
                value={symptomInput}
                onChange={(e) => setSymptomInput(e.target.value)}
                placeholder="อธิบายอาการที่พบในปลา เช่น มีแผล, ว่ายผิดปกติ, ไม่กินอาหาร..."
                rows={3}
                className="w-full rounded-xl border-1 border-gray-300 px-4 py-3 text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black resize-none"
              />
            </div>

            {/* Tags */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-base text-[#093832] font-semibold">
                เลือกอาการด่วน
              </label>
              <div className="flex flex-wrap gap-2">
                {SYMPTOM_TAGS.map((tag) => {
                  const active = selectedTags.includes(tag);
                  return (
                    <button
                      type="button"
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-4 py-2 rounded-full text-sm font-semibold border-1 transition-all ${
                        active
                          ? 'bg-[#BDD7FF] text-black border-black shadow-md scale-105'
                          : 'bg-white text-black border-gray-300 hover:border-black hover:shadow-sm'
                      }`}
                    >
                      {active && '✓ '}
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-base text-[#093832] font-semibold">
                รูปภาพประกอบ
              </label>
              <div className="w-full">
                <label
                  htmlFor="disease-image-input"
                  className="block w-full text-center py-4 rounded-xl text-base font-bold text-white bg-blue-500  shadow-md hover:shadow-lg hover:from-blue-600 hover:to-indigo-600 cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-center gap-2">
                    <span>ถ่ายรูป / อัปโหลดรูปปลา</span>
                  </div>
                </label>
                <input
                  id="disease-image-input"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageChange}
                  className="hidden"
                />
                {imagePreview && (
                  <div className="mt-4 rounded-2xl border-2 border-[#093832] overflow-hidden shadow-lg">
                    <Image
                      src={imagePreview}
                      alt="รูปปลาที่อัปโหลด"
                      width={800}
                      height={600}
                      className="w-full h-64 object-cover"
                    />
                    <div className="bg-emerald-50 p-2 text-center">
                      <p className="text-emerald-700 text-sm font-semibold">✓ อัปโหลดสำเร็จ</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-auto pt-4 space-y-3">
              <button
                type="button"
                onClick={handleViewAll}
                className="w-full py-4 rounded-xl text-lg font-bold text-[#093832] bg-white border border-[#093832] shadow-sm hover:shadow-md transition-all active:scale-95"
              >
                ดูข้อมูลโรคทั้งหมด
              </button>

              <button
                type="button"
                onClick={handleAnalyze}
                className="w-full py-4 rounded-xl text-lg font-bold text-white bg-[#009D64] shadow-md hover:shadow-lg hover:from-emerald-600 hover:to-green-700 transition-all active:scale-95"
              >
                วิเคราะห์ข้อมูลโรค
              </button>
            </div>
          </div>
        )}

        {/* --- LIST MODE --- */}
        {mode === 'list' && (
          <div className="space-y-5">
            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {['ทั้งหมด', 'แบคทีเรีย', 'ปรสิต', 'เชื้อรา', 'โภชนาการ', 'สิ่งแวดล้อม'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === cat
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
                <p>ไม่พบข้อมูลโรคที่ตรงกับเงื่อนไข</p>
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

        {/* --- DETAIL MODE --- */}
        {mode === 'detail' && selectedDisease && (
          <div className="space-y-4">
            {/* Category Badge */}
            <div className="flex items-center justify-center gap-2">
              <span className="text-4xl">{selectedDisease.icon || '🦠'}</span>
              <span
                className={`${
                  CATEGORY_COLORS[selectedDisease.category]?.text || 'text-gray-700'
                } text-sm font-bold px-3 py-1.5 rounded-full ${
                  CATEGORY_COLORS[selectedDisease.category]?.bg || 'bg-gray-100'
                } border-2 ${
                  CATEGORY_COLORS[selectedDisease.category]?.border || 'border-gray-200'
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

            {/* --- ปุ่มปิด (กลับ Dashboard) --- */}
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
};