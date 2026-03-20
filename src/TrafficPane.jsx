import { useEffect } from "react";
import { useMap } from "react-leaflet";

export default function TrafficPane() {
  const map = useMap();

  useEffect(() => {
    if (!map.getPane("traffic-data")) {
      map.createPane("traffic-data");
      map.getPane("traffic-data").style.zIndex = 460;
      map.getPane("traffic-data").style.pointerEvents = "none";
      console.log("✅ traffic-data pane created");
    }
  }, [map]);

  return null;
}
