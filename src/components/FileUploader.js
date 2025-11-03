import React from 'react';

const FileUploader = ({ onUpload }) => (
  <div className="file-uploader">
    <label>📂 Unggah CSV</label>
    <input
      type="file"
      accept=".csv"
      onChange={(e) => onUpload(e.target.files[0])}
    />
  </div>
);

export default FileUploader;
