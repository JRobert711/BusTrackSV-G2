import { useEffect, useRef, useState } from "react";
import mapboxgl, { Map as MapboxMap } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// Configuración de Mapbox
mapboxgl.accessToken = "pk.eyJ1IjoiZW1pbGlvcDFvIiwiYSI6ImNtaTQzc2QzbDE5cnMya29lN2N1bDBqbzAifQ._kLPzOXtEqwDom86Ph6CnQ";

// Coordenadas de El Salvador
const EL_SALVADOR_CENTER: [number, number] = [-88.9149, 13.7942];
const EL_SALVADOR_BOUNDS: mapboxgl.LngLatBoundsLike = [
  [-90.2, 12.9], // Suroeste
  [-87.5, 14.5]  // Noreste
];

export default function Map() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<MapboxMap | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Función para inicializar el mapa
  const initializeMap = () => {
    if (!mapContainer.current) {
      setError("No se pudo inicializar el contenedor del mapa");
      return;
    }

    try {
      // Crear instancia del mapa
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v11", // Usar un estilo que funcione
        center: EL_SALVADOR_CENTER,
        zoom: 7,
        minZoom: 6,
        maxBounds: EL_SALVADOR_BOUNDS,
        antialias: true,
        trackResize: true
      });

      // Agregar controles de navegación
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Manejar errores
      map.current.on('load', () => {
        console.log('Mapa cargado correctamente');
        setError(null);
      });

      map.current.on('error', (e) => {
        console.error('Error en el mapa:', e);
        setError(`Error al cargar el mapa: ${e.error?.message || 'Error desconocido'}`);
      });

    } catch (err) {
      console.error('Error al inicializar el mapa:', err);
      setError('Error crítico al inicializar el mapa');
    }
  };

  useEffect(() => {
    // Inicializar el mapa una sola vez
    if (!map.current) {
      initializeMap();
    }

    // Limpieza al desmontar
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  return (
    <div className="w-full h-full relative">
      {error && (
        <div className="absolute inset-0 bg-red-50 flex items-center justify-center p-4 text-center z-10">
          <div className="bg-white p-4 rounded-lg shadow-md max-w-md">
            <h3 className="text-lg font-medium text-red-600 mb-2">Error en el mapa</h3>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={initializeMap}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      )}
      <div
        ref={mapContainer}
        className="w-full h-full bg-gray-200"
      />
    </div>
  );
}
