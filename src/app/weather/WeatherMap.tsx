"use client";

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface WeatherPoint {
  lat: number;
  lng: number;
  temperature: number;
  city: string;
  country?: string;
}

const weatherPoints: WeatherPoint[] = [
  { lat: 13.7563, lng: 100.5018, temperature: 32, city: 'Bangkok', country: 'TH' },
  { lat: 18.7883, lng: 98.9853, temperature: 28, city: 'Chiang Mai', country: 'TH' },
  { lat: 7.8804, lng: 98.3923, temperature: 29, city: 'Phuket', country: 'TH' },
  { lat: 14.0208, lng: 100.7925, temperature: 31, city: 'Lam Luk Ka', country: 'TH' },
  { lat: 16.4419, lng: 102.8160, temperature: 30, city: 'Khon Kaen', country: 'TH' },
  { lat: 21.0285, lng: 105.8542, temperature: 34, city: 'Hanoi', country: 'VN' },
  { lat: 16.4637, lng: 107.5909, temperature: 33, city: 'Hue', country: 'VN' },
  { lat: 16.8409, lng: 96.1735, temperature: 35, city: 'Yangon', country: 'MM' },
  { lat: 3.1390, lng: 101.6869, temperature: 29, city: 'Kuala Lumpur', country: 'MY' },
];

export default function WeatherMap() {
  const [isClient, setIsClient] = useState(false);
  const [mapKey, setMapKey] = useState(0);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Force remount of map component to avoid container reuse
  useEffect(() => {
    const timeout = setTimeout(() => {
      setMapKey(prev => prev + 1);
    }, 100);
    return () => clearTimeout(timeout);
  }, []);

  // Only render on client side to avoid hydration issues
  if (!isClient) {
    return (
      <div className="relative h-64 bg-gradient-to-br from-green-300 via-yellow-200 to-orange-300 rounded-lg">
        <div className="absolute inset-0 flex items-center justify-center text-gray-600">
          Loading map...
        </div>
      </div>
    );
  }

  const getTemperatureColor = (temp: number) => {
    if (temp <= 25) return '#1e40af'; // blue-800
    if (temp <= 28) return '#2563eb'; // blue-600  
    if (temp <= 30) return '#16a34a'; // green-600
    if (temp <= 32) return '#ca8a04'; // yellow-600
    if (temp <= 35) return '#ea580c'; // orange-600
    return '#dc2626'; // red-600
  };

  return (
    <div className="space-y-4">
      {/* Map Container */}
      <div className="relative h-64 rounded-lg overflow-hidden">
        <MapContainer
          key={`weather-map-${mapKey}`}
          center={[15.0, 101.0]} // Center on Southeast Asia
          zoom={5}
          scrollWheelZoom={true}
          zoomControl={true}
          className="h-full w-full"
          style={{ height: '256px', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={18}
          />
          {weatherPoints.map((point) => {
            const color = getTemperatureColor(point.temperature);
            return (
              <CircleMarker
                key={`${point.city}-${point.lat}-${point.lng}`}
                center={[point.lat, point.lng]}
                radius={8}
                pathOptions={{ color, fillColor: color, fillOpacity: 0.8 }}
              >
                <Tooltip direction="top" offset={[0, -4]} opacity={0.9}>
                  <div className="space-y-1 text-xs">
                    <p className="font-semibold">{point.city}{point.country ? `, ${point.country}` : ''}</p>
                    <p>{point.temperature}°C</p>
                  </div>
                </Tooltip>
              </CircleMarker>
            );
          })}
        </MapContainer>
        
        {/* Attribution overlay */}
        <div className="absolute bottom-1 left-1 text-xs text-gray-700 bg-white/90 px-2 py-1 rounded shadow-sm z-[1000] pointer-events-none">
          © OpenStreetMap
        </div>
        <div className="absolute bottom-1 right-16 text-xs text-gray-700 bg-white/90 px-2 py-1 rounded shadow-sm z-[1000] pointer-events-none">
          Weather Data
        </div>
      </div>

      {/* Temperature Scale + City List */}
      <div className="bg-white/95 rounded-lg shadow-lg p-4 space-y-4">
        <div>
          <div
            className="relative h-2 w-full rounded-full overflow-hidden mb-3"
            style={{
              background:
                'linear-gradient(to right, #1e40af 0%, #2563eb 20%, #16a34a 40%, #ca8a04 60%, #ea580c 80%, #dc2626 100%)',
            }}
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>≤25°C</span>
            <span>28°C</span>
            <span>30°C</span>
            <span>32°C</span>
            <span>≥35°C</span>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          {weatherPoints.map((point) => {
            const color = getTemperatureColor(point.temperature);
            return (
              <div
                key={`weather-card-${point.city}`}
                className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {point.city}
                    {point.country ? <span className="text-gray-500"> · {point.country}</span> : null}
                  </p>
                  <p className="text-xs text-gray-500">Lat {point.lat.toFixed(1)} / Lng {point.lng.toFixed(1)}</p>
                </div>
                <div
                  className="rounded-full px-3 py-1 text-xs font-bold text-white"
                  style={{ backgroundColor: color }}
                >
                  {point.temperature}°C
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
