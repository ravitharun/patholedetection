import "./TrafficLegend.css";

export default function TrafficLegend() {
  return (
    <div className="traffic-legend">
      <div><span className="dot green" /> Free flow</div>
      <div><span className="dot orange" /> Moderate</div>
      <div><span className="dot red" /> Heavy</div>
    </div>
  );
}
