'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ChevronLeft, X } from 'lucide-react';
import { ProfileDropdownMenu } from '@/components/common/ProfileDropdownMenu';

interface DiseaseInfoProps {
  backHref: string;
}

const SYMPTOM_TAGS = [
  'หัวโต', 'ตัวลีบ', 'ครีบเหลือง', 'ตาลึก', 'ตกใจง่าย',
  'จุดขาว', 'แผลเลือดออก', 'ตาโปน', 'ครีบเน่า', 'ผิวหนังมัว'
];

export const DiseaseInfo = ({ backHref }: DiseaseInfoProps) => {
  const router = useRouter();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [symptomInput, setSymptomInput] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleAnalyze = () => {
    const allSymptoms = [
      symptomInput,
      ...selectedTags
    ].filter(Boolean).join(',');

    router.push(`/disease-result?symptoms=${encodeURIComponent(allSymptoms)}`);
  };

  const handleViewAll = () => {
    router.push('/disease-information');
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

  const handleRemoveImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag],
    );
  };

  const handleBack = () => {
    router.push(backHref);
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
            ตรวจสอบอาการ
          </h1>
        </div>
        <ProfileDropdownMenu />
      </header>

      <div className="px-5 mt-8 w-full max-w-2xl mx-auto flex flex-col min-h-[calc(100vh-180px)] justify-between gap-6">

        {/* --- Form Section --- */}
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
                    className={`px-4 py-2 rounded-full text-sm font-semibold border-1 transition-all ${active
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
              {!imagePreview && (
                <label
                  htmlFor="disease-image-input"
                  className="block w-full text-center py-4 rounded-xl text-base font-bold text-white bg-blue-500 shadow-md hover:shadow-lg hover:from-blue-600 hover:to-indigo-600 cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-center gap-2">
                    <span>ถ่ายรูป / อัปโหลดรูปปลา</span>
                  </div>
                </label>
              )}

              <input
                ref={fileInputRef}
                id="disease-image-input"
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageChange}
                className="hidden"
              />

              {/* ส่วนแสดง Preview */}
              {imagePreview && (
                <div className="mt-4 relative rounded-2xl border-2 border-[#093832] overflow-hidden shadow-lg group">

                  <button
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 z-10 bg-red-500 text-white p-1.5 rounded-full shadow-md hover:bg-red-600 transition-all active:scale-95"
                    title="ลบรูปภาพ"
                  >
                    <X className="w-5 h-5" />
                  </button>

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

      </div>
    </div>
  );
};