import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiChevronLeft, FiChevronRight, FiChevronsLeft } from "react-icons/fi";
import FindBanner from "../../components/home/FindBanner";

export default function Outreach() {
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchOutreachWorks = async () => {
    setLoading(true);
    setError(null);
    try {
      // Try searching for community engagement works first
      let response = await fetch(
        "https://api.openalex.org/works?search=community%20engagement&per_page=10"
      );
      let data = await response.json();

      // If no results, try a broader search
      if (!data.results || data.results.length === 0) {
        response = await fetch(
          "https://api.openalex.org/works?search=outreach&per_page=10"
        );
        data = await response.json();
      }

      // If still no results, try one more search term
      if (!data.results || data.results.length === 0) {
        response = await fetch(
          "https://api.openalex.org/works?search=public%20engagement&per_page=10"
        );
        data = await response.json();
      }

      setWorks(data.results || []);
    } catch (err) {
      setError("⚠️ Gagal memuat data dari OpenAlex. Coba lagi nanti.");
      console.error("API Error:", err);
      setWorks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOutreachWorks();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Banner */}
      <FindBanner />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-8">
        {/* Mobile Filter Button */}
        <div className="md:hidden mb-5">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-[#d52727] text-white rounded-md text-sm font-medium hover:bg-[#b31f1f] transition"
          >
            <span className="material-symbols-outlined text-base">
              filter_alt
            </span>
            {showMobileFilters ? "Hide Filters" : "Show Filters"}
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside
            className={`${showMobileFilters ? "block" : "hidden"
              } md:block w-full md:w-72 bg-white shadow-sm rounded-xl border border-gray-100 p-5 h-fit`}
          >
            <h2 className="font-semibold text-gray-800 mb-4 text-sm uppercase tracking-wide">
              Filter Outreach
            </h2>

            {/* Filter Sections */}
            <div className="space-y-6">
              {/* SDGs */}
              <div>
                <h4 className="font-medium text-gray-700 text-sm mb-3">
                  Sustainable Development Goals
                </h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-[#d52727] focus:ring-[#d52727]"
                      />
                      <span>SDG 4 – Quality Education</span>
                    </label>
                  </li>
                  <li>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-[#d52727] focus:ring-[#d52727]"
                      />
                      <span>SDG 13 – Climate Action</span>
                    </label>
                  </li>
                </ul>
                <button className="text-[#d52727] text-sm mt-2 hover:underline">
                  See more &gt;
                </button>
              </div>

              {/* Concepts */}
              <div>
                <h4 className="font-medium text-gray-700 text-sm mb-3">
                  Concepts
                </h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-[#d52727] focus:ring-[#d52727]"
                      />
                      <span>Community Engagement</span>
                    </label>
                  </li>
                </ul>
                <button className="text-[#d52727] text-sm mt-2 hover:underline">
                  See more &gt;
                </button>
              </div>

              {/* Time Period */}
              <div>
                <h4 className="font-medium text-gray-700 text-sm mb-3">
                  Time Period
                </h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-[#d52727] focus:ring-[#d52727]"
                      />
                      <span>Last 5 years</span>
                    </label>
                  </li>
                </ul>
                <button className="text-[#d52727] text-sm mt-2 hover:underline">
                  See more &gt;
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-4 mb-6">
              <p className="text-sm text-gray-600">
                {loading
                  ? "Loading outreach works..."
                  : error
                    ? error
                    : `${works.length} results found`}
              </p>
              <div className="flex gap-6 text-sm mt-3 sm:mt-0">
                <button className="text-gray-700 hover:text-[#d52727] transition">
                  Start date (descending) &gt;
                </button>
                <button className="text-[#d52727] hover:underline">
                  Export results
                </button>
              </div>
            </div>

            {/* Results */}
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#d52727]"></div>
                <p className="mt-3 text-sm text-gray-600">
                  Memuat data outreach...
                </p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-500">{error}</p>
                <button
                  onClick={fetchOutreachWorks}
                  className="mt-4 px-4 py-2 bg-[#d52727]/10 text-[#d52727] rounded-md hover:bg-[#d52727]/20 transition"
                >
                  Coba Lagi
                </button>
              </div>
            ) : works.length === 0 ? (
              <div className="text-center py-12 text-gray-600">
                Tidak ada data outreach ditemukan.
              </div>
            ) : (
              <div className="grid gap-5">
                {works.map((work) => (
                  <Link
                    key={work.id}
                    to={`/outreach/${work.id.replace("https://openalex.org/", "")}`}
                    className="block bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#d52727]/50 transition p-5"
                  >
                    <h2 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-2">
                      {work.title}
                    </h2>
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {work.abstract_inverted_index
                        ? Object.entries(work.abstract_inverted_index)
                          .sort((a, b) => a[1][0] - b[1][0])
                          .map((e) => e[0])
                          .join(" ")
                        : "No abstract available."}
                    </p>
                    <span className="text-[#d52727] text-sm mt-3 block font-medium">
                      View Details &gt;
                    </span>
                  </Link>
                ))}
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
                  disabled={works.length < itemsPerPage}
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
