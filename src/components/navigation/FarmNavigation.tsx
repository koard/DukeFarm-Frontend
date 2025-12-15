"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { FarmTypeOption, deriveFarmTypesFromProfile } from "@/utils/farmTypes";

type FarmType = FarmTypeOption;

interface NavItem {
  type: FarmType;
  label: string;
  path: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    type: "SMALL",
    label: "ปลาตุ้ม",
    path: "/small",
  },
  {
    type: "LARGE",
    label: "ปลานิ้ว",
    path: "/large",
  },
  {
    type: "MARKET",
    label: "ปลาตลาด",
    path: "/market",
  },
];

export default function FarmNavigation() {
  const pathname = usePathname();
  const [displayItems, setDisplayItems] = useState<NavItem[]>(NAV_ITEMS);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    let allowed: FarmType[] = [];

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        const profile = user.farmerProfile || {};
        allowed = deriveFarmTypesFromProfile(profile);
      } catch (e) {
        console.error("Parse error", e);
      }
    }

    if (allowed.length === 0) {
      setDisplayItems(NAV_ITEMS);
    } else {
      const filtered = NAV_ITEMS.filter((item) => allowed.includes(item.type));
      setDisplayItems(filtered.length > 0 ? filtered : NAV_ITEMS);
    }
  }, []);

  return (
    // ปรับ style:
    // 1. ลบ mx-auto และ max-w-2xl ออก เพื่อไม่ให้คอนเทนเนอร์ถูกบีบอยู่ตรงกลาง
    // 2. ลบ px-2 ออกเพื่อให้ชิดขอบซ้ายสุดของ parent (หรือใส่ไว้นิดหน่อยถ้าต้องการ)
    <div className="py-4 mt-4 w-full mt-8">
      {/* ใช้ grid 3 คอลัมน์เพื่อให้ปุ่มพอดีในแถวเดียวทุกหน้าจอ */}
      <div className="grid grid-cols-3 gap-2 md:gap-3 w-full">
        {displayItems.map((item) => {
           const isActive = pathname.startsWith(item.path);

           return (
             <Link
               key={item.type}
               href={item.path}
               className={`
                flex items-center justify-center gap-2 px-3 py-2 rounded-full text-xs sm:text-sm md:text-base font-semibold transition-all border whitespace-nowrap
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
               <span className="truncate">{item.label}</span>
             </Link>
           );
        })}
      </div>
    </div>
  );
}