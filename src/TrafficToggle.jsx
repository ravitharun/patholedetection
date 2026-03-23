import "./TrafficToggle.css";

export default function TrafficToggle({ value, onChange }) {
  return (
    <div className="traffic-toggle">
      <label>
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span>Traffic</span>
      </label>
    </div>
  );
}
