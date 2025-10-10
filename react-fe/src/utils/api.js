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
const fetchCollections = async () => {
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
const fetchCommunities = async (params = {}) => {
  try {
    const response = await api.get('/core/communities', {
      params: {
        size: 100,
        sort: 'name,asc',
        ...params
      }
    });
    
    // Log the full response for debugging
    // console.log('API Response:', response.data);
    
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
const login = async (email, password) => {
  try {
    // Buat form data untuk login
    const formData = new URLSearchParams();
    formData.append('user', email);
    formData.append('password', password);
    
    // Dapatkan CSRF token terlebih dahulu
    const csrfResponse = await axios.get('http://localhost:8080/server/api/authn/status', {
      withCredentials: true,
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    });
    
    // Ekstrak CSRF token dari cookies
    const cookies = document.cookie.split(';');
    const xsrfToken = cookies.find(c => c.trim().startsWith('XSRF-TOKEN='));
    
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Requested-With': 'XMLHttpRequest'
    };
    
    if (xsrfToken) {
      headers['X-XSRF-TOKEN'] = xsrfToken.split('=')[1];
    }
    
    const response = await axios({
      method: 'post',
      url: 'http://localhost:8080/server/api/authn/login',
      data: formData.toString(),
      withCredentials: true,
      headers: headers
    });
    
    console.log('Login response:', {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data
    });
    
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Get all epersons
const getEpersons = async () => {
  try {
    // Get CSRF token first
    const csrfResponse = await axios.get('http://localhost:8080/server/api/authn/status', {
      withCredentials: true,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Access-Control-Allow-Credentials': 'true'
      }
    });
    
    // Extract cookies
    const cookies = document.cookie.split(';').reduce((cookies, cookie) => {
      const [name, value] = cookie.trim().split('=').map(c => c.trim());
      cookies[name] = decodeURIComponent(value);
      return cookies;
    }, {});
    
    // Log cookies for debugging
    console.log('Available cookies:', cookies);
    
    // Get JSESSIONID and XSRF-TOKEN
    const jsessionId = cookies['JSESSIONID'];
    const xsrfToken = cookies['XSRF-TOKEN'];
    
    // Prepare headers with all necessary CORS and security headers
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Access-Control-Allow-Origin': 'http://localhost:3000',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-XSRF-TOKEN, X-Requested-With',
      // Add JSESSIONID to headers if available
      ...(jsessionId && { 'Cookie': `JSESSIONID=${jsessionId}` })
    };
    
    // Add XSRF token if available
    if (xsrfToken) {
      console.log('Using XSRF token:', xsrfToken);
      headers['X-XSRF-TOKEN'] = xsrfToken;
    } else {
      console.warn('XSRF-TOKEN not found in cookies');
    }
    
    // Make the request with credentials and headers
    const response = await axios.get('http://localhost:8080/server/api/eperson/epersons', {
      withCredentials: true,
      headers: headers,
      validateStatus: function (status) {
        return status >= 200 && status < 500; // Resolve only if status code is less than 500
      }
    });
    
    if (response.status >= 400) {
      throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
    }
    
    console.log('Epersons response:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data
    });
    
    return response.data;
  } catch (error) {
    const errorDetails = {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers
      }
    };
    
    console.error('Error fetching epersons:', JSON.stringify(errorDetails, null, 2));
    
    // If it's a 401/403, we might need to re-authenticate
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Clear any existing auth data
      document.cookie = 'JSESSIONID=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      document.cookie = 'XSRF-TOKEN=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      
      // Try to re-authenticate if we have credentials
      const credentials = {
        email: 'naufalnajibarif@upi.edu',
        password: 'dspace123'
      };
      
      try {
        await login(credentials.email, credentials.password);
        // Retry the request after successful login
        return await getEpersons();
      } catch (loginError) {
        console.error('Re-authentication failed:', loginError);
        throw new Error('Authentication failed. Please check your credentials and try again.');
      }
    }
    
    throw error;
  }
};

// Ekspor semua fungsi yang diperlukan
export {
  fetchCollections,
  fetchCommunities,
  login,
  getEpersons
};

export default api;
