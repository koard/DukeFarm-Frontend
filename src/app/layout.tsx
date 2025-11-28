import type { Metadata } from "next";
import { Prompt } from "next/font/google";
import "./globals.css";

const prompt = Prompt({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ["latin", "thai"],
  variable: "--font-prompt",
});

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
        className={`${prompt.variable} font-prompt antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
