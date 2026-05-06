// src/TrafficFlowLayer.jsx

import { useEffect, useRef, useState } from "react";

import { useMap } from "react-leaflet";

import L from "leaflet";

import "./TrafficFlowLayer.css";

const HERE_API_KEY = import.meta.env.VITE_HERE_API_KEY;

/* =========================================
   TRAFFIC FLOW LAYER
========================================= */

export default function TrafficFlowLayer({
  center,

  radius = 5000,

  refreshInterval = 45000,

  minJamFactor = 2,
}) {
  const map = useMap();

  const trafficLayerRef = useRef([]);

  const refreshRef = useRef(null);

  const [trafficStats, setTrafficStats] = useState({
    total: 0,
    heavy: 0,
    medium: 0,
    low: 0,
  });

  /* =========================================
     CREATE PANE
  ========================================= */

  useEffect(() => {
    if (!map) return;

    if (!map.getPane("traffic-data")) {
      map.createPane("traffic-data");

      map.getPane("traffic-data").style.zIndex = 460;
    }
  }, [map]);

  /* =========================================
     CLEAR OLD LAYERS
  ========================================= */

  const clearTrafficLayers = () => {
    trafficLayerRef.current.forEach((layer) => {
      map.removeLayer(layer);
    });

    trafficLayerRef.current = [];
  };

  /* =========================================
     JAM COLOR
  ========================================= */

  const getTrafficColor = (jamFactor) => {
    if (jamFactor >= 8) return "#ef4444";

    if (jamFactor >= 5) return "#f97316";

    if (jamFactor >= 3) return "#facc15";

    return "#22c55e";
  };

  /* =========================================
     JAM WEIGHT
  ========================================= */

  const getTrafficWeight = (jamFactor) => {
    if (jamFactor >= 8) return 8;

    if (jamFactor >= 5) return 7;

    if (jamFactor >= 3) return 6;

    return 5;
  };

  /* =========================================
     FETCH TRAFFIC
  ========================================= */

  const loadTraffic = async () => {
    if (!center || !map) return;

    try {
      console.log("🚦 Fetching live traffic...");

      clearTrafficLayers();

      const url =
        `https://data.traffic.hereapi.com/v7/flow` +
        `?in=circle:${center.lat},${center.lng};r=${radius}` +
        `&locationReferencing=shape` +
        `&minJamFactor=${minJamFactor}` +
        `&apikey=${HERE_API_KEY}`;

      const res = await fetch(url);

      if (!res.ok) {
        throw new Error("Traffic API failed");
      }

      const data = await res.json();

      console.log("Traffic response:", data);

      if (!data.results?.length) {
        console.warn("⚠️ No traffic data");

        return;
      }

      let heavy = 0;
      let medium = 0;
      let low = 0;

      /* =====================================
           DRAW POLYLINES
        ====================================== */

      data.results.forEach((item) => {
        if (!item.location?.shape) return;

        const jam = item.currentFlow?.jamFactor || 0;

        const speed = item.currentFlow?.speed || 0;

        const freeFlow = item.currentFlow?.freeFlow || 0;

        /* COUNT */
        if (jam >= 8) heavy++;
        else if (jam >= 4) medium++;
        else low++;

        /* LATLNGS */
        const latlngs = item.location.shape.map((p) => [p.lat, p.lng]);

        /* POLYLINE */
        const poly = L.polyline(
          latlngs,

          {
            pane: "traffic-data",

            color: getTrafficColor(jam),

            weight: getTrafficWeight(jam),

            opacity: 0.92,

            smoothFactor: 2,
          }
        );

        /* POPUP */
        poly.bindPopup(`
              <div class="traffic-popup">

                <h3>
                  🚦 Traffic Flow
                </h3>

                <p>
                  <strong>Jam Factor:</strong>
                  ${jam.toFixed(1)}
                </p>

                <p>
                  <strong>Current Speed:</strong>
                  ${speed} km/h
                </p>

                <p>
                  <strong>Free Flow:</strong>
                  ${freeFlow} km/h
                </p>

                <p>
                  <strong>Status:</strong>
                  ${jam >= 8 ? "Heavy Congestion" : jam >= 5 ? "Moderate Traffic" : "Smooth Flow"}
                </p>

              </div>
            `);

        /* TOOLTIP */
        poly.bindTooltip(
          `Traffic: ${jam.toFixed(1)}`,

          {
            sticky: true,
          }
        );

        poly.addTo(map);

        trafficLayerRef.current.push(poly);
      });

      /* =====================================
           UPDATE STATS
        ====================================== */

      setTrafficStats({
        total: data.results.length,

        heavy,

        medium,

        low,
      });

      console.log("✅ Traffic rendered");
    } catch (err) {
      console.error("Traffic error:", err);
    }
  };

  /* =========================================
     AUTO REFRESH
  ========================================= */

  useEffect(() => {
    if (!center || !map) return;

    loadTraffic();

    refreshRef.current = setInterval(loadTraffic, refreshInterval);

    return () => {
      clearTrafficLayers();

      if (refreshRef.current) {
        clearInterval(refreshRef.current);
      }
    };
  }, [center, map, refreshInterval]);

  /* =========================================
     TRAFFIC HUD
  ========================================= */

  return (
    <div className="traffic-hud">
      <div className="traffic-card">
        <span>Total Roads</span>

        <h3>{trafficStats.total}</h3>
      </div>

      <div className="traffic-card heavy">
        <span>Heavy</span>

        <h3>{trafficStats.heavy}</h3>
      </div>

      <div className="traffic-card medium">
        <span>Moderate</span>

        <h3>{trafficStats.medium}</h3>
      </div>

      <div className="traffic-card low">
        <span>Smooth</span>

        <h3>{trafficStats.low}</h3>
      </div>
    </div>
  );
}
