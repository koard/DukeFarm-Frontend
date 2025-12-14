"use client";

import { WeatherView } from "@/components/weather/WeatherView";

export default function WeatherLargePage() {
  return <WeatherView farmType="LARGE" backHref="/large" />;
}