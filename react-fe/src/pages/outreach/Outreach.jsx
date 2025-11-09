import { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import FindBanner from "../../components/home/FindBanner";

export default function Outreach() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    per_page: 12,
    total_pages: 0,
  });

  const fetchOutreachWorks = async () => {
    setLoading(true);
    setError(null);
    try {
      const q = searchParams.get("q") || "";
      const page = Number(searchParams.get("page") || 1);
      const perPage = 12;

      let searchTerm = q || "community engagement OR outreach OR public engagement";
      const url = `https://api.openalex.org/works?search=${encodeURIComponent(searchTerm)}&page=${page}&per_page=${perPage}`;
      
      const response = await fetch(url);
      const data = await response.json();

      setWorks(data.results || []);
      const total = data.meta?.count || 0;
      setMeta({
        total,
        page,
        per_page: perPage,
        total_pages: Math.ceil(total / perPage),
      });
    } catch (err) {
      setError("Failed to load outreach data. Please try again later.");
      console.error("API Error:", err);
      setWorks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOutreachWorks();
  }, [searchParams]);

  const goToPage = (p) => {
    const max = meta.total_pages || 0;
    if (p < 1) p = 1;
    if (max && p > max) p = max;
    const params = new URLSearchParams(searchParams);
    params.set("page", String(p));
    setSearchParams(params);
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

  const startIndex = works.length > 0 ? (meta.page - 1) * meta.per_page + 1 : 0;
  const endIndex = works.length > 0 ? Math.min(startIndex + works.length - 1, meta.total) : 0;

  return (
    <div className='bg-gray-50 min-h-screen'>
      <FindBanner />

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
            <h2 className='font-semibold mb-4'>Filters for Outreach</h2>

            <div className='mb-6'>
              <h3 className='font-medium text-sm mb-2'>Sustainable Development Goals</h3>
              <div className='space-y-2 text-sm text-gray-600'>
                <label className='flex items-center gap-2'>
                  <input
                    type='checkbox'
                    className='rounded border-gray-300 text-[#d52727] focus:ring-[#d52727]'
                  />
                  <span className='flex-1'>SDG 4 – Quality Education</span>
                </label>
                <label className='flex items-center gap-2'>
                  <input
                    type='checkbox'
                    className='rounded border-gray-300 text-[#d52727] focus:ring-[#d52727]'
                  />
                  <span className='flex-1'>SDG 13 – Climate Action</span>
                </label>
              </div>
            </div>

            <div className='mb-6'>
              <h3 className='font-medium text-sm mb-2'>Concepts</h3>
              <div className='space-y-2 text-sm text-gray-600'>
                <label className='flex items-center gap-2'>
                  <input
                    type='checkbox'
                    className='rounded border-gray-300 text-[#d52727] focus:ring-[#d52727]'
                  />
                  <span className='flex-1'>Community Engagement</span>
                </label>
              </div>
            </div>

            <div className='mb-6'>
              <h3 className='font-medium text-sm mb-2'>Time Period</h3>
              <div className='space-y-2 text-sm text-gray-600'>
                <label className='flex items-center gap-2'>
                  <input
                    type='checkbox'
                    className='rounded border-gray-300 text-[#d52727] focus:ring-[#d52727]'
                  />
                  <span className='flex-1'>Last 5 years</span>
                </label>
              </div>
            </div>
          </aside>

          <main className='flex-1'>
            <div className='flex items-center justify-between border-b pb-3 mb-6'>
              <p className='text-sm text-gray-600'>
                Showing {startIndex}-{endIndex} of {meta.total} results
              </p>
            </div>

            {loading ? (
              <div className='text-center py-10'>
                <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#d52727]'></div>
                <p className='mt-2 text-sm text-gray-600'>Loading outreach...</p>
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
            ) : works.length === 0 ? (
              <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center'>
                <span className='material-symbols-outlined text-gray-400 text-4xl mb-2'>
                  search_off
                </span>
                <h3 className='text-lg font-medium text-gray-900 mb-1'>
                  No outreach found
                </h3>
                <p className='text-gray-500 text-sm'>
                  Try adjusting your search or filter criteria
                </p>
              </div>
            ) : (
              <div className='space-y-4'>
                {works.map((work) => (
                  <article
                    key={work.id}
                    className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200'
                  >
                    <div className='p-4 sm:p-6'>
                      <h2 className='text-base sm:text-lg font-semibold text-gray-900 mb-1 leading-tight'>
                        <Link
                          to={`/outreach/${work.id.replace(
                            "https://openalex.org/",
                            ""
                          )}`}
                          className='hover:text-[#d52727] transition-colors'
                        >
                          {work.title}
                        </Link>
                      </h2>
                      <p className='text-sm text-gray-600 line-clamp-3 mt-2'>
                        {work.abstract_inverted_index
                          ? Object.entries(work.abstract_inverted_index)
                              .sort((a, b) => a[1][0] - b[1][0])
                              .map((e) => e[0])
                              .join(" ")
                          : "No abstract available."}
                      </p>
                    </div>
                  </article>
                ))}

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
