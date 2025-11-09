import { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import FindProject from "../../components/project/FindProject";

const apiCache = new Map();

const fetchWithRetry = async (
  url,
  options = {},
  retries = 3,
  backoff = 300
) => {
  try {
    const cacheKey = `${url}-${JSON.stringify(options)}`;
    if (apiCache.has(cacheKey)) return apiCache.get(cacheKey);

    const response = await fetch(url, {
      ...options,
      headers: {
        Accept: "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      if (response.status === 429 && retries > 0) {
        await new Promise((resolve) => setTimeout(resolve, backoff));
        return fetchWithRetry(url, options, retries - 1, backoff * 2);
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    apiCache.set(cacheKey, data);
    return data;
  } catch (error) {
    if (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, backoff));
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
    profile: [],
  });

  const SidebarSection = ({ title, items, maxVisible = 5 }) => {
    const [showAll, setShowAll] = useState(false);

    if (!items?.length) return null;

    const visibleItems = showAll ? items : items.slice(0, maxVisible);
    const hasMore = items.length > maxVisible;

    return (
      <div className='mb-6'>
        <h3 className='font-medium text-sm mb-2'>{title}</h3>
        <div className='space-y-2 text-sm text-gray-600'>
          {visibleItems.map((item, index) => (
            <label
              key={index}
              className='flex items-center gap-2 cursor-pointer hover:text-[#d52727] transition-colors'
            >
              <input
                type='checkbox'
                className='rounded border-gray-300 text-[#d52727] focus:ring-[#d52727]'
              />
              <span className='flex-1'>{item.name || item}</span>
              {item.count != null && (
                <span className='text-gray-500'>({item.count})</span>
              )}
            </label>
          ))}
        </div>
        {hasMore && (
          <button
            onClick={() => setShowAll(!showAll)}
            className='text-[#d52727] hover:text-[#b31f1f] text-sm mt-2 transition-colors flex items-center'
          >
            <span className='material-symbols-outlined text-base mr-1'>
              {showAll ? "expand_less" : "expand_more"}
            </span>
            {showAll ? "Show less" : "See more"}
          </button>
        )}
      </div>
    );
  };

  const sortedProjects = useMemo(() => {
    return [...(projects || [])].sort((a, b) => {
      return sortAsc
        ? a.title?.localeCompare(b.title || "") || 0
        : b.title?.localeCompare(a.title || "") || 0;
    });
  }, [projects, sortAsc]);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const institutionUrl =
        "https://api.openalex.org/institutions/ror:044b0xj37";
      console.log("Fetching institution data from:", institutionUrl);
      const institutionData = await fetchWithRetry(institutionUrl);
      console.log("Institution data:", institutionData);

      if (!institutionData) {
        throw new Error("Failed to fetch institution data");
      }

      const apiUrl = new URL("https://api.openalex.org/works");
      const params = new URLSearchParams({
        filter: "institutions.ror:044b0xj37",
        "per-page": itemsPerPage,
        page: currentPage,
        sort: "publication_year:desc",
      });

      apiUrl.search = params.toString();
      console.log("Fetching works from:", apiUrl.toString());

      const data = await fetchWithRetry(apiUrl.toString());
      console.log("API Response:", data);

      if (!data) throw new Error("No data received from API");
      if (!data.results) {
        console.error("Unexpected API response structure:", data);
        throw new Error("Unexpected API response structure");
      }

      setTotalItems(data.meta?.count || 0);
      console.log(
        `Found ${data.results.length} works, total: ${data.meta?.count || 0}`
      );

      const sdgMap = {};
      const typeMap = {};
      const conceptsMap = {};
      const profileMap = {};

      const mappedProjects = data.results.map((p) => {
        (p.concepts || []).forEach((c) => {
          if (!c) return;
          const name = c.display_name || "";
          if (c.level === 0 || name.toLowerCase().includes("goal")) {
            sdgMap[name] = (sdgMap[name] || 0) + 1;
          } else {
            conceptsMap[name] = (conceptsMap[name] || 0) + 1;
          }
        });

        const type = p.type || "unknown";
        typeMap[type] = (typeMap[type] || 0) + 1;

        const lead =
          p.authorships?.[0]?.author?.display_name ||
          (p.authorships?.[0]?.author
            ? `Author ID: ${p.authorships[0].author.id}`
            : "Unknown");
        if (lead) {
          profileMap[lead] = (profileMap[lead] || 0) + 1;
        }

        return {
          id: p.id || "",
          title: p.title || p.display_name || "Untitled Project",
          lead,
          organization:
            institutionData.display_name || "Universitas Pendidikan Indonesia",
          type,
          duration: p.publication_year
            ? `${p.publication_year}`
            : p.publication_date
            ? new Date(p.publication_date).getFullYear().toString()
            : "-",
          status: p.is_retracted
            ? "Retracted"
            : p.is_paratext
            ? "Paratext"
            : "Published",
          openalex_url: p.id ? p.id.replace("https://openalex.org/", "") : "",
          concepts:
            p.concepts?.map((c) => c.display_name).filter(Boolean) || [],
          doi: p.doi || "",
          abstract: p.abstract || "",
        };
      });

      console.log("Mapped projects:", mappedProjects);
      setProjects(mappedProjects);
      setError(
        mappedProjects.length === 0
          ? "No projects found. Try adjusting your search criteria."
          : null
      );

      setSidebarData({
        sdg: Object.entries(sdgMap).map(([name, count]) => ({ name, count })),
        type: Object.entries(typeMap).map(([name, count]) => ({ name, count })),
        concepts: Object.entries(conceptsMap).map(([name, count]) => ({
          name,
          count,
        })),
        profile: Object.entries(profileMap).map(([name, count]) => ({
          name,
          count,
        })),
      });

      console.log("Sidebar data updated:", {
        sdg: Object.entries(sdgMap).length,
        type: Object.entries(typeMap).length,
        concepts: Object.entries(conceptsMap).length,
        profile: Object.entries(profileMap).length,
      });
    } catch (error) {
      console.error("Error fetching projects:", error);
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
    <section className='bg-gray-50 min-h-screen'>
      <FindProject />
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8'>
        <div className='md:hidden mb-4'>
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className='flex items-center gap-2 px-4 py-2 bg-[#d52727] text-white rounded-md text-sm font-medium hover:bg-[#b31f1f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d52727] transition-colors w-full justify-center'
          >
            <span className='material-symbols-outlined text-lg'>
              filter_alt
            </span>
            {showMobileFilters ? "Hide Filters" : "Show Filters"}
          </button>
        </div>

        <div className='flex flex-col md:flex-row gap-6 lg:gap-8'>
          <aside
            className={`${
              showMobileFilters ? "block" : "hidden"
            } md:block w-full md:w-64 bg-white shadow-sm rounded-md p-4 h-fit`}
          >
            <h2 className='font-semibold mb-4'>Filters for Project</h2>

            <div className='mb-4'>
              <h4 className='font-medium text-sm mb-2'>Sort By</h4>
              <select
                className='w-full border border-gray-300 p-2 rounded text-sm focus:border-[#d52727] focus:ring-1 focus:ring-[#d52727]'
                value={sortAsc ? "asc" : "desc"}
                onChange={(e) => setSortAsc(e.target.value === "asc")}
              >
                <option value='asc'>Title (A–Z)</option>
                <option value='desc'>Title (Z–A)</option>
              </select>
            </div>

            <SidebarSection
              title='Sustainable Development Goals'
              items={sidebarData.sdg}
            />
            <SidebarSection title='Concepts' items={sidebarData.concepts} />
            <SidebarSection title='Profile' items={sidebarData.profile} />
            <SidebarSection title='Type' items={sidebarData.type} />
          </aside>

          <main className='flex-1'>
            <div className='flex items-center justify-between border-b pb-3 mb-6'>
              <p className='text-sm text-gray-600'>
                Showing {projects.length} of {totalItems} results
              </p>
              <select
                className='border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-[#d52727] focus:border-[#d52727]'
                value={sortAsc ? "asc" : "desc"}
                onChange={(e) => setSortAsc(e.target.value === "asc")}
              >
                <option value='asc'>Title (A–Z)</option>
                <option value='desc'>Title (Z–A)</option>
              </select>
            </div>

            {loading ? (
              <div className='text-center py-10'>
                <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#d52727]'></div>
                <p className='mt-2 text-sm text-gray-600'>
                  Loading projects...
                </p>
              </div>
            ) : error ? (
              <div className='bg-red-50 border-l-4 border-red-500 p-4 mb-6'>
                <div className='flex'>
                  <div className='flex-shrink-0'>
                    <span className='material-symbols-outlined text-red-500'>
                      error
                    </span>
                  </div>
                  <div className='ml-3'>
                    <p className='text-sm text-red-700'>{error}</p>
                    {error.includes("Terlalu banyak permintaan") && (
                      <button
                        onClick={() => {
                          setRetryCount((prev) => prev + 1);
                          setError(null);
                        }}
                        className='mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-[#d52727] hover:bg-[#b31f1f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d52727] transition-colors'
                      >
                        Coba Lagi
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : sortedProjects.length === 0 ? (
              <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center'>
                <span className='material-symbols-outlined text-gray-400 text-4xl mb-2'>
                  search_off
                </span>
                <h3 className='text-lg font-medium text-gray-900 mb-1'>
                  No projects found
                </h3>
                <p className='text-gray-500 text-sm'>
                  Try adjusting your search or filter criteria
                </p>
              </div>
            ) : (
              <div className='space-y-4'>
                {sortedProjects.map((project, idx) => (
                  <article
                    key={idx}
                    className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200'
                  >
                    <div className='p-4 sm:p-6'>
                      <div className='flex items-start justify-between'>
                        <div className='flex-1 min-w-0'>
                          <h2 className='text-base sm:text-lg font-semibold text-gray-900 mb-1 leading-tight'>
                            <Link
                              to={`/projects/${project.openalex_url}`}
                              className='hover:text-[#d52727] transition-colors'
                            >
                              {project.title}
                            </Link>
                          </h2>

                          <div className='mt-1 flex items-center text-xs text-gray-500'>
                            <span className='flex items-center'>
                              <span className='material-symbols-outlined text-sm mr-1'>
                                person
                              </span>
                              {project.lead}
                            </span>
                            <span className='mx-2'>•</span>
                            <span>{project.duration}</span>
                          </div>

                          {project.organization && (
                            <p className='mt-1 text-sm text-gray-600'>
                              <span className='font-medium'>Organization:</span>{" "}
                              {project.organization}
                            </p>
                          )}
                        </div>

                        <div className='ml-4 flex-shrink-0'>
                          <Link
                            to={`/projects/${project.openalex_url}`}
                            className='inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full text-[#d52727] bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d52727] transition-colors'
                          >
                            View Details
                          </Link>
                        </div>
                      </div>

                      <div className='mt-3 flex flex-wrap gap-2'>
                        {project.type && (
                          <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                            {project.type}
                          </span>
                        )}
                        {project.status && (
                          <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'>
                            {project.status}
                          </span>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
            {projects.length > 0 && (
              <div className='mt-8 flex flex-col sm:flex-row items-center justify-between bg-white rounded-lg shadow-sm border border-gray-200 p-4'>
                <div className='mb-4 sm:mb-0'>
                  <p className='text-sm text-gray-700'>
                    Showing page{" "}
                    <span className='font-medium'>{currentPage}</span> of{" "}
                    <span className='font-medium'>
                      {Math.ceil(totalItems / itemsPerPage)}
                    </span>
                  </p>
                </div>
                <nav className='flex items-center space-x-2'>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-3 py-1.5 rounded-l-md border border-gray-300 text-sm font-medium ${
                      currentPage === 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span className='material-symbols-outlined text-base'>
                      chevron_left
                    </span>
                    Previous
                  </button>

                  <div className='hidden sm:flex space-x-1'>
                    {currentPage > 2 && (
                      <>
                        <button
                          onClick={() => setCurrentPage(1)}
                          className='relative inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium bg-white text-gray-700 hover:bg-gray-50'
                        >
                          1
                        </button>
                        {currentPage > 3 && (
                          <span className='px-1 text-gray-500'>...</span>
                        )}
                      </>
                    )}

                    {[currentPage - 1, currentPage, currentPage + 1]
                      .filter(
                        (page) =>
                          page >= 1 &&
                          page <= Math.ceil(totalItems / itemsPerPage)
                      )
                      .map((page) => {
                        const isCurrent = page === currentPage;
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`relative inline-flex items-center px-3 py-1.5 border text-sm font-medium ${
                              isCurrent
                                ? "z-10 bg-[#d52727] border-[#d52727] text-white"
                                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                  </div>

                  <button
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    disabled={projects.length < itemsPerPage}
                    className={`relative inline-flex items-center px-3 py-1.5 rounded-r-md border border-gray-300 text-sm font-medium ${
                      projects.length < itemsPerPage
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Next
                    <span className='material-symbols-outlined text-base ml-1'>
                      chevron_right
                    </span>
                  </button>
                </nav>
              </div>
            )}
          </main>
        </div>
      </div>
    </section>
  );
};

export default Project;
