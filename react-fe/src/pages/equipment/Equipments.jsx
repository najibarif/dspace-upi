import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import FindEquipments from "../../components/home/FindEquipments";
import { FiFilter, FiChevronDown, FiChevronUp, FiExternalLink } from "react-icons/fi";

// Cache for API responses
const apiCache = new Map();

// Fetch with retry and backoff
const fetchWithRetry = async (url, options = {}, retries = 3, backoff = 300) => {
  const cacheKey = `${url}-${JSON.stringify(options)}`;
  if (apiCache.has(cacheKey)) return apiCache.get(cacheKey);

  try {
    const headers = {
      'Accept': 'application/json',
      ...options.headers
    };
    
    const apiUrl = url;

    const res = await fetch(apiUrl, {
      ...options,
      headers,
      credentials: 'same-origin' // Ensures cookies are sent with the request
    });

    if (res.status === 429) {
      if (retries > 0) {
        const retryAfter = res.headers.get('Retry-After') || backoff;
        const waitTime = parseInt(retryAfter, 10) * 1000 || backoff * 1000;
        console.warn(`Rate limited. Retrying in ${waitTime}ms... (${retries} retries left)`);
        await new Promise(r => setTimeout(r, waitTime));
        return fetchWithRetry(url, options, retries - 1, Math.min(backoff * 2, 60000)); // Max 60s backoff
      }
      throw new Error('API rate limit exceeded. Please try again later.');
    }

    if (res.status === 403) {
      if (retries > 0) {
        console.warn('Access forbidden. Retrying with different authentication...');
        // Remove the cached response and try again
        apiCache.delete(cacheKey);
        return fetchWithRetry(url, options, retries - 1, Math.min(backoff * 2, 60000));
      }
      throw new Error('Access forbidden. Please check your API key and permissions. If you don\'t have an API key, please get one from https://openalex.org/register');
    }

    if (!res.ok) {
      const errorData = await res.text();
      throw new Error(`HTTP error! status: ${res.status}, message: ${errorData}`);
    }

    const data = await res.json();
    apiCache.set(cacheKey, data);
    return data;
  } catch (err) {
    console.error('API Error:', err);
    if (retries > 0) {
      const waitTime = backoff * 1000;
      console.warn(`Retrying in ${waitTime}ms... (${retries} retries left)`);
      await new Promise(r => setTimeout(r, waitTime));
      return fetchWithRetry(url, options, retries - 1, Math.min(backoff * 2, 60000));
    }
    throw err;
  }
};

export default function Equipments() {
  // State for equipment data and UI
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  // Main filters state
  const [filters, setFilters] = useState({
    search: '',
    page: 1,
    perPage: 10,
    sortBy: 'relevance',
    sortOrder: 'desc',
    selectedTypes: [],
    institution: '',
    year: ''
  });
  
  const [totalResults, setTotalResults] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  // Equipment types based on OpenAlex concepts
  const equipmentTypes = [
    { id: 'equipment', name: 'Research Equipment' },
    { id: 'instrument', name: 'Scientific Instrument' },
    { id: 'facility', name: 'Research Facility' },
    { id: 'apparatus', name: 'Laboratory Apparatus' },
    { id: 'device', name: 'Measurement Device' },
  ];

  // Function to fetch equipment from OpenAlex API
  const fetchEquipmentFromOpenAlex = async (filters) => {
    try {
      // Build the base URL for OpenAlex API - using works endpoint with equipment filter
      let url = 'https://api.openalex.org/works?';
      
      // Add search query if provided
      if (filters.search) {
        url += `search=${encodeURIComponent(filters.search)}&`;
      } else {
        // Default search for equipment if no search term provided
        url += 'search=research%20equipment%20OR%20scientific%20instrument%20OR%20laboratory%20apparatus&';
      }
      
      // Add equipment type filter if provided
      if (filters.selectedTypes.length > 0) {
        const typeFilter = filters.selectedTypes.map(type => `concept.id:${type}`).join('|');
        url += `filter=${typeFilter}&`;
      }
      
      // Add institution filter if provided
      if (filters.institution) {
        url += `filter=institutions.id:${filters.institution}&`;
      }
      
      // Filter for works that mention equipment
      url += 'filter=has_abstract:true&';
      
      // Add pagination
      url += `page=${filters.page}&per_page=${filters.perPage}`;
      
      // Add sorting
      let sortParam = '';
      if (filters.sortBy === 'relevance') {
        sortParam = 'relevance_score:desc';
      } else if (filters.sortBy === 'cited_by_count') {
        sortParam = 'cited_by_count:desc';
      } else if (filters.sortBy === 'publication_date') {
        sortParam = 'publication_date' + (filters.sortOrder === 'asc' ? '' : ':desc');
      } else {
        sortParam = 'relevance_score:desc';
      }
      url += `&sort=${sortParam}`;
      
      console.log('Fetching equipment from OpenAlex:', url);
      
      const response = await fetchWithRetry(url);
      
      // Transform OpenAlex works data to equipment format
      const equipmentList = response.results.map(work => ({
        id: work.id.split('/').pop(),
        title: work.title,
        description: work.abstract || 'No description available',
        type: work.type || 'equipment',
        year: work.publication_year || 'N/A',
        authors: work.authorships?.map(auth => auth.author.display_name).join(', ') || 'Unknown',
        institution: work.host_venue?.publisher || 'Unknown',
        location: work.locations?.[0]?.source?.host_organization || 'N/A',
        url: work.doi ? `https://doi.org/${work.doi}` : (work.primary_location?.landing_page_url || work.primary_location?.pdf_url || '#')
      }));
      
      return {
        equipments: equipmentList,
        meta: {
          count: response.meta?.count || equipmentList.length,
          page: response.meta?.page || 1,
          per_page: response.meta?.per_page || equipmentList.length
        }
      };
    } catch (error) {
      console.error('Error fetching equipment from OpenAlex:', error);
      throw error;
    }
  };

  const fetchEquipments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch equipment data from OpenAlex API
      const { equipments, meta } = await fetchEquipmentFromOpenAlex(filters);
      
      // Update state with the fetched data
      setEquipments(equipments);
      setTotalResults(meta.count);
      setTotalPages(Math.ceil(meta.count / filters.perPage));
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching equipment data:', error);
      setError('Failed to load equipment data. Please try again later.');
      setLoading(false);
      setEquipments([]);
    }
  };

  // Initial fetch and when filters change
  useEffect(() => {
    fetchEquipments();
  }, [filters]);

  // Handle search from the FindEquipments component
  const handleSearch = (searchTerm) => {
    // Debounce the search to avoid too many re-renders
    const timer = setTimeout(() => {
      setFilters(prev => ({
        ...prev,
        search: searchTerm,
        page: 1 // Reset to first page on new search
      }));
    }, 500);
    
    return () => clearTimeout(timer);
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  // Toggle sort order
  const toggleSortOrder = () => {
    setFilters(prev => ({
      ...prev,
      sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc',
      page: 1 // Reset to first page when changing sort order
    }));
  };


  // Format equipment type for display
  const formatEquipmentType = (type) => {
    const typeMap = {
      'equipment': 'Research Equipment',
      'instrument': 'Scientific Instrument',
      'facility': 'Research Facility',
      'apparatus': 'Laboratory Apparatus',
      'device': 'Measurement Device',
      'article': 'Research Article',
      'dataset': 'Research Dataset',
      'software': 'Research Software'
    };
    return typeMap[type.toLowerCase()] || type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Toggle equipment type filter
  const toggleTypeFilter = (type) => {
    setFilters(prev => ({
      ...prev,
      selectedTypes: prev.selectedTypes.includes(type)
        ? prev.selectedTypes.filter(t => t !== type)
        : [...prev.selectedTypes, type],
      page: 1 // Reset to first page when filters change
    }));
  };

  const navigate = useNavigate();

  return (
    <div className="bg-white min-h-screen">
      {/* Banner */}
      <FindEquipments onSearch={handleSearch} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-6 sm:py-10">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mb-4">
          <div className="md:hidden">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-[#d52727] text-white rounded-md text-sm font-medium hover:bg-[#b31f1f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d52727] transition-colors"
            >
              <FiFilter className="h-4 w-4" />
              {showMobileFilters ? 'Hide Filters' : 'Filters'}
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar - Filters */}
          <div className={`${showMobileFilters ? 'block' : 'hidden'} md:block w-full md:w-64 flex-shrink-0`}>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-gray-900">Filters</h3>
                <button 
                  onClick={() => setShowMobileFilters(false)}
                  className="md:hidden text-gray-500 hover:text-gray-700"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Equipment Type Filter */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Equipment Type</h4>
                <div className="space-y-2">
                  {equipmentTypes.map((type) => (
                    <div key={type.id} className="flex items-center">
                      <input
                        id={`type-${type.id}`}
                        type="checkbox"
                        checked={filters.selectedTypes.includes(type.id)}
                        onChange={() => toggleTypeFilter(type.id)}
                        className="h-4 w-4 rounded border-gray-300 text-[#d52727] focus:ring-[#d52727]"
                      />
                      <label htmlFor={`type-${type.id}`} className="ml-2 text-sm text-gray-700">
                        {type.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Year Published Filter */}
              <div className="mb-6">
                <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
                  Year Published
                </label>
                <input
                  type="number"
                  id="year"
                  placeholder="e.g. 2020"
                  value={filters.year}
                  onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value, page: 1 }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#d52727] focus:border-[#d52727] sm:text-sm"
                />
              </div>

              {/* Clear Filters Button */}
              <button
                onClick={() => setFilters(prev => ({
                  ...prev,
                  search: '',
                  selectedTypes: [],
                  year: '',
                  page: 1
                }))}
                className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Search and Sort */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3 mb-6 gap-3">
              <p className="text-sm text-gray-600">
                {loading
                  ? "Memuat data..."
                  : error
                    ? error
                    : `Menampilkan ${equipments.length} hasil`}
              </p>
              <div className="flex items-center gap-3">
                <select
                  value={filters.sortBy}
                  onChange={(e) => {
                    setFilters(prev => ({
                      ...prev,
                      sortBy: e.target.value,
                      page: 1
                    }));
                  }}
                  className="text-sm border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#d52727] outline-none"
                  disabled={loading}
                >
                  <option value="relevance">Relevansi</option>
                  <option value="publication_date">Tanggal Terbit (Terbaru)</option>
                  <option value="cited_by_count">Dikutip (Terbanyak)</option>
                  <option value="title">Judul (A-Z)</option>
                </select>
              </div>
            </div>

            {/* Results */}
            <div className="space-y-4">
              {loading ? (
                <div className='text-center py-10 col-span-full'>
                  <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#d52727]'></div>
                  <p className='mt-2 text-sm text-gray-600'>Loading equipment...</p>
                </div>
              ) : equipments.length > 0 ? (
                <>
                  <div className="text-sm text-gray-500">
                    Showing {equipments.length} of {totalResults} research equipment items
                  </div>
                  <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1">
                    {equipments.map((equipment) => (
                      <Link 
                        key={equipment.id} 
                        to={`/equipment/${equipment.id}`}
                        state={{ equipment }}
                        className="block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
                      >
                        <div className="p-4 sm:p-6">
                          <div className="flex items-start">
                            <div className="flex-shrink-0 h-16 w-16 mr-4 bg-blue-50 rounded-md flex items-center justify-center">
                              <svg className="h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-medium text-gray-900">
                                <div className="flex items-center">
                                  {equipment.title}
                                  <FiExternalLink className="ml-1 h-4 w-4 text-gray-400" />
                                </div>
                              </h3>
                              
                              <div className="mt-1 text-sm text-gray-600">
                                <p className="line-clamp-2">
                                  {equipment.description}
                                </p>
                              </div>
                              
                              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-500">
                                {equipment.authors && (
                                  <span className="flex items-center">
                                    <svg className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    {equipment.authors.split(',').slice(0, 2).join(', ')}{equipment.authors.split(',').length > 2 ? ' et al.' : ''}
                                  </span>
                                )}
                                
                                {equipment.year && equipment.year !== 'N/A' && (
                                  <span className="flex items-center">
                                    <svg className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    {equipment.year}
                                  </span>
                                )}
                                
                                {equipment.institution && (
                                  <span className="flex items-center">
                                    <svg className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    {equipment.institution}
                                  </span>
                                )}
                              </div>
                              
                              <div className="mt-3 flex flex-wrap gap-2">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {equipment.type ? formatEquipmentType(equipment.type) : 'Equipment'}
                                </span>
                                {equipment.location && equipment.location !== 'N/A' && (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    {equipment.location}
                                  </span>
                                )}
                              </div>
                              
                              {/* Equipment details */}
                              <div className="mt-3">
                                <a 
                                  href={equipment.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center text-sm text-[#d52727] hover:text-[#b31f1f]"
                                >
                                  View Details
                                  <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-8 flex justify-center">
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={() => setFilters(prev => ({ ...prev, page: 1 }))}
                          disabled={filters.page === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="sr-only">First</span>
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setFilters(prev => ({ ...prev, page: Math.max(1, filters.page - 1) }))}
                          disabled={filters.page === 1}
                          className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="sr-only">Previous</span>
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (filters.page <= 3) {
                            pageNum = i + 1;
                          } else if (filters.page >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = filters.page - 2 + i;
                          }
                          
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setFilters(prev => ({ ...prev, page: pageNum }))}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                filters.page === pageNum
                                  ? 'z-10 bg-[#d52727] border-[#d52727] text-white'
                                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                        
                        <button
                          onClick={() => setFilters(prev => ({ ...prev, page: Math.min(totalPages, filters.page + 1) }))}
                          disabled={filters.page === totalPages}
                          className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="sr-only">Next</span>
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setFilters(prev => ({ ...prev, page: totalPages }))}
                          disabled={filters.page === totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="sr-only">Last</span>
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            <path fillRule="evenodd" d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </nav>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No institutions found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {filters.search || filters.selectedTypes.length > 0 || filters.country || filters.yearFounded
                      ? 'Try adjusting your search or filter criteria.'
                      : 'No institutions are currently available.'}
                  </p>
                  {(filters.search || filters.selectedTypes.length > 0 || filters.country || filters.yearFounded) && (
                    <div className="mt-6">
                      <button
                        type="button"
                        onClick={() => setFilters(prev => ({
                          ...prev,
                          search: '',
                          selectedTypes: [],
                          country: '',
                          yearFounded: '',
                          page: 1
                        }))}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#d52727] hover:bg-[#b31f1f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d52727]"
                      >
                        <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                        </svg>
                        Reset all filters
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
