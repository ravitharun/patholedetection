// src/TrafficFlowLayer.jsx
import { useEffect } from "react";
import { useMap } from "react-leaflet";
import "./TrafficFlowLayer.css";

const HERE_API_KEY = import.meta.env.VITE_HERE_API_KEY;

export default function TrafficFlowLayer({ center }) {
  const map = useMap();

 useEffect(() => {
  console.log("🚦 TrafficFlowLayer mounted", center);

  if (!center) {
    console.log("❌ No center, aborting traffic render");
    return;
  }

  if (!map) {
    console.log("❌ Map instance missing");
    return;
  }

  console.log("✅ Map instance OK");

  if (!map.getPane("traffic-data")) {
    console.log("🟡 Creating traffic-data pane");
    map.createPane("traffic-data");
    map.getPane("traffic-data").style.zIndex = 460;
  } else {
    console.log("🟢 traffic-data pane already exists");
  }

  async function loadTraffic() {
    console.log("🌐 Fetching HERE traffic…");

    const url =
      `https://data.traffic.hereapi.com/v7/flow` +
      `?in=circle:${center.lat},${center.lng};r=5000` +
      `&locationReferencing=shape` +
      `&minJamFactor=4` +
      `&apikey=${HERE_API_KEY}`;

    const res = await fetch(url);
    console.log("🌐 HTTP status:", res.status);

    const data = await res.json();
    console.log("📦 Traffic results count:", data.results?.length);

    if (!data.results?.length) {
      console.warn("⚠️ No traffic data returned");
      return;
    }

    let added = 0;

    data.results.forEach((item) => {
      if (!item.location?.shape) return;

      const latlngs = item.location.shape.map(p => [p.lat, p.lng]);

      const poly = window.L.polyline(latlngs, {
        pane: "traffic-data",
        color: "red",
        weight: 5,
        opacity: 0.9,
      });

      poly.addTo(map);
      added++;
    });

    console.log("✅ Polylines added:", added);
  }

        loadTraffic();
    }, [center, map]);


  return null;
}
