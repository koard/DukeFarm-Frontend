"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // รับข้อมูลจาก query parameters ที่ backend ส่งมา
        const token = searchParams.get("token");
        const registrationStatus = searchParams.get("registrationStatus");
        const role = searchParams.get("role");
        
        console.log("=== LINE Login Callback ===");
        console.log("Token:", token ? "✓ Received" : "✗ Missing");
        console.log("Registration Status:", registrationStatus);
        console.log("Role:", role);
        
        // ตรวจสอบว่ามี token หรือไม่
        if (!token) {
          console.error("Token is missing!");
          setError("ไม่พบข้อมูลการเข้าสู่ระบบ");
          setTimeout(() => router.push("/login"), 2000);
          return;
        }

        // เก็บ token
        localStorage.setItem("authToken", token);
        localStorage.setItem("isLoggedIn", "true");
        console.log("✓ Token saved to localStorage");

        if (registrationStatus) {
          localStorage.setItem("registrationStatus", registrationStatus);
        } else {
          localStorage.removeItem("registrationStatus");
        }
        
        // เก็บข้อมูล user เต็มจาก query parameter (backend ส่งมาครบแล้ว)
        const userParam = searchParams.get("user");
        if (userParam) {
          try {
            const fullUserData = JSON.parse(decodeURIComponent(userParam));
            localStorage.setItem("user", JSON.stringify(fullUserData));
            console.log("✓ Full user data saved:", fullUserData);
          } catch (e) {
            console.error("✗ Error parsing user data:", e);
          }
        }

        // Redirect ไปหน้า root ให้ logic ที่นั่นจัดการ redirect ต่อ
        console.log("→ Redirecting to root for routing logic");
        router.push("/");
        
      } catch (error) {
        console.error("✗ Callback error:", error);
        setError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
        setTimeout(() => router.push("/login"), 2000);
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-blue-50">
      <div className="text-center">
        {error ? (
          <>
            <div className="text-red-500 text-xl mb-4">⚠️</div>
            <p className="text-red-600 text-lg">{error}</p>
          </>
        ) : (
          <>
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
            <p className="text-gray-600 text-lg">กำลังดำเนินการ...</p>
          </>
        )}
      </div>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-blue-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
          <p className="text-gray-600 text-lg">กำลังดำเนินการ...</p>
        </div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
