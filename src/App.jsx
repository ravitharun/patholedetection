import React, { useEffect, useRef, useState } from "react";
import CameraCapture from "./CameraCapture";
import "./App.css";
import { ToastContainer, toast } from "react-toastify";
import HereMap from "./HereMap";
import Navbar from "./Navbar";
import Mobileerror from "./Mobileerror";
import Loader from "./Loader";
import MobileUseAlert from "./MobileUseAlert";

const App = () => {
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);
  const [capturedUrl, setCapturedUrl] = useState(null);
  const [captures, setCaptures] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showInfo, setShowInfo] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);

  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [userAcceptedLive, setUserAcceptedLive] = useState(false);

  const watchIdRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);

    window.addEventListener("online", on);
    window.addEventListener("offline", off);

    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (p) => {
        setPosition({
          lat: p.coords.latitude,
          lng: p.coords.longitude,
          accuracy: p.coords.accuracy,
        });
      },
      (err) => setError(err.message),
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000,
      }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      if (capturedUrl) {
        URL.revokeObjectURL(capturedUrl);
      }
    };
  }, [capturedUrl]);

  const handleImage = (blob) => {
    if (!blob) return;

    if (capturedUrl) {
      URL.revokeObjectURL(capturedUrl);
    }

    setCapturedUrl(URL.createObjectURL(blob));
  };

  const uploadCaptured = async () => {
    if (!capturedUrl || !position) {
      toast.info("Capture image first", { position: "top-center" });
      return;
    }

    try {
      const blob = await fetch(capturedUrl).then((res) => res.blob());

      const formData = new FormData();
      formData.append("file", blob, "capture.jpg");
      formData.append("lat", String(position.lat));
      formData.append("lng", String(position.lng));

      const res = await fetch("http://127.0.0.1:8000/api/pothole/detect/", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      const detections = Array.isArray(data?.detections) ? data.detections : [];

      setCaptures((prev) => [
        ...prev,
        {
          pos: {
            lat: position.lat,
            lng: position.lng,
          },
          fileUrl: data?.url || null,
          detections,
        },
      ]);

      if (detections.length === 0) {
        toast.info("No potholes detected!", { position: "top-center" });
      } else {
        toast.success(`${detections.length} pothole(s) detected!`, {
          position: "top-center",
        });
      }

      if (capturedUrl) {
        URL.revokeObjectURL(capturedUrl);
      }
      setCapturedUrl(null);
    } catch (err) {
      console.error("Upload failed:", err);
      toast.error("Upload failed!", { position: "top-center" });
    }
  };

  const handleLiveLocationToggle = () => {
    setUserAcceptedLive(true);
    setFromLocation("");
  };

  const handleCancelLiveLocation = () => {
    setUserAcceptedLive(false);
  };

  const handleBackdropClick = (e) => {
    if (e.target === modalRef.current) {
      setShowLocationModal(false);
    }
  };

  const handleRouteSubmit = (e) => {
    e.preventDefault();

    if (!toLocation.trim()) {
      toast.info("Please enter destination");
      return;
    }

    if (!position) {
      toast.info("Live location not available yet");
      return;
    }

    if (!userAcceptedLive && !fromLocation.trim()) {
      toast.info("Please enter From location or use live location");
      return;
    }

    toast.success("Navigation details saved", { position: "top-center" });
    setShowLocationModal(false);
  };

  const resolvedFromLocation = userAcceptedLive
    ? `${position?.lat ?? ""}, ${position?.lng ?? ""}`
    : fromLocation;

  return (
    <>
      <Navbar />
      <MobileUseAlert />

      {showLocationModal && (
        <div
          className="location-modal-overlay"
          ref={modalRef}
          onClick={handleBackdropClick}
        >
          <div className="location-modal">
            <div className="modal-header">
              <h2 style={{ color: "black" }}>📍 Set Your Route</h2>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowLocationModal(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleRouteSubmit} className="location-form">
              {!userAcceptedLive ? (
                <button
                  type="button"
                  className="live-location-btn active"
                  onClick={handleLiveLocationToggle}
                >
                  📍 Use Live Location
                </button>
              ) : (
                <button
                  type="button"
                  className="live-location-btn cancel"
                  onClick={handleCancelLiveLocation}
                >
                  ❌ Cancel Live Location
                </button>
              )}

              {!userAcceptedLive ? (
                <div className="form-group">
                  <label htmlFor="from-location" style={{ color: "black" }}>
                    From Location
                  </label>
                  <input
                    id="from-location"
                    type="text"
                    placeholder="Enter starting point..."
                    value={fromLocation}
                    style={{ color: "black" }}
                    onChange={(e) => setFromLocation(e.target.value)}
                    autoComplete="off"
                  />
                </div>
              ) : (
                <div style={{ color: "black" }}>
                  Live Location Added
                  {position && (
                    <div style={{ marginTop: "6px", fontSize: "14px" }}>
                      Lat: {position.lat.toFixed(6)}, Lng: {position.lng.toFixed(6)}
                    </div>
                  )}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="to-location" style={{ color: "black" }}>
                  To Location
                </label>
                <input
                  id="to-location"
                  style={{ color: "black" }}
                  type="text"
                  placeholder="Enter destination..."
                  value={toLocation}
                  onChange={(e) => setToLocation(e.target.value)}
                  autoComplete="off"
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowLocationModal(false)}
                >
                  Skip
                </button>
                <button type="submit" className="btn-primary">
                  Start Navigation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* <button
        className="route-btn"
        onClick={() => setShowLocationModal((prev) => !prev)}
      >
        Route
      </button> */}

      {showInfo && <Mobileerror />}

      {!position ? (
        <Loader loadername="Getting your Live Location..." />
      ) : (
        <HereMap
          LAT={position.lat}
          LONG={position.lng}
          accuracy={position.accuracy}
          markers={captures}
          FromLocation={resolvedFromLocation}
          ToLocation={toLocation}
          userAcceptedlivelatlong={userAcceptedLive ? position : null}
        />
      )}

      <div className={`status-box ${captures.length > 0 ? "danger" : ""}`}>
        {captures.length === 0
          ? "🚫 No potholes detected"
          : `🚧 ${captures.length} Pothole${captures.length > 1 ? "s" : ""} Detected`}
      </div>

      {!isOnline && <div className="offline-banner">You are offline</div>}

      <ToastContainer />

      <div className="camera-panel">
        <CameraCapture onImage={handleImage} isOnline={isOnline} />
        <div className="camera-actions">
          <button onClick={uploadCaptured}>Upload</button>
          <button
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
        {error && <div className="error-text">{error}</div>}
      </div>
    </>
  );
};

export default App;
