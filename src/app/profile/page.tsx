"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronLeft, Check } from "lucide-react";
import { useLineUser } from "@/hooks/useLineUser";
import dynamic from "next/dynamic";

const MapPicker = dynamic(() => import("../register-farmer/MapPicker"), { 
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500">กำลังโหลดแผนที่...</div>
});

export default function ProfilePage() {
  const router = useRouter();
  const lineUser = useLineUser();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [showMap, setShowMap] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    farmType: "",
    pondCount: "",
    location: "",
  });

  const [initialCoords, setInitialCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [tempCoords, setTempCoords] = useState({ lat: 0, lng: 0 });

  const farmOptions = [
    { value: "NURSERY_SMALL", label: "กลุ่มอนุบาลขนาดเล็ก" },
    { value: "NURSERY_LARGE", label: "กลุ่มอนุบาลขนาดใหญ่" },
    { value: "GROWOUT", label: "กลุ่มผู้เลี้ยงขนาดตลาด" },
  ];

  const farmTypeRoutes: Record<string, string> = {
    NURSERY_SMALL: "/nursery-small",
    NURSERY_LARGE: "/nursery-large",
    GROWOUT: "/market-grower",
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          const profile = userData.farmerProfile;
          
          if (profile) {
            let newLocation = "";
            let newInitialCoords = null;

            if (profile.farmLatitude && profile.farmLongitude) {
              const lat = parseFloat(profile.farmLatitude);
              const lng = parseFloat(profile.farmLongitude);
              
              if (!isNaN(lat) && !isNaN(lng)) {
                newLocation = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
                newInitialCoords = { lat, lng };
                setInitialCoords(newInitialCoords);
                setTempCoords(newInitialCoords);
              }
            }

            setFormData({
              firstName: profile.firstName || "",
              lastName: profile.lastName || "",
              phone: profile.phone || "",
              farmType: profile.primaryFarmType || "",
              pondCount: profile.declaredPondCount?.toString() || "",
              location: newLocation
            });
          }
        }
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

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

  const handleSelectFarmType = (typeValue: string) => {
    setFormData((prev) => ({ ...prev, farmType: typeValue }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setSubmitStatus('loading');
    
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        alert("ไม่พบ Token กรุณาเข้าสู่ระบบใหม่");
        router.push("/login");
        return;
      }

      const [lat, lng] = formData.location.split(", ").map(Number);

      const requestBody = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        primaryFarmType: formData.farmType,
        declaredPondCount: parseInt(formData.pondCount),
        farmLatitude: lat,
        farmLongitude: lng
      };

      // ใช้ POST /api/register/farmer (upsert อัตโนมัติ)
      const response = await fetch("https://dukefarm-backend.onrender.com/api/register/farmer", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "ไม่สามารถบันทึกข้อมูลได้");
      }

      const result = await response.json();

      const latestFarmProfile = result?.data?.profile ?? result?.data;
      const latestUserState = result?.data?.user;

      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        if (latestFarmProfile) {
          userData.farmerProfile = latestFarmProfile;
        }
        if (latestUserState) {
          userData.role = latestUserState.role;
          userData.registrationStatus = latestUserState.registrationStatus;
        }
        localStorage.setItem("user", JSON.stringify(userData));
      }

      const resolvedFarmType = latestFarmProfile?.primaryFarmType || formData.farmType;
      const destination = resolvedFarmType ? farmTypeRoutes[resolvedFarmType] ?? "/nursery-small" : "/nursery-small";

      setSubmitStatus('success');
      await new Promise((resolve) => setTimeout(resolve, 1000));

      router.push(destination);
      return;
      
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
        
        <div className="bg-[#093832] text-white px-4 pt-8 pb-10 rounded-b-[40px] shadow-md relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <button onClick={() => router.back()} className="p-1 hover:bg-white/10 rounded-full transition-colors">
              <ChevronLeft className="w-7 h-7" />
            </button>
            <div className="flex items-center gap-2 text-2xl font-bold">
              <Image src="/register-farmer/Leaf.svg" alt="Leaf" width={24} height={24} />
              <span>ข้อมูลโปรไฟล์</span>
            </div>
          </div>
        </div>

        <div className="px-6 relative z-20">
          <div className="flex items-center gap-4 mb-6 mt-4">
            <div className="w-20 h-20 rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-200">
              <Image 
                src={lineUser.pictureUrl || "/default-avatar.png"}
                alt="Profile" 
                width={80}
                height={80}
                className="w-full h-full object-cover" 
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
              <label className="text-base font-bold text-black">ประเภทกลุ่มการเลี้ยง</label>
              <div className="space-y-3 pl-1">
                {farmOptions.map((option, index) => (
                  <div 
                    key={index} 
                    onClick={() => isEditing && handleSelectFarmType(option.value)} 
                    className={`flex items-start gap-3 ${isEditing ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'} group`}
                  >
                    <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                      formData.farmType === option.value 
                        ? "border-[#093832]" 
                        : "border-gray-300"
                    }`}>
                      {formData.farmType === option.value && (<div className="w-2.5 h-2.5 rounded-full bg-[#093832]"></div>)}
                    </div>
                    <div>
                      <span className="text-base text-black font-medium block">{option.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-base font-bold text-black">จำนวนบ่อ</label>
              <input 
                type="number" 
                name="pondCount" 
                value={formData.pondCount} 
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="ระบุข้อมูล เช่น 4, 8, 12 เป็นต้น" 
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F3B35] text-black text-xs placeholder:text-xs placeholder:text-gray-500 disabled:bg-gray-100 disabled:text-gray-600" 
              />
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-base font-bold text-black">ตำแหน่งของฟาร์ม</label>
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  readOnly
                  placeholder="กดปุ่มแผนที่เพื่อระบุตำแหน่ง"
                  className={`flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none text-black text-xs placeholder:text-xs placeholder:text-gray-500 transition-colors ${
                    formData.location ? "bg-[#E5FFD3]" : "bg-gray-50"
                  } disabled:bg-gray-100`}
                  disabled={!isEditing}
                />
                <button
                  type="button"
                  onClick={() => isEditing && setShowMap(true)}
                  disabled={!isEditing}
                  className="p-2 border-2 border-[#72B544] rounded-xl bg-white active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Image src="/register-farmer/map.svg" alt="Map" width={24} height={24} />
                </button>
              </div>
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
                      // Reload data
                      const storedUser = localStorage.getItem("user");
                      if (storedUser) {
                        const userData = JSON.parse(storedUser);
                        const profile = userData.farmerProfile;
                        if (profile) {
                          let newLocation = "";
                          if (profile.farmLatitude && profile.farmLongitude) {
                            newLocation = `${profile.farmLatitude.toFixed(6)}, ${profile.farmLongitude.toFixed(6)}`;
                          }
                          setFormData({
                            firstName: profile.firstName || "",
                            lastName: profile.lastName || "",
                            phone: profile.phone || "",
                            farmType: profile.primaryFarmType || "",
                            pondCount: profile.declaredPondCount?.toString() || "",
                            location: newLocation
                          });
                        }
                      }
                    }}
                    className="flex-1 bg-gray-200 text-gray-800 text-xl font-bold py-4 rounded-xl hover:bg-gray-300 transition-colors"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={submitStatus !== 'idle'}
                    className="flex-1 bg-[#72B544] hover:bg-[#5da035] text-white text-xl font-bold py-4 rounded-xl shadow-md transition-all duration-300"
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
