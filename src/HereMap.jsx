// import axios from "axios";
// import React, { useEffect, useRef, useState } from "react";
// import { toast } from "react-toastify";
// import Loader from "./Loader";

// const HereMap = ({
//   LAT,
//   LONG,
//   markers = [],
//   accuracy,
//   FromLocation,
//   ToLocation,
//   userAcceptedlivelatlong,
// }) => {
//   const mapRef = useRef(null);
//   const mapInstance = useRef(null);


//   const userMarkerRef = useRef(null);
//   const accuracyCircleRef = useRef(null);

//   const potholeGroupRef = useRef(null);
//   const incidentGroupRef = useRef(null);
//   const routePolylineRef = useRef([]); // ✅ Track route polylines

//   const [loader, setLoader] = useState(false);
//   const [data, setData] = useState([]);

//   /* 🚀 LOAD HERE MAP */
//   useEffect(() => {
//     let isMounted = true;

//     const loadScript = (src) =>
//       new Promise((resolve, reject) => {
//         if (document.querySelector(`script[src="${src}"]`)) {
//           resolve();
//           return;
//         }
//         const script = document.createElement("script");
//         script.src = src;
//         script.async = true;
//         script.onload = resolve;
//         script.onerror = reject;
//         document.body.appendChild(script);
//       });

//     const waitForHere = () =>
//       new Promise((resolve) => {
//         const check = () => {
//           if (window.H && window.H.service) resolve();
//           else setTimeout(check, 100);
//         };
//         check();
//       });

//     const initMap = async () => {
//       if (mapInstance.current) return;

//       await loadScript("https://js.api.here.com/v3/3.1/mapsjs-core.js");
//       await loadScript("https://js.api.here.com/v3/3.1/mapsjs-service.js");
//       await loadScript("https://js.api.here.com/v3/3.1/mapsjs-mapevents.js");
//       await loadScript("https://js.api.here.com/v3/3.1/mapsjs-ui.js");

//       await waitForHere();
//       if (!isMounted) return;

//       const platform = new window.H.service.Platform({
//         apikey: import.meta.env.VITE_HERE_API_KEY,
//       });

//       const defaultLayers = platform.createDefaultLayers();

//       const map = new window.H.Map(mapRef.current, defaultLayers.vector.normal.map, {
//         center: { lat: LAT || 12.9716, lng: LONG || 77.5946 },
//         zoom: 16,
//         pixelRatio: window.devicePixelRatio || 1,
//       });

//       new window.H.mapevents.Behavior(new window.H.mapevents.MapEvents(map));
//       window.H.ui.UI.createDefault(map, defaultLayers);

//       // Traffic layer
//       map.addLayer(defaultLayers.vector.traffic.map);

//       // Groups
//       potholeGroupRef.current = new window.H.map.Group();
//       incidentGroupRef.current = new window.H.map.Group();
//       map.addObject(potholeGroupRef.current);
//       map.addObject(incidentGroupRef.current);

//       mapInstance.current = map;

//       window.addEventListener("resize", () => map.getViewPort().resize());
//     };

//     initMap();
//     return () => {
//       isMounted = false;
//     };
//   }, []);

//   /* 🔵 LIVE LOCATION + ACCURACY */
//   useEffect(() => {
//     if (!mapInstance.current || !LAT || !LONG) return;

//     const map = mapInstance.current;
//     const coords = { lat: Number(LAT), lng: Number(LONG) };

//     map.setCenter(coords, true);

//     // User marker
//     if (!userMarkerRef.current) {
//       const icon = new window.H.map.Icon(
//         "https://cdn-icons-png.flaticon.com/512/684/684908.png",
//         { size: { w: 36, h: 36 } }
//       );
//       userMarkerRef.current = new window.H.map.Marker(coords, { icon });
//       map.addObject(userMarkerRef.current);
//     } else {
//       userMarkerRef.current.setGeometry(coords);
//     }

//     // Accuracy circle
//     if (accuracy) {
//       if (!accuracyCircleRef.current) {
//         accuracyCircleRef.current = new window.H.map.Circle(coords, accuracy, {
//           style: {
//             strokeColor: "rgba(0, 120, 255, 0.6)",
//             lineWidth: 2,
//             fillColor: "rgba(0, 120, 255, 0.2)",
//           },
//         });
//         map.addObject(accuracyCircleRef.current);
//       } else {
//         accuracyCircleRef.current.setCenter(coords);
//         accuracyCircleRef.current.setRadius(accuracy);
//       }
//     }
//   }, [LAT, LONG, accuracy]);

//   /* 🚧 Pothole Markers */
//   useEffect(() => {
//     if (!potholeGroupRef.current) return;

//     potholeGroupRef.current.removeAll();

//     markers.forEach((item) => {
//       const icon = new window.H.map.Icon(
//         "https://cdn-icons-png.flaticon.com/512/565/565547.png",
//         { size: { w: 30, h: 30 } }
//       );
//       const marker = new window.H.map.Marker(item.pos, { icon });
//       potholeGroupRef.current.addObject(marker);
//     });
//   }, [markers]);

//   /* 🚦 TRAFFIC INCIDENTS & ROUTE */
//   useEffect(() => {
//     if (!mapInstance.current || !LAT || !LONG || !FromLocation || !ToLocation) return;

//     const map = mapInstance.current;

//     const fetchRouteAndIncidents = async () => {
//       try {
//         setLoader(true);

//         // 1️⃣ Parallel geocode
//         const [fromRes, toRes] = await Promise.all([
//           axios.get(
//             `https://geocode.search.hereapi.com/v1/geocode?q=${FromLocation}&apiKey=${import.meta.env.VITE_HERE_API_KEY}`
//           ),
//           axios.get(
//             `https://geocode.search.hereapi.com/v1/geocode?q=${ToLocation}&apiKey=${import.meta.env.VITE_HERE_API_KEY}`
//           ),
//         ]);
//         const fromPos = userAcceptedlivelatlong || fromRes.data.items[0].position;
//         const toPos = toRes.data.items[0].position;

//         // 2️⃣ Get route polyline
//         const routeRes = await axios.get(
//           `https://router.hereapi.com/v8/routes?transportMode=car&origin=${fromPos.lat.toFixed(
//             6
//           )},${fromPos.lng.toFixed(6)}&destination=${toPos.lat},${toPos.lng}&return=polyline&apiKey=${import.meta.env.VITE_HERE_API_KEY
//           }`
//         );

//         const routeSections = routeRes.data.routes[0].sections;
//         // check the time and date destiation 
//         console.log(new Date(routeSections[0].departure.time).toTimeString(), `Destination Time u reach excepted  from ${userAcceptedlivelatlong ? userAcceptedlivelatlong : FromLocation}- to ${ToLocation}`)
//         setData(routeSections);

//         // ✅ Clear old route polylines
//         routePolylineRef.current.forEach((polyline) => map.removeObject(polyline));
//         routePolylineRef.current = [];

//         // Draw route
//         routeSections.forEach((section) => {
//           const lineString = window.H.geo.LineString.fromFlexiblePolyline(section.polyline);
//           const polyline = new window.H.map.Polyline(lineString, {
//             style: { strokeColor: "rgba(0, 128, 255, 0.7)", lineWidth: 6 },
//           });
//           map.addObject(polyline);
//           routePolylineRef.current.push(polyline);
//         });

//         setLoader(false);

//         // 3️⃣ Fetch traffic incidents asynchronously
//         axios
//           .get("https://data.traffic.hereapi.com/v7/incidents", {
//             params: {
//               apiKey: import.meta.env.VITE_HERE_API_KEY,
//               in: `circle:${LAT},${LONG};r=5000`,
//               locationReferencing: "shape",
//             },
//           })
//           .then((res) => {
//             const incidents = res.data.results;
//             incidents?.forEach((item) => {
//               const point = item.location?.shape?.links?.[0]?.points?.[0];
//               if (!point || !point.lat || !point.lng) return;

//               const icon = new window.H.map.Icon(
//                 "https://cdn-icons-png.flaticon.com/512/483/483408.png",
//                 { size: { w: 28, h: 28 } }
//               );
//               const marker = new window.H.map.Marker({ lat: point.lat, lng: point.lng }, { icon });
//               incidentGroupRef.current.addObject(marker);
//             });
//           })
//           .catch(console.error);
//       } catch (error) {
//         console.error(error);
//         toast.error("Map load error: " + (error.response?.data || error.message));
//         setLoader(false);
//       }
//     };

//     fetchRouteAndIncidents();
//   }, [LAT, LONG, FromLocation, ToLocation]);

//   return (
//     <>
//       {loader && <Loader loadername="Calculating the route" />}
//       <div ref={mapRef} style={{ width: "100%", height: "100vh" }} >

//         { }
//       </div>
//     </>
//   );
// };

// export default HereMap;
// import axios from "axios";
// import React, { useEffect, useRef, useState } from "react";
// import { toast } from "react-toastify";
// import Loader from "./Loader";

// const HereMap = ({
//   LAT,
//   LONG,
//   markers = [],
//   accuracy,
//   FromLocation,
//   ToLocation,
//   userAcceptedlivelatlong,
//   obstacles = [],
// }) => {
//   const mapRef = useRef(null);
//   const mapInstance = useRef(null);
//   const userMarkerRef = useRef(null);
//   const accuracyCircleRef = useRef(null);
//   const potholeGroupRef = useRef(null);
//   const incidentGroupRef = useRef(null);
//   const routePolylineRef = useRef({}); // store polylines by mode+routeIndex
//   const [loader, setLoader] = useState(false);
//   const [routeData, setRouteData] = useState([]);
//   const transportModes = ["car", "bicycle", "pedestrian"];

//   /* Load HERE Map */
//   useEffect(() => {
//     let isMounted = true;
//     const loadScript = (src) =>
//       new Promise((resolve, reject) => {
//         if (document.querySelector(`script[src="${src}"]`)) return resolve();
//         const script = document.createElement("script");
//         script.src = src;
//         script.async = true;
//         script.onload = resolve;
//         script.onerror = reject;
//         document.body.appendChild(script);
//       });

//     const waitForHere = () =>
//       new Promise((resolve) => {
//         const check = () => (window.H && window.H.service ? resolve() : setTimeout(check, 100));
//         check();
//       });

//     const initMap = async () => {
//       if (mapInstance.current) return;
//       await loadScript("https://js.api.here.com/v3/3.1/mapsjs-core.js");
//       await loadScript("https://js.api.here.com/v3/3.1/mapsjs-service.js");
//       await loadScript("https://js.api.here.com/v3/3.1/mapsjs-mapevents.js");
//       await loadScript("https://js.api.here.com/v3/3.1/mapsjs-ui.js");
//       await waitForHere();
//       if (!isMounted) return;

//       const platform = new window.H.service.Platform({ apikey: import.meta.env.VITE_HERE_API_KEY });
//       const defaultLayers = platform.createDefaultLayers();

//       const map = new window.H.Map(mapRef.current, defaultLayers.vector.normal.map, {
//         center: { lat: LAT || 12.9716, lng: LONG || 77.5946 },
//         zoom: 16,
//         pixelRatio: window.devicePixelRatio || 1,
//       });

//       new window.H.mapevents.Behavior(new window.H.mapevents.MapEvents(map));
//       window.H.ui.UI.createDefault(map, defaultLayers);
//       map.addLayer(defaultLayers.vector.traffic.map);

//       potholeGroupRef.current = new window.H.map.Group();
//       incidentGroupRef.current = new window.H.map.Group();
//       map.addObject(potholeGroupRef.current);
//       map.addObject(incidentGroupRef.current);

//       mapInstance.current = map;
//       window.addEventListener("resize", () => map.getViewPort().resize());
//     };

//     initMap();
//     return () => (isMounted = false);
//   }, []);

//   /* Live Location + Accuracy */
//   useEffect(() => {
//     if (!mapInstance.current || !LAT || !LONG) return;
//     const map = mapInstance.current;
//     const coords = { lat: Number(LAT), lng: Number(LONG) };
//     map.setCenter(coords, true);

//     if (!userMarkerRef.current) {
//       const icon = new window.H.map.Icon("https://cdn-icons-png.flaticon.com/512/684/684908.png", { size: { w: 36, h: 36 } });
//       userMarkerRef.current = new window.H.map.Marker(coords, { icon });
//       map.addObject(userMarkerRef.current);
//     } else userMarkerRef.current.setGeometry(coords);

//     if (accuracy) {
//       if (!accuracyCircleRef.current) {
//         accuracyCircleRef.current = new window.H.map.Circle(coords, accuracy, {
//           style: { strokeColor: "rgba(0, 120, 255, 0.6)", lineWidth: 2, fillColor: "rgba(0, 120, 255, 0.2)" },
//         });
//         map.addObject(accuracyCircleRef.current);
//       } else {
//         accuracyCircleRef.current.setCenter(coords);
//         accuracyCircleRef.current.setRadius(accuracy);
//       }
//     }
//   }, [LAT, LONG, accuracy]);

//   /* Potholes */
//   useEffect(() => {
//     if (!potholeGroupRef.current) return;
//     potholeGroupRef.current.removeAll();
//     markers.forEach((item) => {
//       const icon = new window.H.map.Icon("https://cdn-icons-png.flaticon.com/512/565/565547.png", { size: { w: 30, h: 30 } });
//       potholeGroupRef.current.addObject(new window.H.map.Marker(item.pos, { icon }));
//     });
//   }, [markers]);

//   /* Routes + Obstacles */
//   useEffect(() => {
//     if (!mapInstance.current || !LAT || !LONG || !FromLocation || !ToLocation) return;
//     const map = mapInstance.current;

//     const fetchRoutes = async () => {
//       try {
//         setLoader(true);
//         const [fromRes, toRes] = await Promise.all([
//           axios.get(`https://geocode.search.hereapi.com/v1/geocode?q=${FromLocation}&apiKey=${import.meta.env.VITE_HERE_API_KEY}`),
//           axios.get(`https://geocode.search.hereapi.com/v1/geocode?q=${ToLocation}&apiKey=${import.meta.env.VITE_HERE_API_KEY}`),
//         ]);

//         const fromPos = userAcceptedlivelatlong || fromRes.data.items[0].position;
//         const toPos = toRes.data.items[0].position;

//         const allRoutes = [];
//         for (let mode of transportModes) {
//           const avoidAreas = obstacles.map((o) => `bbox:${o.topLeft[1]},${o.bottomRight[0]},${o.bottomRight[1]},${o.topLeft[0]}`).join("|");
//           const url = `https://router.hereapi.com/v8/routes?transportMode=${mode}&origin=${fromPos.lat.toFixed(
//             6
//           )},${fromPos.lng.toFixed(6)}&destination=${toPos.lat},${toPos.lng}&alternatives=1&return=polyline,summary&routingMode=fast${avoidAreas ? `&avoid[areas]=${avoidAreas}` : ""}&traffic[enabled]=true&apikey=${import.meta.env.VITE_HERE_API_KEY}`;

//           const res = await axios.get(url);
//           allRoutes.push({ mode, routes: res.data.routes });
//         }

//         setRouteData(allRoutes);

//         // Draw polylines without removing existing unnecessarily
//         allRoutes.forEach((rSet) => {
//           rSet.routes.forEach((route, idx) => {
//             route.sections.forEach((section, sIdx) => {
//               const key = `${rSet.mode}-${idx}-${sIdx}`;
//               const lineString = window.H.geo.LineString.fromFlexiblePolyline(section.polyline);
//               if (routePolylineRef.current[key]) {
//                 routePolylineRef.current[key].setGeometry(lineString);
//               } else {
//                 const polyline = new window.H.map.Polyline(lineString, {
//                   style: { strokeColor: idx === 0 ? "#007bff" : "#28a745", lineWidth: 5 },
//                 });
//                 map.addObject(polyline);
//                 routePolylineRef.current[key] = polyline;
//               }
//             });
//           });
//         });

//         setLoader(false);
//       } catch (err) {
//         console.error(err);
//         toast.error("Map load error: " + (err.response?.data || err.message));
//         setLoader(false);
//       }
//     };

//     fetchRoutes();
//   }, [LAT, LONG, FromLocation, ToLocation, obstacles]);

//   return (
//     <>

//       <div ref={mapRef} style={{ width: "100%", height: "70vh" }} />

//       <div
//         style={{
//           padding: "12px",
//           background: "#f9f9f9",
//           maxHeight: "35vh",
//           overflowY: "auto",
//           WebkitOverflowScrolling: "touch",
//         }}
//       >
//         {routeData.map((rSet) =>
//           rSet.routes.map((route, idx) =>
//             route.sections.map((section, sIdx) => (
//               <div
//                 key={`${rSet.mode}-${idx}-${sIdx}`}
//                 style={{
//                   marginBottom: "10px",
//                   padding: "12px",
//                   borderRadius: "10px",
//                   background: "#fff",
//                   boxShadow: "0px 2px 8px rgba(0,0,0,0.08)",
//                   display: "flex",
//                   flexDirection: "column",
//                   justifyContent: "space-between",
//                   gap: "6px",
//                 }}
//               >
//                 <div style={{ fontWeight: "600", fontSize: "15px", color: "#222" }}>Mode: {rSet.mode}</div>
//                 <div style={{ fontSize: "13px", color: "#555" }}>
//                   Distance: <strong>{(section.summary.length / 1000).toFixed(2)} km</strong> | Duration:{" "}
//                   <strong>{Math.ceil(section.summary.duration / 60)} mins</strong>
//                 </div>
//                 <div style={{ fontSize: "12px", color: "#888", textAlign: "right" }}>
//                   Expected arrival: {new Date(section.departure.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
//                 </div>
//               </div>
//             ))
//           )
//         )}
//       </div>
//     </>
//   );
// };

// export default HereMap;
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import Loader from "./Loader";

const HereMap = ({ LAT, LONG, markers = [], accuracy, obstacles = [] }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const userMarkerRef = useRef(null);
  const accuracyCircleRef = useRef(null);
  const potholeGroupRef = useRef(null);
  const routePolylineRef = useRef({});
  const [loader, setLoader] = useState(false);
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [routeData, setRouteData] = useState([]);
  const transportModes = ["car", "bicycle", "pedestrian"];

  // Initialize HERE Map
  useEffect(() => {
    let isMounted = true;

    const loadScript = (src) =>
      new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) return resolve();
        const script = document.createElement("script");
        script.src = src;
        script.async = true;
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });

    const waitForHere = () =>
      new Promise((resolve) => {
        const check = () => (window.H && window.H.service ? resolve() : setTimeout(check, 100));
        check();
      });

    const initMap = async () => {
      if (mapInstance.current) return;

      await loadScript("https://js.api.here.com/v3/3.1/mapsjs-core.js");
      await loadScript("https://js.api.here.com/v3/3.1/mapsjs-service.js");
      await loadScript("https://js.api.here.com/v3/3.1/mapsjs-mapevents.js");
      await loadScript("https://js.api.here.com/v3/3.1/mapsjs-ui.js");
      await waitForHere();
      if (!isMounted) return;

      const platform = new window.H.service.Platform({ apikey: import.meta.env.VITE_HERE_API_KEY });
      const defaultLayers = platform.createDefaultLayers();

      const map = new window.H.Map(mapRef.current, defaultLayers.vector.normal.map, {
        center: { lat: LAT || 12.9716, lng: LONG || 77.5946 },
        zoom: 16,
        pixelRatio: window.devicePixelRatio || 1,
      });

      new window.H.mapevents.Behavior(new window.H.mapevents.MapEvents(map));
      window.H.ui.UI.createDefault(map, defaultLayers);
      map.addLayer(defaultLayers.vector.traffic.map);

      potholeGroupRef.current = new window.H.map.Group();
      map.addObject(potholeGroupRef.current);

      mapInstance.current = map;
      window.addEventListener("resize", () => map.getViewPort().resize());
    };

    initMap();
    return () => (isMounted = false);
  }, []);

  // Live Location + Accuracy
  useEffect(() => {
    if (!mapInstance.current || !LAT || !LONG) return;
    const map = mapInstance.current;
    const coords = { lat: Number(LAT), lng: Number(LONG) };
    map.setCenter(coords, true);

    if (!userMarkerRef.current) {
      const icon = new window.H.map.Icon(
        "https://cdn-icons-png.flaticon.com/512/684/684908.png",
        { size: { w: 36, h: 36 } }
      );
      userMarkerRef.current = new window.H.map.Marker(coords, { icon });
      map.addObject(userMarkerRef.current);
    } else userMarkerRef.current.setGeometry(coords);

    if (accuracy) {
      if (!accuracyCircleRef.current) {
        accuracyCircleRef.current = new window.H.map.Circle(coords, accuracy, {
          style: { strokeColor: "rgba(0,120,255,0.6)", lineWidth: 2, fillColor: "rgba(0,120,255,0.2)" },
        });
        map.addObject(accuracyCircleRef.current);
      } else {
        accuracyCircleRef.current.setCenter(coords);
        accuracyCircleRef.current.setRadius(accuracy);
      }
    }
  }, [LAT, LONG, accuracy]);

  // Potholes
  useEffect(() => {
    if (!potholeGroupRef.current) return;
    potholeGroupRef.current.removeAll();
    markers.forEach((item) => {
      const icon = new window.H.map.Icon(
        "https://cdn-icons-png.flaticon.com/512/565/565547.png",
        { size: { w: 30, h: 30 } }
      );
      potholeGroupRef.current.addObject(new window.H.map.Marker(item.pos, { icon }));
    });
  }, [markers]);

  // Fetch Routes on Search
  const handleSearch = async () => {
    if (!fromLocation || !toLocation) {
      toast.warning("Please enter both From and To locations");
      return;
    }

    if (!mapInstance.current) return;
    const map = mapInstance.current;

    try {
      setLoader(true);
      const [fromRes, toRes] = await Promise.all([
        axios.get(`https://geocode.search.hereapi.com/v1/geocode?q=${fromLocation}&apiKey=${import.meta.env.VITE_HERE_API_KEY}`),
        axios.get(`https://geocode.search.hereapi.com/v1/geocode?q=${toLocation}&apiKey=${import.meta.env.VITE_HERE_API_KEY}`),
      ]);

      const fromPos = fromRes.data.items[0].position;
      const toPos = toRes.data.items[0].position;

      const allRoutes = [];
      for (let mode of transportModes) {
        const avoidAreas = obstacles.map((o) => `bbox:${o.topLeft[1]},${o.bottomRight[0]},${o.bottomRight[1]},${o.topLeft[0]}`).join("|");
        const url = `https://router.hereapi.com/v8/routes?transportMode=${mode}&origin=${fromPos.lat.toFixed(
          6
        )},${fromPos.lng.toFixed(6)}&destination=${toPos.lat},${toPos.lng}&alternatives=1&return=polyline,summary&routingMode=fast${
          avoidAreas ? `&avoid[areas]=${avoidAreas}` : ""
        }&traffic[enabled]=true&apikey=${import.meta.env.VITE_HERE_API_KEY}`;

        const res = await axios.get(url);
        allRoutes.push({ mode, routes: res.data.routes });
      }

      setRouteData(allRoutes);

      // Draw polylines
      allRoutes.forEach((rSet) => {
        rSet.routes.forEach((route, idx) => {
          route.sections.forEach((section, sIdx) => {
            const key = `${rSet.mode}-${idx}-${sIdx}`;
            const lineString = window.H.geo.LineString.fromFlexiblePolyline(section.polyline);
            if (routePolylineRef.current[key]) routePolylineRef.current[key].setGeometry(lineString);
            else {
              const polyline = new window.H.map.Polyline(lineString, {
                style: { strokeColor: idx === 0 ? "#007bff" : "#28a745", lineWidth: 5 },
              });
              map.addObject(polyline);
              routePolylineRef.current[key] = polyline;
            }
          });
        });
      });

      setLoader(false);
    } catch (err) {
      console.error(err);
      toast.error("Route fetch error: " + (err.response?.data || err.message));
      setLoader(false);
    }
  };

  return (
    <>
      {loader && <Loader loadername="Calculating route..." />}
      <div style={{ display: "flex", gap: "10px", padding: "10px" }}>
        <input
          type="text"
          placeholder="From location"
          value={fromLocation}
          onChange={(e) => setFromLocation(e.target.value)}
          style={{ flex: 1, padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }}
        />
        <input
          type="text"
          placeholder="To location"
          value={toLocation}
          onChange={(e) => setToLocation(e.target.value)}
          style={{ flex: 1, padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }}
        />
        <button
          onClick={handleSearch}
          style={{
            padding: "8px 16px",
            borderRadius: "6px",
            background: "#007bff",
            color: "#fff",
            border: "none",
            cursor: "pointer",
          }}
        >
          Search
        </button>
      </div>

      <div ref={mapRef} style={{ width: "100%", height: "60vh" }} />

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
                  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                }}
              >
                <div style={{ fontWeight: 600 }}>Mode: {rSet.mode}</div>
                <div>
                  Distance: {(section.summary.length / 1000).toFixed(2)} km | Duration:{" "}
                  {Math.ceil(section.summary.duration / 60)} mins
                </div>
                <div style={{ fontSize: "12px", color: "#555", textAlign: "right" }}>
                  Arrival:{" "}
                  {new Date(section.departure.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            ))
          )
        )}
      </div>
    </>
  );
};

export default HereMap;