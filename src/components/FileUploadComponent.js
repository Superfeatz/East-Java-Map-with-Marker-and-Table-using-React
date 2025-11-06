import React, { useState } from 'react';

const FileUploadComponent = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validasi tipe file
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv'
      ];
      
      if (!validTypes.includes(selectedFile.type) && 
          !selectedFile.name.endsWith('.xlsx') && 
          !selectedFile.name.endsWith('.xls') &&
          !selectedFile.name.endsWith('.csv')) {
        setMessage({ 
          text: '⚠️ Format file tidak didukung. Gunakan .xlsx, .xls, atau .csv', 
          type: 'error' 
        });
        return;
      }
      
      setFile(selectedFile);
      setMessage({ text: '', type: '' });
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage({ text: '⚠️ Pilih file terlebih dahulu', type: 'warning' });
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ 
          text: `✅ ${data.message}`, 
          type: 'success' 
        });
        
        // Parse CSV dan kirim ke parent component
        if (file.name.endsWith('.csv')) {
          parseAndLoadCSV(file);
        } else {
          setMessage({ 
            text: '✅ File berhasil diupload', 
            type: 'success' 
          });
        }
        
        // Reset file input
        setFile(null);
        document.getElementById('fileInput').value = '';
      } else {
        setMessage({ 
          text: `❌ ${data.message || 'Gagal mengupload file ke server, saat ini masih disimpan di local storage.'}`, 
          type: 'error' 
        });
      }
    } catch (error) {
      setMessage({ 
        text: `❌ Error: ${error.message}. Pastikan backend berjalan di http://localhost:5000`, 
        type: 'error' 
      });
    } finally {
      setUploading(false);
    }
  };

  const parseAndLoadCSV = (csvFile) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const csvText = e.target.result;
      window.Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (onUploadSuccess) {
            onUploadSuccess(results.data);
          }
        },
        error: (error) => {
          setMessage({ 
            text: `❌ Error parsing CSV: ${error.message}`, 
            type: 'error' 
          });
        }
      });
    };
    reader.readAsText(csvFile);
  };

  return (
    <div className="file-upload-section">
      <div className="control-group">
        <label htmlFor="fileInput">📂 Upload File CSV/Excel</label>
        <input
          id="fileInput"
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileChange}
          disabled={uploading}
          style={{ marginBottom: '0.5rem' }}
        />
        
        {file && (
          <div style={{ 
            fontSize: '0.85rem', 
            color: '#4a5568', 
            marginBottom: '0.5rem' 
          }}>
            File terpilih: <strong>{file.name}</strong> ({(file.size / 1024).toFixed(2)} KB)
          </div>
        )}
        
        <button 
          onClick={handleUpload} 
          className="btn-add"
          disabled={uploading || !file}
        >
          {uploading ? '⏳ Mengupload...' : '📤 Upload & Proses'}
        </button>
      </div>

      {message.text && (
        <div 
          className={`message-banner ${message.type}`}
          style={{ margin: '1rem 0', fontSize: '0.9rem' }}
        >
          {message.text}
        </div>
      )}
    </div>
  );
};

export default FileUploadComponent;
