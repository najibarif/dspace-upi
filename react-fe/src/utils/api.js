import axios from 'axios';

// Axios instance untuk Laravel API (via Vite proxy -> http://localhost:8000)
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 30000
});

// Request interceptor
api.interceptors.request.use(
  (config) => config,
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
    return Promise.reject(error);
  }
);

// ========== Papers (Laravel) ==========
const getPapers = async (params = {}) => {
  const response = await api.get('/papers', { params });
  // Dukung bentuk: { success, message, data: { data: [...] } } atau { data: [...] } atau [...]
  const payload = response.data?.data ?? response.data;
  return payload;
};

const getPaperById = async (id) => {
  const response = await api.get(`/papers/${id}`);
  return response.data;
};

const createPaper = async (payload) => {
  const response = await api.post('/papers', payload);
  return response.data;
};

const updatePaper = async (id, payload) => {
  const response = await api.put(`/papers/${id}`, payload);
  return response.data;
};

const deletePaper = async (id) => {
  const response = await api.delete(`/papers/${id}`);
  return response.data;
};

const getPaperStatistics = async () => {
  const response = await api.get('/papers/statistics/overview');
  return response.data;
};

const bulkDeletePapers = async (ids) => {
  const response = await api.delete('/papers/bulk/delete', { data: { ids } });
  return response.data;
};

// Ekspor fungsi Laravel Papers
export {
  getPapers,
  getPaperById,
  createPaper,
  updatePaper,
  deletePaper,
  getPaperStatistics,
  bulkDeletePapers
};

export default api;
