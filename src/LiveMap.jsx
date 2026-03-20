// src/LiveMap.jsx
import React, { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import "./LiveMap.css";
import TrafficLegend from "./TrafficLegend";
import TrafficToggle from "./TrafficToggle";
import PotholeHeatmap from "./PotholeHeatmap";
import SimulatedTraffic from "./SimulatedTraffic";

const HERE_API_KEY = import.meta.env.VITE_HERE_API_KEY;

/* Bengaluru bounds */
const BLR_BOUNDS = [
  [12.7343, 77.3792],
  [13.1737, 77.8827],
];

/* Recenter helper */
function Recenter({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo([position.lat, position.lng], 16);
    }
  }, [position, map]);
  return null;
}

/* Marker icon */
const userIcon = new L.Icon({
  iconUrl:
    "https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@master/img/marker-icon-blue.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function LiveMap({ potholes = [] }) {
  const [position, setPosition] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [showTraffic, setShowTraffic] = useState(true);
  const watchRef = useRef(null);

  /* GEOLOCATION */
  useEffect(() => {
    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setAccuracy(pos.coords.accuracy);
      },
      console.error,
      { enableHighAccuracy: true }
    );

    return () =>
      watchRef.current &&
      navigator.geolocation.clearWatch(watchRef.current);
  }, []);

  const center = position ?? { lat: 12.9716, lng: 77.5946 };

  return (
    <div className="livemap-root">
      <div className="livemap-header">
        <span>Live Traffic Map</span>
        <span>{position ? "Tracking…" : "Locating…"}</span>
      </div>

      <TrafficToggle value={showTraffic} onChange={setShowTraffic} />

      <div className="livemap-container">
        <MapContainer
          center={[center.lat, center.lng]}
          zoom={16}
          maxBounds={BLR_BOUNDS}
          maxBoundsViscosity={1}
          className="leaflet-map"
        >
          {/* HERE BASE MAP */}
          <TileLayer
            url={`https://maptiles.hereapi.com/v3/maptile/newest/normal.day/{z}/{x}/{y}/256/png?apiKey=${HERE_API_KEY}`}
            attribution="© HERE"
          />

          {/* SIMULATED TRAFFIC (WORKS 100%) */}
          {showTraffic && <SimulatedTraffic />}

          {/* USER */}
          {position && (
            <>
              <Marker position={[position.lat, position.lng]} icon={userIcon} />
              <Circle
                center={[position.lat, position.lng]}
                radius={accuracy}
                pathOptions={{ opacity: 0.25 }}
              />
              <Recenter position={position} />
            </>
          )}

          <PotholeHeatmap data={potholes} />
        </MapContainer>
      </div>

      <TrafficLegend />
    </div>
  );
}
