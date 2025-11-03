import React from 'react';

const ControlPanel = ({
  searchTerm,
  setSearchTerm,
  siteTypes,
  siteTypeFilter,
  setSiteTypeFilter,
  tenants,
  tenantFilter,
  setTenantFilter,
  serviceClasses,
  serviceFilter,
  setServiceFilter,
  onReset,
  onExport,
}) => (
  <div className="control-panel">
    <div className="control-row">
      <div className="control-group">
        <label>🔍 Pencarian</label>
        <input
          type="text"
          placeholder="Cari nama, alamat, kota..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="control-group">
        <label>🏢 Tipe Lokasi</label>
        <select
          value={siteTypeFilter}
          onChange={(e) => setSiteTypeFilter(e.target.value)}
        >
          <option value="all">Semua</option>
          {siteTypes.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </div>
      <div className="control-group">
        <label>📡 Operator</label>
        <select
          value={tenantFilter}
          onChange={(e) => setTenantFilter(e.target.value)}
        >
          <option value="all">Semua</option>
          {tenants.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </div>
      <div className="control-group">
        <label>⚙️ Layanan</label>
        <select
          value={serviceFilter}
          onChange={(e) => setServiceFilter(e.target.value)}
        >
          <option value="all">Semua</option>
          {serviceClasses.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>
    </div>

    <div className="control-row">
      <button onClick={onReset}>🔄 Reset</button>
      <button onClick={onExport}>💾 Ekspor CSV</button>
    </div>
  </div>
);

export default ControlPanel;
