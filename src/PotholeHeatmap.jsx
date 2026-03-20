import { useMap } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";
import "leaflet.heat";

export default function PotholeHeatmap({ data }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !data.length) return;

    const heat = L.heatLayer(
      data.map(p => [p.lat, p.lng, 0.7]),
      { radius: 25, blur: 15 }
    );

    heat.addTo(map);
    return () => map.removeLayer(heat);
  }, [map, data]);

  return null;
}
