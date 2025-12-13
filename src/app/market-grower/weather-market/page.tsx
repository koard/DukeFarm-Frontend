"use client";

import { WeatherView } from "@/components/weather/WeatherView";

export default function WeatherMarketPage() {
  return <WeatherView farmType="GROWOUT" backHref="/market-grower" />;
}