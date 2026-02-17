"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { API_BASE_URL } from "@/config/api";

export default function LoginPage() {
  const { language, changeLanguage } = useLanguage();

  const [isLangOpen, setIsLangOpen] = useState(false);

  const toggleLanguage = (lang: 'th' | 'en') => {
    changeLanguage(lang);
    setIsLangOpen(false);
  };

  const langConfig = {
    th: {
      flagSrc: "/flags/th.svg",
      label: "ไทย"
    },
    en: {
      flagSrc: "/flags/gb.svg",
      label: "EN"
    }
  };

  const handleLineLogin = async (role: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/line/login?role=${role.toLowerCase()}`);
      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง");
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden font-sans">

      <div className="absolute top-6 right-6 z-50">
        <div className="relative">

          <button
            onClick={() => setIsLangOpen(!isLangOpen)}
            className="bg-white border-2 border-[#009D64] text-gray-700 px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm hover:bg-gray-50 transition-all duration-200"
          >
            <div className="relative w-5 h-5 rounded-full overflow-hidden border border-gray-100 shrink-0">
              <Image
                src={langConfig[language].flagSrc}
                alt={language}
                fill
                className="object-cover"
              />
            </div>
            <span className="text-sm font-medium leading-none pt-0.5 min-w-[24px] text-center">
              {langConfig[language].label}
            </span>
            <ChevronDown className={`w-4 h-4 text-gray-800 transition-transform duration-200 ${isLangOpen ? 'rotate-180' : ''}`} />
          </button>

          {isLangOpen && (
            <div className="absolute right-0 mt-2 w-full min-w-[120px] bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 py-1">

              <button
                onClick={() => toggleLanguage('th')}
                className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 hover:bg-[#009D64]/10 transition-colors ${language === 'th' ? 'bg-[#009D64]/10 text-[#009D64] font-medium' : 'text-gray-600'}`}
              >
                <div className="relative w-5 h-5 rounded-full overflow-hidden border border-gray-100 shrink-0">
                  <Image src={langConfig.th.flagSrc} alt="TH" fill className="object-cover" />
                </div>
                ไทย
              </button>

              <button
                onClick={() => toggleLanguage('en')}
                className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 hover:bg-[#009D64]/10 transition-colors ${language === 'en' ? 'bg-[#009D64]/10 text-[#009D64] font-medium' : 'text-gray-600'}`}
              >
                <div className="relative w-5 h-5 rounded-full overflow-hidden border border-gray-100 shrink-0">
                  <Image src={langConfig.en.flagSrc} alt="EN" fill className="object-cover" />
                </div>
                EN
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="absolute top-0 left-0 right-0 h-1/2">
        <Image
          src="/login/bg-farm2.png"
          alt="Farm Background"
          fill
          priority
          className=""
        />
        <div className="absolute inset-0 bg-white/10"></div>
      </div>

      <div className="relative min-h-screen flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm mx-auto mt-40">
          <div className="px-6 py-3 mb-4 mx-auto w-fit">
            <Image
              src="/login/text.png"
              alt="Top Message"
              width={250}
              height={50}
              className="object-contain"
              style={{ height: "auto" }}
            />
          </div>

          <div className="absolute right-0 top-50 ">
            <Image
              src="/login/duke-character.png"
              alt="Duke Character"
              width={100}
              height={100}
              className="drop-shadow-lg"
              style={{ height: "auto" }}
            />
          </div>

          <div className=" overflow-hidden">
            <div className="p-4 text-center">
              <div className="flex justify-center mb-2">
                <Image
                  src="/login/duke-logo.png"
                  alt="Duke Farm Logo"
                  width={200}
                  height={80}
                  className="mx-auto"
                  style={{ height: "auto" }}
                />
              </div>
              <p className="text-[#009D64] font-medium text-lg">
                CatFish Farm Management
              </p>
            </div>

            <div className="px-4 pt-2 flex flex-col items-center gap-4">
              <button
                onClick={() => handleLineLogin("farmer")}
                className="w-full bg-[#009D64] hover:bg-[#008a57] text-white py-3 px-4 rounded-xl font-medium text-lg transition-colors shadow-lg"
              >
                ลงทะเบียนเกษตรกร
              </button>

              {/* <button
                onClick={() => handleLineLogin("researcher")}
                className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2 transition-colors opacity-80"
              >
                เข้าสู่ระบบสำหรับทีมวิจัย
              </button> */}
            </div>
          </div>
          {/* Partner Logos */}
          <div className="mt-12 flex justify-center items-center space-x-6">
            <div className="relative h-11 w-auto">
              <Image
                src="/login/partnerKU.png"
                alt="KU"
                width={0}
                height={0}
                sizes="100vw"
                className="h-full w-auto object-contain"
              />
            </div>
            <div className="relative h-9 w-auto">
              <Image
                src="/login/partnerBTG.png"
                alt="BETAGRO"
                width={0}
                height={0}
                sizes="100vw"
                className="h-full w-auto object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}