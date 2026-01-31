const BASE_URL = 'http://localhost:8000';

/**
 * Base API wrapper for fetching data with auth headers
 */
const api = async (endpoint, options = {}) => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const shop = JSON.parse(localStorage.getItem('shop') || 'null');
  const sessionId = localStorage.getItem('sessionId');

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add Auth Headers if available
  if (sessionId) {
    headers['X-Session-ID'] = sessionId;
  }
  if (shop?.id) {
    headers['X-Shop-ID'] = shop.id;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    
    // Handle 401 Unauthorized (Session expired)
    if (response.status === 401) {
      localStorage.removeItem('user');
      localStorage.removeItem('shop');
      localStorage.removeItem('sessionId');
      window.location.href = '/login';
      return null;
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
};

export default api;
