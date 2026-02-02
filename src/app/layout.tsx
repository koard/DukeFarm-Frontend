import type { Metadata } from "next";
import { Inter } from "next/font/google";       

import "./globals.css";

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
      <body

        className={inter.className} 
      >
        {children}
      </body>
    </html>
  );
}