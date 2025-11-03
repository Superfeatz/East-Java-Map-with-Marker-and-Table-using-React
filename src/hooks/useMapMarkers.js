import { normalizeDecimal, isValidCoordinate } from '../utils/formatUtils';

export const useMapMarkers = () => {
  const createPopupContent = (data) => {
    const fields = [
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
    ];

    let html = '<table class="popup-table"><tbody>';
    fields.forEach((f) => {
      let val = data[f.key] || '-';
      if (f.key.includes('Price') && val !== '-')
        val = 'Rp ' + parseFloat(val).toLocaleString('id-ID');
      html += `<tr><td>${f.label}</td><td>${val}</td></tr>`;
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

    const marker = window.L.marker([lat, lon]);
    marker.bindTooltip(`${lat.toFixed(5)}, ${lon.toFixed(5)}`);
    marker.bindPopup(createPopupContent(data), { maxWidth: 400 });
    marker.locationData = data;
    return marker;
  };

  return { createMarker };
};
