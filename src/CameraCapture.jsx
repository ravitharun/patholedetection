// src/CameraCapture.jsx
import React, { useRef, useState } from "react";
import "./CameraCapture.css";

export default function CameraCapture({
  onUploadSuccess,
  isOnline = true,
  uploadUrl = "/api/upload",
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  async function startCamera() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setIsRunning(true);
    } catch {
      setError("Camera permission denied");
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsRunning(false);
  }

  async function captureAndUpload() {
    if (!videoRef.current) return;

    const canvas = canvasRef.current;
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0);

    const blob = await new Promise((res) =>
      canvas.toBlob(res, "image/jpeg", 0.85)
    );

    if (!isOnline) {
      setError("Offline: cannot upload");
      return;
    }

    try {
      setIsUploading(true);
      const fd = new FormData();
      fd.append("photo", blob);

      const res = await fetch(uploadUrl, {
        method: "POST",
        body: fd,
      });

      if (!res.ok) throw new Error("Upload failed");

      const json = await res.json();
      onUploadSuccess?.(json);
    } catch (e) {
      setError(e.message);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="camera-root">
      <video ref={videoRef} className="camera-video" />

      <div className="camera-controls">
        <button
          className="camera-btn"
          onClick={startCamera}
          disabled={isRunning}
        >
          Start
        </button>

        <button
          className="camera-btn primary"
          onClick={captureAndUpload}
          disabled={!isRunning || isUploading}
        >
          {isUploading ? "Uploading…" : "Capture"}
        </button>

        <button
          className="camera-btn"
          onClick={stopCamera}
          disabled={!isRunning}
        >
          Stop
        </button>
      </div>

      {error && <div className="camera-error">{error}</div>}

      <canvas ref={canvasRef} className="camera-canvas" />
    </div>
  );
}
