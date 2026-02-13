"use client";

import { useSearchParams } from "next/navigation";
import { FeedingView } from "@/components/feeding/FeedingView";
import { FarmTypeOption } from "@/utils/farmTypes";
import { Suspense } from "react";

function FeedingContent() {
    const searchParams = useSearchParams();
    const pondId = searchParams.get("pondId") || undefined;
    const farmType = (searchParams.get("type") as FarmTypeOption) || "SMALL";

    const backHref = pondId
        ? `/dashboard-farmer?type=${farmType}&pondId=${pondId}`
        : `/dashboard-farmer?type=${farmType}`;

    return <FeedingView farmType={farmType} backHref={backHref} />;
}

export default function FeedingPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-white" />}>
            <FeedingContent />
        </Suspense>
    );
}
