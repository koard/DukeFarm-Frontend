"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Check, Trash2, Plus, AlertTriangle } from "lucide-react";
import { useLineUser } from "@/hooks/useLineUser";
import dynamic from "next/dynamic";
import {
  FarmTypeOption,
  FarmTypeProfileLike,
  FARM_TYPE_PRIORITY,
  deriveFarmTypesFromProfile,
  mapFarmTypeToRoute,
} from "@/utils/farmTypes";
import { API_BASE_URL } from "@/config/api";

type PondData = {
  id: number;
  backendId?: string;
  type: 'EARTHEN' | 'CONCRETE' | null;
  farmType: 'SMALL' | 'LARGE' | 'MARKET' | null;
  width: string;
  length: string;
  depth: string;
};

type ProfileFormState = {
  firstName: string;
  lastName: string;
  phone: string;
  farmTypes: FarmTypeOption[];
  raiCount: string;
  totalPondCount: string;
  location: string;
};

type FarmerProfile = FarmTypeProfileLike & {
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  primaryFarmType?: string | null;
  declaredRaiCount?: number | string | null;
  declaredPondCount?: number | string | null;
  farmAreaRai?: number | string | null;
  pondsPerRai?: number | string | null;
  totalFarmAreaRai?: number | string | null;
  totalPondCount?: number | string | null;
  farmLatitude?: number | string | null;
  farmLongitude?: number | string | null;

  ponds?: Array<{
    id: string;
    pondType: 'EARTHEN' | 'CONCRETE';
    farmType: 'SMALL' | 'LARGE' | 'MARKET';
    widthM: number;
    lengthM: number;
    depthM: number;
    volumeM3?: number;
  }>;
};

const FARM_TYPE_INFO: Record<FarmTypeOption, { label: string; description: string }> = {
  SMALL: { label: "ปลาตุ้ม", description: "อายุ 7-10 วัน" },
  LARGE: { label: "ปลานิ้ว", description: "อายุ 11-30 วัน" },
  MARKET: { label: "ปลาตลาด", description: "อายุ 31-180 วัน" },
};

const MapPicker = dynamic(() => import("../register-farmer/MapPicker"), {
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500">กำลังโหลดแผนที่...</div>
});

const formatNumericInput = (value: unknown): string => {
  if (typeof value === "number" && !Number.isNaN(value)) return String(value);
  if (typeof value === "string") return value;
  return "";
};

const parseCoordinate = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = parseFloat(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
};

const parseLocationValue = (value: string): { lat: number; lng: number } | null => {
  const [latStr, lngStr] = value.split(",").map((part) => part.trim());
  const lat = parseFloat(latStr || "");
  const lng = parseFloat(lngStr || "");
  if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
  return null;
};

export default function ProfilePage() {
  const router = useRouter();
  const lineUser = useLineUser();

  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [showMap, setShowMap] = useState(false);

  const [deleteModalId, setDeleteModalId] = useState<number | null>(null);

  const [formData, setFormData] = useState<ProfileFormState>({
    firstName: "",
    lastName: "",
    phone: "",
    farmTypes: [],
    raiCount: "",
    totalPondCount: "",
    location: "",
  });

  const [recordPondCount, setRecordPondCount] = useState('1');

  const [ponds, setPonds] = useState<PondData[]>([]);

  const [initialCoords, setInitialCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [tempCoords, setTempCoords] = useState({ lat: 0, lng: 0 });

  const populateFormFromProfile = useCallback((profile?: FarmerProfile) => {
    const lat = parseCoordinate(profile?.farmLatitude);
    const lng = parseCoordinate(profile?.farmLongitude);
    const coords = lat !== null && lng !== null ? { lat, lng } : null;
    const farmTypes = deriveFarmTypesFromProfile(profile);

    const areaSource =
      profile?.totalFarmAreaRai ??
      profile?.farmAreaRai ??
      profile?.declaredRaiCount;

    const pondCountSource = profile?.declaredPondCount;

    setFormData({
      firstName: profile?.firstName || "",
      lastName: profile?.lastName || "",
      phone: profile?.phone || "",
      farmTypes,
      raiCount: formatNumericInput(areaSource),
      totalPondCount: formatNumericInput(pondCountSource),
      location: coords
        ? `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`
        : "",
    });

    if (coords) {
      setInitialCoords(coords);
      setTempCoords(coords);
    } else {
      setInitialCoords(null);
      setTempCoords({ lat: 0, lng: 0 });
    }

    if (
      profile?.ponds &&
      Array.isArray(profile.ponds) &&
      profile.ponds.length > 0
    ) {
      const mappedPonds: PondData[] = profile.ponds.map((p, index) => ({
        id: Date.now() + index,
        backendId: p.id,
        type: p.pondType,
        farmType: p.farmType || 'SMALL',
        width: String(p.widthM),
        length: String(p.lengthM),
        depth: String(p.depthM),
      }));
      setPonds(mappedPonds);
      setRecordPondCount(String(mappedPonds.length));
    } else {
      setPonds([
        { id: Date.now(), type: null, farmType: null, width: "", length: "", depth: "" },
      ]);
      setRecordPondCount('1');
    }
  }, []);


  const farmOptions = (Object.keys(FARM_TYPE_INFO) as FarmTypeOption[]).map((value) => ({
    value,
    label: FARM_TYPE_INFO[value].label,
    description: FARM_TYPE_INFO[value].description,
  }));

  const hasValidLocation = Boolean(parseLocationValue(formData.location));
  const isPondsValid = ponds.every(p => {
    const w = parseFloat(p.width);
    const l = parseFloat(p.length);
    const d = parseFloat(p.depth);
    return p.type && p.farmType && !isNaN(w) && w > 0 && !isNaN(l) && l > 0 && !isNaN(d) && d > 0;
  });
  const isFormValid =
    formData.firstName.trim() !== "" &&
    formData.lastName.trim() !== "" &&
    formData.phone.trim() !== "" &&
    formData.farmTypes.length > 0 &&
    formData.raiCount.trim() !== "" &&
    formData.totalPondCount.trim() !== "" &&
    ponds.length > 0 &&
    isPondsValid &&
    hasValidLocation;

  useEffect(() => {
    const loadProfile = async () => {
      // First try localStorage
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          populateFormFromProfile(userData?.farmerProfile);
        } catch (err) {
          console.error("Error loading profile from localStorage:", err);
        }
      }

      // Also fetch from API to ensure data is up-to-date
      try {
        const token = localStorage.getItem("authToken");
        if (token) {
          const res = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const { data } = await res.json();
            if (data?.farmerProfile) {
              populateFormFromProfile(data.farmerProfile);
              // Update localStorage with fresh data
              const currentRaw = localStorage.getItem("user");
              const current = currentRaw ? JSON.parse(currentRaw) : {};
              const merged = { ...current, ...data, farmerProfile: { ...(current.farmerProfile ?? {}), ...data.farmerProfile } };
              localStorage.setItem("user", JSON.stringify(merged));
            }
          }
        }
      } catch (apiErr) {
        console.warn("Could not fetch profile from API, using localStorage", apiErr);
      }

      setLoading(false);
    };

    loadProfile();
  }, [populateFormFromProfile]);

  useEffect(() => {
    if (submitStatus !== 'idle' || showMap || deleteModalId !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [submitStatus, showMap, deleteModalId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isEditing) return;
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectFarmType = (typeValue: FarmTypeOption) => {
    if (!isEditing) return;
    setFormData((prev) => {
      const exists = prev.farmTypes.includes(typeValue);
      return {
        ...prev,
        farmTypes: exists
          ? prev.farmTypes.filter((t) => t !== typeValue)
          : [...prev.farmTypes, typeValue],
      };
    });
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setTempCoords({ lat, lng });
  };

  const confirmLocation = () => {
    if (!isEditing) return;
    setFormData(prev => ({
      ...prev,
      location: `${tempCoords.lat.toFixed(6)}, ${tempCoords.lng.toFixed(6)}`
    }));
    setInitialCoords({ lat: tempCoords.lat, lng: tempCoords.lng });
    setShowMap(false);
  };

  const handleAddPond = () => {
    const newPonds = [...ponds, { id: Date.now(), type: null, farmType: null, width: '', length: '', depth: '' }];
    setPonds(newPonds);
    setRecordPondCount(String(newPonds.length));
  };

  const handleClickRemovePond = (id: number) => {
    if (!isEditing) return;
    if (ponds.length <= 1) return;
    setDeleteModalId(id);
  };

  const confirmRemovePond = () => {
    if (deleteModalId !== null) {
      const newPonds = ponds.filter(p => p.id !== deleteModalId);
      setPonds(newPonds);
      setRecordPondCount(String(newPonds.length));
      setDeleteModalId(null);
    }
  };

  const cancelRemovePond = () => {
    setDeleteModalId(null);
  };

  const handlePondChange = (id: number, field: keyof PondData, value: string) => {
    if (!isEditing) return;
    setPonds(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const calculateVolume = (w: string, l: string, d: string) => {
    const width = parseFloat(w);
    const length = parseFloat(l);
    const depth = parseFloat(d);
    if (!isNaN(width) && !isNaN(length) && !isNaN(depth)) {
      const volumeM3 = width * length * depth;
      const volumeLiters = volumeM3 * 1000;
      return { m3: volumeM3, liters: volumeLiters };
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditing || submitStatus === 'loading') return;

    if (!isFormValid) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    const coords = parseLocationValue(formData.location);
    if (!coords) {
      alert("กรุณาเลือกตำแหน่งฟาร์มบนแผนที่");
      return;
    }

    const farmAreaRai = parseFloat(formData.raiCount);
    if (Number.isNaN(farmAreaRai)) {
      alert("กรุณาระบุจำนวนไร่เป็นตัวเลข");
      return;
    }

    const sortedFarmTypes = [...formData.farmTypes].sort(
      (a, b) => FARM_TYPE_PRIORITY.indexOf(a) - FARM_TYPE_PRIORITY.indexOf(b)
    );
    const primaryFarmType = sortedFarmTypes[0] ?? "SMALL";

    const token = localStorage.getItem("authToken");
    if (!token) {
      alert("ไม่พบ Token กรุณาเข้าสู่ระบบใหม่");
      router.push("/login");
      return;
    }

    setSubmitStatus('loading');

    try {
      const requestBody = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        primaryFarmType,
        farmTypes: formData.farmTypes,
        farmAreaRai,
        declaredPondCount: parseInt(formData.totalPondCount) || 0,
        farmLatitude: coords.lat,
        farmLongitude: coords.lng,

        ponds: ponds.map(p => ({
          pondType: p.type,
          farmType: p.farmType,
          widthM: parseFloat(p.width) || 0,
          lengthM: parseFloat(p.length) || 0,
          depthM: parseFloat(p.depth) || 0
        }))
      };

      const response = await fetch(`${API_BASE_URL}/register/farmer`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        if (response.status === 401) {
          setSubmitStatus('idle');
          router.push("/login");
          return;
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "ไม่สามารถบันทึกข้อมูลได้");
      }

      const result = await response.json();
      const latestFarmProfile = result?.data?.profile ?? result?.data;
      const latestUserState = result?.data?.user;

      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        if (latestFarmProfile) userData.farmerProfile = latestFarmProfile;
        if (latestUserState) {
          userData.role = latestUserState.role;
          userData.registrationStatus = latestUserState.registrationStatus;
        }
        localStorage.setItem("user", JSON.stringify(userData));
      }

      if (latestFarmProfile) populateFormFromProfile(latestFarmProfile);

      const destination = mapFarmTypeToRoute(latestFarmProfile?.primaryFarmType || primaryFarmType);
      setSubmitStatus('success');
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsEditing(false);
      setSubmitStatus('idle');
      router.push(destination);

    } catch (err) {
      console.error("Error updating profile:", err);
      setSubmitStatus('idle');
      alert(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">กำลังโหลด...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">

      {/* Loading/Success Modal */}
      {submitStatus !== 'idle' && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 flex flex-col items-center justify-center shadow-2xl w-64 h-48 animate-in fade-in zoom-in duration-300">
            {submitStatus === 'loading' && (
              <>
                <div className="w-12 h-12 border-4 border-emerald-100 border-t-[#0F3B35] rounded-full animate-spin mb-4"></div>
                <span className="text-lg font-medium text-gray-600">กำลังบันทึก</span>
              </>
            )}
            {submitStatus === 'success' && (
              <>
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-3 animate-in zoom-in duration-300">
                  <Check className="w-8 h-8 text-green-600" strokeWidth={3} />
                </div>
                <span className="text-lg font-bold text-green-700">บันทึกสำเร็จ</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalId !== null && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">ยืนยันการลบ</h3>
              <p className="text-gray-500 text-sm mb-6">
                คุณต้องการลบข้อมูลบ่อนี้ใช่หรือไม่? <br /> ข้อมูลที่กรอกไว้จะหายไป
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={cancelRemovePond}
                  className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={confirmRemovePond}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 shadow-md transition-colors"
                >
                  ลบ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Map Popup */}
      {showMap && (
        <div className="fixed inset-0 z-50 flex justify-center bg-gray-50">
          <div className="w-full max-w-md md:max-w-full lg:max-w-full bg-white flex flex-col h-full relative shadow-xl">
            <div className="bg-[#0F3B35] text-white px-4 pt-8 pb-10 rounded-b-[40px] shadow-md relative z-20 flex items-center gap-3">
              <button onClick={() => setShowMap(false)} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                <ChevronLeft className="w-8 h-8" />
              </button>
              <div className="flex items-center gap-2 text-2xl font-bold">
                <Image src="/register-farmer/map.svg" alt="Map" width={24} height={24} className="invert brightness-0 filter" />
                <span>ตรวจสอบพื้นที่ให้ถูกต้อง</span>
              </div>
            </div>
            <div className="flex-1 relative z-10">
              <MapPicker onLocationSelect={handleLocationSelect} initialPosition={initialCoords} />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-6 pointer-events-none flex justify-center z-30">
              <button
                onClick={confirmLocation}
                className="pointer-events-auto w-full max-w-md bg-[#72B544] hover:bg-[#5da035] text-white text-xl font-bold py-3 rounded-xl shadow-lg"
              >
                ยืนยัน
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Form */}
      <div className="w-full max-w-md md:max-w-full lg:max-w-full bg-white min-h-screen shadow-xl relative pb-10">

        <div className="bg-[#093832] text-white px-4 pt-5 pb-4 rounded-b-3xl shadow-md relative z-20">
          <div className="flex items-center gap-2 mb-2">
            <button onClick={() => router.back()} className="p-1 hover:bg-white/10 rounded-full transition-colors">
              <ChevronLeft className="w-7 h-7" />
            </button>
            <div className="flex items-center gap-2 text-2xl font-bold">
              <span>ข้อมูลโปรไฟล์</span>
            </div>
          </div>
        </div>

        <div className="px-6 relative z-20">
          <div className="flex items-center gap-4 mb-6 mt-4">
            <div className="w-20 h-20 rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-200">
              <Image
                src={lineUser.pictureUrl || "https://placehold.co/200x200?text=Profile"}
                alt="Profile"
                width={80}
                height={80}
                className="w-full h-full object-cover"
                unoptimized
              />
            </div>
            <div className="pt-2">
              <p className="text-xs text-gray-500 font-medium">โปรไฟล์ของ</p>
              <h2 className="text-2xl font-bold text-gray-900">{lineUser.displayName}</h2>
            </div>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-base font-bold text-black">ชื่อ</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="ระบุข้อมูล"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F3B35] text-black text-xs placeholder:text-xs placeholder:text-gray-500 disabled:bg-gray-100 disabled:text-gray-600"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-base font-bold text-black">นามสกุล</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="ระบุข้อมูล"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F3B35] text-black text-xs placeholder:text-xs placeholder:text-gray-500 disabled:bg-gray-100 disabled:text-gray-600"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-base font-bold text-black">เบอร์โทร</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="ระบุข้อมูล"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F3B35] text-black text-xs placeholder:text-xs placeholder:text-gray-500 disabled:bg-gray-100 disabled:text-gray-600"
              />
            </div>

            <div className="space-y-3 pt-2">
              <label className="text-base font-bold text-black">ประเภทกลุ่มการเลี้ยง (เลือกได้มากกว่า 1)</label>
              <div className="space-y-3 pl-1">
                {farmOptions.map((option) => {
                  const isSelected = formData.farmTypes.includes(option.value);
                  return (
                    <div
                      key={option.value}
                      onClick={() => handleSelectFarmType(option.value)}
                      className={`flex items-start gap-3 select-none ${isEditing ? "cursor-pointer" : "cursor-not-allowed opacity-60"
                        }`}
                    >
                      <div
                        className={`mt-0.5 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${isSelected
                          ? "bg-[#72B544] border-[#72B544]"
                          : "border-gray-300 bg-white"
                          }`}
                      >
                        {isSelected && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                      </div>
                      <div>
                        <span className="text-base text-black font-medium block">{option.label}</span>
                        <span className="text-xs text-gray-400">({option.description})</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-base font-bold text-black">จำนวนไร่</label>
                <div className="relative">
                  <input
                    type="number"
                    name="raiCount"
                    value={formData.raiCount}
                    onChange={handleChange}
                    placeholder="ระบุข้อมูล"
                    disabled={!isEditing}
                    className="w-full pr-14 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F3B35] text-black text-xs placeholder:text-xs placeholder:text-gray-500 disabled:bg-gray-100 disabled:text-gray-600"
                  />
                  <span className="absolute inset-y-0 right-4 flex items-center text-xs font-semibold text-gray-500">ไร่</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-base font-bold text-black">จำนวนบ่อทั้งหมด</label>
                <div className="relative">
                  <input
                    type="number"
                    name="totalPondCount"
                    value={formData.totalPondCount}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="ระบุข้อมูล"
                    className="w-full pr-14 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F3B35] text-black text-xs disabled:bg-gray-100 disabled:text-gray-600"
                  />
                  <span className="absolute inset-y-0 right-4 flex items-center text-xs font-semibold text-gray-500">บ่อ</span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-base font-bold text-black">จำนวนบ่อที่ต้องการบันทึกข้อมูล</label>
              <div className="relative">
                <input
                  type="number"
                  value={recordPondCount}
                  disabled={!isEditing}
                  onChange={(e) => {
                    const val = e.target.value;
                    setRecordPondCount(val);
                    const count = parseInt(val, 10);
                    if (!isNaN(count) && count >= 1 && count <= 20) {
                      setPonds(prev => {
                        if (count > prev.length) {
                          const newPonds = [...prev];
                          for (let i = prev.length; i < count; i++) {
                            newPonds.push({ id: Date.now() + i, type: null, farmType: null, width: '', length: '', depth: '' });
                          }
                          return newPonds;
                        } else if (count < prev.length) {
                          return prev.slice(0, count);
                        }
                        return prev;
                      });
                    }
                  }}
                  placeholder="ระบุข้อมูล"
                  min="1"
                  max="20"
                  className="w-full pr-14 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F3B35] text-black text-xs disabled:bg-gray-100 disabled:text-gray-600"
                />
                <span className="absolute inset-y-0 right-4 flex items-center text-xs font-semibold text-gray-500">บ่อ</span>
              </div>
            </div>

            <div className="space-y-4">
              {ponds.map((pond, index) => {
                const volume = calculateVolume(pond.width, pond.length, pond.depth);
                return (
                  <div key={pond.id} className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                    <div className="bg-[#093832] px-4 py-2 flex justify-between items-center text-white">
                      <span className="font-bold">− บ่อที่ {index + 1}</span>
                      {isEditing && ponds.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleClickRemovePond(pond.id)}
                          className="flex items-center gap-1 text-xs hover:text-red-300 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" /> ลบ
                        </button>
                      )}
                    </div>

                    <div className="p-4 bg-gray-50 space-y-4">
                      <div className="flex gap-6">
                        <label className={`flex items-center gap-2 ${isEditing ? "cursor-pointer" : "cursor-default opacity-60"}`}>
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${pond.type === 'EARTHEN' ? 'border-[#72B544]' : 'border-gray-400 bg-white'}`}>
                            {pond.type === 'EARTHEN' && <div className="w-3 h-3 bg-[#72B544] rounded-full" />}
                          </div>
                          <input
                            type="radio"
                            className="hidden"
                            disabled={!isEditing}
                            checked={pond.type === 'EARTHEN'}
                            onChange={() => handlePondChange(pond.id, 'type', 'EARTHEN')}
                          />
                          <span className="text-sm text-black">บ่อดิน</span>
                        </label>
                        <label className={`flex items-center gap-2 ${isEditing ? "cursor-pointer" : "cursor-default opacity-60"}`}>
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${pond.type === 'CONCRETE' ? 'border-[#72B544]' : 'border-gray-400 bg-white'}`}>
                            {pond.type === 'CONCRETE' && <div className="w-3 h-3 bg-[#72B544] rounded-full" />}
                          </div>
                          <input
                            type="radio"
                            className="hidden"
                            disabled={!isEditing}
                            checked={pond.type === 'CONCRETE'}
                            onChange={() => handlePondChange(pond.id, 'type', 'CONCRETE')}
                          />
                          <span className="text-sm text-black">บ่อปูน</span>
                        </label>
                      </div>


                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs text-black font-medium">กว้าง (เมตร)</label>
                          <input
                            type="number"
                            value={pond.width}
                            disabled={!isEditing}
                            placeholder="0.00"
                            onChange={(e) => handlePondChange(pond.id, 'width', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs text-black focus:outline-none focus:ring-1 focus:ring-[#0F3B35] disabled:bg-gray-100 disabled:text-gray-600"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-black font-medium">ยาว (เมตร)</label>
                          <input
                            type="number"
                            value={pond.length}
                            disabled={!isEditing}
                            placeholder="0.00"
                            onChange={(e) => handlePondChange(pond.id, 'length', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs text-black focus:outline-none focus:ring-1 focus:ring-[#0F3B35] disabled:bg-gray-100 disabled:text-gray-600"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-black font-medium">ลึก (เมตร)</label>
                          <input
                            type="number"
                            value={pond.depth}
                            disabled={!isEditing}
                            placeholder="0.00"
                            onChange={(e) => handlePondChange(pond.id, 'depth', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs text-black focus:outline-none focus:ring-1 focus:ring-[#0F3B35] disabled:bg-gray-100 disabled:text-gray-600"
                          />
                        </div>
                      </div>

                      {volume && (
                        <p className="text-[10px] text-[#093832] font-medium">
                          ปริมาตร = {volume.m3.toLocaleString()} ลูกบาศก์เมตร หรือ {volume.liters.toLocaleString()} ลิตร
                        </p>
                      )}

                      <div className="flex gap-6 pt-1">
                        {([['SMALL', 'ปลาตุ้ม'], ['LARGE', 'ปลานิ้ว'], ['MARKET', 'ปลาตลาด']] as const).map(([val, lbl]) => (
                          <label key={val} className={`flex items-center gap-2 ${isEditing ? 'cursor-pointer' : 'cursor-default opacity-60'}`}>
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${pond.farmType === val ? 'border-[#72B544]' : 'border-gray-400 bg-white'}`}>
                              {pond.farmType === val && <div className="w-3 h-3 bg-[#72B544] rounded-full" />}
                            </div>
                            <input type="radio" className="hidden" disabled={!isEditing} checked={pond.farmType === val} onChange={() => handlePondChange(pond.id, 'farmType', val)} />
                            <span className="text-sm text-black">{lbl}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}

              {isEditing && (
                <button
                  type="button"
                  onClick={handleAddPond}
                  className="w-full py-2.5 rounded-xl border border-[#EF6E11] text-[#EF6E11] bg-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-orange-50 transition-colors"
                >
                  <Plus className="w-4 h-4" /> เพิ่มบ่อ
                </button>
              )}
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-base font-bold text-black">ตำแหน่งของฟาร์ม</label>
              <button
                type="button"
                onClick={() => isEditing && setShowMap(true)}
                disabled={!isEditing}
                className={`w-full text-left rounded-2xl border-2 border-dashed px-4 py-3 transition-all duration-200 flex items-center gap-3 ${formData.location ? "bg-[#E5FFD3] border-[#72B544]" : "bg-gray-50 border-gray-200"
                  } disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-inner">
                  <Image src="/register-farmer/map.svg" alt="Map" width={24} height={24} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#0F3B35]">{isEditing ? "แตะเพื่อเปิดแผนที่" : "ตำแหน่งปัจจุบันของฟาร์ม"}</p>
                  <p className={`text-xs ${formData.location ? "text-gray-700" : "text-gray-400"}`}>
                    {formData.location ? formData.location : "ยังไม่ได้เลือกตำแหน่ง"}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-[#0F3B35]" />
              </button>
              <p className="text-xs text-gray-500">
                {isEditing
                  ? "ลากหมุดไปยังพื้นที่ฟาร์มแล้วกดยืนยันเพื่อบันทึกพิกัด"
                  : 'กด "แก้ไขข้อมูล" ก่อนเพื่อเปลี่ยนพิกัดฟาร์ม'}
              </p>
            </div>

            <div className="pt-8 pb-8">
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="w-full bg-[#72B544] hover:bg-[#5da035] text-white text-xl font-bold py-4 rounded-xl shadow-md transition-all duration-300"
                >
                  แก้ไขข้อมูล
                </button>
              ) : (
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      const storedUser = localStorage.getItem("user");
                      if (storedUser) {
                        try {
                          const userData = JSON.parse(storedUser);
                          populateFormFromProfile(userData?.farmerProfile);
                        } catch (error) {
                          console.error("Error resetting profile:", error);
                        }
                      }
                    }}
                    className="flex-1 bg-gray-200 text-gray-800 text-xl font-bold py-4 rounded-xl hover:bg-gray-300 transition-colors"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={!isFormValid || submitStatus !== 'idle'}
                    className="flex-1 bg-[#72B544] hover:bg-[#5da035] disabled:bg-[#A0A0A0] disabled:cursor-not-allowed text-white text-xl font-bold py-4 rounded-xl shadow-md transition-all duration-300"
                  >
                    บันทึก
                  </button>
                </div>
              )}
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}