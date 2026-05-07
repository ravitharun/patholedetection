import axios from "axios";
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { toast } from "react-toastify";
import Loader from "./Loader";

/* ─────────────────────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────────────────────── */

function haversineMetres(a, b) {
  const R = 6_371_000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const sin2 =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(sin2));
}

function fmtDuration(seconds) {
  const m = Math.ceil(seconds / 60);
  if (m < 60) return `${m} min`;
  return `${Math.floor(m / 60)} hr ${m % 60} min`;
}

function fmtDistance(metres) {
  if (metres >= 1000) return `${(metres / 1000).toFixed(1)} km`;
  return `${Math.round(metres)} m`;
}

function etaClock(seconds) {
  const d = new Date(Date.now() + seconds * 1000);
  let h = d.getHours(),
    m = d.getMinutes();
  const ampm = h >= 12 ? "pm" : "am";
  h = h % 12 || 12;
  return `${h}:${String(m).padStart(2, "0")} ${ampm}`;
}

function dirIcon(instruction = "") {
  const t = instruction.toLowerCase();
  if (t.includes("left")) return "←";
  if (t.includes("right")) return "→";
  if (t.includes("u-turn")) return "↩";
  if (t.includes("roundabout")) return "↻";
  if (t.includes("arrive") || t.includes("destination")) return "⚑";
  return "↑";
}

function calculateBearing(start, end) {
  const lat1 = (start.lat * Math.PI) / 180;

  const lat2 = (end.lat * Math.PI) / 180;

  const dLon = ((end.lng - start.lng) * Math.PI) / 180;

  const y = Math.sin(dLon) * Math.cos(lat2);

  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

  const bearing = (Math.atan2(y, x) * 180) / Math.PI;

  return (bearing + 360) % 360;
}

/* ─────────────────────────────────────────────────────────────────────────────
   OFF-ROUTE DETECTION
───────────────────────────────────────────────────────────────────────────── */
const OFF_ROUTE_THRESHOLD_M = 50;

function isOffRoute(userPos, routePoints) {
  if (!routePoints || routePoints.length === 0) return false;
  let minDist = Infinity;
  for (const pt of routePoints) {
    const d = haversineMetres(userPos, pt);
    if (d < minDist) minDist = d;
  }
  return minDist > OFF_ROUTE_THRESHOLD_M;
}

/* ─────────────────────────────────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────────────────────────────────── */
const HereMap = ({ markers = [], obstacles = [] }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const routeGroupRef = useRef(null);
  const markerGroupRef = useRef(null);
  const userMarkerRef = useRef(null);
  const destinationMarkerRef = useRef(null);
  const accuracyCircleRef = useRef(null);
  const watchIdRef = useRef(null);
  const destinationCoordsRef = useRef(null);
  const currentCoordsRef = useRef(null);
  const routePointsRef = useRef([]);
  const rerouteTimerRef = useRef(null);
  const prevPosRef = useRef(null);
  const prevTimeRef = useRef(null);
  const headingRef = useRef(0);

  const smoothZoomRef = useRef(18);
  const smoothTiltRef = useRef(60);
  const lastCameraUpdateRef = useRef(0);
  const speedAverageRef = useRef([]);

  const [loader, setLoader] = useState(false);
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("Mumbai");
  const [currentAddress, setCurrentAddress] = useState("");
  const [routeInfo, setRouteInfo] = useState(null);
  const [selectedMode, setSelectedMode] = useState("car");
  const [navigationStarted, setNavigationStarted] = useState(false);
  const [compactTopBar, setCompactTopBar] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [activeField, setActiveField] = useState("to");
  const [showNavigationPanel, setShowNavigationPanel] = useState(true);
  const [tripProgress, setTripProgress] = useState(0);
  const [remainingDistance, setRemainingDistance] = useState(0);
  const [remainingDuration, setRemainingDuration] = useState(0);
  const [navigationSteps, setNavigationSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentInstruction, setCurrentInstruction] = useState("");
  const [nextInstruction, setNextInstruction] = useState("");
  const [tripStarted, setTripStarted] = useState(false);
  const [navigationViewMode, setNavigationViewMode] = useState("preview");
  const [followUser, setFollowUser] = useState(true);
  const [liveCoords, setLiveCoords] = useState(null);
  const [liveAccuracy, setLiveAccuracy] = useState(20);
  const [liveSpeed, setLiveSpeed] = useState(0);
  const [offRoute, setOffRoute] = useState(false);
  const [rerouteCountdown, setRerouteCountdown] = useState(null);
  const [fromCoords, setFromCoords] = useState(null);
  const [toCoords, setToCoords] = useState(null);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const transportModes = [
    { value: "car", label: "🚗 Car" },
    { value: "bicycle", label: "🚴 Bike" },
    { value: "pedestrian", label: "🚶 Walk" },
  ];

  /* ─────────────────────────────────────
   MAP INIT (PRODUCTION SAFE VERSION)
───────────────────────────────────── */
  useEffect(() => {
    if (!window.H || !mapRef.current || mapInstance.current) {
      return;
    }

    try {
      /* PLATFORM */
      const platform = new window.H.service.Platform({
        apikey:import.meta.env.VITE_HERE_API_KEY,
        // apikey: 'lVeKhq5cGrsNrQjlzFmCeRdrNt-bvnJ4JXl5prNIJDw',
      });

      /* LAYERS */
      const defaultLayers = platform.createDefaultLayers();

      console.log("HERE Layers:", defaultLayers);

      /* SAFE BASE LAYER */
      const baseLayer =
        defaultLayers.vector?.normal?.map ||
        defaultLayers.raster?.normal?.map ||
        defaultLayers.raster?.normal?.base;

      /* MAP */
      const map = new window.H.Map(
        mapRef.current,

        baseLayer,

        {
          center: {
            lat: 12.9716,
            lng: 77.5946,
          },

          zoom: 16,

          pixelRatio: window.devicePixelRatio || 1,
        }
      );

      /* STORE */
      mapInstance.current = map;

      /* INTERACTIONS */
      const behavior = new window.H.mapevents.Behavior(new window.H.mapevents.MapEvents(map));

      /* UI */
      const ui = window.H.ui.UI.createDefault(map, defaultLayers);

      /* GROUPS */
      routeGroupRef.current = new window.H.map.Group();

      markerGroupRef.current = new window.H.map.Group();

      map.addObject(routeGroupRef.current);

      map.addObject(markerGroupRef.current);

      /* ─────────────────────────────
       TRAFFIC LAYER
    ───────────────────────────── */

      try {
        const trafficLayer =
          defaultLayers.vector?.traffic?.map || defaultLayers.raster?.traffic?.map;

        if (trafficLayer) {
          map.addLayer(trafficLayer);

          console.log("✅ Traffic layer loaded");
        } else {
          console.warn("⚠️ Traffic layer unavailable");
        }
      } catch (trafficErr) {
        console.warn("Traffic layer failed:", trafficErr);
      }

      /* ─────────────────────────────
       RESIZE HANDLER
    ───────────────────────────── */

      const handleResize = () => {
        try {
          map.getViewPort().resize();
        } catch (err) {
          console.warn("Resize failed", err);
        }
      };

      window.addEventListener("resize", handleResize);

      /* ─────────────────────────────
       MAP READY LOG
    ───────────────────────────── */

      console.log("✅ HERE Map initialized");

      /* ─────────────────────────────
       CLEANUP
    ───────────────────────────── */

      return () => {
        try {
          if (watchIdRef.current) {
            navigator.geolocation.clearWatch(watchIdRef.current);
          }

          clearInterval(rerouteTimerRef.current);

          window.removeEventListener("resize", handleResize);

          map.dispose();

          mapInstance.current = null;

          console.log("🧹 HERE Map disposed");
        } catch (cleanupErr) {
          console.warn("Cleanup failed:", cleanupErr);
        }
      };
    } catch (err) {
      console.error("❌ HERE Map init failed:", err);
    }
  }, []);

  /* ── LIVE GPS ── */
  useEffect(() => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
        const accuracy = position.coords.accuracy;
        let speed = 0;
        if (position.coords.speed != null && position.coords.speed >= 0) {
          speed = position.coords.speed * 3.6;
        } else if (prevPosRef.current && prevTimeRef.current) {
          const dist = haversineMetres(prevPosRef.current, coords);
          const dt = (Date.now() - prevTimeRef.current) / 1000;
          if (dt > 0) speed = (dist / dt) * 3.6;
        }
        prevPosRef.current = coords;
        prevTimeRef.current = Date.now();
        setLiveCoords(coords);
        setLiveAccuracy(accuracy);
        setLiveSpeed(Math.min(speed, 250));
      },
      (err) => {
        console.warn("GPS error", err);
        toast.warn("GPS unavailable");
      },
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
    );
    return () => {
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, []);

  /* ── REACT TO GPS ── */
  useEffect(() => {
    if (!liveCoords) return;
    currentCoordsRef.current = liveCoords;
    if (followUser && tripStarted) {
      updateNavigationCamera(liveCoords, liveSpeed);
    } else if (followUser && mapInstance.current) {
      mapInstance.current.setCenter(liveCoords, true);
    }
    reverseGeocode(liveCoords);
    if (navigationStarted && destinationCoordsRef.current) updateLiveNavigation(liveCoords);
  }, [liveCoords]);

  /* ── LIVE NAV UPDATE ── */
  const updateLiveNavigation = useCallback(
    (userPos) => {
      const destination = destinationCoordsRef.current;
      if (!destination) return;
      const distToDest = haversineMetres(userPos, destination);
      const totalDist = routeInfo?.distance || 1;
      const travelled = Math.max(0, totalDist - distToDest);
      setTripProgress(Math.min(100, (travelled / totalDist) * 100).toFixed(0));
      setRemainingDistance(distToDest);
      const speedMs = liveSpeed > 2 ? liveSpeed / 3.6 : 40 / 3.6;
      setRemainingDuration(distToDest / speedMs);

      setCurrentStepIndex((prevIdx) => {
        const steps = navigationSteps;
        if (!steps.length) return prevIdx;
        let idx = prevIdx;
        while (idx < steps.length - 1) {
          const next = steps[idx + 1];
          if (!next?.place?.location) break;
          const sc = { lat: next.place.location.lat, lng: next.place.location.lng };
          if (haversineMetres(userPos, sc) < 30) idx++;
          else break;
        }
        setCurrentInstruction(steps[idx]?.instruction || "Continue straight");
        const txt = steps[idx]?.instruction?.toLowerCase() || "";

        if (txt.includes("left") || txt.includes("right") || txt.includes("roundabout")) {
          mapInstance.current?.getViewModel().setLookAtData(
            {
              zoom: 19,
            },
            true
          );
        }
        setNextInstruction(steps[idx + 1]?.instruction || "");
        return idx;
      });

      if (routePointsRef.current.length > 0) {
        const offNow = isOffRoute(userPos, routePointsRef.current);
        setOffRoute(offNow);
        if (offNow && !rerouteTimerRef.current) {
          let cd = 5;
          setRerouteCountdown(cd);
          rerouteTimerRef.current = setInterval(() => {
            cd--;
            setRerouteCountdown(cd);
            if (cd <= 0) {
              clearInterval(rerouteTimerRef.current);
              rerouteTimerRef.current = null;
              setRerouteCountdown(null);
              toast.info("📡 Recalculating route…");
              fetchRoute(currentCoordsRef.current, destinationCoordsRef.current);
            }
          }, 1000);
        } else if (!offNow && rerouteTimerRef.current) {
          clearInterval(rerouteTimerRef.current);
          rerouteTimerRef.current = null;
          setRerouteCountdown(null);
        }
      }
      if (distToDest < 30) {
        toast.success("🎉 You have arrived!");
        endTrip();
      }
    },
    [navigationSteps, routeInfo, liveSpeed]
  );

  const updateNavigationCamera = useCallback(
    (coords, currentSpeed = 0) => {
      if (!mapInstance.current || !tripStarted) return;

      const map = mapInstance.current;

      /* SPEED SMOOTHING */
      speedAverageRef.current.push(currentSpeed);

      if (speedAverageRef.current.length > 5) {
        speedAverageRef.current.shift();
      }

      const speed =
        speedAverageRef.current.reduce((a, b) => a + b, 0) / speedAverageRef.current.length;

      /* DYNAMIC ZOOM */
      let targetZoom = 18;

      if (speed > 90) targetZoom = 16;
      else if (speed > 60) targetZoom = 16.8;
      else if (speed > 35) targetZoom = 17.4;
      else if (speed > 15) targetZoom = 18;
      else targetZoom = 18.5;

      smoothZoomRef.current += (targetZoom - smoothZoomRef.current) * 0.12;

      /* DYNAMIC TILT */
      let targetTilt = 72;

      if (speed < 12) targetTilt = 55;

      smoothTiltRef.current += (targetTilt - smoothTiltRef.current) * 0.12;

      /* HEADING */
      let heading = headingRef.current;

      if (prevPosRef.current) {
        const nextBearing = calculateBearing(prevPosRef.current, coords);

        heading += (nextBearing - heading) * 0.14;

        headingRef.current = heading;
      }

      /* THROTTLE */
      const now = Date.now();

      if (now - lastCameraUpdateRef.current < 90) {
        return;
      }

      lastCameraUpdateRef.current = now;

      /* CAMERA OFFSET */
      const rad = (heading * Math.PI) / 180;

      const offset = speed > 50 ? 0.0008 : 0.00035;

      const targetCenter = {
        lat: coords.lat + Math.cos(rad) * offset,

        lng: coords.lng + Math.sin(rad) * offset,
      };

      try {
        map.getViewModel().setLookAtData(
          {
            position: targetCenter,

            zoom: smoothZoomRef.current,

            tilt: smoothTiltRef.current,

            heading,
          },

          true
        );
      } catch (err) {
        console.warn("Camera update failed", err);

        map.setCenter(coords, true);
      }
    },

    [tripStarted]
  );

  /* ── MAP HELPERS ── */
  const updateUserMarker = (coords, accuracyRadius) => {
    if (!window.H || !mapInstance.current) return;
    const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="52" height="52">
      <circle cx="26" cy="26" r="18" fill="#2563eb"/>
      <circle cx="26" cy="26" r="7" fill="white"/>
    </svg>`;
    const icon = new window.H.map.Icon(iconSvg);
    if (!userMarkerRef.current) {
      userMarkerRef.current = new window.H.map.Marker(coords, { icon });
      mapInstance.current.addObject(userMarkerRef.current);
    } else {
      userMarkerRef.current.setGeometry(coords);
    }
    if (!accuracyCircleRef.current) {
      accuracyCircleRef.current = new window.H.map.Circle(coords, accuracyRadius || 20, {
        style: {
          fillColor: "rgba(37,99,235,0.15)",
          strokeColor: "rgba(37,99,235,0.5)",
          lineWidth: 2,
        },
      });
      mapInstance.current.addObject(accuracyCircleRef.current);
    } else {
      accuracyCircleRef.current.setCenter(coords);
      accuracyCircleRef.current.setRadius(accuracyRadius || 20);
    }
  };

  const setDestinationMarker = (coords) => {
    if (!window.H || !mapInstance.current) return;
    const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="52" height="52">
      <circle cx="26" cy="26" r="18" fill="#ef4444"/>
      <circle cx="26" cy="26" r="7" fill="white"/>
    </svg>`;
    const icon = new window.H.map.Icon(iconSvg);
    if (!destinationMarkerRef.current) {
      destinationMarkerRef.current = new window.H.map.Marker(coords, { icon });
      mapInstance.current.addObject(destinationMarkerRef.current);
    } else {
      destinationMarkerRef.current.setGeometry(coords);
    }
  };

  const drawRoute = (route) => {
    if (!routeGroupRef.current || !window.H) return;
    routeGroupRef.current.removeAll();
    routePointsRef.current = [];
    route.sections.forEach((section) => {
      const linestring = window.H.geo.LineString.fromFlexiblePolyline(section.polyline);
      const glowRoute = new window.H.map.Polyline(linestring, {
        style: {
          lineWidth: 18,
          strokeColor: "rgba(37,99,235,0.18)",
          lineCap: "round",
        },
      });

      routeGroupRef.current.addObject(glowRoute);

      const polyline = new window.H.map.Polyline(
        linestring,

        {
          style: {
            lineWidth: 8,

            strokeColor: "#2563eb",

            lineCap: "round",

            lineJoin: "round",
          },
        }
      );
      routeGroupRef.current.addObject(polyline);
      mapInstance.current.getViewModel().setLookAtData({ bounds: polyline.getBoundingBox() });
      const latLngs = linestring.getLatLngAltArray();
      for (let i = 0; i < latLngs.length; i += 3)
        routePointsRef.current.push({ lat: latLngs[i], lng: latLngs[i + 1] });
    });
  };

  const tiltMapForNavigation = () => {
    const map = mapInstance.current;
    if (!map) return;
    try {
      map.getViewModel().setLookAtData({ tilt: 60, zoom: 18 }, true);
    } catch (_) {
      map.setZoom(18, true);
    }
  };

  const resetMapTilt = () => {
    const map = mapInstance.current;
    if (!map) return;
    try {
      map.getViewModel().setLookAtData({ tilt: 0, zoom: 15 }, true);
    } catch (_) {
      map.setZoom(15, true);
    }
  };

  /* ── API ── */
  const reverseGeocode = async (coords) => {
    try {
      const res = await axios.get(
        `https://revgeocode.search.hereapi.com/v1/revgeocode?at=${coords.lat},${coords.lng}&lang=en-US&apiKey=${import.meta.env.VITE_HERE_API_KEY}`
        // `https://revgeocode.search.hereapi.com/v1/revgeocode?at=${coords.lat},${coords.lng}&lang=en-US&apiKey=lVeKhq5cGrsNrQjlzFmCeRdrNt-bvnJ4JXl5prNIJDw`
      );
      const label = res.data?.items?.[0]?.address?.label || `${coords.lat}, ${coords.lng}`;
      setCurrentAddress(label);
      console.log("res reverseGeocode ", res)
      setFromLocation((p) => p || label);
    } catch {
      const fb = `${coords.lat}, ${coords.lng}`;
      setCurrentAddress(fb);
      setFromLocation((p) => p || fb);
    }
  };

  const searchLocationSuggestions = async (query, field = "to") => {
    setActiveField(field);

    if (!query.trim()) {
      setSearchSuggestions([]);
      return;
    }

    try {
      const res = await axios.get(
        `https://autocomplete.search.hereapi.com/v1/autocomplete?q=${encodeURIComponent(
          query
        )}&limit=8&apiKey=${import.meta.env.VITE_HERE_API_KEY}`
      );
      console.log(res, 'res searchLocationSuggestions')
      const formatted = (res.data?.items || []).map((item) => ({
        title: item.title || item.address?.label || "Unknown",

        address: item.address?.label || "",

        position: item.position || null,

        id: item.id,
      }));

      setSearchSuggestions(formatted);
    } catch (err) {
      console.error("Autocomplete error:", err);

      setSearchSuggestions([]);
    }
  };

  const geocodeLocation = async (text) => {
    if (!text?.trim()) return null;
    try {
      const res = await axios.get(
        `https://geocode.search.hereapi.com/v1/geocode?q=${encodeURIComponent(text)}&apiKey=${import.meta.env.VITE_HERE_API_KEY}`
      );
      const item = res.data?.items?.[0];
      return item ? { lat: item.position.lat, lng: item.position.lng } : null;
    } catch {
      return null;
    }
  };

  const fetchRoute = async (origin, destination) => {
    if (!origin || !destination) return;
    try {
      setLoader(true);
      const res = await axios.get(
        `https://router.hereapi.com/v8/routes?transportMode=car&origin=12.89869,77.5724&destination=12.54348,77.42181&return=polyline,summary,actions,instructions&apikey=${import.meta.env.VITE_HERE_API_KEY}`
      );
      console.log(res, 'resresres')
      const route = res.data?.routes?.[0];
      if (!route) {
        toast.error("No route found");
        setLoader(false);
        return;
      }
      drawRoute(route);
      const summary = route.sections?.[0]?.summary;
      const actions = route.sections?.[0]?.actions || [];
      setNavigationSteps(actions);
      setCurrentStepIndex(0);
      setCurrentInstruction(actions[0]?.instruction || "Continue straight");
      setNextInstruction(actions[1]?.instruction || "");
      setRouteInfo({ distance: summary?.length || 0, duration: summary?.duration || 0, route });
      /* INITIAL NAV VALUES */

      setRemainingDistance(summary?.length || 0);

      setRemainingDuration(summary?.duration || 0);

      setTripProgress(0);
      setLoader(false);
    } catch {
      toast.error("Route calculation failed");
      setLoader(false);
    }
  };

  const startNavigation = async () => {
    if (!fromLocation?.trim()) {
      toast.error("Choose starting point");
      return;
    }
    if (!toLocation?.trim()) {
      toast.error("Choose destination");
      return;
    }
    setLoader(true);
    const origin = fromCoords || (await geocodeLocation(fromLocation));

    const destination = toCoords || (await geocodeLocation(toLocation));
    currentCoordsRef.current = origin;
    destinationCoordsRef.current = destination;
    updateUserMarker(origin, liveAccuracy);
    setDestinationMarker(destination);
    setNavigationStarted(true);
    setCompactTopBar(true);
    setOffRoute(false);
    await fetchRoute(origin, destination);
    mapInstance.current?.setCenter(origin, true);
    setLoader(false);
  };

  const endTrip = () => {
    setTripStarted(false);
    setNavigationStarted(false);
    setNavigationViewMode("preview");
    setCompactTopBar(false);
    setShowNavigationPanel(true);
    setRouteInfo(null);
    setOffRoute(false);
    setRerouteCountdown(null);
    setCurrentStepIndex(0);
    setCurrentInstruction("");
    setNextInstruction("");
    routePointsRef.current = [];
    routeGroupRef.current?.removeAll();
    clearInterval(rerouteTimerRef.current);
    rerouteTimerRef.current = null;
    destinationCoordsRef.current = null;
    resetMapTilt();
  };

  const speak = (text) => {
    if (!voiceEnabled || !text) return;

    const speech = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(speech);
  };

  const toggleVoice = () => {
    if (voiceEnabled) {
      // stop current speaking immediately
      window.speechSynthesis.cancel();
    }

    setVoiceEnabled(!voiceEnabled);
  };
  useEffect(() => {
    if (!markerGroupRef.current || !window.H) return;
    markerGroupRef.current.removeAll();
    obstacles.forEach((obstacle) => {
      if (!obstacle?.pos) return;
      const color =
        obstacle.severity === "high"
          ? "#ef4444"
          : obstacle.severity === "medium"
            ? "#f59e0b"
            : "#10b981";
      const circle = new window.H.map.Circle(obstacle.pos, 12, {
        style: { fillColor: color, strokeColor: "white", lineWidth: 2 },
      });
      markerGroupRef.current.addObject(circle);
    });
  }, [obstacles]);

  const recenterMap = () => {
    if (mapInstance.current && currentCoordsRef.current) {
      mapInstance.current.setCenter(currentCoordsRef.current, true);
      mapInstance.current.setZoom(18, true);
    }
  };
  const zoomIn = () => mapInstance.current?.setZoom(mapInstance.current.getZoom() + 1, true);
  const zoomOut = () => mapInstance.current?.setZoom(mapInstance.current.getZoom() - 1, true);

  const etaText = useMemo(() => {
    if (!routeInfo) return "";
    return `${fmtDistance(routeInfo.distance)} • ${fmtDuration(routeInfo.duration)}`;
  }, [routeInfo]);

  /* ─────────────────────────────────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────────────────────────────────── */

  useEffect(() => {
    if (currentInstruction) {
      speak(currentInstruction);
    } else if (nextInstruction) {
      speak(nextInstruction);
    }
  }, [currentInstruction, nextInstruction]);

  return (
    <div className="smart-map-layout">
      {loader && <Loader loadername="Calculating smart route..." />}

      {/* GPS status badge */}
      <div style={S.gpsBadge(!!liveCoords)}>
        <span style={S.gpsDot(!!liveCoords)} />
        {liveCoords ? "GPS Live" : "No GPS"}
      </div>

      {/* Off-route banner */}
      {offRoute && (
        <div style={S.offRouteBanner}>
          ⚠️ Off route
          {rerouteCountdown != null && (
            <span style={{ opacity: 0.8, fontWeight: 400 }}>
              {" "}
              — rerouting in {rerouteCountdown}s
            </span>
          )}
        </div>
      )}

      <button className="navigation-toggle-btn" onClick={() => setShowNavigationPanel((p) => !p)}>
        {showNavigationPanel ? "✕" : "🧭"}
      </button>

      {/* Search panel */}
      {showNavigationPanel && !tripStarted && (
        <div
          className={`top-navigation-panel ${compactTopBar ? "top-panel-compact" : "top-panel-expanded"}`}
        >
          <div className="search-card">
            <div className="top-panel-header">
              <strong>Smart Navigation </strong>
              <button className="panel-toggle-btn" onClick={() => setCompactTopBar((p) => !p)}>
                {compactTopBar ? "⬇" : "⬆"}
              </button>
            </div>
            <input
              type="text"
              value={fromLocation}
              onChange={(e) => {
                setFromLocation(e.target.value);
                searchLocationSuggestions(e.target.value, "from");
              }}
              placeholder="Choose starting point"
              className="smart-input"
            />
            <button
              className="use-current-location-btn"
              onClick={async () => {
                if (!liveCoords) {
                  toast.error("Current location unavailable");

                  return;
                }

                try {
                  /* =================================
         SET INPUT VALUE
      ================================= */

                  setFromLocation(currentAddress || "Current Location");

                  /* =================================
         STORE COORDS
      ================================= */

                  setFromCoords(liveCoords);

                  /* =================================
         ENABLE FOLLOW MODE
      ================================= */

                  setFollowUser(true);

                  /* =================================
         UPDATE USER MARKER
      ================================= */

                  updateUserMarker(liveCoords, liveAccuracy);

                  /* =================================
         SMOOTH MAP FLY
      ================================= */

                  if (mapInstance.current) {
                    try {
                      mapInstance.current.getViewModel().setLookAtData(
                        {
                          position: liveCoords,

                          zoom: 18,

                          tilt: 45,
                        },

                        true
                      );
                    } catch {
                      mapInstance.current.setCenter(liveCoords, true);

                      mapInstance.current.setZoom(18, true);
                    }
                  }

                  /* =================================
         SUCCESS TOAST
      ================================= */

                  toast.success("📍 Current location selected");
                } catch (err) {
                  console.error(err);

                  toast.error("Failed to fetch current location");
                }
              }}
            >
              📍 Use Current Location
            </button>
            <button
              className="swap-route-btn"
              onClick={() => {
                const t = fromLocation;
                setFromLocation(toLocation);
                setToLocation(t);
              }}
            >
              ⇅
            </button>
            <input
              type="text"
              value={toLocation}
              onChange={(e) => {
                setToLocation(e.target.value);
                searchLocationSuggestions(e.target.value);
              }}
              placeholder="Search destination"
              className="smart-input"
            />

            {!compactTopBar && (
              <>
                {searchSuggestions.length > 0 && (
                  <div className="suggestions-box">
                    {searchSuggestions.map((item, idx) => (
                      <div
                        key={idx}
                        className="suggestion-item"
                        onClick={() => {
                          const label = item.address || item.title;

                          /* FROM */
                          if (activeField === "from") {
                            setFromLocation(label);

                            setFromCoords(item.position);
                          } else {
                            /* TO */
                            setToLocation(label);

                            setToCoords(item.position);
                          }

                          setSearchSuggestions([]);
                        }}
                      >
                        <div>
                          <strong>{item.title}</strong>

                          <div
                            style={{
                              fontSize: 12,
                              opacity: 0.7,
                              marginTop: 2,
                            }}
                          >
                            {item.address}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="transport-mode-row">
                  {transportModes.map((mode) => (
                    <button
                      key={mode.value}
                      className={`transport-btn ${selectedMode === mode.value ? "active-transport" : ""}`}
                      onClick={() => setSelectedMode(mode.value)}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
                <button className="start-navigation-btn" onClick={startNavigation}>
                  {navigationStarted ? "Update Route" : "Start Navigation"}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Map controls */}
      <div className="floating-map-controls">
        <button className="map-control-btn" onClick={recenterMap}>
          📍
        </button>
        <button className="map-control-btn" onClick={zoomIn}>
          ＋
        </button>
        <button className="map-control-btn" onClick={zoomOut}>
          －
        </button>
        <button
          className={`map-control-btn ${followUser ? "active-map-control" : ""}`}
          onClick={() => setFollowUser((p) => !p)}
        >
          🧭
        </button>
        <button onClick={toggleVoice}>
          {voiceEnabled ? "🔊 Voice ON" : "🔇 Voice OFF"}
        </button>
      </div>

      {/* HERE Map canvas */}
      <div ref={mapRef} className="smart-map-container" />

      {/* ── PREVIEW BOTTOM SHEET ── */}
      {routeInfo && navigationViewMode === "preview" && (
        <div className="route-bottom-sheet">
          <div className="route-header">
            <span>Smart Navigation</span>
            <strong>{etaText}</strong>
          </div>
          <div className="live-navigation-card">
            <div className="navigation-instruction">
              🧭 {currentInstruction || "Continue straight"}
            </div>
            <div className="trip-progress-wrapper">
              <div className="trip-progress-label">
                Trip Progress <strong>{tripProgress}%</strong>
              </div>
              <div className="trip-progress-bar">
                <div className="trip-progress-fill" style={{ width: `${tripProgress}%` }} />
              </div>
            </div>
            <div className="navigation-stats">
              <div className="nav-stat-card">
                <span>Remaining</span>
                <strong>{fmtDistance(remainingDistance)}</strong>
              </div>
              {!tripStarted ? (
                <button
                  className="start-trip-btn"
                  onClick={() => {
                    setTripStarted(true);
                    setNavigationViewMode("navigate");
                    setShowNavigationPanel(false);
                    tiltMapForNavigation();

                    // setTimeout(() => {
                    //   speak("YourLive Location is in  " + currentInstruction)
                    // }, 5000);

                  }}
                >
                  Start Trip
                </button>
              ) : (
                <button className="stop-trip-btn" onClick={endTrip}>
                  End Trip
                </button>
              )}
              <div className="nav-stat-card">
                <span>ETA</span>
                <strong>{fmtDuration(remainingDuration)}</strong>
              </div>
            </div>
          </div>
          <div className="route-summary-grid">
            <div className="route-summary-card">
              <span>Speed</span>
              <strong>{Math.round(liveSpeed)} km/h</strong>
            </div>
            <div className="route-summary-card">
              <span>Mode</span>
              <strong>{selectedMode}</strong>
            </div>
            <div className="route-summary-card">
              <span>Traffic</span>
              <strong>Live</strong>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
           IMMERSIVE NAVIGATION — Google Maps style
      ════════════════════════════════════════════════════════════ */}
      {routeInfo && navigationViewMode === "navigate" && (
        <>
          {/* TOP GREEN INSTRUCTION BANNER */}
          <div style={S.topBanner}>
            <div style={S.bannerArrow} title={currentInstruction}>{dirIcon(currentInstruction)}</div>
            <div style={S.bannerText}>
              <div style={S.bannerMain} title={currentInstruction}>{currentInstruction || "Continue straight"}</div>
              {nextInstruction && (
                <div style={S.bannerSub}>
                  Then <span style={S.thenArrow}>{dirIcon(nextInstruction)}</span> {nextInstruction}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT FLOATING BUTTONS */}
          <div style={S.compass}>🧭</div>
          <div style={S.rightControls}>
            <button style={S.roundBtn} onClick={recenterMap} title="Re-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#c0392b">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
            </button>
            <button style={S.roundBtn} title="Search">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#555">
                <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
              </svg>
            </button>
            <button style={S.roundBtn} title="Volume">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#555">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
              </svg>
            </button>
            <button style={{ ...S.roundBtn, background: "#fff8e1" }} title="Report">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#f39c12">
                <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
              </svg>
              <span style={{ fontSize: 10, color: "#f39c12", marginTop: 1 }}>Report</span>
            </button>
          </div>

          {/* SPEED BADGE — bottom left */}
          <div style={S.speedBadge}>
            <div style={S.speedNum}>{Math.round(liveSpeed)}</div>
            <div style={S.speedUnit}>km/h</div>
          </div>

          {/* BOTTOM HUD */}
          <div style={S.bottomHud}>
            <div style={S.hudLeft}>
              <div style={S.hudEtaTime}>{fmtDuration(remainingDuration)}</div>
              <div style={S.hudMeta}>
                {fmtDistance(remainingDistance)} • {etaClock(remainingDuration)}
                <span style={{ marginLeft: 4 }}>🍃</span>
              </div>
            </div>
            <button style={S.endBtn} onClick={endTrip}>
              ✕
            </button>
            <button style={S.routesBtn} title="Alternate routes">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#2563eb">
                <path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z" />
              </svg>
            </button>
          </div>
        </>
      )}

      <style>{`
        @keyframes gps-pulse {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:.4; transform:scale(1.5); }
        }
      `}</style>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   STYLES — only for the new immersive UI
───────────────────────────────────────────────────────────────────────────── */
const S = {
  gpsBadge: (live) => ({
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 999,
    background: live ? "rgba(16,185,129,0.92)" : "rgba(239,68,68,0.92)",
    color: "#fff",
    borderRadius: 20,
    padding: "4px 12px",
    fontSize: 12,
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: 6,
    backdropFilter: "blur(6px)",
    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
    pointerEvents: "none",
  }),
  gpsDot: (live) => ({
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#fff",
    display: "inline-block",
    animation: live ? "gps-pulse 1.5s infinite" : "none",
  }),
  offRouteBanner: {
    position: "absolute",
    top: 56,
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 1100,
    background: "rgba(239,68,68,0.95)",
    color: "#fff",
    borderRadius: 12,
    padding: "10px 20px",
    fontWeight: 700,
    fontSize: 14,
    boxShadow: "0 4px 20px rgba(239,68,68,0.5)",
    backdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    gap: 8,
    whiteSpace: "nowrap",
  },

  /* top banner */
  topBanner: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    background: "linear-gradient(135deg, #1a7a3c 0%, #1e9647 100%)",
    color: "#fff",
    padding: "18px 20px 14px",
    display: "flex",
    alignItems: "center",
    gap: 16,
    boxShadow: "0 4px 24px rgba(0,0,0,0.35)",
  },
  bannerArrow: {
    fontSize: 44,
    fontWeight: 900,
    lineHeight: 1,
    minWidth: 50,
    textAlign: "center",
    filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.25))",
  },
  bannerText: { flex: 1, minWidth: 0 },
  bannerMain: {
    fontSize: 22,
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: "-0.3px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  bannerSub: {
    marginTop: 6,
    fontSize: 14,
    opacity: 0.88,
    display: "flex",
    alignItems: "center",
    gap: 4,
  },
  thenArrow: { fontSize: 16, fontWeight: 800 },

  /* right controls */
  rightControls: {
    position: "absolute",
    right: 12,
    top: "50%",
    transform: "translateY(-50%)",
    zIndex: 1001,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  roundBtn: {
    width: 48,
    height: 48,
    borderRadius: "50%",
    background: "#fff",
    border: "none",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 12px rgba(0,0,0,0.25)",
    padding: 0,
  },

  compass: {
    position: "absolute",

    top: 140,
    right: 16,

    width: 54,
    height: 54,

    borderRadius: "50%",

    background: "#fff",

    display: "flex",

    alignItems: "center",

    justifyContent: "center",

    fontSize: 24,

    boxShadow: "0 4px 16px rgba(0,0,0,0.22)",

    zIndex: 1001,
  },

  /* speed badge */
  speedBadge: {
    position: "absolute",
    left: 16,
    bottom: 110,
    zIndex: 1001,
    background: "#fff",
    borderRadius: 10,
    padding: "6px 14px",
    textAlign: "center",
    boxShadow: "0 2px 12px rgba(0,0,0,0.22)",
    minWidth: 60,
  },
  speedNum: { fontSize: 26, fontWeight: 800, color: "#111", lineHeight: 1 },
  speedUnit: { fontSize: 11, color: "#666", marginTop: 2 },

  /* bottom hud */
  bottomHud: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    background: "#fff",
    padding: "16px 20px 28px",
    display: "flex",
    alignItems: "center",
    gap: 14,
    boxShadow: "0 -4px 20px rgba(0,0,0,0.15)",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  hudLeft: { flex: 1 },
  hudEtaTime: { fontSize: 28, fontWeight: 800, color: "#111", lineHeight: 1 },
  hudMeta: { fontSize: 14, color: "#555", marginTop: 3, display: "flex", alignItems: "center" },
  endBtn: {
    width: 52,
    height: 52,
    borderRadius: "50%",
    background: "#1c1c1e",
    color: "#fff",
    fontSize: 20,
    fontWeight: 700,
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
    flexShrink: 0,
  },
  routesBtn: {
    width: 52,
    height: 52,
    borderRadius: "50%",
    background: "#fff",
    border: "1px solid #e5e7eb",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
    flexShrink: 0,
  },
};

export default HereMap;
