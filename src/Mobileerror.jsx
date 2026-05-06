import React, { useEffect, useState } from "react";

function Mobileerror({ handelclose, error = "" }) {
  const [accept, setaccept] = useState(false);

  /* 🔒 PREVENT BODY SCROLL */
  useEffect(() => {
    document.body.style.overflow = accept ? "auto" : "hidden";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [accept]);

  /* 🎨 STYLES */
  const overlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100vh",
    backgroundColor: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
    padding: "16px",
    backdropFilter: "blur(4px)",
  };

  const boxStyle = {
    width: "100%",
    maxWidth: "400px",
    background: "#fff",
    borderRadius: "18px",
    padding: "24px",
    textAlign: "center",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
    animation: "mobileAlertFade 0.25s ease",
  };

  const iconStyle = {
    fontSize: "42px",
    marginBottom: "10px",
  };

  const titleStyle = {
    fontSize: "20px",
    fontWeight: "700",
    marginBottom: "10px",
    color: "#111827",
  };

  const textStyle = {
    fontSize: "14px",
    color: "#6b7280",
    marginBottom: "20px",
    lineHeight: 1.6,
  };

  const errorStyle = {
    fontSize: "13px",
    color: "#dc2626",
    marginBottom: "12px",
    wordBreak: "break-word",
  };

  const buttonStyle = {
    width: "100%",
    padding: "12px 20px",
    borderRadius: "12px",
    border: "none",
    backgroundColor: "#2563eb",
    color: "#fff",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "600",
    transition: "0.3s ease",
  };

  const handleClose = () => {
    setaccept(true);

    if (typeof handelclose === "function") {
      handelclose();
    }
  };

  return (
    <>
      <style>
        {`
          @keyframes mobileAlertFade {
            from {
              opacity: 0;
              transform: translateY(15px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>

      {!accept && (
        <div style={overlayStyle}>
          <div style={boxStyle}>
            <div style={iconStyle}>📱</div>

            <h2 style={titleStyle}>Mobile View Only</h2>

            <p style={textStyle}>
              This application is optimized for mobile devices. Please use a screen width below
              768px for the best experience.
            </p>

            {error && <div style={errorStyle}>{error}</div>}

            <button
              style={buttonStyle}
              onClick={handleClose}
              onMouseOver={(e) => {
                e.target.style.opacity = "0.9";
              }}
              onMouseOut={(e) => {
                e.target.style.opacity = "1";
              }}
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Mobileerror;
