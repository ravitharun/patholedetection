import React, { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Navbar from "./Navbar";
import Loader from "./Loader";
import HereMap from "./HereMap";
import CameraCapture from "./CameraCapture";
import Mobileerror from "./Mobileerror";
import MobileUseAlert from "./MobileUseAlert";

import { API_BASE } from "../ai_transport_backend/config/api";

const DEFAULT_LOCATION = {
  lat: 12.9716,
  lng: 77.5946,
  accuracy: 5000,
};

const App = () => {
  /* -------------------------------------------------------------------------- */
  /*                                    STATE                                   */
  /* -------------------------------------------------------------------------- */

  const [position, setPosition] = useState(DEFAULT_LOCATION);

  const [error, setError] = useState(null);

  const [isLoadingLocation, setIsLoadingLocation] = useState(true);

  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const [showInfo, setShowInfo] = useState(false);

  const [capturedUrl, setCapturedUrl] = useState(null);

  const [obstacles, setObstacles] = useState([]);

  const [selectedObstacle, setSelectedObstacle] = useState(null);

  const [stats, setStats] = useState({
    total: 0,
    uploaded: 0,
    detected: 0,
  });

  const watchIdRef = useRef(null);

  const [showCameraPanel, setShowCameraPanel] = useState(false);

  const [showStatusPanel, setShowStatusPanel] = useState(true);

  const [compactNavigation, setCompactNavigation] = useState(false);

  /* -------------------------------------------------------------------------- */
  /*                              GEOLOCATION HANDLER                           */
  /* -------------------------------------------------------------------------- */

  const handleSuccess = (p) => {
    const updatedPosition = {
      lat: p.coords.latitude,
      lng: p.coords.longitude,
      accuracy: p.coords.accuracy,
      speed: p.coords.speed || 0,
      heading: p.coords.heading || 0,
    };

    setPosition(updatedPosition);

    setIsLoadingLocation(false);

    setError(null);
  };

  const handleError = (err) => {
    console.error(err);

    setError(err.message || "Location unavailable");

    setPosition(DEFAULT_LOCATION);

    setIsLoadingLocation(false);
  };

  /* -------------------------------------------------------------------------- */
  /*                           ONLINE / OFFLINE LISTENER                        */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    const goOnline = () => {
      setIsOnline(true);

      toast.success("Internet connected", {
        position: "top-center",
      });
    };

    const goOffline = () => {
      setIsOnline(false);

      toast.error("You are offline", {
        position: "top-center",
      });
    };

    window.addEventListener("online", goOnline);

    window.addEventListener("offline", goOffline);

    return () => {
      window.removeEventListener("online", goOnline);

      window.removeEventListener("offline", goOffline);
    };
  }, []);

  /* -------------------------------------------------------------------------- */
  /*                           LOCATION PERMISSION CHECK                        */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    if (!navigator.permissions) {
      requestLocation();
      return;
    }

    let permissionStatus = null;

    const handlePermission = () => {
      if (!permissionStatus) return;

      if (permissionStatus.state === "granted" || permissionStatus.state === "prompt") {
        requestLocation();
      }

      if (permissionStatus.state === "denied") {
        setError("Location permission denied");

        setPosition(DEFAULT_LOCATION);

        setIsLoadingLocation(false);
      }
    };

    navigator.permissions
      .query({ name: "geolocation" })
      .then((status) => {
        permissionStatus = status;

        handlePermission();

        permissionStatus.onchange = handlePermission;
      })
      .catch(() => {
        requestLocation();
      });

    return () => {
      if (permissionStatus) {
        permissionStatus.onchange = null;
      }
    };
  }, []);

  /* -------------------------------------------------------------------------- */
  /*                              REQUEST LOCATION                              */
  /* -------------------------------------------------------------------------- */

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");

      setPosition(DEFAULT_LOCATION);

      setIsLoadingLocation(false);

      return;
    }

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    watchIdRef.current = navigator.geolocation.watchPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    });
  };

  /* -------------------------------------------------------------------------- */
  /*                                  CLEANUP                                   */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }

      if (capturedUrl) {
        URL.revokeObjectURL(capturedUrl);
      }
    };
  }, [capturedUrl]);

  /* -------------------------------------------------------------------------- */
  /*                               CAMERA HANDLING                              */
  /* -------------------------------------------------------------------------- */

  const handleImage = (blob) => {
    if (!blob) return;

    if (capturedUrl) {
      URL.revokeObjectURL(capturedUrl);
    }

    const localUrl = URL.createObjectURL(blob);

    setCapturedUrl(localUrl);
  };

  /* -------------------------------------------------------------------------- */
  /*                              OBSTACLE DETECTION                            */
  /* -------------------------------------------------------------------------- */

  const uploadCaptured = async () => {
    const isMobileAllowed = localStorage.getItem("isuser_Mobile") === "true";

    if (!isMobileAllowed) {
      setShowInfo(true);
      return;
    }

    if (!capturedUrl) {
      toast.info("Capture image first", {
        position: "top-center",
      });

      return;
    }

    if (!position) {
      toast.error("Location unavailable", {
        position: "top-center",
      });

      return;
    }

    try {
      setStats((prev) => ({
        ...prev,
        uploaded: prev.uploaded + 1,
      }));

      const blob = await fetch(capturedUrl).then((res) => res.blob());

      const formData = new FormData();

      formData.append("file", blob, "capture.jpg");

      formData.append("lat", String(position.lat));

      formData.append("lng", String(position.lng));

      console.log("FULL API URL:", `${API_BASE}/api/pothole/detect/`);

      const response = await fetch(`${API_BASE}/api/pothole/detect/`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();

      const detections = Array.isArray(data?.detections) ? data.detections : [];

      const obstacleData = {
        id: Date.now(),

        pos: {
          lat: position.lat,
          lng: position.lng,
        },

        fileUrl: data?.url || capturedUrl,

        detections,

        createdAt: new Date().toISOString(),

        severity: detections.length >= 3 ? "high" : detections.length >= 1 ? "medium" : "low",
      };

      setObstacles((prev) => [obstacleData, ...prev]);

      setSelectedObstacle(obstacleData);

      setStats((prev) => ({
        total: prev.total + 1,
        uploaded: prev.uploaded,
        detected: prev.detected + detections.length,
      }));

      if (detections.length === 0) {
        toast.info("No obstacles detected", {
          position: "top-center",
        });
      } else {
        toast.success(`${detections.length} obstacle(s) detected`, {
          position: "top-center",
        });
      }

      URL.revokeObjectURL(capturedUrl);

      setCapturedUrl(null);
    } catch (err) {
      console.error(err);

      toast.error("Upload failed", {
        position: "top-center",
      });
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                                 DASHBOARD                                  */
  /* -------------------------------------------------------------------------- */

  const obstacleCountText = useMemo(() => {
    if (obstacles.length === 0) {
      return "No obstacles detected";
    }

    return `${obstacles.length} obstacle${obstacles.length > 1 ? "s" : ""} detected`;
  }, [obstacles]);

  /* -------------------------------------------------------------------------- */
  /*                                   RENDER                                   */
  /* -------------------------------------------------------------------------- */

  return (
    <div className="app-root">
      <Navbar />

      <MobileUseAlert />

      {showInfo && <Mobileerror />}

      {!isOnline && <div className="offline-banner">⚠️ You are offline</div>}

      {/* ------------------------------------------------------------------ */}
      {/*                             MAP SECTION                             */}
      {/* ------------------------------------------------------------------ */}

      <div className="map-wrapper">
        {isLoadingLocation ? (
          <Loader loadername="Getting your live location..." />
        ) : (
          <HereMap
            LAT={position?.lat}
            LONG={position?.lng}
            accuracy={position?.accuracy}
            markers={obstacles}
            obstacles={obstacles}
            currentObstacle={selectedObstacle}
          />
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/*                         SMART STATUS PANEL                          */}
      {/* ------------------------------------------------------------------ */}

      <div className="smart-status-panel">
        <div className="status-card">
          <span className="status-title">AI Navigation Status</span>

          <span className="status-value">{obstacleCountText}</span>
        </div>

        <div className="status-grid">
          <div className="mini-status-card">
            <span>Total Reports</span>
            <strong>{stats.total}</strong>
          </div>

          <div className="mini-status-card">
            <span>AI Detections</span>
            <strong>{stats.detected}</strong>
          </div>

          <div className="mini-status-card">
            <span>GPS Accuracy</span>
            <strong>{position?.accuracy ? `${Math.round(position.accuracy)}m` : "N/A"}</strong>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/*                             CAMERA PANEL                           */}
      {/* ------------------------------------------------------------------ */}

      <button
        className="floating-fab camera-fab"
        onClick={() => setShowCameraPanel((prev) => !prev)}
      >
        {showCameraPanel ? "✕" : "📷"}
      </button>

      <div className={`floating-camera-panel ${showCameraPanel ? "camera-open" : "camera-closed"}`}>
        {showCameraPanel && (
          <>
            <CameraCapture onImage={handleImage} isOnline={isOnline} />

            <div className="camera-actions-modern">
              <button className="primary-action-btn" onClick={uploadCaptured}>
                Upload Detection
              </button>

              <button
                className="secondary-action-btn"
                onClick={() => {
                  if (capturedUrl) {
                    URL.revokeObjectURL(capturedUrl);
                  }

                  setCapturedUrl(null);
                }}
              >
                Clear
              </button>
            </div>

            {capturedUrl && (
              <div className="preview-section">
                <img src={capturedUrl} alt="Captured" className="preview-image" />
              </div>
            )}

            {error && <div className="error-text-modern">{error}</div>}
          </>
        )}
      </div>

      <ToastContainer />
    </div>
  );
};

export default App;
