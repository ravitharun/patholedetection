// src/LiveMap.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  Popup,
  ZoomControl,
  ScaleControl,
  useMap,
  Polyline,
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

/* ===============================
   RECENTER MAP
================================= */
function Recenter({ position, autoFollow }) {
  const map = useMap();

  useEffect(() => {
    if (position && autoFollow) {
      map.flyTo([position.lat, position.lng], 17, {
        duration: 1.5,
      });
    }
  }, [position, autoFollow, map]);

  return null;
}

/* ===============================
   USER MARKER ICON
================================= */
const userIcon = new L.Icon({
  iconUrl:
    "https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@master/img/marker-icon-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [30, 48],
  iconAnchor: [15, 48],
  popupAnchor: [0, -40],
});

/* ===============================
   LIVE MAP COMPONENT
================================= */
export default function LiveMap({ potholes = [] }) {
  const [position, setPosition] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [speed, setSpeed] = useState(null);
  const [heading, setHeading] = useState(null);

  const [showTraffic, setShowTraffic] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [autoFollow, setAutoFollow] = useState(true);

  const [path, setPath] = useState([]);

  const watchRef = useRef(null);

  /* ===============================
     LIVE GEOLOCATION
  ================================= */
  useEffect(() => {
    if (!navigator.geolocation) {
      console.error("Geolocation not supported");
      return;
    }

    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const latitude = pos.coords.latitude;
        const longitude = pos.coords.longitude;
        const gpsAccuracy = pos.coords.accuracy;

        /* Ignore poor GPS signals */
        if (gpsAccuracy > 100) return;

        const livePosition = {
          lat: latitude,
          lng: longitude,
        };

        setPosition(livePosition);

        setAccuracy(gpsAccuracy);

        setSpeed(pos.coords.speed ? (pos.coords.speed * 3.6).toFixed(1) : 0);

        setHeading(pos.coords.heading || 0);

        /* Store travel path */
        setPath((prev) => [...prev, [latitude, longitude]]);
      },

      (err) => {
        console.error("GPS ERROR:", err);
      },

      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000,
      }
    );

    return () => {
      if (watchRef.current) {
        navigator.geolocation.clearWatch(watchRef.current);
      }
    };
  }, []);

  /* Default Bengaluru center */
  const center = useMemo(() => position ?? { lat: 12.9716, lng: 77.5946 }, [position]);

  /* Pothole stats */
  const potholeCount = potholes.length;

  return (
    <div className="livemap-root">
      {/* ===============================
          TOP HEADER
      ================================= */}
      <div className="livemap-header">
        <div>
          <h2>AI Smart Transport Live Map</h2>

          <p>{position ? "Live tracking active" : "Searching for GPS location..."}</p>
        </div>

        <div className="live-status">
          <span className="status-dot"></span>
          LIVE
        </div>
      </div>

      {/* ===============================
          CONTROLS PANEL
      ================================= */}
      <div className="map-controls">
        <TrafficToggle value={showTraffic} onChange={setShowTraffic} />

        <button
          className={`control-btn ${showHeatmap ? "active" : ""}`}
          onClick={() => setShowHeatmap(!showHeatmap)}
        >
          Heatmap
        </button>

        <button
          className={`control-btn ${autoFollow ? "active" : ""}`}
          onClick={() => setAutoFollow(!autoFollow)}
        >
          Auto Follow
        </button>
      </div>

      {/* ===============================
          LIVE INFO CARDS
      ================================= */}
      <div className="map-stats">
        <div className="stat-card">
          <span>Speed</span>
          <h3>{speed || 0} km/h</h3>
        </div>

        <div className="stat-card">
          <span>Accuracy</span>
          <h3>{accuracy ? `${Math.round(accuracy)} m` : "--"}</h3>
        </div>

        <div className="stat-card">
          <span>Potholes Nearby</span>
          <h3>{potholeCount}</h3>
        </div>

        <div className="stat-card">
          <span>Direction</span>
          <h3>{Math.round(heading || 0)}°</h3>
        </div>
      </div>

      {/* ===============================
          MAP
      ================================= */}
      <div className="livemap-container">
        <MapContainer
          center={[center.lat, center.lng]}
          zoom={16}
          minZoom={12}
          maxZoom={20}
          zoomControl={false}
          maxBounds={BLR_BOUNDS}
          maxBoundsViscosity={1}
          className="leaflet-map"
        >
          {/* ===============================
              HERE BASE MAP
          ================================= */}
          <TileLayer
            url={`https://maptiles.hereapi.com/v3/maptile/newest/normal.day/{z}/{x}/{y}/256/png?apiKey=${HERE_API_KEY}`}
            attribution="© HERE Maps"
          />

          {/* MAP CONTROLS */}
          <ZoomControl position="bottomright" />
          <ScaleControl position="bottomleft" />

          {/* ===============================
              TRAFFIC LAYER
          ================================= */}
          {showTraffic && <SimulatedTraffic />}

          {/* ===============================
              USER LOCATION
          ================================= */}
          {position && (
            <>
              <Marker position={[position.lat, position.lng]} icon={userIcon}>
                <Popup>
                  <div className="popup-content">
                    <h4>Your Location</h4>

                    <p>
                      <strong>Speed:</strong> {speed || 0} km/h
                    </p>

                    <p>
                      <strong>Accuracy:</strong> {Math.round(accuracy)} meters
                    </p>

                    <p>
                      <strong>Heading:</strong> {Math.round(heading || 0)}°
                    </p>
                  </div>
                </Popup>
              </Marker>

              {/* ACCURACY RADIUS */}
              <Circle
                center={[position.lat, position.lng]}
                radius={accuracy}
                pathOptions={{
                  color: "#2563eb",
                  fillColor: "#3b82f6",
                  fillOpacity: 0.15,
                }}
              />

              {/* USER ROUTE PATH */}
              <Polyline
                positions={path}
                pathOptions={{
                  color: "#2563eb",
                  weight: 5,
                  opacity: 0.7,
                }}
              />

              {/* RECENTER */}
              <Recenter position={position} autoFollow={autoFollow} />
            </>
          )}

          {/* ===============================
              POTHOLE HEATMAP
          ================================= */}
          {showHeatmap && <PotholeHeatmap data={potholes} />}
        </MapContainer>
      </div>

      {/* ===============================
          LEGEND
      ================================= */}
      <TrafficLegend />
    </div>
  );
}
