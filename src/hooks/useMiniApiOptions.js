import { useState, useEffect } from 'react';
import axios from 'axios';

export const useMiniApiOptions = (endpoint) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Prevent fetching if endpoint is missing
    if (!endpoint) return;

    const fetchOptions = async () => {
      try {
        setLoading(true);
        // Ensure axios uses the base URL correctly - we can use an absolute path for relative API 
        // assuming vite sets up a proxy or we use an environment variable. 
        // Here we'll use a relative path assuming typical axios setup or just the path specified in the report
        const response = await axios.get(`/api/v1/mini-api/${endpoint}`);
        
        const data = response.data.data;
        
        // Format options for the AppDropdown component
        const formattedOptions = data.map(item => ({
          value: item.id,
          label: item.name
        }));
        
        setOptions(formattedOptions);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch options');
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, [endpoint]);

  return { options, loading, error };
};
