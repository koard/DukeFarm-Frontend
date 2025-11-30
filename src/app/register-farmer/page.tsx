"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, Check } from "lucide-react";
import dynamic from "next/dynamic"; 
import { useRouter } from "next/navigation";
import { useLineUser } from "@/hooks/useLineUser"; 

const MapPicker = dynamic(() => import("./MapPicker"), { 
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500">กำลังโหลดแผนที่...</div>
});

export default function RegisterFarmerPage() {
  const router = useRouter();
  const lineUser = useLineUser();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    farmType: "", 
    pondCount: "",
    location: "",
  });

  const farmOptions = [
    { value: "nursery-small", label: "กลุ่มอนุบาลขนาดเล็ก" },
    { value: "nursery-large", label: "กลุ่มอนุบาลขนาดใหญ่" },
    { value: "market-grower", label: "กลุ่มผู้เลี้ยงขนาดตลาด" },
  ];

  const [isFormValid, setIsFormValid] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [tempCoords, setTempCoords] = useState({ lat: 0, lng: 0 });
  
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  useEffect(() => {
    const { firstName, lastName, phone, farmType, pondCount, location } = formData;
    setIsFormValid(
      firstName.trim() !== "" &&
      lastName.trim() !== "" &&
      phone.trim() !== "" &&
      farmType !== "" &&
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

      // แยก lat, lng จาก location string
      const [lat, lng] = formData.location.split(", ").map(Number);

      // แปลง farmType จาก kebab-case เป็น UPPER_SNAKE_CASE ตาม API spec
      const farmTypeMap: Record<string, string> = {
        "nursery-small": "NURSERY_SMALL",
        "nursery-large": "NURSERY_LARGE",
        "market-grower": "GROWOUT"
      };

      const requestBody = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone, // ✅ ใช้ "phone" ตาม API spec
        primaryFarmType: farmTypeMap[formData.farmType] || "NURSERY_SMALL", // ✅ ใช้ "primaryFarmType" และแปลงเป็น uppercase
        declaredPondCount: parseInt(formData.pondCount), // ✅ ใช้ "declaredPondCount"
        farmLatitude: lat, // ✅ แยก latitude
        farmLongitude: lng // ✅ แยก longitude
      };

      console.log("Sending farmer registration:", requestBody);

      // ตาม API spec: POST /register/farmer
      const response = await fetch("https://dukefarm-backend.onrender.com/api/register/farmer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Registration failed:", errorData);
        throw new Error(errorData.message || "ไม่สามารถบันทึกข้อมูลได้");
      }

      const result = await response.json();
      console.log("✅ Registration successful:", result);

      // ตาม API spec response: { data: { profile: {...}, user: {...} } }
      if (result.data) {
        const { user, profile } = result.data;
        
        // อัพเดท user object ด้วยข้อมูลจาก backend
        const currentUserStr = localStorage.getItem("user");
        const currentUser = currentUserStr ? JSON.parse(currentUserStr) : {};
        
        const updatedUser = {
          ...currentUser,
          role: user.role,
          registrationStatus: user.registrationStatus,
          farmerProfile: profile // เก็บ profile เต็มจาก backend
        };
        
        localStorage.setItem("user", JSON.stringify(updatedUser));
        
        console.log("✅ User data updated in localStorage:", updatedUser);
      }
      
      setSubmitStatus('success');
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // ลงทะเบียนสำเร็จแล้ว ไปหน้าฟาร์มตามขนาดที่เลือก
      router.push(`/${formData.farmType}`);
      
    } catch (error) {
      console.error("❌ Registration error:", error);
      setSubmitStatus('idle');
      alert(error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการลงทะเบียน กรุณาลองใหม่อีกครั้ง");
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

      {/* ส่วน Popup แผนที่ */}
      {showMap && (
        <div className="fixed inset-0 z-50 flex justify-center bg-gray-50"> 
            <div className="w-full max-w-md md:max-w-full lg:max-w-fullbg-white flex flex-col h-full relative shadow-xl">
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
                    <MapPicker onLocationSelect={handleLocationSelect} />
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

      {/* ส่วนฟอร์มหลัก */}
      <div className=" w-full max-w-md md:max-w-full lg:max-w-full bg-white min-h-screen shadow-xl relative pb-10">
        
        <div className="bg-[#093832] text-white px-4 pt-8 pb-10 rounded-b-[40px] shadow-md relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Link href="/login" className="p-1 hover:bg-white/10 rounded-full transition-colors">
              <ChevronLeft className="w-7 h-7" />
            </Link>
            <div className="flex items-center gap-2 text-2xl font-bold">
              <Image src="/register-farmer/Leaf.svg" alt="Leaf" width={24} height={24} />
              <span>กรอกข้อมูลลงทะเบียน</span>
            </div>
          </div>
        </div>

        <div className="px-6 relative z-20">
          <div className="mt-4 mb-6">
             <p className="text-red-500 text-sm font-medium">เจ้าของบ่อหรือเจ้าของพื้นที่เท่านั้น</p>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-200">
               <img 
                 src={lineUser.pictureUrl} 
                 alt="Profile" 
                 className="w-full h-full object-cover" 
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
              <label className="text-base font-bold text-black">ประเภทกลุ่มการเลี้ยง</label>
              <div className="space-y-3 pl-1">
                {farmOptions.map((option, index) => (
                  <div 
                    key={index} 
                    onClick={() => handleSelectFarmType(option.value)} 
                    className="flex items-start gap-3 cursor-pointer group"
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
                        <span className="text-xs text-gray-400">(รอใส่ข้อความขยาย)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-base font-bold text-black">จำนวนบ่อ</label>
              <input type="number" name="pondCount" value={formData.pondCount} onChange={handleChange} placeholder="ระบุข้อมูล เช่น 4, 8, 12 เป็นต้น" 
                     className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F3B35] text-black text-xs placeholder:text-xs placeholder:text-gray-500" />
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
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowMap(true)}
                  className="p-2 border-2 border-[#72B544] rounded-xl bg-white active:scale-95 transition-all"
                >
                  <Image src="/register-farmer/map.svg" alt="Map" width={24} height={24} />
                </button>
              </div>
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