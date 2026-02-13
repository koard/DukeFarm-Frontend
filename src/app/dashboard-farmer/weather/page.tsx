"use client";

import { useSearchParams } from "next/navigation";
import { WeatherView } from "@/components/weather/WeatherView";
import { FarmTypeOption } from "@/utils/farmTypes";
import { Suspense } from "react";

function WeatherContent() {
    const searchParams = useSearchParams();
    const pondId = searchParams.get("pondId") || undefined;
    const farmType = (searchParams.get("type") as FarmTypeOption) || "SMALL";

    const backHref = pondId
        ? `/dashboard-farmer?type=${farmType}&pondId=${pondId}`
        : `/dashboard-farmer?type=${farmType}`;

    return <WeatherView farmType={farmType} backHref={backHref} pondId={pondId} />;
}

export default function WeatherPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-white" />}>
            <WeatherContent />
        </Suspense>
    );
}
