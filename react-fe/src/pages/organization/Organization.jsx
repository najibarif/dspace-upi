import { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiExternalLink,
  FiChevronRight,
  FiGlobe,
  FiMapPin,
  FiFilter,
  FiX,
  FiDownload,
  FiFileText,
  FiChevronLeft,
  FiChevronsLeft,
  FiChevronRight as FiChevronRightIcon,
  FiChevronsRight,
} from "react-icons/fi";
import { FaUniversity } from "react-icons/fa";
import FindOrganization from "../../components/organization/FindOrganization";

const apiCache = new Map();

const fetchWithRetry = async (
  url,
  options = {},
  retries = 3,
  backoff = 300
) => {
  const cacheKey = `${url}-${JSON.stringify(options)}`;
  if (apiCache.has(cacheKey)) return apiCache.get(cacheKey);

  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        Accept: "application/json",
        "Cache-Control": "no-cache",
        ...options.headers,
      },
    });

    if (res.status === 429) {
      if (retries > 0) {
        const retryAfter = res.headers.get("Retry-After") || backoff;
        await new Promise((r) => setTimeout(r, retryAfter * 1000));
        return fetchWithRetry(url, options, retries - 1, backoff * 2);
      }
      throw new Error("Rate limit exceeded. Please try again later.");
    }

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

    const data = await res.json();
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

const FilterSection = ({
  title,
  items,
  selectedItems,
  onToggleItem,
  showAll,
  onToggleShowAll,
}) => (
  <div>
    <h4 className='font-medium text-sm mb-2'>{title}</h4>
    <div className='space-y-2'>
      {items.slice(0, showAll ? items.length : 5).map((item) => (
        <label key={item.id || item.code} className='flex items-center'>
          <input
            type='checkbox'
            checked={selectedItems.includes(item.id || item.code)}
            onChange={() => onToggleItem(item.id || item.code)}
            className='rounded border-gray-300 text-[#d52727] focus:ring-[#d52727]'
          />
          <span className='ml-2 text-sm text-gray-700'>
            {item.name} {item.count !== undefined && `(${item.count})`}
          </span>
        </label>
      ))}
    </div>
    {items.length > 5 && (
      <button
        onClick={onToggleShowAll}
        className='mt-2 text-xs text-[#d52727] hover:text-[#b31f1f] focus:outline-none'
      >
        {showAll
          ? "Tampilkan lebih sedikit"
          : `Tampilkan semua (${items.length})`}
      </button>
    )}
  </div>
);

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const maxVisible = 3;
  const half = Math.floor(maxVisible / 2);
  let start = Math.max(1, currentPage - half);
  let end = Math.min(totalPages, start + maxVisible - 1);
  if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);

  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  if (totalPages <= 1) return null;

  return (
    <div className='flex flex-wrap items-center justify-center gap-1 mt-6 px-2 overflow-x-auto w-full'>
      <div className='flex items-center space-x-1'>
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className='p-2 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-50 hidden sm:inline-flex'
          aria-label='First page'
        >
          <FiChevronsLeft className='h-4 w-4' />
        </button>
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className='p-2 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-50'
          aria-label='Previous page'
        >
          <FiChevronLeft className='h-4 w-4' />
        </button>

        {start > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className={`min-w-[40px] h-10 rounded-md flex items-center justify-center text-gray-700 hover:bg-gray-100`}
            >
              1
            </button>
            {start > 2 && <span className='px-1 text-gray-500'>...</span>}
          </>
        )}

        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`min-w-[40px] h-10 rounded-md flex items-center justify-center text-sm ${
              currentPage === page
                ? "bg-red-600 text-white font-medium"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            aria-current={currentPage === page ? "page" : undefined}
          >
            {page}
          </button>
        ))}

        {end < totalPages && (
          <>
            {end < totalPages - 1 && (
              <span className='px-1 text-gray-500'>...</span>
            )}
            <button
              onClick={() => onPageChange(totalPages)}
              className={`min-w-[40px] h-10 rounded-md flex items-center justify-center text-gray-700 hover:bg-gray-100`}
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className='p-2 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-50'
          aria-label='Next page'
        >
          <FiChevronRightIcon className='h-4 w-4' />
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className='p-2 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-50 hidden sm:inline-flex'
          aria-label='Last page'
        >
          <FiChevronsRight className='h-4 w-4' />
        </button>
      </div>

      <div className='text-sm text-gray-500 mt-2 sm:mt-0 sm:ml-4'>
        Halaman {currentPage} dari {totalPages}
      </div>
    </div>
  );
};

const OrganizationCard = ({ org }) => (
  <div className='group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-200 hover:border-[#d52727]'>
    <Link to={`/organization/${org.id}`} className='block'>
      <div className='p-5'>
        <div className='flex items-start space-x-4'>
          <div className='flex-shrink-0'>
            {org.image_thumbnail_url ? (
              <img
                src={org.image_thumbnail_url}
                alt={org.display_name}
                className='h-16 w-16 object-contain border border-gray-200 rounded-md p-1'
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = "none";
                }}
              />
            ) : (
              <div className='h-16 w-16 rounded-md bg-gray-50 flex items-center justify-center text-gray-300 border border-gray-200'>
                <FaUniversity className='h-8 w-8' />
              </div>
            )}
          </div>

          <div className='flex-1 min-w-0'>
            <div className='flex items-start justify-between'>
              <h3 className='text-lg font-semibold text-gray-900 group-hover:text-[#d52727] truncate pr-2'>
                {org.display_name}
              </h3>
              <FiChevronRight className='h-5 w-5 text-gray-400 flex-shrink-0 mt-1' />
            </div>
            {org.type && (
              <span className='inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 mt-1.5 mb-2'>
                {org.type.replace(/^./, (str) => str.toUpperCase())}
              </span>
            )}

            <div className='mt-2 space-y-1.5 text-sm text-gray-600'>
              {org.country_code && (
                <div className='flex items-center'>
                  <FiMapPin className='mr-2 h-4 w-4 text-gray-400' />
                  {org.country || org.country_code}
                </div>
              )}
              {org.homepage_url && (
                <div className='flex items-center'>
                  <FiGlobe className='mr-2 h-4 w-4 text-gray-400' />
                  <a
                    href={org.homepage_url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='truncate text-blue-600 hover:text-blue-800 hover:underline'
                  >
                    {org.homepage_url.replace(/^https?:\/\//, "").split("/")[0]}
                  </a>
                  <FiExternalLink className='ml-1 h-3 w-3 text-blue-400' />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className='mt-4 pt-4 border-t border-gray-100 grid grid-cols-3 gap-2 text-center'>
          <div className='p-2 bg-gray-50 rounded'>
            <div className='text-sm font-medium text-gray-900'>
              {org.works_count?.toLocaleString() || "0"}
            </div>
            <div className='text-xs text-gray-500'>Publikasi</div>
          </div>
          <div className='p-2 bg-gray-50 rounded'>
            <div className='text-sm font-medium text-gray-900'>
              {org.cited_by_count?.toLocaleString() || "0"}
            </div>
            <div className='text-xs text-gray-500'>Sitasi</div>
          </div>
          <div className='p-2 bg-gray-50 rounded'>
            <div className='text-sm font-medium text-gray-900'>
              {org.h_index?.toLocaleString() || "0"}
            </div>
            <div className='text-xs text-gray-500'>H-Index</div>
          </div>
        </div>
      </div>
    </Link>
  </div>
);

const Organization = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    types: true,
    countries: true,
  });
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    per_page: 12,
    total_pages: 0,
  });

  const availableTypes = useMemo(
    () => [
      { id: "institution", name: "Institusi" },
      { id: "company", name: "Perusahaan" },
      { id: "government", name: "Pemerintah" },
      { id: "nonprofit", name: "Nirlaba" },
      { id: "education", name: "Pendidikan" },
      { id: "healthcare", name: "Kesehatan" },
      { id: "other", name: "Lainnya" },
    ],
    []
  );

  const availableCountries = useMemo(
    () => [
      { code: "ID", name: "Indonesia" },
      { code: "US", name: "United States" },
      { code: "GB", name: "United Kingdom" },
      { code: "AU", name: "Australia" },
      { code: "SG", name: "Singapore" },
      { code: "MY", name: "Malaysia" },
      { code: "JP", name: "Japan" },
      { code: "KR", name: "South Korea" },
      { code: "CN", name: "China" },
      { code: "IN", name: "India" },
      { code: "DE", name: "Germany" },
      { code: "FR", name: "France" },
      { code: "NL", name: "Netherlands" },
      { code: "CA", name: "Canada" },
    ],
    []
  );

  const fetchOrganizations = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const q = searchParams.get("q") || "";
      const page = Number(searchParams.get("page") || 1);
      const sort = searchParams.get("sort") || "works_count:desc";
      const perPage = 12;

      const params = new URLSearchParams({
        page: page,
        per_page: perPage,
        sort: sort,
        mailto: "admin@upi.edu",
      });

      if (q) {
        params.set("search", q);
      }

      const filters = [];
      if (selectedTypes.length) {
        filters.push(`type:${selectedTypes.join("|")}`);
      }
      if (selectedCountries.length) {
        filters.push(`country_code:${selectedCountries.join("|")}`);
      }

      if (filters.length > 0) {
        params.set("filter", filters.join(","));
      }

      const response = await fetch(
        `https://api.openalex.org/institutions?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const results = data.results || [];
      const total = data.meta?.count || 0;
      const totalPages = Math.ceil(total / perPage) || 1;

      const transformedData = results.map((org) => ({
        id: org.id.split("/").pop(),
        display_name: org.display_name,
        type: org.type,
        country_code: org.country_code,
        country: org.countries?.[0]?.display_name || org.country,
        homepage_url: org.homepage_url,
        image_thumbnail_url: org.image_thumbnail_url,
        works_count: org.works_count || 0,
        cited_by_count: org.cited_by_count || 0,
        h_index: org.summary_stats?.h_index || 0,
      }));

      setOrganizations(transformedData);
      setMeta({
        total,
        page,
        per_page: perPage,
        total_pages: totalPages,
      });

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Error fetching organizations:", err);
      setError("Failed to load organization data. Please try again later.");
      setOrganizations([]);
      setMeta((prev) => ({ ...prev, total: 0, total_pages: 1 }));
    } finally {
      setLoading(false);
    }
  }, [searchParams, selectedTypes, selectedCountries]);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  const toggleType = (id) => {
    setSelectedTypes((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    setSearchParams(params);
  };

  const toggleCountry = (code) => {
    setSelectedCountries((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    setSearchParams(params);
  };

  const toggleSection = (sec) =>
    setExpandedSections((prev) => ({ ...prev, [sec]: !prev[sec] }));

  const goToPage = (p) => {
    const max = meta.total_pages || 0;
    if (p < 1) p = 1;
    if (max && p > max) p = max;
    const params = new URLSearchParams(searchParams);
    params.set("page", String(p));
    setSearchParams(params);
  };

  const startIndex =
    organizations.length > 0 ? (meta.page - 1) * meta.per_page + 1 : 0;
  const endIndex =
    organizations.length > 0
      ? Math.min(startIndex + organizations.length - 1, meta.total)
      : 0;

  return (
    <>
      <FindOrganization />
      <div className='bg-gray-50 min-h-screen'>
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
              <h2 className='font-semibold mb-4'>Filters for Organization</h2>
              <div className='mb-4'>
                <h4 className='font-medium text-sm mb-2'>Sort By</h4>
                <select
                  className='w-full border border-gray-300 p-2 rounded text-sm focus:border-[#d52727] focus:ring-1 focus:ring-[#d52727]'
                  value={searchParams.get("sort") || ""}
                  onChange={(e) => {
                    const params = new URLSearchParams(searchParams);
                    if (e.target.value) params.set("sort", e.target.value);
                    else params.delete("sort");
                    params.set("page", "1");
                    setSearchParams(params);
                  }}
                >
                  <option value=''>Default</option>
                  <option value='works_count:desc'>Publications (Most)</option>
                  <option value='cited_by_count:desc'>Citations (Most)</option>
                  <option value='display_name:asc'>Name (A-Z)</option>
                  <option value='display_name:desc'>Name (Z-A)</option>
                </select>
              </div>
              <div className='space-y-6'>
                <FilterSection
                  title='Tipe Organisasi'
                  items={availableTypes}
                  selectedItems={selectedTypes}
                  onToggleItem={toggleType}
                  showAll={expandedSections.types}
                  onToggleShowAll={() => toggleSection("types")}
                />
                <FilterSection
                  title='Negara'
                  items={availableCountries}
                  selectedItems={selectedCountries}
                  onToggleItem={toggleCountry}
                  showAll={expandedSections.countries}
                  onToggleShowAll={() => toggleSection("countries")}
                />
              </div>
            </aside>

            <main className='flex-1'>
              <div className='flex items-center justify-between border-b pb-3 mb-6'>
                <p className='text-sm text-gray-600'>
                  Showing {startIndex}-{endIndex} of {meta.total} results
                </p>
                <select
                  className='border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-[#d52727] focus:border-[#d52727]'
                  value={searchParams.get("sort") || ""}
                  onChange={(e) => {
                    const params = new URLSearchParams(searchParams);
                    if (e.target.value) params.set("sort", e.target.value);
                    else params.delete("sort");
                    params.set("page", "1");
                    setSearchParams(params);
                  }}
                >
                  <option value=''>Default</option>
                  <option value='works_count:desc'>Publications (Most)</option>
                  <option value='cited_by_count:desc'>Citations (Most)</option>
                  <option value='display_name:asc'>Name (A-Z)</option>
                  <option value='display_name:desc'>Name (Z-A)</option>
                </select>
              </div>

              {loading ? (
                <div className='text-center py-10'>
                  <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#d52727]'></div>
                  <p className='mt-2 text-sm text-gray-600'>
                    Loading organizations...
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
                    </div>
                  </div>
                </div>
              ) : organizations.length === 0 ? (
                <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center'>
                  <span className='material-symbols-outlined text-gray-400 text-4xl mb-2'>
                    search_off
                  </span>
                  <h3 className='text-lg font-medium text-gray-900 mb-1'>
                    No organizations found
                  </h3>
                  <p className='text-gray-500 text-sm'>
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              ) : (
                <div className='space-y-4'>
                  {organizations.map((org) => (
                    <OrganizationCard key={org.id} org={org} />
                  ))}
                </div>
              )}
            </main>
          </div>
        </div>

        {meta.total_pages > 1 && (
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='mt-8 flex flex-col sm:flex-row items-center justify-between bg-white rounded-lg shadow-sm border border-gray-200 p-4'>
              <div className='mb-4 sm:mb-0'>
                <p className='text-sm text-gray-700'>
                  Showing page <span className='font-medium'>{meta.page}</span>{" "}
                  of <span className='font-medium'>{meta.total_pages}</span>
                </p>
              </div>
              <nav className='flex items-center space-x-2'>
                <button
                  onClick={() => goToPage(meta.page - 1)}
                  disabled={meta.page <= 1}
                  className={`relative inline-flex items-center px-3 py-1.5 rounded-l-md border border-gray-300 text-sm font-medium ${
                    meta.page <= 1
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
                  {Array.from(
                    { length: Math.min(5, meta.total_pages) },
                    (_, i) => {
                      let pageNum;
                      if (meta.total_pages <= 5) {
                        pageNum = i + 1;
                      } else if (meta.page <= 3) {
                        pageNum = i + 1;
                      } else if (meta.page >= meta.total_pages - 2) {
                        pageNum = meta.total_pages - 4 + i;
                      } else {
                        pageNum = meta.page - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => goToPage(pageNum)}
                          className={`relative inline-flex items-center px-3 py-1.5 border text-sm font-medium ${
                            meta.page === pageNum
                              ? "z-10 bg-[#d52727] border-[#d52727] text-white"
                              : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                  )}
                </div>

                <button
                  onClick={() => goToPage(meta.page + 1)}
                  disabled={meta.page >= meta.total_pages}
                  className={`relative inline-flex items-center px-3 py-1.5 rounded-r-md border border-gray-300 text-sm font-medium ${
                    meta.page >= meta.total_pages
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
          </div>
        )}
      </div>
    </>
  );
};

export default Organization;
