
// import React, { useEffect, useRef, useState } from "react";
// import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
// import L from "leaflet";
// import "leaflet/dist/leaflet.css";
// import CameraCapture from "./CameraCapture";
// import "./App.css";
// import { ToastContainer, toast } from 'react-toastify';
// import HereMap from "./HereMap";

// /* 🔄 Fly to current position */
// function FlyTo({ position }) {
//   const map = useMap();

//   useEffect(() => {
//     if (position) {
//       map.flyTo([position.lat, position.lng], 17, { duration: 0.8 });
//     }
//   }, [position, map]);

//   return null;
// }


// const App = () => {
//   const HERE_API_KEY = import.meta.env.VITE_HERE_API_KEY;

//   const [position, setPosition] = useState(null);
//   const [error, setError] = useState(null);
//   const [capturedUrl, setCapturedUrl] = useState(null);
//   const [captures, setCaptures] = useState([]);
//   const [isOnline, setIsOnline] = useState(navigator.onLine);

//   const watchIdRef = useRef(null);
//   // console.log(position.lat,position.lng,'position')
//   /* 🌐 Online / Offline */
//   useEffect(() => {
//     const on = () => setIsOnline(true);
//     const off = () => setIsOnline(false);

//     window.addEventListener("online", on);
//     window.addEventListener("offline", off);

//     return () => {
//       window.removeEventListener("online", on);
//       window.removeEventListener("offline", off);
//     };
//   }, []);

//   /* 📍 Geolocation */
//   useEffect(() => {
//     if (!navigator.geolocation) {
//       setError("Geolocation not supported");
//       return;
//     }

//     navigator.geolocation.getCurrentPosition(
//       (p) =>
//         setPosition({
//           lat: p.coords.latitude,
//           lng: p.coords.longitude,
//         }),
//       (err) => setError(err.message),
//       { enableHighAccuracy: true }
//     );

//     watchIdRef.current = navigator.geolocation.watchPosition(
//       (p) =>
//         setPosition({
//           lat: p.coords.latitude,
//           lng: p.coords.longitude,
//         }),
//       (err) => setError(err.message),
//       { enableHighAccuracy: true }
//     );

//     return () => {
//       if (watchIdRef.current !== null) {
//         navigator.geolocation.clearWatch(watchIdRef.current);
//       }
//     };
//   }, []);

//   /* 📸 Handle image preview */
//   const handleImage = (blob) => {
//     if (!blob) return;

//     if (capturedUrl) {
//       URL.revokeObjectURL(capturedUrl);
//     }

//     const url = URL.createObjectURL(blob);
//     setCapturedUrl(url);
//   };

//   /* ⬆️ Upload placeholder */
//   const uploadCaptured = () => {
//     if (!capturedUrl || !position) {
//       toast.info("Capture The image first to Upload", { position: "top-center" });
//       return;
//     }

//     // Simulate backend success
//     setCaptures((prev) => [
//       ...prev,
//       { pos: position, fileUrl: capturedUrl },
//     ]);

//     toast.success("Image saved on map!", { position: "top-center" });
//     setCapturedUrl(null);
//   };

//   /* 📍 Leaflet marker icon */
//   const icon = L.icon({
//     iconUrl:
//       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
//     shadowUrl:
//       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
//     iconSize: [25, 41],
//     iconAnchor: [12, 41],
//   });

//   const redIcon = L.icon({
//     iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
//     shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
//     iconSize: [25, 41],
//     iconAnchor: [12, 41],
//   });



//   console.log(captures, 'captures')














//   // jsx code ui
//   return (
//     <>
//       <HereMap
//         LAT={position?.lat}
//         LONG={position?.lng}
//         captures={captures}
//       />



//       {captures.length === 0 ? (
//         <div
//           style={{
//             position: "fixed",
//             top: "20px",
//             left: "50%",
//             transform: "translateX(-50%)",
//             backgroundColor: "#ffffff",
//             padding: "10px 20px",
//             borderRadius: "12px",
//             boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
//             fontWeight: "600",
//             color: "#555",
//             zIndex: 2000
//           }}
//         >
//           🚫 No potholes detected
//         </div>
//       ) : (
//         <div
//           style={{
//             position: "fixed",
//             top: "20px",
//             left: "50%",
//             transform: "translateX(-50%)",
//             backgroundColor: "#ff4d4f",
//             color: "white",
//             padding: "10px 20px",
//             borderRadius: "12px",
//             boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
//             fontWeight: "600",
//             zIndex: 2000
//           }}
//         >
//           🚧 {captures.length} Pothole{captures.length > 1 ? "s" : ""} Detected
//         </div>
//       )}
//       {/* 🔴 Offline Banner */}
//       {!isOnline && (
//         <div
//           style={{
//             position: "fixed",
//             top: 0,
//             width: "100%",
//             background: "crimson",
//             color: "white",
//             padding: "8px",
//             textAlign: "center",
//             zIndex: 2000,
//           }}
//         >
//           You are offline
//         </div>
//       )}
//       <ToastContainer />
//       <div style={{ height: "100vh", width: "100vw" }}>
//         {/* 📸 Camera Panel */}
//         <div
//           style={{
//             position: "absolute",
//             zIndex: 1200,
//             right: 12,
//             top: 12,
//             background: "rgba(255,255,255,0.95)",
//             borderRadius: 8,
//             boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
//             padding: 8,
//           }}
//         >
//           <CameraCapture onImage={handleImage} isOnline={isOnline} />

//           <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
//             <button onClick={uploadCaptured} >
//               Upload
//             </button>

//             <button
//               onClick={() => {
//                 if (capturedUrl) {
//                   URL.revokeObjectURL(capturedUrl);
//                   setCapturedUrl(null);
//                 }
//               }}
//             // disabled={!capturedUrl}
//             >
//               Clear
//             </button>
//           </div>

//           {/* {capturedUrl && (
//             <div style={{ marginTop: 8 }}>
//               <img
//                 src={capturedUrl}
//                 alt="preview"
//                 style={{ maxWidth: 220, borderRadius: 6 }}
//               />
//             </div>
//           )} */}
//           {/* error message */}
//           {error && (
//             <div style={{ color: "crimson", marginTop: 8 }}>
//               {error}
//             </div>
//           )}
//         </div>

//         {/* 🗺️ Map */}

//       </div>
//     </>
//   );
// };

// export default App; 
import React, { useEffect, useRef, useState } from "react";
import CameraCapture from "./CameraCapture";
import "./App.css";
import { ToastContainer, toast } from "react-toastify";
import HereMap from "./HereMap";

const App = () => {
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);
  const [capturedUrl, setCapturedUrl] = useState(null);
  const [captures, setCaptures] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const watchIdRef = useRef(null);

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

  /* 📍 Live Location */
  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (p) =>
        setPosition({
          lat: p.coords.latitude,
          lng: p.coords.longitude,
        }),
      (err) => setError(err.message),
      { enableHighAccuracy: true }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  /* 📸 Handle image preview */
  const handleImage = (blob) => {
    if (!blob) return;

    if (capturedUrl) {
      URL.revokeObjectURL(capturedUrl);
    }

    const url = URL.createObjectURL(blob);
    setCapturedUrl(url);
  };

  /* ⬆️ Upload simulation */
  const uploadCaptured = () => {
    if (!capturedUrl || !position) {
      toast.info("Capture image first", { position: "top-center" });
      return;
    }

    setCaptures((prev) => [
      ...prev,
      { pos: position, fileUrl: capturedUrl },
    ]);

    toast.success("Image saved on map!", { position: "top-center" });
    setCapturedUrl(null);
  };

  return (
    <>
      {/* ✅ ONLY ONE MAP */}
      <HereMap
        LAT={position?.lat}
        LONG={position?.lng}
        markers={captures}
      />

      {/* Status Banner */}
      {captures.length === 0 ? (
        <div className="status-box">
          🚫 No potholes detected
        </div>
      ) : (
        <div className="status-box danger">
          🚧 {captures.length} Pothole
          {captures.length > 1 ? "s" : ""} Detected
        </div>
      )}

      {!isOnline && (
        <div className="offline-banner">
          You are offline
        </div>
      )}

      <ToastContainer />

      {/* Camera Panel */}
      <div className="camera-panel">
        <CameraCapture onImage={handleImage} isOnline={isOnline} />

        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button onClick={uploadCaptured}>Upload</button>
          <button onClick={() => setCapturedUrl(null)}>Clear</button>
        </div>

        {error && (
          <div style={{ color: "crimson", marginTop: 8 }}>
            {error}
          </div>
        )}
      </div>
    </>
  );
};

export default App;