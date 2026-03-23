// import React, { useEffect, useState } from "react";
// import BackButton from "./BackButton";
// import Navbar from "./Navbar";

// function Addnearby() {
//   const [Position, setPosition] = useState({});
//   const [error, setError] = useState("");
//   const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

//   useEffect(() => {
//     const handleResize = () => {
//       setIsMobile(window.innerWidth < 768);
//     };
//     window.addEventListener("resize", handleResize);

//     navigator.geolocation.getCurrentPosition(
//       (p) =>
//         setPosition({
//           lat: p.coords.latitude,
//           lng: p.coords.longitude,
//         }),
//       (err) => setError(err.message),
//       { enableHighAccuracy: true }
//     );

//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   return (
//     <>
//       <Navbar page="nearby" />

//       <div
//         style={{
//           minHeight: "100vh",
//           background: "#f3f4f6",
//           padding: isMobile ? "10px" : "40px",
//         }}
//       >
//         <div
//           style={{
//             display: "flex",
//             flexDirection: isMobile ? "column" : "row",
//             gap: "30px",
//             maxWidth: "1000px",
//             margin: "auto",
//           }}
//         >
//           {/* LEFT SIDE (FORM) */}
//           <div
//             style={{
//               flex: 1,
//               background: "#fff",
//               padding: "25px",
//               borderRadius: "12px",
//               boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
//             }}
//           >
//             <h1 style={{ marginBottom: "10px" }}>Report Pothole</h1>

//             <BackButton />

//             {/* Upload */}
//             <button
//               style={{
//                 width: "100%",
//                 padding: "12px",
//                 margin: "15px 0",
//                 borderRadius: "8px",
//                 border: "none",
//                 background: "#3b82f6",
//                 color: "#fff",
//                 cursor: "pointer",
//               }}
//             >
//               Add Photo
//             </button>

//             {/* Location */}
//             <p style={{ fontSize: "14px" }}>
//               <strong>Location:</strong>{" "}
//               {Position.lat
//                 ? `${Position.lat}, ${Position.lng}`
//                 : "Fetching location..."}
//             </p>

//             {error && <p style={{ color: "red" }}>{error}</p>}

//             {/* Size */}
//             <label style={{ fontWeight: "bold" }}>Pothole Size</label>
//             <select
//               style={{
//                 width: "100%",
//                 padding: "10px",
//                 margin: "10px 0",
//                 borderRadius: "8px",
//                 border: "1px solid #ccc",
//               }}
//             >
//               {["Small", "Medium", "Large"].map((size, idx) => (
//                 <option key={idx}>{size}</option>
//               ))}
//             </select>

//             {/* Description */}
//             <label style={{ fontWeight: "bold" }}>Description</label>
//             <textarea
//               placeholder="Enter description"
//               style={{
//                 width: "100%",
//                 height: "120px",
//                 padding: "10px",
//                 borderRadius: "8px",
//                 border: "1px solid #ccc",
//                 marginTop: "10px",
//               }}
//             />

//             {/* Submit */}
//             <button
//               style={{
//                 width: "100%",
//                 marginTop: "20px",
//                 padding: "12px",
//                 borderRadius: "8px",
//                 border: "none",
//                 background: "#10b981",
//                 color: "#fff",
//                 fontWeight: "bold",
//                 cursor: "pointer",
//               }}
//             >
//               Submit Report
//             </button>
//           </div>

//           {/* RIGHT SIDE (EXTRA UI FOR PC) */}
//           {!isMobile && (
//             <div
//               style={{
//                 flex: 1,
//                 background: "#fff",
//                 borderRadius: "12px",
//                 padding: "25px",
//                 boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
//                 display: "flex",
//                 justifyContent: "center",
//                 alignItems: "center",
//                 fontSize: "18px",
//                 color: "#666",
//               }}
//             >
//               📍 Map / Image Preview Area
//             </div>
//           )}
//         </div>
//       </div>
//     </>
//   );
// }

// export default Addnearby;   
import React, { useEffect, useState, useRef } from "react";
import BackButton from "./BackButton";
import Navbar from "./Navbar";
import HereMap from "./HereMap";
import Waether from "./Waether";

function Addnearby() {
    const [Position, setPosition] = useState({});
    const [error, setError] = useState("");
    const [isDesktop, setIsDesktop] = useState(window.innerWidth > 1024);
    const [isTablet, setIsTablet] = useState(window.innerWidth >= 768 && window.innerWidth <= 1024);
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [formData, setFormData] = useState({
        size: "Medium",
        description: ""
    });
    const fileInputRef = useRef(null);

    useEffect(() => {
        const handleResize = () => {
            setIsDesktop(window.innerWidth > 1024);
            setIsTablet(window.innerWidth >= 768 && window.innerWidth <= 1024);
        };
        window.addEventListener("resize", handleResize);

        navigator.geolocation.getCurrentPosition(
            (p) =>
                setPosition({
                    lat: p.coords.latitude.toFixed(6),
                    lng: p.coords.longitude.toFixed(6),
                }),
            (err) => setError(err.message),
            { enableHighAccuracy: true }
        );

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            alert("Please select a valid image file");
            e.target.value = "";
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.description.trim()) {
            alert("Please add a description");
            return;
        }
        console.log("Submitting:", { ...formData, Position, selectedFile });
        // Add your API call here
        alert("Report submitted successfully!");
    };

    const getContainerPadding = () => {
        if (isDesktop) return "80px 60px";
        if (isTablet) return "40px 30px";
        return "20px 15px";
    };

    const getTitleSize = () => {
        if (isDesktop) return "32px";
        if (isTablet) return "28px";
        return "24px";
    };
    console.log(Position, "Position")

    return (
        <>
            <Navbar page="nearby" />

            <div
                style={{
                    minHeight: "100vh",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-start",
                    alignItems: "center",
                    background: "white",
                    padding: isDesktop ? "60px 40px" : isTablet ? "40px 20px" : "20px 10px",
                    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                }}
            >
                <div
                    style={{
                        width: "100%",
                        maxWidth: isDesktop ? "1000px" : isTablet ? "700px" : "95%",
                        background: "#fff",
                        borderRadius: "24px",
                        boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
                        overflow: "hidden",
                        position: "relative",
                    }}
                >
                    {/* Header */}
                    <div
                        style={{
                            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                            padding: isDesktop ? "40px 60px" : "30px 25px",
                            textAlign: "center",
                            color: "white",
                        }}
                    >
                        <h1
                            style={{
                                margin: 0,
                                fontSize: getTitleSize(),
                                fontWeight: "700",
                                letterSpacing: "-0.02em",
                            }}
                        >
                            Report Pothole
                        </h1>
                        <p style={{ margin: "8px 0 0 0", opacity: 0.9, fontSize: "16px" }}>
                            Help us fix roads faster
                        </p>
                    </div>

                    <div style={{ padding: getContainerPadding() }}>
                        <BackButton />

                        <form onSubmit={handleSubmit} style={{ marginTop: "30px" }}>
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr",
                                    gap: isDesktop ? "40px" : "30px",
                                    marginBottom: "30px",
                                }}
                            >
                                {/* LEFT COLUMN - Upload & Location */}
                                <div>
                                    {/* Photo Upload */}
                                    <label
                                        style={{
                                            display: "block",
                                            fontSize: "16px",
                                            fontWeight: "600",
                                            color: "#1f2937",
                                            marginBottom: "12px",
                                        }}
                                    >
                                        📸 Photo (Required)
                                    </label>

                                    <div
                                        style={{
                                            border: "3px dashed #d1d5db",
                                            borderRadius: "16px",
                                            padding: "30px 20px",
                                            textAlign: "center",
                                            background: "#f9fafb",
                                            cursor: "pointer",
                                            transition: "all 0.3s ease",
                                            position: "relative",
                                            overflow: "hidden",
                                        }}
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        {preview ? (
                                            <>
                                                <img
                                                    src={preview}
                                                    alt="Preview"
                                                    style={{
                                                        width: "100%",
                                                        height: "180px",
                                                        objectFit: "cover",
                                                        borderRadius: "12px",
                                                        marginBottom: "12px",
                                                    }}
                                                />
                                                <p style={{ color: "#059669", fontWeight: "500" }}>
                                                    ✅ {selectedFile?.name}
                                                </p>
                                            </>
                                        ) : (
                                            <>
                                                <div
                                                    style={{
                                                        fontSize: "48px",
                                                        marginBottom: "12px",
                                                        opacity: 0.5,
                                                    }}
                                                >
                                                    📷
                                                </div>
                                                <p style={{ fontSize: "16px", color: "#6b7280", marginBottom: "4px" }}>
                                                    Click to add photo or drag & drop
                                                </p>
                                                <p style={{ fontSize: "14px", color: "#9ca3af" }}>
                                                    JPG, PNG up to 5MB
                                                </p>
                                            </>
                                        )}
                                    </div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                        style={{ display: "none" }}
                                    />

                                    {/* Location */}
                                    <div
                                        style={{
                                            marginTop: "30px",
                                            padding: "20px",
                                            background: "#f0fdf4",
                                            borderRadius: "12px",
                                            border: "2px solid #bbf7d0",
                                        }}
                                    >
                                        <label
                                            style={{
                                                display: "block",
                                                fontSize: "16px",
                                                fontWeight: "600",
                                                color: "#059669",
                                                marginBottom: "8px",
                                            }}
                                        >
                                            📍 Current Location
                                        </label>
                                     <p
    style={{
        fontSize: "14px",
        color: "#444",
        fontFamily: "monospace",
        display: "flex",
        alignItems: "center",
        gap: "4px",
        flexWrap: "wrap"
    }}
>
    {Position?.lat ? (
        `${Position.lat}, ${Position.lng}`
    ) : (
        <>
            <span style={{ color: "#666" }}>🔄 Fetching your</span>
            <span style={{ color: "#4B352A", fontWeight: "700" }}>location</span>
            <span style={{ color: "#666" }}>&</span>
            <span style={{ color: "#3F72AF", fontWeight: "500" }}>
                real-time weather
            </span>
            <span style={{ color: "#999" }}>...</span>
        </>
    )}
</p>
                                        {error && (
                                            <p style={{ color: "#dc2626", fontSize: "14px", marginTop: "8px" }}>
                                                ⚠️ {error}
                                            </p>
                                        )}
                                    </div>
                                    <Waether lat={Position} ></Waether>

                                </div>

                                {/* RIGHT COLUMN - Size & Description */}
                                <div>
                                    {/* Pothole Size */}
                                    <label
                                        style={{
                                            display: "block",
                                            fontSize: "16px",
                                            fontWeight: "600",
                                            color: "#1f2937",
                                            marginBottom: "12px",
                                        }}
                                    >
                                        📏 Pothole Size
                                    </label>
                                    <select
                                        value={formData.size}
                                        onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                                        style={{
                                            width: "100%",
                                            padding: "16px 20px",
                                            borderRadius: "12px",
                                            border: "2px solid #e5e7eb",
                                            background: "#fff",
                                            fontSize: "16px",
                                            fontWeight: "500",
                                            color: "#1f2937",
                                            appearance: "none",
                                            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                                            backgroundPosition: "right 16px center",
                                            backgroundRepeat: "no-repeat",
                                            backgroundSize: "18px",
                                            cursor: "pointer",
                                            transition: "all 0.2s ease",
                                        }}
                                        onFocus={(e) => (e.target.style.borderColor = "#10b981")}
                                        onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                                    >
                                        <option value="Small">🛵 Small (Motorcycle tire)</option>
                                        <option value="Medium">🚗 Medium (Car tire)</option>
                                        <option value="Large">🚚 Large (Truck tire)</option>
                                    </select>

                                    {/* Description */}
                                    <label
                                        style={{
                                            display: "block",
                                            fontSize: "16px",
                                            fontWeight: "600",
                                            color: "#1f2937",
                                            margin: "30px 0 12px 0",
                                        }}
                                    >
                                        ✍️ Description (Required)
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Describe the pothole location, severity, when you noticed it, etc..."
                                        style={{
                                            width: "100%",
                                            minHeight: "140px",
                                            padding: "20px",
                                            borderRadius: "12px",
                                            border: "2px solid #e5e7eb",
                                            background: "#fff",
                                            fontSize: "16px",
                                            fontFamily: "inherit",
                                            resize: "vertical",
                                            transition: "all 0.2s ease",
                                            lineHeight: "1.6",
                                        }}
                                        onFocus={(e) => (e.target.style.borderColor = "#10b981")}
                                        onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                                    />
                                    <p
                                        style={{
                                            fontSize: "14px",
                                            color: "#6b7280",
                                            marginTop: "8px",
                                        }}
                                    >
                                        Be specific about the exact location and condition
                                    </p>
                                    {/* LEFT SIDE - MAP */}
                                    <div
                                        style={{
                                            borderRadius: "12px",
                                            border: "1px solid #e5e7eb",
                                            overflow: "hidden",
                                            width: "100%",
                                            maxWidth: "100%",
                                            display: "flex",
                                            flexDirection: "column"
                                        }}
                                    >

                                        {/* Header */}
                                        <div
                                            style={{
                                                padding: "10px 12px",
                                                borderBottom: "1px solid #f1f1f1",
                                                fontSize: "14px",
                                                fontWeight: "600",
                                                color: "#333"
                                            }}
                                        >
                                            📍 Live Location Map
                                        </div>

                                        {/* Map Container */}
                                        <div
                                            style={{
                                                width: "100%",
                                                height: "400px", // better responsive height
                                                position: "relative"
                                            }}
                                        >
                                            {Position?.lat && Position?.lng ? (
                                                <HereMap
                                                    LAT={Number(Position.lat)}
                                                    LONG={Number(Position.lng)}
                                                    accuracy={Position?.accuracy}
                                                />
                                            ) : (
                                                <div
                                                    style={{
                                                        height: "100%",
                                                        display: "flex",
                                                        justifyContent: "center",
                                                        alignItems: "center",
                                                        fontSize: "13px",
                                                        color: "#888"
                                                    }}
                                                >
                                                    Waiting for location...
                                                </div>
                                            )}
                                        </div>

                                    </div>
                                </div>

                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                style={{
                                    width: "100%",
                                    padding: isDesktop ? "20px" : "18px",
                                    borderRadius: "16px",
                                    border: "none",
                                    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                                    color: "#fff",
                                    fontSize: isDesktop ? "18px" : "16px",
                                    fontWeight: "700",
                                    cursor: "pointer",
                                    boxShadow: "0 10px 30px rgba(16, 185, 129, 0.4)",
                                    transition: "all 0.3s ease",
                                    position: "relative",
                                    overflow: "hidden",
                                }}
                                onMouseDown={(e) => {
                                    e.target.style.transform = "translateY(2px)";
                                    e.target.style.boxShadow = "0 4px 15px rgba(16, 185, 129, 0.4)";
                                }}
                                onMouseUp={(e) => {
                                    e.target.style.transform = "translateY(0)";
                                    e.target.style.boxShadow = "0 10px 30px rgba(16, 185, 129, 0.4)";
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.transform = "translateY(0)";
                                    e.target.style.boxShadow = "0 10px 30px rgba(16, 185, 129, 0.4)";
                                }}
                            >
                                🚀 Submit Report
                            </button>
                        </form>
                    </div>

                </div>
            </div>

        </>
    );
}
export default Addnearby;
