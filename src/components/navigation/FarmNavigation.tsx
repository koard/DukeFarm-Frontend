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
    const buildNavFromProfile = (profile: Record<string, unknown>) => {
      const ponds = profile.ponds as Array<{
        id: string;
        farmType: FarmType;
        pondType: string;
      }> | undefined;

      let items: NavItem[] = [];

      if (ponds && ponds.length > 0) {
        items = ponds.map((pond, index) => ({
          type: pond.farmType || "SMALL",
          label: `บ่อที่ ${index + 1} (${FARM_TYPE_LABELS[pond.farmType || "SMALL"]})`,
          path: `/dashboard-farmer?type=${pond.farmType}&pondId=${pond.id}`,
          pondId: pond.id,
        }));
      } else {
        const allowed = deriveFarmTypesFromProfile(profile as Parameters<typeof deriveFarmTypesFromProfile>[0]);
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
      return items;
    };

    const fallbackItems = Object.keys(FARM_TYPE_LABELS).map((type) => ({
      type: type as FarmType,
      label: FARM_TYPE_LABELS[type as FarmType],
      path: `/dashboard-farmer?type=${type}`,
    }));

    // Try localStorage first
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        const profile = user.farmerProfile || {};
        setDisplayItems(buildNavFromProfile(profile));
      } catch {
        setDisplayItems(fallbackItems);
      }
    } else {
      setDisplayItems(fallbackItems);
    }

    // Refresh from API to ensure up-to-date data
    const refreshFromApi = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) return;
        const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://dukefarm-backend.onrender.com/api";
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const { data } = await res.json();
          if (data?.farmerProfile) {
            const items = buildNavFromProfile(data.farmerProfile);
            if (items.length > 0) {
              setDisplayItems(items);
            }
            // Update localStorage with fresh ponds data
            const currentRaw = localStorage.getItem("user");
            const current = currentRaw ? JSON.parse(currentRaw) : {};
            const merged = { ...current, ...data, farmerProfile: { ...(current.farmerProfile ?? {}), ...data.farmerProfile } };
            localStorage.setItem("user", JSON.stringify(merged));
          }
        }
      } catch (err) {
        console.warn("Could not refresh nav from API", err);
      }
    };
    refreshFromApi();
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
    <div className="w-full">
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
                ? "bg-[#093832] text-white" 
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