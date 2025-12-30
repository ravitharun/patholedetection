// src/App.jsx
import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import CameraCapture from "./CameraCapture";
import "./App.css";
import "./camera.css";



function LocateToPosition({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo([position.lat, position.lng], 16, { duration: 0.7 });
    }
    console.log("first")
  }, [map, position]);
  return null;
}

export default function App() {
  const [position, setPosition] = useState(null); // { lat, lng }
  const [error, setError] = useState(null);
  const [capturedUrl, setCapturedUrl] = useState(null);
  const watchIdRef = useRef(null);

  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    function goOnline() {
      setIsOnline(true);
    }
    function goOffline() {
      setIsOnline(false);
    }

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);

    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);



  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setError("Geolocation not available in this browser.");
      return;
    }

    // request one-shot current position then start watching
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setPosition({ lat: p.coords.latitude, lng: p.coords.longitude });
      },
      (err) => setError(err.message || "Permission denied"),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
    );

    // start watching for updates
    watchIdRef.current = navigator.geolocation.watchPosition(
      (p) => setPosition({ lat: p.coords.latitude, lng: p.coords.longitude }),
      (err) => setError(err.message || "Position error"),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
    );

    return () => {
      if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, []);

  // handle blob from CameraCapture
  const handleImage = (blob) => {
    if (!blob) return;
    if (capturedUrl) {
      URL.revokeObjectURL(capturedUrl);
    }
    const url = URL.createObjectURL(blob);
    setCapturedUrl(url);
  };

  // simple upload stub — replace URL with your backend endpoint
  const uploadCaptured = async () => {
    if (!capturedUrl) return alert("No image captured");
    try {
      const res = await fetch(capturedUrl);
      const blob = await res.blob();
      const fd = new FormData();
      fd.append("file", blob, `capture_${Date.now()}.jpg`);

      // Example POST target (replace /upload with your server)
      // const uploadResp = await fetch("https://your-server.example.com/upload", {
      //   method: "POST",
      //   body: fd,
      // });
      // const json = await uploadResp.json();
      // alert("Upload response: " + JSON.stringify(json));

      // For now, just simulate success:
      alert("Captured image ready for upload (stub). Replace upload URL in code.");
    } catch (e) {
      console.error(e);
      alert("Upload failed: " + e.message);
    }
  };

  // custom marker icon to avoid broken default marker in some setups
  const defaultIcon = L.icon({
    iconUrl:
      // fallback to leaflet CDN marker if local bundling misses default
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  return (
    <>
      {isOnline && (
        <div style={{ position: "fixed", top: 0, width: "100%", background: "crimson", color: "white", padding: "8px", textAlign: "center" }}>
          You are offline
        </div>
      )}

      <div style={{ height: "100vh", width: "100vw", position: "relative" }}>
        {/* Camera controls overlay */}
        <div style={{ position: "absolute", zIndex: 1200, right: 12, top: 12, background: "rgba(255,255,255,0.94)", borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.12)" }}>
          <CameraCapture onImage={handleImage} isonline={isonline} />
          <div style={{ padding: 8, display: "flex", gap: 8 }}>
            <button onClick={uploadCaptured} disabled={!capturedUrl}>
              Upload Captured
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
              <div style={{ fontSize: 12, marginBottom: 6 }}>Last capture preview:</div>
              <img src={capturedUrl} alt="capture preview" style={{ maxWidth: 220, borderRadius: 6, display: "block" }} />
            </div>
          )}
          {error && <div style={{ color: "crimson", padding: 8 }}>{error}</div>}
        </div>

        {/* Map */}
        <div className="map-container" style={{ height: "100%", width: "100%" }}>
          <MapContainer
            center={position ? [position.lat, position.lng] : [12.9716, 77.5946]}
            zoom={13}
            scrollWheelZoom={true}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap" />
            {position && (
              <>
                <LocateToPosition position={position} />
                <Marker position={[position.lat, position.lng]} icon={defaultIcon}>
                  <Popup>Current location</Popup>
                </Marker>
              </>
            )}
          </MapContainer>
        </div>
      </div>
    </>
  );
}
