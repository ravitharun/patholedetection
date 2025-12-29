// src/LiveMap.jsx
import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Recenter helper (same as your logic)
function Recenter({ latlng, enabled }) {
  const map = useMap();
  useEffect(() => {
    if (!enabled || !latlng) return;

    const handleManual = () => {
      map.flyTo([latlng.lat, latlng.lng], 16, { duration: 0.8 });
    };

    window.addEventListener("manual-recenter", handleManual);

    map.flyTo([latlng.lat, latlng.lng], 16, { duration: 0.8 });
    return () => window.removeEventListener("manual-recenter", handleManual);
  }, [latlng, enabled, map]);

  return null;
}

// Marker icon
const youIcon = new L.Icon({
  iconUrl:
    "https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@master/img/marker-icon-blue.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function LiveMap({
  initialPosition = { lat: 20.5937, lng: 78.9629 },
  recenterOnUpdate = true,
}) {
  const [position, setPosition] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const watchIdRef = useRef(null);

  // GEOLOCATION
  useEffect(() => {
    if (!("geolocation" in navigator)) {
      alert("Geolocation not supported in this device.");
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setPosition(coords);
        setAccuracy(pos.coords.accuracy);
      },
      (err) => {
        console.error("GPS Error:", err);
        if (err.code === 1)
          alert("Location permission denied. Please enable GPS.");
        else alert("GPS Error: " + err.message);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 10000,
      }
    );

    return () => {
      if (watchIdRef.current !== null)
        navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, []);

  const center = position ?? initialPosition;

  return (
    <div className="w-full h-screen relative bg-gray-100">

      {/* HEADER */}
      <div className="w-full py-3 px-4 bg-blue-600 text-white shadow-md flex items-center justify-between">
        <h2 className="text-lg font-semibold">Live Location Tracker</h2>
        <div className="text-xs opacity-80">
          {position ? "Tracking..." : "Locating..."}
        </div>
      </div>

      {/* MAP */}
      <div className="w-full h-[calc(100vh-70px)]">
        <MapContainer
          center={[center.lat, center.lng]}
          zoom={16}
          className="w-full h-full"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />

          {position && (
            <>
              <Marker position={[position.lat, position.lng]} icon={youIcon} />

              {accuracy != null && (
                <Circle
                  center={[position.lat, position.lng]}
                  radius={accuracy}
                  pathOptions={{ opacity: 0.25 }}
                />
              )}

              <Recenter latlng={position} enabled={recenterOnUpdate} />
            </>
          )}
        </MapContainer>
      </div>

      {/* STATUS CARD */}
      {position && (
        <div className="absolute bottom-20 left-4 right-4 bg-white shadow-xl rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Latitude:</span>{" "}
            {position.lat.toFixed(6)}
          </p>
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Longitude:</span>{" "}
            {position.lng.toFixed(6)}
          </p>
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Accuracy:</span> {accuracy} meters
          </p>
        </div>
      )}

      {/* FLOATING ACTION BUTTONS */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-5">
        <button
          onClick={() => window.dispatchEvent(new Event("manual-recenter"))}
          className="p-3 bg-blue-600 text-white rounded-full shadow-lg active:scale-95 transition"
        >
          📍
        </button>

        <button
          onClick={() => window.location.reload()}
          className="p-3 bg-gray-700 text-white rounded-full shadow-lg active:scale-95 transition"
        >
          🔄
        </button>
      </div>
    </div>
  );
}
