import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import FindProfiles from "../../components/profiles/FindProfiles";

const stringToColor = (string) => {
  let hash = 0;
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 50%)`;
};

const sdgOptions = [
  {
    id: 1,
    name: "GOAL 9: Industry, Innovation and Infrastructure",
    count: 1377,
  },
  { id: 2, name: "GOAL 4: Quality Education", count: 892 },
  { id: 3, name: "GOAL 3: Good Health and Well-Being", count: 654 },
];

const conceptOptions = [
  { id: 1, name: "Geological Evolution of South China Sea", count: 202 },
  { id: 2, name: "Machine Learning Applications", count: 187 },
  { id: 3, name: "Renewable Energy Systems", count: 165 },
];

const countryOptions = [
  { id: 1, name: "Indonesia", count: 1614 },
  { id: 2, name: "Malaysia", count: 234 },
  { id: 3, name: "Singapore", count: 189 },
];

export default function Profile() {
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [selectedSdgs, setSelectedSdgs] = useState([]);
  const [selectedConcepts, setSelectedConcepts] = useState([]);
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState({
    count: 0,
    page: 1,
    per_page: 100,
    total_pages: 0,
  });

  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        setLoading(true);
        setError(null);
        const apiUrl = `/api/authors?${new URLSearchParams({
          q: query,
          sort:
            sortBy === "name"
              ? "name"
              : sortBy === "hIndex"
              ? "hIndex"
              : "works_count",
          per_page: 12, // Match Paper.jsx pagination
          page: meta.page,
        })}`;

        const response = await fetch(apiUrl, {
          headers: { Accept: "application/json" },
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();

        setAuthors(
          data.results.map((a) => ({
            id: a.id,
            name: a.display_name,
            image: `https://ui-avatars.com/api/?name=${encodeURIComponent(
              a.display_name
            )}&background=${stringToColor(a.display_name).substring(
              1
            )}&color=fff`,
            affiliations: a.last_known_institutions?.map((i) => i.display_name),
            hIndex: a.summary_stats?.h_index || 0,
            worksCount: a.works_count || 0,
            citedByCount: a.cited_by_count || 0,
          }))
        );

        // Update pagination meta
        const total = Number(data?.meta?.count || 0);
        const per = Number(data?.meta?.per_page || 12);
        const current = Number(data?.meta?.current_page || meta.page);
        const totalPages = total > 0 && per > 0 ? Math.ceil(total / per) : 0;
        setMeta({
          count: total,
          per_page: per,
          page: current,
          total_pages: totalPages,
        });
      } catch (e) {
        setError(
          "Gagal memuat data peneliti. Silakan coba beberapa saat lagi."
        );
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchAuthors, 400);
    return () => clearTimeout(timer);
  }, [query, sortBy, meta.page]);

  // Pagination functions
  const goToPage = (p) => {
    const max = meta.total_pages || 0;
    if (p < 1) p = 1;
    if (max && p > max) p = max;
    setMeta((prev) => ({ ...prev, page: p }));
  };

  const pageNumbers = useMemo(() => {
    const total = meta.total_pages || 0;
    const current = meta.page || 1;
    if (total <= 1) return [];
    const delta = 2;
    let start = Math.max(1, current - delta);
    let end = Math.min(total, current + delta);
    if (current <= 2) end = Math.min(total, 1 + delta * 2);
    if (current >= total - 1) start = Math.max(1, total - delta * 2);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [meta.total_pages, meta.page]);

  // Reset to page 1 when query or sort changes
  useEffect(() => {
    setMeta((prev) => ({ ...prev, page: 1 }));
  }, [query, sortBy]);

  const perPage = Number(meta.per_page) || 0;
  const startIndex =
    authors.length > 0 ? (meta.page - 1) * (perPage || authors.length) + 1 : 0;
  const endIndex =
    authors.length > 0
      ? Math.min(
          startIndex + authors.length - 1,
          Number(meta.count) || startIndex + authors.length - 1
        )
      : 0;

  return (
    <div className='bg-gray-50 min-h-screen'>
      <FindProfiles query={query} setQuery={setQuery} />

      <div className='max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-8'>
        {/* Mobile Filter Button */}
        <div className='md:hidden mb-4'>
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className='flex items-center gap-2 px-4 py-2 bg-[#d52727] text-white rounded-md text-sm font-medium hover:bg-[#b31f1f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d52727] transition-colors'
          >
            <span className='material-symbols-outlined mr-1 sm:mr-2 text-lg sm:text-xl'>
              filter_alt
            </span>
            {showMobileFilters ? "Hide Filters" : "Show Filters"}
          </button>
        </div>

        <div className='flex flex-col md:flex-row gap-8'>
          {/* Sidebar */}
          <aside
            className={`md:w-64 w-full bg-white rounded-xl shadow-sm border border-gray-100 p-5 h-fit
            ${showMobileFilters ? "block mb-4" : "hidden md:block"}`}
          >
            <h3 className='font-semibold text-lg mb-4 text-gray-800'>
              Filter Authors
            </h3>
            <div className='space-y-6 text-sm text-gray-700'>
              {[
                ["SDGs", sdgOptions, selectedSdgs, setSelectedSdgs],
                [
                  "Concepts",
                  conceptOptions,
                  selectedConcepts,
                  setSelectedConcepts,
                ],
                [
                  "Countries",
                  countryOptions,
                  selectedCountries,
                  setSelectedCountries,
                ],
              ].map(([title, options, selected, setSelected], i) => (
                <div key={i}>
                  <h4 className='font-medium mb-2'>{title}</h4>
                  <ul className='space-y-1'>
                    {options.map((opt) => (
                      <li key={opt.id}>
                        <label className='flex items-center gap-2 cursor-pointer'>
                          <input
                            type='checkbox'
                            checked={selected.includes(opt.id)}
                            onChange={(e) =>
                              e.target.checked
                                ? setSelected([...selected, opt.id])
                                : setSelected(
                                    selected.filter((id) => id !== opt.id)
                                  )
                            }
                            className='text-[#d52727] rounded'
                          />
                          <span>{opt.name}</span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </aside>

          {/* Main Content */}
          <main className='flex-1 max-w-3xl'>
            <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b pb-3'>
              <p className='text-sm text-gray-600'>
                Menampilkan {startIndex}-{endIndex} dari {meta.count} hasil
              </p>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className='border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-[#d52727] focus:border-[#d52727]'
              >
                <option value=''>Urutkan</option>
                <option value='name'>Nama (A-Z)</option>
                <option value='hIndex'>H-Index (Tertinggi)</option>
              </select>
            </div>

            {loading ? (
              <div className='flex justify-center items-center h-60'>
                <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#d52727]'></div>
              </div>
            ) : error ? (
              <div className='text-center text-red-600 py-8'>{error}</div>
            ) : authors.length === 0 ? (
              <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center'>
                <span className='material-symbols-outlined text-gray-400 text-4xl mb-2'>
                  search_off
                </span>
                <h3 className='text-lg font-medium text-gray-900 mb-1'>
                  No researchers found
                </h3>
                <p className='text-gray-500 text-sm'>
                  Try adjusting your search or filter criteria
                </p>
              </div>
            ) : (
              <div className='space-y-4'>
                {authors.map((profile) => (
                  <article
                    key={profile.id}
                    className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200'
                  >
                    <div className='p-4 sm:p-6'>
                      <div className='flex items-start justify-between'>
                        <div className='flex-1 min-w-0'>
                          <div className='flex items-start gap-4'>
                            <img
                              src={profile.image}
                              alt={profile.name}
                              className='w-16 h-16 rounded-full border-2 border-gray-200 flex-shrink-0'
                            />
                            <div className='flex-1'>
                              <h2 className='text-base sm:text-lg font-semibold text-gray-900 mb-1 leading-tight'>
                                <Link
                                  to={`/profile/${profile.id}`}
                                  className='hover:text-[#d52727] transition-colors'
                                >
                                  {profile.name}
                                </Link>
                              </h2>

                              <p className='text-xs text-gray-500 mt-1'>
                                {profile.affiliations?.join(", ") ||
                                  "No affiliation info"}
                              </p>

                              <div className='flex gap-4 mt-3 text-xs text-gray-600'>
                                <span className='flex items-center gap-1'>
                                  <span className='material-symbols-outlined text-base'>
                                    menu_book
                                  </span>
                                  {profile.worksCount} publikasi
                                </span>
                                <span className='flex items-center gap-1'>
                                  <span className='material-symbols-outlined text-base'>
                                    trending_up
                                  </span>
                                  {profile.citedByCount} sitasi
                                </span>
                                <span className='flex items-center gap-1'>
                                  <span className='material-symbols-outlined text-base'>
                                    emoji_events
                                  </span>
                                  H-Index {profile.hIndex}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className='ml-4 flex-shrink-0'>
                          <Link
                            to={`/profile/${profile.id}`}
                            className='inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full text-[#d52727] bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d52727] transition-colors'
                          >
                            View Profile
                          </Link>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}

                {/* Pagination */}
                {meta.total_pages > 1 && (
                  <div className='mt-8 flex flex-col sm:flex-row items-center justify-between bg-white rounded-lg shadow-sm border border-gray-200 p-4'>
                    <div className='mb-4 sm:mb-0'>
                      <p className='text-sm text-gray-700'>
                        Showing page{" "}
                        <span className='font-medium'>{meta.page}</span> of{" "}
                        <span className='font-medium'>{meta.total_pages}</span>
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
                        {pageNumbers.map((pageNum) => {
                          const isCurrent = pageNum === meta.page;
                          return (
                            <button
                              key={pageNum}
                              onClick={() => goToPage(pageNum)}
                              className={`relative inline-flex items-center px-3 py-1.5 border text-sm font-medium ${
                                isCurrent
                                  ? "z-10 bg-[#d52727] border-[#d52727] text-white"
                                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
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
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
