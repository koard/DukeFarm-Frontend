'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ChevronLeft, X, Loader2, AlertCircle } from 'lucide-react';
import { ProfileDropdownMenu } from '@/components/common/ProfileDropdownMenu';
import { diseaseAnalyzerService, type SymptomCategory } from '@/services/diseaseAnalyzerService';

interface DiseaseInfoProps {
  backHref: string;
}

export const DiseaseInfo = ({ backHref }: DiseaseInfoProps) => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [symptomCategories, setSymptomCategories] = useState<SymptomCategory[]>([]);
  const [isLoadingTags, setIsLoadingTags] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [symptomInput, setSymptomInput] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [validationError, setValidationError] = useState<string | null>(null);



  useEffect(() => {
    const fetchSymptoms = async () => {
      try {
        const categories = await diseaseAnalyzerService.getSymptoms();
        setSymptomCategories(categories);
      } catch (error) {
        console.error("Failed to fetch symptoms:", error);
      } finally {
        setIsLoadingTags(false);
      }
    };
    fetchSymptoms();
  }, []);

  useEffect(() => {
    if (symptomInput || selectedTags.length > 0) {
      setValidationError(null);
    }
  }, [symptomInput, selectedTags]);

  const handleAnalyze = async () => {
    if (isAnalyzing) return;

    const hasText = symptomInput.trim().length > 0;
    const hasTags = selectedTags.length > 0;

    if (!hasText && !hasTags) {
      setValidationError("กรุณาระบุอาการ หรือ เลือกตัวเลือกด้านล่าง (จำเป็นต้องระบุอาการแม้จะมีรูปภาพ)");
      return;
    }

    setIsAnalyzing(true);
    setValidationError(null);

    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Image = e.target?.result as string;
        sessionStorage.setItem("analyzedImage", base64Image);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      sessionStorage.removeItem("analyzedImage");
    }

    try {
      const formData = new FormData();
      const rawText = symptomInput.trim();
      const textToSend = rawText === "" ? "-" : rawText;

      formData.append('symptomText', textToSend);

      if (hasTags) {
        formData.append('symptomTags', JSON.stringify(selectedTags));
      } else {
        formData.append('symptomTags', JSON.stringify([]));
      }

      if (selectedFile) {
        formData.append('photo', selectedFile);
      }

      const result = await diseaseAnalyzerService.analyzeDisease(formData);

      if (result.requestId) {
        router.push(`/disease-result?id=${result.requestId}`);
      } else {
        console.warn("No Request ID returned");
        setValidationError("ไม่ได้รับรหัสการวิเคราะห์จากระบบ กรุณาลองใหม่อีกครั้ง");
      }

    } catch (error: any) {
      console.error("Analysis failed:", error);
      setValidationError(`เกิดข้อขัดข้องในการวิเคราะห์: ${error.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleViewAll = () => router.push('/disease-information');

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
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
      setSelectedFile(null);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag],
    );
  };

  const handleBack = () => router.push(backHref);

  return (
    <div className="min-h-screen bg-white pb-10 relative">
      <header className="bg-[#093832] text-white px-4 pt-8 pb-10 rounded-b-[40px] shadow-md relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={handleBack} className="p-1 rounded-full transition-all hover:bg-white/10 active:scale-95">
            <ChevronLeft className="w-8 h-8" />
          </button>
          <h1 className="text-2xl font-bold">การรักษาโรค</h1>
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

          {/* --- Symptoms Section --- */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-base text-[#093832] font-semibold">
              อาการที่พบ
            </label>
            <textarea
              value={symptomInput}
              onChange={(e) => setSymptomInput(e.target.value)}
              placeholder="อธิบายอาการที่พบในปลา เช่น ปลามีแผล เลือดออกตามตัว ว่ายผิดปกติ"
              rows={3}
              className="w-full rounded-xl border-1 border-gray-300 px-4 py-3 text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#093832]/20 focus:border-[#093832] resize-none transition-all"
            />
          </div>

          <div className="space-y-4">
            <label className="flex items-center gap-2 text-base text-[#093832] font-semibold">
              เลือกอาการด่วน
            </label>

            {isLoadingTags ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="flex gap-2"><div className="h-8 w-20 bg-gray-200 rounded-full"></div><div className="h-8 w-24 bg-gray-200 rounded-full"></div></div>
                <div className="h-4 bg-gray-200 rounded w-1/4 mt-4"></div>
                <div className="flex gap-2"><div className="h-8 w-16 bg-gray-200 rounded-full"></div><div className="h-8 w-28 bg-gray-200 rounded-full"></div></div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-1">
                {symptomCategories.flatMap(group => group.chips).map((tag) => {
                  const active = selectedTags.includes(tag);
                  return (
                    <button
                      type="button"
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-2 rounded-full text-sm font-medium border transition-all duration-200 ease-in-out ${active
                        ? 'bg-[#BDD7FF] text-black border-black shadow-md'
                        : 'bg-white text-black border-gray-300 hover:border-blue-400 hover:shadow-sm'
                        }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-2 text-base text-[#093832] font-semibold">
              รูปภาพประกอบ (ถ้ามี)
            </label>
            <div className="w-full">
              <label
                htmlFor="disease-image-input"
                className="block w-full text-center py-4 rounded-xl text-base font-bold text-white bg-blue-500 shadow-md hover:shadow-lg hover:from-blue-600 hover:to-indigo-600 cursor-pointer transition-all active:scale-95"
              >
                <div className="flex items-center justify-center gap-2">
                  <span>📷 ถ่ายรูป / อัปโหลดรูปปลา</span>
                </div>
              </label>

              <input
                ref={fileInputRef}
                id="disease-image-input"
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageChange}
                className="hidden"
              />

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
            {validationError && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm animate-pulse">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>{validationError}</p>
              </div>
            )}

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
              disabled={isAnalyzing}
              className={`w-full py-4 rounded-xl text-lg font-bold text-white shadow-md transition-all flex items-center justify-center gap-2
                ${isAnalyzing
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-[#009D64] hover:shadow-lg hover:from-emerald-600 hover:to-green-700 active:scale-95'
                }`}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="animate-spin w-6 h-6" />
                  กำลังประมวลผล...
                </>
              ) : (
                "เริ่มการวิเคราะห์"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};