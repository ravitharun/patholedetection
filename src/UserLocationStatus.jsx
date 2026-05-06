import React, { useEffect, useState } from "react";

function UserLocationStatus({
  gpsEnabled = false,

  permissionState = "prompt",

  accuracy = null,

  city = "",

  onRetry,
}) {
  const [pulse, setPulse] = useState(false);

  /* =========================
       PULSE EFFECT
    ========================= */

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse((prev) => !prev);
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  /* =========================
       AUTO HIDE
    ========================= */

  if (gpsEnabled) {
    return null;
  }

  /* =========================
       STATUS MESSAGE
    ========================= */

  const getStatusMessage = () => {
    if (permissionState === "denied") {
      return {
        title: "Location Permission Blocked",

        subtitle: "Browser access to GPS was denied.",

        color: "#ef4444",

        bg: "linear-gradient(135deg,#7f1d1d,#dc2626)",

        icon: "🚫",
      };
    }

    if (permissionState === "granted") {
      return {
        title: "Fetching GPS Signal",

        subtitle: "Acquiring accurate live location...",

        color: "#22c55e",

        bg: "linear-gradient(135deg,#166534,#22c55e)",

        icon: "📡",
      };
    }

    return {
      title: "Enable Live Location",

      subtitle: "Allow GPS access for real-time navigation.",

      color: "#2563eb",

      bg: "linear-gradient(135deg,#1d4ed8,#2563eb)",

      icon: "📍",
    };
  };

  const status = getStatusMessage();

  return (
    <div style={styles.overlay}>
      {/* BACKDROP GLOW */}
      <div style={styles.backdropGlow}></div>

      {/* CARD */}
      <div style={styles.card}>
        {/* TOP ICON */}
        <div
          style={{
            ...styles.iconWrapper,

            boxShadow: pulse ? `0 0 0 18px ${status.color}22` : `0 0 0 6px ${status.color}33`,
          }}
        >
          <div style={styles.icon}>{status.icon}</div>
        </div>

        {/* TITLE */}
        <h2 style={styles.title}>{status.title}</h2>

        {/* SUBTITLE */}
        <p style={styles.subtitle}>{status.subtitle}</p>

        {/* LIVE STATUS */}
        <div style={styles.liveBox}>
          <div style={styles.liveRow}>
            <span>Permission</span>

            <span
              style={{
                color:
                  permissionState === "granted"
                    ? "#22c55e"
                    : permissionState === "denied"
                      ? "#ef4444"
                      : "#f59e0b",
              }}
            >
              {permissionState}
            </span>
          </div>

          <div style={styles.liveRow}>
            <span>GPS Accuracy</span>

            <span>{accuracy ? `${Math.round(accuracy)} m` : "--"}</span>
          </div>

          <div style={styles.liveRow}>
            <span>Region</span>

            <span>{city || "--"}</span>
          </div>
        </div>

        {/* STEPS */}
        <div style={styles.stepsContainer}>
          <div style={styles.step}>
            <div style={styles.stepNum}>1</div>

            <div style={styles.stepText}>Allow browser location access</div>
          </div>

          <div style={styles.step}>
            <div style={styles.stepNum}>2</div>

            <div style={styles.stepText}>Enable GPS / device location</div>
          </div>

          <div style={styles.step}>
            <div style={styles.stepNum}>3</div>

            <div style={styles.stepText}>Wait for high-accuracy tracking</div>
          </div>
        </div>

        {/* AI INFO */}
        <div style={styles.aiBox}>
          🤖 AI Navigation requires live GPS to:
          <br />
          <br />
          • Detect potholes accurately
          <br />
          • Provide live navigation
          <br />
          • Trigger traffic rerouting
          <br />• Enable trip safety alerts
        </div>

        {/* RETRY BUTTON */}
        <button
          style={{
            ...styles.retryBtn,

            background: status.bg,
          }}
          onClick={() => {
            if (onRetry) {
              onRetry();
            } else {
              window.location.reload();
            }
          }}
        >
          Retry Location Access
        </button>

        {/* FOOTER */}
        <div style={styles.footer}>
          🔒 Your live location is securely processed for navigation only.
        </div>
      </div>
    </div>
  );
}

export default UserLocationStatus;

/* =========================
   STYLES
========================= */

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(2,6,23,0.72)",
    backdropFilter: "blur(10px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999999,
    padding: "20px",
  },

  backdropGlow: {
    position: "absolute",
    width: "400px",
    height: "400px",
    borderRadius: "50%",
    background: "rgba(37,99,235,0.12)",
    filter: "blur(90px)",
  },

  card: {
    width: "100%",
    maxWidth: "400px",
    background: "rgba(255,255,255,0.96)",
    borderRadius: "32px",
    padding: "30px",
    position: "relative",
    overflow: "hidden",
    boxShadow: "0 25px 70px rgba(0,0,0,0.28)",
    textAlign: "center",
  },

  iconWrapper: {
    width: "92px",
    height: "92px",
    borderRadius: "50%",
    background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    margin: "0 auto",
    transition: "0.4s",
  },

  icon: {
    fontSize: "42px",
  },

  title: {
    marginTop: "24px",
    marginBottom: "10px",
    fontSize: "28px",
    fontWeight: "800",
    color: "#111827",
  },

  subtitle: {
    color: "#6b7280",
    fontSize: "15px",
    lineHeight: 1.6,
  },

  liveBox: {
    marginTop: "24px",
    background: "#f8fafc",
    borderRadius: "20px",
    overflow: "hidden",
    border: "1px solid #e5e7eb",
  },

  liveRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "16px 18px",
    borderBottom: "1px solid #eef2f7",
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
  },

  stepsContainer: {
    marginTop: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },

  step: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    background: "#f8fafc",
    padding: "14px",
    borderRadius: "18px",
  },

  stepNum: {
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
  },

  stepText: {
    textAlign: "left",
    fontSize: "14px",
    color: "#374151",
    fontWeight: "600",
  },

  aiBox: {
    marginTop: "24px",
    background: "linear-gradient(135deg,#eff6ff,#dbeafe)",
    padding: "18px",
    borderRadius: "20px",
    textAlign: "left",
    lineHeight: 1.7,
    fontSize: "14px",
    color: "#1e3a8a",
    fontWeight: "500",
  },

  retryBtn: {
    width: "100%",
    marginTop: "26px",
    padding: "16px",
    border: "none",
    borderRadius: "18px",
    color: "#fff",
    fontWeight: "800",
    fontSize: "15px",
    cursor: "pointer",
    boxShadow: "0 10px 28px rgba(37,99,235,0.25)",
  },

  footer: {
    marginTop: "18px",
    fontSize: "12px",
    color: "#9ca3af",
    lineHeight: 1.6,
  },
};
