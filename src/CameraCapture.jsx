// // // // src/CameraCapture.jsx
// // // import React, { useRef, useState } from "react";
// // // import "./CameraCapture.css";

// // // // export default function CameraCapture({
// // // //   onUploadSuccess,
// // // //   isOnline = true,
// // // //   uploadUrl = "/api/upload",
// // // // })




// // // import React from 'react'

// // // function CameraCapture() {
// // //   async function startCamera() {
// // //     const videoRef = useRef(null);
// // //     const canvasRef = useRef(null);
// // //     const streamRef = useRef(null);

// // //     const [isRunning, setIsRunning] = useState(false);
// // //     const [error, setError] = useState(null);
// // //     const [facing, setFacing] = useState("environment");
// // //     const [isUploading, setIsUploading] = useState(false);
// // //     if (!isOnline) {
// // //       alert("You are offline");
// // //       return;
// // //     }

// // //     setError(null);
// // //     try {
// // //       const stream = await navigator.mediaDevices.getUserMedia({
// // //         video: { facingMode: "environment" },
// // //       });
// // //       streamRef.current = stream;
// // //       videoRef.current.srcObject = stream;
// // //       await videoRef.current.play();
// // //       setIsRunning(true);
// // //     } catch {
// // //       setError("Camera permission denied");
// // //     }
// // //   }

// // //   function stopCamera() {
// // //     if (streamRef.current) {
// // //       streamRef.current.getTracks().forEach((t) => t.stop());
// // //       streamRef.current = null;
// // //     }
// // //     setIsRunning(false);
// // //   }

// // //   async function capturePhoto() {
// // //     const video = videoRef.current;
// // //     const canvas = canvasRef.current;

// // //     canvas.width = video.videoWidth;
// // //     canvas.height = video.videoHeight;
// // //   }
// // //   async function captureAndUpload() {
// // //     if (!videoRef.current) return;

// // //     const canvas = canvasRef.current;
// // //     canvas.width = videoRef.current.videoWidth;
// // //     canvas.height = videoRef.current.videoHeight;

// // //     const ctx = canvas.getContext("2d");
// // //     ctx.drawImage(videoRef.current, 0, 0);

// // //     const blob = await new Promise((res) =>
// // //       canvas.toBlob(res, "image/jpeg", 0.85)
// // //     );

// // //     if (!isOnline) {
// // //       setError("Offline: cannot upload");
// // //       return;
// // //     }



// // //     const url = URL.createObjectURL(blob);

// // //     setCaptures((prev) => [{ blob, url, timestamp: Date.now() }, ...prev]);

// // //     // 🔥 SEND IMAGE TO PARENT (App.jsx)
// // //     if (onImage) onImage(blob);
// // //   }

// // //   function toggleFacing() {
// // //     setFacing((prev) => (prev === "environment" ? "user" : "environment"));
// // //     if (isRunning) {
// // //       stopCamera();
// // //       setTimeout(startCamera, 300);
// // //     }
// // //   }

// // //   const eventButtons = [
// // //     { name: "Start", action: startCamera, disable: isRunning },
// // //     { name: "Capture", action: capturePhoto, disable: !isRunning },
// // //     { name: "Stop", action: stopCamera, disable: !isRunning },
// // //     { name: "Flip", action: toggleFacing, disable: false },
// // //   ];

// // //   try {
// // //     setIsUploading(true);
// // //     const fd = new FormData();
// // //     fd.append("photo", blob);

// // //     const res = await fetch(uploadUrl, {
// // //       method: "POST",
// // //       body: fd,
// // //     });

// // //     if (!res.ok) throw new Error("Upload failed");

// // //     const json = await res.json();
// // //     onUploadSuccess?.(json);
// // //   } catch (e) {
// // //     setError(e.message);
// // //   } finally {
// // //     setIsUploading(false);
// // //   }
// // //   return (
// // //     <>
// // //       <div className="camera-root">
// // //         <video ref={videoRef} className="camera-video" />

// // //         <div className="camera-controls">
// // //           <button
// // //             className="camera-btn"
// // //             onClick={startCamera}
// // //             disabled={isRunning}
// // //           >
// // //             Start
// // //           </button>

// // //           <button
// // //             className="camera-btn primary"
// // //             onClick={captureAndUpload}
// // //             disabled={!isRunning || isUploading}
// // //           >
// // //             {isUploading ? "Uploading…" : "Capture"}
// // //           </button>

// // //           {/* Controls */}
// // //           <div className="cam-controls">
// // //             <div className="cam-btn-row">
// // //               {eventButtons.map((btn, i) => (
// // //                 <button
// // //                   key={i}
// // //                   onClick={btn.action}
// // //                   disabled={btn.disable}
// // //                   className="cam-btn"
// // //                 >
// // //                   {btn.name}
// // //                 </button>
// // //               ))}
// // //             </div>

// // //             <div className="cam-status">
// // //               <p><strong>Status:</strong> {isRunning ? "Running" : "Stopped"}</p>
// // //               <p><strong>Error:</strong> {error ?? "None"}</p>
// // //             </div>

// // //             <div className="cam-capture-list">
// // //               {captures.length === 0 && (
// // //                 <div className="cam-empty">No captures yet</div>
// // //               )}

// // //               {captures.map((c, index) => (
// // //                 <div className="capture-item" key={index}>
// // //                   <img src={c.url} className="capture-img" alt="" />
// // //                   <button
// // //                     className="remove-btn"
// // //                     onClick={() => {
// // //                       URL.revokeObjectURL(c.url);
// // //                       setCaptures((prev) =>
// // //                         prev.filter((_, idx) => idx !== index)
// // //                       );
// // //                     }}
// // //                   >
// // //                     Remove
// // //                   </button>
// // //                 </div>
// // //               ))}
// // //             </div>
// // //           </div>
// // //           <button
// // //             className="camera-btn"
// // //             onClick={stopCamera}
// // //             disabled={!isRunning}
// // //           >
// // //             Stop
// // //           </button>
// // //         </div >

// // //         {error && <div className="camera-error">{error}</div>
// // //         }

// // //         <canvas ref={canvasRef} className="camera-canvas" />
// // //       </div >

// // //     </>
// // //   )
// // // }

// // // export default CameraCapture
// // import React, { useRef, useState } from "react";
// // import "./CameraCapture.css";
// // import { check_IsmobileView } from "./MiniDb";
// // import Mobileerror from "./Mobileerror";
// // import { toast } from "react-toastify";

// // export default function CameraCapture({ onUploadSuccess, isOnline = true, uploadUrl = "/api/upload", onImage }) {
// //   console.log({ onUploadSuccess, isOnline: true, uploadUrl: "/api/upload", onImage }, '{ onUploadSuccess, isOnline = true, uploadUrl = "/api/upload", onImage }')

// //   const videoRef = useRef(null);
// //   const canvasRef = useRef(null);
// //   const streamRef = useRef(null);

// //   const [isRunning, setIsRunning] = useState(false);
// //   const [error, setError] = useState(null);
// //   const [facing, setFacing] = useState("environment");
// //   const [isUploading, setIsUploading] = useState(false);
// //   const [captures, setCaptures] = useState([]);
// //   const [showbtn, setbtn] = useState(false)
// //   const [Check, setcheck] = useState(localStorage.getItem("isuser_Mobile"))
// //   const [ShowInfo, setshowInfo] = useState(false)
// //   // ✅ START CAMERA
// //   async function startCamera() {
// //     if (!isOnline) {
// //       alert("You are offline");
// //       return;
// //     }

// //     const isMobile = localStorage.getItem("isuser_Mobile") === "true";

// //     console.log(isMobile, "isMobile");

// //     // ❌ Block desktop
// //     if (!isMobile) {
// //       toast.info("Please use mobile view 📱", { position: "top-center" });
// //       setshowInfo(true);
// //       return
// //     }

// //     // ✅ Allow mobile
// //     setshowInfo(false);
// //     setbtn(true);
// //     setError(null);

// //     try {
// //       const stream = await navigator.mediaDevices.getUserMedia({
// //         video: { facingMode: facing },
// //       });

// //       streamRef.current = stream;
// //       videoRef.current.srcObject = stream;
// //       await videoRef.current.play();

// //       setIsRunning(true);
// //     } catch {
// //       setError("Camera permission denied");
// //     }
// //   }

// //   // ✅ STOP CAMERA
// //   function stopCamera() {
// //     if (streamRef.current) {
// //       streamRef.current.getTracks().forEach((t) => t.stop());
// //       streamRef.current = null;
// //     }
// //     setIsRunning(false);
// //     setbtn(0)
// //   }

// //   // ✅ CAPTURE + UPLOAD
// //   async function captureAndUpload() {
// //     if (!videoRef.current) return;

// //     const canvas = canvasRef.current;
// //     canvas.width = videoRef.current.videoWidth;
// //     canvas.height = videoRef.current.videoHeight;

// //     const ctx = canvas.getContext("2d");
// //     ctx.drawImage(videoRef.current, 0, 0);

// //     const blob = await new Promise((res) =>
// //       canvas.toBlob(res, "image/jpeg", 0.85)
// //     );

// //     if (!isOnline) {
// //       setError("Offline: cannot upload");
// //       return;
// //     }

// //     const url = URL.createObjectURL(blob);
// //     setCaptures((prev) => [{ blob, url }, ...prev]);

// //     if (onImage) onImage(blob);

// //     // ✅ Upload
// //     try {
// //       setIsUploading(true);

// //       const fd = new FormData();
// //       fd.append("photo", blob);

// //       const res = await fetch(uploadUrl, {
// //         method: "POST",
// //         body: fd,
// //       });

// //       if (!res.ok) throw new Error("Upload failed");

// //       const json = await res.json();
// //       onUploadSuccess?.(json);
// //     } catch (e) {
// //       setError(e.message);
// //     } finally {
// //       setIsUploading(false);
// //     }
// //   }

// //   function toggleFacing() {
// //     setFacing((prev) => (prev === "environment" ? "user" : "environment"));
// //     if (isRunning) {
// //       stopCamera();
// //       setTimeout(startCamera, 300);
// //     }
// //   }

// //   const eventButtons = [
// //     { name: "Start", action: startCamera, disable: isRunning },
// //     // { name: "Stop", action: stopCamera, disable: !isRunning },
// //     { name: "Capture", action: captureAndUpload, disable: !isRunning },
// //     { name: "Flip", action: toggleFacing, disable: false },
// //   ];

// //   return (
// //     <>
// //       <div className="camera-root">
// //         <video ref={videoRef} className="camera-video" />

// //         <div className="camera-controls">
// //           {/* <button onClick={startCamera} disabled={isRunning}>Start</button> */}

// //           {/* <button onClick={captureAndUpload} disabled={!isRunning || isUploading}>
// //             {isUploading ? "Uploading…" : "Capture"}
// //           </button> */}

// //           <div className="cam-btn-row">
// //             {eventButtons.map((btn, i) => (
// //               <>
// //                 <button key={i} onClick={btn.action} disabled={btn.disable}>
// //                   {btn.name}
// //                 </button>

// //               </>
// //             ))}
// //             {showbtn &&
// //               <>
// //                 <button onClick={stopCamera}>Stop</button>
// //               </>
// //             }
// //           </div>

// //           {/* <div style={{ display: "flex", gap: "12px" }}>
// //             <p
// //               style={{
// //                 color: isRunning ? "green" : "red",
// //                 backgroundColor: "#f5f5f5",
// //                 padding: "6px 10px",
// //                 borderRadius: "6px",
// //                 fontWeight: "600"
// //               }}
// //             >
// //               Status: {isRunning ? "Running" : "Stopped"}
// //             </p>
// //           </div> */}
// //           <div style={{ display: "flex", gap: "12px" }}>
// //             <p
// //               className={`status-badge ${isRunning ? "running" : "stopped"
// //                 }`}
// //             >
// //               Status: {isRunning ? "Camera Running" : "Camera Stopped"}
// //             </p>
// //           </div>
// //           {error &&
// //             <p
// //               style={{
// //                 color: error ? "crimson" : "gray",
// //                 backgroundColor: "#f5f5f5",
// //                 padding: "6px 10px",
// //                 borderRadius: "6px",
// //                 fontWeight: "500",
// //                 marginTop: "6px",
// //                 display: "inline-block"
// //               }}
// //             >
// //               Error: {error ?? "None"}
// //             </p>}
// //           <br />
// //           {captures.map((c, i) => (
// //             <img key={i} src={c.url} width="100" alt="" />
// //           ))}

// //           <button onClick={stopCamera} disabled={!isRunning}>Stop</button>
// //         </div>

// //         <canvas ref={canvasRef} style={{ display: "none" }} />
// //       </div>
// //       {ShowInfo && <Mobileerror />}
// //     </>
// //   );
// // }
// // import React, { useRef, useState } from "react";
// // import { toast } from "react-toastify";

// // export default function CameraCapture({ isOnline = true, onImage }) {
// //   const videoRef = useRef(null);
// //   const canvasRef = useRef(null);
// //   const streamRef = useRef(null);

// //   const [isRunning, setIsRunning] = useState(false);
// //   const [error, setError] = useState(null);
// //   const [facing, setFacing] = useState("environment");
// //   const [captures, setCaptures] = useState([]);
// //   const [isUploading, setIsUploading] = useState(false);

// //   const isMobile = window.innerWidth <= 768;

// //   /* ▶️ START */
// //   const startCamera = async () => {
// //     if (!isOnline) {
// //       toast.error("You are offline ❌");
// //       return;
// //     }
// //     const isMobile = localStorage.getItem("isuser_Mobile") === "true";

// //     console.log(isMobile, "isMobile");

// //     // ❌ Block desktop
// //     if (!isMobile) {
// //       toast.info("Please use mobile view 📱", { position: "top-center" });
// //       setshowInfo(true);
// //       return
// //     }
// //     try {
// //       const stream = await navigator.mediaDevices.getUserMedia({
// //         video: { facingMode: facing },
// //       });

// //       streamRef.current = stream;
// //       videoRef.current.srcObject = stream;
// //       await videoRef.current.play();

// //       setIsRunning(true);
// //       setError(null);
// //     } catch {
// //       setError("Camera permission denied");
// //     }
// //   };

// //   /* ⛔ STOP */
// //   const stopCamera = () => {
// //     streamRef.current?.getTracks().forEach((t) => t.stop());
// //     streamRef.current = null;
// //     setIsRunning(false);
// //   };

// //   /* 📸 CAPTURE */
// //   const capture = async () => {
// //     if (!videoRef.current) return;

// //     const canvas = canvasRef.current;
// //     canvas.width = videoRef.current.videoWidth;
// //     canvas.height = videoRef.current.videoHeight;

// //     const ctx = canvas.getContext("2d");
// //     ctx.drawImage(videoRef.current, 0, 0);

// //     const blob = await new Promise((res) =>
// //       canvas.toBlob(res, "image/jpeg", 0.9)
// //     );

// //     const url = URL.createObjectURL(blob);
// //     setCaptures((prev) => [{ blob, url }, ...prev]);

// //     onImage?.(blob);
// //   };

// //   /* 🔄 FLIP CAMERA */
// //   const toggleFacing = () => {
// //     setFacing((prev) =>
// //       prev === "environment" ? "user" : "environment"
// //     );

// //     if (isRunning) {
// //       stopCamera();
// //       setTimeout(startCamera, 300);
// //     }
// //   };

// //   return (
// //     <div style={styles.wrapper(isMobile)}>

// //       {/* 🎥 VIDEO */}
// //       <div style={styles.videoContainer}>
// //         <video
// //           ref={videoRef}
// //           autoPlay
// //           playsInline
// //           muted
// //           style={styles.video}
// //         />

// //         {/* STATUS BADGE */}
// //         <div style={styles.status(isRunning)}>
// //           {isRunning ? "🟢 Live" : "🔴 Off"}
// //         </div>
// //       </div>

// //       {/* 🎛 CONTROLS */}
// //       <div style={styles.controls(isMobile)}>

// //         <button onClick={startCamera} disabled={isRunning} style={styles.btn}>
// //           ▶ Start
// //         </button>

// //         <button
// //           onClick={capture}
// //           disabled={!isRunning}
// //           style={styles.capture}
// //         >
// //           📸
// //         </button>

// //         <button onClick={toggleFacing} style={styles.btn}>
// //           🔄
// //         </button>

// //         <button onClick={stopCamera} disabled={!isRunning} style={styles.btn}>
// //           ⛔
// //         </button>
// //       </div>

// //       {/* ⚠ ERROR */}
// //       {error && <div style={styles.error}>{error}</div>}

// //       {/* 📷 PREVIEW */}
// //       {captures.length > 0 && (
// //         <div style={styles.previewRow}>
// //           {captures.map((c, i) => (
// //             <img key={i} src={c.url} style={styles.previewImg} />
// //           ))}
// //         </div>
// //       )}

// //       <canvas ref={canvasRef} style={{ display: "none" }} />
// //     </div>
// //   );
// // }

// // /* 🎨 STYLES */
// // const styles = {
// //   wrapper: (isMobile) => ({
// //     width: "100%",
// //     background: "#fff",
// //     borderRadius: isMobile ? "16px" : "20px",
// //     padding: "10px",
// //     boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
// //   }),

// //   videoContainer: {
// //     position: "relative",
// //     width: "100%",
// //     height: "230px",
// //     borderRadius: "14px",
// //     overflow: "hidden",
// //     background: "#000",
// //   },

// //   video: {
// //     width: "100%",
// //     height: "100%",
// //     objectFit: "cover",
// //   },

// //   status: (running) => ({
// //     position: "absolute",
// //     top: "10px",
// //     right: "10px",
// //     background: running ? "#22c55e" : "#ef4444",
// //     color: "#fff",
// //     padding: "4px 10px",
// //     borderRadius: "10px",
// //     fontSize: "12px",
// //   }),

// //   controls: (isMobile) => ({
// //     display: "flex",
// //     justifyContent: "space-around",
// //     marginTop: "10px",
// //     gap: "8px",
// //   }),

// //   btn: {
// //     padding: "10px",
// //     borderRadius: "10px",
// //     border: "none",
// //     background: "#e5e7eb",
// //     cursor: "pointer",
// //     flex: 1,
// //   },

// //   capture: {
// //     flex: 1.2,
// //     padding: "12px",
// //     borderRadius: "50%",
// //     background: "#2563eb",
// //     color: "#fff",
// //     fontSize: "18px",
// //     border: "none",
// //   },

// //   error: {
// //     color: "red",
// //     marginTop: "6px",
// //     textAlign: "center",
// //   },

// //   previewRow: {
// //     display: "flex",
// //     gap: "6px",
// //     marginTop: "10px",
// //     overflowX: "auto",
// //   },

// //   previewImg: {
// //     width: "70px",
// //     height: "70px",
// //     borderRadius: "8px",
// //     objectFit: "cover",
// //   },
// // };



// import React, { useRef, useState } from "react";
// import { toast } from "react-toastify";

// export default function CameraCapture({ isOnline = true, onImage }) {
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);
//   const streamRef = useRef(null);

//   const [isRunning, setIsRunning] = useState(false);
//   const [isOpen, setIsOpen] = useState(false); // ✅ OPEN/CLOSE
//   const [error, setError] = useState(null);
//   const [facing, setFacing] = useState("environment");
//   const [captures, setCaptures] = useState([]);

//   const isMobile = window.innerWidth <= 768;

//   /* ▶ START CAMERA */
//   const startCamera = async () => {
//     if (!isOnline) {
//       toast.error("You are offline ❌");
//       return;
//     }
//     const isMobile = localStorage.getItem("isuser_Mobile") === "true";
//     // 
//     // console.log(isMobile, "isMobile");

//     // ❌ Block desktop
//     if (!isMobile) {
//       toast.info("Please use mobile view 📱", { position: "top-center" });
//       setshowInfo(true);
//       return
//     }
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: { facingMode: facing },
//       });

//       streamRef.current = stream;
//       videoRef.current.srcObject = stream;
//       await videoRef.current.play();

//       setIsRunning(true);
//       setError(null);
//     } catch {
//       setError("Camera permission denied");
//     }
//   };

//   /* ⛔ STOP CAMERA */
//   const stopCamera = () => {
//     streamRef.current?.getTracks().forEach((t) => t.stop());
//     streamRef.current = null;
//     setIsRunning(false);
//   };

//   /* 📸 CAPTURE */
//   const capture = async () => {
//     if (!videoRef.current) return;

//     const canvas = canvasRef.current;
//     canvas.width = videoRef.current.videoWidth;
//     canvas.height = videoRef.current.videoHeight;

//     const ctx = canvas.getContext("2d");
//     ctx.drawImage(videoRef.current, 0, 0);

//     const blob = await new Promise((res) =>
//       canvas.toBlob(res, "image/jpeg", 0.9)
//     );

//     const url = URL.createObjectURL(blob);
//     setCaptures((prev) => [{ blob, url }, ...prev]);

//     onImage?.(blob);
//   };

//   /* 🔄 FLIP */
//   const toggleFacing = () => {
//     setFacing((prev) =>
//       prev === "environment" ? "user" : "environment"
//     );

//     if (isRunning) {
//       stopCamera();
//       setTimeout(startCamera, 300);
//     }
//   };

//   /* 🔘 OPEN / CLOSE CAMERA */
//   const toggleCameraPanel = () => {
//     setIsOpen(!isOpen);

//     if (isRunning) {
//       stopCamera();
//     }
//   };
//   const styles = {
//     wrapper: (isMobile) => ({
//       position: "fixed",
//       bottom: isMobile ? "80px" : "20px",
//       right: "20px",
//       zIndex: 2000,
//     }),

//     openBtn: {
//       padding: "12px 18px",
//       borderRadius: "30px",
//       background: "#2563eb",
//       color: "#fff",
//       border: "none",
//       fontWeight: "600",
//       cursor: "pointer",
//       boxShadow: "0 6px 20px rgba(0,0,0,0.3)",
//     },

//     panel: {
//       width: "260px",
//       background: "#fff",
//       borderRadius: "16px",
//       padding: "10px",
//       boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
//       position: "relative",
//     },

//     closeBtn: {
//       position: "absolute",
//       top: "8px",
//       right: "8px",
//       zIndex: 10,
//       border: "none",
//       background: "rgba(0,0,0,0.6)",
//       color: "#fff",
//       borderRadius: "50%",
//       width: "30px",
//       height: "30px",
//       cursor: "pointer",
//       display: "flex",
//       alignItems: "center",
//       justifyContent: "center",
//     },

//     videoContainer: {
//       width: "100%",
//       height: "160px",
//       borderRadius: "10px",
//       overflow: "hidden",
//       background: "#000",
//     },

//     video: {
//       width: "100%",
//       height: "100%",
//       objectFit: "cover",
//     },

//     status: (run) => ({
//       position: "absolute",
//       top: "10px",
//       right: "10px",
//       background: run ? "#22c55e" : "#ef4444",
//       color: "#fff",
//       padding: "4px 8px",
//       borderRadius: "10px",
//       fontSize: "11px",
//     }),

//     controls: {
//       display: "flex",
//       justifyContent: "space-between",
//       marginTop: "10px",
//     },

//     btn: {
//       flex: 1,
//       margin: "2px",
//       padding: "8px",
//       borderRadius: "8px",
//       border: "none",
//       background: "#e5e7eb",
//       cursor: "pointer",
//     },

//     capture: {
//       flex: 1.2,
//       margin: "2px",
//       borderRadius: "50%",
//       background: "#2563eb",
//       color: "#fff",
//       border: "none",
//       fontSize: "18px",
//     },

//     error: {
//       color: "red",
//       textAlign: "center",
//       marginTop: "6px",
//       fontSize: "12px",
//     },

//     previewRow: {
//       display: "flex",
//       gap: "5px",
//       marginTop: "8px",
//       overflowX: "auto",
//     },

//     previewImg: {
//       width: "50px",
//       height: "50px",
//       borderRadius: "6px",
//       objectFit: "cover",
//     },
//   };
//   return (
//     <div style={styles.wrapper(isMobile)}>

//       {/* 🔘 OPEN BUTTON */}
//       {!isOpen && (
//         <button style={styles.openBtn} onClick={toggleCameraPanel}>
//           📷 Open Camera
//         </button>
//       )}

//       {/* CAMERA PANEL */}
//       {isOpen && (
//         <div style={styles.panel}>

//           {/* CLOSE BTN */}
//           <div style={{ position: "relative" }}>

//             {/* 🎥 VIDEO */}
//             <div style={styles.videoContainer}>
//               <video
//                 ref={videoRef}
//                 autoPlay
//                 playsInline
//                 muted
//                 style={styles.video}
//               />

//               {/* STATUS */}
//               <div style={styles.status(isRunning)}>
//                 {isRunning ? "🟢 Live" : "🔴 Off"}
//               </div>
//             </div>

//             {/* ❌ CLOSE BUTTON (overlay) */}
//             <button style={styles.closeBtn} onClick={toggleCameraPanel}>
//               ✖
//             </button>

//           </div>

//           {/* 🎛 BUTTONS */}
//           <div style={styles.controls}>
//             <button onClick={startCamera} disabled={isRunning} style={styles.btn}>
//               ▶
//             </button>

//             <button onClick={capture} disabled={!isRunning} style={styles.capture}>
//               📸
//             </button>

//             <button onClick={toggleFacing} style={styles.btn}>
//               🔄
//             </button>

//             <button onClick={stopCamera} disabled={!isRunning} style={styles.btn}>
//               ⛔
//             </button>
//           </div>

//           {/* ERROR */}
//           {error && <p style={styles.error}>{error}</p>}

//           {/* PREVIEW */}
//           {captures.length > 0 && (
//             <div style={styles.previewRow}>
//               {captures.map((c, i) => (
//                 <img key={i} src={c.url} style={styles.previewImg} />
//               ))}
//             </div>
//           )}
//         </div>
//       )}

//       <canvas ref={canvasRef} style={{ display: "none" }} />
//     </div>
//   );
// }
import React, { useRef, useState } from "react";
import { toast } from "react-toastify";


export default function CameraCapture({ isOnline = true, onImage }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [isRunning, setIsRunning] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState(null);
  const [facing, setFacing] = useState("environment");
  const [captures, setCaptures] = useState([]);

  const isMobile = window.innerWidth <= 768;

  /* ▶ START CAMERA */
  const startCamera = async () => {
    if (!isOnline) {
      toast.error("You are offline ❌");
      return;
    }
    const isMobile = localStorage.getItem("isuser_Mobile") === "true";
    //     // 
    //     // console.log(isMobile, "isMobile");

    //     // ❌ Block desktop
    if (!isMobile) {
      toast.info("Please use mobile view 📱", { position: "top-center" });
      setshowInfo(true);
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing },
      });

      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      setIsRunning(true);
      setError(null);
    } catch {
      setError("Camera permission denied");
    }
  };

  /* ⛔ STOP */
  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setIsRunning(false);
  };

  /* 📸 CAPTURE */
  const capture = async () => {
    if (!videoRef.current) return;

    const canvas = canvasRef.current;
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0);

    const blob = await new Promise((res) =>
      canvas.toBlob(res, "image/jpeg", 0.9)
    );

    const url = URL.createObjectURL(blob);
    setCaptures((prev) => [{ blob, url }, ...prev]);

    onImage?.(blob);
  };

  /* 🔄 SWITCH CAMERA */
  const toggleFacing = () => {
    setFacing((prev) =>
      prev === "environment" ? "user" : "environment"
    );

    if (isRunning) {
      stopCamera();
      setTimeout(startCamera, 300);
    }
  };

  /* OPEN / CLOSE */
  const toggleCameraPanel = () => {
    setIsOpen(!isOpen);
    if (isRunning) stopCamera();
  };

  /* 🎨 STYLES */
  const styles = {
    wrapper: {
      position: "fixed",
      bottom: isMobile ? "80px" : "20px",
      right: "20px",
      zIndex: 2000,
    },

    openBtn: {
      padding: "12px 18px",
      borderRadius: "30px",
      background: "#2563eb",
      color: "#fff",
      border: "none",
      fontWeight: "600",
      cursor: "pointer",
    },

    panel: {
      width: isMobile ? "90vw" : "300px",
      maxWidth: "320px",
      background: "#fff",
      borderRadius: "16px",
      padding: "12px",
      boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
    },

    videoContainer: {
      position: "relative",
      width: "100%",
      height: "180px",
      borderRadius: "10px",
      overflow: "hidden",
      background: "#000",
    },

    video: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
    },

    status: (run) => ({
      position: "absolute",
      top: "10px",
      right: "10px",
      background: run ? "#22c55e" : "#ef4444",
      color: "#fff",
      padding: "4px 10px",
      borderRadius: "12px",
      fontSize: "12px",
      fontWeight: "600",
    }),

    closeBtn: {
      position: "absolute",
      top: "10px",
      left: "10px",
      background: "rgba(0,0,0,0.6)",
      color: "#fff",
      border: "none",
      borderRadius: "50%",
      width: "32px",
      height: "32px",
      cursor: "pointer",
    },

    controls: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "8px",
      marginTop: "12px",
    },

    btn: {
      padding: "10px",
      borderRadius: "10px",
      border: "none",
      background: "#e5e7eb",
      cursor: "pointer",
      fontSize: "13px",
      fontWeight: "500",
    },

    capture: {
      gridColumn: "span 2",
      padding: "12px",
      borderRadius: "12px",
      background: "#2563eb",
      color: "#fff",
      border: "none",
      fontWeight: "600",
      cursor: "pointer",
    },
    // 62508a3d172396041522ba7a3eac6cd6
    error: {
      color: "red",
      textAlign: "center",
      marginTop: "6px",
      fontSize: "12px",
    },

    previewRow: {
      display: "flex",
      gap: "6px",
      marginTop: "10px",
      overflowX: "auto",
    },

    previewImg: {
      width: "60px",
      height: "60px",
      borderRadius: "8px",
      objectFit: "cover",
    },
  };

  return (
    <div style={styles.wrapper}>
      {!isOpen && (
        <button style={styles.openBtn} onClick={toggleCameraPanel}>
          📷 Open Camera
        </button>
      )}
      {/* <Toaster></Toaster> */}
      {isOpen && (
        <div style={styles.panel}>
          <div style={{ position: "relative" }}>
            <div style={styles.videoContainer}>
              <video ref={videoRef} autoPlay playsInline muted style={styles.video} />
              <div style={styles.status(isRunning)}>
                {isRunning ? "🟢 Live" : "🔴 Off"}
              </div>
            </div>

            <button style={styles.closeBtn} onClick={toggleCameraPanel}>
              ✖
            </button>
          </div>

          <div style={styles.controls}>
            <button onClick={startCamera} disabled={isRunning} style={styles.btn}>
              ▶ Start
            </button>

            <button onClick={toggleFacing} style={styles.btn}>
              🔄 Flip
            </button>

            <button onClick={stopCamera} disabled={!isRunning} style={styles.btn}>
              ⛔ Stop
            </button>

            <button onClick={capture} disabled={!isRunning} style={styles.capture}>
              📸 Capture Photo
            </button>
          </div>

          {error && <p style={styles.error}>{error}</p>}

          {captures.length > 0 && (
            <div style={styles.previewRow}>
              {captures.map((c, i) => (
                <img key={i} src={c.url} style={styles.previewImg} />
              ))}
            </div>
          )}
        </div>
      )}

      {error && <div className="camera-error">{error}</div>}

      <canvas ref={canvasRef} className="camera-canvas" />
    </div>
  );
} 