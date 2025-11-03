import React from 'react';

const StatsBar = ({ total, displayed, invalid }) => (
  <div className="status-bar">
    <span>Total: {total}</span>
    <span>Ditampilkan: {displayed}</span>
    <span>Invalid: {invalid}</span>
  </div>
);

export default StatsBar;
