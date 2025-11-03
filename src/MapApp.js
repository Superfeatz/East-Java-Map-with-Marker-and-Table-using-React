import React, { useEffect, useRef, useState } from 'react';
import './MapApp.css';



const MapApp = () => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerClusterGroupRef = useRef(null);
  
  const [allData, setAllData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [allMarkers, setAllMarkers] = useState([]);
  const [invalidCount, setInvalidCount] = useState(0);
  
  const [searchTerm, setSearchTerm] = useState('');
  
  const [message, setMessage] = useState({ text: '', type: '' });

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [towerIdFilter, setTowerIdFilter] = useState('');
  const [siteIdFilter, setSiteIdFilter] = useState('');
  const [operatorFilter, setOperatorFilter] = useState('');

  // const [newData, setNewData] = useState({
  //   site_id: "",
  //   latitude: "",
  //   longitude: ""
  // });

  // const handleAddData = () => {
  // const { site_id, latitude, longitude } = newData;

  // if (!site_id || !latitude || !longitude) {
  //   setMessage({ text: "⚠️ Lengkapi semua field sebelum menambah data.", type: "warning" });
  //   return;
  // }

  // const lat = parseFloat(latitude);
  // const lon = parseFloat(longitude);

  // if (isNaN(lat) || isNaN(lon)) {
  //   setMessage({ text: "⚠️ Latitude dan Longitude harus berupa angka.", type: "warning" });
  //   return;
  // }

  // // Validasi koordinat
  // if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
  //   setMessage({ text: "⚠️ Koordinat tidak valid.", type: "error" });
  //   return;
  // }

  // // Buat marker baru
  // const newMarkerData = {
  //   "Site ID": site_id,
  //   "latitude_decimal": lat,
  //   "longitude_decimal": lon,
  //   "Site Name Actual": "Manual Entry",
  //   "City": "-",
  //   "Address": "-",
  // };

  // const marker = window.L.marker([lat, lon])
  //   .bindPopup(`<b>${site_id}</b><br>Lat: ${lat}<br>Lon: ${lon}`)
  //   .addTo(mapInstanceRef.current);

  //   // Tambahkan ke state
  //   setAllData((prev) => [...prev, newMarkerData]);
  //   setFilteredData((prev) => [...prev, newMarkerData]);
  //   setAllMarkers((prev) => [...prev, marker]);

  //   setMessage({ text: `✅ Data ${site_id} berhasil ditambahkan.`, type: "success" });

  //   // Reset form
  //   setNewData({ site_id: "", latitude: "", longitude: "" });
  // };

  // Load Leaflet and dependencies
  useEffect(() => {
    const loadScript = (src) => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });
    };

    // Load Leaflet CSS
    const leafletCSS = document.createElement('link');
    leafletCSS.rel = 'stylesheet';
    leafletCSS.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(leafletCSS);

    const markerClusterCSS1 = document.createElement('link');
    markerClusterCSS1.rel = 'stylesheet';
    markerClusterCSS1.href = 'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css';
    document.head.appendChild(markerClusterCSS1);

    const markerClusterCSS2 = document.createElement('link');
    markerClusterCSS2.rel = 'stylesheet';
    markerClusterCSS2.href = 'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css';
    document.head.appendChild(markerClusterCSS2);

    const loadLibraries = async () => {
      try {
        await loadScript('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js');
        await loadScript('https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js');
        await loadScript('https://unpkg.com/papaparse@5.4.1/papaparse.min.js');
        
        // Initialize map after libraries load
        if (!window.L || mapInstanceRef.current) return;

        const bounds = [
          [-8.85, 111.0],
          [-6.8, 114.5]
        ];

        const map = window.L.map(mapRef.current).fitBounds(bounds);
        mapInstanceRef.current = map;

        window.L.tileLayer(
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          {
            attribution:
              'Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics',
            maxZoom: 20,
            maxNativeZoom: 18
          }
        ).addTo(map);
        // Parse URL parameter
        const params = new URLSearchParams(window.location.search);
        const lat = parseFloat(params.get('lat'));
        const lng = parseFloat(params.get('lng'));

        if (!isNaN(lat) && !isNaN(lng)) {
          const marker = window.L.marker([lat, lng]).addTo(map);
          marker.bindPopup(`Koordinat: ${lat}, ${lng}`).openPopup();
          map.setView([lat, lng], 12);
        }


        window.L.control.scale({ imperial: false, metric: true }).addTo(map);

        const markerCluster = window.L.markerClusterGroup({
          maxClusterRadius: 30,
          spiderfyOnMaxZoom: true,
          showCoverageOnHover: false,
          zoomToBoundsOnClick: true
        });
        map.addLayer(markerCluster);
        markerClusterGroupRef.current = markerCluster;

        // Add East Java boundary
        const eastJavaBoundary = {
          type: 'Feature',
          properties: { name: 'Jawa Timur' },
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [110.5, -9.0],  // southwest
              [115.5, -9.0],  // southeast
              [115.5, -6.5],  // northeast
              [110.5, -6.5],  // northwest
              [110.5, -9.0]   // close the polygon
            ]]
          }
        };

        window.L.geoJSON(eastJavaBoundary, {
          style: {
            color: '#667eea',
            weight: 3,
            opacity: 0.6,
            fillColor: '#667eea',
            fillOpacity: 0.05
          }
        }).addTo(map);

        // Load default CSV
        loadDefaultCSV();
      } catch (error) {
        showMessage('Gagal memuat library peta', 'error');
      }
    };

    loadLibraries();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const normalizeDecimal = (value) => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      return parseFloat(value.replace(',', '.'));
    }
    return NaN;
  };

  const isValidCoordinate = (lat, lon) => {
    const latitude = normalizeDecimal(lat);
    const longitude = normalizeDecimal(lon);
    
    return !isNaN(latitude) && !isNaN(longitude) &&
           latitude >= -90 && latitude <= 90 &&
           longitude >= -180 && longitude <= 180;
  };

  const createPopupContent = (data) => {
    const essentialFields = [
      { key: 'Site Name Actual', label: 'Nama Lokasi' },
      { key: 'Address', label: 'Alamat' },
      { key: 'City', label: 'Kota' },
      { key: 'latitude_decimal', label: 'Latitude' },
      { key: 'longitude_decimal', label: 'Longitude' },
      { key: 'Tower Owner', label: 'Pemilik Tower' },
      { key: 'Name Of Tenant', label: 'Operator' },
      { key: 'Site Type', label: 'Tipe Lokasi' },
      { key: 'Tenant Rental Price/Month', label: 'Harga Sewa/Bulan' },
      { key: 'Tenant Start Lease', label: 'Mulai Sewa' },
      { key: 'Tenant End Lease', label: 'Akhir Sewa' }
    ];

    let html = '<table class="popup-table">';
    html += '<thead><tr><th>Field</th><th>Value</th></tr></thead>';
    html += '<tbody>';

    essentialFields.forEach(field => {
      let value = data[field.key] || '-';
      
      if (field.key === 'Tenant Rental Price/Month' && value !== '-') {
        value = 'Rp ' + parseFloat(value).toLocaleString('id-ID');
      }
      
      if ((field.key.includes('Lease') || field.key.includes('Date')) && value && value !== '-') {
        // Pisahkan jika ada banyak tanggal dalam satu string
        const dateParts = value.split(',').map(v => v.trim()).filter(Boolean);

        const formattedParts = dateParts.map(part => {
          // Hilangkan jam seperti "00:00:00"
          const cleaned = part.replace(/(\s*\d{2}:\d{2}:\d{2})/, '').trim();

          // Coba parse tanggalnya
          const parsed = new Date(cleaned);
          if (!isNaN(parsed.getTime())) {
            return parsed.toLocaleDateString('id-ID', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            });
          }

          // Kalau gagal parse tapi bukan kosong, tampilkan aslinya
          return cleaned ? `(invalid: ${cleaned})` : '-';
        });

        // Gabungkan hasil dengan koma
        value = formattedParts.join(', ');
      }



      html += `<tr><td>${field.label}</td><td>${value}</td></tr>`;
    });

    html += '</tbody></table>';
    return html;
  };

  const createMarker = (data, invalidCountRef) => {
    const lat = normalizeDecimal(data.latitude_decimal);
    const lon = normalizeDecimal(data.longitude_decimal);

    if (!isValidCoordinate(lat, lon)) {
      invalidCountRef.current++;
      return null;
    }

    const markerName = `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
    const marker = window.L.marker([lat, lon]);
    
    marker.bindTooltip(markerName, {
      permanent: false,
      direction: 'top'
    });

    marker.bindPopup(createPopupContent(data), {
      maxWidth: 400,
      maxHeight: 400
    });

    marker.locationData = data;
    return marker;
  };

  const processCSVData = (csvData) => {
    if (!csvData || csvData.length === 0) {
      showMessage('Data kosong tidak dapat diproses', 'warning');
      return;
    }

    const invalidCountRef = { current: 0 };
    const mergedDataMap = new Map(); // key: "lat,lon", value: data gabungan

    csvData.forEach(row => {
      const normalizedRow = {};
      Object.keys(row).forEach(key => {
        normalizedRow[key.trim()] = row[key];
      });

      const lat = normalizeDecimal(normalizedRow.latitude_decimal);
      const lon = normalizeDecimal(normalizedRow.longitude_decimal);

      if (!isValidCoordinate(lat, lon)) {
        invalidCountRef.current++;
        return;
      }

      const key = `${lat.toFixed(6)},${lon.toFixed(6)}`;

      // Jika koordinat sudah ada, gabungkan datanya
      if (mergedDataMap.has(key)) {
        const existing = mergedDataMap.get(key);
        Object.keys(normalizedRow).forEach(k => {
          const existingVal = existing[k] || '';
          const newVal = normalizedRow[k] || '';
          if (existingVal && newVal && existingVal !== newVal) {
            // Hindari duplikasi nilai
            const mergedVals = new Set([...existingVal.split(', '), newVal]);
            existing[k] = Array.from(mergedVals).join(', ');
          } else if (!existingVal && newVal) {
            existing[k] = newVal;
          }
        });
      } else {
        mergedDataMap.set(key, normalizedRow);
      }
    });

    // Setelah semua digabung, buat marker
    const mergedDataArray = Array.from(mergedDataMap.values());
    const newMarkers = mergedDataArray.map(data => createMarker(data, invalidCountRef));

    setAllData(mergedDataArray);
    setAllMarkers(newMarkers);
    setFilteredData(mergedDataArray);
    setInvalidCount(invalidCountRef.current);

    // Update marker di peta
    if (markerClusterGroupRef.current) {
      markerClusterGroupRef.current.clearLayers();
      markerClusterGroupRef.current.addLayers(newMarkers.filter(Boolean));
    }

    showMessage(
      `Berhasil memuat ${newMarkers.length} marker unik dari ${csvData.length} baris data`,
      'success'
    );

    if (invalidCountRef.current > 0) {
      setTimeout(() => {
        showMessage(`Peringatan: ${invalidCountRef.current} baris dilewati karena koordinat tidak valid`, 'warning');
      }, 5500);
    }
  };


  const loadDefaultCSV = () => {
    fetch('/data/sample.csv')
      .then(response => {
        if (!response.ok) {
          throw new Error('Gagal memuat file CSV default');
        }
        return response.text();
      })
      .then(csvText => {
        window.Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            processCSVData(results.data);
          },
          error: (error) => {
            showMessage('Error parsing CSV: ' + error.message, 'error');
          }
        });
      })
      .catch(error => {
        showMessage('Gagal memuat data default. Silakan unggah file CSV.', 'error');
        console.error('Error loading default CSV:', error);
      });
  };
  // Apply filters
  useEffect(() => {
    if (allData.length === 0) return;

    const filtered = allData.filter(data => {
      const lower = (v) => (v || '').toString().toLowerCase();
        // 1. Filter umum (Nama, Kota, Alamat)
        const searchMatch =
          !searchTerm ||
          (data['Site Name Actual'] || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (data['Address'] || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (data['City'] || '').toLowerCase().includes(searchTerm.toLowerCase());

        // 🧱 Tower ID filter — bisa muncul di beberapa kolom berbeda
        const towerMatch =
          !towerIdFilter ||
          lower(data['Tower ID']).includes(towerIdFilter.toLowerCase()) ||
          lower(data['Project ID Actual']).includes(towerIdFilter.toLowerCase()) ||
          lower(data['Site ID DMT']).includes(towerIdFilter.toLowerCase()) ||
          lower(data['Site ID Tenant']).includes(towerIdFilter.toLowerCase());

        // 🏗️ Site ID filter — kadang muncul di kolom tenant/owner
        const siteMatch =
          !siteIdFilter ||
          lower(data['Site Name Actual']).includes(siteIdFilter.toLowerCase()) ||
          lower(data['Site Name Owner']).includes(siteIdFilter.toLowerCase()) ||
          lower(data['Site ID Tenant']).includes(siteIdFilter.toLowerCase()) ||
          lower(data['Site ID DMT']).includes(siteIdFilter.toLowerCase());

        // 📡 Operator filter
        const operatorMatch =
          !operatorFilter ||
          lower(data['Name Of Tenant']).includes(operatorFilter.toLowerCase()) ||
          lower(data['Tower Owner']).includes(operatorFilter.toLowerCase());
        return searchMatch && towerMatch && siteMatch && operatorMatch;
    });

    setFilteredData(filtered);

    if (markerClusterGroupRef.current) {
      markerClusterGroupRef.current.clearLayers();
      const markersToDisplay = allMarkers.filter(marker =>
        filtered.includes(marker.locationData)
      );
      markerClusterGroupRef.current.addLayers(markersToDisplay);
    }
  }, [searchTerm,towerIdFilter, siteIdFilter, operatorFilter, allData, allMarkers]);


  const handleReset = () => {
    if (mapInstanceRef.current) {
      const bounds = [
        [-8.85, 111.0],
        [-6.8, 114.5]
      ];
      mapInstanceRef.current.fitBounds(bounds);
    }
  };

  const handleExport = () => {
    if (filteredData.length === 0) {
      showMessage('Tidak ada data untuk diekspor', 'warning');
      return;
    }

    if (window.Papa) {
      const csv = window.Papa.unparse(filteredData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `jatim_towers_${Date.now()}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showMessage(`Berhasil mengekspor ${filteredData.length} baris data`, 'success');
    }
  };

  return (
    <div className="map-app-container">
      <header className="map-header">
        <div className="header-content">
          <button className="burger-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            ☰
          </button>
          <h1>🗺️ Peta Tower di Jawa Timur</h1>
          <p className="subtitle">Lokasi Tower & Infrastruktur Telekomunikasi</p>
        </div>
      </header>

      {/* Drawer (sidebar menu) */}
      <div className={`side-menu ${isMenuOpen ? 'open' : ''}`}>
        <div className="side-menu-header">
          <h3>🔧 Filter</h3>
          <button className="close-btn" onClick={() => setIsMenuOpen(false)}>✕</button>
        </div>

        <div className="control-panel">
          {/* 🔍 Pencarian Umum */}
          <div className="control-group">
            <label htmlFor="searchInput">🔍 Pencarian Umum</label>
            <input
              type="text"
              id="searchInput"
              placeholder="Cari berdasarkan nama, kota, atau alamat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          {/* 🔍 Pencarian Tower ID */}
          <div className="control-group">
            <label htmlFor="towerIdInput">🧱 Tower ID</label>
            <input
              type="text"
              id="towerIdInput"
              placeholder="Cari berdasarkan Tower ID..."
              value={towerIdFilter}
              onChange={(e) => setTowerIdFilter(e.target.value)}
              className="search-input"
            />
          </div>

          {/* 🏗️ Pencarian Site ID */}
          <div className="control-group">
            <label htmlFor="siteIdInput">🏗️ Site ID</label>
            <input
              type="text"
              id="siteIdInput"
              placeholder="Cari berdasarkan Site ID..."
              value={siteIdFilter}
              onChange={(e) => setSiteIdFilter(e.target.value)}
              className="search-input"
            />
          </div>

          {/* 📡 Pencarian Operator */}
          <div className="control-group">
            <label htmlFor="operatorInput">📡 Operator</label>
            <input
              type="text"
              id="operatorInput"
              placeholder="Cari berdasarkan Operator..."
              value={operatorFilter}
              onChange={(e) => setOperatorFilter(e.target.value)}
              className="search-input"
            />
          </div>

          <hr />

          {/* Tombol Reset & Ekspor */}
          <div className="control-group">
            <button onClick={handleReset} className="btn-reset">🔄 Reset Peta</button>
          </div>

          <div className="control-group">
            <button onClick={handleExport} className="btn-export">💾 Ekspor ke CSV</button>
          </div>

          <div className="status-bar">
            <span>Total: {allData.length}</span>
            <span>Ditampilkan: {filteredData.length}</span>
            <span>Invalid: {invalidCount}</span>
          </div>
        </div>
      </div>

      {message.text && (
        <div className={`message-banner ${message.type}`}>
          {message.text}
        </div>
      )}

      <div ref={mapRef} className="map-container"></div>
    </div>
  );

};

export default MapApp;
