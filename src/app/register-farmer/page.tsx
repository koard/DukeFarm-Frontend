"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import dynamic from "next/dynamic"; 
import { useRouter } from "next/navigation";
import { useLineUser } from "@/hooks/useLineUser"; 
import {
  FarmTypeOption,
  FarmTypeProfileLike,
  FARM_TYPE_PRIORITY,
  deriveFarmTypesFromProfile,
  mapFarmTypeToRoute,
} from "@/utils/farmTypes";

const MapPicker = dynamic(() => import("./MapPicker"), { 
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500">กำลังโหลดแผนที่...</div>
});

type FarmerProfile = FarmTypeProfileLike & {
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  farmAreaRai?: number | string | null;
  totalFarmAreaRai?: number | string | null;
  declaredRaiCount?: number | string | null;
  declaredPondCount?: number | string | null;
  totalPondCount?: number | string | null;
  pondsPerRai?: number | string | null;
  farmLatitude?: number | string | null;
  farmLongitude?: number | string | null;
};

type RegisterFormState = {
  firstName: string;
  lastName: string;
  phone: string;
  farmType: FarmTypeOption[];
  raiCount: string;
  pondCount: string;
  location: string;
};

const formatNumericInput = (value: unknown): string => {
  if (typeof value === "number" && !Number.isNaN(value)) {
    return String(value);
  }
  if (typeof value === "string") {
    return value;
  }
  return "";
};

const parseCoordinate = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = parseFloat(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return null;
};

const parseLocationValue = (value: string): { lat: number; lng: number } | null => {
  const [latStr, lngStr] = value.split(",").map((part) => part.trim());
  const lat = parseFloat(latStr || "");
  const lng = parseFloat(lngStr || "");
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    return { lat, lng };
  }
  return null;
};

export default function RegisterFarmerPage() {
  const router = useRouter();
  const lineUser = useLineUser();

  const [formData, setFormData] = useState<RegisterFormState>({
    firstName: "",
    lastName: "",
    phone: "",
    farmType: [] as FarmTypeOption[],
    raiCount: "",
    pondCount: "",
    location: "",
  });

  const farmOptions: Array<{ value: FarmTypeOption; label: string; description: string }> = [
    { value: "SMALL", label: "ปลาตุ้ม", description: "อายุ 7-10 วัน" },
    { value: "LARGE", label: "ปลานิ้ว", description: "อายุ 11-30 วัน" },
    { value: "MARKET", label: "ปลาตลาด", description: "อายุ 31-180 วัน" },
  ];

  const [isFormValid, setIsFormValid] = useState(false);
  const [showMap, setShowMap] = useState(false);
  
  const [initialCoords, setInitialCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [tempCoords, setTempCoords] = useState({ lat: 0, lng: 0 });
    
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      const profile: FarmerProfile | undefined = parsedUser.farmerProfile;
      if (!profile) {
        return;
      }

      const lat = parseCoordinate(profile.farmLatitude);
      const lng = parseCoordinate(profile.farmLongitude);
      const coords = lat !== null && lng !== null ? { lat, lng } : null;
      if (coords) {
        setInitialCoords(coords);
        setTempCoords(coords);
      }

      const farmTypes = deriveFarmTypesFromProfile(profile);
      const areaSource = profile.totalFarmAreaRai ?? profile.farmAreaRai ?? profile.declaredRaiCount;
      const pondSource = profile.totalPondCount ?? profile.declaredPondCount ?? profile.pondsPerRai;

      setFormData((prev) => ({
        ...prev,
        firstName: profile.firstName ?? prev.firstName,
        lastName: profile.lastName ?? prev.lastName,
        phone: profile.phone ?? prev.phone,
        farmType: farmTypes.length > 0 ? farmTypes : prev.farmType,
        raiCount: formatNumericInput(areaSource) || prev.raiCount,
        pondCount: formatNumericInput(pondSource) || prev.pondCount,
        location: coords ? `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}` : prev.location,
      }));
    } catch (error) {
      console.error("Failed to parse user data", error);
    }
  }, []);

  useEffect(() => {
    const { firstName, lastName, phone, farmType, pondCount, raiCount, location } = formData;
    setIsFormValid(
      firstName.trim() !== "" &&
      lastName.trim() !== "" &&
      phone.trim() !== "" &&
      farmType.length > 0 && 
      raiCount.trim() !== "" &&
      pondCount.trim() !== "" &&
      location.trim() !== ""
    );
  }, [formData]);

  useEffect(() => {
    if (submitStatus !== 'idle' || showMap) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [submitStatus, showMap]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectFarmType = (typeValue: FarmTypeOption) => {
    setFormData((prev) => {
      const currentTypes = prev.farmType;
      if (currentTypes.includes(typeValue)) {
        return { ...prev, farmType: currentTypes.filter(t => t !== typeValue) };
      } else {
        return { ...prev, farmType: [...currentTypes, typeValue] };
      }
    });
  };

  const handleLocationSelect = (lat: number, lng: number) => {
      setTempCoords({ lat, lng });
  };

  const confirmLocation = () => {
      setFormData(prev => ({
          ...prev, 
          location: `${tempCoords.lat.toFixed(6)}, ${tempCoords.lng.toFixed(6)}`
      }));
      setInitialCoords({ lat: tempCoords.lat, lng: tempCoords.lng });
      setShowMap(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    
    setSubmitStatus('loading');
    
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        alert("ไม่พบ Token กรุณาเข้าสู่ระบบใหม่");
        router.push("/login");
        return;
      }

      const coords = parseLocationValue(formData.location);
      if (!coords) {
        alert("กรุณาเลือกตำแหน่งฟาร์มบนแผนที่");
        setSubmitStatus('idle');
        return;
      }

      const farmAreaRai = parseFloat(formData.raiCount);
      if (Number.isNaN(farmAreaRai)) {
        alert("กรุณาระบุจำนวนไร่เป็นตัวเลข");
        setSubmitStatus('idle');
        return;
      }

      const declaredPondCount = parseInt(formData.pondCount, 10);
      if (Number.isNaN(declaredPondCount)) {
        alert("กรุณาระบุจำนวนบ่อทั้งหมดเป็นตัวเลข");
        setSubmitStatus('idle');
        return;
      }
      
      // จัดลำดับความสำคัญของประเภทฟาร์ม (เพื่อหา Primary Type)
      const sortedSelectedTypes = [...formData.farmType].sort((a, b) => {
        return FARM_TYPE_PRIORITY.indexOf(a) - FARM_TYPE_PRIORITY.indexOf(b);
      });
      const primaryTypeKey = sortedSelectedTypes[0];

      const requestBody = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        primaryFarmType: primaryTypeKey || "SMALL",
        farmTypes: formData.farmType,
        
        declaredPondCount,
        farmAreaRai,
        
        farmLatitude: coords.lat,
        farmLongitude: coords.lng
      };

      const response = await fetch("https://dukefarm-backend.onrender.com/api/register/farmer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        if (response.status === 401) {
            router.push('/login');
            return;
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "ไม่สามารถบันทึกข้อมูลได้");
      }

      const result = await response.json();
      console.log("✅ Registration successful:", result);

      if (result.data) {
        const { user, profile } = result.data;
        const currentUserStr = localStorage.getItem("user");
        const currentUser = currentUserStr ? JSON.parse(currentUserStr) : {};
        
        const updatedUser = {
          ...currentUser,
          role: user.role,
          registrationStatus: user.registrationStatus,
          farmerProfile: profile 
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
      
      setSubmitStatus('success');
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const destination = mapFarmTypeToRoute(primaryTypeKey);
      router.push(destination);
      
    } catch (error) {
      console.error("❌ Registration error:", error);
      setSubmitStatus('idle');
      alert(error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการลงทะเบียน");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      
      {submitStatus !== 'idle' && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
           <div className="bg-white rounded-2xl p-8 flex flex-col items-center justify-center shadow-2xl w-64 h-48 animate-in fade-in zoom-in duration-300">
              {submitStatus === 'loading' && (
                <>
                  <div className="w-12 h-12 border-4 border-emerald-100 border-t-[#0F3B35] rounded-full animate-spin mb-4"></div>
                  <span className="text-lg font-medium text-gray-600">กำลังดำเนินการ</span>
                </>
              )}
              {submitStatus === 'success' && (
                <>
                  <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-3 animate-in zoom-in duration-300">
                    <Check className="w-8 h-8 text-green-600" strokeWidth={3} />
                  </div>
                  <span className="text-lg font-bold text-green-700">ลงทะเบียนสำเร็จ</span>
                </>
              )}
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
      <div className=" w-full max-w-md md:max-w-full lg:max-w-full bg-white min-h-screen shadow-xl relative pb-10">
        
        {/* Header */}
        <div className="bg-[#093832] text-white px-4 pt-8 pb-10 rounded-b-[40px] shadow-md relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Link href="/login" className="p-1 hover:bg-white/10 rounded-full transition-colors">
              <ChevronLeft className="w-7 h-7" />
            </Link>
            <div className="flex items-center gap-2 text-2xl font-bold">
              <span>กรอกข้อมูลลงทะเบียน</span>
            </div>
          </div>
        </div>

        <div className="px-6 relative z-20">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-200 relative">
               <Image 
                 src={lineUser.pictureUrl || "https://placehold.co/200x200?text=Profile"}
                 alt="Profile" 
                 fill
                 sizes="80px"
                 className="object-cover"
                 unoptimized
               />
            </div>
            <div className="pt-2">
              <p className="text-xs text-gray-500 font-medium">ยินดีต้อนรับ</p>
              <h2 className="text-2xl font-bold text-gray-900">{lineUser.displayName}</h2>
            </div>
          </div>

          <form className="space-y-5" onSubmit={handleRegister}>
              
             <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-base font-bold text-black">ชื่อ</label>
                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="ระบุข้อมูล" 
                       className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F3B35] text-black text-xs placeholder:text-xs placeholder:text-gray-500" />
              </div>
              <div className="space-y-1.5">
                <label className="text-base font-bold text-black">นามสกุล</label>
                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="ระบุข้อมูล" 
                       className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F3B35] text-black text-xs placeholder:text-xs placeholder:text-gray-500" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-base font-bold text-black">เบอร์โทร</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="ระบุข้อมูล" 
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F3B35] text-black text-xs placeholder:text-xs placeholder:text-gray-500" />
            </div>

            <div className="space-y-3 pt-2">
              <label className="text-base font-bold text-black">ประเภทกลุ่มการเลี้ยง (เลือกได้มากกว่า 1)</label>
              <div className="space-y-3 pl-1">
                {farmOptions.map((option, index) => {
                  const isSelected = formData.farmType.includes(option.value);
                  return (
                    <div 
                      key={index} 
                      onClick={() => handleSelectFarmType(option.value)} 
                      className="flex items-start gap-3 cursor-pointer group select-none"
                    >
                      {/* Checkbox UI */}
                      <div className={`mt-1 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
                          isSelected
                          ? "bg-[#72B544] border-[#72B544]" 
                          : "border-gray-300 bg-white"
                      }`}>
                          {isSelected && (<Check className="w-4 h-4 text-white" strokeWidth={3} />)}
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

            {/* จำนวนไร่ และ จำนวนบ่อต่อไร่ */}
            <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-base font-bold text-black">พื้นที่ฟาร์มทั้งหมด</label>
                  <div className="relative">
                    <input
                      type="number"
                      name="raiCount"
                      value={formData.raiCount}
                      onChange={handleChange}
                      className="w-full pr-14 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F3B35] text-black text-xs placeholder:text-xs placeholder:text-gray-500"
                    />
                    <span className="absolute inset-y-0 right-4 flex items-center text-xs font-semibold text-gray-500">ไร่</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-base font-bold text-black">จำนวนบ่อทั้งหมด</label>
                    <input type="number" name="pondCount" value={formData.pondCount} onChange={handleChange} placeholder="ระบุข้อมูล" 
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F3B35] text-black text-xs placeholder:text-xs placeholder:text-gray-500" />
                </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-base font-bold text-black">ตำแหน่งของฟาร์ม</label>
              <button
                type="button"
                onClick={() => setShowMap(true)}
                className={`w-full text-left rounded-2xl border-2 border-dashed transition-all duration-200 ${
                  formData.location ? "bg-[#E5FFD3] border-[#72B544]" : "bg-gray-50 border-gray-200"
                } px-4 py-3 shadow-sm active:scale-[0.99]`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-inner">
                    <Image src="/register-farmer/map.svg" alt="Map" width={24} height={24} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#0F3B35]">แตะเพื่อเลือกตำแหน่งบนแผนที่</p>
                    <p className={`text-xs ${formData.location ? "text-gray-700" : "text-gray-400"}`}>
                      {formData.location ? formData.location : "ยังไม่ได้เลือกตำแหน่ง"}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#0F3B35]" />
                </div>
              </button>
              <p className="text-xs text-gray-500">ระบบจะใช้พิกัดนี้ในการให้คำแนะนำและบริการต่าง ๆ</p>
            </div>

            <div className="pt-8 pb-8">
              <button
                type="submit"
                disabled={!isFormValid || submitStatus !== 'idle'}
                className={`w-full text-white text-xl font-bold py-4 rounded-xl shadow-md transition-all duration-300 ${
                    isFormValid ? "bg-[#72B544] hover:bg-[#5da035] shadow-lg" : "bg-[#A0A0A0] cursor-not-allowed"
                }`}
              >
                ลงทะเบียน
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
