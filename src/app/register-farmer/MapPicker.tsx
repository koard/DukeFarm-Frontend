"use client";

import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Locate } from "lucide-react"; 

const iconUrl = "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png";
const iconRetinaUrl = "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png";
const shadowUrl = "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png";

const customIcon = new L.Icon({
    iconUrl: iconUrl,
    iconRetinaUrl: iconRetinaUrl,
    shadowUrl: shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// 1. สร้าง Interface เพื่อกำหนด Type ให้ถูกต้อง (แทนการใช้ any)
interface LocationMarkerProps {
    position: { lat: number; lng: number } | null;
    setPosition: (pos: { lat: number; lng: number }) => void;
    onLocationSelect: (lat: number, lng: number) => void;
}

function LocationMarker({ position, setPosition, onLocationSelect }: LocationMarkerProps) {
    const map = useMapEvents({
        click(e: L.LeafletMouseEvent) {
            setPosition(e.latlng);
            map.flyTo(e.latlng, map.getZoom());
            onLocationSelect(e.latlng.lat, e.latlng.lng);
        },
    });
    return position === null ? null : <Marker position={position} icon={customIcon}></Marker>;
}

function MapController({ setMap }: { setMap: (map: L.Map) => void }) {
    const map = useMap();
    useEffect(() => {
        setMap(map);
    }, [map, setMap]);
    return null;
}

export default function MapPicker({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
    const defaultPos = { lat: 13.7563, lng: 100.5018 };
    const [position, setPosition] = useState<{ lat: number, lng: number }>(defaultPos);
    const [map, setMap] = useState<L.Map | null>(null);
    
    // เพิ่ม State เก็บค่าความแม่นยำ (หน่วยเป็นเมตร)
    const [accuracy, setAccuracy] = useState<number>(0);

    const handleLocate = () => {
        if (!map) return;
        if (!navigator.geolocation) return;

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude, accuracy } = pos.coords;
                const newPos = { lat: latitude, lng: longitude };
                
                setPosition(newPos);
                setAccuracy(accuracy); // เก็บค่าความคลาดเคลื่อน
                onLocationSelect(latitude, longitude);

                requestAnimationFrame(() => {
                    if (map && map.getContainer()) {
                        try {
                            map.invalidateSize();
                            map.flyTo(newPos, 18, { animate: true, duration: 1.5 });
                        } catch (error) {
                            console.warn("Map update ignored:", error);
                        }
                    }
                });
            },
            (error) => {
                console.warn(error.message);
            },
            {
                enableHighAccuracy: true, // ขอพิกัดแบบแม่นยำสูงสุด
                timeout: 10000,
                maximumAge: 0
            }
        );
    };

    useEffect(() => {
        if (map) {
            const timer = setTimeout(() => {
                requestAnimationFrame(() => {
                    if (map && map.getContainer()) {
                        try {
                            map.invalidateSize();
                            handleLocate();
                        } catch (e) {
                        }
                    }
                });
            }, 500);
            return () => clearTimeout(timer);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [map]);

    return (
        <div className="relative w-full h-full">
            {/* 1. ตัวแผนที่ */}
            <MapContainer 
                center={[defaultPos.lat, defaultPos.lng]} 
                zoom={13} 
                scrollWheelZoom={true}
                maxZoom={25}
                style={{ height: "100%", width: "100%" }}
            >
                <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    maxZoom={25}
                    maxNativeZoom={19}
                />
                
                <MapController setMap={setMap} />
                <LocationMarker position={position} setPosition={setPosition} onLocationSelect={onLocationSelect} />

                
                {/* วงกลมแสดงความคลาดเคลื่อนของ GPS (สีฟ้าจางๆ) - แสดงเฉพาะตอนกด GPS */}
                {accuracy > 0 && (
                    <Circle 
                        center={position} 
                        radius={accuracy} 
                        pathOptions={{ color: '#4285F4', fillColor: '#4285F4', fillOpacity: 0.15, weight: 1, dashArray: '5, 5' }} 
                    />
                )}

            </MapContainer>

            {/* 2. ปุ่ม GPS */}
            <div className="absolute bottom-28 right-4 z-[1000]">
                <button 
                    onClick={handleLocate}
                    className="bg-white p-2 rounded-lg shadow-lg hover:bg-gray-100 flex items-center justify-center w-12 h-12 border-2 border-gray-300 text-gray-700"
                    type="button"
                    title="ตำแหน่งปัจจุบัน"
                >
                    <Locate className="w-7 h-7 text-blue-600" />
                </button>
            </div>
            
            {/* Badge บอกความแม่นยำ */}
            {accuracy > 0 && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-white/90 backdrop-blur px-3 py-1 rounded-full shadow-md border border-gray-200">
                    <span className="text-xs text-gray-600">ความแม่นยำ: ±{Math.round(accuracy)} เมตร</span>
                </div>
            )}
        </div>
    );
}