"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { MapPoint } from "@/lib/types";

// Dynamic imports to avoid SSR issues with Leaflet
const MapContainer = dynamic(
    () => import("react-leaflet").then((mod) => mod.MapContainer),
    { ssr: false }
);
const TileLayer = dynamic(
    () => import("react-leaflet").then((mod) => mod.TileLayer),
    { ssr: false }
);
const CircleMarker = dynamic(
    () => import("react-leaflet").then((mod) => mod.CircleMarker),
    { ssr: false }
);
const Popup = dynamic(
    () => import("react-leaflet").then((mod) => mod.Popup),
    { ssr: false }
);

interface WorldMapProps {
    points: MapPoint[];
    height?: string;
}

export default function WorldMap({ points, height = "400px" }: WorldMapProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div
                className="bg-gray-900 border border-gray-800 rounded-xl flex items-center justify-center"
                style={{ height }}
            >
                <span className="text-gray-500">Loading map...</span>
            </div>
        );
    }

    // Calculate center from points
    const center =
        points.length > 0
            ? {
                lat: points.reduce((sum, p) => sum + p.lat, 0) / points.length,
                lng: points.reduce((sum, p) => sum + p.lng, 0) / points.length,
            }
            : { lat: 47.9, lng: 106.9 }; // Default: Ulaanbaatar

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden" style={{ height }}>
            <MapContainer
                center={[center.lat, center.lng]}
                zoom={3}
                style={{ height: "100%", width: "100%" }}
                scrollWheelZoom={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
                {points.map((point, idx) => (
                    <CircleMarker
                        key={idx}
                        center={[point.lat, point.lng]}
                        radius={5}
                        pathOptions={{
                            color: "#818cf8",
                            fillColor: "#6366f1",
                            fillOpacity: 0.7,
                            weight: 1,
                        }}
                    >
                        <Popup>
                            <div className="text-xs">
                                <p>
                                    {point.lat.toFixed(4)}, {point.lng.toFixed(4)}
                                </p>
                                <p className="text-gray-500">
                                    {new Date(point.timestamp).toLocaleDateString()}
                                </p>
                            </div>
                        </Popup>
                    </CircleMarker>
                ))}
            </MapContainer>
        </div>
    );
}
