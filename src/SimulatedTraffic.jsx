// src/SimulatedTraffic.jsx

import { Polyline, Tooltip } from "react-leaflet";

import "./SimulatedTraffic.css";

/* -------------------------------------------------------------------------- */
/*                          SIMULATED TRAFFIC DATA                            */
/* -------------------------------------------------------------------------- */

const simulatedTrafficData = [
  {
    id: 1,

    severity: "high",

    label: "Heavy Traffic",

    color: "#ef4444",

    positions: [
      [12.9716, 77.5946],
      [12.975, 77.602],
    ],
  },

  {
    id: 2,

    severity: "medium",

    label: "Moderate Traffic",

    color: "#f59e0b",

    positions: [
      [12.968, 77.58],
      [12.97, 77.59],
    ],
  },

  {
    id: 3,

    severity: "low",

    label: "Free Flow",

    color: "#10b981",

    positions: [
      [12.965, 77.57],
      [12.968, 77.575],
    ],
  },
];

/* -------------------------------------------------------------------------- */
/*                           TRAFFIC COMPONENT                                */
/* -------------------------------------------------------------------------- */

export default function SimulatedTraffic() {
  return (
    <>
      {simulatedTrafficData.map((traffic) => (
        <Polyline
          key={traffic.id}
          positions={traffic.positions}
          pathOptions={{
            color: traffic.color,

            weight: traffic.severity === "high" ? 8 : traffic.severity === "medium" ? 6 : 5,

            opacity: traffic.severity === "high" ? 1 : 0.85,

            lineCap: "round",
          }}
        >
          <Tooltip sticky>
            <div
              style={{
                minWidth: "140px",
              }}
            >
              <strong>{traffic.label}</strong>
              <br />
              Severity: {traffic.severity.toUpperCase()}
            </div>
          </Tooltip>
        </Polyline>
      ))}
    </>
  );
}
