"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const mapFarmTypeToRoute = (value?: string | null) => {
  if (!value) {
    return "/nursery-small";
  }

  const normalized = value.toUpperCase();

  if (normalized === "SMALL" || normalized === "NURSERY_SMALL") {
    return "/nursery-small";
  }
  if (normalized === "LARGE" || normalized === "NURSERY_LARGE") {
    return "/nursery-large";
  }
  if (normalized === "MARKET" || normalized === "GROWOUT") {
    return "/market-grower";
  }

  return "/nursery-small";
};

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user has auth token
    const authToken = localStorage.getItem("authToken");
    const userStr = localStorage.getItem("user");
    const storedRegistrationStatus = localStorage.getItem("registrationStatus");

    if (!authToken || !userStr) {
      // ยังไม่ได้ล็อกอิน -> ไปหน้า login
      router.push("/login");
      return;
    }

    try {
      const user = JSON.parse(userStr);
      console.log("User data from localStorage:", user);

      const role = (user.role as string | undefined)?.toUpperCase();
      const registrationStatus = (user.registrationStatus as string | undefined)?.toUpperCase() || storedRegistrationStatus?.toUpperCase();

      if (registrationStatus !== "COMPLETED") {
        if (role === "RESEARCHER") {
          router.push("/register-researcher");
        } else {
          router.push("/register-farmer");
        }
        return;
      }

      // ถ้าเป็น researcher -> ไปหน้า dashboard นักวิจัย
      if (role === "RESEARCHER") {
        router.push("/dashboard-researcher");
        return;
      }

      // Redirect ตาม farm type (สำหรับ farmer)
      if (user.farmerProfile?.primaryFarmType) {
        router.push(mapFarmTypeToRoute(user.farmerProfile.primaryFarmType));
      } 
      // ถ้าไม่มี farm profile -> default ไป nursery-small
      else {
        router.push("/nursery-small");
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
      router.push("/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">กำลังโหลด...</p>
      </div>
    </div>
  );
}
