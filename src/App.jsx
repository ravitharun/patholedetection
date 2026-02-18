// src/App.jsx
import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import CameraCapture from "./CameraCapture";
import "./App.css";
import "./camera.css";

function LocateToPosition({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo([position.lat, position.lng], 16, { duration: 0.7 });
    }
  }, [map, position]);

  return null;
}

export default function App() {
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);
  const [capturedUrl, setCapturedUrl] = useState(null);
  const watchIdRef = useRef(null);

  // 🌐 Online / Offline state
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);

    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  // 📍 Geolocation
  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setError("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (p) =>
        setPosition({
          lat: p.coords.latitude,
          lng: p.coords.longitude,
        }),
      (err) => setError(err.message),
      { enableHighAccuracy: true }
    );

    watchIdRef.current = navigator.geolocation.watchPosition(
      (p) =>
        setPosition({
          lat: p.coords.latitude,
          lng: p.coords.longitude,
        }),
      (err) => setError(err.message),
      { enableHighAccuracy: true }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // 📸 Handle image from camera
  const handleImage = (blob) => {
    if (!blob) return;

    if (capturedUrl) {
      URL.revokeObjectURL(capturedUrl);
    }

    const url = URL.createObjectURL(blob);
    setCapturedUrl(url);
  };

  // ⬆️ Upload stub
  const uploadCaptured = async () => {
    if (!capturedUrl) return alert("No image captured");

    try {
      alert("Image ready for upload (backend hookup pending)");
    } catch (e) {
      alert("Upload failed: " + e.message);
    }
  };

  // 📍 Leaflet marker fix
  const defaultIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  return (
    <>
      {/* 🔴 Offline banner */}
      {!isOnline && (
        <div
          style={{
            position: "fixed",
            top: 0,
            width: "100%",
            background: "crimson",
            color: "white",
            padding: "8px",
            textAlign: "center",
            zIndex: 2000,
          }}
        >
          You are offline
        </div>
      )}

      <div style={{ height: "100vh", width: "100vw", position: "relative" }}>
        {/* 📸 Camera controls */}
        <div
          style={{
            position: "absolute",
            zIndex: 1200,
            right: 12,
            top: 12,
            background: "rgba(255,255,255,0.95)",
            borderRadius: 8,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          <CameraCapture onImage={handleImage} isOnline={isOnline} />

          <div style={{ padding: 8, display: "flex", gap: 8 }}>
            <button onClick={uploadCaptured} disabled={!capturedUrl}>
              Upload
            </button>
            <button
              onClick={() => {
                if (capturedUrl) {
                  URL.revokeObjectURL(capturedUrl);
                  setCapturedUrl(null);
                }
              }}
              disabled={!capturedUrl}
            >
              Clear
            </button>
          </div>

          {capturedUrl && (
            <div style={{ padding: 8 }}>
              <img
                src={capturedUrl}
                alt="preview"
                style={{ maxWidth: 220, borderRadius: 6 }}
              />
            </div>
          )}

          {error && (
            <div style={{ color: "crimson", padding: 8 }}>{error}</div>
          )}
        </div>

        {/* 🗺️ Map */}
        <MapContainer
          center={
            position ? [position.lat, position.lng] : [12.9716, 77.5946]
          }
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {position && (
            <>
              <LocateToPosition position={position} />
              <Marker
                position={[position.lat, position.lng]}
                icon={defaultIcon}
              >
                <Popup>Current location</Popup>
              </Marker>
            </>
          )}
        </MapContainer>
      </div>
    </>
  );
}
