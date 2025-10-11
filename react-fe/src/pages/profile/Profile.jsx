import { useState, useEffect, useMemo, useCallback } from 'react';
import { FiFilter, FiChevronDown, FiChevronUp, FiExternalLink, FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight } from "react-icons/fi";
import { Link } from "react-router-dom";
import FindProfiles from "../../components/profiles/FindProfiles";

// Debounce hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

// Fungsi warna avatar (merah)
const stringToColor = () => "#FF0000";

export default function Profile() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 500);

  const [sortBy, setSortBy] = useState("");
  const [selectedSdgs, setSelectedSdgs] = useState([]);
  const [selectedConcepts, setSelectedConcepts] = useState([]);
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [selectedHIndex, setSelectedHIndex] = useState([0, 100]);
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Filter options
  const [sdgOptions, setSdgOptions] = useState([]);
  const [conceptOptions, setConceptOptions] = useState([]);
  const [countryOptions, setCountryOptions] = useState([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isMobile, setIsMobile] = useState(false);

  // Responsif: deteksi mobile
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchAuthors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const apiUrl = `https://api.openalex.org/authors?filter=last_known_institutions.ror:https://ror.org/044b0xj37${debouncedQuery ? `,display_name.search:${encodeURIComponent(debouncedQuery)}` : ""
        }&per_page=100&sort=${sortBy === "name"
          ? "display_name"
          : sortBy === "hIndex"
            ? "summary_stats.h_index:desc"
            : "works_count:desc"
        }`;

      const response = await fetch(apiUrl, {
        headers: { Accept: "application/json", "Cache-Control": "no-cache" },
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      const authorsData = (data.results || []).map((a) => ({
        id: a.id?.split("/").pop() || "",
        name: a.display_name || "Nama tidak tersedia",
        image: `https://ui-avatars.com/api/?name=${encodeURIComponent(
          a.display_name || "?"
        )}&background=d52727&color=fff`,
        affiliations: a.last_known_institutions?.map((i) => i.display_name) || [],
        hIndex: a.summary_stats?.h_index || 0,
        worksCount: a.works_count || 0,
        citedByCount: a.cited_by_count || 0,
        concepts: a.concepts?.map((c) => c.display_name).filter(Boolean) || [],
        country:
          a.last_known_institutions?.map((i) => i.country_code).filter(Boolean) ||
          [],
        sdgs:
          a.x_concepts
            ?.filter((c) => c?.level === "sdg")
            ?.map((c) => c.name)
            .filter(Boolean) || [],
      }));

      setAuthors(authorsData);

      setSdgOptions([...new Set(authorsData.flatMap((a) => a.sdgs))]);
      setConceptOptions([...new Set(authorsData.flatMap((a) => a.concepts))]);
      setCountryOptions([...new Set(authorsData.flatMap((a) => a.country))]);
      setRetryCount(0);
    } catch (e) {
      console.error("Error fetching authors:", e);
      setError({
        message: "Gagal memuat data peneliti. Silakan coba beberapa saat lagi.",
        retry: () => setRetryCount((prev) => prev + 1),
      });
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, sortBy]);

  useEffect(() => {
    const timer = setTimeout(() => fetchAuthors(), 400);
    return () => clearTimeout(timer);
  }, [fetchAuthors, retryCount]);

  // Filter + Sort
  const filteredProfiles = useMemo(() => {
    let filtered = [...authors];
    const q = debouncedQuery.toLowerCase();

    if (debouncedQuery) {
      filtered = filtered.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.affiliations?.some((a) => a?.toLowerCase().includes(q))
      );
    }

    if (selectedSdgs.length > 0)
      filtered = filtered.filter((p) =>
        p.sdgs.some((s) => selectedSdgs.includes(s))
      );

    if (selectedConcepts.length > 0)
      filtered = filtered.filter((p) =>
        p.concepts.some((c) => selectedConcepts.includes(c))
      );

    if (selectedCountries.length > 0)
      filtered = filtered.filter((p) =>
        p.country.some((c) => selectedCountries.includes(c))
      );

    filtered = filtered.filter(
      (p) => p.hIndex >= selectedHIndex[0] && p.hIndex <= selectedHIndex[1]
    );

    if (sortBy === "name")
      filtered = filtered.sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === "hIndex")
      filtered = filtered.sort((a, b) => b.hIndex - a.hIndex);

    return filtered;
  }, [
    authors,
    debouncedQuery,
    selectedSdgs,
    selectedConcepts,
    selectedCountries,
    selectedHIndex,
    sortBy,
  ]);

  // Pagination
  const totalPages = Math.ceil(filteredProfiles.length / itemsPerPage);
  const currentProfiles = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProfiles.slice(start, start + itemsPerPage);
  }, [filteredProfiles, currentPage]);

  // Generate pagination (maks 5 desktop, 3 mobile)
  const maxVisible = isMobile ? 3 : 5;
  const generatePages = () => {
    const pages = [];
    const half = Math.floor(maxVisible / 2);
    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);

    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push("...");
    }

    for (let i = start; i <= end; i++) pages.push(i);

    if (end < totalPages) {
      if (end < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }

    return pages;
  };

  const pages = generatePages();

  return (
    <div className="bg-gray-50 min-h-screen pb-2">
      <FindProfiles query={query} setQuery={setQuery} />

      <div className="max-w-8xl mx-auto px-4 sm:px-6 md:px-10 py-10">
        {/* Tombol filter mobile */}
        <div className="md:hidden mb-4">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-[#d52727] text-white rounded-md text-sm font-medium hover:bg-[#b31f1f]"
          >
            <span className="material-symbols-outlined">filter_alt</span>
            {showMobileFilters ? "Hide Filters" : "Show Filters"}
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Filter */}
          <aside
            className={`md:w-64 w-full bg-white rounded-xl shadow-sm border border-gray-100 p-5 h-fit ${showMobileFilters ? "block mb-4" : "hidden md:block"
              }`}
          >
            <h3 className="font-semibold text-lg mb-4 text-gray-800">
              Filter Authors
            </h3>
            <div className="space-y-6 text-sm text-gray-700">
              {[
                ["SDGs", sdgOptions, selectedSdgs, setSelectedSdgs],
                ["Concepts", conceptOptions, selectedConcepts, setSelectedConcepts],
                ["Countries", countryOptions, selectedCountries, setSelectedCountries],
              ].map(([title, options, selected, setSelected], i) => (
                <div key={i}>
                  <h4 className="font-medium mb-2">{title}</h4>
                  <ul className="space-y-1 max-h-32 overflow-y-auto">
                    {options.map((opt, idx) => (
                      <li key={idx}>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selected.includes(opt)}
                            onChange={(e) =>
                              e.target.checked
                                ? setSelected([...selected, opt])
                                : setSelected(selected.filter((v) => v !== opt))
                            }
                            className="text-[#d52727]"
                          />
                          <span>{opt}</span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              {/* H-Index */}
              <div>
                <h4 className="font-medium mb-2">H-Index</h4>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={selectedHIndex[1]}
                  onChange={(e) =>
                    setSelectedHIndex([0, Number(e.target.value)])
                  }
                  className="w-full accent-[#d52727]"
                />
                <p className="text-xs mt-1">Max H-Index: {selectedHIndex[1]}</p>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 max-w-4xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b pb-3">
              <p className="text-gray-600 text-sm">
                {filteredProfiles.length} peneliti ditemukan
              </p>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-[#d52727] focus:border-[#d52727]"
              >
                <option value="">Urutkan</option>
                <option value="name">Nama (A-Z)</option>
                <option value="hIndex">H-Index (Tertinggi)</option>
              </select>
            </div>

            {loading ? (
              <div className="text-center py-32">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600 mb-4"></div>
                <p className="text-gray-600">Memuat data peneliti...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-600 mb-4">{error.message}</p>
                <button
                  onClick={error.retry}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Coba Lagi
                </button>
              </div>
            ) : filteredProfiles.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                Tidak ada peneliti ditemukan.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-5">
                  {currentProfiles.map((profile) => (
                    <Link
                      to={`/profile/${profile.id}`}
                      key={profile.id}
                      className="block bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-4">
                        <img
                          src={profile.image}
                          alt={profile.name}
                          className="w-16 h-16 rounded-full border-2 border-gray-200"
                        />
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900">
                            {profile.name}
                          </h3>
                          {profile.affiliations?.length > 0 && (
                            <p className="text-sm text-gray-500 mt-1">
                              {profile.affiliations.join(", ")}
                            </p>
                          )}
                          <div className="mt-2 flex flex-wrap gap-2">
                            {profile.sdgs.slice(0, 3).map((sdg) => (
                              <span
                                key={sdg}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                              >
                                {sdg}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm text-gray-500">
                            H-Index: {profile.hIndex}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

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
                          className={`min-w-[40px] h-10 rounded-md flex items-center justify-center text-sm ${
                            currentPage === page
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
                      disabled={authors.length < itemsPerPage}
                      className='p-2 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-50'
                      aria-label='Next page'
                    >
                      <FiChevronRight className='h-4 w-4' />
                    </button>
                  </div>
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
