'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'th' | 'en';

interface LanguageContextType {
  language: Language;
  changeLanguage: (lang: Language) => void;
  t: (text: string) => string; 
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('th');

  useEffect(() => {
    const match = document.cookie.match(new RegExp('(^| )googtrans=([^;]+)'));
    if (match) {
      if (match[2].includes('/en')) {
        setLanguage('en');
      } else {
        setLanguage('th');
      }
    }
  }, []);

  const changeLanguage = (lang: Language) => {
    let cookieValue;

    if (lang === 'en') {
      cookieValue = '/th/en';
    } else {
      cookieValue = '/th/th';
    }

    document.cookie = `googtrans=${cookieValue}; path=/; domain=${window.location.hostname}`;
    document.cookie = `googtrans=${cookieValue}; path=/;`;

    setLanguage(lang);
    
    window.location.reload();
  };

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