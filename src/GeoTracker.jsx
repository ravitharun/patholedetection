// src/GeoTracker.jsx
import { useEffect, useState, useRef, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Circle, useMap } from "react-leaflet";
import L from "leaflet";

function Recenter({ latlng }) {
  const map = useMap();
  useEffect(() => {
    if (latlng) map.setView(latlng, map.getZoom(), { animate: true });
  }, [latlng, map]);
  return null;
}

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

export default function GeoTracker() {
  const [pos, setPos] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [error, setError] = useState(null);
  const [permission, setPermission] = useState("checking");
  const watchRef = useRef(null);
  const backoffRef = useRef({ attempts: 0, timer: null });
  const wakeLockRef = useRef(null);

  // helpers
  const clearWatcher = useCallback(() => {
    if (watchRef.current !== null) {
      try { navigator.geolocation.clearWatch(watchRef.current); } catch (e) {}
      watchRef.current = null;
    }
  }, []);

  const getBackoffMs = (attempts) => {
    // exponential backoff: 2s, 4s, 8s, capped at 30s
    return Math.min(30000, 2000 * Math.pow(2, Math.max(0, attempts - 1)));
  };

  // start or restart watcher with tolerant defaults
  const startWatcher = useCallback((opts = {
    enableHighAccuracy: false, // safer default
    maximumAge: 3000,
    timeout: 20000
  }) => {
    clearWatcher();
    setError(null);

    if (!("geolocation" in navigator)) {
      setError("Geolocation not supported by browser");
      return;
    }

    const success = (p) => {
      console.log("[GEO] success", new Date().toISOString(), p.coords.latitude, p.coords.longitude, "acc", p.coords.accuracy);
      backoffRef.current.attempts = 0; // reset attempts on success
      setPos({ lat: p.coords.latitude, lng: p.coords.longitude });
      setAccuracy(p.coords.accuracy);
      setError(null);
    };

    const fail = (e) => {
      console.warn("[GEO] error", new Date().toISOString(), e.code, e.message);
      setError(`code(${e.code}) ${e.message || ""}`);

      // if transient, schedule restart with backoff
      if (e.code === 2 || e.code === 3) {
        clearWatcher();
        backoffRef.current.attempts += 1;
        const delay = getBackoffMs(backoffRef.current.attempts);
        if (backoffRef.current.timer) clearTimeout(backoffRef.current.timer);
        backoffRef.current.timer = setTimeout(() => {
          console.log("[GEO] restarting watcher, attempt", backoffRef.current.attempts);
          startWatcher({ ...opts, enableHighAccuracy: false, timeout: Math.min(30000, opts.timeout * 2) });
        }, delay);
      }
      // if permission denied (code 1), do not auto-restart
    };

    // initial one-off to prompt / get current position
    try {
      navigator.geolocation.getCurrentPosition(success, fail, opts);
      const id = navigator.geolocation.watchPosition(success, fail, opts);
      watchRef.current = id;
      console.log("[GEO] watch started id", id);
    } catch (ex) {
      console.error("[GEO] start exception", ex);
      setError("start exception: " + (ex.message || ex));
    }
  }, [clearWatcher]);

  // permission watcher
  useEffect(() => {
    if (navigator.permissions) {
      navigator.permissions.query({ name: "geolocation" })
        .then(s => {
          setPermission(s.state);
          s.onchange = () => setPermission(s.state);
        }).catch(() => setPermission("prompt"));
    } else {
      setPermission("prompt");
    }
  }, []);

  // auto-start when allowed
  useEffect(() => {
    if (permission === "granted" || permission === "prompt") startWatcher();
    return () => {
      if (backoffRef.current.timer) clearTimeout(backoffRef.current.timer);
      clearWatcher();
    };
  }, [permission, startWatcher, clearWatcher]);

  // restart watcher when tab becomes visible again (avoids browser throttle issues)
  useEffect(() => {
    function onVis() {
      if (document.visibilityState === "visible") {
        console.log("[GEO] visible -> ensure watcher");
        if (!watchRef.current) startWatcher();
      } else {
        // optional: clearWatcher(); // conserve resources when hidden
      }
    }
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [startWatcher, clearWatcher]);

  // Vite HMR friendly: clear watcher before full reload to avoid duplicates
  if (import.meta && import.meta.hot) {
    import.meta.hot.on("vite:beforeFullReload", () => {
      console.log("[GEO] vite reload - clearing watcher");
      clearWatcher();
    });
  }

  // Optional: Wake Lock to reduce mobile suspension (call from UI)
  const requestWakeLock = async () => {
    try {
      if ("wakeLock" in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request("screen");
        wakeLockRef.current.addEventListener("release", () => {
          console.log("[WAKE] released");
        });
        console.log("[WAKE] acquired");
      } else {
        console.log("[WAKE] not supported");
      }
    } catch (err) {
      console.warn("[WAKE] failed", err);
    }
  };
  const releaseWakeLock = async () => {
    try {
      if (wakeLockRef.current) {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
    } catch (e) { console.warn("[WAKE] release error", e); }
  };

  const center = pos ?? { lat: 20, lng: 0 };

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      {/* Denied overlay */}
      {permission === "denied" && (
        <div style={{ position: "absolute", top: 12, right: 12, zIndex: 9999, background: "white", padding: 12, borderRadius: 8 }}>
          <strong>Location permission denied.</strong>
          <div style={{ marginTop: 6 }}>Open browser site settings → Location → Allow. Then click Retry.</div>
          <button style={{ marginTop: 8 }} onClick={() => startWatcher()}>Retry</button>
        </div>
      )}

      <MapContainer center={center} zoom={16} style={{ height: "100%", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />
        {pos && (
          <>
            <Marker position={[pos.lat, pos.lng]} />
            {accuracy != null && <Circle center={[pos.lat, pos.lng]} radius={accuracy} />}
            <Recenter latlng={[pos.lat, pos.lng]} />
          </>
        )}
      </MapContainer>

      {/* status */}
      <div style={{ position: "absolute", left: 12, top: 12, background: "rgba(255,255,255,0.95)", padding: 10, borderRadius: 6 }}>
        <div><strong>Geo status</strong></div>
        <div>Permission: {permission}</div>
        <div>Pos: {pos ? `${pos.lat.toFixed(6)}, ${pos.lng.toFixed(6)}` : "waiting..."}</div>
        <div>Accuracy: {accuracy != null ? `${Math.round(accuracy)} m` : "—"}</div>
        <div style={{ color: "red" }}>{error}</div>
        <div style={{ marginTop: 8 }}>
          <button onClick={() => { clearWatcher(); startWatcher(); }}>Retry</button>
          <button onClick={() => { clearWatcher(); navigator.geolocation.getCurrentPosition(p => { setPos({ lat: p.coords.latitude, lng: p.coords.longitude}); setAccuracy(p.coords.accuracy); }, e => setError(e.message), { timeout: 20000 }); }} style={{ marginLeft: 8 }}>One-shot</button>
          <button onClick={requestWakeLock} style={{ marginLeft: 8 }}>WakeLock (mobile)</button>
          <button onClick={releaseWakeLock} style={{ marginLeft: 8 }}>Release WakeLock</button>
        </div>
      </div>
    </div>
  );
}
