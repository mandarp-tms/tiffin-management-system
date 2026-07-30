import { useState, useEffect } from 'react';
import apiClient from '../utils/apiClient';

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
        // Use apiClient so that tokens are attached and response is normalized
        const response = await apiClient.get(`/mini-api/${endpoint}`);
        
        // apiClient response interceptor returns the body directly: { success, data, ... }
        const data = response.data || response;
        
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
