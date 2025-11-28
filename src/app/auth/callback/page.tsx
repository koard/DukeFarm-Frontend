"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = () => {
      try {
        // รับข้อมูลจาก query parameters ที่ backend ส่งมา
        const token = searchParams.get("token");
        const userParam = searchParams.get("user");
        const registrationStatus = searchParams.get("registrationStatus"); // ต้องเป็น PENDING หรือ COMPLETED
        const role = searchParams.get("role"); // ต้องเป็น farmer หรือ researcher
        
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

        // เก็บ token และสถานะ login
        localStorage.setItem("authToken", token);
        localStorage.setItem("isLoggedIn", "true");
        console.log("✓ Token saved to localStorage");
        
        // เก็บข้อมูล user
        if (userParam) {
          try {
            const userData = JSON.parse(decodeURIComponent(userParam));
            localStorage.setItem("user", JSON.stringify(userData));
            console.log("✓ User data saved:", userData.displayName);
          } catch (e) {
            console.error("✗ Error parsing user data:", e);
          }
        }

        // เก็บสถานะการลงทะเบียน
        if (registrationStatus) {
          localStorage.setItem("registrationStatus", registrationStatus);
          console.log("✓ Registration status saved:", registrationStatus);
        }

        // เก็บ role
        if (role) {
          localStorage.setItem("userRole", role.toLowerCase());
          console.log("✓ Role saved:", role);
        }

        // เช็คสถานะการลงทะเบียนและ redirect
        if (registrationStatus?.toUpperCase() === "PENDING") {
          // ยังไม่ได้ลงทะเบียน - ต้องไปหน้าลงทะเบียนก่อน
          console.log("→ Status: PENDING - Redirecting to registration page");
          
          if (role?.toLowerCase() === "researcher") {
            console.log("→ Going to: /register-researcher");
            router.push("/register-researcher");
          } else {
            // farmer หรือไม่มี role (default เป็น farmer)
            console.log("→ Going to: /register-farmer");
            router.push("/register-farmer");
          }
          
        } else if (registrationStatus?.toUpperCase() === "COMPLETED") {
          // ลงทะเบียนเรียบร้อยแล้ว - redirect ตาม role
          console.log("→ Status: COMPLETED - Redirecting based on role");
          
          if (role?.toLowerCase() === "researcher") {
            console.log("→ Researcher going to: /dashboard");
            router.push("/dashboard");
          } else {
            // Farmer - ต้องดึงข้อมูล farmType จาก user profile
            try {
              const userDataFromStorage = localStorage.getItem("user");
              if (userDataFromStorage) {
                const userData = JSON.parse(userDataFromStorage);
                const farmerProfile = userData.farmerProfile || {};
                const farmType = farmerProfile.primaryFarmType;
                
                // แปลง farmType กลับเป็น route path
                const farmTypeRoutes: Record<string, string> = {
                  "NURSERY_SMALL": "/nursery-small",
                  "NURSERY_LARGE": "/nursery-large",
                  "GROWOUT": "/market-grower"
                };
                
                const redirectPath = farmTypeRoutes[farmType] || "/nursery-small";
                console.log("→ Farmer going to:", redirectPath);
                router.push(redirectPath);
              } else {
                console.log("→ No user data, going to: /nursery-small (default)");
                router.push("/nursery-small");
              }
            } catch (e) {
              console.error("✗ Error parsing user data:", e);
              router.push("/nursery-small");
            }
          }
          
        } else {
          // ไม่มี registrationStatus หรือค่าไม่ถูกต้อง - ให้ไปลงทะเบียนเพื่อความปลอดภัย
          console.log("→ Status: Unknown - Redirecting to registration (safe default)");
          
          if (role?.toLowerCase() === "researcher") {
            router.push("/register-researcher");
          } else {
            router.push("/register-farmer");
          }
        }
        
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
