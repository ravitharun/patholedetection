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
// import React, { useEffect, useRef } from "react";

// const HereMap = ({ LAT, LONG, markers = [], accuracy }) => {
//   const mapRef = useRef(null);
//   const mapInstance = useRef(null);
//   const userMarkerRef = useRef(null);
//   const accuracyCircleRef = useRef(null);
//   const potholeGroupRef = useRef(null);
//   const incidentGroupRef = useRef(null);

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

//       // Traffic Flow Layer
//       map.addLayer(defaultLayers.vector.traffic.map);

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
//     return () => (isMounted = false);
//   }, []);

//   /* 🔵 LIVE LOCATION + ACCURACY CIRCLE */
//   useEffect(() => {
//     if (!mapInstance.current || !LAT || !LONG) return;

//     const map = mapInstance.current;
//     const coords = { lat: Number(LAT), lng: Number(LONG) };

//     map.setCenter(coords, true);

//     // User Marker
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

//     // Accuracy Circle
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

//   /* 🚦 TRAFFIC INCIDENTS */
//   useEffect(() => {
//     if (!mapInstance.current || !LAT || !LONG) return;

//     const fetchIncidents = async () => {
//       const bbox = `${LONG - 0.05},${LAT - 0.05},${LONG + 0.05},${LAT + 0.05}`;

//       const res = await fetch(
//         `https://traffic.ls.hereapi.com/traffic/6.3/incidents.json?apiKey=${import.meta.env.VITE_HERE_API_KEY}&bbox=${bbox}&criticality=major`
//       );

//       const data = await res.json();

//       incidentGroupRef.current.removeAll();

//       if (!data.TRAFFICITEMS) return;

//       data.TRAFFICITEMS.TRAFFICITEM.forEach((item) => {
//         const location = item.LOCATION.GEOLOC.ORIGIN;
//         const description = item.TRAFFICITEMDESCRIPTION[0].value;

//         const marker = new window.H.map.Marker({
//           lat: location.LATITUDE,
//           lng: location.LONGITUDE,
//         });

//         marker.setData(description);

//         marker.addEventListener("tap", function (evt) {
//           const bubble = new window.H.ui.InfoBubble(
//             evt.target.getGeometry(),
//             { content: evt.target.getData() }
//           );
//           mapInstance.current.getUi().addBubble(bubble);
//         });

//         incidentGroupRef.current.addObject(marker);
//       });
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

// export default HereMap;
import React, { useEffect, useRef } from "react";

const HereMap = ({ LAT, LONG, accuracy }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const userMarkerRef = useRef(null);
  const accuracyCircleRef = useRef(null);

  useEffect(() => {
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

      const platform = new window.H.service.Platform({
        apikey: import.meta.env.VITE_HERE_API_KEY,
      });

      const defaultLayers = platform.createDefaultLayers();

      const map = new window.H.Map(
        mapRef.current,
        defaultLayers.vector.normal.map,
        {
          center: { lat: LAT || 12.9716, lng: LONG || 77.5946 },
          zoom: 15,
          pixelRatio: window.devicePixelRatio || 1,
        }
      );

      // Enable interactions
      new window.H.mapevents.Behavior(
        new window.H.mapevents.MapEvents(map)
      );

      window.H.ui.UI.createDefault(map, defaultLayers);

      // ✅ TRAFFIC FLOW LAYER
      map.addLayer(defaultLayers.vector.traffic.map);

      mapInstance.current = map;

      window.addEventListener("resize", () => {
        map.getViewPort().resize();
      });
    };

    initMap();
  }, []);

  // 🔵 Live Location + Accuracy
  useEffect(() => {
    if (!mapInstance.current || !LAT || !LONG) return;

    const map = mapInstance.current;
    const coords = { lat: Number(LAT), lng: Number(LONG) };

    map.setCenter(coords, true);

    if (!userMarkerRef.current) {
      userMarkerRef.current = new window.H.map.Marker(coords);
      map.addObject(userMarkerRef.current);
    } else {
      userMarkerRef.current.setGeometry(coords);
    }

    if (accuracy) {
      if (!accuracyCircleRef.current) {
        accuracyCircleRef.current = new window.H.map.Circle(
          coords,
          accuracy,
          {
            style: {
              strokeColor: "rgba(0, 128, 255, 0.6)",
              fillColor: "rgba(0, 128, 255, 0.2)",
              lineWidth: 2,
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

  return (
    <div
      ref={mapRef}
      style={{ width: "100%", height: "100vh" }}
    />
  );
};

export default HereMap;