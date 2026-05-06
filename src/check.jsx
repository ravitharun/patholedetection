import React from "react";

function Check() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        color: "white",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div
        style={{
          background: "rgba(255,255,255,0.08)",
          backdropFilter: "blur(14px)",
          padding: "40px",
          borderRadius: "24px",
          textAlign: "center",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.35)",
        }}
      >
        <div
          style={{
            fontSize: "64px",
            marginBottom: "16px",
          }}
        >
          ✅
        </div>

        <h1
          style={{
            margin: 0,
            fontSize: "32px",
            fontWeight: "700",
          }}
        >
          System Check Complete
        </h1>

        <p
          style={{
            marginTop: "12px",
            color: "rgba(255,255,255,0.72)",
            fontSize: "15px",
            lineHeight: "1.6",
          }}
        >
          All modules are running successfully.
        </p>

        <button
          style={{
            marginTop: "24px",
            padding: "12px 24px",
            borderRadius: "14px",
            border: "none",
            background: "#2563eb",
            color: "white",
            fontWeight: "600",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}

export default Check;
