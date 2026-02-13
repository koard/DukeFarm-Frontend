"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
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
  const router = useRouter();
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

      let items: NavItem[] = [];

      if (ponds && ponds.length > 0) {
        // Build nav items from ponds — one tab per pond
        items = ponds.map((pond, index) => ({
          type: pond.farmType || "SMALL",
          label: `บ่อที่ ${index + 1} (${FARM_TYPE_LABELS[pond.farmType || "SMALL"]})`,
          path: `/dashboard-farmer?type=${pond.farmType}&pondId=${pond.id}`,
          pondId: pond.id,
        }));
      } else {
        // Fallback to farm types from profile
        const allowed = deriveFarmTypesFromProfile(profile);
        if (allowed.length === 0) {
          items = Object.keys(FARM_TYPE_LABELS).map((type) => ({
            type: type as FarmType,
            label: FARM_TYPE_LABELS[type as FarmType],
            path: `/dashboard-farmer?type=${type}`,
          }));
        } else {
          items = allowed.map((type) => ({
            type,
            label: FARM_TYPE_LABELS[type],
            path: `/dashboard-farmer?type=${type}`,
          }));
        }
      }
      setDisplayItems(items);
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

  // Auto-select first item if no pondId/type selected or invalid
  useEffect(() => {
    if (displayItems.length > 0) {
      const hasActive = displayItems.some(item => {
        if (currentPondId && item.pondId) return currentPondId === item.pondId;
        if (currentType && !item.pondId) return currentType === item.type;
        return false;
      });

      // If no active item found in current URL params, redirect to the first item
      if (!hasActive && !currentPondId) {
        router.replace(displayItems[0].path);
      }
    }
  }, [displayItems, currentPondId, currentType, router]);


  return (
    <div className="w-full mt-2">
      <div className="flex overflow-x-auto gap-3 py-2 w-full no-scrollbar px-5" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        {displayItems.map((item, idx) => {
          let isActive = false;
          if (currentPondId && item.pondId) {
            isActive = currentPondId === item.pondId;
          } else if (currentType && !currentPondId && !item.pondId) {
            isActive = currentType === item.type;
          } else if (!currentType && !currentPondId && idx === 0) {
            isActive = true;
          }

          return (
            <Link
              key={item.pondId || `${item.type}-${idx}`}
              href={item.path}
              className={`
                flex-shrink-0 flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm md:text-base font-semibold transition-all whitespace-nowrap
                 ${isActive
                  ? "bg-[#093832] text-white shadow-lg shadow-[#093832]/20 ring-2 ring-[#093832] ring-offset-2"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
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