"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://dukefarm-backend.onrender.com/api";

export type DashboardGroup = "SMALL" | "LARGE" | "MARKET";

export interface DashboardResponse {
  group: string;
  hasData: boolean;
  summary: Record<string, unknown>;
  feedingPlan: unknown;
}

export const useDashboardData = <T = DashboardResponse>(group: DashboardGroup, pondId?: string) => {
  const router = useRouter();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setError("กรุณาเข้าสู่ระบบอีกครั้ง");
        router.push("/login");
        setData(null);
        return;
      }

      let url = `${API_BASE_URL}/dashboard/groups/${group}`;
      if (pondId) {
        url += `?pondId=${pondId}`;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("ไม่สามารถโหลดข้อมูลแดชบอร์ดได้");
      }

      const result = await response.json();
      setData((result.data ?? null) as T | null);
    } catch (err) {
      console.error("Dashboard fetch error", err);
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [group, pondId, router]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return { data, loading, error, refresh: fetchDashboard } as const;
};
