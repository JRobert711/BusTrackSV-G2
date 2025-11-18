import { useEffect, useRef } from "react";
import mapboxgl, { Map as MapboxMap } from "mapbox-gl";

// ⚠️ PONER TU TOKEN AQUÍ
mapboxgl.accessToken = "pk.eyJ1IjoiZW1pbGlvcDFvIiwiYSI6ImNtaTQzc2QzbDE5cnMya29lN2N1bDBqbzAifQ._kLPzOXtEqwDom86Ph6CnQ";

export default function Map() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<MapboxMap | null>(null);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [-89.2182, 13.6929], // San Salvador
      zoom: 12,
    });

    // Limpieza al desmontar
    return () => {
      map.current?.remove();
    };
  }, []);

  return (
    <div
      ref={mapContainer}
      className="w-full h-full"
      style={{ minHeight: "500px" }}
    />
  );
}
