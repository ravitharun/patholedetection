// import React, { useEffect, useRef } from "react";

// const HereMap = ({ LAT, LONG, markers = [] }) => {
//   const mapRef = useRef(null);
//   const mapInstance = useRef(null);
//   const userMarkerRef = useRef(null);
//   const potholeGroupRef = useRef(null);

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
//       if (mapInstance.current) return; // prevent double init

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

//       const map = new window.H.Map(
//         mapRef.current,
//         defaultLayers.vector.normal.map,
//         {
//           center: {
//             lat: LAT || 12.9716,
//             lng: LONG || 77.5946,
//           },
//           zoom: 16,
//           pixelRatio: window.devicePixelRatio || 1,
//         }
//       );

//       // Enable interactions
//       const behavior = new window.H.mapevents.Behavior(
//         new window.H.mapevents.MapEvents(map)
//       );

//       window.H.ui.UI.createDefault(map, defaultLayers);

//       // ✅ TRAFFIC LAYER
//       const trafficLayer = defaultLayers.vector.traffic.map;
//       map.addLayer(trafficLayer);

//       // Group for potholes
//       potholeGroupRef.current = new window.H.map.Group();
//       map.addObject(potholeGroupRef.current);

//       mapInstance.current = map;

//       window.addEventListener("resize", () => {
//         map.getViewPort().resize();
//       });
//     };

//     initMap();

//     return () => {
//       isMounted = false;
//     };
//   }, []);

//   /* 🔵 LIVE LOCATION UPDATE */
//   useEffect(() => {
//     if (!mapInstance.current || !LAT || !LONG) return;

//     const map = mapInstance.current;
//     const coords = { lat: Number(LAT), lng: Number(LONG) };

//     // Smooth center
//     map.setCenter(coords, true);

//     if (!userMarkerRef.current) {
//       const icon = new window.H.map.Icon(
//         "https://cdn-icons-png.flaticon.com/512/684/684908.png",
//         { size: { w: 36, h: 36 } }
//       );

//       const marker = new window.H.map.Marker(coords, { icon });
//       map.addObject(marker);
//       userMarkerRef.current = marker;
//     } else {
//       userMarkerRef.current.setGeometry(coords);
//     }
//   }, [LAT, LONG]);

//   /* 🚧 Pothole Markers */
//   useEffect(() => {
//     if (!mapInstance.current || !potholeGroupRef.current) return;

//     const group = potholeGroupRef.current;
//     group.removeAll();

//     markers.forEach((item) => {
//       const icon = new window.H.map.Icon(
//         "https://cdn-icons-png.flaticon.com/512/565/565547.png",
//         { size: { w: 30, h: 30 } }
//       );

//       const marker = new window.H.map.Marker(item.pos, { icon });
//       group.addObject(marker);
//     });
//   }, [markers]);

//   return (
//     <div
//       ref={mapRef}
//       style={{
//         width: "100%",
//         height: "100vh",
//       }}
//     />
//   );
// };
// export default HereMap;












































// Tharun
// import axios from "axios";
// import React, { useEffect, useRef } from "react";

// const HereMap = ({ LAT, LONG, markers = [], accuracy }) => {
//   const mapRef = useRef(null);
//   const mapInstance = useRef(null);

//   const userMarkerRef = useRef(null);
//   const accuracyCircleRef = useRef(null);

//   const potholeGroupRef = useRef(null);
//   const incidentGroupRef = useRef(null);

//   const prevCoords = useRef(null);

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

//       const map = new window.H.Map(
//         mapRef.current,
//         defaultLayers.vector.normal.map,
//         {
//           center: { lat: LAT || 12.9716, lng: LONG || 77.5946 },
//           zoom: 16,
//           pixelRatio: window.devicePixelRatio || 1,
//         }
//       );

//       new window.H.mapevents.Behavior(
//         new window.H.mapevents.MapEvents(map)
//       );

//       window.H.ui.UI.createDefault(map, defaultLayers);

//       // ✅ Traffic layer
//       map.addLayer(defaultLayers.vector.traffic.map);

//       // ✅ Groups
//       potholeGroupRef.current = new window.H.map.Group();
//       incidentGroupRef.current = new window.H.map.Group();

//       map.addObject(potholeGroupRef.current);
//       map.addObject(incidentGroupRef.current);

//       mapInstance.current = map;

//       window.addEventListener("resize", () => {
//         map.getViewPort().resize();
//       });
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

//     // 👤 User Marker
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

//     // 🎯 Accuracy Circle
//     if (accuracy) {
//       if (!accuracyCircleRef.current) {
//         accuracyCircleRef.current = new window.H.map.Circle(
//           coords,
//           accuracy,
//           {
//             style: {
//               strokeColor: "rgba(0, 120, 255, 0.6)",
//               lineWidth: 2,
//               fillColor: "rgba(0, 120, 255, 0.2)",
//             },
//           }
//         );

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
// useEffect(() => {
//   if (!mapInstance.current || !LAT || !LONG) return;

//   const fetchIncidents = async () => {
//     try {
//       const res = await axios.get(
//         "https://data.traffic.hereapi.com/v7/incidents",
//         {
//           params: {
//             apiKey: import.meta.env.VITE_HERE_API_KEY,
//             in: `circle:${LAT},${LONG};r=5000`,
//             locationReferencing: "shape",
//           },
//         }
//       );

//       const data = res.data;

//       // 🔥 clear old markers
//       if (incidentGroupRef.current) {
//         incidentGroupRef.current.removeAll();
//       }

//       if (!data.results) return;

//       data.results.forEach((item) => {
//         const point =
//           item.location?.shape?.links?.[0]?.points?.[0];

//         // ✅ skip invalid data
//         if (!point || !point.lat || !point.lng) return;

//         // ✅ SAFE ICON (no lock issue)
//         const icon = new window.H.map.Icon(
//           "https://upload.wikimedia.org/wikipedia/commons/e/ec/RedDot.svg",
//           { size: { w: 20, h: 20 } }
//         );

//         const marker = new window.H.map.Marker(
//           { lat: point.lat, lng: point.lng },
//           { icon }
//         );

//         // ✅ OPTIONAL: popup text
//         marker.setData(item.description?.value || "Traffic");

//         incidentGroupRef.current.addObject(marker);
//       });

//     } catch (error) {
//       console.log("ERROR:", error.response?.data || error.message);
//     }
//   };

//   fetchIncidents();
// }, [LAT, LONG]);
//   /* 🚦 TRAFFIC INCIDENTS (FIXED) */
//   useEffect(() => {
//     if (!mapInstance.current || !LAT || !LONG) return;

//     const fetchIncidents = async () => {
//       // 🔥 Avoid frequent calls (small movement skip)
//       if (prevCoords.current) {
//         const diff =
//           Math.abs(prevCoords.current.lat - LAT) +
//           Math.abs(prevCoords.current.lng - LONG);

//         if (diff < 0.001) return;
//       }

//       prevCoords.current = { lat: LAT, lng: LONG };

//       try {
//         const res = await axios.get(
//           "https://data.traffic.hereapi.com/v7/incidents",
//           {
//             params: {
//               apiKey: import.meta.env.VITE_HERE_API_KEY,
//               in: `circle:${LAT},${LONG};r=5000`, // ✅ dynamic
//               locationReferencing: "shape",
//             },
//           }
//         );

//         const data = res.data;

//         if (incidentGroupRef.current) {
//           incidentGroupRef.current.removeAll();
//         }

//         if (!data.results) return;

//         data.results.forEach((item) => {
//           const point =
//             item.location?.shape?.links?.[0]?.points?.[0];

//           if (!point) return;

//           // 🚦 Traffic icon (different from pothole)
//           const icon = new window.H.map.Icon(
//             "https://cdn-icons-png.flaticon.com/512/483/483408.png",
//             { size: { w: 28, h: 28 } }
//           );

//           const marker = new window.H.map.Marker(
//             { lat: point.lat, lng: point.lng },
//             { icon }
//           );

//           incidentGroupRef.current.addObject(marker);
//         });
//       } catch (error) {
//         console.log(
//           "❌ ERROR:",
//           error.response?.data || error.message
//         );
//       }
//     };

//     fetchIncidents();
//   }, [LAT, LONG]);

//   return (
//     <div
//       ref={mapRef}
//       style={{ width: "100%", height: "100vh" }}
//     />
//   );
// };
import axios from "axios";
import React, { useEffect, useRef } from "react";

const HereMap = ({ LAT, LONG, markers = [], accuracy }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  const userMarkerRef = useRef(null);
  const accuracyCircleRef = useRef(null);

  const potholeGroupRef = useRef(null);
  const incidentGroupRef = useRef(null);

  const prevCoords = useRef(null);

  /* 🚀 LOAD HERE MAP */
  useEffect(() => {
    let isMounted = true;

    const loadScript = (src) =>
      new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve();
          return;
        }
        const script = document.createElement("script");
        script.src = src;
        script.async = true;
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });

    const waitForHere = () =>
      new Promise((resolve) => {
        const check = () => {
          if (window.H && window.H.service) resolve();
          else setTimeout(check, 100);
        };
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

      const platform = new window.H.service.Platform({
        apikey: import.meta.env.VITE_HERE_API_KEY,
      });

      const defaultLayers = platform.createDefaultLayers();

      const map = new window.H.Map(
        mapRef.current,
        defaultLayers.vector.normal.map,
        {
          center: { lat: LAT || 12.9716, lng: LONG || 77.5946 },
          zoom: 16,
          pixelRatio: window.devicePixelRatio || 1,
        }
      );

      new window.H.mapevents.Behavior(
        new window.H.mapevents.MapEvents(map)
      );

      window.H.ui.UI.createDefault(map, defaultLayers);

      // ✅ Traffic layer
      map.addLayer(defaultLayers.vector.traffic.map);

      // ✅ Groups
      potholeGroupRef.current = new window.H.map.Group();
      incidentGroupRef.current = new window.H.map.Group();

      map.addObject(potholeGroupRef.current);
      map.addObject(incidentGroupRef.current);

      mapInstance.current = map;

      window.addEventListener("resize", () => {
        map.getViewPort().resize();
      });
    };

    initMap();

    return () => {
      isMounted = false;
    };
  }, []);

  /* 🔵 LIVE LOCATION + ACCURACY */
  useEffect(() => {
    if (!mapInstance.current || !LAT || !LONG) return;

    const map = mapInstance.current;
    const coords = { lat: Number(LAT), lng: Number(LONG) };

    map.setCenter(coords, true);

    // 👤 User Marker
    if (!userMarkerRef.current) {
      const icon = new window.H.map.Icon(
        "https://cdn-icons-png.flaticon.com/512/684/684908.png",
        { size: { w: 36, h: 36 } }
      );

      userMarkerRef.current = new window.H.map.Marker(coords, { icon });
      map.addObject(userMarkerRef.current);
    } else {
      userMarkerRef.current.setGeometry(coords);
    }

    // 🎯 Accuracy Circle
    if (accuracy) {
      if (!accuracyCircleRef.current) {
        accuracyCircleRef.current = new window.H.map.Circle(
          coords,
          accuracy,
          {
            style: {
              strokeColor: "rgba(0, 120, 255, 0.6)",
              lineWidth: 2,
              fillColor: "rgba(0, 120, 255, 0.2)",
            },
          }
        );

        map.addObject(accuracyCircleRef.current);
      } else {
        accuracyCircleRef.current.setCenter(coords);
        accuracyCircleRef.current.setRadius(accuracy);
      }
    }
  }, [LAT, LONG, accuracy]);

  /* 🚧 Pothole Markers */
  useEffect(() => {
    if (!potholeGroupRef.current) return;

    potholeGroupRef.current.removeAll();

    markers.forEach((item) => {
      const icon = new window.H.map.Icon(
        "https://cdn-icons-png.flaticon.com/512/565/565547.png",
        { size: { w: 30, h: 30 } }
      );

      const marker = new window.H.map.Marker(item.pos, { icon });

      potholeGroupRef.current.addObject(marker);
    });
  }, [markers]);

  /* 🚦 TRAFFIC INCIDENTS */
  useEffect(() => {
    if (!mapInstance.current || !LAT || !LONG) return;

    // 🔥 Avoid frequent calls if user barely moved
    if (prevCoords.current) {
      const diff =
        Math.abs(prevCoords.current.lat - LAT) +
        Math.abs(prevCoords.current.lng - LONG);

      if (diff < 0.001) return;
    }

    prevCoords.current = { lat: LAT, lng: LONG };

    const fetchIncidents = async () => {
      try {
        const res = await axios.get(
          "https://data.traffic.hereapi.com/v7/incidents",
          {
            params: {
              apiKey: import.meta.env.VITE_HERE_API_KEY,
              in: `circle:${LAT},${LONG};r=5000`,
              locationReferencing: "shape",
            },
          }
        );

        const data = res.data;
        console.log(res.data,"res.data")

        if (incidentGroupRef.current) {
          incidentGroupRef.current.removeAll();
        }

        if (!data.results) return;

        data.results.forEach((item) => {
          const point =
            item.location?.shape?.links?.[0]?.points?.[0];

          if (!point || !point.lat || !point.lng) return;

          const icon = new window.H.map.Icon(
            "https://cdn-icons-png.flaticon.com/512/483/483408.png",
            { size: { w: 28, h: 28 } }
          );

          const marker = new window.H.map.Marker(
            { lat: point.lat, lng: point.lng },
            { icon }
          );

          incidentGroupRef.current.addObject(marker);
        });
      } catch (error) {
        console.log(
          "❌ ERROR:",
          error.response?.data || error.message
        );
      }
    };

    fetchIncidents();
  }, [LAT, LONG]);

  return (
    <div
      ref={mapRef}
      style={{ width: "100%", height: "100vh" }}
    />
  );
};

export default HereMap;
// export default HereMap;
// import React, { useEffect, useRef } from "react";

// const HereMap = ({ LAT, LONG, accuracy }) => {
//   const mapRef = useRef(null);
//   const mapInstance = useRef(null);
//   const userMarkerRef = useRef(null);
//   const accuracyCircleRef = useRef(null);
//   console.log(LAT, LONG, accuracy, "markers")
//   useEffect(() => {
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

//       const platform = new window.H.service.Platform({
//         apikey: import.meta.env.VITE_HERE_API_KEY,
//       });

//       const defaultLayers = platform.createDefaultLayers();

//       const map = new window.H.Map(
//         mapRef.current,
//         defaultLayers.vector.normal.map,
//         {
//           center: { lat: LAT || 12.9716, lng: LONG || 77.5946 },
//           zoom: 15,
//           pixelRatio: window.devicePixelRatio || 1,
//         }
//       );
//       const zoom = map.getZoom();

//       console.log({platform,zoom}, "platform")
//       // Enable interactions
//       new window.H.mapevents.Behavior(
//         new window.H.mapevents.MapEvents(map)
//       );

//       window.H.ui.UI.createDefault(map, defaultLayers);

//       // ✅ TRAFFIC FLOW LAYER
//       map.addLayer(defaultLayers.vector.traffic.map);

//       mapInstance.current = map;

//       window.addEventListener("resize", () => {
//         map.getViewPort().resize();
//       });
//     };

//     initMap();
//   }, []);

//   // 🔵 Live Location + Accuracy
//   useEffect(() => {
//     if (!mapInstance.current || !LAT || !LONG) return;

//     const map = mapInstance.current;
//     const coords = { lat: Number(LAT), lng: Number(LONG) };

//     map.setCenter(coords, true);

//     if (!userMarkerRef.current) {
//       userMarkerRef.current = new window.H.map.Marker(coords);
//       map.addObject(userMarkerRef.current);
//     } else {
//       userMarkerRef.current.setGeometry(coords);
//     }

//     if (accuracy) {
//       if (!accuracyCircleRef.current) {
//         accuracyCircleRef.current = new window.H.map.Circle(
//           coords,
//           accuracy,
//           {
//             style: {
//               strokeColor: "rgba(0, 128, 255, 0.6)",
//               fillColor: "rgba(0, 128, 255, 0.2)",
//               lineWidth: 2,
//             },
//           }
//         );
//         map.addObject(accuracyCircleRef.current);
//       } else {
//         accuracyCircleRef.current.setCenter(coords);
//         accuracyCircleRef.current.setRadius(accuracy);
//       }
//     }
//   }, [LAT, LONG, accuracy]);

//   return (
//     <div
//       ref={mapRef}
//       style={{ width: "100%", height: "100vh" }}
//     />
//   );
// };

// export default HereMap;