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
  timeout: 30000,
  params: {
    'mailto': 'your-email@example.com' // Required by OpenAlex for tracking
  }
});

const OPENALEX_DEFAULT_PARAMS = {
  mailto: 'naufalsidiq@upi.edu'
};

const getOpenAlexWorks = async ({ page = 1, perPage = 12, q = '', extraFilter = '' } = {}) => {
  const filterParts = [`institutions.id:I130218214`];
  if (extraFilter) filterParts.push(extraFilter);

  const response = await openAlexApi.get('/works', {
    params: {
      ...OPENALEX_DEFAULT_PARAMS,
      page,
      per_page: perPage,
      search: q || undefined,
      filter: filterParts.join(',')
    }
  });
  return response.data;
};

const getOpenAlexWorkById = async (id) => {
  const cleanId = (id || '').toString().includes('/') ? id : `works/${id}`;
  const response = await openAlexApi.get(`/${cleanId.replace(/^\//, '')}`, {
    params: {
      ...OPENALEX_DEFAULT_PARAMS
    }
  });
  return response.data;
};

// ========== SDGs (Laravel) ==========
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

// Ekspor fungsi Laravel Papers
// OpenAlex Organizations
const getOpenAlexOrganizations = async ({ page = 1, perPage = 10, search = '', country = '' } = {}) => {
  try {
    const params = {
      page,
      per_page: perPage,
      sort: 'display_name' // Default sort by name
    };

    // Add search query if provided
    if (search) {
      params.search = search;
    }

    // Add country filter if provided
    if (country) {
      params.filter = `country_code:${country.toLowerCase()}`;
    }

    const response = await openAlexApi.get('/institutions', { params });
    return {
      data: response.data.results,
      meta: {
        current_page: page,
        per_page: perPage,
        total: response.data.meta.count,
        last_page: Math.ceil(response.data.meta.count / perPage)
      }
    };
  } catch (error) {
    console.error('Error fetching OpenAlex organizations:', error);
    throw error;
  }
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
  // SDGs
  getSdgs,
  getSdgById,
  createSdg,
  updateSdg,
  deleteSdg
};

export default api;
