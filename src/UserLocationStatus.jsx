import React from 'react'

function UserLocationStatus() {
    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100vh",
                background: "rgba(0,0,0,0.6)",
                backdropFilter: "blur(5px)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 9999,
            }}
        >
            <div
                style={{
                    padding: "20px 25px",
                    borderRadius: "12px",
                    background: "#f0fdf4",
                    border: "1px solid #86efac",
                    fontFamily: "monospace",
                    color: "#166534",
                    maxWidth: "320px",
                    lineHeight: "1.6",
                    textAlign: "center",
                    boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
                }}
            >
                <div style={{ fontWeight: "bold", marginBottom: "10px" }}>
                    📍 Enable Location Required
                </div>

                <div>1️⃣ Click "Allow" in browser popup</div>
                <div>2️⃣ Turn ON device location</div>
                <div>3️⃣ Wait for fetching...</div>

                <div style={{ marginTop: "10px", color: "#15803d" }}>
                    🚫 Page is blocked until enabled
                </div>
            </div>
        </div>
    )
}

export default UserLocationStatus