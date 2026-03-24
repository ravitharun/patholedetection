import React, { useEffect } from "react";

function Home() {
  useEffect(() => {
    const redirect = () => {
      setTimeout(() => {
        window.location.href = "/Map";
      }, 2500);
    };
    redirect();
  }, []);

  const styles = {
    page: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      padding: "20px",
      background: "linear-gradient(135deg, #020024, #090979, #1a1a2e)",
      color: "#fff",
      textAlign: "center",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    },
    container: {
      maxWidth: "600px",
      width: "100%",
      padding: "30px 20px",
      borderRadius: "20px",
      background: "rgba(255, 255, 255, 0.08)",
      backdropFilter: "blur(10px)",
      boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
    },
    title: {
      fontSize: "clamp(1.8rem, 5vw, 2.4rem)",
      fontWeight: "700",
      marginBottom: "10px",
      lineHeight: "1.2",
      textShadow: "1px 1px 6px rgba(0,0,0,0.5)",
    },
    subtitle: {
      fontSize: "clamp(0.95rem, 2.8vw, 1.1rem)",
      marginBottom: "20px",
      lineHeight: "1.6",
      maxWidth: "100%",
      opacity: 0.95,
    },
    highlight: {
      color: "#FFD166",
      fontWeight: "600",
    },
    button: {
      padding: "12px 30px",
      fontSize: "clamp(0.9rem, 2vw, 1rem)",
      fontWeight: "600",
      border: "2px solid rgba(255, 255, 255, 0.7)",
      borderRadius: "10px",
      background: "rgba(255, 255, 255, 0.18)",
      color: "#fff",
      cursor: "pointer",
      transition: "all 0.25s ease",
      boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
    },
    buttonHover: {
      transform: "translateY(-2px)",
      background: "rgba(255, 255, 255, 0.3)",
      boxShadow: "0 6px 16px rgba(0,0,0,0.3)",
    },
    redirectText: {
      marginTop: "16px",
      fontSize: "0.85rem",
      color: "#fff",
      opacity: 0.8,
      lineHeight: "1.4",
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>
          Track Potholes, Save Commutes
        </h1>
        <p style={styles.subtitle}>
          See real‑time pothole alerts and road conditions on the map, with live{" "}
          <span style={styles.highlight}>weather updates</span>. Drive safer and smarter every day.
        </p>

        <button
          style={styles.button}
          onMouseOver={(e) =>
            Object.assign(e.currentTarget.style, styles.buttonHover)
          }
          onMouseOut={(e) =>
            Object.assign(e.currentTarget.style, styles.button)
          }
          onClick={() => (window.location.href = "/Map")}
        >
          View Map
        </button>
        <p style={styles.redirectText}>
          Redirecting to map automatically in 2.5 seconds...
        </p>
      </div>
    </div>
  );
}

export default Home;
