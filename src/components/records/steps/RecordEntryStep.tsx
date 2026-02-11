'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, Calendar, RefreshCw, ChevronDown, Check } from 'lucide-react';
import { ProfileDropdownMenu } from '@/components/common/ProfileDropdownMenu';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://dukefarm-backend.onrender.com/api";

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
const FARM_TYPE_LABELS: Record<string, string> = { SMALL: 'ปลาตุ้ม', LARGE: 'ปลานิ้ว', MARKET: 'ปลาตลาด' };

interface RecordEntryStepProps {
  onAnalyze: () => void;
  onBack: () => void;
}

export const RecordEntryStep: React.FC<RecordEntryStepProps> = ({ onAnalyze, onBack }) => {
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dateInputRef = useRef<HTMLInputElement>(null);

  // User ponds from profile
  const [ponds, setPonds] = useState<PondInfo[]>([]);

  // Form state
  const [selectedPondId, setSelectedPondId] = useState('');
  const [fishType, setFishType] = useState('');
  const [fishSize, setFishSize] = useState('');
  const [fishSizeUnit, setFishSizeUnit] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [releaseTime, setReleaseTime] = useState(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }));
  const [fishReleased, setFishReleased] = useState('');
  const [fishRemaining, setFishRemaining] = useState('');
  const [feedFormulaId, setFeedFormulaId] = useState('');
  const [foodAmount, setFoodAmount] = useState('');
  const [foodUnit, setFoodUnit] = useState('');
  const [supplementId, setSupplementId] = useState('');
  const [medicineType, setMedicineType] = useState('');
  const [foodCost, setFoodCost] = useState('');
  const [medicineCost, setMedicineCost] = useState('');
  const [activeCycle, setActiveCycle] = useState<any>(null);

  // Dynamic dropdown options
  const [foodFormulas, setFoodFormulas] = useState<FormulaOption[]>([]);
  const [supplementFormulas, setSupplementFormulas] = useState<FormulaOption[]>([]);

  // Load ponds from user profile in localStorage
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        const profilePonds = user?.farmerProfile?.ponds;
        if (Array.isArray(profilePonds) && profilePonds.length > 0) {
          setPonds(profilePonds.map((p: any) => ({
            id: p.id,
            pondType: p.pondType || 'EARTHEN',
            farmType: p.farmType || 'SMALL',
            widthM: Number(p.widthM) || 0,
            lengthM: Number(p.lengthM) || 0,
            depthM: Number(p.depthM) || 0,
            volumeM3: Number(p.volumeM3) || 0,
          })));
          // Auto-select first pond
          if (profilePonds.length > 0) {
            setSelectedPondId(profilePonds[0].id);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load ponds from profile', err);
    }
  }, []);

  // Fetch feed formulas and supplements from API
  useEffect(() => {
    const fetchFormulas = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

        const [freshRes, pelletRes, suppRes] = await Promise.all([
          fetch(`${API_BASE_URL}/feed-formulas?foodType=FRESH&limit=50`, { headers }),
          fetch(`${API_BASE_URL}/feed-formulas?foodType=PELLET&limit=50`, { headers }),
          fetch(`${API_BASE_URL}/feed-formulas?foodType=SUPPLEMENT&limit=50`, { headers }),
        ]);

        const foods: FormulaOption[] = [];
        const supps: FormulaOption[] = [];

        if (freshRes.ok) {
          const r = await freshRes.json();
          (r.data || []).forEach((f: any) => foods.push({ id: f.id, name: f.name, foodType: 'FRESH' }));
        }
        if (pelletRes.ok) {
          const r = await pelletRes.json();
          (r.data || []).forEach((f: any) => foods.push({ id: f.id, name: f.name, foodType: 'PELLET' }));
        }
        if (suppRes.ok) {
          const r = await suppRes.json();
          (r.data || []).forEach((f: any) => supps.push({ id: f.id, name: f.name, foodType: 'SUPPLEMENT' }));
        }

        setFoodFormulas(foods);
        setSupplementFormulas(supps);
      } catch (err) {
        console.error('Failed to fetch feed formulas', err);
      }
    };

    fetchFormulas();
  }, []);

  useEffect(() => {
    if (isResetModalOpen || isSuccessModalOpen) {
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
  }, [isResetModalOpen, isSuccessModalOpen]);

  const handleOpenPicker = () => {
    if (dateInputRef.current) {
      try {
        (dateInputRef.current as any).showPicker();
      } catch {
        dateInputRef.current.click();
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
          if (data) {
            // Lock fields with cycle data
            if (data.startDate) {
              const startDateTime = new Date(data.startDate);
              setReleaseDate(startDateTime.toISOString().split('T')[0]);
              setReleaseTime(startDateTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }));
            }
            if (data.initialStockCount) setFishReleased(String(data.initialStockCount));
            // Maybe set fishSize/Unit if initialAvgWeightKg exists? 
            // Users might want to record current size, so maybe don't lock fishSize?
            // User said: "Initial data (release date, initial count, fish type) should be locked"
          } else {
            // No active cycle, unlock
            // Don't auto-clear here to verify user intent? Or clear 'locked' fields?
            // Let's rely on manual clear or initial state
          }
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
    setFishSizeUnit('');
    setReleaseDate('');
    setFishReleased('');
    setFishRemaining('');
    setFeedFormulaId('');
    setFoodAmount('');
    setFoodUnit('');
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

      const body: Record<string, any> = {
        farmType: fishType || undefined,
        recordedAt: releaseDate ? new Date(`${releaseDate}T${releaseTime}`).toISOString() : new Date().toISOString(),
        fishAgeLabel: fishType === 'SMALL' ? 'ปลาตุ้ม' : fishType === 'LARGE' ? 'ปลานิ้ว' : fishType === 'MARKET' ? 'ปลาตลาด' : 'ไม่ระบุ',
        pondId: selectedPondId || undefined,
        fishCount: fishReleased ? parseInt(fishReleased, 10) : undefined,
        fishCountText: undefined,
        fishRemaining: fishRemaining ? parseInt(fishRemaining, 10) : undefined,
        averageFishWeightGr: fishSize ? (fishSizeUnit === 'KG' ? parseFloat(fishSize) * 1000 : parseFloat(fishSize)) : undefined,
        foodAmountKg: foodAmount ? (foodUnit === 'G' ? parseFloat(foodAmount) / 1000 : parseFloat(foodAmount)) : undefined,
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

      if (res.ok) {
        setIsSuccessModalOpen(true);
        setTimeout(() => {
          setIsSuccessModalOpen(false);
          onAnalyze();
        }, 1500);
      } else {
        const err = await res.json().catch(() => null);
        console.error('Failed to save record', err);
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
    <div className="min-h-screen bg-white relative pb-32">
      {/* Header */}
      <div className="bg-[#093832] text-white px-4 pt-8 pb-10 rounded-b-[40px] shadow-md relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="p-1 hover:bg-white/10 rounded-full transition-colors">
            <ChevronLeft className="w-8 h-8" />
          </button>
          <h1 className="text-2xl font-bold">กรอกข้อมูล</h1>
        </div>
        <ProfileDropdownMenu showGreeting={false} />
      </div>

      <div className="px-5 mt-6 space-y-6">
        {/* Pond selector if multiple ponds */}
        {ponds.length > 1 && (
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-black ml-1">เลือกบ่อ</label>
            <div className="relative">
              <select
                value={selectedPondId}
                onChange={(e) => setSelectedPondId(e.target.value)}
                className="w-full appearance-none border border-gray-200 rounded-xl pl-4 pr-10 py-3.5 text-sm font-bold text-gray-700 focus:text-black focus:border-[#093832] outline-none"
              >
                {ponds.map((pond, idx) => (
                  <option key={pond.id} value={pond.id}>บ่อที่ {idx + 1} — {POND_TYPE_LABELS[pond.pondType] || pond.pondType}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        )}

        <div className="border border-gray-100 rounded-3xl shadow-lg overflow-hidden pb-6 bg-white">
          <div className="bg-[#093832] px-5 py-4 text-white">
            <span className="font-extrabold text-lg tracking-wide">
              − {selectedPond ? `บ่อที่ ${ponds.indexOf(selectedPond) + 1}` : 'บ่อที่ 1'}
            </span>
          </div>

          <div className="px-4 pt-4 space-y-5">
            <div className="flex justify-end pr-1">
              <button
                onClick={() => setIsResetModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#EF6E11]/10 border border-[#EF6E11] rounded-full text-[#EF6E11] text-[11px] font-bold active:scale-95 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                เริ่มรอบการเลี้ยงใหม่
              </button>
            </div>

            {/* Pond info from real data */}
            <div className="text-xs text-[#093832] font-bold leading-relaxed bg-[#CEF2D6]/40 p-4 rounded-2xl border border-[#CEF2D6]">
              {selectedPond ? (
                <>
                  <p>{POND_TYPE_LABELS[selectedPond.pondType] || selectedPond.pondType} • {FARM_TYPE_LABELS[selectedPond.farmType] || selectedPond.farmType}</p>
                  <p>กว้าง {selectedPond.widthM} x ยาว {selectedPond.lengthM} x ลึก {selectedPond.depthM}</p>
                  <p>ปริมาตร = {selectedPond.volumeM3} ลูกบาศก์เมตร หรือ {formatVolumeLiters(selectedPond.volumeM3)} ลิตร</p>
                </>
              ) : (
                <p className="text-gray-400">ไม่พบข้อมูลบ่อ</p>
              )}
            </div>

            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-5 space-y-1.5">
                <label className="text-sm font-bold text-black ml-1">ประเภทปลา</label>
                <div className="relative">
                  <select disabled={!!activeCycle} value={fishType} onChange={(e) => setFishType(e.target.value)} className="w-full appearance-none bg-white border border-gray-200 rounded-xl pl-3 pr-9 py-3 text-xs font-bold text-gray-700 focus:text-black focus:border-[#093832] outline-none disabled:bg-gray-100 disabled:text-gray-500">
                    <option value="" disabled>เลือกประเภท</option>
                    <option value="SMALL">ปลาตุ้ม</option>
                    <option value="LARGE">ปลานิ้ว</option>
                    <option value="MARKET">ปลาตลาด</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div className="col-span-3 space-y-1.5">
                <label className="text-sm font-bold text-black text-center block">ขนาดปลา</label>
                <input type="number" placeholder="0" value={fishSize} onChange={(e) => setFishSize(e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-2 py-3 text-xs font-bold text-center text-gray-700 focus:text-black focus:border-[#093832] outline-none placeholder:text-gray-400" />
              </div>
              <div className="col-span-4 space-y-1.5">
                <label className="text-sm font-bold text-black ml-1">หน่วย</label>
                <div className="relative">
                  <select value={fishSizeUnit} onChange={(e) => setFishSizeUnit(e.target.value)} className="w-full appearance-none bg-white border border-gray-200 rounded-xl pl-3 pr-8 py-3 text-xs font-bold text-gray-700 focus:text-black focus:border-[#093832] outline-none">
                    <option value="" disabled>เลือกหน่วย</option>
                    <option value="G">กรัม</option>
                    <option value="KG">กิโลกรัม</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-black ml-1">วันที่และเวลาที่บันทึก/ปล่อย</label>
              <div className="flex gap-2">
                <div onClick={handleOpenPicker} className="relative flex-1 bg-[#CEF2D6] border border-[#093832]/10 rounded-xl px-4 py-3.5 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all">
                  <span className="text-sm font-extrabold text-[#093832]">
                    {releaseDate ? new Date(releaseDate).toLocaleDateString('th-TH') : 'เลือกวันที่'}
                  </span>
                  <Calendar className="w-5 h-5 text-[#093832]" />
                  <input disabled={!!activeCycle} ref={dateInputRef} type="date" value={releaseDate} onChange={(e) => setReleaseDate(e.target.value)} className="absolute inset-0 opacity-0 pointer-events-none disabled:pointer-events-none" />
                </div>
                <div className="w-[110px] bg-white border border-gray-200 rounded-xl px-2 relative flex items-center">
                  <input
                    disabled={!!activeCycle}
                    type="time"
                    value={releaseTime}
                    onChange={(e) => setReleaseTime(e.target.value)}
                    className="w-full text-center text-sm font-bold text-gray-700 focus:text-black outline-none disabled:bg-transparent disabled:text-gray-500"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-black ml-1">จำนวนปลาที่ปล่อย (ตัว)</label>
                <input disabled={!!activeCycle} type="number" placeholder="ระบุจำนวน" value={fishReleased} onChange={(e) => setFishReleased(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-bold text-gray-700 focus:text-black focus:border-[#093832] outline-none disabled:bg-gray-100 disabled:text-gray-500" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-black ml-1">จำนวนปลาที่เหลือ</label>
                <input type="number" placeholder="ระบุจำนวน" value={fishRemaining} onChange={(e) => setFishRemaining(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-bold text-gray-700 focus:text-black focus:border-[#093832] outline-none" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-black ml-1">สูตรอาหาร</label>
              <div className="relative">
                <select value={feedFormulaId} onChange={(e) => setFeedFormulaId(e.target.value)} className="w-full appearance-none border border-gray-200 rounded-xl pl-4 pr-10 py-3.5 text-sm font-bold text-gray-700 focus:text-black focus:border-[#093832] outline-none">
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

            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-8 space-y-1.5">
                <label className="text-sm font-bold text-black ml-1">ปริมาณอาหาร</label>
                <input type="text" placeholder="ระบุจำนวน เช่น 5, 10, 15" value={foodAmount} onChange={(e) => setFoodAmount(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-bold text-gray-700 focus:text-black focus:border-[#093832] outline-none" />
              </div>
              <div className="col-span-4 space-y-1.5">
                <label className="text-sm font-bold text-black ml-1">หน่วย</label>
                <div className="relative">
                  <select value={foodUnit} onChange={(e) => setFoodUnit(e.target.value)} className="w-full appearance-none border border-gray-200 rounded-xl pl-3 pr-8 py-3.5 text-sm font-bold text-gray-700 focus:text-black focus:border-[#093832] outline-none">
                    <option value="" disabled>หน่วย</option>
                    <option value="KG">กิโลกรัม</option>
                    <option value="G">กรัม</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-black ml-1">อาหารเสริม</label>
                <div className="relative">
                  <select value={supplementId} onChange={(e) => setSupplementId(e.target.value)} className="w-full appearance-none border border-gray-200 rounded-xl pl-4 pr-10 py-3.5 text-sm font-bold text-gray-700 focus:text-black focus:border-[#093832] outline-none">
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
                  <select value={medicineType} onChange={(e) => setMedicineType(e.target.value)} className="w-full appearance-none border border-gray-200 rounded-xl pl-4 pr-10 py-3.5 text-sm font-bold text-gray-700 focus:text-black focus:border-[#093832] outline-none">
                    <option value="" disabled>ระบุข้อมูลยา</option>
                    <option value="ANTIBIOTIC">ยาปฏิชีวนะละลายน้ำ</option>
                    <option value="FUNGAL">ยารักษาเชื้อรา</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-black ml-1">ค่าอาหาร (บาท)</label>
                  <input type="number" placeholder="ระบุข้อมูล" value={foodCost} onChange={(e) => setFoodCost(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-bold text-gray-700 focus:text-black outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-black ml-1">ค่ายา (บาท)</label>
                  <input type="number" placeholder="ระบุข้อมูล" value={medicineCost} onChange={(e) => setMedicineCost(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-bold text-gray-700 focus:text-black outline-none" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ปุ่มวิเคราะห์ข้อมูลหลัก */}
      <div className="fixed bottom-8 left-0 right-0 px-6 z-20 flex justify-center">
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

      {/* --- Modal บันทึกข้อมูลสำเร็จ --- */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
          <div className="relative bg-white w-full max-w-[280px] rounded-[32px] p-8 text-center animate-in zoom-in duration-300 shadow-2xl">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-[#22C55E] rounded-full flex items-center justify-center shadow-lg shadow-green-100">
                <Check className="w-10 h-10 text-white" strokeWidth={4} />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#093832]">บันทึกข้อมูลสำเร็จ</p>
          </div>
        </div>
      )}
    </div>
  );
};
