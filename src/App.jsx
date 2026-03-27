
// import React, { useEffect, useRef, useState } from "react";
// import CameraCapture from "./CameraCapture";
// import "./App.css";
// import { ToastContainer, toast } from "react-toastify";
// import HereMap from "./HereMap";
// import Navbar from "./Navbar";
// import { check_IsmobileView } from "./MiniDb";
// import Mobileerror from "./Mobileerror";
// import Loader from "./Loader";
// import Waether from "./Waether";
// import UserLocationStatus from "./UserLocationStatus";
// import MobileUseAlert from "./MobileUseAlert";

// const App = () => {
//   const [position, setPosition] = useState([]);
//   const [error, setError] = useState(null);
//   const [capturedUrl, setCapturedUrl] = useState(null);
//   const [captures, setCaptures] = useState([]);
//   const [isOnline, setIsOnline] = useState(navigator.onLine);
//   const [ShowInfo, setshowInfo] = useState(false)
//   const [Check, setcheck] = useState(check_IsmobileView)
//   const watchIdRef = useRef(null);

//   const [FromLocation, setFromLocation] = useState('')
//   const [ToLocation, setToLocation] = useState('')
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

//   /* 📍 Live Location */
//   useEffect(() => {
//     if (!navigator.geolocation) {
//       setError("Geolocation not supported");
//       return;
//     }

//     watchIdRef.current = navigator.geolocation.watchPosition(
//       (p) =>
//         setPosition({
//           lat: p.coords.latitude,
//           lng: p.coords.longitude,
//           accuracy: p.coords.accuracy,

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

//   let Check_Byuser = localStorage.getItem("isuser_Mobile") == "true"
//   console.log(Check_Byuser, "Check_Byuser")
//   /* ⬆️ Upload simulation */
//   const uploadCaptured = () => {
//     if (!Check_Byuser) {
//       console.log("first")
//       return setshowInfo(true)
//     }
//     if (!capturedUrl || !position) {
//       toast.info("Capture image first", { position: "top-center" });
//       return;
//     }

//     setshowInfo(false)
//     setCaptures((prev) => [
//       ...prev,
//       { pos: position, fileUrl: capturedUrl },
//     ]);

//     toast.success("Image saved on map!", { position: "top-center" });
//     setCapturedUrl(null);
//   };
//   const handelSearch = (from, to) => {
//     setFromLocation(from)
//     setToLocation(to)
//   }
//   console.log(FromLocation, "from", ToLocation, "to")
//   const [userAcceptedlive, seuserAcceptedlive] = useState(false)
//   console.log(userAcceptedlive,"userAcceptedlive")
//   const handelLiveLatlong = () => {
//     seuserAcceptedlive(true)

//   }
//   return (
//     <>
//       <Navbar></Navbar>
//       <MobileUseAlert></MobileUseAlert>
// <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "400px", margin: "20px auto", padding: "15px", border: "1px solid #ccc", borderRadius: "10px", background: "#f9f9f9" }}>

//   {/* Live Location Button */}
//   {!userAcceptedlive ? (
//     <button 
//       onClick={handelLiveLatlong} 
//       style={{ padding: "10px 15px", borderRadius: "5px", border: "none", background: "#007bff", color: "#fff", cursor: "pointer" }}
//     >
//       Go with Live Location From
//     </button>
//   ) : (
//     <button 
//       onClick={() => seuserAcceptedlive(false)} 
//       style={{ padding: "10px 15px", borderRadius: "5px", border: "none", background: "#dc3545", color: "#fff", cursor: "pointer" }}
//     >
//       Cancel Live Location
//     </button>
//   )}

//   {/* From Location */}
//   <label style={{ fontWeight: "bold", marginTop: "10px",color:"black" }}>From Location</label>
//   <input 
//     type="text" 
//     onChange={(e) => setFromLocation(e.target.value)} 
//     style={{ padding: "8px 10px", borderRadius: "5px", border: "1px solid #ccc", fontSize: "14px" }}
//   />

//   {/* To Location */}
//   <label style={{ fontWeight: "bold", marginTop: "10px" , color:"black"}}>To Location</label>
//   <input 
//     type="text" 
//     onChange={(e) => setToLocation(e.target.value)} 
//     style={{ padding: "8px 10px", borderRadius: "5px", border: "1px solid #ccc", fontSize: "14px" }}
//   />
// </div>
//       {ShowInfo && <>

//         <Mobileerror />
//       </>}
//       {position?.lat == "" && position?.lng == "" &&
//         <UserLocationStatus></UserLocationStatus>
//       }
//       {/* <Loader loadername="Getting your Live Location." ></Loader> */}
//       {(!position?.lat || !position?.lng) ? (
//         // Show loader if either latitude or longitude is missing
//         <Loader loadername="Getting your Live Location..." />
//       ) : (
//         // Show the map once position is available
//         <HereMap
//           LAT={position.lat}
//           LONG={position.lng}
//           accuracy={position.accuracy}
//           markers={captures}
//           FromLocation={FromLocation}
//           ToLocation={ToLocation}
//           userAcceptedlivelatlong={userAcceptedlive ? position : ""}
//         />
//       )}
//       {/* Status Banner */}
//       {captures.length === 0 ? (
//         <div className="status-box">
//           🚫 No potholes detected
//         </div>
//       ) : (
//         <div className="status-box danger">
//           🚧 {captures.length} Pothole
//           {captures.length > 1 ? "s" : ""} Detected
//         </div>
//       )}

//       {!isOnline && (
//         <div className="offline-banner">
//           You are offline
//         </div>
//       )}

//       <ToastContainer />

//       {/* Camera Panel */}
//       <div className="camera-panel">
//         <CameraCapture onImage={handleImage} isOnline={isOnline} />

//         <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
//           <button onClick={uploadCaptured}>Upload</button>
//           <button onClick={() => setCapturedUrl(null)}>Clear</button>
//         </div>

//         {error && (
//           <div style={{ color: "crimson", marginTop: 8 }}>
//             {error}
//           </div>
//         )}
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
import Navbar from "./Navbar";
import { check_IsmobileView } from "./MiniDb";
import Mobileerror from "./Mobileerror";
import Loader from "./Loader";
import UserLocationStatus from "./UserLocationStatus";
import MobileUseAlert from "./MobileUseAlert";

const App = () => {
  const [position, setPosition] = useState([]);
  const [error, setError] = useState(null);
  const [capturedUrl, setCapturedUrl] = useState(null);
  const [captures, setCaptures] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [ShowInfo, setshowInfo] = useState(false);
  const [Check, setcheck] = useState(check_IsmobileView);
  const [showLocationModal, setShowLocationModal] = useState(false);
  console.log(showLocationModal, "showLocationModal")
  const watchIdRef = useRef(null);

  const [FromLocation, setFromLocation] = useState("");
  const [ToLocation, setToLocation] = useState("");

  const [userAcceptedlive, seuserAcceptedlive] = useState(false);
  const modalRef = useRef(null);

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
          accuracy: p.coords.accuracy,
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

  const handleImage = (blob) => {
    if (!blob) return;
    if (capturedUrl) URL.revokeObjectURL(capturedUrl);
    setCapturedUrl(URL.createObjectURL(blob));
  };

  const Check_Byuser = localStorage.getItem("isuser_Mobile") === "true";

  const uploadCaptured = () => {
    if (!Check_Byuser) return setshowInfo(true);
    if (!capturedUrl || !position) {
      toast.info("Capture image first", { position: "top-center" });
      return;
    }
    setshowInfo(false);
    setCaptures((prev) => [...prev, { pos: position, fileUrl: capturedUrl }]);
    toast.success("Image saved on map!", { position: "top-center" });
    setCapturedUrl(null);
  };

  const handelLiveLatlong = () => seuserAcceptedlive(true);

  const handleBackdropClick = (e) => {
    if (e.target === modalRef.current) {
      setShowLocationModal(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowLocationModal(false);
  };

  const handelStart = () => {
    if (!FromLocation || !ToLocation || !position) {
      return toast.info("from and to we ewant")
    }
    console.log("first")
  }

  return (
    <>
      <Navbar />
      <MobileUseAlert />

      {/* 🌐 Location Modal */}
      {showLocationModal && (
        <div className="location-modal-overlay" ref={modalRef} onClick={handleBackdropClick}>
          <div className="location-modal">
            <div className="modal-header">
              <h2 style={{ color: "black" }}>📍 Set Your Route</h2>
              <button className="modal-close-btn" onClick={() => setShowLocationModal(false)}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="location-form">
              {!userAcceptedlive ? (
                <button type="button" className="live-location-btn active" onClick={handelLiveLatlong}>
                  📍 Use Live Location
                </button>
              ) : (
                <button type="button" className="live-location-btn cancel" onClick={() => seuserAcceptedlive(false)}>
                  ❌ Cancel Live Location
                </button>
              )}

              {!userAcceptedlive ?
                <div className="form-group">
                  <label htmlFor="from-location" style={{ color: "black" }}>From Location</label>
                  <input
                    id="from-location"
                    type="text"
                    placeholder="Enter starting point..."
                    value={FromLocation}
                    style={{ color: "black" }}
                    onChange={(e) => setFromLocation(e.target.value)}
                    autoComplete="off"
                  />
                </div> : <div style={{ color: "black" }}>

                  Live Loaction Added
                </div>}


              <div className="form-group">
                <label htmlFor="to-location" style={{ color: "black" }}>To Location</label>
                <input
                  id="to-location"
                  style={{ color: "black" }}
                  type="text"
                  placeholder="Enter destination..."
                  value={ToLocation}
                  onChange={(e) => setToLocation(e.target.value)}
                  autoComplete="off"
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowLocationModal(false)}>Skip</button>
                <button type="submit" className="btn-primary" onClick={handelStart}>Start Navigation</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <button onClick={() => setShowLocationModal((prev) => !prev)}>Route</button>
      {ShowInfo && <Mobileerror />}
      {!position?.lat || !position?.lng ? (
        <Loader loadername="Getting your Live Location..." />
      ) : (




        // hey
<HereMap
          LAT={position.lat}
          LONG={position.lng}
          accuracy={position.accuracy}
          markers={captures}
          FromLocation={FromLocation}
          ToLocation={ToLocation}
          userAcceptedlivelatlong={userAcceptedlive ? position : null}
        />
      )}
      <div className={`status-box ${captures.length > 0 ? "danger" : ""}`}>
        {captures.length === 0 ? "🚫 No potholes detected" : `🚧 ${captures.length} Pothole${captures.length > 1 ? "s" : ""} Detected`}
      </div>

      {!isOnline && <div className="offline-banner">You are offline</div>}

      <ToastContainer />

      {/* Camera Panel */}
      <div className="camera-panel">
        <CameraCapture onImage={handleImage} isOnline={isOnline} />
        <div className="camera-actions">
          <button onClick={uploadCaptured}>Upload</button>
          <button onClick={() => setCapturedUrl(null)}>Clear</button>
        </div>
        {error && <div className="error-text">{error}</div>}
      </div>
    </>
  );
};

export default App;