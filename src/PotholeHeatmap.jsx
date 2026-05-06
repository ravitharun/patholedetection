```jsx id="7q2nva"
import { useEffect, useRef } from "react";

import { useMap } from "react-leaflet";

import L from "leaflet";

import "leaflet.heat";

/* =========================================
   PRODUCTION GRADE POTHOLE HEATMAP
========================================= */

export default function PotholeHeatmap({
  data = [],

  radius = 28,

  blur = 18,

  maxZoom = 19,

  minOpacity = 0.35,

  showMarkers = false,

  enablePulse = true,
}) {

  const map = useMap();

  const heatLayerRef = useRef(null);

  const markersRef = useRef([]);

  /* =========================================
     CREATE HEATMAP
  ========================================= */

  useEffect(() => {

    if (!map) return;

    /* CLEANUP OLD */
    if (heatLayerRef.current) {
      map.removeLayer(
        heatLayerRef.current
      );
    }

    markersRef.current.forEach(
      (marker) => {
        map.removeLayer(marker);
      }
    );

    markersRef.current = [];

    /* EMPTY */
    if (!data?.length) return;

    /* =====================================
       FORMAT DATA
    ====================================== */

    const heatPoints = data
      .filter(
        (p) =>
          p?.lat &&
          p?.lng
      )
      .map((p) => [

        Number(p.lat),

        Number(p.lng),

        /* intensity */
        p.severity === "HIGH"
          ? 1
          : p.severity === "MEDIUM"
          ? 0.75
          : 0.45,
      ]);

    /* =====================================
       CREATE HEAT LAYER
    ====================================== */

    heatLayerRef.current =
      L.heatLayer(
        heatPoints,

        {
          radius,

          blur,

          maxZoom,

          minOpacity,

          gradient: {
            0.2: "#22c55e",
            0.4: "#eab308",
            0.7: "#f97316",
            1.0: "#ef4444",
          },
        }
      );

    heatLayerRef.current.addTo(map);

    /* =====================================
       OPTIONAL MARKERS
    ====================================== */

    if (showMarkers) {

      data.forEach((pothole) => {

        const severity =
          pothole.severity ||
          "LOW";

        /* Marker Color */
        const color =
          severity === "HIGH"
            ? "#ef4444"
            : severity === "MEDIUM"
            ? "#f59e0b"
            : "#22c55e";

        /* Pulse Animation */
        const pulseClass =
          enablePulse
            ? "pulse-marker"
            : "";

        const marker =
          L.circleMarker(
            [
              pothole.lat,
              pothole.lng,
            ],

            {
              radius:
                severity === "HIGH"
                  ? 10
                  : severity ===
                    "MEDIUM"
                  ? 8
                  : 6,

              fillColor: color,

              color: "#ffffff",

              weight: 2,

              opacity: 1,

              fillOpacity: 0.9,

              className:
                pulseClass,
            }
          );

        /* =================================
           POPUP
        ================================== */

        marker.bindPopup(`
          <div style="
            min-width:200px;
            font-family:Inter,sans-serif;
          ">
          
            <h3 style="
              margin:0 0 10px 0;
              font-size:16px;
              color:#111827;
            ">
              🛣️ Pothole Detected
            </h3>

            <p style="
              margin:4px 0;
              font-size:13px;
            ">
              <strong>Severity:</strong>
              ${severity}
            </p>

            <p style="
              margin:4px 0;
              font-size:13px;
            ">
              <strong>Confidence:</strong>
              ${
                pothole.confidence ||
                "N/A"
              }%
            </p>

            <p style="
              margin:4px 0;
              font-size:13px;
            ">
              <strong>Reported:</strong>
              ${
                pothole.time ||
                "Unknown"
              }
            </p>

            <p style="
              margin:4px 0;
              font-size:13px;
            ">
              <strong>Coordinates:</strong><br/>
              ${Number(
                pothole.lat
              ).toFixed(5)},
              ${Number(
                pothole.lng
              ).toFixed(5)}
            </p>

          </div>
        `);

        marker.addTo(map);

        markersRef.current.push(
          marker
        );
      });
    }

    /* =====================================
       AUTO FIT BOUNDS
    ====================================== */

    if (heatPoints.length > 1) {

      const bounds =
        L.latLngBounds(
          heatPoints.map(
            (p) => [p[0], p[1]]
          )
        );

      map.fitBounds(bounds, {
        padding: [40, 40],
      });
    }

    /* =====================================
       CLEANUP
    ====================================== */

    return () => {

      if (
        heatLayerRef.current
      ) {
        map.removeLayer(
          heatLayerRef.current
        );
      }

      markersRef.current.forEach(
        (marker) => {
          map.removeLayer(marker);
        }
      );
    };

  }, [
    map,
    data,
    radius,
    blur,
    maxZoom,
    minOpacity,
    showMarkers,
    enablePulse,
  ]);

  return null;
}
```
