import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { LanguageProvider } from "@/app/contexts/LanguageContext"; 

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

        <div id="google_translate_element" style={{ display: 'none' }}></div>

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
        
        <Script
          src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}