"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

export default function FarmNavigation() {
  const pathname = usePathname();
  const [displayItems, setDisplayItems] = useState<any[]>([]);

  const navItems = [
    {
      type: "SMALL",
      label: "ปลาตุ้ม",
      path: "/nursery-small",
    },
    {
      type: "LARGE",
      label: "ปลานิ้ว",
      path: "/nursery-large",
    },
    {
      type: "MARKET",
      label: "ปลาตลาด",
      path: "/market-grower",
    },
  ];

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    let allowed: string[] = [];

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        const profile = user.farmerProfile || {};

        if (Array.isArray(profile.selectedFarmTypes) && profile.selectedFarmTypes.length > 0) {
            allowed = profile.selectedFarmTypes.map((t: string) => {
                if (t === "NURSERY_SMALL") return "SMALL";
                if (t === "NURSERY_LARGE") return "LARGE";
                if (t === "GROWOUT") return "MARKET";
                return "";
            });
        }
        else if (profile.primaryFarmType) {
             if (profile.primaryFarmType === "NURSERY_SMALL") allowed = ["SMALL"];
             if (profile.primaryFarmType === "NURSERY_LARGE") allowed = ["LARGE"];
             if (profile.primaryFarmType === "GROWOUT") allowed = ["MARKET"];
        }
      } catch (e) {
        console.error("Parse error", e);
      }
    }

    if (allowed.length === 0) {
        setDisplayItems(navItems);
    } else {
        const filtered = navItems.filter(item => allowed.includes(item.type));
        setDisplayItems(filtered.length > 0 ? filtered : navItems);
    }
  }, []);

  return (
    // ปรับ style:
    // 1. ลบ mx-auto และ max-w-2xl ออก เพื่อไม่ให้คอนเทนเนอร์ถูกบีบอยู่ตรงกลาง
    // 2. ลบ px-2 ออกเพื่อให้ชิดขอบซ้ายสุดของ parent (หรือใส่ไว้นิดหน่อยถ้าต้องการ)
    <div className="py-4 mt-4 w-full mt-8">
      {/* เปลี่ยน justify-center เป็น justify-start เพื่อให้ปุ่มเริ่มจากซ้าย */}
      <div className="flex items-center justify-start gap-3 md:gap-4 flex-wrap">
        {displayItems.map((item) => {
           const isActive = pathname.startsWith(item.path);

           return (
             <Link
               key={item.type}
               href={item.path}
               className={`
                 flex items-center gap-2 px-5 py-2.5 rounded-full text-sm md:text-base font-bold transition-all border
                 ${isActive
                   ? "bg-[#009D64] border-[#009D64] text-white shadow-md"
                   : "bg-white border-gray-300 text-black hover:bg-gray-50"
                 }
               `}
             >
               <Image
                 src={isActive
                    ? "/nursery-large/famicons_fish-w.svg"
                    : "/nursery-large/famicons_fish-bb.svg"
                 }
                 alt="fish icon"
                 width={20}
                 height={20}
               />
               {item.label}
             </Link>
           );
        })}
      </div>
    </div>
  );
}