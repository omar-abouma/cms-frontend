// src/utils/api.js
export const getAuthToken = () => {
  return localStorage.getItem('access_token');
};

export const apiRequest = async (url, options = {}) => {
  const token = getAuthToken();
  
  const defaultOptions = {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const response = await fetch(url, { ...defaultOptions, ...options });
  
  if (response.status === 401) {
    // Token might be expired, try to refresh it
    const refreshed = await refreshToken();
    if (refreshed) {
      // Retry the request with new token
      const newToken = getAuthToken();
      defaultOptions.headers.Authorization = `Bearer ${newToken}`;
      return await fetch(url, { ...defaultOptions, ...options });
    } else {
      // Refresh failed, redirect to login
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('userData');
      window.location.href = '/login';
      throw new Error('Authentication failed');
    }
  }
  
  return response;
};

export const refreshToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) return false;

    const response = await fetch('http://localhost:8000/api/token/refresh/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('access_token', data.access);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return false;
  }
};