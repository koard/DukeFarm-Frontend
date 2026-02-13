"use client";

import { useSearchParams } from "next/navigation";
import { MarketPriceView } from "@/components/price/MarketPriceView";
import { FarmTypeOption } from "@/utils/farmTypes";
import { Suspense } from "react";

function PriceContent() {
    const searchParams = useSearchParams();
    const pondId = searchParams.get("pondId") || undefined;
    const farmType = (searchParams.get("type") as FarmTypeOption) || "SMALL";

    const backHref = pondId
        ? `/dashboard-farmer?type=${farmType}&pondId=${pondId}`
        : `/dashboard-farmer?type=${farmType}`;

    return <MarketPriceView backHref={backHref} />;
}

export default function PricePage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-white" />}>
            <PriceContent />
        </Suspense>
    );
}
