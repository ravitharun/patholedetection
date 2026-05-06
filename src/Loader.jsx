import React from "react";

function Loader({ loadername }) {
  return (
    <>
      {/* Animation */}
      <style>
        {`
                    @keyframes spin {
                        0% {
                            transform: rotate(0deg);
                        }
                        100% {
                            transform: rotate(360deg);
                        }
                    }

                    @keyframes pulse {
                        0% {
                            opacity: 0.5;
                            transform: scale(0.95);
                        }

                        50% {
                            opacity: 1;
                            transform: scale(1);
                        }

                        100% {
                            opacity: 0.5;
                            transform: scale(0.95);
                        }
                    }

                    @keyframes glow {
                        0% {
                            box-shadow:
                                0 0 0 rgba(59,130,246,0.4),
                                0 0 0 rgba(59,130,246,0.2);
                        }

                        50% {
                            box-shadow:
                                0 0 30px rgba(59,130,246,0.45),
                                0 0 60px rgba(59,130,246,0.25);
                        }

                        100% {
                            box-shadow:
                                0 0 0 rgba(59,130,246,0.4),
                                0 0 0 rgba(59,130,246,0.2);
                        }
                    }
                `}
      </style>

      <div style={styles.page}>
        {/* Background blur circles */}
        <div style={styles.bgCircle1}></div>
        <div style={styles.bgCircle2}></div>

        {/* Main Loader Card */}
        <div style={styles.card}>
          {/* Spinner wrapper */}
          <div style={styles.spinnerWrapper}>
            {/* Outer Ring */}
            <div style={styles.outerRing}></div>

            {/* Inner Ring */}
            <div style={styles.innerRing}></div>

            {/* Center Dot */}
            <div style={styles.centerDot}></div>
          </div>

          {/* Text Content */}
          <div style={styles.content}>
            <h2 style={styles.title}>{loadername || "Loading"}</h2>

            <p style={styles.subtitle}>Preparing live transport intelligence...</p>
          </div>

          {/* Loading bars */}
          <div style={styles.loadingBars}>
            <div style={styles.bar}></div>
            <div style={styles.bar}></div>
            <div style={styles.bar}></div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Loader;

/* =========================================
   STYLES
========================================= */
const styles = {
  page: {
    position: "fixed",
    inset: 0,

    width: "100%",
    height: "100vh",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    overflow: "hidden",

    background: "linear-gradient(135deg, #0f172a 0%, #111827 40%, #1e293b 100%)",

    backdropFilter: "blur(12px)",

    zIndex: 999999,
  },

  /* Background blur effects */
  bgCircle1: {
    position: "absolute",
    width: "320px",
    height: "320px",

    borderRadius: "50%",

    background: "rgba(59,130,246,0.18)",

    top: "-80px",
    left: "-80px",

    filter: "blur(70px)",
  },

  bgCircle2: {
    position: "absolute",
    width: "280px",
    height: "280px",

    borderRadius: "50%",

    background: "rgba(99,102,241,0.18)",

    bottom: "-60px",
    right: "-60px",

    filter: "blur(70px)",
  },

  /* Main card */
  card: {
    position: "relative",

    width: "340px",
    maxWidth: "90%",

    padding: "42px 32px",

    borderRadius: "30px",

    background: "rgba(255,255,255,0.08)",

    border: "1px solid rgba(255,255,255,0.08)",

    backdropFilter: "blur(18px)",

    display: "flex",
    flexDirection: "column",
    alignItems: "center",

    boxShadow: "0 20px 50px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)",
  },

  /* Spinner wrapper */
  spinnerWrapper: {
    position: "relative",

    width: "110px",
    height: "110px",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    marginBottom: "28px",
  },

  outerRing: {
    position: "absolute",

    width: "110px",
    height: "110px",

    borderRadius: "50%",

    border: "4px solid rgba(59,130,246,0.15)",
    borderTop: "4px solid #3b82f6",

    animation: "spin 1.2s linear infinite",
  },

  innerRing: {
    position: "absolute",

    width: "72px",
    height: "72px",

    borderRadius: "50%",

    border: "3px solid rgba(99,102,241,0.15)",
    borderBottom: "3px solid #6366f1",

    animation: "spin 0.9s linear infinite reverse",

    boxShadow: "0 0 25px rgba(59,130,246,0.25)",
  },

  centerDot: {
    width: "16px",
    height: "16px",

    borderRadius: "50%",

    background: "#60a5fa",

    animation: "pulse 1.5s ease-in-out infinite",

    boxShadow: "0 0 18px rgba(96,165,250,0.8)",
  },

  /* Text */
  content: {
    textAlign: "center",
    marginBottom: "26px",
  },

  title: {
    margin: 0,

    color: "#ffffff",

    fontSize: "24px",
    fontWeight: 700,
    letterSpacing: "0.3px",
  },

  subtitle: {
    marginTop: "10px",

    color: "rgba(255,255,255,0.7)",

    fontSize: "14px",
    lineHeight: 1.6,
  },

  /* Animated bars */
  loadingBars: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  bar: {
    width: "10px",
    height: "10px",

    borderRadius: "999px",

    background: "#60a5fa",

    animation: "pulse 1.2s ease-in-out infinite",
  },
};
