'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'th' | 'en';

interface LanguageContextType {
  language: Language;
  changeLanguage: (lang: Language) => void;
  t: (text: string) => string; // ใส่ไว้กัน Error ในโค้ดเก่า
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('th');

  // 1. โหลดค่าภาษาจาก Cookie เมื่อเข้าเว็บ
  useEffect(() => {
    // Cookie ของ Google Translate ชื่อ 'googtrans'
    const match = document.cookie.match(new RegExp('(^| )googtrans=([^;]+)'));
    if (match) {
      // ถ้าค่าเป็น /th/en แสดงว่าเป็นภาษาอังกฤษ
      if (match[2].includes('/en')) {
        setLanguage('en');
      } else {
        setLanguage('th');
      }
    }
  }, []);

  // 2. ฟังก์ชันเปลี่ยนภาษา (สั่งงาน Google Translate)
  const changeLanguage = (lang: Language) => {
    let cookieValue;

    if (lang === 'en') {
      // สั่งแปลจาก ไทย -> อังกฤษ
      cookieValue = '/th/en';
    } else {
      // สั่งแปลจาก ไทย -> ไทย (หรือล้างค่า)
      cookieValue = '/th/th';
    }

    // ตั้งค่า Cookie ให้ Google รู้
    document.cookie = `googtrans=${cookieValue}; path=/; domain=${window.location.hostname}`;
    document.cookie = `googtrans=${cookieValue}; path=/;`; // สำรอง

    setLanguage(lang);
    
    // ⚠️ สำคัญ: ต้องรีโหลดหน้าเว็บเพื่อให้ Google เริ่มทำงานใหม่
    window.location.reload();
  };

  // ฟังก์ชันหลอก (Dummy) เพราะเราให้ Google แปลให้ทั้งหน้าแล้ว
  const t = (text: string) => text;

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}