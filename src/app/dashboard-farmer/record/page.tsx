"use client";

import { useSearchParams } from "next/navigation";
import { RecordEntryForm } from "@/components/records/RecordEntryForm";
import { FarmTypeOption } from "@/utils/farmTypes";
import { Suspense } from "react";

function RecordContent() {
    const searchParams = useSearchParams();
    const pondId = searchParams.get("pondId") || undefined;
    const farmType = (searchParams.get("type") as FarmTypeOption) || "SMALL";

    const backHref = pondId
        ? `/dashboard-farmer?type=${farmType}&pondId=${pondId}`
        : `/dashboard-farmer?type=${farmType}`;

    return <RecordEntryForm farmType={farmType} backHref={backHref} pondId={pondId} />;
}

export default function RecordPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-white" />}>
            <RecordContent />
        </Suspense>
    );
}
