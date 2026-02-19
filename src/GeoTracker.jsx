// src/GeoTracker.jsx
import { useEffect, useState, useRef, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Circle, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./GeoTracker.css";

const HERE_API_KEY = import.meta.env.VITE_HERE_API_KEY;

function Recenter({ latlng }) {
  const map = useMap();
  useEffect(() => {
    if (latlng) map.setView(latlng, map.getZoom(), { animate: true });
  }, [latlng, map]);
  return null;
}

export default function GeoTracker() {
  const [pos, setPos] = useState(null);
  const [accuracy, setAccuracy] = useState(null);

  useEffect(() => {
    const id = navigator.geolocation.watchPosition(
      (p) => {
        setPos({ lat: p.coords.latitude, lng: p.coords.longitude });
        setAccuracy(p.coords.accuracy);
      },
      (e) => console.error(e),
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, []);

  const center = pos ?? { lat: 20, lng: 0 };

  return (
    <div className="geo-root">
      <MapContainer center={center} zoom={16} className="geo-map">
        {/* HERE BASE MAP */}
        <TileLayer
          url={`https://maps.hereapi.com/v3/base/mc/{z}/{x}/{y}/png?apiKey=${HERE_API_KEY}`}
          attribution="© HERE"
        />

        {pos && (
          <>
            <Marker position={[pos.lat, pos.lng]} />
            <Circle center={[pos.lat, pos.lng]} radius={accuracy} />
            <Recenter latlng={[pos.lat, pos.lng]} />
          </>
        )}
      </MapContainer>
    </div>
  );
}
