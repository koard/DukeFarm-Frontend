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
            const incoming = JSON.parse(decodeURIComponent(userParam));

            // ถ้า payload ใหม่ไม่มีฟิลด์ farmTypes/selectedFarmTypes ให้ดึงจากค่าเก่าไว้ป้องกันหายหลังล็อกอินใหม่
            const existingRaw = localStorage.getItem("user");
            if (existingRaw) {
              try {
                const existing = JSON.parse(existingRaw);
                const incomingProfile = incoming?.farmerProfile ?? {};
                const existingProfile = existing?.farmerProfile ?? {};

                const hasIncomingFarmTypes = Array.isArray(incomingProfile.farmTypes) && incomingProfile.farmTypes.length > 0;
                const hasIncomingSelected = Array.isArray(incomingProfile.selectedFarmTypes) && incomingProfile.selectedFarmTypes.length > 0;

                const mergedProfile = {
                  ...existingProfile,
                  ...incomingProfile,
                  farmTypes: hasIncomingFarmTypes ? incomingProfile.farmTypes : existingProfile.farmTypes,
                  selectedFarmTypes: hasIncomingSelected ? incomingProfile.selectedFarmTypes : existingProfile.selectedFarmTypes,
                };

                const mergedUser = {
                  ...existing,
                  ...incoming,
                  farmerProfile: mergedProfile,
                };

                localStorage.setItem("user", JSON.stringify(mergedUser));
                console.log("✓ Full user data merged and saved:", mergedUser);
              } catch (mergeErr) {
                console.warn("Merge user data failed, fallback to incoming", mergeErr);
                localStorage.setItem("user", JSON.stringify(incoming));
              }
            } else {
              localStorage.setItem("user", JSON.stringify(incoming));
              console.log("✓ Full user data saved:", incoming);
            }
          } catch (e) {
            console.error("✗ Error parsing user data:", e);
          }
        }

        // Fetch fresh user data from /auth/me to ensure localStorage has complete data (ponds, farmTypes, etc.)
        const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://dukefarm-backend.onrender.com/api";
        try {
          const meRes = await fetch(`${API_BASE}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (meRes.ok) {
            const meData = await meRes.json();
            const freshUser = meData.data;
            if (freshUser) {
              const currentRaw = localStorage.getItem("user");
              const current = currentRaw ? JSON.parse(currentRaw) : {};
              const merged = {
                ...current,
                ...freshUser,
                farmerProfile: {
                  ...(current.farmerProfile ?? {}),
                  ...(freshUser.farmerProfile ?? {}),
                },
              };
              localStorage.setItem("user", JSON.stringify(merged));
              console.log("✓ User data refreshed from /auth/me:", merged);
            }
          }
        } catch (meErr) {
          console.warn("Could not refresh user data from /auth/me", meErr);
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
