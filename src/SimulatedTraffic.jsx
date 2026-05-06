// src/SimulatedTraffic.jsx
import { Polyline } from "react-leaflet";
import "./SimulatedTraffic.css";

/*
  Demo-safe simulated traffic congestion
  Green = free
  Orange = slow
  Red = heavy
*/

export default function SimulatedTraffic() {
  return (
    <>
      {/* Heavy traffic */}
      <Polyline
        positions={[
          [12.9716, 77.5946],
          [12.975, 77.602],
        ]}
        pathOptions={{ color: "#e74c3c", weight: 6 }}
      />

      {/* Medium traffic */}
      <Polyline
        positions={[
          [12.968, 77.58],
          [12.97, 77.59],
        ]}
        pathOptions={{ color: "#f39c12", weight: 6 }}
      />

      {/* Free flow */}
      <Polyline
        positions={[
          [12.965, 77.57],
          [12.968, 77.575],
        ]}
        pathOptions={{ color: "#2ecc71", weight: 6 }}
      />
    </>
  );
}
