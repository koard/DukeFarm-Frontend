"use client";

import { useSearchParams } from "next/navigation";
import { DiseaseInfo } from "@/components/disease/DiseaseInfo";
import { FarmTypeOption } from "@/utils/farmTypes";
import { Suspense } from "react";

function DiseaseInfoContent() {
    const searchParams = useSearchParams();
    const pondId = searchParams.get("pondId") || undefined;
    const farmType = (searchParams.get("type") as FarmTypeOption) || "SMALL";

    const backHref = pondId
        ? `/dashboard-farmer?type=${farmType}&pondId=${pondId}`
        : `/dashboard-farmer?type=${farmType}`;

    return <DiseaseInfo backHref={backHref} />;
}

export default function DiseaseInfoPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-white" />}>
            <DiseaseInfoContent />
        </Suspense>
    );
}
