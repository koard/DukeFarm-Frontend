"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, Cloud, CloudRain, CloudSun, Sun, Droplets, Wind, MapPin, Navigation, ArrowUp, ArrowDown } from "lucide-react";
import Link from "next/link";
import { useLineUser } from "@/hooks/useLineUser";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Import CSS
import "leaflet/dist/leaflet.css";

// Dynamic Imports (Map)
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { 
    ssr: false,
    loading: () => <div className="w-full h-full bg-slate-100 animate-pulse rounded flex items-center justify-center text-gray-400 text-xs">Loading Map...</div>
  }
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

const getWeatherInfo = (code: number) => {
  if (code === 0) return { label: "ฟ้าโปร่ง", icon: <Sun className="w-8 h-8 text-orange-400" /> };
  if (code >= 1 && code <= 3) return { label: "มีเมฆ", icon: <CloudSun className="w-8 h-8 text-yellow-500" /> };
  if (code >= 45 && code <= 48) return { label: "มีหมอก", icon: <Cloud className="w-8 h-8 text-gray-400" /> };
  if (code >= 51 && code <= 67) return { label: "ฝนปรอย", icon: <CloudRain className="w-8 h-8 text-blue-400" /> };
  if (code >= 80 && code <= 99) return { label: "พายุฝน", icon: <CloudRain className="w-8 h-8 text-purple-500" /> };
  return { label: "ฝนตก", icon: <CloudRain className="w-8 h-8 text-blue-500" /> };
};

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

export default function WeatherLargePage() {
  const router = useRouter();
  const lineUser = useLineUser();

  const [coords, setCoords] = useState({ lat: 13.7563, lon: 100.5018 });
  const [locationName, setLocationName] = useState("กำลังค้นหาพิกัด...");
  
  const [current, setCurrent] = useState<CurrentWeather | null>(null);
  const [daily, setDaily] = useState<DailyForecast[]>([]);
  const [hourly, setHourly] = useState<HourlyForecast[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. หาพิกัด GPS ผู้ใช้
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocationName("กรุงเทพมหานคร (ค่าเริ่มต้น)");
        }
      );
    }
  }, []);

  // 2. ดึงข้อมูล API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Reverse Geocoding
        try {
            const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lon}&accept-language=th`);
            const geoData = await geoRes.json();
            const address = geoData.address;
            const district = address.suburb || address.city_district || address.town || "";
            const city = address.city || address.state || "";
            
            if (district && city) {
                 setLocationName(`${district}, ${city}`);
            } else {
                 setLocationName(city || district || "ตำแหน่งปัจจุบัน");
            }

        } catch (e) {
            setLocationName(`พิกัด: ${coords.lat.toFixed(2)}, ${coords.lon.toFixed(2)}`);
        }

        // Weather API
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,relative_humidity_2m,rain,weather_code&hourly=temperature_2m,precipitation_probability,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Asia%2FBangkok`
        );
        const data = await res.json();

        const now = new Date();
        const thaiDate = now.toLocaleDateString('th-TH', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
        });
        const thaiTime = now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

        setCurrent({
          temp: data.current.temperature_2m,
          humidity: data.current.relative_humidity_2m,
          rain: data.current.rain,
          weatherCode: data.current.weather_code,
          time: `${thaiDate} ${thaiTime}`
        });

        const dailyData = data.daily.time.map((t: string, i: number) => ({
          date: new Date(t).toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'short' }),
          tempMax: data.daily.temperature_2m_max[i],
          tempMin: data.daily.temperature_2m_min[i],
          weatherCode: data.daily.weather_code[i]
        }));
        setDaily(dailyData);

        const currentHour = new Date().getHours();
        const hourlyData = data.hourly.time.slice(currentHour, currentHour + 24).map((t: string, i: number) => ({
            time: new Date(t).toLocaleTimeString('th-TH', { hour: 'numeric', minute: '2-digit' }),
            temp: data.hourly.temperature_2m[currentHour + i],
            rainProb: data.hourly.precipitation_probability[currentHour + i],
            weatherCode: data.hourly.weather_code[currentHour + i]
        }));
        setHourly(hourlyData);

      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [coords]);

  // Fix Leaflet Icon
  useEffect(() => {
    import("leaflet").then((L) => {
        // @ts-ignore
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
            iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
            shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        });
    });
  }, []);

  const currentWeatherInfo = current ? getWeatherInfo(current.weatherCode) : { label: "...", icon: null };

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="bg-[#093832] text-white px-4 pt-8 pb-10 rounded-b-[40px] shadow-md relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <Link 
              href="/nursery-large" 
              className="p-1 hover:bg-white/10 rounded-full transition-colors"
            >
              <ChevronLeft className="w-8 h-8" />
            </Link>
            <h1 className="text-2xl font-bold">อุณหภูมิ</h1>
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

            <div className="relative w-full h-[280px] bg-slate-100 rounded border border-gray-200 overflow-hidden mb-3 z-0">
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
                        <Popup>
                            ตำแหน่งของคุณ
                        </Popup>
                    </Marker>
                    <RecenterAutomatically lat={coords.lat} lon={coords.lon} />
               </MapContainer>
               
               <button 
                onClick={() => {
                   setLocationName("กำลังค้นหา...");
                   navigator.geolocation.getCurrentPosition((pos) => {
                       setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
                   });
                }}
                className="absolute top-2 right-2 z-[1000] bg-white p-2 rounded shadow-md text-gray-600 hover:text-blue-600"
               >
                   <Navigation className="w-5 h-5" />
               </button>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                 <div className="bg-blue-50 p-2 rounded-lg">
                    <Droplets className="w-5 h-5 mx-auto text-blue-500 mb-1"/>
                    <p className="text-[10px] text-gray-500">ความชื้น</p>
                    <p className="font-bold text-gray-700">{current?.humidity}%</p>
                 </div>
                 <div className="bg-gray-50 p-2 rounded-lg">
                    <CloudRain className="w-5 h-5 mx-auto text-gray-500 mb-1"/>
                    <p className="text-[10px] text-gray-500">ปริมาณฝน</p>
                    <p className="font-bold text-gray-700">{current?.rain} มม.</p>
                 </div>
                 <div className="bg-yellow-50 p-2 rounded-lg">
                    <Wind className="w-5 h-5 mx-auto text-yellow-600 mb-1"/>
                    <p className="text-[10px] text-gray-500">สภาพอากาศ</p>
                    <p className="font-bold text-gray-700 text-xs truncate">{currentWeatherInfo.label}</p>
                 </div>
            </div>
        </div>

        {/* --- รายชั่วโมง --- */}
        <div className="mt-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h3 className="text-[#4A4A4A] text-lg font-bold mb-4">พยากรณ์รายชั่วโมง</h3>
            <div className="flex overflow-x-auto gap-3 pb-4 scrollbar-hide">
                {hourly.length > 0 ? hourly.map((h, i) => {
                    const info = getWeatherInfo(h.weatherCode);
                    return (
                        <div key={i} className="flex flex-col items-center min-w-[85px] bg-gray-50 p-2 rounded-xl border border-gray-100">
                            <span className="text-xs text-gray-500 mb-1">{h.time}</span>
                            
                            <div className="flex flex-col items-center justify-center h-14">
                                {info.icon}
                                <span className="text-[10px] text-gray-600 font-medium mt-1 text-center leading-none">{info.label}</span>
                            </div>

                            <span className="text-lg font-bold text-gray-700 mt-1">{Math.round(h.temp)}°</span>
                            <span className="text-[10px] text-blue-500 flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded-full mt-1">
                                <Droplets className="w-3 h-3"/> ฝน {h.rainProb}%
                            </span>
                        </div>
                    );
                }) : (
                    <p className="text-gray-400 text-sm w-full text-center">กำลังโหลดข้อมูล...</p>
                )}
            </div>
        </div>

        {/* --- 7 วันล่วงหน้า --- */}
        <div className="mt-4 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
             <div className="p-4 pb-2 border-b border-gray-50 bg-gray-50/50">
                <div className="flex justify-between items-center">
                    <h3 className="text-[#4A4A4A] text-lg font-bold">7 วันล่วงหน้า</h3>
                    <div className="flex gap-3 text-[10px] text-gray-500">
                        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-orange-500"></div>สูงสุด</span>
                        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div>ต่ำสุด</span>
                    </div>
                </div>
             </div>
             
             <div className="divide-y divide-gray-50">
                {daily.length > 0 ? daily.map((item, index) => {
                    const info = getWeatherInfo(item.weatherCode);
                    return (
                        <div key={index} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                            <div className="w-24 text-sm font-medium text-gray-600">{item.date}</div>
                            
                            <div className="flex flex-col items-center w-24">
                                 {info.icon}
                                 <span className="text-[10px] text-gray-500 mt-1 text-center">{info.label}</span>
                            </div>

                            <div className="flex flex-col items-end gap-1 w-20">
                                 <span className="text-sm font-bold text-orange-500 flex items-center gap-1">
                                    <ArrowUp className="w-3 h-3"/> {Math.round(item.tempMax)}°
                                 </span>
                                 <span className="text-sm font-medium text-blue-500 flex items-center gap-1">
                                    <ArrowDown className="w-3 h-3"/> {Math.round(item.tempMin)}°
                                 </span>
                            </div>
                        </div>
                    );
                }) : (
                     <div className="p-4 text-center text-gray-400">กำลังโหลดข้อมูล...</div>
                )}
             </div>
        </div>

        {/* --- Footer เพื่อความถูกต้องตามลิขสิทธิ์ (Attribution) --- */}
        <div className="mt-6 mb-10 text-center">
            <p className="text-[10px] text-gray-400">
                ข้อมูลสภาพอากาศโดย <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">Open-Meteo.com</a>
            </p>
            <p className="text-[10px] text-gray-400">
                ข้อมูลแผนที่ © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">OpenStreetMap</a> contributors
            </p>
        </div>

      </div>

    </div>
  );
}