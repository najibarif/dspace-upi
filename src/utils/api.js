import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: '/api', // This will be proxied to http://localhost:8080/server/api
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true'
  },
  withCredentials: true, // Important for sending cookies/session
  timeout: 30000, // 30 seconds timeout
  crossDomain: true
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // You can add auth token here if needed
    // const token = localStorage.getItem('dspace-token');
    // if (token) {
    //   config.headers['Authorization'] = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Log error details
    if (error.response) {
      console.error('API Error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        url: originalRequest.url,
        method: originalRequest.method,
        data: error.response.data
      });
      
      // Handle 401 Unauthorized
      if (error.response.status === 401) {
        console.log('Authentication required');
        // You can redirect to login page here if needed
        // window.location.href = '/login';
      }
      
      // Handle 403 Forbidden
      if (error.response.status === 403) {
        console.error('Access forbidden. You might need proper permissions.');
      }
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Request setup error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// API functions
export const fetchCollections = async () => {
  try {
    const response = await api.get('/core/collections', {
      params: {
        size: 100, // Limit number of results
        sort: 'name,asc' // Sort by name
      }
    });
    return response.data._embedded?.collections || [];
  } catch (error) {
    console.error('Failed to fetch collections:', error);
    throw error;
  }
};

/**
 * Fetch communities from DSpace API
 * @param {Object} params - Query parameters
 * @returns {Promise<Array>} - Array of communities
 */
export const fetchCommunities = async (params = {}) => {
  try {
    const response = await api.get('/core/communities', {
      params: {
        size: 100,
        sort: 'name,asc',
        ...params
      }
    });
    
    // Log the full response for debugging
    console.log('API Response:', response.data);
    
    // Handle different response formats
    if (response.data && response.data._embedded && response.data._embedded.communities) {
      return response.data._embedded.communities;
    } else if (Array.isArray(response.data)) {
      return response.data;
    }
    
    console.warn('Unexpected API response format:', response.data);
    return [];
  } catch (error) {
    console.error('Failed to fetch communities:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers
    });
    throw error;
  }
};

// Authentication function
export const login = async (email, password) => {
  try {
    const response = await api.post('/authn/login', {
      email,
      password
    });
    
    // If login is successful, the server will set a session cookie
    // If using JWT, you might receive a token in the response:
    // const { token } = response.data;
    // localStorage.setItem('dspace-token', token);
    
    return response.data;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

export default api;
