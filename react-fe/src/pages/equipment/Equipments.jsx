import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import FindEquipments from "../../components/home/FindEquipments";
import { FiExternalLink } from "react-icons/fi";

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
    const headers = {
      Accept: "application/json",
      ...options.headers,
    };

    const apiUrl = url;

    const res = await fetch(apiUrl, {
      ...options,
      headers,
      credentials: "same-origin",
    });

    if (res.status === 429) {
      if (retries > 0) {
        const retryAfter = res.headers.get("Retry-After") || backoff;
        const waitTime = parseInt(retryAfter, 10) * 1000 || backoff * 1000;
        console.warn(
          `Rate limited. Retrying in ${waitTime}ms... (${retries} retries left)`
        );
        await new Promise((r) => setTimeout(r, waitTime));
        return fetchWithRetry(
          url,
          options,
          retries - 1,
          Math.min(backoff * 2, 60000)
        );
      }
      throw new Error("API rate limit exceeded. Please try again later.");
    }

    if (res.status === 403) {
      if (retries > 0) {
        console.warn(
          "Access forbidden. Retrying with different authentication..."
        );
        apiCache.delete(cacheKey);
        return fetchWithRetry(
          url,
          options,
          retries - 1,
          Math.min(backoff * 2, 60000)
        );
      }
      throw new Error(
        "Access forbidden. Please check your API key and permissions. If you don't have an API key, please get one from https://openalex.org/register"
      );
    }

    if (!res.ok) {
      const errorData = await res.text();
      throw new Error(
        `HTTP error! status: ${res.status}, message: ${errorData}`
      );
    }

    const data = await res.json();
    apiCache.set(cacheKey, data);
    return data;
  } catch (err) {
    console.error("API Error:", err);
    if (retries > 0) {
      const waitTime = backoff * 1000;
      console.warn(`Retrying in ${waitTime}ms... (${retries} retries left)`);
      await new Promise((r) => setTimeout(r, waitTime));
      return fetchWithRetry(
        url,
        options,
        retries - 1,
        Math.min(backoff * 2, 60000)
      );
    }
    throw err;
  }
};

export default function Equipments() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [year, setYear] = useState("");
  const [totalResults, setTotalResults] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const equipmentTypes = [
    { id: "equipment", name: "Research Equipment" },
    { id: "instrument", name: "Scientific Instrument" },
    { id: "facility", name: "Research Facility" },
    { id: "apparatus", name: "Laboratory Apparatus" },
    { id: "device", name: "Measurement Device" },
  ];

  const fetchEquipments = async () => {
    try {
      setLoading(true);
      setError(null);

      const q = searchParams.get("q") || "";
      const page = Number(searchParams.get("page") || 1);
      const sort = searchParams.get("sort") || "relevance";
      const perPage = 12;

      let url = "https://api.openalex.org/works?";

      if (q) {
        url += `search=${encodeURIComponent(q)}&`;
      } else {
        url +=
          "search=research%20equipment%20OR%20scientific%20instrument%20OR%20laboratory%20apparatus&";
      }

      if (selectedTypes.length > 0) {
        const typeFilter = selectedTypes
          .map((type) => `concept.id:${type}`)
          .join("|");
        url += `filter=${typeFilter}&`;
      }

      url += "filter=has_abstract:true&";

      url += `page=${page}&per_page=${perPage}`;

      let sortParam = "";
      if (sort === "relevance") {
        sortParam = "relevance_score:desc";
      } else if (sort === "cited_by_count") {
        sortParam = "cited_by_count:desc";
      } else if (sort === "publication_date") {
        sortParam = "publication_date:desc";
      } else {
        sortParam = "relevance_score:desc";
      }
      url += `&sort=${sortParam}`;

      console.log("Fetching equipment from OpenAlex:", url);

      const response = await fetchWithRetry(url);

      const equipmentList = response.results.map((work) => ({
        id: work.id.split("/").pop(),
        title: work.title,
        description: work.abstract || "No description available",
        type: work.type || "equipment",
        year: work.publication_year || "N/A",
        authors:
          work.authorships
            ?.map((auth) => auth.author.display_name)
            .join(", ") || "Unknown",
        institution: work.host_venue?.publisher || "Unknown",
        location: work.locations?.[0]?.source?.host_organization || "N/A",
        url: work.doi
          ? `https://doi.org/${work.doi}`
          : work.primary_location?.landing_page_url ||
            work.primary_location?.pdf_url ||
            "#",
      }));

      setEquipments(equipmentList);
      setTotalResults(response.meta?.count || equipmentList.length);
      setTotalPages(
        Math.ceil((response.meta?.count || equipmentList.length) / perPage)
      );
      setLoading(false);
    } catch (error) {
      console.error("Error fetching equipment data:", error);
      setError("Failed to load equipment data. Please try again later.");
      setLoading(false);
      setEquipments([]);
    }
  };

  useEffect(() => {
    fetchEquipments();
  }, [searchParams, selectedTypes]);

  const goToPage = (newPage) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const params = new URLSearchParams(searchParams);
    params.set("page", String(newPage));
    setSearchParams(params);
  };

  const formatEquipmentType = (type) => {
    const typeMap = {
      equipment: "Research Equipment",
      instrument: "Scientific Instrument",
      facility: "Research Facility",
      apparatus: "Laboratory Apparatus",
      device: "Measurement Device",
      article: "Research Article",
      dataset: "Research Dataset",
      software: "Research Software",
    };
    return (
      typeMap[type.toLowerCase()] ||
      type
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    );
  };

  const toggleTypeFilter = (type) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    setSearchParams(params);
  };

  const page = Number(searchParams.get("page") || 1);
  const perPage = 12;
  const startIndex = equipments.length > 0 ? (page - 1) * perPage + 1 : 0;
  const endIndex =
    equipments.length > 0
      ? Math.min(startIndex + equipments.length - 1, totalResults)
      : 0;

  return (
    <div className='bg-gray-50 min-h-screen'>
      <FindEquipments />

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
            <h2 className='font-semibold mb-4'>Filters for Equipment</h2>

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
                <option value=''>Default (Relevance)</option>
                <option value='publication_date'>Date (Newest)</option>
                <option value='cited_by_count'>Citations (Most)</option>
              </select>
            </div>

            <div className='mb-6'>
              <h3 className='font-medium text-sm mb-2'>Equipment Type</h3>
              <div className='space-y-2 text-sm text-gray-600'>
                {equipmentTypes.map((type) => (
                  <label key={type.id} className='flex items-center gap-2'>
                    <input
                      type='checkbox'
                      checked={selectedTypes.includes(type.id)}
                      onChange={() => toggleTypeFilter(type.id)}
                      className='rounded border-gray-300 text-[#d52727] focus:ring-[#d52727]'
                    />
                    <span className='flex-1'>{type.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className='mb-6'>
              <h3 className='font-medium text-sm mb-2'>Year Published</h3>
              <input
                type='number'
                placeholder='e.g. 2020'
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className='w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-[#d52727] focus:border-[#d52727]'
              />
            </div>
          </aside>

          <main className='flex-1'>
            <div className='flex items-center justify-between border-b pb-3 mb-6'>
              <p className='text-sm text-gray-600'>
                Showing {startIndex}-{endIndex} of {totalResults} results
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
                <option value=''>Default (Relevance)</option>
                <option value='publication_date'>Date (Newest)</option>
                <option value='cited_by_count'>Citations (Most)</option>
              </select>
            </div>

            {loading ? (
              <div className='text-center py-10'>
                <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#d52727]'></div>
                <p className='mt-2 text-sm text-gray-600'>
                  Loading equipment...
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
            ) : equipments.length === 0 ? (
              <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center'>
                <span className='material-symbols-outlined text-gray-400 text-4xl mb-2'>
                  search_off
                </span>
                <h3 className='text-lg font-medium text-gray-900 mb-1'>
                  No equipment found
                </h3>
                <p className='text-gray-500 text-sm'>
                  Try adjusting your search or filter criteria
                </p>
              </div>
            ) : (
              <div className='space-y-4'>
                <div className='grid gap-6 md:grid-cols-1 lg:grid-cols-1'>
                  {equipments.map((equipment) => (
                    <Link
                      key={equipment.id}
                      to={`/equipment/${equipment.id}`}
                      state={{ equipment }}
                      className='block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200'
                    >
                      <div className='p-4 sm:p-6'>
                        <div className='flex items-start'>
                          <div className='flex-shrink-0 h-16 w-16 mr-4 bg-blue-50 rounded-md flex items-center justify-center'>
                            <svg
                              className='h-8 w-8 text-blue-600'
                              xmlns='http://www.w3.org/2000/svg'
                              fill='none'
                              viewBox='0 0 24 24'
                              stroke='currentColor'
                            >
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z'
                              />
                            </svg>
                          </div>
                          <div className='flex-1'>
                            <h3 className='text-lg font-medium text-gray-900'>
                              <div className='flex items-center'>
                                {equipment.title}
                                <FiExternalLink className='ml-1 h-4 w-4 text-gray-400' />
                              </div>
                            </h3>

                            <div className='mt-1 text-sm text-gray-600'>
                              <p className='line-clamp-2'>
                                {equipment.description}
                              </p>
                            </div>

                            <div className='mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-500'>
                              {equipment.authors && (
                                <span className='flex items-center'>
                                  <svg
                                    className='h-4 w-4 mr-1 text-gray-400'
                                    fill='none'
                                    viewBox='0 0 24 24'
                                    stroke='currentColor'
                                  >
                                    <path
                                      strokeLinecap='round'
                                      strokeLinejoin='round'
                                      strokeWidth={2}
                                      d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                                    />
                                  </svg>
                                  {equipment.authors
                                    .split(",")
                                    .slice(0, 2)
                                    .join(", ")}
                                  {equipment.authors.split(",").length > 2
                                    ? " et al."
                                    : ""}
                                </span>
                              )}

                              {equipment.year && equipment.year !== "N/A" && (
                                <span className='flex items-center'>
                                  <svg
                                    className='h-4 w-4 mr-1 text-gray-400'
                                    fill='none'
                                    viewBox='0 0 24 24'
                                    stroke='currentColor'
                                  >
                                    <path
                                      strokeLinecap='round'
                                      strokeLinejoin='round'
                                      strokeWidth={2}
                                      d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                                    />
                                  </svg>
                                  {equipment.year}
                                </span>
                              )}

                              {equipment.institution && (
                                <span className='flex items-center'>
                                  <svg
                                    className='h-4 w-4 mr-1 text-gray-400'
                                    fill='none'
                                    viewBox='0 0 24 24'
                                    stroke='currentColor'
                                  >
                                    <path
                                      strokeLinecap='round'
                                      strokeLinejoin='round'
                                      strokeWidth={2}
                                      d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
                                    />
                                  </svg>
                                  {equipment.institution}
                                </span>
                              )}
                            </div>

                            <div className='mt-3 flex flex-wrap gap-2'>
                              <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                                {equipment.type
                                  ? formatEquipmentType(equipment.type)
                                  : "Equipment"}
                              </span>
                              {equipment.location &&
                                equipment.location !== "N/A" && (
                                  <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'>
                                    {equipment.location}
                                  </span>
                                )}
                            </div>

                            <div className='mt-3'>
                              <a
                                href={equipment.url}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='inline-flex items-center text-sm text-[#d52727] hover:text-[#b31f1f]'
                              >
                                View Details
                                <svg
                                  className='ml-1 h-4 w-4'
                                  fill='none'
                                  viewBox='0 0 24 24'
                                  stroke='currentColor'
                                >
                                  <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={2}
                                    d='M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14'
                                  />
                                </svg>
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className='mt-8 flex flex-col sm:flex-row items-center justify-between bg-white rounded-lg shadow-sm border border-gray-200 p-4'>
                    <div className='mb-4 sm:mb-0'>
                      <p className='text-sm text-gray-700'>
                        Showing page <span className='font-medium'>{page}</span>{" "}
                        of <span className='font-medium'>{totalPages}</span>
                      </p>
                    </div>
                    <nav className='flex items-center space-x-2'>
                      <button
                        onClick={() => goToPage(page - 1)}
                        disabled={page <= 1}
                        className={`relative inline-flex items-center px-3 py-1.5 rounded-l-md border border-gray-300 text-sm font-medium ${
                          page <= 1
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
                          { length: Math.min(5, totalPages) },
                          (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (page <= 3) {
                              pageNum = i + 1;
                            } else if (page >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = page - 2 + i;
                            }
                            return (
                              <button
                                key={pageNum}
                                onClick={() => goToPage(pageNum)}
                                className={`relative inline-flex items-center px-3 py-1.5 border text-sm font-medium ${
                                  page === pageNum
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
                        onClick={() => goToPage(page + 1)}
                        disabled={page >= totalPages}
                        className={`relative inline-flex items-center px-3 py-1.5 rounded-r-md border border-gray-300 text-sm font-medium ${
                          page >= totalPages
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
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
