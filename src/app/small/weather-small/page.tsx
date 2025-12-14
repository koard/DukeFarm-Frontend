"use client";

import { WeatherView } from "@/components/weather/WeatherView";

export default function WeatherSmallPage() {
  return <WeatherView farmType="SMALL" backHref="/small" />;
}