"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user has auth token
    const authToken = localStorage.getItem("authToken");
    const userStr = localStorage.getItem("user");

    if (!authToken || !userStr) {
      // ยังไม่ได้ล็อกอิน -> ไปหน้า login
      router.push("/login");
      return;
    }

    try {
      const user = JSON.parse(userStr);
      
      // Debug: ดูว่า user data เป็นอะไร
      console.log('User data:', user);
      console.log('User role:', user.role);
      console.log('User farmerProfile:', user.farmerProfile);

      // ถ้าเป็น researcher -> ไปหน้า dashboard นักวิจัย
      if (user.role === 'RESEARCHER' || user.role === 'researcher') {
        router.push('/dashboard-researcher');
        return;
      }

      // Redirect ตาม farm type (สำหรับ farmer)
      if (user.farmerProfile?.primaryFarmType) {
        const farmType = user.farmerProfile.primaryFarmType.toUpperCase();
        
        if (farmType === 'NURSERY_SMALL') {
          router.push('/nursery-small');
        } else if (farmType === 'NURSERY_LARGE') {
          router.push('/nursery-large');
        } else if (farmType === 'GROWOUT') {
          router.push('/market-grower');
        } else {
          // ถ้าไม่รู้จัก farm type -> กลับไปหน้า login
          router.push('/login');
        }
      } 
      // ถ้าไม่มี farm profile และไม่ใช่ researcher -> กลับไปหน้า login
      else {
        router.push('/login');
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
