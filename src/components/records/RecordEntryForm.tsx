'use client';

import { useEffect, useMemo, useState, useRef, Dispatch, SetStateAction } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Check, ChevronLeft, X, Plus } from 'lucide-react';
import { useLineUser } from '@/hooks/useLineUser';

type FarmType = 'SMALL' | 'LARGE' | 'MARKET';

const API_BASE_URL = 'https://dukefarm-backend.onrender.com/api';
const LAST_ENTRY_STORAGE_KEY = 'recordEntry:lastSnapshot';

const AGE_PHASES = [
  { label: 'ปลาตุ้ม', min: 7, max: 10, accent: '#F97316' },
  { label: 'ปลานิ้ว', min: 11, max: 30, accent: '#2563EB' },
  { label: 'ปลาตลาด', min: 31, max: 180, accent: '#16A34A' },
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

const getIsoDateFromString = (value: string): string => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString();
  }
  return parsed.toISOString();
};

const getAgeStage = (days: number) => {
  if (Number.isNaN(days) || days < 0) {
    return null;
  }
  const matched = AGE_PHASES.find((phase) => days >= phase.min && days <= phase.max);
  if (matched) {
    return matched;
  }
  if (days < AGE_PHASES[0].min) {
    return { label: 'ลูกปลาเพิ่งลงบ่อ', min: 0, max: AGE_PHASES[0].min - 1, accent: '#0F172A' };
  }
  return { label: 'เกินรอบปลาตลาด', min: AGE_PHASES[AGE_PHASES.length - 1].max + 1, max: Infinity, accent: '#7C3AED' };
};

const formatAgeSummary = (days: number | null | undefined) => {
  if (days === null || days === undefined || Number.isNaN(days)) {
    return '-';
  }
  const stage = getAgeStage(days);
  return stage ? `${days} วัน (${stage.label})` : `${days} วัน`;
};

const clampAgeDays = (days: number) => {
  if (Number.isNaN(days)) {
    return 0;
  }
  return Math.max(0, Math.min(180, Math.round(days)));
};

const extractLegacyAgeDays = (value?: string) => {
  if (!value) {
    return null;
  }
  const digits = value.match(/\d+/);
  if (!digits) {
    return null;
  }
  return Number.parseInt(digits[0], 10);
};

const getDaysDifference = (fromDate: string, toDate: string) => {
  const from = new Date(fromDate);
  const to = new Date(toDate);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
    return 0;
  }
  const diffMs = to.setHours(0, 0, 0, 0) - from.setHours(0, 0, 0, 0);
  return Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)));
};

const safeNumber = (value: number | null | undefined, suffix: string) => {
  if (value === null || value === undefined) {
    return '--';
  }
  return `${Math.round(value * 10) / 10}${suffix}`;
};

const formatObservedAt = (value: string | null) => {
  if (!value) {
    return null;
  }
  const iso = getIsoDateFromString(value);
  return new Date(iso).toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
  });
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

type LastEntrySnapshot = {
  recordDate: string;
  recordTime: string;
  ageDays?: number;
  age?: string;
  pondType: string;
  pondCount: string;
  fishCount: string;
  foodAmount: string;
  diseases: string[];
};

const getSnapshotAgeDays = (snapshot?: LastEntrySnapshot | null) => {
  if (!snapshot) {
    return null;
  }
  if (typeof snapshot.ageDays === 'number') {
    return snapshot.ageDays;
  }
  return extractLegacyAgeDays(snapshot.age);
};

export type RecordEntryFormProps = {
  farmType: FarmType;
  backHref: string;
};

export const RecordEntryForm = ({ farmType, backHref }: RecordEntryFormProps) => {
  const router = useRouter();
  const lineUser = useLineUser();
  const now = useMemo(() => new Date(), []);

  const [fishAgeDays, setFishAgeDays] = useState('');
  const [selectedPondType, setSelectedPondType] = useState('');
  const [pondCount, setPondCount] = useState('');
  const [fishCount, setFishCount] = useState('');
  const [foodAmount, setFoodAmount] = useState('');
  const [otherDisease, setOtherDisease] = useState('');
  const [recordDate, setRecordDate] = useState(() => formatInputDate(now));
  const [recordTime, setRecordTime] = useState(() => formatInputTime(now));
  const [weatherSnapshot, setWeatherSnapshot] = useState<WeatherSnapshot | null>(null);
  const [formSeedError, setFormSeedError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isAnalysisView, setIsAnalysisView] = useState(false);
  const [selectedDiseases, setSelectedDiseases] = useState<string[]>([]);
  const [lastEntrySnapshot, setLastEntrySnapshot] = useState<LastEntrySnapshot | null>(null);

  // Image State
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const successModalTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ageInputTouchedRef = useRef(false);

  useEffect(() => {
    return () => {
      if (successModalTimerRef.current) {
        clearTimeout(successModalTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LAST_ENTRY_STORAGE_KEY);
      if (stored) {
        const snapshot: LastEntrySnapshot = JSON.parse(stored);
        setLastEntrySnapshot(snapshot);
        const resolvedAgeDays = getSnapshotAgeDays(snapshot);
        if (resolvedAgeDays !== null && !Number.isNaN(resolvedAgeDays)) {
          setFishAgeDays(resolvedAgeDays.toString());
        }
      }
    } catch (error) {
      console.error('Failed to parse last entry snapshot', error);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchFormState = async () => {
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
           return; 
        }

        const payload: { data: FormStateResponse } = await response.json();
        if (!isMounted) return;

        const iso = getIsoDateFromString(payload.data.currentDateTime);
        const hydrated = new Date(iso);
        setRecordDate(formatInputDate(hydrated));
        setRecordTime(formatInputTime(hydrated));
        setWeatherSnapshot(payload.data.weather ?? null);
      } catch (error) {
        if (!isMounted) return;
        console.error(error);
        setFormSeedError('ไม่สามารถดึงเวลาและสภาพอากาศล่าสุดได้ กรุณากรอกเอง');
      }
    };

    fetchFormState();

    return () => { isMounted = false; };
  }, [farmType, router]);

  const fishAgeNumber = fishAgeDays ? Number(fishAgeDays) : 0;
  const ageStage = getAgeStage(fishAgeNumber);
  const daysToStageBoundary = ageStage && Number.isFinite(ageStage.max)
    ? Math.max(0, Math.round(ageStage.max - fishAgeNumber))
    : null;
  const showResetCyclePrompt = ageStage && Number.isFinite(ageStage.max)
    ? fishAgeNumber >= ageStage.max
    : false;
  const lastEntryAgeSummary = useMemo(() => {
    const days = getSnapshotAgeDays(lastEntrySnapshot);
    if (days === null || Number.isNaN(days)) {
      return '-';
    }
    return formatAgeSummary(days);
  }, [lastEntrySnapshot]);

  useEffect(() => {
    if (!lastEntrySnapshot || !recordDate || ageInputTouchedRef.current) {
      return;
    }
    const baseAge = getSnapshotAgeDays(lastEntrySnapshot);
    if (baseAge === null || Number.isNaN(baseAge)) {
      return;
    }
    const diffDays = getDaysDifference(lastEntrySnapshot.recordDate, recordDate);
    const nextAge = clampAgeDays(baseAge + diffDays);
    setFishAgeDays(nextAge.toString());
  }, [lastEntrySnapshot, recordDate]);

  const handleNumericInput = (value: string, setter: (val: string) => void) => {
    if (/^\d*\.?\d*$/.test(value)) {
      setter(value);
    }
  };

  const handleAgeInput = (value: string) => {
    if (/^\d*$/.test(value)) {
      ageInputTouchedRef.current = true;
      setFishAgeDays(value);
    }
  };

  const bumpAgeBy = (delta: number) => {
    ageInputTouchedRef.current = true;
    setFishAgeDays((prev) => {
      const parsed = Number(prev || '0');
      return clampAgeDays(parsed + delta).toString();
    });
  };

  const handleResetAgeCycle = () => {
    ageInputTouchedRef.current = true;
    setFishAgeDays('0');
    setSubmitMessage({ type: 'success', text: 'เริ่มรอบใหม่แล้ว กรอกอายุปลาตามวันที่เริ่มต้นได้เลย' });
  };

  const adjustNumericByStep = (value: string, delta: number, allowDecimal = false) => {
    const parsed = parseFloat(value || '0');
    const base = Number.isNaN(parsed) ? 0 : parsed;
    const next = Math.max(0, base + delta);
    if (allowDecimal) {
      const normalized = Math.round(next * 10) / 10;
      return normalized.toFixed(1).replace(/\.0$/, '');
    }
    return Math.round(next).toString();
  };

  const handleStepChange = (
    setter: Dispatch<SetStateAction<string>>,
    delta: number,
    allowDecimal = false,
  ) => {
    setter((prev) => adjustNumericByStep(prev, delta, allowDecimal));
  };

  const handleApplyLastEntry = () => {
    if (!lastEntrySnapshot) return;
    const restoredAge = getSnapshotAgeDays(lastEntrySnapshot);
    if (restoredAge !== null && !Number.isNaN(restoredAge)) {
      setFishAgeDays(restoredAge.toString());
    }
    ageInputTouchedRef.current = true;
    setSelectedPondType(lastEntrySnapshot.pondType);
    setPondCount(lastEntrySnapshot.pondCount);
    setFishCount(lastEntrySnapshot.fishCount);
    setFoodAmount(lastEntrySnapshot.foodAmount);
    setSelectedDiseases(lastEntrySnapshot.diseases);
    setOtherDisease('');
    setSubmitMessage({ type: 'success', text: 'เติมข้อมูลครั้งล่าสุดให้แล้ว ปรับแก้ได้ตามต้องการ' });
  };

  const isFormValid = Boolean(
    fishAgeDays &&
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

      const normalizedAge = clampAgeDays(fishAgeNumber);
      const ageSummary = formatAgeSummary(normalizedAge);

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
            age: ageSummary,
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

      const snapshot: LastEntrySnapshot = {
        recordDate,
        recordTime,
        ageDays: normalizedAge,
        pondType: selectedPondType,
        pondCount,
        fishCount,
        foodAmount,
        diseases: allDiseases,
      };
      localStorage.setItem(LAST_ENTRY_STORAGE_KEY, JSON.stringify(snapshot));
      setLastEntrySnapshot(snapshot);

      setShowSuccessModal(true);
      if (successModalTimerRef.current) {
        clearTimeout(successModalTimerRef.current);
      }
      successModalTimerRef.current = setTimeout(() => {
        setShowSuccessModal(false);
        setIsAnalysisView(true);
      }, 1200);

    } catch (error) {
      console.error(error);
      setSubmitMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' });
    } finally {
      setSubmitting(false);
    }
  };

  const observedAtDisplay = formatObservedAt(weatherSnapshot?.observedAt ?? null);

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
                        <p className="text-xl font-bold text-black text-center">{formatAgeSummary(fishAgeNumber)}</p>
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
          <h1 className="text-2xl font-bold">บันทึกข้อมูล</h1>
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
        {submitMessage && (
           <div
             className={`rounded-xl px-4 py-3 text-sm border shadow-sm ${
               submitMessage.type === 'error'
                 ? 'bg-red-50 border-red-200 text-red-700'
                 : 'bg-emerald-50 border-emerald-200 text-emerald-900'
             }`}
           >
             {submitMessage.text}
           </div>
        )}

        {lastEntrySnapshot && (
          <div className="rounded-2xl bg-[#FFF4E5] border border-[#F4C58C] px-4 py-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-[#8C4A00]">ข้อมูลที่บันทึกล่าสุด</p>
              <button
                type="button"
                onClick={handleApplyLastEntry}
                className="text-xs font-bold text-[#8C4A00] underline"
              >
                เติมให้เลย
              </button>
            </div>
            <div className="text-xs text-gray-700 grid grid-cols-2 gap-y-1">
              <span>อายุปลา: {lastEntryAgeSummary}</span>
              <span>ประเภทบ่อ: {lastEntrySnapshot.pondType || '-'}</span>
              <span>จำนวนบ่อ: {lastEntrySnapshot.pondCount || '-'}</span>
              <span>อาหาร: {lastEntrySnapshot.foodAmount || '-'} กก.</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-black">สภาพอากาศปัจจุบัน</h2>
            <span className="text-xs text-gray-500">
              {observedAtDisplay ? `อัปเดต ${observedAtDisplay} น.` : 'ยังไม่มีข้อมูลล่าสุด'}
            </span>
          </div>
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

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-lg text-black">อายุปลา (จำนวนวัน)</label>
            <span className="text-xs text-gray-500">ระบบจะเพิ่มให้อัตโนมัติทุกวัน</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 flex items-center bg-white border border-gray-300 rounded-2xl overflow-hidden">
              <button
                type="button"
                onClick={() => bumpAgeBy(-1)}
                className="w-12 h-12 text-2xl text-[#093832] hover:bg-gray-100"
              >
                –
              </button>
              <input
                type="text"
                inputMode="numeric"
                value={fishAgeDays}
                onChange={(event) => handleAgeInput(event.target.value)}
                placeholder="เช่น 7"
                className="flex-1 text-center text-2xl font-bold text-[#093832] bg-white focus:outline-none"
              />
              <button
                type="button"
                onClick={() => bumpAgeBy(1)}
                className="w-12 h-12 text-2xl text-[#093832] hover:bg-gray-100"
              >
                +
              </button>
            </div>
            {ageStage && (
              <div className="rounded-2xl px-4 py-3 flex flex-col justify-center items-start border" style={{ borderColor: ageStage.accent }}>
                <span className="text-[11px] uppercase tracking-wide text-gray-500">ช่วงอายุ</span>
                <span className="text-base font-bold" style={{ color: ageStage.accent }}>
                  {ageStage.label}
                </span>
                {daysToStageBoundary !== null && (
                  <span className="text-xs text-gray-500">{daysToStageBoundary} วันก่อนเปลี่ยนช่วง</span>
                )}
              </div>
            )}
          </div>
          {showResetCyclePrompt && (
            <div className="bg-[#FFF4E5] border border-[#F4C58C] rounded-2xl px-4 py-3 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-[#8C4A00]">ครบอายุช่วงปัจจุบันแล้ว</p>
                <button
                  type="button"
                  onClick={handleResetAgeCycle}
                  className="text-xs font-bold text-[#8C4A00] underline"
                >
                  เริ่มรอบใหม่
                </button>
              </div>
              <p className="text-xs text-gray-600">
                เมื่อส่งต่อไปบ่อถัดไปหรือเริ่มเลี้ยงชุดใหม่ ให้กดเริ่มรอบใหม่เพื่อนับอายุจาก 0 อีกครั้ง
              </p>
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-lg text-black">ประเภทบ่อ</label>
            <span className="text-xs text-gray-500">แตะเพื่อเลือก</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {POND_TYPE_OPTIONS.map((option) => {
              const isActive = selectedPondType === option;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setSelectedPondType(option)}
                  className={`rounded-2xl border px-4 py-4 text-center text-base font-medium transition-all ${
                    isActive
                      ? 'border-[#093832] bg-[#093832] text-white'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-[#093832]/40'
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="block text-lg text-black">จำนวนบ่อ</label>
            <span className="text-xs text-gray-500">บ่อ</span>
          </div>
          <div className="flex items-center bg-white border border-gray-300 rounded-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => handleStepChange(setPondCount, -1)}
              className="w-12 h-12 text-2xl text-[#093832] hover:bg-gray-100"
            >
              –
            </button>
            <input
              type="text"
              value={pondCount}
              onChange={(e) => handleNumericInput(e.target.value, setPondCount)}
              placeholder="เช่น 10"
              className="flex-1 text-center text-2xl font-bold text-[#093832] bg-white focus:outline-none"
            />
            <button
              type="button"
              onClick={() => handleStepChange(setPondCount, 1)}
              className="w-12 h-12 text-2xl text-[#093832] hover:bg-gray-100"
            >
              +
            </button>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="block text-lg text-black">จำนวนปลาที่เลี้ยง (ตัว)</label>
            <span className="text-xs text-gray-500">เพิ่ม/ลดครั้งละ 50 ตัว</span>
          </div>
          <div className="flex items-center bg-white border border-gray-300 rounded-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => handleStepChange(setFishCount, -50)}
              className="w-12 h-12 text-2xl text-[#093832] hover:bg-gray-100"
            >
              –
            </button>
            <input
              type="text"
              value={fishCount}
              onChange={(e) => handleNumericInput(e.target.value, setFishCount)}
              placeholder="เช่น 250"
              className="flex-1 text-center text-2xl font-bold text-[#093832] bg-white focus:outline-none"
            />
            <button
              type="button"
              onClick={() => handleStepChange(setFishCount, 50)}
              className="w-12 h-12 text-2xl text-[#093832] hover:bg-gray-100"
            >
              +
            </button>
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="block text-lg text-black">ปริมาณอาหาร (กิโลกรัม.)</label>
            <span className="text-xs text-gray-500">เพิ่ม/ลดครั้งละ 0.5 กก.</span>
          </div>
          <div className="flex items-center bg-white border border-gray-300 rounded-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => handleStepChange(setFoodAmount, -0.5, true)}
              className="w-12 h-12 text-2xl text-[#093832] hover:bg-gray-100"
            >
              –
            </button>
            <input
              type="text"
              value={foodAmount}
              onChange={(e) => handleNumericInput(e.target.value, setFoodAmount)}
              placeholder="เช่น 12"
              className="flex-1 text-center text-2xl font-bold text-[#093832] bg-white focus:outline-none"
            />
            <button
              type="button"
              onClick={() => handleStepChange(setFoodAmount, 0.5, true)}
              className="w-12 h-12 text-2xl text-[#093832] hover:bg-gray-100"
            >
              +
            </button>
          </div>
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