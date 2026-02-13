"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { FarmTypeOption, deriveFarmTypesFromProfile } from "@/utils/farmTypes";

type FarmType = FarmTypeOption;

interface NavItem {
  type: FarmType;
  label: string;
  path: string;
  pondId?: string;
}

const FARM_TYPE_LABELS: Record<FarmType, string> = {
  SMALL: "ปลาตุ้ม",
  LARGE: "ปลานิ้ว",
  MARKET: "ปลาตลาด",
};

export default function FarmNavigation() {
  const searchParams = useSearchParams();
  const currentPondId = searchParams.get("pondId");
  const currentType = searchParams.get("type");

  const [displayItems, setDisplayItems] = useState<NavItem[]>([]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      // Fallback: show all farm types pointing to dashboard-farmer
      setDisplayItems(
        Object.keys(FARM_TYPE_LABELS).map((type) => ({
          type: type as FarmType,
          label: FARM_TYPE_LABELS[type as FarmType],
          path: `/dashboard-farmer?type=${type}`,
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
          label: `บ่อที่ ${index + 1} (${FARM_TYPE_LABELS[pond.farmType || "SMALL"]})`,
          path: `/dashboard-farmer?type=${pond.farmType}&pondId=${pond.id}`,
          pondId: pond.id,
        }));
        setDisplayItems(pondItems);
      } else {
        // Fallback to farm types from profile
        const allowed = deriveFarmTypesFromProfile(profile);
        if (allowed.length === 0) {
          setDisplayItems(
            Object.keys(FARM_TYPE_LABELS).map((type) => ({
              type: type as FarmType,
              label: FARM_TYPE_LABELS[type as FarmType],
              path: `/dashboard-farmer?type=${type}`,
            }))
          );
        } else {
          const filtered = allowed.map((type) => ({
            type,
            label: FARM_TYPE_LABELS[type],
            path: `/dashboard-farmer?type=${type}`,
          }));
          setDisplayItems(filtered);
        }
      }
    } catch (e) {
      console.error("Parse error", e);
      // Fallback on error
      setDisplayItems(
        Object.keys(FARM_TYPE_LABELS).map((type) => ({
          type: type as FarmType,
          label: FARM_TYPE_LABELS[type as FarmType],
          path: `/dashboard-farmer?type=${type}`,
        }))
      );
    }
  }, []);

  return (
    <div className="py-4 mt-4 w-full mt-8">
      <div className={`grid gap-2 md:gap-3 w-full`} style={{ gridTemplateColumns: `repeat(${Math.min(displayItems.length, 4)}, minmax(0, 1fr))` }}>
        {displayItems.map((item, idx) => {
          // customized isActive logic
          let isActive = false;

          if (currentPondId && item.pondId) {
            isActive = currentPondId === item.pondId;
          } else if (currentType && !currentPondId && !item.pondId) {
            isActive = currentType === item.type;
          } else if (!currentType && !currentPondId && idx === 0) {
            // Default to first item if no params
            isActive = true;
          }


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
                  ? "/dashboard/famicons_fish-w.svg"
                  : "/dashboard/famicons_fish-bb.svg"
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