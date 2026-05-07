import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  FaCamera,
  FaSyncAlt,
  FaVideo,
  FaTimes,
  FaExpand,
  FaMapMarkerAlt,
  FaWifi,
  FaExclamationTriangle,
  FaBolt,
} from "react-icons/fa";

/* =========================================
   CONFIG
========================================= */

const AI_INTERVAL = 1800;

const CameraCapture = ({ onImage, isOnline, aiEnabled = true }) => {
  /* =========================================
     REFS
  ========================================= */

  const videoRef = useRef(null);

  const canvasRef = useRef(null);

  const overlayCanvasRef = useRef(null);

  const streamRef = useRef(null);

  const detectionIntervalRef = useRef(null);

  /* =========================================
     STATES
  ========================================= */

  const [cameraActive, setCameraActive] = useState(false);

  const [capturedImage, setCapturedImage] = useState(null);

  const [loading, setLoading] = useState(false);

  const [fullscreen, setFullscreen] = useState(false);

  const [facingMode, setFacingMode] = useState("environment");

  const [autoDetect, setAutoDetect] = useState(false);

  const [gpsData, setGpsData] = useState(null);

  const [fps, setFps] = useState(0);

  const [backendStatus, setBackendStatus] = useState("ONLINE");

  const [detections, setDetections] = useState([]);

  const [aiState, setAiState] = useState("IDLE");

  const [captureMode, setCaptureMode] = useState("SMART AI");

  const [detectionCount, setDetectionCount] = useState(0);

  const [severity, setSeverity] = useState("LOW");

  const [confidence, setConfidence] = useState(0);

  /* =========================================
     GPS TRACKING
  ========================================= */

  useEffect(() => {
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        setGpsData({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          speed: ((pos.coords.speed || 0) * 3.6).toFixed(1),
          heading: pos.coords.heading || 0,
          accuracy: pos.coords.accuracy,
        });
      },
      console.error,
      {
        enableHighAccuracy: true,
      }
    );

    return () => navigator.geolocation.clearWatch(id);
  }, []);

  /* =========================================
     START CAMERA
  ========================================= */

  const startCamera = async () => {
    console.log("🚀 Starting camera...");

    try {
      setLoading(true);

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());

        streamRef.current = null;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },

        audio: false,
      });

      console.log("✅ Stream received:", stream);

      streamRef.current = stream;

      const video = videoRef.current;

      if (!video) {
        console.log("❌ Video ref missing");

        return;
      }

      video.srcObject = stream;

      try {
        await video.play();

        console.log("🎥 Camera playing");

        setCameraActive(true);

        setBackendStatus("ONLINE");
      } catch (err) {
        console.error("❌ Play error:", err);
      }
    } catch (err) {
      console.error("❌ Camera error:", err);

      setBackendStatus("ERROR");

      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* =========================================
     STOP CAMERA
  ========================================= */

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());

      streamRef.current = null;
    }

    clearInterval(detectionIntervalRef.current);

    setCameraActive(false);

    setAutoDetect(false);
  };

  /* =========================================
     SWITCH CAMERA
  ========================================= */

  const switchCamera = () => {
    const nextMode = facingMode === "environment" ? "user" : "environment";

    setFacingMode(nextMode);
  };

  useEffect(() => {
    if (cameraActive) {
      startCamera();
    }
  }, [facingMode]);

  /* =========================================
     CAPTURE IMAGE
  ========================================= */

  const sendFrameToBackend = async (blob) => {
    try {
      setAiState("PROCESSING");

      const formData = new FormData();

      formData.append("image", blob, "frame.jpg");

      formData.append("mode", "all");

      console.log("📤 Sending frame to backend...");

      const response = await fetch("http://127.0.0.1:8000/api/ai/detect-frame/", {
        method: "POST",
        body: formData,
      });

      console.log("📡 Response received");

      console.log("📡 Status:", response.status);

      const data = await response.json();

      console.log("🧠 AI RESPONSE:", data);

      if (!data.success) {
        setAiState("ERROR");

        return;
      }

      const mergedDetections = [];

      /* =========================
       POTHOLES
    ========================= */

      data.detections.potholes.forEach((item) => {
        mergedDetections.push({
          x: item.bbox[0],

          y: item.bbox[1],

          width: item.bbox[2] - item.bbox[0],

          height: item.bbox[3] - item.bbox[1],

          label: item.label.toUpperCase(),

          confidence: (item.confidence * 100).toFixed(1),

          type: "pothole",
        });
      });

      /* =========================
       LANES
    ========================= */

      data.detections.lanes.forEach((item) => {
        mergedDetections.push({
          x: item.bbox[0],

          y: item.bbox[1],

          width: item.bbox[2] - item.bbox[0],

          height: item.bbox[3] - item.bbox[1],

          label: item.label.toUpperCase(),

          confidence: (item.confidence * 100).toFixed(1),

          type: "lane",
        });
      });

      /* =========================
       SIGNALS
    ========================= */

      data.detections.signals.forEach((item) => {
        mergedDetections.push({
          x: item.bbox[0],

          y: item.bbox[1],

          width: item.bbox[2] - item.bbox[0],

          height: item.bbox[3] - item.bbox[1],

          label: item.label.toUpperCase(),

          confidence: (item.confidence * 100).toFixed(1),

          type: "signal",
        });
      });

      setDetections(mergedDetections);

      drawOverlay(mergedDetections);

      setDetectionCount(mergedDetections.length);

      if (mergedDetections.length > 0) {
        setConfidence(mergedDetections[0].confidence);

        setSeverity("HIGH");
      }

      setAiState("ACTIVE");
    } catch (err) {
      console.error(err);
      setBackendStatus("ERROR");
      setAiState(`${err.name}: ${err.message}`); // ← shows in HUD on phone
    }
  };

  const captureImage = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;

    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;

    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");

    ctx.drawImage(video, 0, 0);
    console.log("🖼 Frame drawn to canvas");

    canvas.toBlob(
      (blob) => {
        if (!blob) return;

        const preview = URL.createObjectURL(blob);

        setCapturedImage(preview);

        /* GPS + Metadata */
        const metadata = {
          gps: gpsData,

          timestamp: new Date().toISOString(),

          confidence,

          severity,
        };

        try {
          onImage(blob, metadata);
        } catch (err) {
          console.error("❌ onImage error:", err);
        }

        console.log("📤 About to send frame");

        sendFrameToBackend(blob);
      },

      "image/jpeg",

      0.95
    );
  }, [gpsData, confidence, severity, onImage]);

  /* =========================================
     AUTO AI DETECTION
  ========================================= */

  const startAutoDetection = () => {
    if (detectionIntervalRef.current) return;

    setAutoDetect(true);

    setAiState("SCANNING");

    captureImage();

    detectionIntervalRef.current = setInterval(() => {
      console.log("📸 Capturing AI frame...");

      captureImage();
    }, AI_INTERVAL);
  };

  const stopAutoDetection = () => {
    clearInterval(detectionIntervalRef.current);

    detectionIntervalRef.current = null;

    setAutoDetect(false);

    setAiState("IDLE");
  };

  /* =========================================
     SIMULATED AI OVERLAY
  ========================================= */

  const simulateAiDetection = () => {
    const fakeDetection = {
      x: Math.random() * 220 + 30,
      y: Math.random() * 100 + 40,
      width: 120,
      height: 70,
      label: "POTHOLE",
      confidence: (Math.random() * 20 + 80).toFixed(1),
    };

    setConfidence(fakeDetection.confidence);

    setDetectionCount((prev) => prev + 1);

    const severityLevels = ["LOW", "MEDIUM", "HIGH"];

    setSeverity(severityLevels[Math.floor(Math.random() * 3)]);

    setDetections([fakeDetection]);

    drawOverlay([fakeDetection]);
  };

  /* =========================================
     DRAW AI OVERLAY
  ========================================= */

  const drawOverlay = (boxes) => {
    const canvas = overlayCanvasRef.current;

    const video = videoRef.current;

    console.log("🎬 Video Ready State:", video.readyState);

    console.log("📐 Video Dimensions:", {
      width: video.videoWidth,
      height: video.videoHeight,
    });
    if (!canvas || !video) return;

    canvas.width = video.clientWidth;

    canvas.height = video.clientHeight;

    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const scaleX = canvas.width / video.videoWidth;
    const scaleY = canvas.height / video.videoHeight;

    boxes.forEach((box) => {
      const x = box.x * scaleX;
      const y = box.y * scaleY;
      const w = box.width * scaleX;
      const h = box.height * scaleY;

      ctx.strokeStyle = "#ef4444";

      ctx.lineWidth = 4;

      ctx.strokeRect(x, y, w, h);

      ctx.fillStyle = "#ef4444";

      ctx.fillRect(x, y - 28, 140, 26);

      ctx.fillStyle = "#ffffff";

      ctx.font = "bold 14px sans-serif";

      ctx.fillText(`${box.label} ${box.confidence}%`, x + 8, y - 10);
    });
  };

  /* =========================================
     FPS COUNTER
  ========================================= */

  useEffect(() => {
    let frames = 0;

    let last = performance.now();

    const loop = () => {
      frames++;

      const now = performance.now();

      if (now >= last + 1000) {
        setFps(frames);

        frames = 0;

        last = now;
      }

      requestAnimationFrame(loop);
    };

    loop();
  }, []);

  /* =========================================
     CLEAR PREVIEW
  ========================================= */

  const clearPreview = () => {
    if (capturedImage) {
      URL.revokeObjectURL(capturedImage);
    }

    setCapturedImage(null);

    setDetections([]);
  };

  /* =========================================
     CLEANUP
  ========================================= */

  useEffect(() => {
    return () => {
      stopCamera();

      if (capturedImage) {
        URL.revokeObjectURL(capturedImage);
      }
    };
  }, []);

  /* =========================================
     STYLES
  ========================================= */

  const glass = "rgba(255,255,255,0.12)";

  /* =========================================
     JSX
  ========================================= */

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      {/* =====================================
          STATUS BAR
      ====================================== */}

      <div
        style={{
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        {[
          {
            icon: <FaWifi />,
            label: backendStatus,
          },

          {
            icon: <FaBolt />,
            label: `${fps} FPS`,
          },

          {
            icon: <FaMapMarkerAlt />,
            label: gpsData ? "GPS LOCKED" : "NO GPS",
          },

          {
            icon: <FaExclamationTriangle />,
            label: `${detectionCount} DETECTIONS`,
          },
        ].map((item, i) => (
          <div
            key={i}
            style={{
              background: glass,
              color: "white",
              padding: "10px 16px",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              backdropFilter: "blur(12px)",
              fontWeight: 700,
              fontSize: "13px",
            }}
          >
            {item.icon}
            {item.label}
          </div>
        ))}
      </div>

      {/* =====================================
    CAMERA VIEW
====================================== */}

      <div
        style={{
          position: "relative",

          display: "flex",
          alignItems: "center",
          justifyContent: "center",

          width: "100%",

          height: fullscreen ? "78vh" : "420px",

          minHeight: "420px",

          borderRadius: "28px",

          overflow: "hidden",

          background: "#0f172a",

          boxShadow: "0 20px 40px rgba(0,0,0,0.35)",
        }}
      >
        <>
          {/* VIDEO */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            onCanPlay={() => {
              console.log("🎥 Video can play");
            }}
            style={{
              position: "absolute",
              top: 0,
              left: 0,

              width: "100%",
              height: "100%",

              objectFit: "cover",

              background: "black",

              display: "block",

              zIndex: 5,
            }}
          />

          {/* AI OVERLAY */}
          <canvas
            ref={overlayCanvasRef}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              zIndex: 15,
            }}
          />

          {/* TOP CONTROLS */}
          <div
            style={{
              position: "absolute",
              top: "16px",
              right: "16px",
              display: "flex",
              gap: "12px",
              zIndex: 20,
            }}
          >
            {[
              {
                icon: <FaSyncAlt />,
                action: switchCamera,
              },

              {
                icon: <FaExpand />,
                action: () => setFullscreen((prev) => !prev),
              },

              {
                icon: <FaTimes />,
                action: stopCamera,
              },
            ].map((item, index) => (
              <button
                key={index}
                onClick={item.action}
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  border: "none",
                  cursor: "pointer",
                  color: "white",
                  background: "rgba(255,255,255,0.14)",
                  backdropFilter: "blur(12px)",
                }}
              >
                {item.icon}
              </button>
            ))}
          </div>

          {/* AI HUD */}
          <div
            style={{
              position: "absolute",
              top: "18px",
              left: "18px",
              zIndex: 20,
              color: "white",
            }}
          >
            <div
              style={{
                background: "rgba(0,0,0,0.45)",
                padding: "14px",
                borderRadius: "18px",
                backdropFilter: "blur(14px)",
                minWidth: "240px",
              }}
            >
              <div
                style={{
                  fontWeight: 800,
                  fontSize: "16px",
                  marginBottom: "8px",
                }}
              >
                Smart AI Vision
              </div>

              <div
                style={{
                  fontSize: "13px",
                  lineHeight: 1.8,
                }}
              >
                AI State: {aiState}
                <br />
                Confidence: {confidence}%
                <br />
                Severity: {severity}
                <br />
                Mode: {captureMode}
              </div>
            </div>
          </div>

          {/* BOTTOM CONTROLS */}
          <div
            style={{
              position: "absolute",
              bottom: "22px",
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              gap: "20px",
              alignItems: "center",
              zIndex: 20,
            }}
          >
            {/* AUTO AI */}
            <button
              onClick={() => (autoDetect ? stopAutoDetection() : startAutoDetection())}
              style={{
                padding: "14px 20px",
                borderRadius: "18px",
                border: "none",
                fontWeight: 700,
                color: "white",
                cursor: "pointer",
                background: autoDetect ? "#ef4444" : "#2563eb",
              }}
            >
              {autoDetect ? "STOP AI" : "START AI"}
            </button>

            {/* CAPTURE */}
            <button
              onClick={captureImage}
              style={{
                width: "82px",
                height: "82px",
                borderRadius: "50%",
                border: "5px solid rgba(255,255,255,0.9)",
                background: "#ef4444",
                cursor: "pointer",
                boxShadow: "0 12px 25px rgba(239,68,68,0.45)",
              }}
            />
          </div>
        </>
      </div>

      {!cameraActive && (
        <button
          onClick={startCamera}
          disabled={loading}
          style={{
            marginTop: "20px",
            padding: "16px 24px",
            borderRadius: "18px",
            border: "none",
            cursor: "pointer",
            color: "white",
            fontWeight: 700,
            background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
          }}
        >
          {loading ? "Starting Camera..." : "Open AI Camera"}
        </button>
      )}

      {/* =====================================
          DETECTION PREVIEW
      ====================================== */}

      {capturedImage && (
        <div
          style={{
            background: "rgba(255,255,255,0.96)",
            borderRadius: "24px",
            padding: "18px",
            boxShadow: "0 14px 35px rgba(0,0,0,0.12)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "14px",
            }}
          >
            <div>
              <div
                style={{
                  fontWeight: 800,
                  color: "#0f172a",
                }}
              >
                AI Detection Result
              </div>

              <div
                style={{
                  fontSize: "13px",
                  color: "#64748b",
                  marginTop: "4px",
                }}
              >
                Detection confidence: {confidence}%
              </div>
            </div>

            <button
              onClick={clearPreview}
              style={{
                border: "none",
                background: "transparent",
                color: "#ef4444",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              Remove
            </button>
          </div>

          <img
            src={capturedImage}
            alt="Captured"
            style={{
              width: "100%",
              height: "240px",
              objectFit: "cover",
              borderRadius: "18px",
            }}
          />

          {/* ANALYTICS */}
          <div
            style={{
              marginTop: "16px",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
              gap: "14px",
            }}
          >
            {[
              {
                title: "Severity",
                value: severity,
              },

              {
                title: "AI State",
                value: aiState,
              },

              {
                title: "GPS",
                value: gpsData ? "LOCKED" : "NO SIGNAL",
              },

              {
                title: "Internet",
                value: isOnline ? "ONLINE" : "OFFLINE",
              },
            ].map((item, index) => (
              <div
                key={index}
                style={{
                  background: "#f8fafc",
                  padding: "14px",
                  borderRadius: "16px",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    color: "#64748b",
                  }}
                >
                  <div>
                    <strong>{item.title}</strong>

                    <div
                      style={{
                        fontSize: 12,
                        opacity: 0.7,
                        marginTop: 2,
                      }}
                    >
                      {item.address}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: "6px",
                    fontWeight: 700,
                    color: "#0f172a",
                  }}
                >
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* HIDDEN CANVAS */}
      <canvas
        ref={canvasRef}
        style={{
          display: "none",
        }}
      />
    </div>
  );
};

export default CameraCapture;
