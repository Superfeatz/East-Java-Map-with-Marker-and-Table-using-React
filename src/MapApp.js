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
  const [siteTypeFilter, setSiteTypeFilter] = useState('all');
  const [tenantFilter, setTenantFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');
  
  const [siteTypes, setSiteTypes] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [serviceClasses, setServiceClasses] = useState([]);
  
  const [message, setMessage] = useState({ text: '', type: '' });

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
            maxZoom: 19
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
          maxClusterRadius: 50,
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
      { key: 'Class Of Service', label: 'Kelas Layanan' },
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
      
      if ((field.key.includes('Lease') || field.key.includes('Date')) && value !== '-') {
        try {
          value = new Date(value).toLocaleDateString('id-ID');
        } catch (e) {
          // Keep original value if date parsing fails
        }
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
    const newData = [];
    const newMarkers = [];

    csvData.forEach(row => {
      const normalizedRow = {};
      Object.keys(row).forEach(key => {
        normalizedRow[key.trim()] = row[key];
      });

      newData.push(normalizedRow);
      const marker = createMarker(normalizedRow, invalidCountRef);
      if (marker) {
        newMarkers.push(marker);
      }
    });

    setAllData(newData);
    setAllMarkers(newMarkers);
    setFilteredData(newData);
    setInvalidCount(invalidCountRef.current);

    // Populate filters
    const siteTypesSet = [...new Set(newData.map(d => d['Site Type']).filter(v => v))];
    const tenantsSet = [...new Set(newData.map(d => d['Name Of Tenant']).filter(v => v))];
    const serviceClassesSet = [...new Set(newData.map(d => d['Class Of Service']).filter(v => v))];

    setSiteTypes(siteTypesSet.sort());
    setTenants(tenantsSet.sort());
    setServiceClasses(serviceClassesSet.sort());

    // Update map
    if (markerClusterGroupRef.current) {
      markerClusterGroupRef.current.clearLayers();
      markerClusterGroupRef.current.addLayers(newMarkers);
    }

    showMessage(`Berhasil memuat ${newMarkers.length} lokasi dari ${csvData.length} baris data`, 'success');
    
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

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && window.Papa) {
      window.Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            showMessage('Format CSV tidak valid atau terdapat kesalahan parsing', 'error');
            return;
          }
          if (results.data.length === 0) {
            showMessage('File CSV kosong atau tidak memiliki data', 'warning');
            return;
          }
          processCSVData(results.data);
        },
        error: (error) => {
          showMessage('Gagal memuat file CSV: ' + error.message, 'error');
        }
      });
    }
  };
  

  // Apply filters
  useEffect(() => {
    if (allData.length === 0) return;

    const filtered = allData.filter(data => {
      const searchMatch = !searchTerm || 
        (data['Site Name Actual'] || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (data['Address'] || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (data['City'] || '').toLowerCase().includes(searchTerm.toLowerCase());

      const siteTypeMatch = siteTypeFilter === 'all' || data['Site Type'] === siteTypeFilter;
      const tenantMatch = tenantFilter === 'all' || data['Name Of Tenant'] === tenantFilter;
      const serviceMatch = serviceFilter === 'all' || data['Class Of Service'] === serviceFilter;

      return searchMatch && siteTypeMatch && tenantMatch && serviceMatch;
    });

    setFilteredData(filtered);

    // Update map markers
    if (markerClusterGroupRef.current) {
      markerClusterGroupRef.current.clearLayers();
      const markersToDisplay = allMarkers.filter(marker => 
        filtered.includes(marker.locationData)
      );
      markerClusterGroupRef.current.addLayers(markersToDisplay);
    }
  }, [searchTerm, siteTypeFilter, tenantFilter, serviceFilter, allData, allMarkers]);

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
          <h1>🗺️ Peta Interaktif Jawa Timur</h1>
          <p className="subtitle">Lokasi Tower & Infrastruktur Telekomunikasi</p>
        </div>
      </header>

      <div className="control-panel">
        <div className="control-row">
          <div className="control-group">
            <label htmlFor="searchInput">🔍 Pencarian</label>
            <input 
              type="text" 
              id="searchInput" 
              placeholder="Cari berdasarkan nama, alamat, atau kota..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="control-group">
            <label htmlFor="siteTypeFilter">🏢 Tipe Lokasi</label>
            <select 
              id="siteTypeFilter" 
              className="filter-select"
              value={siteTypeFilter}
              onChange={(e) => setSiteTypeFilter(e.target.value)}
              disabled={siteTypes.length === 0}
            >
              <option value="all">Semua Tipe</option>
              {siteTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="control-group">
            <label htmlFor="tenantFilter">📡 Operator</label>
            <select 
              id="tenantFilter" 
              className="filter-select"
              value={tenantFilter}
              onChange={(e) => setTenantFilter(e.target.value)}
              disabled={tenants.length === 0}
            >
              <option value="all">Semua Operator</option>
              {tenants.map(tenant => (
                <option key={tenant} value={tenant}>{tenant}</option>
              ))}
            </select>
          </div>

          <div className="control-group">
            <label htmlFor="serviceFilter">⚙️ Kelas Layanan</label>
            <select 
              id="serviceFilter" 
              className="filter-select"
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              disabled={serviceClasses.length === 0}
            >
              <option value="all">Semua Layanan</option>
              {serviceClasses.map(service => (
                <option key={service} value={service}>{service}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="control-row">
          <div className="control-group">
            <label htmlFor="csvFileInput">📂 Unggah CSV</label>
            <input 
              type="file" 
              id="csvFileInput" 
              accept=".csv"
              className="file-input"
              onChange={handleFileUpload}
            />
          </div>

          <div className="control-group">
            <button onClick={handleReset} className="btn-reset">🔄 Reset Peta</button>
          </div>

          <div className="control-group">
            <button onClick={handleExport} className="btn-export">💾 Ekspor ke CSV</button>
          </div>
        </div>

        <div className="status-bar">
          <span className="status-item">Total: {allData.length}</span>
          <span className="status-item">Ditampilkan: {filteredData.length}</span>
          <span className="status-item">Invalid: {invalidCount}</span>
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