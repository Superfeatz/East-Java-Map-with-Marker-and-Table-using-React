import { useState } from 'react';
import Papa from 'papaparse';

export const useCSVParser = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  const parseCSV = (fileOrText, isFile = true, onComplete) => {
    const config = {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length) {
          setError(results.errors[0].message);
        } else {
          setData(results.data);
          if (onComplete) onComplete(results.data);
        }
      },
      error: (err) => setError(err.message),
    };

    if (isFile) Papa.parse(fileOrText, config);
    else Papa.parse(fileOrText, { ...config, download: false });
  };

  return { data, error, parseCSV };
};
