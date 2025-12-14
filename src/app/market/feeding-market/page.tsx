"use client";

import { FeedingView } from "@/components/feeding/FeedingView";

export default function FeedingMarketPage() {
  return <FeedingView farmType="MARKET" backHref="/market" />;
}