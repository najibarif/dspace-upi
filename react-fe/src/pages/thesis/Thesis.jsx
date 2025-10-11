import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { FiChevronLeft, FiChevronRight, FiChevronsLeft } from "react-icons/fi";
import FindThesis from "../../components/home/FindThesis";

const apiCache = new Map();

const fetchWithRetry = async (url, options = {}, retries = 3, backoff = 300) => {
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
  const [filters, setFilters] = useState({ year: "", subject: "", searchQuery: "" });
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
        params.set("filter", `publication_year:${filters.year},${params.get("filter")}`);
      if (filters.subject)
        params.set("filter", `concepts.id:${filters.subject},${params.get("filter")}`);

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

  const handleSearch = (query) => setFilters((p) => ({ ...p, searchQuery: query }));

  const years = Array.from({ length: 10 }, (_, i) => (new Date().getFullYear() - i).toString());
  const subjects = [
    { id: "C2779384143", name: "Computer Science" },
    { id: "C185592680", name: "Engineering" },
    { id: "C144133560", name: "Medicine" },
    { id: "C15744967", name: "Biology" },
    { id: "C142362112", name: "Chemistry" },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <FindThesis onSearch={handleSearch} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-10">
        {/* Mobile filter button */}
        <div className="md:hidden mb-5">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-[#d52727] text-white rounded-md text-sm font-medium hover:bg-[#b31f1f] transition"
          >
            <span className="material-symbols-outlined">filter_alt</span>
            {showMobileFilters ? "Sembunyikan Filter" : "Tampilkan Filter"}
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Filter */}
          <aside
            className={`${showMobileFilters ? "block" : "hidden"
              } md:block w-full md:w-64 bg-white shadow-md rounded-xl p-5 h-fit`}
          >
            <h2 className="font-semibold text-lg mb-5 text-gray-800">Filter Tesis</h2>

            {/* Year Filter */}
            <div className="mb-5">
              <label className="font-medium text-sm text-gray-700 mb-2 block">Tahun Publikasi</label>
              <select
                value={filters.year}
                onChange={(e) => setFilters((p) => ({ ...p, year: e.target.value }))}
                className="w-full border border-gray-300 p-2 rounded-lg text-sm focus:ring-2 focus:ring-[#d52727] outline-none"
              >
                <option value="">Semua Tahun</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject Filter */}
            <div>
              <label className="font-medium text-sm text-gray-700 mb-2 block">Bidang Ilmu</label>
              <select
                value={filters.subject}
                onChange={(e) => setFilters((p) => ({ ...p, subject: e.target.value }))}
                className="w-full border border-gray-300 p-2 rounded-lg text-sm focus:ring-2 focus:ring-[#d52727] outline-none"
              >
                <option value="">Semua Bidang</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3 mb-6 gap-3">
              <p className="text-sm text-gray-600">
                {loading
                  ? "Memuat data..."
                  : error
                    ? error
                    : `Menampilkan ${theses.length} hasil`}
              </p>
              <div className="flex items-center gap-3">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-sm border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#d52727] outline-none"
                  disabled={loading}
                >
                  <option value="publication_date:desc">Tanggal (Terbaru)</option>
                  <option value="publication_date:asc">Tanggal (Terlama)</option>
                  <option value="cited_by_count:desc">Dikutip (Terbanyak)</option>
                  <option value="relevance_score:desc">Relevansi</option>
                </select>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#d52727] mx-auto mb-3"></div>
                <p className="text-gray-600">Memuat data tesis...</p>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="text-center py-10 text-red-600">
                <svg
                  className="w-12 h-12 mx-auto mb-3"
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
                <p className="text-lg font-medium">{error}</p>
              </div>
            )}

            {/* Results */}
            {!loading && !error && (
              <div className="space-y-5">
                {theses.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">
                    Tidak ada tesis yang ditemukan.
                  </div>
                ) : (
                  theses.map((t) => (
                    <Link
                      key={t.id}
                      to={`/thesis/${t.id.replace("https://openalex.org/", "")}`}
                      className="block bg-white p-5 rounded-xl shadow-sm hover:shadow-md border border-gray-100 transition"
                    >
                      <h2 className="font-semibold text-lg text-gray-800 mb-1">
                        {t.title || "Judul tidak tersedia"}
                      </h2>
                      {t.authorships?.length > 0 && (
                        <p className="text-sm text-gray-600 mb-2">
                          Oleh: {t.authorships.map((a) => a.author.display_name).join(", ")}
                        </p>
                      )}
                      {t.abstract_inverted_index && (
                        <p className="text-gray-700 text-sm line-clamp-2">
                          {Object.values(t.abstract_inverted_index).flat().join(" ")}
                        </p>
                      )}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {t.concepts?.slice(0, 3).map((c) => (
                          <span
                            key={c.id}
                            className="px-2 py-1 bg-[#feecec] text-[#b31f1f] text-xs rounded-full"
                          >
                            {c.display_name}
                          </span>
                        ))}
                        {t.publication_year && (
                          <span className="text-xs text-gray-500 ml-auto">
                            {t.publication_year}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))
                )}
              </div>
            )}

            {/* Pagination */}
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
                  disabled={theses.length < itemsPerPage}
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
    </div>
  );
}
