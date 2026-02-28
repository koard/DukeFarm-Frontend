'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, Calendar, RefreshCw, ChevronDown, Droplets, Ruler, Waves } from 'lucide-react';
import { ProfileDropdownMenu } from '@/components/common/ProfileDropdownMenu';

import { API_BASE_URL } from '@/config/api';

type FormulaOption = { id: string; name: string; foodType: string };

type PondInfo = {
  id: string;
  pondType: string;
  farmType: string;
  widthM: number;
  lengthM: number;
  depthM: number;
  volumeM3: number;
};

const POND_TYPE_LABELS: Record<string, string> = { EARTHEN: 'บ่อดิน', CONCRETE: 'บ่อปูน' };

interface RecordEntryStepProps {
  onAnalyze: (recordId?: string) => void;
  onBack: () => void;
  initialPondId?: string;
}

export const RecordEntryStep: React.FC<RecordEntryStepProps> = ({ onAnalyze, onBack, initialPondId }) => {
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  // const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false); // Removed
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dateInputRef = useRef<HTMLInputElement>(null);

  // User ponds from profile
  const [ponds, setPonds] = useState<PondInfo[]>([]);

  // Form state
  const [selectedPondId, setSelectedPondId] = useState(initialPondId || '');
  const [fishType, setFishType] = useState('');
  const [fishSize, setFishSize] = useState('');

  // const [fishSizeUnit, setFishSizeUnit] = useState(''); // Removed: Fixed to G
  const [releaseDate, setReleaseDate] = useState('');
  const [fishReleased, setFishReleased] = useState('');
  const [fishRemaining, setFishRemaining] = useState('');
  const [feedFormulaId, setFeedFormulaId] = useState('');
  const [foodAmount, setFoodAmount] = useState('');

  // const [foodUnit, setFoodUnit] = useState(''); // Removed: Fixed to KG
  const [supplementId, setSupplementId] = useState('');
  const [medicineType, setMedicineType] = useState('');
  const [foodCost, setFoodCost] = useState('');
  const [medicineCost, setMedicineCost] = useState('');
  const [activeCycle, setActiveCycle] = useState<{
    status: string;
    farmType?: string;
    startDate?: string;
    initialStockCount?: number;
  } | null>(null);

  // Dynamic dropdown options
  const [foodFormulas, setFoodFormulas] = useState<FormulaOption[]>([]);
  const [supplementFormulas, setSupplementFormulas] = useState<FormulaOption[]>([]);

  // Load ponds from user profile — localStorage first, then refresh from API
  useEffect(() => {
    const loadPondsFromProfile = (profilePonds: PondInfo[]) => {
      if (Array.isArray(profilePonds) && profilePonds.length > 0) {
        setPonds(profilePonds.map((p: PondInfo) => ({
          id: p.id,
          pondType: p.pondType || 'EARTHEN',
          farmType: p.farmType || 'SMALL',
          widthM: Number(p.widthM) || 0,
          lengthM: Number(p.lengthM) || 0,
          depthM: Number(p.depthM) || 0,
          volumeM3: Number(p.volumeM3) || 0,
        })));

        if (initialPondId) {
          const exists = profilePonds.find((p: PondInfo) => p.id === initialPondId);
          if (exists) {
            setSelectedPondId(initialPondId);
          } else {
            setSelectedPondId(profilePonds[0].id);
          }
        } else if (!selectedPondId) {
          setSelectedPondId(profilePonds[0].id);
        }
      }
    };

    // Try localStorage first
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        const profilePonds = user?.farmerProfile?.ponds;
        loadPondsFromProfile(profilePonds);
      }
    } catch (err) {
      console.error('Failed to load ponds from localStorage', err);
    }

    // Refresh from API
    const refreshPonds = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        const res = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const { data } = await res.json();
          const apiPonds = data?.farmerProfile?.ponds;
          if (Array.isArray(apiPonds) && apiPonds.length > 0) {
            loadPondsFromProfile(apiPonds);
            // Update localStorage
            const currentRaw = localStorage.getItem('user');
            const current = currentRaw ? JSON.parse(currentRaw) : {};
            const merged = { ...current, ...data, farmerProfile: { ...(current.farmerProfile ?? {}), ...data.farmerProfile } };
            localStorage.setItem('user', JSON.stringify(merged));
          }
        }
      } catch (err) {
        console.warn('Could not refresh ponds from API', err);
      }
    };
    refreshPonds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPondId]);

  // Fetch feed formulas and supplements from API (filtered by fishType/farmType)
  useEffect(() => {
    // รอให้มีประเภทปลาก่อนค่อย fetch — ป้องกันโหลดสูตรอาหารทั้งหมดโดยไม่กรอง
    if (!fishType) return;

    const fetchFormulas = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

        const farmTypeParam = fishType ? `&farmType=${fishType}` : '';

        const [freshRes, pelletRes, suppRes] = await Promise.all([
          fetch(`${API_BASE_URL}/feed-formulas?foodType=FRESH&limit=50${farmTypeParam}`, { headers }),
          fetch(`${API_BASE_URL}/feed-formulas?foodType=PELLET&limit=50${farmTypeParam}`, { headers }),
          fetch(`${API_BASE_URL}/feed-formulas?foodType=SUPPLEMENT&limit=50${farmTypeParam}`, { headers }),
        ]);

        const foods: FormulaOption[] = [];
        const supps: FormulaOption[] = [];

        if (freshRes.ok) {
          const r = await freshRes.json();
          const items = r.data?.data || [];
          items.forEach((f: FormulaOption) => foods.push({ id: f.id, name: f.name, foodType: 'FRESH' }));
        }
        if (pelletRes.ok) {
          const r = await pelletRes.json();
          const items = r.data?.data || [];
          items.forEach((f: FormulaOption) => foods.push({ id: f.id, name: f.name, foodType: 'PELLET' }));
        }
        if (suppRes.ok) {
          const r = await suppRes.json();
          const items = r.data?.data || [];
          items.forEach((f: FormulaOption) => supps.push({ id: f.id, name: f.name, foodType: 'SUPPLEMENT' }));
        }

        setFoodFormulas(foods);
        setSupplementFormulas(supps);

        // Reset selections if previously selected formula is no longer in the filtered list
        setFeedFormulaId((prev) => (foods.some((f) => f.id === prev) ? prev : ''));
        setSupplementId((prev) => (supps.some((f) => f.id === prev) ? prev : ''));
      } catch (err) {
        console.error('Failed to fetch feed formulas', err);
      }
    };

    fetchFormulas();
  }, [fishType]);

  useEffect(() => {
    if (isResetModalOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isResetModalOpen]);

  const handleDateClick = () => {
    if (dateInputRef.current) {
      try {
        (dateInputRef.current as HTMLInputElement & { showPicker: () => void }).showPicker();
      } catch {
        dateInputRef.current.focus();
      }
    }
  };

  // Fetch active cycle when pond changes
  useEffect(() => {
    if (!selectedPondId) return;
    const fetchCycle = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const res = await fetch(`${API_BASE_URL}/ponds/${selectedPondId}/active-cycle`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const { data } = await res.json();
          setActiveCycle(data);
          if (data && data.status !== 'PLANNING') {
            // Lock fields with cycle data only when cycle already has initial data (not PLANNING)
            if (data.farmType) setFishType(data.farmType);
            if (data.startDate) setReleaseDate(data.startDate.split('T')[0]);
            if (data.initialStockCount) setFishReleased(String(data.initialStockCount));
          }
          // If PLANNING or no cycle, fields remain editable
        }
      } catch (err) {
        console.error('Failed to fetch active cycle', err);
      }
    };
    fetchCycle();
  }, [selectedPondId]);

  const handleReset = async () => {
    try {
      if (activeCycle) {
        const token = localStorage.getItem('authToken');
        await fetch(`${API_BASE_URL}/ponds/${selectedPondId}/end-cycle`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        });
        setActiveCycle(null);
      }
    } catch (err) {
      console.error('Failed to end cycle', err);
    }

    // Clear form
    setFishType('');
    setFishSize('');
    // setFishSizeUnit('');
    setReleaseDate('');
    setFishReleased('');
    setFishRemaining('');
    setFeedFormulaId('');
    setFoodAmount('');
    // setFoodUnit('');
    setSupplementId('');
    setMedicineType('');
    setFoodCost('');
    setMedicineCost('');
    setIsResetModalOpen(false);
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const selectedFeed = foodFormulas.find(f => f.id === feedFormulaId);
      const selectedSupplement = supplementFormulas.find(f => f.id === supplementId);

      const body: Record<string, string | number | undefined> = {
        farmType: fishType || undefined,
        recordedAt: new Date().toISOString(),
        cycleStartDate: ((!activeCycle || activeCycle.status === 'PLANNING') && releaseDate) ? new Date(releaseDate).toISOString() : undefined,
        fishAgeLabel: fishType === 'SMALL' ? 'ปลาตุ้ม' : fishType === 'LARGE' ? 'ปลานิ้ว' : fishType === 'MARKET' ? 'ปลาตลาด' : 'ไม่ระบุ',
        pondId: selectedPondId || undefined,
        fishCountText: undefined,
        fishReleased: fishReleased ? parseInt(fishReleased, 10) : undefined,
        fishRemaining: fishRemaining ? parseInt(fishRemaining, 10) : undefined,
        averageFishWeightGr: fishSize ? parseFloat(fishSize) : undefined, // Fixed unit: Grams
        foodAmountKg: foodAmount ? parseFloat(foodAmount) : undefined, // Fixed unit: KG
        feedFormulaName: selectedFeed?.name || undefined,
        supplementName: selectedSupplement?.name || undefined,
        medicineName: medicineType || undefined,
        foodCostBaht: foodCost ? parseFloat(foodCost) : undefined,
        medicineCostBaht: medicineCost ? parseFloat(medicineCost) : undefined,
      };

      const res = await fetch(`${API_BASE_URL}/records`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const result = await res.json();

      if (res.ok) {
        if (result.data?.id) {
          onAnalyze(result.data.id);
        } else {
          onAnalyze(); // Fallback
        }
      } else {
        console.error('Failed to save record', result);
        alert('ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
      }
    } catch (err) {
      console.error('Submit error', err);
      alert('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedPond = ponds.find(p => p.id === selectedPondId);

  const formatVolumeLiters = (vol: number) => {
    const liters = vol * 1000;
    return liters.toLocaleString('th-TH');
  };

  return (
    <div className="min-h-screen bg-white relative pb-10">
      {/* Header */}
      <div className="bg-[#093832] text-white px-4 pt-5 pb-4 rounded-b-3xl shadow-md relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="p-1 hover:bg-white/10 rounded-full transition-colors">
            <ChevronLeft className="w-8 h-8" />
          </button>
          <h1 className="text-2xl font-bold">บันทึกข้อมูล</h1>
        </div>
        <ProfileDropdownMenu showGreeting={false} />
      </div>

      <div className="px-5 mt-6 space-y-5">
        {/* Pond selector card */}
        <div className="bg-gradient-to-br from-[#b8e6d5] to-[#a8dcd1] rounded-3xl p-4 shadow-lg">
          {/* Pond dropdown (if multiple) */}
          {ponds.length > 1 && (
            <div className="relative mb-3">
              <select
                value={selectedPondId}
                onChange={(e) => setSelectedPondId(e.target.value)}
                className="w-full appearance-none bg-white/60 backdrop-blur-sm border border-white/80 rounded-2xl pl-4 pr-10 py-3 text-sm font-bold text-gray-800 focus:bg-white/80 focus:border-white outline-none"
              >
                {ponds.map((pond, idx) => (
                  <option key={pond.id} value={pond.id} className="text-gray-800">บ่อที่ {idx + 1}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 pointer-events-none" />
            </div>
          )}

          {selectedPond ? (
            <>
              {/* Metrics grid */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-3 text-center shadow-sm">
                  <Waves className="w-4 h-4 text-teal-600 mx-auto mb-1.5" />
                  <p className="text-xs text-gray-700 font-semibold">ประเภทบ่อ</p>
                  <p className="text-gray-900 font-extrabold text-sm mt-1">
                    {POND_TYPE_LABELS[selectedPond.pondType] || selectedPond.pondType}
                  </p>
                </div>
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-3 text-center shadow-sm">
                  <Ruler className="w-4 h-4 text-teal-600 mx-auto mb-1.5" />
                  <p className="text-xs text-gray-700 font-semibold">ขนาด (เมตร)</p>
                  <p className="text-gray-900 font-bold text-sm mt-1">
                    {selectedPond.widthM} x {selectedPond.lengthM} x {selectedPond.depthM}
                  </p>
                </div>
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-3 text-center shadow-sm">
                  <Droplets className="w-4 h-4 text-blue-600 mx-auto mb-1.5" />
                  <p className="text-xs text-gray-700 font-semibold">ปริมาตร (ลิตร)</p>
                  <p className="text-gray-900 font-bold text-sm mt-1">
                    {formatVolumeLiters(selectedPond.volumeM3)}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <p className="text-gray-600 italic text-center py-4 text-sm">ไม่พบข้อมูลบ่อ</p>
          )}
        </div>

        <div className="border border-gray-100 rounded-3xl shadow-lg overflow-hidden pb-6 bg-white">
          <div className="px-4 pt-5 space-y-5">

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-black ml-1">ประเภทปลา</label>
                <div className="relative">
                  <select
                    disabled={!!activeCycle && activeCycle.status !== 'PLANNING'}
                    value={fishType}
                    onChange={(e) => setFishType(e.target.value)}
                    className={`w-full appearance-none bg-white border border-gray-200 rounded-xl pl-3 pr-9 py-3 text-sm font-bold focus:text-black focus:border-[#093832] outline-none disabled:bg-gray-100 disabled:text-gray-500 ${!fishType ? 'text-gray-400' : 'text-gray-700'}`}
                  >
                    <option value="" disabled>เลือกประเภท</option>
                    <option value="SMALL">ปลาตุ้ม</option>
                    <option value="LARGE">ปลานิ้ว</option>
                    <option value="MARKET">ปลาตลาด</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-black ml-1">จำนวนปลาที่ปล่อย</label>
                <div className="relative">
                  <input
                    disabled={!!activeCycle && activeCycle.status !== 'PLANNING'}
                    type="number"
                    placeholder="ระบุจำนวน"
                    value={fishReleased}
                    onChange={(e) => setFishReleased(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl pl-4 pr-10 py-3.5 text-sm font-bold text-gray-700 focus:text-black focus:border-[#093832] outline-none disabled:bg-gray-100 disabled:text-gray-500 placeholder:text-gray-400"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400 pointer-events-none">ตัว</span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-black ml-1">วันที่เริ่มปล่อยลงบ่อ</label>
              {(() => {
                const isDateDisabled = !!activeCycle && activeCycle.status !== 'PLANNING';
                return (
                  <div
                    onClick={isDateDisabled ? undefined : handleDateClick}
                    className={`relative w-full border border-gray-200 rounded-xl px-4 py-3.5 flex items-center justify-between ${isDateDisabled
                        ? 'bg-gray-100 cursor-not-allowed'
                        : 'bg-white cursor-pointer'
                      }`}
                  >
                    <span className={`text-sm font-bold pointer-events-none ${isDateDisabled
                        ? 'text-gray-400'
                        : !releaseDate ? 'text-gray-400' : 'text-black'
                      }`}>
                      {releaseDate ? new Date(releaseDate).toLocaleDateString('th-TH') : 'เลือกวันที่'}
                    </span>
                    <Calendar className={`w-5 h-5 pointer-events-none ${isDateDisabled ? 'text-gray-300' : 'text-gray-400'}`} />
                    <input
                      disabled={isDateDisabled}
                      ref={dateInputRef}
                      type="date"
                      value={releaseDate}
                      onChange={(e) => setReleaseDate(e.target.value)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:pointer-events-none"
                    />
                  </div>
                );
              })()}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-black ml-1">น้ำหนักปลาปัจจุบัน</label>
                <div className="relative">
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.1"
                    min="0"
                    placeholder="0"
                    value={fishSize}
                    onChange={(e) => setFishSize(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl pl-4 pr-12 py-3 text-sm font-bold text-gray-700 focus:text-black focus:border-[#093832] outline-none placeholder:text-gray-300"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400 pointer-events-none">กรัม</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-black ml-1">จำนวนปลาที่เหลือ</label>
                <div className="relative">
                  <input type="number" placeholder="ระบุจำนวน" value={fishRemaining} onChange={(e) => setFishRemaining(e.target.value)} className="w-full border border-gray-200 rounded-xl pl-4 pr-10 py-3.5 text-sm font-bold text-gray-700 focus:text-black focus:border-[#093832] outline-none placeholder:text-gray-400" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400 pointer-events-none">ตัว</span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-black ml-1">สูตรอาหาร</label>
              <div className="relative">
                <select value={feedFormulaId} onChange={(e) => setFeedFormulaId(e.target.value)} className={`w-full appearance-none border border-gray-200 rounded-xl pl-4 pr-10 py-3.5 text-sm font-bold focus:text-black focus:border-[#093832] outline-none ${!feedFormulaId ? 'text-gray-400' : 'text-gray-700'}`}>
                  <option value="" disabled>เลือกสูตรอาหาร</option>
                  {foodFormulas.length > 0 ? (
                    foodFormulas.map(f => (
                      <option key={f.id} value={f.id}>{f.name} ({f.foodType === 'FRESH' ? 'อาหารสด' : 'อาหารเม็ด'})</option>
                    ))
                  ) : (
                    <>
                      <option value="FRESH">อาหารสด</option>
                      <option value="PELLET">อาหารเม็ด</option>
                    </>
                  )}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-black ml-1">ปริมาณอาหาร</label>
              <div className="relative">
                <input type="number" inputMode="decimal" step="0.1" min="0" placeholder="ระบุจำนวน" value={foodAmount} onChange={(e) => setFoodAmount(e.target.value)} className="w-full border border-gray-200 rounded-xl pl-4 pr-16 py-3.5 text-sm font-bold text-gray-700 focus:text-black focus:border-[#093832] outline-none placeholder:text-gray-400" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400 pointer-events-none">กิโลกรัม</span>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-black ml-1">อาหารเสริม</label>
                <div className="relative">
                  <select value={supplementId} onChange={(e) => setSupplementId(e.target.value)} className={`w-full appearance-none border border-gray-200 rounded-xl pl-4 pr-10 py-3.5 text-sm font-bold focus:text-black focus:border-[#093832] outline-none ${!supplementId ? 'text-gray-400' : 'text-gray-700'}`}>
                    <option value="" disabled>เลือกอาหารเสริม</option>
                    {supplementFormulas.length > 0 ? (
                      supplementFormulas.map(f => (
                        <option key={f.id} value={f.id}>{f.name}</option>
                      ))
                    ) : (
                      <>
                        <option value="EM">จุลินทรีย์ EM</option>
                        <option value="VIT">วิตามินรวมเข้มข้น</option>
                      </>
                    )}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-black ml-1">การให้ยา</label>
                <div className="relative">
                  <select value={medicineType} onChange={(e) => setMedicineType(e.target.value)} className={`w-full appearance-none border border-gray-200 rounded-xl pl-4 pr-10 py-3.5 text-sm font-bold focus:text-black focus:border-[#093832] outline-none ${!medicineType ? 'text-gray-400' : 'text-gray-700'}`}>
                    <option value="" disabled>ระบุข้อมูลยา</option>
                    <option value="ANTIBIOTIC">ยาปฏิชีวนะละลายน้ำ</option>
                    <option value="FUNGAL">ยารักษาเชื้อรา</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-black ml-1">ค่าอาหาร</label>
                  <div className="relative">
                    <input type="number" placeholder="ระบุข้อมูล" value={foodCost} onChange={(e) => setFoodCost(e.target.value)} className="w-full border border-gray-200 rounded-xl pl-4 pr-12 py-3.5 text-sm font-bold text-gray-700 focus:text-black focus:border-[#093832] outline-none placeholder:text-gray-400" />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400 pointer-events-none">บาท</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-black ml-1">ค่ายา</label>
                  <div className="relative">
                    <input type="number" placeholder="ระบุข้อมูล" value={medicineCost} onChange={(e) => setMedicineCost(e.target.value)} className="w-full border border-gray-200 rounded-xl pl-4 pr-12 py-3.5 text-sm font-bold text-gray-700 focus:text-black focus:border-[#093832] outline-none placeholder:text-gray-400" />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400 pointer-events-none">บาท</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ปุ่มวิเคราะห์ข้อมูลหลัก */}
      {/* ปุ่มวิเคราะห์ข้อมูลหลัก (Static at bottom) */}
      <div className="mt-8 px-6 mb-10 flex justify-center">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full max-w-md bg-[#EF6E11] text-white text-xl font-extrabold py-4 rounded-[25px] active:scale-95 transition-all tracking-wide shadow-md disabled:opacity-50"
        >
          {isSubmitting ? 'กำลังบันทึก...' : 'เริ่มวิเคราะห์ข้อมูล'}
        </button>
      </div>

      {/* --- Reset Confirmation Modal --- */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsResetModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-sm rounded-[35px] p-8 text-center animate-in zoom-in duration-200 shadow-2xl">
            <div className="flex justify-center mb-5">
              <div className="bg-[#EF6E11]/10 p-5 rounded-full ring-8 ring-[#EF6E11]/5">
                <RefreshCw className="w-10 h-10 text-[#EF6E11]" />
              </div>
            </div>
            <h3 className="text-[#093832] text-xl font-extrabold mb-3">ยืนยันการเริ่มรอบใหม่?</h3>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed font-bold">ข้อมูลที่กรอกค้างไว้จะถูกล้างค่าทั้งหมด</p>
            <div className="flex flex-col gap-3">
              <button onClick={handleReset} className="w-full bg-[#EF6E11] text-white font-bold py-4 rounded-2xl shadow-md">ยืนยันการเริ่มรอบใหม่</button>
              <button onClick={() => setIsResetModalOpen(false)} className="w-full bg-gray-100 text-[#093832] font-bold py-4 rounded-2xl">ยกเลิก</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
