// src/App.jsx
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import CameraCapture from "./CameraCapture";
import "leaflet/dist/leaflet.css";
import "./App.css";
import "./camera.css";

/* 🔄 Fly map to current position */
function LocateToPosition({ position }) {

  const HERE_API_KEY = import.meta.env.VITE_HERE_API_KEY;

  function FlyTo({ position }) {
    const map = useMap();

    useEffect(() => {
      if (position) map.flyTo(position, 17, { duration: 0.8 });
    }, [position, map]);
    return null;
  }

  function App() {
    const [position, setPosition] = useState(null);
    const [error, setError] = useState(null);
    const [capturedUrl, setCapturedUrl] = useState(null);
    const watchIdRef = useRef(null);

    /* 🌐 Online / Offline status */
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    const [captures, setCaptures] = useState([]);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    useEffect(() => {
      navigator.geolocation.getCurrentPosition((p) =>
        setPosition([p.coords.latitude, p.coords.longitude])
      );

      const on = () => setIsOnline(true);
      const off = () => setIsOnline(false);

      window.addEventListener("online", on);
      window.addEventListener("offline", off);
      return () => {
        window.removeEventListener("online", on);
        window.removeEventListener("offline", off);
      };
    }, [])

    /* 📍 Geolocation */
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

    /* 📸 Handle captured image */
    const handleImage = (blob) => {
      if (!blob) return;

      if (capturedUrl) {
        URL.revokeObjectURL(capturedUrl);
      }

      const url = URL.createObjectURL(blob);
      setCapturedUrl(url);
    };

    /* ⬆️ Upload placeholder */
    const uploadCaptured = async () => {
      if (!capturedUrl) {
        alert("No image captured");
        return;
      }
      alert("Image ready for upload (backend integration pending)");
    };

    /* 📍 Leaflet marker icon fix */
    const defaultIcon = L.icon({
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    })
    function handleUploadSuccess(data) {
      if (!position) return;
      setCaptures((prev) => [...prev, { pos: position, fileUrl: data.fileUrl }]);
    }

    const icon = L.icon({
      iconUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
    });

    return (
      // jsx code 
      <>
        {/* 🔴 Offline Banner */}
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
          {/* 📸 Camera Controls */}
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
          <div className="app-root">
            {!isOnline && <div className="offline-banner">Offline mode</div>}

            <div className="camera-panel">
              <CameraCapture isOnline={isOnline} onUploadSuccess={handleUploadSuccess} />
            </div>

            <div className="map-area">
              <MapContainer
                center={position || [12.9716, 77.5946]}
                zoom={13}
                className="leaflet-map"
              >
                {/* HERE BASE MAP */}
                <TileLayer
                  url={`https://maps.hereapi.com/v3/base/mc/{z}/{x}/{y}/png?apiKey=${HERE_API_KEY}`}
                  attribution="© HERE"
                />

                {position && <FlyTo position={position} />}

                {position && (
                  <Marker position={position} icon={icon}>
                    <Popup>Current location</Popup>
                  </Marker>
                )}

                {captures.map((c, i) => (
                  <Marker key={i} position={c.pos} icon={icon}>
                    <Popup>
                      Pothole captured here
                      <br />
                      <img src={c.fileUrl} className="popup-image" />
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>
        </div>
      </>
    )
  }
}

export default App