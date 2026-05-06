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
  const [ShowInfo, setshowInfo] = useState(false);

  const watchIdRef = useRef(null);

  const DEFAULT_LOCATION = {
    lat: 12.9716,
    lng: 77.5946,
  };

  const handleSuccess = (p) => {
    setPosition({
      lat: p.coords.latitude,
      lng: p.coords.longitude,
      accuracy: p.coords.accuracy,
    });
  };

  const handleError = (err) => {
    setError(err.message);
  };

  /* 🌐 Online / Offline */
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

  /* 📍 Permission Watch */
  useEffect(() => {
    if (!navigator.permissions) return;

    let permissionStatus = null;

    const updatePermission = () => {
      if (!permissionStatus) return;

      if (permissionStatus.state === "granted") {
        requestLocation();
      }
    };

    navigator.permissions
      .query({ name: "geolocation" })
      .then((status) => {
        permissionStatus = status;
        updatePermission();
        permissionStatus.onchange = updatePermission;
      })
      .catch(() => {
        // ignore
      });

    return () => {
      if (permissionStatus) {
        permissionStatus.onchange = null;
      }
    };
  }, []);

  /* 📍 Request Location */
  const requestLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      setPosition(DEFAULT_LOCATION);
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 30000,
      maximumAge: 5000,
    });
  };

  /* 📍 Live Location */
  useEffect(() => {
    requestLocation();

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  /* 🖼️ Cleanup Captured Blob URL */
  useEffect(() => {
    return () => {
      if (capturedUrl) {
        URL.revokeObjectURL(capturedUrl);
      }
    };
  }, [capturedUrl]);

  /* 📷 Handle Camera Capture */
  const handleImage = (blob) => {
    if (!blob) return;

    if (capturedUrl) {
      URL.revokeObjectURL(capturedUrl);
    }

    setCapturedUrl(URL.createObjectURL(blob));
  };

  /* 📱 Mobile Check */
  const isMobileAllowed = localStorage.getItem("isuser_Mobile") === "true";

  /* ⬆️ Upload Image */
  const uploadCaptured = async () => {
    if (!isMobileAllowed) {
      setshowInfo(true);
      return;
    }

    if (!capturedUrl || !position) {
      toast.info("Capture image first", {
        position: "top-center",
      });
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

      if (!res.ok) {
        throw new Error("Upload failed");
      }

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
        toast.info("No potholes detected!", {
          position: "top-center",
        });
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

      toast.error("Upload failed!", {
        position: "top-center",
      });
    }
  };

  return (
    <>
      <Navbar />

      <MobileUseAlert />

      {ShowInfo && <Mobileerror />}

      {/* 📊 Status Banner */}
      {captures.length === 0 ? (
        <div className="status-box">🚫 No potholes detected</div>
      ) : (
        <div className="status-box danger">
          🚧 {captures.length} Pothole
          {captures.length > 1 ? "s" : ""} Detected
        </div>
      )}

      {/* 🗺️ HERE MAP */}
      {!position ? (
        <Loader loadername="Getting your Live Location..." />
      ) : (
        <HereMap
          LAT={position.lat}
          LONG={position.lng}
          accuracy={position.accuracy}
          markers={captures}
        />
      )}

      {/* 🌐 Offline Banner */}
      {!isOnline && <div className="offline-banner">You are offline</div>}

      <ToastContainer />

      {/* 📷 Camera Panel */}
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
