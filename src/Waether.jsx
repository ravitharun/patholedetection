import React, { useEffect, useState } from "react";
import axios from "axios";
import Loader from "./Loader";

function Waether({ lat }) {
  const [loading, setLoading] = useState(false);

  const [weather, setWeather] = useState(null);

  const [error, setError] = useState(null);

  const latitude = Number(lat?.lat);

  const longitude = Number(lat?.lng);

  /* =========================
     WEATHER FETCH
  ========================= */

  useEffect(() => {
    const getWeather = async () => {
      try {
        setLoading(true);

        setError(null);

        const key = import.meta.env.VITE_WEATHER_API_KEY;

        const res = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${key}&units=metric`
        );

        setWeather(res.data);
      } catch (err) {
        console.log(err);

        setError("Unable to fetch weather");
      } finally {
        setLoading(false);
      }
    };

    if (lat?.lat && lat?.lng) {
      getWeather();
    }
  }, [lat]);

  /* =========================
     FORMATTERS
  ========================= */

  const formatTime = (unix) =>
    new Date(unix * 1000).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  const getWeatherIcon = () => {
    if (!weather) return "☀️";

    const main = weather.weather[0].main.toLowerCase();

    if (main.includes("clear")) return "☀️";

    if (main.includes("cloud")) return "☁️";

    if (main.includes("rain")) return "🌧️";

    if (main.includes("storm")) return "⛈️";

    if (main.includes("snow")) return "❄️";

    return "🌤️";
  };

  const getGradient = () => {
    if (!weather) return styles.blue;

    const main = weather.weather[0].main.toLowerCase();

    if (main.includes("clear")) return styles.blue;

    if (main.includes("cloud")) return styles.gray;

    if (main.includes("rain")) return styles.dark;

    if (main.includes("storm")) return styles.black;

    return styles.blue;
  };

  /* =========================
     RENDER
  ========================= */

  return (
    <div style={styles.wrapper}>
      {loading && <Loader loadername="Fetching weather..." />}

      {!loading && error && <div style={styles.error}>{error}</div>}

      {!loading && weather && (
        <div
          style={{
            ...styles.card,

            background: getGradient(),
          }}
        >
          {/* GLOW */}
          <div style={styles.glow} />

          {/* HEADER */}
          <div style={styles.header}>
            <div>
              <div style={styles.location}>📍 {weather.name}</div>

              <div style={styles.desc}>{weather.weather[0].description}</div>
            </div>

            <div style={styles.icon}>{getWeatherIcon()}</div>
          </div>

          {/* TEMP */}
          <div style={styles.tempBlock}>
            <div style={styles.temp}>{Math.round(weather.main.temp)}°</div>

            <div style={styles.feels}>
              Feels like {Math.round(weather.main.feels_like)}
              °C
            </div>
          </div>

          {/* CHIPS */}
          <div style={styles.chips}>
            <div style={styles.chip}>💧 {weather.main.humidity}%</div>

            <div style={styles.chip}>🌬 {weather.wind.speed} m/s</div>

            <div style={styles.chip}>☁ {weather.clouds.all}%</div>
          </div>

          {/* DETAILS */}
          <div style={styles.details}>
            <div style={styles.row}>
              <span>🌅 Sunrise</span>

              <span>{formatTime(weather.sys.sunrise)}</span>
            </div>

            <div style={styles.row}>
              <span>🌇 Sunset</span>

              <span>{formatTime(weather.sys.sunset)}</span>
            </div>

            <div style={styles.row}>
              <span>👁 Visibility</span>

              <span>{(weather.visibility / 1000).toFixed(1)} km</span>
            </div>

            <div style={styles.row}>
              <span>🌡 Pressure</span>

              <span>{weather.main.pressure} hPa</span>
            </div>
          </div>

          {/* AI INSIGHT */}
          <div style={styles.aiBox}>
            🤖 AI Travel Insight
            <div style={styles.aiText}>
              {weather.weather[0].main === "Rain"
                ? "Roads may be slippery. Potholes can be hidden by water."
                : weather.main.temp > 35
                  ? "Extreme heat detected. Stay hydrated during travel."
                  : "Weather conditions look safe for navigation."}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Waether;

/* =========================
   STYLES
========================= */

const styles = {
  wrapper: {
    width: "100%",

    padding: "14px 14px 110px",

    boxSizing: "border-box",
  },

  card: {
    width: "100%",

    borderRadius: "28px",

    padding: "22px",

    color: "#fff",

    position: "relative",

    overflow: "hidden",

    boxSizing: "border-box",

    boxShadow: "0 12px 40px rgba(0,0,0,0.24)",
  },

  glow: {
    position: "absolute",

    top: "-80px",

    right: "-60px",

    width: "220px",

    height: "220px",

    borderRadius: "50%",

    background: "rgba(255,255,255,0.12)",
  },

  header: {
    display: "flex",

    justifyContent: "space-between",

    alignItems: "center",

    position: "relative",

    zIndex: 2,
  },

  location: {
    fontSize: "18px",

    fontWeight: "700",
  },

  desc: {
    marginTop: "6px",

    fontSize: "13px",

    opacity: 0.9,

    textTransform: "capitalize",
  },

  icon: {
    fontSize: "52px",
  },

  tempBlock: {
    marginTop: "28px",

    position: "relative",

    zIndex: 2,
  },

  temp: {
    fontSize: "72px",

    fontWeight: "800",

    lineHeight: 1,
  },

  feels: {
    marginTop: "8px",

    fontSize: "14px",

    opacity: 0.85,
  },

  chips: {
    display: "flex",

    gap: "10px",

    flexWrap: "wrap",

    marginTop: "22px",
  },

  chip: {
    background: "rgba(255,255,255,0.14)",

    padding: "10px 14px",

    borderRadius: "999px",

    fontSize: "13px",

    backdropFilter: "blur(12px)",
  },

  details: {
    marginTop: "24px",

    background: "rgba(255,255,255,0.1)",

    borderRadius: "20px",

    overflow: "hidden",
  },

  row: {
    display: "flex",

    justifyContent: "space-between",

    padding: "16px",

    borderBottom: "1px solid rgba(255,255,255,0.08)",

    fontSize: "14px",
  },

  aiBox: {
    marginTop: "24px",

    background: "rgba(255,255,255,0.12)",

    padding: "18px",

    borderRadius: "20px",

    fontWeight: "700",

    lineHeight: 1.6,
  },

  aiText: {
    marginTop: "10px",

    fontWeight: "500",

    fontSize: "14px",
  },

  error: {
    background: "#ef4444",

    color: "#fff",

    padding: "14px",

    borderRadius: "16px",

    textAlign: "center",

    fontWeight: "600",
  },

  blue: "linear-gradient(135deg,#2563eb,#1d4ed8)",

  gray: "linear-gradient(135deg,#64748b,#475569)",

  dark: "linear-gradient(135deg,#1e293b,#0f172a)",

  black: "linear-gradient(135deg,#111827,#020617)",
};
