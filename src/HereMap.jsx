import React, { useEffect, useRef } from "react";

const HereMap = ({ LAT, LONG, markers = [] }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const userMarkerRef = useRef(null);
  const potholeGroupRef = useRef(null);

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
      if (mapInstance.current) return; // prevent double init

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
          center: {
            lat: LAT || 12.9716,
            lng: LONG || 77.5946,
          },
          zoom: 16,
          pixelRatio: window.devicePixelRatio || 1,
        }
      );

      // Enable interactions
      const behavior = new window.H.mapevents.Behavior(
        new window.H.mapevents.MapEvents(map)
      );

      window.H.ui.UI.createDefault(map, defaultLayers);

      // ✅ TRAFFIC LAYER
      const trafficLayer = defaultLayers.vector.traffic.map;
      map.addLayer(trafficLayer);

      // Group for potholes
      potholeGroupRef.current = new window.H.map.Group();
      map.addObject(potholeGroupRef.current);

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

  /* 🔵 LIVE LOCATION UPDATE */
  useEffect(() => {
    if (!mapInstance.current || !LAT || !LONG) return;

    const map = mapInstance.current;
    const coords = { lat: Number(LAT), lng: Number(LONG) };

    // Smooth center
    map.setCenter(coords, true);

    if (!userMarkerRef.current) {
      const icon = new window.H.map.Icon(
        "https://cdn-icons-png.flaticon.com/512/684/684908.png",
        { size: { w: 36, h: 36 } }
      );

      const marker = new window.H.map.Marker(coords, { icon });
      map.addObject(marker);
      userMarkerRef.current = marker;
    } else {
      userMarkerRef.current.setGeometry(coords);
    }
  }, [LAT, LONG]);

  /* 🚧 Pothole Markers */
  useEffect(() => {
    if (!mapInstance.current || !potholeGroupRef.current) return;

    const group = potholeGroupRef.current;
    group.removeAll();

    markers.forEach((item) => {
      const icon = new window.H.map.Icon(
        "https://cdn-icons-png.flaticon.com/512/565/565547.png",
        { size: { w: 30, h: 30 } }
      );

      const marker = new window.H.map.Marker(item.pos, { icon });
      group.addObject(marker);
    });
  }, [markers]);

  return (
    <div
      ref={mapRef}
      style={{
        width: "100%",
        height: "100vh",
      }}
    />
  );
};

export default HereMap;