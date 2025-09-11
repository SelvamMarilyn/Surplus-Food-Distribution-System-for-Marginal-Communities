// src/utils/api.js
import axios from "axios";

const BACKEND_URL = "http://localhost:5000";

export const api = axios.create({
  baseURL: `${BACKEND_URL}/api`,
});

// Save token in axios default headers
export const setAuthToken = (token, userType = 'donor') => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    localStorage.setItem(`${userType}Token`, token);
    localStorage.setItem('userType', userType);
  } else {
    delete api.defaults.headers.common["Authorization"];
    const userType = localStorage.getItem('userType');
    if (userType) {
      localStorage.removeItem(`${userType}Token`);
      localStorage.removeItem('userType');
    }
  }
};

// On page reload, restore token
export const initializeAuth = () => {
  const userType = localStorage.getItem('userType');
  const token = userType ? localStorage.getItem(`${userType}Token`) : null;
  
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }
  
  return { token, userType };
};

// Initialize auth when module loads
initializeAuth();