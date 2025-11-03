export const initLeafletMap = (mapRef) => {
  const bounds = [
    [-8.85, 111.0],
    [-6.8, 114.5],
  ];

  const map = window.L.map(mapRef.current).fitBounds(bounds);

  window.L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    {
      attribution: 'Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics',
      maxZoom: 20,
      maxNativeZoom: 18,
    }
  ).addTo(map);

  window.L.control.scale({ imperial: false, metric: true }).addTo(map);

  const eastJavaBoundary = {
    type: 'Feature',
    properties: { name: 'Jawa Timur' },
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [110.5, -9.0],
          [115.5, -9.0],
          [115.5, -6.5],
          [110.5, -6.5],
          [110.5, -9.0],
        ],
      ],
    },
  };

  window.L.geoJSON(eastJavaBoundary, {
    style: {
      color: '#667eea',
      weight: 3,
      opacity: 0.6,
      fillColor: '#667eea',
      fillOpacity: 0.05,
    },
  }).addTo(map);

  return map;
};
