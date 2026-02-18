// src/App.jsx
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import CameraCapture from "./CameraCapture";
import "leaflet/dist/leaflet.css";
import "./App.css";

const HERE_API_KEY = import.meta.env.VITE_HERE_API_KEY;

function FlyTo({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo(position, 17, { duration: 0.8 });
  }, [position, map]);
  return null;
}

export default function App() {
  const [position, setPosition] = useState(null);
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
  }, []);

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
  );
}
