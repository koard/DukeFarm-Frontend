import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script"; // ✅ อย่าลืม import
import "./globals.css";
import { LanguageProvider } from "@/app/contexts/LanguageContext"; // ✅ อย่าลืม import Provider

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DUKE FARM - ระบบจัดการฟาร์มปลาดุก",
  description: "ระบบจัดการฟาร์มปลาดุกที่ทันสมัย",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className={inter.className}>
        <LanguageProvider>
            {children}
        </LanguageProvider>

        {/* ✅ ซ่อน Widget ของ Google ไว้ (เราจะใช้ปุ่มเราสั่งแทน) */}
        <div id="google_translate_element" style={{ display: 'none' }}></div>

        {/* ✅ Script ตั้งค่า Google Translate */}
        <Script
          id="google-translate-init"
          strategy="afterInteractive"
        >
          {`
            function googleTranslateElementInit() {
              new google.translate.TranslateElement({
                pageLanguage: 'th',
                includedLanguages: 'th,en', // แปลแค่ ไทย <-> อังกฤษ
                autoDisplay: false,
              }, 'google_translate_element');
            }
          `}
        </Script>
        
        {/* ✅ Script โหลดตัวแปล */}
        <Script
          src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}