import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import FindThesis from "../../components/home/FindThesis";

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
        "Cache-Control": "no-cache",
        ...options.headers,
      },
    });

    if (response.status === 429) {
      if (retries > 0) {
        const retryAfter = response.headers.get("Retry-After") || backoff;
        await new Promise((r) => setTimeout(r, retryAfter * 1000));
        return fetchWithRetry(url, options, retries - 1, backoff * 2);
      }
      throw new Error("Rate limit exceeded. Please try again later.");
    }

    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

    const data = await response.json();
    apiCache.set(cacheKey, data);
    return data;
  } catch (err) {
    if (retries > 0) {
      await new Promise((r) => setTimeout(r, backoff * 1000));
      return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }
    throw err;
  }
};

export default function Thesis() {
  const [theses, setTheses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    year: "",
    subject: "",
    searchQuery: "",
  });
  const [sortBy, setSortBy] = useState("publication_date:desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const itemsPerPage = 10;

  const fetchTheses = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let url = "https://api.openalex.org/works?";
      const params = new URLSearchParams({
        filter: "type:dissertation",
        "per-page": itemsPerPage,
        page: currentPage,
        sort: sortBy,
      });

      if (filters.searchQuery) params.set("search", filters.searchQuery);
      if (filters.year)
        params.set(
          "filter",
          `publication_year:${filters.year},${params.get("filter")}`
        );
      if (filters.subject)
        params.set(
          "filter",
          `concepts.id:${filters.subject},${params.get("filter")}`
        );

      const data = await fetchWithRetry(`${url}${params.toString()}`);
      if (!data?.results) throw new Error("Invalid response format");

      setTheses(data.results || []);
    } catch (err) {
      console.error("Error fetching theses:", err);
      setError(
        err.message.includes("Rate limit")
          ? "Terlalu banyak permintaan. Coba lagi nanti."
          : "Gagal memuat daftar tesis. Pastikan koneksi internet stabil."
      );
    } finally {
      setLoading(false);
    }
  }, [filters, sortBy, currentPage]);

  useEffect(() => {
    fetchTheses();
  }, [fetchTheses]);

  const handleSearch = (query) =>
    setFilters((p) => ({ ...p, searchQuery: query }));

  const years = Array.from({ length: 10 }, (_, i) =>
    (new Date().getFullYear() - i).toString()
  );
  const subjects = [
    { id: "C2779384143", name: "Computer Science" },
    { id: "C185592680", name: "Engineering" },
    { id: "C144133560", name: "Medicine" },
    { id: "C15744967", name: "Biology" },
    { id: "C142362112", name: "Chemistry" },
  ];

  return (
    <section className='bg-gray-50 min-h-screen'>
      <FindThesis onSearch={handleSearch} />

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
            <h2 className='font-semibold mb-4'>Filters for Thesis</h2>

            <div className='mb-4'>
              <h4 className='font-medium text-sm mb-2'>Tahun Publikasi</h4>
              <select
                value={filters.year}
                onChange={(e) =>
                  setFilters((p) => ({ ...p, year: e.target.value }))
                }
                className='w-full border border-gray-300 p-2 rounded text-sm focus:border-[#d52727] focus:ring-1 focus:ring-[#d52727]'
              >
                <option value=''>Semua Tahun</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <div className='mb-4'>
              <h4 className='font-medium text-sm mb-2'>Bidang Ilmu</h4>
              <select
                value={filters.subject}
                onChange={(e) =>
                  setFilters((p) => ({ ...p, subject: e.target.value }))
                }
                className='w-full border border-gray-300 p-2 rounded text-sm focus:border-[#d52727] focus:ring-1 focus:ring-[#d52727]'
              >
                <option value=''>Semua Bidang</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </aside>

          <main className='flex-1'>
            <div className='flex items-center justify-between border-b pb-3 mb-6'>
              <p className='text-sm text-gray-600'>
                {loading
                  ? "Memuat data..."
                  : error
                  ? error
                  : `Showing ${theses.length} results`}
              </p>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className='border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-[#d52727] focus:border-[#d52727]'
                disabled={loading}
              >
                <option value='publication_date:desc'>Tanggal (Terbaru)</option>
                <option value='publication_date:asc'>Tanggal (Terlama)</option>
                <option value='cited_by_count:desc'>Dikutip (Terbanyak)</option>
                <option value='relevance_score:desc'>Relevansi</option>
              </select>
            </div>

            {loading && (
              <div className='text-center py-10'>
                <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#d52727]'></div>
                <p className='mt-2 text-sm text-gray-600'>Loading theses...</p>
              </div>
            )}

            {error && !loading && (
              <div className='bg-red-50 border-l-4 border-red-500 p-4 mb-6'>
                <div className='flex'>
                  <div className='flex-shrink-0'>
                    <span className='material-symbols-outlined text-red-500'>
                      error
                    </span>
                  </div>
                  <div className='ml-3'>
                    <p className='text-sm text-red-700'>{error}</p>
                  </div>
                </div>
              </div>
            )}

            {!loading && !error && theses.length === 0 ? (
              <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center'>
                <span className='material-symbols-outlined text-gray-400 text-4xl mb-2'>
                  search_off
                </span>
                <h3 className='text-lg font-medium text-gray-900 mb-1'>
                  No theses found
                </h3>
                <p className='text-gray-500 text-sm'>
                  Try adjusting your search or filter criteria
                </p>
              </div>
            ) : !loading && !error ? (
              <div className='space-y-4'>
                {theses.map((t) => (
                  <article
                    key={t.id}
                    className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200'
                  >
                    <div className='p-4 sm:p-6'>
                      <div className='flex items-start justify-between'>
                        <div className='flex-1 min-w-0'>
                          <h2 className='text-base sm:text-lg font-semibold text-gray-900 mb-1 leading-tight'>
                            <Link
                              to={`/thesis/${t.id.replace(
                                "https://openalex.org/",
                                ""
                              )}`}
                              className='hover:text-[#d52727] transition-colors'
                            >
                              {t.title || "Judul tidak tersedia"}
                            </Link>
                          </h2>

                          {t.authorships?.length > 0 && (
                            <div className='mt-1 flex items-center text-xs text-gray-500'>
                              <span className='flex items-center'>
                                <span className='material-symbols-outlined text-sm mr-1'>
                                  person
                                </span>
                                {t.authorships
                                  .map((a) => a.author.display_name)
                                  .join(", ")}
                              </span>
                              {t.publication_year && (
                                <>
                                  <span className='mx-2'>•</span>
                                  <span>{t.publication_year}</span>
                                </>
                              )}
                            </div>
                          )}

                          {t.abstract_inverted_index && (
                            <p className='mt-2 text-sm text-gray-600 line-clamp-2'>
                              {Object.values(t.abstract_inverted_index)
                                .flat()
                                .join(" ")}
                            </p>
                          )}
                        </div>

                        <div className='ml-4 flex-shrink-0'>
                          <Link
                            to={`/thesis/${t.id.replace(
                              "https://openalex.org/",
                              ""
                            )}`}
                            className='inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full text-[#d52727] bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d52727] transition-colors'
                          >
                            View Details
                          </Link>
                        </div>
                      </div>

                      <div className='mt-3 flex flex-wrap gap-2'>
                        {t.concepts?.slice(0, 3).map((c) => (
                          <span
                            key={c.id}
                            className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800'
                          >
                            {c.display_name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : null}

            {theses.length > 0 && (
              <div className='mt-8 flex flex-col sm:flex-row items-center justify-between bg-white rounded-lg shadow-sm border border-gray-200 p-4'>
                <div className='mb-4 sm:mb-0'>
                  <p className='text-sm text-gray-700'>
                    Showing page{" "}
                    <span className='font-medium'>{currentPage}</span>
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
                      .filter((page) => page >= 1)
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
                    disabled={theses.length < itemsPerPage}
                    className={`relative inline-flex items-center px-3 py-1.5 rounded-r-md border border-gray-300 text-sm font-medium ${
                      theses.length < itemsPerPage
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
}
