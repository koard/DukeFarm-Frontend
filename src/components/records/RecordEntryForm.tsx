'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronDown, ChevronLeft } from 'lucide-react';
import { useLineUser } from '@/hooks/useLineUser';

const API_BASE_URL = 'https://dukefarm-backend.onrender.com/api';
const FARM_TYPE_LABEL: Record<'NURSERY_LARGE' | 'GROWOUT', string> = {
  NURSERY_LARGE: 'กลุ่มอนุบาลขนาดใหญ่',
  GROWOUT: 'กลุ่มตลาด (Growout)',
};

const AGE_OPTIONS = [
  '0–15 วัน (ระยะลูกปลา)',
  '16–30 วัน (ลูกปลาขนาดกลาง)',
  '31–60 วัน (ปลาขุนระยะต้น)',
  '61–90 วัน (ปลาขุนระยะกลาง)',
  '91–120 วัน (ปลาขุนระยะสุดท้าย)',
  '>120 วัน (ขนาดตลาด)',
];

const POND_TYPE_OPTIONS = ['บ่อดิน', 'บ่อปูน'];
const POND_TYPE_MAP: Record<string, 'EARTHEN' | 'CONCRETE'> = {
  บ่อดิน: 'EARTHEN',
  บ่อปูน: 'CONCRETE',
};

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

const combineDateAndTime = (dateStr: string, timeStr: string): string => {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);
  const composedDate = new Date(year!, (month ?? 1) - 1, day ?? 1, hours ?? 0, minutes ?? 0, 0);
  return composedDate.toISOString();
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

const displayText = (value: string | null | undefined) => value && value.length > 0 ? value : '--';

const sanitizeTimeInput = (value: string): string => {
  const numeric = value.replace(/[^0-9]/g, '').slice(0, 4);
  if (numeric.length <= 2) {
    return numeric;
  }
  return `${numeric.slice(0, 2)}:${numeric.slice(2)}`;
};

const normalizeTimeValue = (value: string, fallback: string): string => {
  if (!value || !value.includes(':')) {
    return fallback;
  }
  const [rawHours, rawMinutes] = value.split(':');
  const hours = Number(rawHours);
  const minutes = Number(rawMinutes);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return fallback;
  }
  const safeHours = Math.min(23, Math.max(0, hours));
  const safeMinutes = Math.min(59, Math.max(0, minutes));
  return `${String(safeHours).padStart(2, '0')}:${String(safeMinutes).padStart(2, '0')}`;
};

const isCompleteTime = (value: string): boolean => /^\d{2}:\d{2}$/.test(value);

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
  farmType: 'NURSERY_LARGE' | 'GROWOUT';
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
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload?.message ?? 'ไม่สามารถโหลดข้อมูลเริ่มต้นได้');
        }

        const payload: { data: FormStateResponse } = await response.json();
        if (!isMounted) {
          return;
        }

        const iso = getIsoDateFromString(payload.data.currentDateTime);
        const hydrated = new Date(iso);
        setRecordDate(formatInputDate(hydrated));
        setRecordTime(formatInputTime(hydrated));
        setWeatherSnapshot(payload.data.weather ?? null);
        setLocationAvailable(payload.data.locationAvailable);
      } catch (error) {
        if (!isMounted) {
          return;
        }
        setFormSeedError(error instanceof Error ? error.message : 'เกิดข้อผิดพลาด');
      } finally {
        if (isMounted) {
          setFormSeedLoading(false);
        }
      }
    };

    fetchFormState();

    return () => {
      isMounted = false;
    };
  }, [farmType, router]);

  const isFormValid = Boolean(
    recordDate &&
      isCompleteTime(recordTime) &&
      selectedAge &&
      selectedPondType &&
      pondCount &&
      fishCount,
  );

  const handleSubmit = async () => {
    if (!isFormValid || submitting) {
      return;
    }

    setSubmitting(true);
    setSubmitMessage(null);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }

      const safeTime = normalizeTimeValue(recordTime, formatInputTime(now));
      setRecordTime(safeTime);
      const recordedAtIso = combineDateAndTime(recordDate, safeTime);
      const response = await fetch(`${API_BASE_URL}/records`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          farmType,
          recordedAt: recordedAtIso,
          fishAgeLabel: getDisplayAge(selectedAge),
          pondType: POND_TYPE_MAP[selectedPondType] ?? null,
          pondCount: pondCount ? Number(pondCount) : null,
          fishCountText: fishCount,
          weather: weatherSnapshot
            ? {
                temperatureC: weatherSnapshot.temperatureC,
                rainMm: weatherSnapshot.rainMm,
                humidityPct: weatherSnapshot.humidityPct,
              }
            : null,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.message ?? 'ไม่สามารถบันทึกข้อมูลได้');
      }

      setSubmitMessage({ type: 'success', text: 'บันทึกข้อมูลเรียบร้อยแล้ว' });
      setSelectedAge('');
      setSelectedPondType('');
      setPondCount('');
      setFishCount('');

      await new Promise((resolve) => setTimeout(resolve, 800));
      router.push(backHref);
      router.refresh();
    } catch (error) {
      setSubmitMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการบันทึก',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pb-10 relative">
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
        {submitMessage && (
          <div
            className={`rounded-xl px-4 py-3 text-sm border ${
              submitMessage.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            {submitMessage.text}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <span className="inline-flex items-center gap-2 bg-[#DB9DFF] text-purple-900 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm border border-purple-200 w-max">
            <Image src="/nursery-large/famicons_fish-nl.svg" alt="fish" width={20} height={20} />
            {FARM_TYPE_LABEL[farmType]}
          </span>
          {formSeedLoading && (
            <p className="text-xs text-gray-500">กำลังโหลดข้อมูลเริ่มต้น...</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className="bg-[#E4F5E7] rounded-xl py-3 px-4 flex flex-col gap-1 shadow-sm border border-[#6CCF9C]/30">
            <span className="text-xs text-[#0F614E]/70">วันที่บันทึก</span>
            <div className="flex items-center">
              <input
                type="date"
                value={recordDate}
                onChange={(event) => setRecordDate(event.target.value)}
                lang="th-TH"
                className="bg-transparent text-[#093832] text-lg font-bold flex-1 focus:outline-none pr-6"
              />
            </div>
          </label>
          <label className="bg-[#E4F5E7] rounded-xl py-3 px-4 flex flex-col gap-1 shadow-sm border border-[#6CCF9C]/30">
            <span className="text-xs text-[#0F614E]/70">เวลา</span>
            <div className="flex items-center">
              <input
                type="text"
                value={recordTime}
                onChange={(event) => setRecordTime(sanitizeTimeInput(event.target.value))}
                onBlur={() => setRecordTime((prev) => normalizeTimeValue(prev, formatInputTime(now)))}
                placeholder="เช่น 14:30"
                inputMode="numeric"
                pattern="^\d{2}:\d{2}$"
                className="bg-transparent text-[#093832] text-lg font-bold flex-1 focus:outline-none pr-2"
              />
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
          {!locationAvailable && (
            <p className="text-xs text-red-600 mt-2">
              ไม่พบพิกัดฟาร์ม กรุณาบันทึกตำแหน่งในหน้าโปรไฟล์เพื่อรับข้อมูลอากาศอัตโนมัติ
            </p>
          )}
          {weatherSnapshot?.conditionText && (
            <p className="text-xs text-gray-500 mt-1">
              ล่าสุด: {displayText(weatherSnapshot.conditionText)}
              {weatherSnapshot.observedAt ? ` (${new Date(weatherSnapshot.observedAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })})` : ''}
            </p>
          )}
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
            type="number"
            min={0}
            value={pondCount}
            onChange={(event) => setPondCount(event.target.value)}
            placeholder="ระบุจำนวน เช่น 10, 15, 20"
            className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-lg text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#093832]"
          />
        </div>

        <div>
          <label className="block text-lg text-black mb-2">จำนวนปลาที่เลี้ยง (ตัว)</label>
          <input
            type="text"
            value={fishCount}
            onChange={(event) => setFishCount(event.target.value)}
            placeholder="ระบุข้อมูล เช่น 250, 250-350"
            className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-lg text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#093832]"
          />
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
          {submitting ? 'กำลังบันทึก...' : 'บันทึกข้อมูล' }
        </button>
      </div>
    </div>
  );
};
