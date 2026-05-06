import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import Loader from "./Loader";

const createArrowSvg = (heading = 0) => `
<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50">
  <g transform="rotate(${heading} 25 25)">
    <circle cx="25" cy="25" r="20" fill="#2563eb"/>
    <polygon points="25,8 35,35 25,28 15,35" fill="white"/>
  </g>
</svg>
`;

const getHeading = (from, to) => {
  const dLon = (to.lng - from.lng) * (Math.PI / 180);

  const lat1 = from.lat * (Math.PI / 180);
  const lat2 = to.lat * (Math.PI / 180);

  const y = Math.sin(dLon) * Math.cos(lat2);

  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
};

const drawRoutes = (routes, map, routePolylineRef) => {
  if (!map || !window.H) return;

  Object.values(routePolylineRef.current).forEach((polyline) => {
    map.removeObject(polyline);
  });

  routePolylineRef.current = {};

  routes.forEach((route, routeIndex) => {
    route.sections.forEach((section, sectionIndex) => {
      if (!section.polyline) return;

      const linestring = window.H.geo.LineString.fromFlexiblePolyline(section.polyline);

      const polyline = new window.H.map.Polyline(linestring, {
        style: {
          lineWidth: routeIndex === 0 ? 6 : 4,
          strokeColor: routeIndex === 0 ? "rgba(0, 128, 255, 0.9)" : "rgba(120,120,120,0.7)",
        },
      });

      map.addObject(polyline);

      routePolylineRef.current[`${routeIndex}-${sectionIndex}`] = polyline;
    });
  });
};

const updateUserMarker = (coords, heading, accuracy, map, userMarkerRef, accuracyCircleRef) => {
  if (!map || !window.H) return;

  const icon = new window.H.map.Icon(createArrowSvg(heading));

  if (!userMarkerRef.current) {
    userMarkerRef.current = new window.H.map.Marker(coords, {
      icon,
    });

    map.addObject(userMarkerRef.current);
  } else {
    userMarkerRef.current.setGeometry(coords);
    userMarkerRef.current.setIcon(icon);
  }

  if (accuracy) {
    if (!accuracyCircleRef.current) {
      accuracyCircleRef.current = new window.H.map.Circle(coords, accuracy, {
        style: {
          strokeColor: "rgba(0,120,255,0.6)",
          lineWidth: 2,
          fillColor: "rgba(0,120,255,0.2)",
        },
      });

      map.addObject(accuracyCircleRef.current);
    } else {
      accuracyCircleRef.current.setCenter(coords);

      accuracyCircleRef.current.setRadius(accuracy);
    }
  }

  map.setCenter(coords);
  map.setZoom(18);
};

const HereMap = ({ LAT, LONG, accuracy, markers = [], obstacles = [] }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  const isMounted = useRef(true);

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

  /* 🗺️ INIT MAP */
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
      console.warn("Traffic layer unavailable", e);
    }

    potholeGroupRef.current = new window.H.map.Group();

    map.addObject(potholeGroupRef.current);

    mapInstance.current = map;

    return () => {
      isMounted.current = false;

      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }

      if (mapInstance.current) {
        mapInstance.current.dispose();
        mapInstance.current = null;
      }
    };
  }, []);

  /* 📍 UPDATE LIVE LOCATION */
  useEffect(() => {
    if (!mapInstance.current || !LAT || !LONG) return;

    const coords = {
      lat: LAT,
      lng: LONG,
    };

    updateUserMarker(coords, 0, accuracy, mapInstance.current, userMarkerRef, accuracyCircleRef);
  }, [LAT, LONG, accuracy]);

  /* 🕳️ DRAW POTHOLE MARKERS */
  useEffect(() => {
    if (!mapInstance.current || !window.H || !potholeGroupRef.current) return;

    potholeGroupRef.current.removeAll();

    markers.forEach((marker) => {
      if (!marker?.pos) return;

      const potholeMarker = new window.H.map.Marker({
        lat: marker.pos.lat,
        lng: marker.pos.lng,
      });

      potholeGroupRef.current.addObject(potholeMarker);
    });
  }, [markers]);

  /* 📍 REVERSE GEOCODE CURRENT LOCATION */
  useEffect(() => {
    if (!currentCoords) return;

    const fetchAddress = async () => {
      try {
        const geoRes = await axios.get(
          `https://revgeocode.search.hereapi.com/v1/revgeocode?at=${currentCoords.lat},${currentCoords.lng}&lang=en-US&apikey=${import.meta.env.VITE_HERE_API_KEY}`
        );

        const address =
          geoRes.data?.items?.[0]?.address?.label ||
          `${currentCoords.lat.toFixed(6)}, ${currentCoords.lng.toFixed(6)}`;

        setFromLocation(address);
      } catch {
        setFromLocation(`${currentCoords.lat.toFixed(6)}, ${currentCoords.lng.toFixed(6)}`);
      }
    };

    fetchAddress();
  }, [currentCoords]);

  /* 🎯 DESTINATION MARKER */
  const setDestinationMarker = (coords) => {
    if (!mapInstance.current || !window.H) return;

    const icon = new window.H.map.Icon("https://cdn-icons-png.flaticon.com/512/447/447031.png", {
      size: {
        w: 36,
        h: 36,
      },
    });

    if (!destinationMarkerRef.current) {
      destinationMarkerRef.current = new window.H.map.Marker(coords, {
        icon,
      });

      mapInstance.current.addObject(destinationMarkerRef.current);
    } else {
      destinationMarkerRef.current.setGeometry(coords);
    }
  };

  /* 🛣️ FETCH ROUTE */
  const fetchRoute = async (originCoords, destinationCoords) => {
    if (!originCoords || !destinationCoords) return;

    try {
      const avoidAreas = obstacles
        .map((o) => `bbox:${o.topLeft[1]},${o.bottomRight[0]},${o.bottomRight[1]},${o.topLeft[0]}`)
        .join("|");

      const url = `https://router.hereapi.com/v8/routes?transportMode=${selectedMode}&origin=${originCoords.lat},${originCoords.lng}&destination=${destinationCoords.lat},${destinationCoords.lng}&alternatives=1&return=polyline,summary,actions,instructions&routingMode=fast${avoidAreas ? `&avoid[areas]=${avoidAreas}` : ""}&traffic[enabled]=true&apikey=${import.meta.env.VITE_HERE_API_KEY}`;

      const res = await axios.get(url);

      const routes = res.data?.routes || [];

      setRouteData([
        {
          mode: selectedMode,
          routes,
        },
      ]);

      drawRoutes(routes, mapInstance.current, routePolylineRef);
    } catch (err) {
      console.error(err);
      toast.error("Route fetch error");
    }
  };

  /* 🚦 THROTTLE ROUTE REFRESH */
  const shouldRefetchRoute = () => {
    // eslint-disable-next-line react-hooks/purity
    const now = Date.now();

    if (now - lastRouteFetchRef.current < 2500) return false;

    lastRouteFetchRef.current = now;

    return true;
  };

  /* 🌍 GEOCODE DESTINATION */
  const geocodeDestination = async () => {
    if (!toLocation.trim()) {
      toast.warning("Please enter destination");

      return null;
    }

    try {
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

      const dest = {
        lat: pos.lat,
        lng: pos.lng,
      };

      destinationCoordsRef.current = dest;

      setDestinationMarker(dest);

      return dest;
    } catch {
      toast.error("Geocoding failed");

      return null;
    }
  };

  /* ▶️ START NAVIGATION */
  const startNavigation = async () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");

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

          const heading = previousCoordsRef.current
            ? getHeading(previousCoordsRef.current, coords)
            : 0;

          updateUserMarker(
            coords,
            heading,
            acc,
            mapInstance.current,
            userMarkerRef,
            accuracyCircleRef
          );

          if (destinationCoordsRef.current && shouldRefetchRoute()) {
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
          timeout: 10000,
        }
      );
    } catch (err) {
      console.error(err);

      toast.error("Unable to start navigation");

      setLoader(false);
    }
  };

  /* ⏹️ STOP NAVIGATION */
  const stopNavigation = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);

      watchIdRef.current = null;
    }

    setIsStarted(false);
  };

  /* 🚗 CHANGE TRANSPORT MODE */
  const handleTransportModeChange = async (mode) => {
    setSelectedMode(mode);

    if (isStarted && currentCoords && destinationCoordsRef.current) {
      await fetchRoute(currentCoords, destinationCoordsRef.current);
    }
  };

  return (
    <>
      {loader && <Loader loadername="Calculating route..." />}

      {/* 🎛️ NAVIGATION CONTROLS */}
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
            color: "#111",
          }}
        />

        <div
          style={{
            display: "flex",
            gap: "12px",
            marginLeft: "auto",
          }}
        >
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
                onChange={() => handleTransportModeChange(mode.value)}
              />

              {mode.label}
            </label>
          ))}
        </div>
      </div>

      {/* 📋 ROUTE DETAILS */}
      <div
        style={{
          padding: "10px",
          maxHeight: "30vh",
          overflowY: "auto",
        }}
      >
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
                <div
                  style={{
                    fontWeight: 600,
                  }}
                >
                  Mode: {rSet.mode === "bicycle" ? "Bike" : rSet.mode}
                </div>

                <div>
                  Distance:
                  <b> {(section.summary.length / 1000).toFixed(2)}</b> km | Duration:
                  <b> {Math.ceil(section.summary.duration / 60)}</b> mins
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
                      • {action.instruction || action.action}
                    </div>
                  ))}
              </div>
            ))
          )
        )}

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

      {/* 🗺️ MAP */}
      <div
        ref={mapRef}
        style={{
          width: "100%",
          height: "60vh",
        }}
      />
    </>
  );
};

export default HereMap;
