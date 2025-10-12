import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 30000
});

api.interceptors.request.use(
  (config) => config,
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    return Promise.reject(error);
  }
);

const getPapers = async (params = {}) => {
  const response = await api.get('/papers', { params });
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

// ========== Organizations (Laravel) ==========
const getOrganizations = async (params = {}) => {
  const response = await api.get('/organizations', { params });
  return response.data;
};

const getOrganizationById = async (id) => {
  const response = await api.get(`/organizations/${id}`);
  return response.data;
};

const createOrganization = async (payload) => {
  const response = await api.post('/organizations', payload);
  return response.data;
};

const updateOrganization = async (id, payload) => {
  const response = await api.put(`/organizations/${id}`, payload);
  return response.data;
};

const deleteOrganization = async (id) => {
  const response = await api.delete(`/organizations/${id}`);
  return response.data;
};

const openAlexApi = axios.create({
  baseURL: 'https://api.openalex.org',
  timeout: 30000
});

const OPENALEX_DEFAULT_PARAMS = {
  mailto: 'naufalsidiq@upi.edu'
};

const getOpenAlexWorks = async ({ page = 1, perPage = 12, q = '', extraFilter = '', sort = 'year-desc' } = {}) => {
  const response = await api.get('/openalex/works', {
    params: {
      page,
      per_page: perPage,
      search: q || undefined,
      filter: extraFilter || undefined,
      sort: sort || undefined
    }
  });
  return response.data;
};

const getOpenAlexWorkById = async (id) => {
  const cleanId = (id || '').toString().includes('/') ? id.split('/').pop() : id;
  const response = await api.get(`/openalex/works/${cleanId}`);
  return response.data;
};

const getOpenAlexFilters = async ({ limit = 100, q = '', filter = '' } = {}) => {
  const response = await api.get('/openalex/works/filters', { params: { limit, search: q || undefined, filter: filter || undefined } });
  return response.data;
};

// ========== Authors (Laravel) ==========
const getAuthors = async ({ q = '', sort = 'works_count', page = 1, perPage = 12 } = {}) => {
  const response = await api.get('/authors', {
    params: {
      q: q || undefined,
      sort: sort || undefined,
      page: page || undefined,
      per_page: perPage || undefined
    }
  });
  return response.data;
};

const getAuthorById = async (id) => {
  const response = await api.get(`/authors/${id}`);
  return response.data;
};

const getAuthorWorks = async (id, params = {}) => {
  const response = await api.get(`/authors/${id}/works`, { params });
  return response.data;
};

const getSdgs = async (params = {}) => {
  const response = await api.get('/sdgs', { params });
  return response.data;
};

const getSdgById = async (id) => {
  const response = await api.get(`/sdgs/${id}`);
  return response.data;
};

const createSdg = async (payload) => {
  const response = await api.post('/sdgs', payload);
  return response.data;
};

const updateSdg = async (id, payload) => {
  const response = await api.put(`/sdgs/${id}`, payload);
  return response.data;
};

const deleteSdg = async (id) => {
  const response = await api.delete(`/sdgs/${id}`);
  return response.data;
};

export {
  // Papper Laravel
  getPapers,
  getPaperById,
  createPaper,
  updatePaper,
  deletePaper,
  getPaperStatistics,
  bulkDeletePapers,
  // Organizations
  getOrganizations,
  getOrganizationById,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  // OpenAlex
  getOpenAlexWorks,
  getOpenAlexWorkById,
  getOpenAlexFilters,
  // Authors
  getAuthors,
  getAuthorById,
  getAuthorWorks,
  // SDGs
  getSdgs,
  getSdgById,
  createSdg,
  updateSdg,
  deleteSdg
};

export default api;
