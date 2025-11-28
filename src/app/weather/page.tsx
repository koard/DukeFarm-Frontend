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

interface WeatherData {
  location: string;
  temperature: number;
  condition: "sunny" | "cloudy" | "rainy";
  humidity: number;
  windSpeed: number;
  visibility: number;
  waterTemp: number;
  recommendation: string;
  currentDate: string;
  currentTime: string;
}

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
  const [weatherData, setWeatherData] = useState<WeatherData>({
    location: "ลำลูกกา, ไทย",
    temperature: 31,
    condition: "rainy",
    humidity: 80,
    windSpeed: 8,
    visibility: 10,
    waterTemp: 28,
    recommendation: "สภาพอากาศมีฝนตก แนะนำให้อาหารปลาน้อยลง และตรวจสอบระบบระบายน้ำ",
    currentDate: "13 พฤษภาคม 2567",
    currentTime: "21:11"
  });

  const [hourlyForecast] = useState<HourlyForecast[]>([
    { time: "21:00", temp: 31, condition: "rainy", humidity: 80, windSpeed: 8 },
    { time: "22:00", temp: 30, condition: "rainy", humidity: 85, windSpeed: 7 },
    { time: "23:00", temp: 29, condition: "rainy", humidity: 90, windSpeed: 6 },
    { time: "00:00", temp: 28, condition: "cloudy", humidity: 85, windSpeed: 5 },
    { time: "01:00", temp: 27, condition: "cloudy", humidity: 80, windSpeed: 4 },
    { time: "02:00", temp: 26, condition: "cloudy", humidity: 75, windSpeed: 5 },
    { time: "03:00", temp: 26, condition: "cloudy", humidity: 70, windSpeed: 6 },
    { time: "04:00", temp: 25, condition: "cloudy", humidity: 75, windSpeed: 7 }
  ]);

  const [dailyForecast] = useState<DailyForecast[]>([
    { day: "อังคาร", date: "13 พ.ค.", high: 31, low: 26, condition: "rainy", description: "ฝนปานกลาง" },
    { day: "พุธ", date: "14 พ.ค.", high: 34, low: 26, condition: "rainy", description: "ฝนปานกลาง" },
    { day: "พฤหัสบดี", date: "15 พ.ค.", high: 34, low: 26, condition: "rainy", description: "ฝนปานกลาง" },
    { day: "ศุกร์", date: "16 พ.ค.", high: 35, low: 27, condition: "rainy", description: "ฝนเบา" },
    { day: "เสาร์", date: "17 พ.ค.", high: 35, low: 28, condition: "cloudy", description: "เมฆมาก" },
    { day: "อาทิตย์", date: "18 พ.ค.", high: 35, low: 28, condition: "rainy", description: "ฝนเบา" },
    { day: "จันทร์", date: "19 พ.ค.", high: 35, low: 28, condition: "rainy", description: "ฝนเบา" },
    { day: "อังคาร", date: "20 พ.ค.", high: 37, low: 29, condition: "rainy", description: "ฝนเบา" }
  ]);

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      router.push("/login");
    }
  }, [router]);

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case "sunny":
        return <FiSun className="text-6xl text-yellow-500" />;
      case "cloudy":
        return <FiCloud className="text-6xl text-gray-500" />;
      case "rainy":
        return <FiCloudRain className="text-6xl text-blue-500" />;
      default:
        return <FiSun className="text-6xl text-yellow-500" />;
    }
  };

  const getConditionText = (condition: string) => {
    switch (condition) {
      case "sunny":
        return "แจ่มใส";
      case "cloudy":
        return "เมฆมาก";
      case "rainy":
        return "ฝนตก";
      default:
        return "แจ่มใส";
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiArrowLeft className="text-xl text-gray-700" />
          </button>
        </div>
        
        {/* Time Display */}
        <div className="text-left mb-1">
          <span className="text-orange-400 text-sm font-medium">May 13, 09:11pm</span>
        </div>
        
        {/* Location */}
        <div className="text-left mb-2">
          <h1 className="text-3xl font-bold text-gray-800">Lam Luk Ka, TH</h1>
        </div>
        
        {/* Country Description */}
        <div className="text-left">
          <span className="text-gray-600 text-sm font-medium">THAILAND CURRENT TEMPERATURES</span>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-4">
        {/* Weather Map Area - Real OpenStreetMap */}
        <div className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden">
          {/* Map Section */}
          <WeatherMap />
        </div>

        {/* Hourly Forecast Chart */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 overflow-hidden">
          <h3 className="text-gray-700 text-lg font-medium mb-4">Hourly forecast</h3>
          
          {/* Time labels */}
          <div className="flex justify-between mb-3 text-xs text-gray-600 px-6">
            <span>9pm</span>
            <span>10pm</span>
            <span>11pm</span>
            <span>May 14</span>
            <span>1am</span>
            <span>2am</span>
            <span>3am</span>
            <span>4am</span>
          </div>

          {/* Temperature Graph Area */}
          <div className="relative h-24 mb-4">
            {/* Y-axis temperature labels */}
            <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-orange-500 font-medium">
              <span>34°</span>
              <span>32°</span>
              <span>30°</span>
              <span>28°</span>
              <span>26°</span>
            </div>
            
            {/* Graph area with margin for labels */}
            <div className="ml-6 h-full relative">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* Temperature curve - orange line */}
                <polyline
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="2"
                  points="5,15 18,25 30,35 42,45 55,50 68,45 82,25 95,35"
                  vectorEffect="non-scaling-stroke"
                />
                {/* Temperature points */}
                <circle cx="5" cy="15" r="1.5" fill="#f97316" />
                <circle cx="18" cy="25" r="1.5" fill="#f97316" />
                <circle cx="30" cy="35" r="1.5" fill="#f97316" />
                <circle cx="42" cy="45" r="1.5" fill="#f97316" />
                <circle cx="55" cy="50" r="1.5" fill="#f97316" />
                <circle cx="68" cy="45" r="1.5" fill="#f97316" />
                <circle cx="82" cy="25" r="1.5" fill="#f97316" />
                <circle cx="95" cy="35" r="1.5" fill="#f97316" />
              </svg>
            </div>
          </div>

          {/* Wind speed indicator */}
          <div className="mb-3 px-6">
            <div className="text-xs text-teal-600 font-medium">0.12km/h</div>
          </div>

          {/* Humidity and conditions row */}
          <div className="px-6">
            <div className="grid grid-cols-8 gap-1 text-center">
              <div className="min-w-0">
                <div className="text-xs text-teal-600 font-medium mb-1">100%</div>
                <div className="text-gray-500 text-[10px] leading-tight">light<br/>rain</div>
                <div className="text-gray-500 text-[9px] mt-1">2.5m/s</div>
              </div>
              <div className="min-w-0">
                <div className="text-xs text-teal-600 font-medium mb-1">80%</div>
                <div className="text-gray-500 text-[10px] leading-tight">light<br/>clouds</div>
                <div className="text-gray-500 text-[9px] mt-1">1.7m/s</div>
              </div>
              <div className="min-w-0">
                <div className="text-xs text-teal-600 font-medium mb-1">80%</div>
                <div className="text-gray-500 text-[10px] leading-tight">light<br/>clouds</div>
                <div className="text-gray-500 text-[9px] mt-1">1.5m/s</div>
              </div>
              <div className="min-w-0">
                <div className="text-xs text-teal-600 font-medium mb-1">80%</div>
                <div className="text-gray-500 text-[10px] leading-tight">light<br/>clouds</div>
                <div className="text-gray-500 text-[9px] mt-1">1.6m/s</div>
              </div>
              <div className="min-w-0">
                <div className="text-xs text-teal-600 font-medium mb-1">80%</div>
                <div className="text-gray-500 text-[10px] leading-tight">light<br/>clouds</div>
                <div className="text-gray-500 text-[9px] mt-1">1.6m/s</div>
              </div>
              <div className="min-w-0">
                <div className="text-xs text-gray-500 font-medium mb-1">0%</div>
                <div className="text-gray-500 text-[10px] leading-tight">light<br/>clouds</div>
                <div className="text-gray-500 text-[9px] mt-1">1.8m/s</div>
              </div>
              <div className="min-w-0">
                <div className="text-xs text-gray-500 font-medium mb-1">0%</div>
                <div className="text-gray-500 text-[10px] leading-tight">light<br/>clouds</div>
                <div className="text-gray-500 text-[9px] mt-1">1.1m/s</div>
              </div>
              <div className="min-w-0">
                <div className="text-xs text-gray-500 font-medium mb-1">0%</div>
                <div className="text-gray-500 text-[10px] leading-tight">light<br/>clouds</div>
                <div className="text-gray-500 text-[9px] mt-1">1.1m/s</div>
              </div>
            </div>
          </div>
        </div>

        {/* 8-Day Forecast */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <h3 className="text-gray-700 text-lg font-medium mb-4">8-day forecast</h3>
          
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
        </div>
      </div>
    </div>
  );
}
