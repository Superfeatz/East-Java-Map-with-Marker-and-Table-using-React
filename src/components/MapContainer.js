import React, { useEffect, useRef } from 'react';
import { initLeafletMap } from '../utils/leafletUtils';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';

const MapContainer = ({ markers }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerGroup = useRef(null);

  useEffect(() => {
    // Cegah duplikasi jika sudah ada instance
    if (mapInstance.current) {
      mapInstance.current.remove();  // hapus peta lama dari DOM
      mapInstance.current = null;
    }

    // Inisialisasi baru
    const map = initLeafletMap(mapRef);
    mapInstance.current = map;

    const cluster = L.markerClusterGroup();
    markerGroup.current = cluster;
    map.addLayer(cluster);

    return () => {
      // Cleanup saat komponen unmount atau sebelum re-render
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (markerGroup.current) {
      markerGroup.current.clearLayers();
      if (markers && markers.length > 0) {
        markerGroup.current.addLayers(markers);
      }
    }
  }, [markers]);

  return <div ref={mapRef} className="map-container"></div>;
};

export default MapContainer;
