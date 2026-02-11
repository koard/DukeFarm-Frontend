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
  pondId?: string;
}

const FARM_TYPE_ROUTES: Record<FarmType, string> = {
  SMALL: "/small",
  LARGE: "/large",
  MARKET: "/market",
};

const FARM_TYPE_LABELS: Record<FarmType, string> = {
  SMALL: "ปลาตุ้ม",
  LARGE: "ปลานิ้ว",
  MARKET: "ปลาตลาด",
};

export default function FarmNavigation() {
  const pathname = usePathname();
  const [displayItems, setDisplayItems] = useState<NavItem[]>([]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      // Fallback: show all farm types
      setDisplayItems(
        Object.entries(FARM_TYPE_ROUTES).map(([type, path]) => ({
          type: type as FarmType,
          label: FARM_TYPE_LABELS[type as FarmType],
          path,
        }))
      );
      return;
    }

    try {
      const user = JSON.parse(storedUser);
      const profile = user.farmerProfile || {};
      const ponds = profile.ponds as Array<{
        id: string;
        farmType: FarmType;
        pondType: string;
      }> | undefined;

      if (ponds && ponds.length > 0) {
        // Build nav items from ponds — one tab per pond
        const pondItems: NavItem[] = ponds.map((pond, index) => ({
          type: pond.farmType || "SMALL",
          label: `บ่อที่ ${index + 1}`,
          path: FARM_TYPE_ROUTES[pond.farmType] || "/small",
          pondId: pond.id,
        }));
        setDisplayItems(pondItems);
      } else {
        // Fallback to farm types from profile
        const allowed = deriveFarmTypesFromProfile(profile);
        if (allowed.length <= 1) {
          setDisplayItems(
            Object.entries(FARM_TYPE_ROUTES).map(([type, path]) => ({
              type: type as FarmType,
              label: FARM_TYPE_LABELS[type as FarmType],
              path,
            }))
          );
        } else {
          const filtered = allowed.map((type) => ({
            type,
            label: FARM_TYPE_LABELS[type],
            path: FARM_TYPE_ROUTES[type],
          }));
          setDisplayItems(filtered);
        }
      }
    } catch (e) {
      console.error("Parse error", e);
      setDisplayItems(
        Object.entries(FARM_TYPE_ROUTES).map(([type, path]) => ({
          type: type as FarmType,
          label: FARM_TYPE_LABELS[type as FarmType],
          path,
        }))
      );
    }
  }, []);

  return (
    <div className="py-4 mt-4 w-full mt-8">
      <div className={`grid gap-2 md:gap-3 w-full`} style={{ gridTemplateColumns: `repeat(${Math.min(displayItems.length, 4)}, minmax(0, 1fr))` }}>
        {displayItems.map((item, idx) => {
          const isActive = pathname.startsWith(item.path);

          return (
            <Link
              key={item.pondId || `${item.type}-${idx}`}
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