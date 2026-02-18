import React, { useRef, useState } from "react";
import "./camera.css";

export default function CameraCapture({ uploadUrl = "/upload", isOnline, onImage }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [isRunning, setIsRunning] = useState(false);
  const [captures, setCaptures] = useState([]);
  const [error, setError] = useState(null);
  const [facing, setFacing] = useState("environment");

  async function startCamera() {
    if (!isOnline) {
      alert("You are offline");
      return;
    }

    setError(null);
    try {
      const constraints = {
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      videoRef.current.srcObject = stream;
      videoRef.current.playsInline = true;
      await videoRef.current.play();

      setIsRunning(true);
    } catch (e) {
      setError("Camera permission denied or not supported");
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsRunning(false);
  }

  async function capturePhoto() {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");

    if (facing === "user") {
      ctx.scale(-1, 1);
      ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
    } else {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    }

    const blob = await new Promise((res) =>
      canvas.toBlob(res, "image/jpeg", 0.85)
    );

    const url = URL.createObjectURL(blob);

    setCaptures((prev) => [{ blob, url, timestamp: Date.now() }, ...prev]);

    // 🔥 SEND IMAGE TO PARENT (App.jsx)
    if (onImage) onImage(blob);
  }

  function toggleFacing() {
    setFacing((prev) => (prev === "environment" ? "user" : "environment"));
    if (isRunning) {
      stopCamera();
      setTimeout(startCamera, 300);
    }
  }

  const eventButtons = [
    { name: "Start", action: startCamera, disable: isRunning },
    { name: "Capture", action: capturePhoto, disable: !isRunning },
    { name: "Stop", action: stopCamera, disable: !isRunning },
    { name: "Flip", action: toggleFacing, disable: false },
  ];

  return (
    <div className="cam-container">
      {/* 🔴 Offline banner */}
      {!isOnline && (
        <div
          style={{
            position: "fixed",
            top: 0,
            width: "100%",
            background: "crimson",
            color: "white",
            padding: "8px",
            textAlign: "center",
            zIndex: 2000,
          }}
        >
          You are offline
        </div>
      )}

      <div className="cam-wrapper">
        {/* Camera */}
        <div className="cam-video-box">
          <video ref={videoRef} className="cam-video" />

          {!isRunning && (
            <div className="cam-overlay">Camera Stopped</div>
          )}
        </div>

        {/* Controls */}
        <div className="cam-controls">
          <div className="cam-btn-row">
            {eventButtons.map((btn, i) => (
              <button
                key={i}
                onClick={btn.action}
                disabled={btn.disable}
                className="cam-btn"
              >
                {btn.name}
              </button>
            ))}
          </div>

          <div className="cam-status">
            <p><strong>Status:</strong> {isRunning ? "Running" : "Stopped"}</p>
            <p><strong>Error:</strong> {error ?? "None"}</p>
          </div>

          <div className="cam-capture-list">
            {captures.length === 0 && (
              <div className="cam-empty">No captures yet</div>
            )}

            {captures.map((c, index) => (
              <div className="capture-item" key={index}>
                <img src={c.url} className="capture-img" alt="" />
                <button
                  className="remove-btn"
                  onClick={() => {
                    URL.revokeObjectURL(c.url);
                    setCaptures((prev) =>
                      prev.filter((_, idx) => idx !== index)
                    );
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}
