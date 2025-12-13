'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Check, ChevronDown, ChevronLeft, X, Plus } from 'lucide-react';
import { useLineUser } from '@/hooks/useLineUser';

const API_BASE_URL = 'https://dukefarm-backend.onrender.com/api';

const AGE_OPTIONS = [
  '0–15 วัน (ระยะลูกปลา)',
  '16–30 วัน (ลูกปลาขนาดกลาง)',
  '31–60 วัน (ปลาขุนระยะต้น)',
  '61–90 วัน (ปลาขุนระยะกลาง)',
  '91–120 วัน (ปลาขุนระยะสุดท้าย)',
  '>120 วัน (ขนาดตลาด)',
];

const DISEASE_LIST = [
    'โรคลำไส้อักเสบปลาดุก',
    'โรคแผลเลือดออก/แบคทีเรียแกรมลบ',
    'โรคตัวด่าง/ตัวลาย',
    'โรคสเตรปโตค็อกคัส/ติดเชื้อสมอง',
    'โรคไวรัสทำลายสมองลูกปลา',
    'โรคจุดขาว/ไอค์',
    'เห็บปลา/หนอนสมอ',
    'โปรโตซัวผิวหนัง/เหงือก',
    'พยาธิหนอนลำไส้',
    'โรครา/เชื้อราผิวหนังปลา',
    'โรคแผลเน่ารุนแรง',
    'โรคดีซ่านปลา/ตับอักเสบ',
    'ปลาขาดสารอาหาร',
    'อาการเครียดปลาดุก',
];

const POND_TYPE_OPTIONS = ['บ่อดิน', 'บ่อปูน'];

const formatInputDate = (value: Date) => {
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, '0');
  const day = `${value.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatInputTime = (value: Date) => {
  const hours = `${value.getHours()}`.padStart(2, '0');
  const minutes = `${value.getMinutes()}`.padStart(2, '0');
  return `${hours}:${minutes}`;
};

const getDisplayAge = (fullString: string) => fullString.split(' (')[0] ?? fullString;

const getIsoDateFromString = (value: string): string => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString();
  }
  return parsed.toISOString();
};

const safeNumber = (value: number | null | undefined, suffix: string) => {
  if (value === null || value === undefined) {
    return '--';
  }
  return `${Math.round(value * 10) / 10}${suffix}`;
};

export type WeatherSnapshot = {
  observedAt: string | null;
  temperatureC: number | null;
  rainMm: number | null;
  humidityPct: number | null;
  conditionText: string | null;
  weatherCode: number | null;
};

export type FormStateResponse = {
  currentDateTime: string;
  farmType: string;
  locationAvailable: boolean;
  weather: WeatherSnapshot | null;
};

export type RecordEntryFormProps = {
  farmType: 'NURSERY_LARGE' | 'GROWOUT' | 'NURSERY_SMALL';
  backHref: string;
};

export const RecordEntryForm = ({ farmType, backHref }: RecordEntryFormProps) => {
  const router = useRouter();
  const lineUser = useLineUser();
  const now = useMemo(() => new Date(), []);

  const [selectedAge, setSelectedAge] = useState('');
  const [selectedPondType, setSelectedPondType] = useState('');
  const [pondCount, setPondCount] = useState('');
  const [fishCount, setFishCount] = useState('');
  const [foodAmount, setFoodAmount] = useState('');
  const [otherDisease, setOtherDisease] = useState('');
  const [isAgeOpen, setIsAgeOpen] = useState(false);
  const [isPondTypeOpen, setIsPondTypeOpen] = useState(false);
  const [recordDate, setRecordDate] = useState(() => formatInputDate(now));
  const [recordTime, setRecordTime] = useState(() => formatInputTime(now));
  const [weatherSnapshot, setWeatherSnapshot] = useState<WeatherSnapshot | null>(null);
  const [locationAvailable, setLocationAvailable] = useState(true);
  const [formSeedLoading, setFormSeedLoading] = useState(true);
  const [formSeedError, setFormSeedError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isAnalysisView, setIsAnalysisView] = useState(false);
  const [selectedDiseases, setSelectedDiseases] = useState<string[]>([]);

  // Image State
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchFormState = async () => {
      setFormSeedLoading(true);
      setFormSeedError(null);
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          router.push('/login');
          return;
        }

        const response = await fetch(
          `${API_BASE_URL}/records/form-state?farmType=${farmType}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
           if (response.status === 401) {
             router.push('/login');
             return;
           }
           console.log("API Fetch failed");
           setFormSeedLoading(false);
           return; 
        }

        const payload: { data: FormStateResponse } = await response.json();
        if (!isMounted) return;

        const iso = getIsoDateFromString(payload.data.currentDateTime);
        const hydrated = new Date(iso);
        setRecordDate(formatInputDate(hydrated));
        setRecordTime(formatInputTime(hydrated));
        setWeatherSnapshot(payload.data.weather ?? null);
        setLocationAvailable(payload.data.locationAvailable);
      } catch (error) {
        if (!isMounted) return;
        console.error(error);
      } finally {
        if (isMounted) setFormSeedLoading(false);
      }
    };

    fetchFormState();

    return () => { isMounted = false; };
  }, [farmType, router]);

  const handleNumericInput = (value: string, setter: (val: string) => void) => {
    if (/^\d*\.?\d*$/.test(value)) {
      setter(value);
    }
  };

  const isFormValid = Boolean(
    selectedAge &&
    selectedPondType &&
    pondCount &&
    fishCount &&
    foodAmount
  );

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newImages = Array.from(event.target.files).map(file => URL.createObjectURL(file));
      setUploadedImages(prev => [...prev, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const toggleDisease = (disease: string) => {
    setSelectedDiseases(prev => 
        prev.includes(disease) 
        ? prev.filter(d => d !== disease) 
        : [...prev, disease]
    );
  };

  const handleSubmit = async () => {
    if (!isFormValid || submitting) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }

      const allDiseases = [...selectedDiseases];
      if (otherDisease.trim()) {
        allDiseases.push(otherDisease.trim());
      }

      const response = await fetch(`${API_BASE_URL}/records`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            farmType,
            recordDate,
            recordTime,
            recordedAt: new Date(`${recordDate}T${recordTime}`).toISOString(), 
            age: selectedAge,
            pondType: selectedPondType,
            pondCount: Number(pondCount),
            fishCount: Number(fishCount),
            foodAmount: Number(foodAmount),
            diseases: allDiseases,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
             router.push('/login');
             return;
        }
        throw new Error('บันทึกข้อมูลไม่สำเร็จ');
      }

      setIsAnalysisView(true);

    } catch (error) {
      console.error(error);
      setSubmitMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' });
    } finally {
      setSubmitting(false);
    }
  };

  if (isAnalysisView) {
      return (
        <div className="min-h-screen bg-white pb-10 relative">
            <div className="bg-[#093832] text-white px-4 pt-8 pb-10 rounded-b-[40px] shadow-md relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <button onClick={() => setIsAnalysisView(false)} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                        <ChevronLeft className="w-8 h-8" />
                    </button>
                    <h1 className="text-2xl font-bold">ผลวิเคราะห์</h1>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <p className="text-sm text-gray-300">ยินดีต้อนรับ</p>
                        <p className="text-sm font-bold">{lineUser.displayName}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-gray-200">
                        <Image src={lineUser.pictureUrl || '/default-avatar.png'} alt="Profile" width={40} height={40} className="w-full h-full object-cover"/>
                    </div>
                </div>
            </div>

            <div className="px-6 mt-6 w-full max-w-5xl mx-auto space-y-5">
                <div className="flex items-center gap-2 mb-2">
                    <Image src="/nursery-large/famicons_fish-g.svg" alt="fish" width={24} height={24} />
                    <h2 className="text-lg font-bold text-black">ผลวิเคราะห์การเจริญเติบโต (ปลาดุก)</h2>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-[#E4F5E7] rounded-xl py-3 px-4 flex items-center gap-2 shadow-sm border border-[#6CCF9C]/30 relative">
                        <Image src="/nursery-large/solar_calendar-outline.svg" alt="date" width={20} height={20} className="opacity-70"/>
                        <span className="text-[#093832] text-lg font-bold">{recordDate}</span>
                    </div>
                    <div className="bg-[#E4F5E7] rounded-xl py-3 px-4 flex items-center gap-2 shadow-sm border border-[#6CCF9C]/30 relative">
                        <Image src="/nursery-large/formkit_time.svg" alt="time" width={20} height={20} className="opacity-70"/>
                        <span className="text-[#093832] text-lg font-bold">{recordTime} น.</span>
                    </div>
                </div>

                <div className="flex items-stretch bg-[#FFEFBC] rounded-xl overflow-hidden shadow-sm">
                    <div className="flex-1 p-4 flex flex-col items-center justify-center gap-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Image src="/nursery-large/famicons_fish-outline.svg" alt="age" width={18} height={18} />
                            <span>ช่วงอายุปลา</span>
                        </div>
                        <p className="text-xl font-bold text-black text-center">{getDisplayAge(selectedAge)}</p>
                    </div>
                    <div className="w-[2px] bg-white" />
                    <div className="flex-1 p-4 flex flex-col items-center justify-center gap-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                             <Image src="/nursery-large/hugeicons_weight.svg" alt="weight" width={18} height={18} />
                            <span>น้ำหนักเฉลี่ย (Kg.)</span>
                        </div>
                        <p className="text-xl font-bold text-black">2.0</p> 
                    </div>
                </div>

                <div className="flex items-stretch bg-[#D8EFFF] rounded-xl overflow-hidden shadow-sm">
                    <div className="flex-1 p-4 flex flex-col items-center justify-center gap-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                             <Image src="/nursery-large/fluent_temperature-b.svg" alt="temp" width={18} height={18} />
                            <span>อุณหภูมิ</span>
                        </div>
                        <p className="text-xl font-bold text-black">{safeNumber(weatherSnapshot?.temperatureC, ' °C')}</p>
                    </div>
                    <div className="w-[2px] bg-white" />
                    <div className="flex-1 p-4 flex flex-col items-center justify-center gap-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                             <Image src="/nursery-large/famicons_fish-outline.svg" alt="food" width={18} height={18} />
                            <span>การทานอาหาร</span>
                        </div>
                        <p className="text-xl font-bold text-black">ปลากินดี โตเร็ว</p>
                    </div>
                </div>

                <div className="bg-[#F0F4FF] rounded-xl p-4 border border-blue-100">
                    <h3 className="font-bold text-blue-900 mb-2">แนวทางการให้อาหาร</h3>
                    <div className="bg-white rounded-lg p-3 text-center mb-3 shadow-sm">
                         <p className="text-gray-700">วันนี้อุณหภูมิลดลง 2°C<br/>แนะนำให้ลดอาหารลง 5%</p>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                        <p><span className="font-bold">คำแนะนำ :</span></p>
                        <p>ให้ 2 มื้อใหญ่ต่อวัน (เช้า-เย็น)</p>
                        <p>เพิ่มสัดส่วนพลังงาน (ข้าวโพด, รำ)</p>
                        <p>ลดโปรตีนลงเล็กน้อยอัตราโปรตีน 28-32% ก็เพียงพอ</p>
                        <p>ติดตาม FCR เพื่อควบคุมต้นทุนอาหาร</p>
                    </div>
                </div>
                
                <div>
                     <h3 className="font-bold text-black mb-2">ลักษณะปลา (กรณีผิดปกติ)</h3>
                     <div className="flex flex-wrap gap-2 mb-4">
                        {selectedDiseases.length > 0 ? selectedDiseases.map((d, i) => (
                            <span key={i} className="bg-[#BDD7FF] text-blue-900 px-3 py-1 rounded-full text-sm">
                                {d}
                            </span>
                        )) : (
                            <span className="text-gray-400">- ไม่มี -</span>
                        )}
                        {otherDisease && (
                             <span className="bg-[#BDD7FF] text-blue-900 px-3 py-1 rounded-full text-sm">
                                {otherDisease}
                             </span>
                        )}
                     </div>
                </div>

                 <div className="bg-[#FFF6DB] rounded-xl p-4">
                    <h3 className="font-bold text-black text-sm">โรคที่พบ</h3>
                    <p className="text-sm text-gray-700 mb-2">ปลาขาดสารอาหาร</p>
                    <h3 className="font-bold text-black text-sm">แนวทางการรักษา</h3>
                    <p className="text-sm text-gray-700">เพิ่มอาหารที่มีโปรตีน เช่น xxx, xxx, xxx</p>
                </div>

                <button
                type="button"
                  onClick={() => router.push(backHref)} 
                    className="w-full py-3.5 rounded-xl text-xl font-bold text-[#EF6E11] border border-[#EF6E11] bg-white mt-4"
                >
                  ปิด
              </button>
            </div>
        </div>
      );
  }

  // --- RENDER SECTION: INPUT PAGE ---
  return (
    <div className="min-h-screen bg-white pb-10 relative">
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] px-8 py-10 text-center shadow-2xl w-full max-w-sm">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#22C55E] flex items-center justify-center shadow-lg">
              <Check className="w-10 h-10 text-white" strokeWidth={4} />
            </div>
            <p className="text-2xl font-bold text-[#093832]">บันทึกข้อมูลสำเร็จ</p>
            <p className="text-sm text-gray-500 mt-2">กำลังนำคุณกลับไปยังหน้าแดชบอร์ด...</p>
          </div>
        </div>
      )}
      <div className="bg-[#093832] text-white px-4 pt-8 pb-10 rounded-b-[40px] shadow-md relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href={backHref} className="p-1 hover:bg-white/10 rounded-full transition-colors">
            <ChevronLeft className="w-8 h-8" />
          </Link>
          <h1 className="text-2xl font-bold">กรอกข้อมูล</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm text-gray-300">ยินดีต้อนรับ</p>
            <p className="text-sm font-bold">{lineUser.displayName}</p>
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-gray-200">
            <Image
              src={lineUser.pictureUrl || '/default-avatar.png'}
              alt="Profile"
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      <div className="px-6 mt-6 w-full max-w-5xl mx-auto space-y-5">
        {formSeedError && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
            {formSeedError}
          </div>
        )}
        {submitMessage && submitMessage.type === 'error' && (
           <div className="rounded-xl px-4 py-3 text-sm border bg-red-50 border-red-200 text-red-700">
             {submitMessage.text}
           </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <label className="bg-[#E4F5E7] rounded-xl py-3 px-4 flex flex-col gap-1 shadow-sm border border-[#6CCF9C]/30 relative">
            <span className="text-xs text-[#0F614E]/70">วันที่บันทึก</span>
            <div className="relative flex items-center">
              <input
                type="date"
                value={recordDate}
                onChange={(event) => setRecordDate(event.target.value)}
                lang="th-TH"
                className="bg-transparent text-[#093832] text-lg font-bold w-full focus:outline-none z-10 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-inner-spin-button]:hidden"
              />
              <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none">
                 <Image src="/nursery-large/solar_calendar-outline.svg" alt="calendar" width={24} height={24} className="opacity-50"/>
              </div>
            </div>
          </label>
          <label className="bg-[#E4F5E7] rounded-xl py-3 px-4 flex flex-col gap-1 shadow-sm border border-[#6CCF9C]/30 relative">
            <span className="text-xs text-[#0F614E]/70">เวลา</span>
            <div className="relative flex items-center">
              <input
                type="time"
                value={recordTime}
                onChange={(event) => setRecordTime(event.target.value)}
                lang="th-TH"
                className="bg-transparent text-[#093832] text-lg font-bold w-full focus:outline-none z-10 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-inner-spin-button]:hidden"
              />
               <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none">
                 <Image src="/nursery-large/formkit_time.svg" alt="time" width={24} height={24} className="opacity-50"/>
               </div>
            </div>
          </label>
        </div>

        <div>
          <h2 className="text-lg font-bold text-black mb-2">สภาพอากาศปัจจุบัน</h2>
          <div className="flex items-center bg-[#D8EFFF] rounded-xl overflow-hidden shadow-sm">
            <div className="flex-1 py-4 flex flex-col items-center justify-center">
              <div className="flex items-center gap-1 mb-1">
                <Image src="/nursery-large/fluent_temperature-b.svg" alt="temp" width={20} height={20} />
                <span className="text-sm text-black">อุณหภูมิ</span>
              </div>
              <p className="text-xl font-bold text-black">{safeNumber(weatherSnapshot?.temperatureC, ' °C')}</p>
            </div>
            <div className="w-[2px] h-[40px] bg-white" />
            <div className="flex-1 py-4 flex flex-col items-center justify-center">
              <div className="flex items-center gap-1 mb-1">
                <Image src="/nursery-large/fluent_weather-rain-snow-b.svg" alt="rain" width={20} height={20} />
                <span className="text-sm text-black">ปริมาณน้ำฝน</span>
              </div>
              <p className="text-xl font-bold text-black">{safeNumber(weatherSnapshot?.rainMm, ' mm')}</p>
            </div>
            <div className="w-[2px] h-[40px] bg-white" />
            <div className="flex-1 py-4 flex flex-col items-center justify-center">
              <div className="flex items-center gap-1 mb-1">
                <Image src="/nursery-large/mdi_dots-triangle.svg" alt="humidity" width={20} height={20} />
                <span className="text-sm text-black">ความชื้น</span>
              </div>
              <p className="text-xl font-bold text-black">{safeNumber(weatherSnapshot?.humidityPct, ' %')}</p>
            </div>
          </div>
        </div>

        <div className="relative">
          <label className="block text-lg text-black mb-2">เลือกช่วงอายุปลา</label>
          <button
            type="button"
            onClick={() => setIsAgeOpen((prev) => !prev)}
            className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 flex items-center justify-between text-lg text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#093832]"
          >
            <span className={selectedAge ? 'text-black' : 'text-gray-400'}>
              {selectedAge ? getDisplayAge(selectedAge) : 'เลือกข้อมูลช่วงอายุ'}
            </span>
            <ChevronDown className={`w-6 h-6 text-gray-400 transition-transform ${isAgeOpen ? 'rotate-180' : ''}`} />
          </button>
          {isAgeOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-20 max-h-60 overflow-y-auto">
              {AGE_OPTIONS.map((option) => (
                <div
                  key={option}
                  onClick={() => {
                    setSelectedAge(option);
                    setIsAgeOpen(false);
                  }}
                  className="px-4 py-3 text-lg text-black hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-none"
                >
                  {getDisplayAge(option)}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <label className="block text-lg text-black mb-2">ประเภทบ่อ</label>
          <button
            type="button"
            onClick={() => setIsPondTypeOpen((prev) => !prev)}
            className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 flex items-center justify-between text-lg text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#093832]"
          >
            <span className={selectedPondType ? 'text-black' : 'text-gray-400'}>
              {selectedPondType || 'ระบุข้อมูล เช่น บ่อดิน, บ่อปูน'}
            </span>
            <ChevronDown className={`w-6 h-6 text-gray-400 transition-transform ${isPondTypeOpen ? 'rotate-180' : ''}`} />
          </button>
          {isPondTypeOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-20">
              {POND_TYPE_OPTIONS.map((option) => (
                <div
                  key={option}
                  onClick={() => {
                    setSelectedPondType(option);
                    setIsPondTypeOpen(false);
                  }}
                  className="px-4 py-3 text-lg text-black hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-none"
                >
                  {option}
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-lg text-black mb-2">จำนวนบ่อ</label>
          <input
            type="text"
            value={pondCount}
            onChange={(e) => handleNumericInput(e.target.value, setPondCount)}
            placeholder="ระบุจำนวน เช่น 10, 15, 20"
            className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-lg text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#093832]"
          />
        </div>

        <div>
          <label className="block text-lg text-black mb-2">จำนวนปลาที่เลี้ยง (ตัว)</label>
          <input
            type="text"
            value={fishCount}
            onChange={(e) => handleNumericInput(e.target.value, setFishCount)}
            placeholder="ระบุข้อมูล เช่น 250, 250-350"
            className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-lg text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#093832]"
          />
        </div>
        
        <div>
          <label className="block text-lg text-black mb-2">ปริมาณอาหาร (กิโลกรัม.)</label>
          <input
            type="text"
            value={foodAmount}
            onChange={(e) => handleNumericInput(e.target.value, setFoodAmount)}
            placeholder="ระบุจำนวน เช่น 10, 15, 20"
            className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-lg text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#093832]"
          />
        </div>

        <div>
             <label className="block text-lg text-black mb-2">ลักษณะปลา (กรณีผิดปกติ)</label>
             <div className="space-y-3">
                 <div className="flex flex-col gap-1">
                     <span className="text-sm text-gray-600">ลักษณะปลาที่พบ</span>
                     <input
                        type="text"
                        value={otherDisease}
                        onChange={(e) => setOtherDisease(e.target.value)}
                        placeholder="ระบุเพิ่มเติม"
                        className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-lg text-black placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#093832]"
                    />
                 </div>
                 
                 <div className="flex flex-wrap gap-2">
                     {DISEASE_LIST.map((disease, idx) => {
                         const isSelected = selectedDiseases.includes(disease);
                         return (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => toggleDisease(disease)}
                                className={`px-4 py-2 rounded-full border transition-all text-sm font-medium
                                    ${isSelected 
                                        ? 'bg-[#BDD7FF] border-[#6FAEFF] text-blue-900' 
                                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                    }`}
                            >
                                {disease}
                            </button>
                         );
                     })}
                 </div>
             </div>
        </div>
        
        <div>
            <label className="block text-lg text-black mb-2">รูปภาพประกอบ</label>
            <div className="grid grid-cols-3 gap-2 mb-2">
                {uploadedImages.map((src, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                        <Image src={src} alt="uploaded" fill className="object-cover" />
                        <button 
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full shadow-md"
                        >
                            <X size={14} />
                        </button>
                    </div>
                ))}
            </div>
            <input 
                type="file" 
                multiple 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleImageUpload}
            />
            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 border-2 border-dashed border-[#093832] text-[#093832] rounded-xl flex items-center justify-center gap-2 hover:bg-[#E4F5E7] transition-colors"
            >
                <Plus /> ถ่ายรูป / อัปโหลดรูป
            </button>
        </div>


        <button
          type="button"
          disabled={!isFormValid || submitting}
          onClick={handleSubmit}
          className={`w-full py-3.5 rounded-xl text-xl font-bold text-white transition-all duration-200 shadow-md mt-4 ${
            isFormValid && !submitting
              ? 'bg-[#EF6E11] hover:bg-[#d65d0a] active:scale-95'
              : 'bg-[#A0A0A0] cursor-not-allowed'
          }`}
        >
          {submitting ? 'กำลังประมวลผล...' : 'เริ่มวิเคราะห์ข้อมูล' }
        </button>
      </div>
    </div>
  );
};