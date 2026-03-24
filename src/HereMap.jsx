
import axios from "axios";
import React, { useEffect, useRef } from "react";
import { toast } from "react-toastify";

const HereMap = ({ LAT, LONG, markers = [], accuracy, FromLocation, ToLocation, userAcceptedlivelatlong }) => {
  console.log(FromLocation, ToLocation, userAcceptedlivelatlong,"FromLocation, ToLocation, userAcceptedlivelatlong")
  console.log(userAcceptedlivelatlong.lat, userAcceptedlivelatlong.lng, "userAcceptedlivelatlong")
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

      new window.H.mapevents.Behavior(new window.H.mapevents.MapEvents(map));
      window.H.ui.UI.createDefault(map, defaultLayers);

      // ✅ Traffic layer
      map.addLayer(defaultLayers.vector.traffic.map);

      // ✅ Groups
      potholeGroupRef.current = new window.H.map.Group();
      incidentGroupRef.current = new window.H.map.Group();
      map.addObject(potholeGroupRef.current);
      map.addObject(incidentGroupRef.current);

      mapInstance.current = map;

      window.addEventListener("resize", () => map.getViewPort().resize());
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
        accuracyCircleRef.current = new window.H.map.Circle(coords, accuracy, {
          style: {
            strokeColor: "rgba(0, 120, 255, 0.6)",
            lineWidth: 2,
            fillColor: "rgba(0, 120, 255, 0.2)",
          },
        });
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

  /* 🚦 TRAFFIC INCIDENTS & ROUTE */
  useEffect(() => {
    if (!mapInstance.current || !LAT || !LONG || !FromLocation || !ToLocation) return;

    const map = mapInstance.current;

    const fetchRouteAndIncidents = async () => {
      try {
        // Geocode From
        const fromRes = await axios.get(
          `https://geocode.search.hereapi.com/v1/geocode?q=${FromLocation}&apiKey=${import.meta.env.VITE_HERE_API_KEY}`
        );
        const fromPos = userAcceptedlivelatlong ? userAcceptedlivelatlong : fromRes.data.items[0].position;
        // console.log(userAcceptedlivelatlong ? userAcceptedlivelatlong.lat : fromPos.lat, "userAcceptedlivelatlong.lat ? userAcceptedlivelatlong.lat : fromPos.lat")
        console.log(fromPos, "fromPos")
        // Geocode To
        const toRes = await axios.get(
          `https://geocode.search.hereapi.com/v1/geocode?q=${ToLocation}&apiKey=${import.meta.env.VITE_HERE_API_KEY}`
        );
        const toPos = toRes.data.items[0].position;

        // Get route polyline
        const routeRes = await axios.get(
          `https://router.hereapi.com/v8/routes?transportMode=car&origin=${userAcceptedlivelatlong.lat ? userAcceptedlivelatlong.lat : fromPos.lat},${userAcceptedlivelatlong.lng ? userAcceptedlivelatlong.lng : fromPos.lng}&destination=${toPos.lat},${toPos.lng}&return=polyline&apiKey=${import.meta.env.VITE_HERE_API_KEY}`
        );
        const routeSections = routeRes.data.routes[0].sections;
        console.log(routeSections, "routeSections")

        // Clear old route markers
        if (incidentGroupRef.current) {
          incidentGroupRef.current.removeAll();
        }

        // Draw route polyline on map
        routeSections.forEach((section) => {
          const lineString = window.H.geo.LineString.fromFlexiblePolyline(section.polyline);
          const polyline = new window.H.map.Polyline(lineString, {
            style: { strokeColor: "rgba(0, 128, 255, 0.7)", lineWidth: 6 },
          });
          map.addObject(polyline);
        });

        // Fetch traffic incidents around current location
        const res = await axios.get("https://data.traffic.hereapi.com/v7/incidents", {
          params: {
            apiKey: import.meta.env.VITE_HERE_API_KEY,
            in: `circle:${LAT},${LONG};r=5000`,
            locationReferencing: "shape",
          },
        });

        const incidents = res.data.results;
        incidents?.forEach((item) => {
          const point = item.location?.shape?.links?.[0]?.points?.[0];
          if (!point || !point.lat || !point.lng) return;

          const icon = new window.H.map.Icon(
            "https://cdn-icons-png.flaticon.com/512/483/483408.png",
            { size: { w: 28, h: 28 } }
          );
          const marker = new window.H.map.Marker({ lat: point.lat, lng: point.lng }, { icon });
          incidentGroupRef.current.addObject(marker);
        });
      } catch (error) {
        console.error(error);
        toast.error("Map load error: " + (error.response?.data || error.message));
      }
    };

    fetchRouteAndIncidents();
  }, [LAT, LONG, FromLocation, ToLocation]);

  return <div ref={mapRef} style={{ width: "100%", height: "100vh" }} />;
};

export default HereMap;