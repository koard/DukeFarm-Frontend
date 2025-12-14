"use client";

import { useState, useEffect, useCallback } from "react";
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

function MapController({ setMap, initialPosition }: { setMap: (map: L.Map) => void, initialPosition?: { lat: number, lng: number } | null }) {
    const map = useMap();
    
    useEffect(() => {
        setMap(map);
    }, [map, setMap]);

    useEffect(() => {
        if (initialPosition) {
            map.flyTo([initialPosition.lat, initialPosition.lng], 16, { animate: false }); // animate: false เพื่อให้วาร์ปไปเลย ไม่ต้องบิน
        }
    }, [initialPosition, map]);

    return null;
}

interface MapPickerProps {
    onLocationSelect: (lat: number, lng: number) => void;
    initialPosition?: { lat: number; lng: number } | null;
}

export default function MapPicker({ onLocationSelect, initialPosition }: MapPickerProps) {
    const defaultPos = { lat: 13.7563, lng: 100.5018 };
    
    const [position, setPosition] = useState<{ lat: number, lng: number }>(initialPosition || defaultPos);
    const [map, setMap] = useState<L.Map | null>(null);
    const [accuracy, setAccuracy] = useState<number>(0);

    const handleLocate = useCallback(() => {
        if (!map) return;
        if (!navigator.geolocation) return;

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude, accuracy } = pos.coords;
                const newPos = { lat: latitude, lng: longitude };
                
                setPosition(newPos);
                setAccuracy(accuracy); 
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
                enableHighAccuracy: true, 
                timeout: 10000,
                maximumAge: 0
            }
        );
    }, [map, onLocationSelect]);

    useEffect(() => {
        if (map) {
            const timer = setTimeout(() => {
                requestAnimationFrame(() => {
                    if (map && map.getContainer()) {
                        try {
                            map.invalidateSize();
                            
                            if (!initialPosition) {
                                handleLocate();
                            }
                        } catch (error) {
                            console.warn("Map initialization skipped", error);
                        }
                    }
                });
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [handleLocate, initialPosition, map]);

    return (
        <div className="relative w-full h-full">
            <MapContainer 
                center={[position.lat, position.lng]} 
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
                
                <MapController setMap={setMap} initialPosition={initialPosition} />
                
                <LocationMarker position={position} setPosition={setPosition} onLocationSelect={onLocationSelect} />

                {accuracy > 0 && (
                    <Circle 
                        center={position} 
                        radius={accuracy} 
                        pathOptions={{ color: '#4285F4', fillColor: '#4285F4', fillOpacity: 0.15, weight: 1, dashArray: '5, 5' }} 
                    />
                )}

            </MapContainer>

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
            
            {accuracy > 0 && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-white/90 backdrop-blur px-3 py-1 rounded-full shadow-md border border-gray-200">
                    <span className="text-xs text-gray-600">ความแม่นยำ: ±{Math.round(accuracy)} เมตร</span>
                </div>
            )}
        </div>
    );
}