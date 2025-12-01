"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ChevronLeft, Cloud, CloudRain, CloudSun, Sun, Droplets, Wind, MapPin, ArrowUp, ArrowDown } from "lucide-react";
import { useLineUser } from "@/hooks/useLineUser";
import { CacheManager } from "@/utils/cache";
import { fixLeafletDefaultIcon } from "@/utils/leaflet-icon";

import "leaflet/dist/leaflet.css";

// Fix Leaflet default icon paths
fixLeafletDefaultIcon();

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

const RecenterAutomatically = dynamic(
  () => import("react-leaflet").then((mod) => {
    const { useMap } = mod;
    return function Recenter({ lat, lon }: { lat: number, lon: number }) {
      const map = useMap();
      useEffect(() => {
        map.flyTo([lat, lon], 13);
      }, [lat, lon, map]);
      return null;
    };
  }),
  { ssr: false }
);

// Types
interface Coordinates {
  lat: number;
  lon: number;
}


interface CurrentWeather {
  temp: number;
  humidity: number;
  rain: number;
  weatherCode: number;
  time: string;
}

interface DailyForecast {
  date: string;
  tempMax: number;
  tempMin: number;
  weatherCode: number;
}

interface HourlyForecast {
  time: string;
  temp: number;
  rainProb: number;
  weatherCode: number;
}

interface DashboardData {
  summary: {
    weather: {
      temperatureC: number;
      humidityPct: number;
      rainMm: number;
      weatherCode: number;
    } | null;
    hourlyForecast: Array<{
      time: string;
      temperatureC: number;
      precipitationProbability: number;
      weatherCode: number;
    }>;
  };
  feedingPlan: Array<{
    date: string;
    highTemperatureC: number;
    lowTemperatureC: number;
    weatherCode: number;
  }>;
}

interface WeatherInfo {
  label: string;
  icon: React.ReactNode;
}

// Constants
const DEFAULT_COORDS: Coordinates = { lat: 13.7563, lon: 100.5018 }; // Bangkok
const DASHBOARD_CACHE_KEY = "nurserySmallDashboard";
const LOCALE_TH = 'th-TH';

// Utility functions
const getWeatherInfo = (code: number): WeatherInfo => {
  if (code === 0) return { label: "ฟ้าโปร่ง", icon: <Sun className="w-8 h-8 text-orange-400" /> };
  if (code >= 1 && code <= 3) return { label: "มีเมฆ", icon: <CloudSun className="w-8 h-8 text-yellow-500" /> };
  if (code >= 45 && code <= 48) return { label: "มีหมอก", icon: <Cloud className="w-8 h-8 text-gray-400" /> };
  if (code >= 51 && code <= 67) return { label: "ฝนปรอย", icon: <CloudRain className="w-8 h-8 text-blue-400" /> };
  if (code >= 80 && code <= 99) return { label: "พายุฝน", icon: <CloudRain className="w-8 h-8 text-purple-500" /> };
  return { label: "ฝนตก", icon: <CloudRain className="w-8 h-8 text-blue-500" /> };
};

const formatThaiDateTime = () => {
  const now = new Date();
  const thaiDate = now.toLocaleDateString(LOCALE_TH, { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });
  const thaiTime = now.toLocaleTimeString(LOCALE_TH, { hour: '2-digit', minute: '2-digit' });
  return `${thaiDate} ${thaiTime}`;
};

const getUserCoordinates = (): Coordinates => {
  try {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return DEFAULT_COORDS;

    const parsedUser = JSON.parse(storedUser);
    const { farmLatitude, farmLongitude } = parsedUser.farmerProfile || {};

    if (farmLatitude && farmLongitude) {
      return { lat: farmLatitude, lon: farmLongitude };
    }
  } catch (error) {
    console.error("Error parsing user coordinates:", error);
  }
  return DEFAULT_COORDS;
};

// Component: Weather stat card
interface WeatherStatProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  bgColor: string;
}

const WeatherStat = ({ icon, label, value, bgColor }: WeatherStatProps) => (
  <div className={`${bgColor} p-2 rounded-lg`}>
    {icon}
    <p className="text-[10px] text-gray-500">{label}</p>
    <p className="font-bold text-gray-700 text-xs truncate">{value}</p>
  </div>
);

// Component: Hourly forecast card
interface HourlyCardProps {
  hour: HourlyForecast;
}

const HourlyCard = ({ hour }: HourlyCardProps) => {
  const info = getWeatherInfo(hour.weatherCode);
  return (
    <div className="flex flex-col items-center min-w-[85px] bg-gray-50 p-2 rounded-xl border border-gray-100">
      <span className="text-xs text-gray-500 mb-1">{hour.time}</span>
      <div className="flex flex-col items-center justify-center h-14">
        {info.icon}
        <span className="text-[10px] text-gray-600 font-medium mt-1 text-center leading-none">
          {info.label}
        </span>
      </div>
      <span className="text-lg font-bold text-gray-700 mt-1">{Math.round(hour.temp)}°</span>
      <span className="text-[10px] text-blue-500 flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded-full mt-1">
        <Droplets className="w-3 h-3"/> ฝน {hour.rainProb}%
      </span>
    </div>
  );
};

// Component: Daily forecast row
interface DailyRowProps {
  day: DailyForecast;
}

const DailyRow = ({ day }: DailyRowProps) => {
  const info = getWeatherInfo(day.weatherCode);
  return (
    <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
      <div className="w-24 text-sm font-medium text-gray-600">{day.date}</div>
      <div className="flex flex-col items-center w-24">
        {info.icon}
        <span className="text-[10px] text-gray-500 mt-1 text-center">{info.label}</span>
      </div>
      <div className="flex flex-col items-end gap-1 w-20">
        <span className="text-sm font-bold text-orange-500 flex items-center gap-1">
          <ArrowUp className="w-3 h-3"/> {Math.round(day.tempMax)}°
        </span>
        <span className="text-sm font-medium text-blue-500 flex items-center gap-1">
          <ArrowDown className="w-3 h-3"/> {Math.round(day.tempMin)}°
        </span>
      </div>
    </div>
  );
};

export default function WeatherSmallPage() {
  const router = useRouter();
  const lineUser = useLineUser();

  // State
  const [coords] = useState<Coordinates>(getUserCoordinates);
  const [locationName, setLocationName] = useState("กำลังโหลดข้อมูล...");
  const [current, setCurrent] = useState<CurrentWeather | null>(null);
  const [daily, setDaily] = useState<DailyForecast[]>([]);
  const [hourly, setHourly] = useState<HourlyForecast[]>([]);
  const [loading, setLoading] = useState(true);

  // Load weather data from sessionStorage
  useEffect(() => {
    const loadWeatherData = () => {
      try {
        setLoading(true);
        const dashboardData = CacheManager.get<DashboardData>(DASHBOARD_CACHE_KEY);
        
        if (!dashboardData) {
          console.warn("ไม่พบข้อมูลใน cache หรือข้อมูลหมดอายุ");
          setLocationName("ไม่พบข้อมูล - กรุณากลับไปหน้าหลัก");
          return;
        }
        const { summary, feedingPlan } = dashboardData;

        // Set location
        setLocationName("ตำแหน่งฟาร์ม");

        // Set current weather
        if (summary.weather) {
          setCurrent({
            temp: summary.weather.temperatureC,
            humidity: summary.weather.humidityPct || 0,
            rain: summary.weather.rainMm || 0,
            weatherCode: summary.weather.weatherCode || 0,
            time: formatThaiDateTime()
          });
        }

        // Set daily forecast
        const dailyData = feedingPlan.map((item) => ({
          date: new Date(item.date).toLocaleDateString(LOCALE_TH, { 
            weekday: 'short', 
            day: 'numeric', 
            month: 'short' 
          }),
          tempMax: item.highTemperatureC,
          tempMin: item.lowTemperatureC,
          weatherCode: item.weatherCode
        }));
        setDaily(dailyData);

        // Set hourly forecast
        const hourlyData = summary.hourlyForecast.slice(0, 24).map((item) => ({
          time: new Date(item.time).toLocaleTimeString(LOCALE_TH, { 
            hour: 'numeric', 
            minute: '2-digit' 
          }),
          temp: item.temperatureC,
          rainProb: item.precipitationProbability,
          weatherCode: item.weatherCode
        }));
        setHourly(hourlyData);

      } catch (error) {
        console.error("ไม่สามารถโหลดข้อมูลสภาพอากาศ:", error);
        setLocationName("เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };

    loadWeatherData();
  }, []);

  // Memoized values
  const currentWeatherInfo = useMemo(
    () => current ? getWeatherInfo(current.weatherCode) : { label: "...", icon: null },
    [current]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">กำลังโหลดข้อมูลสภาพอากาศ...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="bg-[#093832] text-white px-4 pt-8 pb-10 rounded-b-[40px] shadow-md relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <Link 
              href="/nursery-small" 
              className="p-1 hover:bg-white/10 rounded-full transition-colors"
            >
              <ChevronLeft className="w-8 h-8" />
            </Link>
            <h1 className="text-2xl font-bold">สภาพอากาศ</h1>
        </div>

        <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm text-gray-300 leading-tight">ยินดีต้อนรับ</p>
              <p className="text-sm font-bold leading-tight">{lineUser.displayName || "เกษตรกร"}</p>
            </div>
            <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-gray-200">
               {lineUser.pictureUrl && <img src={lineUser.pictureUrl} alt="Profile" className="w-full h-full object-cover" />}
            </div>
        </div>
      </div>

      <div className="px-4 mt-5 pb-10 space-y-4">
        
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="mb-3 flex justify-between items-start">
                <div className="max-w-[70%]"> 
                    <p className="text-[#D66D58] text-xs font-medium">{current?.time || "กำลังโหลด..."}</p>
                    <div className="flex items-start gap-1 mt-1">
                        <MapPin className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" /> 
                        <h2 className="text-[#1E1E1E] text-lg font-bold leading-tight break-words">
                            {locationName}
                        </h2>
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-3xl font-bold text-[#179678]">{current?.temp}°C</span>
                    <p className="text-xs text-gray-500 flex items-center justify-end gap-1">
                        {currentWeatherInfo.label}
                    </p>
                </div>
            </div>

            {/* Interactive map */}
            <div className="relative w-full h-[280px] bg-slate-100 rounded border border-gray-200 overflow-hidden mb-3">
               <MapContainer 
                  key={`${coords.lat}-${coords.lon}`} 
                  center={[coords.lat, coords.lon]} 
                  zoom={13} 
                  style={{ height: "100%", width: "100%" }}
                  scrollWheelZoom={false}
               >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={[coords.lat, coords.lon]}>
                        <Popup>ตำแหน่งฟาร์มของคุณ</Popup>
                    </Marker>
                    <RecenterAutomatically lat={coords.lat} lon={coords.lon} />
               </MapContainer>
            </div>

            {/* Weather stats */}
            <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                 <WeatherStat
                    icon={<Droplets className="w-5 h-5 mx-auto text-blue-500 mb-1"/>}
                    label="ความชื้น"
                    value={`${current?.humidity || 0}%`}
                    bgColor="bg-blue-50"
                 />
                 <WeatherStat
                    icon={<CloudRain className="w-5 h-5 mx-auto text-gray-500 mb-1"/>}
                    label="ปริมาณฝน"
                    value={`${current?.rain || 0} มม.`}
                    bgColor="bg-gray-50"
                 />
                 <WeatherStat
                    icon={<Wind className="w-5 h-5 mx-auto text-yellow-600 mb-1"/>}
                    label="สภาพอากาศ"
                    value={currentWeatherInfo.label}
                    bgColor="bg-yellow-50"
                 />
            </div>
        </div>

        {/* Hourly forecast */}
        <div className="mt-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h3 className="text-[#4A4A4A] text-lg font-bold mb-4">พยากรณ์รายชั่วโมง</h3>
            <div className="flex overflow-x-auto gap-3 pb-4 scrollbar-hide">
                {hourly.length > 0 ? (
                  hourly.map((hour, i) => <HourlyCard key={i} hour={hour} />)
                ) : (
                  <p className="text-gray-400 text-sm w-full text-center">กำลังโหลดข้อมูล...</p>
                )}
            </div>
        </div>

        {/* 7-day forecast */}
        <div className="mt-4 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
             <div className="p-4 pb-2 border-b border-gray-50 bg-gray-50/50">
                <div className="flex justify-between items-center">
                    <h3 className="text-[#4A4A4A] text-lg font-bold">7 วันล่วงหน้า</h3>
                    <div className="flex gap-3 text-[10px] text-gray-500">
                        <span className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-orange-500" />
                          สูงสุด
                        </span>
                        <span className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-blue-500" />
                          ต่ำสุด
                        </span>
                    </div>
                </div>
             </div>
             
             <div className="divide-y divide-gray-50">
                {daily.length > 0 ? (
                  daily.map((day, index) => <DailyRow key={index} day={day} />)
                ) : (
                  <div className="p-4 text-center text-gray-400">กำลังโหลดข้อมูล...</div>
                )}
             </div>
        </div>

        {/* Footer */}
        <footer className="mt-6 mb-10 text-center space-y-1">
            <p className="text-[10px] text-gray-400">
                ข้อมูลสภาพอากาศโดย{" "}
                <a 
                  href="https://open-meteo.com/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="underline hover:text-gray-600"
                >
                  Open-Meteo.com
                </a>
            </p>
            <p className="text-[10px] text-gray-400">
                ข้อมูลแผนที่ ©{" "}
                <a 
                  href="https://www.openstreetmap.org/copyright" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="underline hover:text-gray-600"
                >
                  OpenStreetMap
                </a>
                {" "}contributors
            </p>
        </footer>

      </div>

    </div>
  );
}