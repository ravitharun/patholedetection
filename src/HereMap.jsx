

// import axios from "axios";
// import React, { useEffect, useRef, useState } from "react";
// import { toast } from "react-toastify";
// import Loader from "./Loader";

// const HereMap = ({ LAT, LONG, markers = [], accuracy, obstacles = [] }) => {
//   const mapRef = useRef(null);
//   const mapInstance = useRef(null);
//   const userMarkerRef = useRef(null);
//   const destinationMarkerRef = useRef(null);
//   const accuracyCircleRef = useRef(null);
//   const potholeGroupRef = useRef(null);
//   const routePolylineRef = useRef({});
//   const watchIdRef = useRef(null);
//   const destinationCoordsRef = useRef(null);
//   const previousCoordsRef = useRef(null);
//   const lastRouteFetchRef = useRef(0);

//   const [loader, setLoader] = useState(false);
//   const [fromLocation, setFromLocation] = useState("");
//   const [toLocation, setToLocation] = useState("");
//   const [routeData, setRouteData] = useState([]);
//   const [selectedMode, setSelectedMode] = useState("car");
//   const [isStarted, setIsStarted] = useState(false);
//   const [currentCoords, setCurrentCoords] = useState(null);
//   const [liveAccuracy, setLiveAccuracy] = useState(null);

//   const transportModes = [
//     { value: "car", label: "Car" },
//     { value: "bicycle", label: "Bike" },
//     { value: "pedestrian", label: "Walking" },
//   ];

//   // INIT MAP --------------------------------------------------------
//   useEffect(() => {
//     if (!window.H || !window.H.service || mapInstance.current) return;

//     const platform = new window.H.service.Platform({
//       apikey: import.meta.env.VITE_HERE_API_KEY,
//     });

//     const defaultLayers = platform.createDefaultLayers();

//     const map = new window.H.Map(mapRef.current, defaultLayers.vector.normal.map, {
//       center: {
//         lat: Number(LAT) || 12.9716,
//         lng: Number(LONG) || 77.5946,
//       },
//       zoom: 17,
//       pixelRatio: window.devicePixelRatio || 1,
//     });

//     new window.H.mapevents.Behavior(new window.H.mapevents.MapEvents(map));
//     window.H.ui.UI.createDefault(map, defaultLayers);

//     try {
//       map.addLayer(defaultLayers.vector.traffic.map);
//     } catch (e) {
//       console.warn("Traffic layer not available", e);
//     }

//     potholeGroupRef.current = new window.H.map.Group();
//     map.addObject(potholeGroupRef.current);

//     mapInstance.current = map;

//     const handleResize = () => map.getViewPort().resize();
//     window.addEventListener("resize", handleResize);

//     return () => {
//       window.removeEventListener("resize", handleResize);
//       if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
//       if (mapInstance.current) {
//         mapInstance.current.dispose();
//         mapInstance.current = null;
//       }
//     };
//   }, [LAT, LONG]);

//   // POHHOLE MARKERS -----------------------------------------------
//   useEffect(() => {
//     if (!potholeGroupRef.current || !window.H) return;

//     potholeGroupRef.current.removeAll();

//     markers.forEach((item) => {
//       const icon = new window.H.map.Icon(
//         "https://cdn-icons-png.flaticon.com/512/565/565547.png",
//         { size: { w: 30, h: 30 } }
//       );
//       potholeGroupRef.current.addObject(new window.H.map.Marker(item.pos, { icon }));
//     });
//   }, [markers]);

//   // ARROW SVG + HEADING --------------------------------------------
//   const createArrowSvg = (angle = 0) => `
//     <svg xmlns="http://www.w3.org/2000/svg" width="54" height="54" viewBox="0 0 54 54">
//       <g transform="rotate(${angle} 27 27)">
//         <circle cx="27" cy="27" r="18" fill="#ffffff" opacity="0.95"/>
//         <path d="M27 8 L37 32 L29.5 29.5 L27 45 L24.5 29.5 L17 32 Z" fill="#007bff" stroke="#0b4fd4" stroke-width="1.5"/>
//       </g>
//     </svg>
//   `;

//   const getHeading = (from, to) => {
//     if (!from || !to) return 0;

//     const lat1 = (from.lat * Math.PI) / 180;
//     const lon1 = (from.lng * Math.PI) / 180;
//     const lat2 = (to.lat * Math.PI) / 180;
//     const lon2 = (to.lng * Math.PI) / 180;

//     const y = Math.sin(lon2 - lon1) * Math.cos(lat2);
//     const x =
//       Math.cos(lat1) * Math.sin(lat2) -
//       Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);

//     let brng = (Math.atan2(y, x) * 180) / Math.PI;
//     brng = (brng + 360) % 360;
//     return brng;
//   };

//   // ROUTE & POLYLINE -----------------------------------------------
//   const clearPolylines = () => {
//     if (!mapInstance.current) return;
//     Object.values(routePolylineRef.current).forEach((line) => {
//       mapInstance.current.removeObject(line);
//     });
//     routePolylineRef.current = {};
//   };

//   const drawRoutes = (routes) => {
//     if (!mapInstance.current || !window.H) return;

//     clearPolylines();

//     routes.forEach((route, idx) => {
//       route.sections.forEach((section, sIdx) => {
//         const key = `${selectedMode}-${idx}-${sIdx}`;
//         const lineString = window.H.geo.LineString.fromFlexiblePolyline(section.polyline);

//         const polyline = new window.H.map.Polyline(lineString, {
//           style: {
//             strokeColor: idx === 0 ? "#007bff" : "#6c757d",
//             lineWidth: idx === 0 ? 7 : 4,
//           },
//         });

//         mapInstance.current.addObject(polyline);
//         routePolylineRef.current[key] = polyline;
//       });
//     });
//   };

//   // USER & DESTINATION MARKERS -------------------------------------
//   const updateUserMarker = (coords, heading = 0, acc = null) => {
//     if (!mapInstance.current || !window.H) return;

//     const map = mapInstance.current;
//     const icon = new window.H.map.Icon(createArrowSvg(heading));

//     if (!userMarkerRef.current) {
//       userMarkerRef.current = new window.H.map.Marker(coords, { icon });
//       map.addObject(userMarkerRef.current);
//     } else {
//       userMarkerRef.current.setGeometry(coords);
//       userMarkerRef.current.setIcon(icon);
//     }

//     if (acc) {
//       if (!accuracyCircleRef.current) {
//         accuracyCircleRef.current = new window.H.map.Circle(coords, acc, {
//           style: {
//             strokeColor: "rgba(0,120,255,0.55)",
//             lineWidth: 2,
//             fillColor: "rgba(0,120,255,0.15)",
//           },
//         });
//         map.addObject(accuracyCircleRef.current);
//       } else {
//         accuracyCircleRef.current.setCenter(coords);
//         accuracyCircleRef.current.setRadius(acc);
//       }
//     }

//     map.setCenter(coords, true);
//     map.setZoom(18, true);
//   };

//   const setDestinationMarker = (coords) => {
//     if (!mapInstance.current || !window.H) return;

//     const icon = new window.H.map.Icon(
//       "https://cdn-icons-png.flaticon.com/512/447/447031.png",
//       { size: { w: 36, h: 36 } }
//     );

//     if (!destinationMarkerRef.current) {
//       destinationMarkerRef.current = new window.H.map.Marker(coords, { icon });
//       mapInstance.current.addObject(destinationMarkerRef.current);
//     } else {
//       destinationMarkerRef.current.setGeometry(coords);
//     }
//   };

//   // ROUTE FETCH ----------------------------------------------------
//   const fetchRoute = async (originCoords, destinationCoords) => {
//     if (!originCoords || !destinationCoords) return;

//     try {
//       const avoidAreas = obstacles
//         .map(
//           (o) =>
//             `bbox:${o.topLeft[1]},${o.bottomRight[0]},${o.bottomRight[1]},${o.topLeft[0]}`
//         )
//         .join("|");

//       const url = `https://router.hereapi.com/v8/routes?transportMode=${selectedMode}&origin=${originCoords.lat},${originCoords.lng}&destination=${destinationCoords.lat},${destinationCoords.lng}&alternatives=1&return=polyline,summary,actions,instructions&routingMode=fast${avoidAreas ? `&avoid[areas]=${avoidAreas}` : ""}&traffic[enabled]=true&apikey=${import.meta.env.VITE_HERE_API_KEY}`;

//       const res = await axios.get(url);
//       const routes = res.data?.routes || [];

//       setRouteData([{ mode: selectedMode, routes }]);
//       drawRoutes(routes);
//     } catch (err) {
//       console.error(err);
//       toast.error("Route fetch error");
//     }
//   };

//   // THROTTLE MOVEMENT ---------------------------------------------
//   const shouldRefetchRoute = (coords) => {
//     const now = Date.now();
//     if (now - lastRouteFetchRef.current < 2500) return false;
//     lastRouteFetchRef.current = now;
//     return true;
//   };

//   // GEOCODE DESTINATION --------------------------------------------
//   const geocodeDestination = async () => {
//     if (!toLocation.trim()) {
//       toast.warning("Please enter destination");
//       return null;
//     }

//     const res = await axios.get(
//       `https://geocode.search.hereapi.com/v1/geocode?q=${encodeURIComponent(
//         toLocation
//       )}&apiKey=${import.meta.env.VITE_HERE_API_KEY}`
//     );

//     const pos = res.data?.items?.[0]?.position;
//     if (!pos) {
//       toast.error("Destination not found");
//       return null;
//     }

//     const dest = { lat: pos.lat, lng: pos.lng };
//     destinationCoordsRef.current = dest;
//     setDestinationMarker(dest);
//     return dest;
//   };

//   // START / STOP NAVIGATION ----------------------------------------
//   const startNavigation = async () => {
//     if (!navigator.geolocation) {
//       toast.error("Geolocation not supported");
//       return;
//     }

//     if (!toLocation.trim()) {
//       toast.warning("Please enter destination");
//       return;
//     }

//     try {
//       setLoader(true);

//       const destination = await geocodeDestination();
//       if (!destination) {
//         setLoader(false);
//         return;
//       }

//       setIsStarted(true);

//       if (watchIdRef.current) {
//         navigator.geolocation.clearWatch(watchIdRef.current);
//       }

//       watchIdRef.current = navigator.geolocation.watchPosition(
//         async (position) => {
//           const coords = {
//             lat: position.coords.latitude,
//             lng: position.coords.longitude,
//           };

//           const acc = position.coords.accuracy || null;

//           setCurrentCoords(coords);
//           setLiveAccuracy(acc);
//           setFromLocation(`${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`);

//           const heading = previousCoordsRef.current
//             ? getHeading(previousCoordsRef.current, coords)
//             : 0;

//           updateUserMarker(coords, heading, acc);

//           // Always use the latest user coords + latest saved destination
//           if (destinationCoordsRef.current && shouldRefetchRoute(coords)) {
//             await fetchRoute(coords, destinationCoordsRef.current);
//           }

//           previousCoordsRef.current = coords;
//           setLoader(false);
//         },
//         (err) => {
//           console.error(err);
//           toast.error("Location error: " + err.message);
//           setLoader(false);
//           setIsStarted(false);
//         },
//         {
//           enableHighAccuracy: true,
//           maximumAge: 0,
//           timeout: 8000,
//         }
//       );
//     } catch (err) {
//       console.error(err);
//       toast.error("Unable to start navigation");
//       setLoader(false);
//     }
//   };

//   const stopNavigation = () => {
//     if (watchIdRef.current) {
//       navigator.geolocation.clearWatch(watchIdRef.current);
//       watchIdRef.current = null;
//     }
//     setIsStarted(false);
//   };

//   // REFETCH ON MODE CHANGE -----------------------------------------
//   useEffect(() => {
//     if (isStarted && currentCoords && destinationCoordsRef.current) {
//       fetchRoute(currentCoords, destinationCoordsRef.current);
//     }
//   }, [selectedMode]);

//   return (
//     <>
//       {loader && <Loader loadername="Calculating route..." />}

//       <div
//         style={{
//           display: "flex",
//           gap: "10px",
//           padding: "10px",
//           flexWrap: "wrap",
//           alignItems: "center",
//         }}
//       >
//         {!isStarted ? (
//           <button
//             onClick={startNavigation}
//             style={{
//               padding: "10px 16px",
//               borderRadius: "6px",
//               background: "#28a745",
//               color: "#fff",
//               border: "none",
//               cursor: "pointer",
//             }}
//           >
//             Start
//           </button>
//         ) : (
//           <button
//             onClick={stopNavigation}
//             style={{
//               padding: "10px 16px",
//               borderRadius: "6px",
//               background: "#dc3545",
//               color: "#fff",
//               border: "none",
//               cursor: "pointer",
//             }}
//           >
//             Stop
//           </button>
//         )}

//         <input
//           type="text"
//           placeholder="From location"
//           value={fromLocation}
//           readOnly
//           style={{
//             flex: 1,
//             padding: "8px",
//             borderRadius: "6px",
//             border: "1px solid #ccc",
//             minWidth: "180px",
//             background: "#f8f9fa",
//             color: "#111",
//           }}
//         />

//         <input
//           type="text"
//           placeholder="To location"
//           value={toLocation}
//           onChange={(e) => setToLocation(e.target.value)}
//           style={{
//             flex: 1,
//             padding: "8px",
//             borderRadius: "6px",
//             border: "1px solid #ccc",
//             minWidth: "180px",
//             color: "white",
//           }}
//         />
//   <div style={{ padding: "10px", maxHeight: "30vh", overflowY: "auto" }}>
//         {routeData.map((rSet) =>
//           rSet.routes.map((route, idx) =>
//             route.sections.map((section, sIdx) => (
//               <div
//                 key={`${rSet.mode}-${idx}-${sIdx}`}
//                 style={{
//                   marginBottom: "10px",
//                   padding: "12px",
//                   borderRadius: "8px",
//                   background: "#fff",
//                   color: "black",
//                   boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
//                 }}
//               >
//                 <div style={{ fontWeight: 600 }}>
//                   Mode: {rSet.mode === "bicycle" ? "Bike" : rSet.mode}
//                 </div>
//                 <div>
//                   Distance: {(section.summary.length / 1000).toFixed(2)} km | Duration:{" "}
//                   {Math.ceil(section.summary.duration / 60)} mins
//                 </div>

//                 {/* Show real turn‑by‑turn instructions */}
//                 {Array.isArray(section.actions) &&
//                   section.actions.map((action, index) => (
//                     <div
//                       key={index}
//                       style={{
//                         marginTop: "6px",
//                         fontSize: "14px",
//                         lineHeight: 1.4,
//                       }}
//                     >
//                       {action.instruction || action.action}
//                     </div>
//                   ))}
//               </div>
//             ))
//           ))
//         }


//         {currentCoords && (
//           <div
//             style={{
//               marginTop: "8px",
//               padding: "12px",
//               borderRadius: "8px",
//               background: "#f8f9fa",
//               color: "#111",
//               border: "1px solid #ddd",
//             }}
//           >
//             Current: {currentCoords.lat.toFixed(6)}, {currentCoords.lng.toFixed(6)}
//             {liveAccuracy ? ` | Accuracy: ${Math.round(liveAccuracy)} m` : ""}
//           </div>
//         )}
//       </div>
//         <div style={{ display: "flex", gap: "12px", marginLeft: "auto" }}>
//           {transportModes.map((mode) => (
//             <label
//               key={mode.value}
//               style={{
//                 display: "flex",
//                 alignItems: "center",
//                 gap: "4px",
//                 fontSize: "14px",
//               }}
//             >
//               <input
//                 type="radio"
//                 name="transport-mode"
//                 value={mode.value}
//                 checked={selectedMode === mode.value}
//                 onChange={() => setSelectedMode(mode.value)}
//               />
//               {mode.label}
//             </label>
//           ))}
//         </div>
//       </div>

//       <div ref={mapRef} style={{ width: "100%", height: "60vh" }} />


//     </>
//   );
// };

// export default HereMap;





// v2
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import Loader from "./Loader";

const HereMap = ({ LAT, LONG, markers = [], accuracy, obstacles = [] }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const userMarkerRef = useRef(null);
  const destinationMarkerRef = useRef(null);
  const accuracyCircleRef = useRef(null);
  const potholeGroupRef = useRef(null);
  const routePolylineRef = useRef({});
  const watchIdRef = useRef(null);
  const destinationCoordsRef = useRef(null);
  const previousCoordsRef = useRef(null);
  const lastRouteFetchRef = useRef(0);
  const [loader, setLoader] = useState(false);
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [routeData, setRouteData] = useState([]);
  const [selectedMode, setSelectedMode] = useState("car");
  const [isStarted, setIsStarted] = useState(false);
  const [currentCoords, setCurrentCoords] = useState(null);
  const [liveAccuracy, setLiveAccuracy] = useState(null);

  const transportModes = [
    { value: "car", label: "Car" },
    { value: "bicycle", label: "Bike" },
    { value: "pedestrian", label: "Walking" },
  ];

  // INIT MAP
  useEffect(() => {
    if (!window.H || !window.H.service || mapInstance.current) return;

    const platform = new window.H.service.Platform({
      apikey: import.meta.env.VITE_HERE_API_KEY,
    });

    const defaultLayers = platform.createDefaultLayers();

    const map = new window.H.Map(mapRef.current, defaultLayers.vector.normal.map, {
      center: {
        lat: Number(LAT) || 12.9716,
        lng: Number(LONG) || 77.5946,
      },
      zoom: 17,
      pixelRatio: window.devicePixelRatio || 1,
    });

    new window.H.mapevents.Behavior(new window.H.mapevents.MapEvents(map));
    window.H.ui.UI.createDefault(map, defaultLayers);

    try {
      map.addLayer(defaultLayers.vector.traffic.map);
    } catch (e) {
      console.warn("Traffic layer not available", e);
    }

    potholeGroupRef.current = new window.H.map.Group();
    map.addObject(potholeGroupRef.current);

    mapInstance.current = map;

    const handleResize = () => map.getViewPort().resize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
      if (mapInstance.current) {
        mapInstance.current.dispose();
        mapInstance.current = null;
      }
    };
  }, [LAT, LONG]);

  // POOTHHOLE MARKERS
  useEffect(() => {
    if (!potholeGroupRef.current || !window.H) return;

    potholeGroupRef.current.removeAll();

    markers.forEach((item) => {
      const icon = new window.H.map.Icon(
        "https://cdn-icons-png.flaticon.com/512/565/565547.png",
        { size: { w: 30, h: 30 } }
      );
      potholeGroupRef.current.addObject(new window.H.map.Marker(item.pos, { icon }));
    });
  }, [markers]);

  // ROTATING ARROW SVG
  const createArrowSvg = (angle = 0) => `
    <svg xmlns="http://www.w3.org/2000/svg" width="54" height="54" viewBox="0 0 54 54">
      <g transform="rotate(${angle} 27 27)">
        <circle cx="27" cy="27" r="18" fill="#ffffff" opacity="0.95"/>
        <path d="M27 8 L37 32 L29.5 29.5 L27 45 L24.5 29.5 L17 32 Z" fill="#007bff" stroke="#0b4fd4" stroke-width="1.5"/>
      </g>
    </svg>
  `;

  // CALCULATE HEADING
  const getHeading = (from, to) => {
    if (!from || !to) return 0;

    const lat1 = (from.lat * Math.PI) / 180;
    const lon1 = (from.lng * Math.PI) / 180;
    const lat2 = (to.lat * Math.PI) / 180;
    const lon2 = (to.lng * Math.PI) / 180;

    const y = Math.sin(lon2 - lon1) * Math.cos(lat2);
    const x =
      Math.cos(lat1) * Math.sin(lat2) -
      Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);

    let brng = (Math.atan2(y, x) * 180) / Math.PI;
    brng = (brng + 360) % 360;
    return brng;
  };

  // ROUTE POLYLINE
  const clearPolylines = () => {
    if (!mapInstance.current) return;
    Object.values(routePolylineRef.current).forEach((line) => {
      mapInstance.current.removeObject(line);
    });
    routePolylineRef.current = {};
  };

  const drawRoutes = (routes) => {
    if (!mapInstance.current || !window.H) return;

    clearPolylines();

    routes.forEach((route, idx) => {
      route.sections.forEach((section, sIdx) => {
        const key = `${selectedMode}-${idx}-${sIdx}`;
        const lineString = window.H.geo.LineString.fromFlexiblePolyline(section.polyline);

        const polyline = new window.H.map.Polyline(lineString, {
          style: {
            strokeColor: idx === 0 ? "#007bff" : "#6c757d",
            lineWidth: idx === 0 ? 7 : 4,
          },
        });

        mapInstance.current.addObject(polyline);
        routePolylineRef.current[key] = polyline;
      });
    });
  };

  // USER & DESTINATION MARKERS
  const updateUserMarker = (coords, heading = 0, acc = null) => {
    if (!mapInstance.current || !window.H) return;

    const map = mapInstance.current;
    const icon = new window.H.map.Icon(createArrowSvg(heading));

    if (!userMarkerRef.current) {
      userMarkerRef.current = new window.H.map.Marker(coords, { icon });
      map.addObject(userMarkerRef.current);
    } else {
      userMarkerRef.current.setGeometry(coords);
      userMarkerRef.current.setIcon(icon);
    }

    if (acc) {
      if (!accuracyCircleRef.current) {
        accuracyCircleRef.current = new window.H.map.Circle(coords, acc, {
          style: {
            strokeColor: "rgba(0,120,255,0.55)",
            lineWidth: 2,
            fillColor: "rgba(0,120,255,0.15)",
          },
        });
        map.addObject(accuracyCircleRef.current);
      } else {
        accuracyCircleRef.current.setCenter(coords);
        accuracyCircleRef.current.setRadius(acc);
      }
    }

    map.setCenter(coords, true);
    map.setZoom(18, true);
  };

  const setDestinationMarker = (coords) => {
    if (!mapInstance.current || !window.H) return;

    const icon = new window.H.map.Icon(
      "https://cdn-icons-png.flaticon.com/512/447/447031.png",
      { size: { w: 36, h: 36 } }
    );

    if (!destinationMarkerRef.current) {
      destinationMarkerRef.current = new window.H.map.Marker(coords, { icon });
      mapInstance.current.addObject(destinationMarkerRef.current);
    } else {
      destinationMarkerRef.current.setGeometry(coords);
    }
  };
  // FETCH ROUTE
  const fetchRoute = async (originCoords, destinationCoords) => {
    if (!originCoords || !destinationCoords) return;

    try {
      const avoidAreas = obstacles
        .map(
          (o) =>
            `bbox:${o.topLeft[1]},${o.bottomRight[0]},${o.bottomRight[1]},${o.topLeft[0]}`
        )
        .join("|");

      const url = `https://router.hereapi.com/v8/routes?transportMode=${selectedMode}&origin=${originCoords.lat},${originCoords.lng}&destination=${destinationCoords.lat},${destinationCoords.lng}&alternatives=1&return=polyline,summary,actions,instructions&routingMode=fast${avoidAreas ? `&avoid[areas]=${avoidAreas}` : ""}&traffic[enabled]=true&apikey=${import.meta.env.VITE_HERE_API_KEY}`;

      const res = await axios.get(url);
      const routes = res.data?.routes || [];

      setRouteData([{ mode: selectedMode, routes }]);
      drawRoutes(routes);
    } catch (err) {
      console.error(err.message, "error");
      toast.error("Route fetch error");
    }
  };

  // THROTTLE ROUTE REFETCH
  const shouldRefetchRoute = (coords) => {
    const now = Date.now();
    if (now - lastRouteFetchRef.current < 2500) return false;
    lastRouteFetchRef.current = now;
    return true;
  };

  // GEOCODE DESTINATION
  const geocodeDestination = async () => {
    if (!toLocation.trim()) {
      toast.warning("Please enter destination");
      return null;
    }

    const res = await axios.get(
      `https://geocode.search.hereapi.com/v1/geocode?q=${encodeURIComponent(
        toLocation
      )}&apiKey=${import.meta.env.VITE_HERE_API_KEY}`
    );

    const pos = res.data?.items?.[0]?.position;
    if (!pos) {
      toast.error("Destination not found");
      return null;
    }

    const dest = { lat: pos.lat, lng: pos.lng };
    destinationCoordsRef.current = dest;
    setDestinationMarker(dest);
    return dest;
  };

  // START / STOP NAVIGATION
  const startNavigation = async () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }

    if (!toLocation.trim()) {
      toast.warning("Please enter destination");
      return;
    }

    try {
      setLoader(true);

      const destination = await geocodeDestination();
      if (!destination) {
        setLoader(false);
        return;
      }

      setIsStarted(true);

      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }

      watchIdRef.current = navigator.geolocation.watchPosition(
        async (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          const acc = position.coords.accuracy || null;

          setCurrentCoords(coords);
          setLiveAccuracy(acc);
          setFromLocation(`${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`);

          const heading = previousCoordsRef.current
            ? getHeading(previousCoordsRef.current, coords)
            : 0;

          updateUserMarker(coords, heading, acc);

          if (destinationCoordsRef.current && shouldRefetchRoute(coords)) {
            await fetchRoute(coords, destinationCoordsRef.current);
          }

          previousCoordsRef.current = coords;
          setLoader(false);
        },
        (err) => {
          console.error(err);
          toast.error("Location error: " + err.message);
          setLoader(false);
          setIsStarted(false);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 1000,
          timeout: 1000,
        }
      );
    } catch (err) {
      console.error(err);
      toast.error("Unable to start navigation");
      setLoader(false);
    }
  };

  const stopNavigation = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsStarted(false);
  };

  useEffect(() => {
    if (isStarted && currentCoords && destinationCoordsRef.current) {
      fetchRoute(currentCoords, destinationCoordsRef.current);
    }
  }, [selectedMode]);

  return (
    <>
      {loader && <Loader loadername="Calculating route..." />}

      <div
        style={{
          display: "flex",
          gap: "10px",
          padding: "10px",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        {!isStarted ? (
          <button
            onClick={startNavigation}
            style={{
              padding: "10px 16px",
              borderRadius: "6px",
              background: "#28a745",
              color: "#fff",
              border: "none",
              cursor: "pointer",
            }}
          >
            Start
          </button>
        ) : (
          <button
            onClick={stopNavigation}
            style={{
              padding: "10px 16px",
              borderRadius: "6px",
              background: "#dc3545",
              color: "#fff",
              border: "none",
              cursor: "pointer",
            }}
          >
            Stop
          </button>
        )}

        <input
          type="text"
          placeholder="From location"
          value={fromLocation}
          readOnly
          style={{
            flex: 1,
            padding: "8px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            minWidth: "180px",
            background: "#f8f9fa",
            color: "#111",
          }}
        />

        <input
          type="text"
          placeholder="To location"
          value={toLocation}
          onChange={(e) => setToLocation(e.target.value)}
          style={{
            flex: 1,
            padding: "8px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            minWidth: "180px",
            color: "white",
          }}
        />

        <div style={{ display: "flex", gap: "12px", marginLeft: "auto" }}>
          {transportModes.map((mode) => (
            <label
              key={mode.value}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "14px",
              }}
            >
              <input
                type="radio"
                name="transport-mode"
                value={mode.value}
                checked={selectedMode === mode.value}
                onChange={() => setSelectedMode(mode.value)}
              />
              {mode.label}
            </label>
          ))}
        </div>
      </div>




      <div style={{ padding: "10px", maxHeight: "30vh", overflowY: "auto" }}>
        {routeData.map((rSet) =>
          rSet.routes.map((route, idx) =>
            route.sections.map((section, sIdx) => (
              <div
                key={`${rSet.mode}-${idx}-${sIdx}`}
                style={{
                  marginBottom: "10px",
                  padding: "12px",
                  borderRadius: "8px",
                  background: "#fff",
                  color: "black",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                }}
              >
                <div style={{ fontWeight: 600 }}>
                  Mode: {rSet.mode === "bicycle" ? "Bike" : rSet.mode}
                </div>
                <div>
                  Distance:<b> {(section.summary.length / 1000).toFixed(2)}</b> km | Duration:{" "}
                <b>  {Math.ceil(section.summary.duration / 60)}</b> mins
                </div>

                {Array.isArray(section.actions) &&
                  section.actions.map((action, index) => (
                    <div
                      key={index}
                      style={{
                        marginTop: "6px",
                        fontSize: "14px",
                        lineHeight: 1.4,
                      }}
                    >
                      <li>
                        {action.instruction || action.action}
                      </li>                    </div>
                  ))}
              </div>
            ))
          ))
        }

        {currentCoords && (
          <div
            style={{
              marginTop: "8px",
              padding: "12px",
              borderRadius: "8px",
              background: "#f8f9fa",
              color: "#111",
              border: "1px solid #ddd",
            }}
          >
            Current: {currentCoords.lat.toFixed(6)}, {currentCoords.lng.toFixed(6)}
            {liveAccuracy ? ` | Accuracy: ${Math.round(liveAccuracy)} m` : ""}
          </div>
        )}
      </div>

      <div ref={mapRef} style={{ width: "100%", height: "60vh" }} />


    </>
  );
};

export default HereMap;





// import axios from "axios";
// import React, { useEffect, useRef, useState } from "react";
// import { toast } from "react-toastify";
// import Loader from "./Loader";

// const HereMap = ({ LAT, LONG, markers = [], accuracy, obstacles = [] }) => {
//   const mapRef = useRef(null);
//   const mapInstance = useRef(null);
//   const userMarkerRef = useRef(null);
//   const destinationMarkerRef = useRef(null);
//   const accuracyCircleRef = useRef(null);
//   const potholeGroupRef = useRef(null);
//   const routePolylineRef = useRef({});
//   const watchIdRef = useRef(null);
//   const destinationCoordsRef = useRef(null);
//   const previousCoordsRef = useRef(null);
//   const lastRouteFetchRef = useRef(0);

//   const [loader, setLoader] = useState(false);
//   const [fromLocation, setFromLocation] = useState("");
//   const [toLocation, setToLocation] = useState("");
//   const [routeData, setRouteData] = useState([]);
//   const [selectedMode, setSelectedMode] = useState("car");
//   const [isStarted, setIsStarted] = useState(false);
//   const [currentCoords, setCurrentCoords] = useState(null);
//   const [liveAccuracy, setLiveAccuracy] = useState(null);

//   const transportModes = [
//     { value: "car", label: "Car" },
//     { value: "bicycle", label: "Bike" },
//     { value: "pedestrian", label: "Walking" },
//   ];

//   // INIT MAP
//   useEffect(() => {
//     if (!window.H || !window.H.service || mapInstance.current) return;

//     const platform = new window.H.service.Platform({
//       apikey: import.meta.env.VITE_HERE_API_KEY,
//     });

//     const defaultLayers = platform.createDefaultLayers();

//     const map = new window.H.Map(mapRef.current, defaultLayers.vector.normal.map, {
//       center: {
//         lat: Number(LAT) || 12.9716,
//         lng: Number(LONG) || 77.5946,
//       },
//       zoom: 17,
//       pixelRatio: window.devicePixelRatio || 1,
//     });

//     new window.H.mapevents.Behavior(new window.H.mapevents.MapEvents(map));
//     window.H.ui.UI.createDefault(map, defaultLayers);

//     try {
//       map.addLayer(defaultLayers.vector.traffic.map);
//     } catch (e) {
//       console.warn("Traffic layer not available", e);
//     }

//     potholeGroupRef.current = new window.H.map.Group();
//     map.addObject(potholeGroupRef.current);

//     mapInstance.current = map;

//     const handleResize = () => map.getViewPort().resize();
//     window.addEventListener("resize", handleResize);

//     return () => {
//       window.removeEventListener("resize", handleResize);
//       if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
//       if (mapInstance.current) {
//         mapInstance.current.dispose();
//         mapInstance.current = null;
//       }
//       routePolylineRef.current = {};
//     };
//   }, [LAT, LONG]);

//   // POOTHHOLE MARKERS
//   useEffect(() => {
//     if (!potholeGroupRef.current || !window.H) return;

//     potholeGroupRef.current.removeAll();

//     markers.forEach((item) => {
//       const icon = new window.H.map.Icon(
//         "https://cdn-icons-png.flaticon.com/512/565/565547.png",
//         { size: { w: 30, h: 30 } }
//       );
//       potholeGroupRef.current.addObject(new window.H.map.Marker(item.pos, { icon }));
//     });
//   }, [markers]);

//   // ROTATING ARROW SVG
//   const createArrowSvg = (angle = 0) => `
//     <svg xmlns="http://www.w3.org/2000/svg" width="54" height="54" viewBox="0 0 54 54">
//       <g transform="rotate(${angle} 27 27)">
//         <circle cx="27" cy="27" r="18" fill="#ffffff" opacity="0.95"/>
//         <path d="M27 8 L37 32 L29.5 29.5 L27 45 L24.5 29.5 L17 32 Z" fill="#007bff" stroke="#0b4fd4" stroke-width="1.5"/>
//       </g>
//     </svg>
//   `;

//   // CALCULATE HEADING
//   const getHeading = (from, to) => {
//     if (!from || !to) return 0;

//     const lat1 = (from.lat * Math.PI) / 180;
//     const lon1 = (from.lng * Math.PI) / 180;
//     const lat2 = (to.lat * Math.PI) / 180;
//     const lon2 = (to.lng * Math.PI) / 180;

//     const y = Math.sin(lon2 - lon1) * Math.cos(lat2);
//     const x =
//       Math.cos(lat1) * Math.sin(lat2) -
//       Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);

//     let brng = (Math.atan2(y, x) * 180) / Math.PI;
//     brng = (brng + 360) % 360;
//     return brng;
//   };

//   // ROUTE POLYLINE (safe removeObject)
//   const clearPolylines = () => {
//     Object.values(routePolylineRef.current).forEach((line) => {
//       if (line && line.getParent()) {
//         line.getParent().removeObject(line); // Only remove if parent exists
//       }
//     });
//     routePolylineRef.current = {};
//   };

//   const drawRoutes = (routes) => {
//     if (!mapInstance.current || !window.H) return;

//     clearPolylines();

//     routes.forEach((route, idx) => {
//       route.sections.forEach((section, sIdx) => {
//         const key = `${selectedMode}-${idx}-${sIdx}`;
//         const lineString = window.H.geo.LineString.fromFlexiblePolyline(section.polyline);

//         const polyline = new window.H.map.Polyline(lineString, {
//           style: {
//             strokeColor: idx === 0 ? "#007bff" : "#6c757d",
//             lineWidth: idx === 0 ? 7 : 4,
//           },
//         });

//         mapInstance.current.addObject(polyline);
//         routePolylineRef.current[key] = polyline;
//       });
//     });
//   };

//   // USER & DESTINATION MARKERS
//   const updateUserMarker = (coords, heading = 0, acc = null) => {
//     if (!mapInstance.current || !window.H) return;

//     const map = mapInstance.current;
//     const icon = new window.H.map.Icon(createArrowSvg(heading));

//     if (!userMarkerRef.current) {
//       userMarkerRef.current = new window.H.map.Marker(coords, { icon });
//       map.addObject(userMarkerRef.current);
//     } else {
//       userMarkerRef.current.setGeometry(coords);
//       userMarkerRef.current.setIcon(icon);
//     }

//     if (acc) {
//       if (!accuracyCircleRef.current) {
//         accuracyCircleRef.current = new window.H.map.Circle(coords, acc, {
//           style: {
//             strokeColor: "rgba(0,120,255,0.55)",
//             lineWidth: 2,
//             fillColor: "rgba(0,120,255,0.15)",
//           },
//         });
//         map.addObject(accuracyCircleRef.current);
//       } else {
//         accuracyCircleRef.current.setCenter(coords);
//         accuracyCircleRef.current.setRadius(acc);
//       }
//     }

//     map.setCenter(coords, true);
//     map.setZoom(18, true);
//   };

//   const setDestinationMarker = (coords) => {
//     if (!mapInstance.current || !window.H) return;

//     const icon = new window.H.map.Icon(
//       "https://cdn-icons-png.flaticon.com/512/447/447031.png",
//       { size: { w: 36, h: 36 } }
//     );

//     if (!destinationMarkerRef.current) {
//       destinationMarkerRef.current = new window.H.map.Marker(coords, { icon });
//       mapInstance.current.addObject(destinationMarkerRef.current);
//     } else {
//       destinationMarkerRef.current.setGeometry(coords);
//     }
//   };

//   // FETCH ROUTE
//   const fetchRoute = async (originCoords, destinationCoords) => {
//     if (
//       !originCoords ||
//       !destinationCoords ||
//       originCoords.lat == null ||
//       originCoords.lng == null ||
//       destinationCoords.lat == null ||
//       destinationCoords.lng == null
//     ) {
//       console.log("Skipping route fetch: invalid coords", {
//         originCoords,
//         destinationCoords,
//       });
//       return;
//     }

//     try {
//       const avoidAreas = Array.isArray(obstacles)
//         ? obstacles
//           .filter(
//             (o) =>
//               o?.topLeft &&
//               o?.bottomRight &&
//               o.topLeft.length === 2 &&
//               o.bottomRight.length === 2
//           )
//           .map(
//             (o) =>
//               `bbox:${o.topLeft[1]},${o.bottomRight[0]},${o.bottomRight[1]},${o.topLeft[0]}`
//           )
//           .join("|")
//         : "";

//       const params = new URLSearchParams({
//         transportMode: selectedMode,
//         origin: `${Number(originCoords.lat)},${Number(originCoords.lng)}`,
//         destination: `${Number(destinationCoords.lat)},${Number(destinationCoords.lng)}`,
//         alternatives: "1",
//         return: "polyline,summary",
//         routingMode: "fast",
//         apikey: import.meta.env.VITE_HERE_API_KEY,
//       });

//       if (avoidAreas) params.append("avoid[areas]", avoidAreas);
//       params.append("traffic[enabled]", "true");

//       const url = `https://router.hereapi.com/v8/routes?${params.toString()}`;

//       const res = await axios.get(url);
//       const routes = res.data?.routes || [];

//       if (!routes.length) {
//         toast.error("No route found");
//         return;
//       }

//       setRouteData([{ mode: selectedMode, routes }]);
//       drawRoutes(routes);
//     } catch (err) {
//       console.error("Route fetch error:", err?.response?.data || err.message);
//       toast.error(
//         err?.response?.data?.title ||
//         err?.response?.data?.cause ||
//         err?.message ||
//         "Route fetch error"
//       );
//     }
//   };

//   // THROTTLE ROUTE REFETCH
//   const shouldRefetchRoute = () => {
//     const now = Date.now();
//     if (now - lastRouteFetchRef.current < 3000) return false;
//     lastRouteFetchRef.current = now;
//     return true;
//   };

//   // GEOCODE DESTINATION
//   const geocodeDestination = async () => {
//     if (!toLocation.trim()) {
//       toast.warning("Please enter destination");
//       return null;
//     }

//     try {
//       const res = await axios.get(
//         `https://geocode.search.hereapi.com/v1/geocode?q=${encodeURIComponent(
//           toLocation
//         )}&apiKey=${import.meta.env.VITE_HERE_API_KEY}`
//       );

//       const pos = res.data?.items?.[0]?.position;
//       if (!pos) {
//         toast.error("Destination not found");
//         return null;
//       }

//       const dest = { lat: pos.lat, lng: pos.lng };
//       destinationCoordsRef.current = dest;
//       setDestinationMarker(dest);
//       return dest;
//     } catch (err) {
//       console.error("Destination geocode error:", err?.response?.data || err.message);
//       toast.error("Destination lookup failed");
//       return null;
//     }
//   };

//   // START / STOP NAVIGATION
//   const startNavigation = async () => {
//     if (!navigator.geolocation) {
//       toast.error("Geolocation not supported");
//       return;
//     }

//     if (!toLocation.trim()) {
//       toast.warning("Please enter destination");
//       return;
//     }

//     try {
//       setLoader(true);

//       const destination = await geocodeDestination();
//       if (!destination) {
//         setLoader(false);
//         return;
//       }

//       setIsStarted(true);

//       if (watchIdRef.current) {
//         navigator.geolocation.clearWatch(watchIdRef.current);
//       }

//       watchIdRef.current = navigator.geolocation.watchPosition(
//         async (position) => {
//           const coords = {
//             lat: position.coords.latitude,
//             lng: position.coords.longitude,
//           };

//           const acc = position.coords.accuracy || null;

//           setCurrentCoords(coords);
//           setLiveAccuracy(acc);
//           setFromLocation(`${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`);

//           const heading = previousCoordsRef.current
//             ? getHeading(previousCoordsRef.current, coords)
//             : 0;

//           updateUserMarker(coords, heading, acc);

//           if (destinationCoordsRef.current && shouldRefetchRoute()) {
//             await fetchRoute(coords, destinationCoordsRef.current);
//           }

//           previousCoordsRef.current = coords;
//           setLoader(false);
//         },
//         (err) => {
//           console.error("Geolocation error:", err);
//           if (err.code === 1) {
//             toast.error("Location permission denied");
//           } else if (err.code === 2) {
//             toast.error("Location unavailable");
//           } else if (err.code === 3) {
//             toast.error("Location timeout expired");
//           } else {
//             toast.error("Location error: " + err.message);
//           }
//           setLoader(false);
//           setIsStarted(false);
//         },
//         {
//           enableHighAccuracy: true,
//           maximumAge: 1000,
//           timeout: 1000,
//         }
//       );
//     } catch (err) {
//       console.error(err);
//       toast.error("Unable to start navigation");
//       setLoader(false);
//     }
//   };

//   const stopNavigation = () => {
//     if (watchIdRef.current) {
//       navigator.geolocation.clearWatch(watchIdRef.current);
//       watchIdRef.current = null;
//     }
//     setIsStarted(false);
//   };

//   useEffect(() => {
//     if (isStarted && currentCoords && destinationCoordsRef.current) {
//       fetchRoute(currentCoords, destinationCoordsRef.current);
//     }
//   }, [selectedMode]);

//   return (
//     <>
//       {loader && <Loader loadername="Calculating route..." />}

//       <div
//         style={{
//           display: "flex",
//           gap: "10px",
//           padding: "10px",
//           flexWrap: "wrap",
//           alignItems: "center",
//         }}
//       >
//         {!isStarted ? (
//           <button
//             onClick={startNavigation}
//             style={{
//               padding: "10px 16px",
//               borderRadius: "6px",
//               background: "#28a745",
//               color: "#fff",
//               border: "none",
//               cursor: "pointer",
//             }}
//           >
//             Start
//           </button>
//         ) : (
//           <button
//             onClick={stopNavigation}
//             style={{
//               padding: "10px 16px",
//               borderRadius: "6px",
//               background: "#dc3545",
//               color: "#fff",
//               border: "none",
//               cursor: "pointer",
//             }}
//           >
//             Stop
//           </button>
//         )}

//         <input
//           type="text"
//           placeholder="From location"
//           value={fromLocation}
//           readOnly
//           style={{
//             flex: 1,
//             padding: "8px",
//             borderRadius: "6px",
//             border: "1px solid #ccc",
//             minWidth: "180px",
//             background: "#f8f9fa",
//             color: "#111",
//           }}
//         />

//         <input
//           type="text"
//           placeholder="To location"
//           value={toLocation}
//           onChange={(e) => setToLocation(e.target.value)}
//           style={{
//             flex: 1,
//             padding: "8px",
//             borderRadius: "6px",
//             border: "1px solid #ccc",
//             minWidth: "180px",
//             color: "#111",
//           }}
//         />
//   <div style={{ padding: "10px", maxHeight: "30vh", overflowY: "auto" }}>
//         {routeData.map((rSet) =>
//           rSet.routes.map((route, idx) =>
//             route.sections.map((section, sIdx) => (
//               <div
//                 key={`${rSet.mode}-${idx}-${sIdx}`}
//                 style={{
//                   marginBottom: "10px",
//                   padding: "12px",
//                   borderRadius: "8px",
//                   background: "#fff",
//                   color: "black",
//                   boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
//                 }}
//               >
//                 <div style={{ fontWeight: 600 }}>
//                   Mode: {rSet.mode === "bicycle" ? "Bike" : rSet.mode}
//                 </div>
//                 <div>
//                   Distance:<b> {(section.summary.length / 1000).toFixed(2)}</b> km | Duration:{" "}
//                 <b>  {Math.ceil(section.summary.duration / 60)}</b> mins
//                 </div>

//                 {Array.isArray(section.actions) &&
//                   section.actions.map((action, index) => (
//                     <div
//                       key={index}
//                       style={{
//                         marginTop: "6px",
//                         fontSize: "14px",
//                         lineHeight: 1.4,
//                       }}
//                     >
//                       <li>
//                         {action.instruction || action.action}
//                       </li>                    </div>
//                   ))}
//               </div>
//             ))
//           ))
//         }

//         {currentCoords && (
//           <div
//             style={{
//               marginTop: "8px",
//               padding: "12px",
//               borderRadius: "8px",
//               background: "#f8f9fa",
//               color: "#111",
//               border: "1px solid #ddd",
//             }}
//           >
//             Current: {currentCoords.lat.toFixed(6)}, {currentCoords.lng.toFixed(6)}
//             {liveAccuracy ? ` | Accuracy: ${Math.round(liveAccuracy)} m` : ""}
//           </div>
//         )}
//       </div>
//         <div style={{ display: "flex", gap: "12px", marginLeft: "auto" }}>
//           {transportModes.map((mode) => (
//             <label
//               key={mode.value}
//               style={{
//                 display: "flex",
//                 alignItems: "center",
//                 gap: "4px",
//                 fontSize: "14px",
//               }}
//             >
//               <input
//                 type="radio"
//                 name="transport-mode"
//                 value={mode.value}
//                 checked={selectedMode === mode.value}
//                 onChange={() => setSelectedMode(mode.value)}
//               />
//               {mode.label}
//             </label>
//           ))}
//         </div>
//       </div>

//       <div ref={mapRef} style={{ width: "100%", height: "60vh" }} />

     
//     </>
//   );
// }
// export default HereMap