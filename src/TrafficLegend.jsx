import "./TrafficLegend.css";

import { FaRoad, FaExclamationTriangle, FaTrafficLight, FaBroadcastTower } from "react-icons/fa";

/* =========================================
   TRAFFIC LEGEND
========================================= */

export default function TrafficLegend({
  online = true,

  lastUpdated = "Live",

  totalAlerts = 0,
}) {
  return (
    <div className="traffic-legend">
      {/* HEADER */}
      <div className="legend-header">
        <div className="legend-title">
          <FaTrafficLight />

          <span>Traffic Intelligence</span>
        </div>

        <div className={`legend-status ${online ? "online" : "offline"}`}>
          <span className="status-dot"></span>

          {online ? "LIVE" : "OFFLINE"}
        </div>
      </div>

      {/* LEGEND ITEMS */}
      <div className="legend-items">
        <div className="legend-item">
          <div className="legend-left">
            <span className="dot green"></span>

            <span>Smooth Flow</span>
          </div>

          <span className="legend-value">&lt; 3 Jam</span>
        </div>

        <div className="legend-item">
          <div className="legend-left">
            <span className="dot yellow"></span>

            <span>Moderate</span>
          </div>

          <span className="legend-value">3 - 5 Jam</span>
        </div>

        <div className="legend-item">
          <div className="legend-left">
            <span className="dot orange"></span>

            <span>Slow Traffic</span>
          </div>

          <span className="legend-value">5 - 7 Jam</span>
        </div>

        <div className="legend-item">
          <div className="legend-left">
            <span className="dot red"></span>

            <span>Heavy Congestion</span>
          </div>

          <span className="legend-value">8+ Jam</span>
        </div>
      </div>

      {/* ANALYTICS */}
      <div className="legend-analytics">
        <div className="analytics-box">
          <FaRoad />

          <div>
            <span>Roads Monitored</span>

            <h4>124</h4>
          </div>
        </div>

        <div className="analytics-box">
          <FaExclamationTriangle />

          <div>
            <span>Active Alerts</span>

            <h4>{totalAlerts}</h4>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="legend-footer">
        <FaBroadcastTower />

        <span>Updated: {lastUpdated}</span>
      </div>
    </div>
  );
}
