// src/GeoTracker.jsx

import { useEffect, useState, useRef, useMemo } from "react";
import "./GeoTracker.css";
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  Popup,
  Polyline,
  ZoomControl,
  ScaleControl,
  useMap,
} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";
import "./GeoTracker.css";

const HERE_API_KEY = import.meta.env.VITE_HERE_API_KEY;

/* =========================================
   USER MARKER ICON
========================================= */
const liveUserIcon = new L.Icon({
  iconUrl:
    "https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@master/img/marker-icon-blue.png",

  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",

  iconSize: [30, 48],
  iconAnchor: [15, 48],
  popupAnchor: [0, -40],
});

/* =========================================
   RECENTER MAP
========================================= */
function Recenter({ latlng, autoFollow }) {
  const map = useMap();

  useEffect(() => {
    if (latlng && autoFollow) {
      map.flyTo(latlng, 17, {
        duration: 1.5,
      });
    }
  }, [latlng, autoFollow, map]);

  return null;
}

/* =========================================
   MAIN COMPONENT
========================================= */
export default function GeoTracker() {
  const [pos, setPos] = useState(null);

  const [accuracy, setAccuracy] = useState(null);

  const [speed, setSpeed] = useState(0);

  const [heading, setHeading] = useState(0);

  const [path, setPath] = useState([]);

  const [tracking, setTracking] = useState(true);

  const [autoFollow, setAutoFollow] = useState(true);

  const [gpsStatus, setGpsStatus] = useState("Connecting...");

  const watchRef = useRef(null);

  /* =========================================
     START GEOLOCATION
  ========================================= */
  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsStatus("Geolocation not supported");
      return;
    }

    watchRef.current = navigator.geolocation.watchPosition(
      (p) => {
        const latitude = p.coords.latitude;
        const longitude = p.coords.longitude;

        const gpsAccuracy = p.coords.accuracy;

        /* Ignore weak GPS */
        if (gpsAccuracy > 100) return;

        const currentPos = {
          lat: latitude,
          lng: longitude,
        };

        setPos(currentPos);

        setAccuracy(gpsAccuracy);

        setSpeed(p.coords.speed ? (p.coords.speed * 3.6).toFixed(1) : 0);

        setHeading(p.coords.heading ? Math.round(p.coords.heading) : 0);

        setGpsStatus("Live GPS Active");

        /* Save route history */
        setPath((prev) => [...prev, [latitude, longitude]]);
      },

      (err) => {
        console.error(err);

        setGpsStatus("GPS Error");
      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    return () => {
      if (watchRef.current) {
        navigator.geolocation.clearWatch(watchRef.current);
      }
    };
  }, []);

  /* =========================================
     TOGGLE TRACKING
  ========================================= */
  const toggleTracking = () => {
    setTracking((prev) => !prev);
  };

  /* =========================================
     CLEAR ROUTE
  ========================================= */
  const clearRoute = () => {
    setPath([]);
  };

  /* =========================================
     DEFAULT CENTER
  ========================================= */
  const center = useMemo(() => pos ?? { lat: 12.9716, lng: 77.5946 }, [pos]);

  return (
    <div className="geo-root">
      {/* =====================================
          HEADER
      ====================================== */}
      <div className="geo-header">
        <div>
          <h2>Live Geo Tracker</h2>

          <p>{gpsStatus}</p>
        </div>

        <div className="geo-live">
          <span className="geo-live-dot"></span>
          LIVE
        </div>
      </div>

      {/* =====================================
          CONTROLS
      ====================================== */}
      <div className="geo-controls">
        <button
          className={`geo-btn ${autoFollow ? "active" : ""}`}
          onClick={() => setAutoFollow(!autoFollow)}
        >
          Auto Follow
        </button>

        <button className={`geo-btn ${tracking ? "active" : ""}`} onClick={toggleTracking}>
          {tracking ? "Tracking ON" : "Tracking OFF"}
        </button>

        <button className="geo-btn" onClick={clearRoute}>
          Clear Route
        </button>
      </div>

      {/* =====================================
          INFO CARDS
      ====================================== */}
      <div className="geo-stats">
        <div className="geo-card">
          <span>Speed</span>
          <h3>{speed} km/h</h3>
        </div>

        <div className="geo-card">
          <span>Accuracy</span>
          <h3>{accuracy ? `${Math.round(accuracy)} m` : "--"}</h3>
        </div>

        <div className="geo-card">
          <span>Heading</span>
          <h3>{heading}°</h3>
        </div>

        <div className="geo-card">
          <span>Path Points</span>
          <h3>{path.length}</h3>
        </div>
      </div>

      {/* =====================================
          MAP
      ====================================== */}
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={16}
        className="geo-map"
        zoomControl={false}
      >
        {/* HERE MAP */}
        <TileLayer
          url={`https://maptiles.hereapi.com/v3/maptile/newest/normal.day/{z}/{x}/{y}/256/png?apiKey=${HERE_API_KEY}`}
          attribution="© HERE Maps"
        />

        {/* MAP CONTROLS */}
        <ZoomControl position="bottomright" />
        <ScaleControl position="bottomleft" />

        {/* USER LOCATION */}
        {pos && tracking && (
          <>
            {/* Marker */}
            <Marker position={[pos.lat, pos.lng]} icon={liveUserIcon}>
              <Popup>
                <div className="geo-popup">
                  <h4>Your Location</h4>

                  <p>
                    <strong>Latitude:</strong> {pos.lat.toFixed(6)}
                  </p>

                  <p>
                    <strong>Longitude:</strong> {pos.lng.toFixed(6)}
                  </p>

                  <p>
                    <strong>Speed:</strong> {speed} km/h
                  </p>

                  <p>
                    <strong>Accuracy:</strong> {Math.round(accuracy)} m
                  </p>
                </div>
              </Popup>
            </Marker>

            {/* Accuracy Radius */}
            <Circle
              center={[pos.lat, pos.lng]}
              radius={accuracy}
              pathOptions={{
                color: "#2563eb",
                fillColor: "#3b82f6",
                fillOpacity: 0.15,
              }}
            />

            {/* Route Path */}
            <Polyline
              positions={path}
              pathOptions={{
                color: "#2563eb",
                weight: 5,
                opacity: 0.7,
              }}
            />

            {/* Recenter */}
            <Recenter latlng={[pos.lat, pos.lng]} autoFollow={autoFollow} />
          </>
        )}
      </MapContainer>
    </div>
  );
}
