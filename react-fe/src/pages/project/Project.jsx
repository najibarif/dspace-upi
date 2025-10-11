import { useState, useEffect, useCallback, useMemo } from 'react';
import { FiFilter, FiChevronDown, FiChevronUp, FiExternalLink, FiChevronLeft, FiChevronRight, FiChevronsLeft } from "react-icons/fi";
import { Link } from "react-router-dom";
import FindProject from "../../components/project/FindProject";

const apiCache = new Map();

const fetchWithRetry = async (url, options = {}, retries = 3, backoff = 300) => {
  try {
    const cacheKey = `${url}-${JSON.stringify(options)}`;
    if (apiCache.has(cacheKey)) return apiCache.get(cacheKey);

    const response = await fetch(url, {
      ...options,
      headers: {
        'Accept': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      if (response.status === 429 && retries > 0) {
        await new Promise(resolve => setTimeout(resolve, backoff));
        return fetchWithRetry(url, options, retries - 1, backoff * 2);
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    apiCache.set(cacheKey, data);
    return data;
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, backoff));
      return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }
    throw error;
  }
};

const Project = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [sortAsc, setSortAsc] = useState(true);
  const [projects, setProjects] = useState([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [sidebarData, setSidebarData] = useState({
    sdg: [],
    type: [],
    concepts: [],
    profile: []
  });

  // Sidebar section component with show more/less functionality
  const SidebarSection = ({ title, items, maxItems = 5 }) => {
    const [showAll, setShowAll] = useState(false);
    
    if (!items?.length) return null;
    
    const visibleItems = showAll ? items : items.slice(0, maxItems);
    const hasMore = items.length > maxItems;
    
    return (
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium text-gray-900">{title}</h3>
          {hasMore && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-xs text-red-600 hover:text-red-800 focus:outline-none"
            >
              {showAll ? 'Show Less' : `Show All (${items.length})`}
            </button>
          )}
        </div>
        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
          {visibleItems.map((item, index) => (
            <div key={index} className="flex items-center justify-between py-1">
              <label className="flex items-center space-x-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <span className="truncate max-w-[180px]" title={item.name || item}>
                  {item.name || item}
                </span>
              </label>
              {item.count !== undefined && (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full flex-shrink-0">
                  {item.count}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const sortedProjects = useMemo(() => {
    return [...(projects || [])].sort((a, b) => {
      return sortAsc 
        ? a.title?.localeCompare(b.title || '') || 0
        : b.title?.localeCompare(a.title || '') || 0;
    });
  }, [projects, sortAsc]);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // First, let's verify the institution exists
      const institutionUrl = 'https://api.openalex.org/institutions/ror:044b0xj37';
      console.log('Fetching institution data from:', institutionUrl);
      const institutionData = await fetchWithRetry(institutionUrl);
      console.log('Institution data:', institutionData);

      if (!institutionData) {
        throw new Error('Failed to fetch institution data');
      }

      // Now fetch works for this institution
      const apiUrl = new URL('https://api.openalex.org/works');
      const params = new URLSearchParams({
        'filter': 'institutions.ror:044b0xj37',
        'per-page': itemsPerPage,
        'page': currentPage,
        'sort': 'publication_year:desc',
      });
      
      apiUrl.search = params.toString();
      console.log('Fetching works from:', apiUrl.toString());
      
      const data = await fetchWithRetry(apiUrl.toString());
      console.log('API Response:', data);

      if (!data) throw new Error("No data received from API");
      if (!data.results) {
        console.error('Unexpected API response structure:', data);
        throw new Error("Unexpected API response structure");
      }

      setTotalItems(data.meta?.count || 0);
      console.log(`Found ${data.results.length} works, total: ${data.meta?.count || 0}`);

      // Initialize maps for sidebar data
      const sdgMap = {};
      const typeMap = {};
      const conceptsMap = {};
      const profileMap = {};

      // Map the API response to your project structure
      const mappedProjects = data.results.map((p) => {
        // Process concepts for sidebar
        (p.concepts || []).forEach((c) => {
          if (!c) return;
          const name = c.display_name || "";
          if (c.level === 0 || name.toLowerCase().includes("goal")) {
            sdgMap[name] = (sdgMap[name] || 0) + 1;
          } else {
            conceptsMap[name] = (conceptsMap[name] || 0) + 1;
          }
        });

        // Count types for sidebar
        const type = p.type || 'unknown';
        typeMap[type] = (typeMap[type] || 0) + 1;

        // Track lead profiles
        const lead = p.authorships?.[0]?.author?.display_name || 
                    (p.authorships?.[0]?.author ? `Author ID: ${p.authorships[0].author.id}` : "Unknown");
        if (lead) {
          profileMap[lead] = (profileMap[lead] || 0) + 1;
        }

        // Return the mapped project
        return {
          id: p.id || '',
          title: p.title || p.display_name || "Untitled Project",
          lead,
          organization: institutionData.display_name || "Universitas Pendidikan Indonesia",
          type,
          duration: p.publication_year 
            ? `${p.publication_year}` 
            : (p.publication_date ? new Date(p.publication_date).getFullYear().toString() : "-"),
          status: p.is_retracted ? "Retracted" : (p.is_paratext ? "Paratext" : "Published"),
          openalex_url: p.id ? p.id.replace("https://openalex.org/", "") : "",
          concepts: p.concepts?.map(c => c.display_name).filter(Boolean) || [],
          doi: p.doi || "",
          abstract: p.abstract || ""
        };
      });

      console.log('Mapped projects:', mappedProjects);
      setProjects(mappedProjects);
      setError(mappedProjects.length === 0 ? 'No projects found. Try adjusting your search criteria.' : null);

      // Update sidebar data
      setSidebarData({
        sdg: Object.entries(sdgMap).map(([name, count]) => ({ name, count })),
        type: Object.entries(typeMap).map(([name, count]) => ({ name, count })),
        concepts: Object.entries(conceptsMap).map(([name, count]) => ({ name, count })),
        profile: Object.entries(profileMap).map(([name, count]) => ({ name, count }))
      });

      console.log('Sidebar data updated:', {
        sdg: Object.entries(sdgMap).length,
        type: Object.entries(typeMap).length,
        concepts: Object.entries(conceptsMap).length,
        profile: Object.entries(profileMap).length
      });
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError(
        error.message.includes("Rate limit")
          ? "Terlalu banyak permintaan. Silakan coba lagi nanti."
          : `Gagal memuat daftar proyek: ${error.message}`
      );
      if (error.message.includes("Rate limit")) {
        setRetryCount((p) => p + 1);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects, retryCount]);


  return (
    <section className="bg-gray-50 min-h-screen">
      <FindProject />
      <div className="max-w-8xl mx-auto px-4 sm:px-6 md:px-10 py-10">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        <div className="md:hidden mb-4">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-[#d52727] text-white rounded-md text-sm font-medium hover:bg-[#b31f1f] transition"
          >
            <span className="material-symbols-outlined text-lg">filter_alt</span>
            {showMobileFilters ? "Hide Filters" : "Show Filters"}
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside
            className={`${showMobileFilters ? "block" : "hidden"
              } md:block w-full md:w-64 bg-white shadow-md rounded-xl p-5 h-fit`}
          >
            <div className="mb-5">
              <h3 className="font-semibold text-gray-800 text-sm mb-2">
                Sort by
              </h3>
              <select
                className="w-full border border-gray-300 p-2 rounded-md text-sm focus:ring-[#d52727] focus:border-[#d52727]"
                value={sortAsc ? "asc" : "desc"}
                onChange={(e) => setSortAsc(e.target.value === "asc")}
              >
                <option value="asc">Title (A–Z)</option>
                <option value="desc">Title (Z–A)</option>
              </select>
            </div>

            <SidebarSection title="Sustainable Development Goals" items={sidebarData.sdg} />
            <SidebarSection title="Concepts" items={sidebarData.concepts} />
            <SidebarSection title="Profile" items={sidebarData.profile} />
            <SidebarSection title="Type" items={sidebarData.type} />
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <div className='flex items-center justify-between border-b pb-3 mb-6'>
              <p className='text-sm text-gray-600'>
                Showing {projects.length} of {totalItems} results
              </p>
              <button
                type="button"
                className='text-sm text-[#d52727] hover:text-[#b31f1f] flex items-center gap-1 transition-colors'
                onClick={() => setSortAsc((v) => !v)}
              >
                <span className='material-symbols-outlined text-base'>
                  {sortAsc ? 'arrow_upward' : 'arrow_downward'}
                </span>
                Sort {sortAsc ? 'A-Z' : 'Z-A'}
              </button>
            </div>
            {loading ? (
              <div className='text-center py-12'><div className='inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#d52727]'></div><p className='mt-3 text-sm text-gray-600'>Memuat data organisasi...</p></div>
            ) : error ? (
              <div className="text-center py-20">
                <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
                  <div className="text-[#d52727] mb-3">
                    <svg
                      className="w-12 h-12 mx-auto mb-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    <p className="font-medium text-lg">{error}</p>
                  </div>
                  {error.includes("Terlalu banyak permintaan") && (
                    <button
                      onClick={() => {
                        setRetryCount((prev) => prev + 1);
                        setError(null);
                      }}
                      className="mt-4 px-5 py-2 bg-[#d52727] text-white rounded-md hover:bg-[#b31f1f] transition"
                    >
                      Coba Lagi
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {sortedProjects.length === 0 ? (
                  <div className="text-center text-gray-500 py-10">
                    Tidak ada proyek yang ditemukan.
                  </div>
                ) : (
                  sortedProjects.map((project, idx) => (
                    <Link
                      key={idx}
                      to={`/projects/${project.openalex_url}`}
                      className="block bg-white rounded-xl shadow hover:shadow-lg transition p-6 border border-gray-100"
                    >
                      <h2 className="font-semibold text-lg text-gray-900 mb-1">
                        {project.title}
                      </h2>
                      <p className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">Lead:</span> {project.lead}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Organization:</span>{" "}
                        {project.organization}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500">
                        <span className="bg-gray-100 px-2 py-1 rounded">
                          {project.type}
                        </span>
                        <span className="bg-gray-100 px-2 py-1 rounded">
                          {project.duration}
                        </span>
                        <span className="bg-gray-100 px-2 py-1 rounded">
                          {project.status}
                        </span>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            )}
            <div className='flex items-center justify-center mt-6'>
              <div className='flex items-center space-x-1'>
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className='p-2 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-50 hidden sm:inline-flex'
                  aria-label='First page'
                >
                  <FiChevronsLeft className='h-4 w-4' />
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className='p-2 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-50'
                  aria-label='Previous page'
                >
                  <FiChevronLeft className='h-4 w-4' />
                </button>

                {currentPage > 2 && (
                  <>
                    <button
                      onClick={() => setCurrentPage(1)}
                      className='min-w-[40px] h-10 rounded-md flex items-center justify-center text-gray-700 hover:bg-gray-100'
                    >
                      1
                    </button>
                    {currentPage > 3 && <span className='px-1 text-gray-500'>...</span>}
                  </>
                )}

                {[
                  currentPage - 1,
                  currentPage,
                  currentPage + 1
                ]
                  .filter(page => page >= 1)
                  .map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`min-w-[40px] h-10 rounded-md flex items-center justify-center text-sm ${currentPage === page
                          ? 'bg-red-600 text-white font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      aria-current={currentPage === page ? 'page' : undefined}
                    >
                      {page}
                    </button>
                  ))}

                <button
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={projects.length < itemsPerPage}
                  className='p-2 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-50'
                  aria-label='Next page'
                >
                  <FiChevronRight className='h-4 w-4' />
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </section>
  );
};

export default Project;
