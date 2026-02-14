"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from 'next/dynamic';
import { 
  FiArrowLeft,
  FiSun,
  FiCloud,
  FiCloudRain
} from "react-icons/fi";
import { ProfileDropdownMenu } from "@/components/common/ProfileDropdownMenu";

// Dynamic import for WeatherMap to avoid SSR issues
const WeatherMap = dynamic(() => import('./WeatherMap'), {
  ssr: false,
  loading: () => (
    <div className="relative h-64 bg-gradient-to-br from-green-300 via-yellow-200 to-orange-300 rounded-lg">
      <div className="absolute inset-0 flex items-center justify-center text-gray-600">
        Loading map...
      </div>
    </div>
  )
});

interface HourlyForecast {
  time: string;
  temp: number;
  condition: string;
  humidity: number;
  windSpeed: number;
}

interface DailyForecast {
  day: string;
  date: string;
  high: number;
  low: number;
  condition: "sunny" | "cloudy" | "rainy";
  description: string;
}

export default function WeatherPage() {
  const router = useRouter();
  const [hourlyForecast] = useState<HourlyForecast[]>([]);
  const [dailyForecast] = useState<DailyForecast[]>([]);
  const [currentTimestamp, setCurrentTimestamp] = useState(() => new Date());

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTimestamp(new Date());
    }, 60_000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentTimestamp.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
  const formattedTime = currentTimestamp.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white p-4 shadow-sm relative z-50">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiArrowLeft className="text-xl text-gray-700" />
          </button>
          <ProfileDropdownMenu showGreeting={false} />
        </div>
        
        {/* Time Display */}
        <div className="text-left mb-1">
          <span className="text-orange-400 text-sm font-medium">{formattedDate}, {formattedTime}</span>
        </div>
        
        {/* Location */}
        <div className="text-left mb-2">
          <h1 className="text-3xl font-bold text-gray-800">-</h1>
        </div>
        
        {/* Country Description */}
        <div className="text-left">
          <span className="text-gray-600 text-sm font-medium">ไม่มีข้อมูลสภาพอากาศ</span>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-4">
        {/* Weather Map Area - Real OpenStreetMap */}
        <div className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden">
          {/* Map Section */}
          <WeatherMap />
        </div>

        {/* Hourly Forecast */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 overflow-hidden">
          <h3 className="text-gray-700 text-lg font-medium mb-4">Hourly forecast</h3>
          {hourlyForecast.length === 0 ? (
            <div className="text-center text-gray-500 py-6">ไม่มีข้อมูล</div>
          ) : (
            <div className="space-y-3">
              {hourlyForecast.map((hour) => (
                <div key={hour.time} className="flex items-center justify-between border border-gray-100 rounded-lg px-4 py-2">
                  <div className="font-semibold text-gray-800">{hour.time}</div>
                  <div className="text-gray-700">{hour.temp}°C</div>
                  <div className="text-sm text-gray-500 capitalize">{hour.condition}</div>
                  <div className="text-xs text-gray-500">ความชื้น {hour.humidity}% • ลม {hour.windSpeed} m/s</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 8-Day Forecast */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <h3 className="text-gray-700 text-lg font-medium mb-4">8-day forecast</h3>
          
          {dailyForecast.length === 0 ? (
            <div className="text-center text-gray-500 py-6">ไม่มีข้อมูล</div>
          ) : (
            <div className="space-y-3">
              {dailyForecast.map((day, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  {/* Date */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-800 text-sm">{day.day}</div>
                    <div className="text-xs text-gray-600">{day.date}</div>
                  </div>
                  
                  {/* Weather Icon */}
                  <div className="flex-shrink-0 mx-4">
                    {day.condition === "sunny" && (
                      <div className="w-8 h-8 flex items-center justify-center">
                        <FiSun className="text-yellow-500 text-xl" />
                      </div>
                    )}
                    {day.condition === "cloudy" && (
                      <div className="w-8 h-8 flex items-center justify-center">
                        <FiCloud className="text-gray-500 text-xl" />
                      </div>
                    )}
                    {day.condition === "rainy" && (
                      <div className="w-8 h-8 flex items-center justify-center">
                        <FiCloudRain className="text-blue-500 text-xl" />
                      </div>
                    )}
                  </div>
                  
                  {/* Temperature */}
                  <div className="flex-shrink-0 text-right mr-4">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-gray-800">{day.high}°</span>
                      <span className="text-gray-500">/</span>
                      <span className="text-gray-500">{day.low}°C</span>
                    </div>
                  </div>
                  
                  {/* Weather Description */}
                  <div className="flex-1 text-right min-w-0">
                    <div className="text-sm text-gray-600 capitalize">
                      {day.description}
                    </div>
                    <div className="w-4 h-4 rounded-full bg-blue-100 ml-auto mt-1"></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
