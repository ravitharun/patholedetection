import React, { useEffect, useRef, useState } from "react";

import BackButton from "./BackButton";
import Navbar from "./Navbar";
import HereMap from "./HereMap";
import Waether from "./Waether";

function Addnearby() {
  /* =========================================
     STATES
  ========================================= */

  const [position, setPosition] = useState(null);

  const [gpsStatus, setGpsStatus] = useState("Fetching location...");

  const [error, setError] = useState("");

  const [selectedFile, setSelectedFile] = useState(null);

  const [preview, setPreview] = useState(null);

  const [loading, setLoading] = useState(false);

  const [dragActive, setDragActive] = useState(false);

  const [formData, setFormData] = useState({
    size: "Medium",
    description: "",
  });

  const fileInputRef = useRef(null);

  /* =========================================
     GEOLOCATION
  ========================================= */

  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsStatus("GPS not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (p) => {
        setPosition({
          lat: p.coords.latitude,
          lng: p.coords.longitude,
          accuracy: p.coords.accuracy,
        });

        setGpsStatus("GPS Locked");
      },

      (err) => {
        console.error(err);

        switch (err.code) {
          case 1:
            setError("Location permission denied");
            break;

          case 2:
            setError("Location unavailable");
            break;

          case 3:
            setError("GPS timeout");
            break;

          default:
            setError("Unknown GPS error");
        }
      },

      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 5000,
      }
    );
  }, []);

  /* =========================================
     FILE SELECT
  ========================================= */

  const handleFileSelect = (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload image only");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Max file size is 5MB");
      return;
    }

    setSelectedFile(file);

    const objectUrl = URL.createObjectURL(file);

    setPreview(objectUrl);
  };

  /* =========================================
     DROP HANDLERS
  ========================================= */

  const handleDrop = (e) => {
    e.preventDefault();

    setDragActive(false);

    const file = e.dataTransfer.files[0];

    handleFileSelect(file);
  };

  /* =========================================
     SUBMIT
  ========================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      alert("Please upload image");
      return;
    }

    if (!formData.description.trim()) {
      alert("Please enter description");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        ...formData,
        gps: position,
        timestamp: new Date().toISOString(),
      };

      console.log("Submitting", payload);

      /* BACKEND API LATER */

      await new Promise((resolve) => setTimeout(resolve, 2000));

      alert("Report submitted successfully");
    } catch (err) {
      console.error(err);

      alert("Submission failed");
    } finally {
      setLoading(false);
    }
  };

  /* =========================================
     RESET
  ========================================= */

  const resetForm = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setPreview(null);

    setSelectedFile(null);

    setFormData({
      size: "Medium",
      description: "",
    });
  };

  /* =========================================
     JSX
  ========================================= */

  return (
    <>
      <Navbar page="nearby" />

      <div className="nearby-root">
        {/* HEADER */}
        <div className="nearby-header">
          <div>
            <h1>AI Pothole Reporting</h1>

            <p>Smart road issue detection & reporting</p>
          </div>

          <div className="gps-badge">
            <span className="gps-dot"></span>

            {gpsStatus}
          </div>
        </div>

        {/* MAIN CARD */}
        <div className="nearby-card">
          <BackButton />

          <form onSubmit={handleSubmit}>
            <div className="nearby-grid">
              {/* LEFT */}
              <div>
                {/* UPLOAD */}
                <div className="section-card">
                  <h2>Upload Evidence</h2>

                  <div
                    className={`upload-box ${dragActive ? "active" : ""}`}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragActive(true);
                    }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={handleDrop}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => handleFileSelect(e.target.files[0])}
                    />

                    {preview ? (
                      <>
                        <img src={preview} alt="Preview" className="preview-image" />

                        <div className="upload-success">✅ {selectedFile?.name}</div>
                      </>
                    ) : (
                      <>
                        <div className="upload-icon">📸</div>

                        <h3>Drag & Drop</h3>

                        <p>Upload pothole image</p>
                      </>
                    )}
                  </div>
                </div>

                {/* GPS */}
                <div className="section-card">
                  <h2>Live GPS</h2>

                  <div className="gps-card">
                    {position ? (
                      <>
                        <p>Latitude: {position.lat.toFixed(6)}</p>

                        <p>Longitude: {position.lng.toFixed(6)}</p>

                        <p>Accuracy: {Math.round(position.accuracy)} m</p>
                      </>
                    ) : (
                      <p>Fetching GPS...</p>
                    )}

                    {error && <div className="error-box">⚠️ {error}</div>}
                  </div>
                </div>

                {/* WEATHER */}
                {position && <Waether lat={position} />}
              </div>

              {/* RIGHT */}
              <div>
                {/* ANALYTICS */}
                <div className="analytics-grid">
                  <div className="analytics-card">
                    <span>Upload</span>
                    <h3>{selectedFile ? "READY" : "WAITING"}</h3>
                  </div>

                  <div className="analytics-card">
                    <span>GPS</span>
                    <h3>{position ? "LOCKED" : "SEARCHING"}</h3>
                  </div>

                  <div className="analytics-card">
                    <span>AI STATUS</span>
                    <h3>ACTIVE</h3>
                  </div>

                  <div className="analytics-card">
                    <span>NETWORK</span>
                    <h3>ONLINE</h3>
                  </div>
                </div>

                {/* SIZE */}
                <div className="section-card">
                  <h2>Pothole Size</h2>

                  <select
                    value={formData.size}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        size: e.target.value,
                      })
                    }
                    className="modern-input"
                  >
                    <option value="Small">Small</option>

                    <option value="Medium">Medium</option>

                    <option value="Large">Large</option>
                  </select>
                </div>

                {/* DESCRIPTION */}
                <div className="section-card">
                  <h2>Description</h2>

                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        description: e.target.value,
                      })
                    }
                    className="modern-textarea"
                    placeholder="Describe pothole severity, traffic condition, exact road issue..."
                  />
                </div>

                {/* MAP */}
                <div className="section-card">
                  <h2>Live Map</h2>

                  <div className="map-wrapper">
                    {position ? (
                      <HereMap
                        LAT={position.lat}
                        LONG={position.lng}
                        accuracy={position.accuracy}
                      />
                    ) : (
                      <div className="map-loading">Loading map...</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="action-row">
              <button type="button" className="secondary-btn" onClick={resetForm}>
                Reset
              </button>

              <button type="submit" className="primary-btn" disabled={loading}>
                {loading ? "Submitting..." : "Submit Report"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default Addnearby;
