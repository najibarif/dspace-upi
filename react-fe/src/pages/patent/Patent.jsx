import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import FindPatent from "../../components/patent/FindPatent";

function SidebarSection({ title, items, maxVisible = 5 }) {
  const [showAll, setShowAll] = useState(false);

  if (!items?.length) return null;

  const visibleItems = showAll ? items : items.slice(0, maxVisible);
  const hasMore = items.length > maxVisible;

  return (
    <div className='mb-6'>
      <h3 className='font-medium text-sm mb-2'>{title}</h3>
      <div className='space-y-2 text-sm text-gray-600'>
        {visibleItems.map((item, idx) => (
          <label
            key={idx}
            className='flex items-center gap-2 cursor-pointer hover:text-[#d52727] transition-colors'
          >
            <input
              type='checkbox'
              className='rounded border-gray-300 text-[#d52727] focus:ring-[#d52727]'
            />
            <span className='flex-1'>{item.name}</span>
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
}

export default function Patent() {
  const [sortAsc, setSortAsc] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [patents, setPatents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sidebarData, setSidebarData] = useState({
    type: [],
    concepts: [],
    profile: [],
  });
  const [loading, setLoading] = useState(true);
  const [totalResults, setTotalResults] = useState(0);

  useEffect(() => {
    const fetchPatents = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          "https://api.openalex.org/works?" +
            "search=patent&" +
            "filter=institutions.ror:044b0xj37&" +
            "sort=relevance_score:desc,publication_date:desc&" +
            "per-page=20"
        );
        const data = await response.json();
        setTotalResults(data.meta?.count || 0);

        const mappedPatents = (data.results || [])
          .map((p) => ({
            id: p.id || "",
            title: p.title || "No title available",
            lead: p.authorships?.[0]?.author?.display_name || "Unknown",
            organization:
              p.host_organization?.display_name ||
              p.authorships?.[0]?.institutions?.[0]?.display_name ||
              "Unknown",
            type: p.type ? p.type.split("/").pop() : "Work",
            concepts: p.concepts?.slice(0, 3).map((c) => c.display_name) || [],
            openalex_url: p.id?.replace("https://openalex.org/", "") || "",
            publication_date: p.publication_date || p.publication_year || "",
            url:
              p.doi?.replace("https://doi.org/", "https://doi.org/") ||
              p.id ||
              "#",
          }))
          .filter((p) => p.title && p.openalex_url);

        setPatents(mappedPatents);

        const typeMap = {},
          conceptsMap = {},
          profileMap = {};

        mappedPatents.forEach((p) => {
          if (p.type) typeMap[p.type] = (typeMap[p.type] || 0) + 1;
          p.concepts.forEach((c) => {
            conceptsMap[c] = (conceptsMap[c] || 0) + 1;
          });
          profileMap[p.lead] = (profileMap[p.lead] || 0) + 1;
        });

        setSidebarData({
          type: Object.entries(typeMap).map(([name, count]) => ({
            name,
            count,
          })),
          concepts: Object.entries(conceptsMap).map(([name, count]) => ({
            name,
            count,
          })),
          profile: Object.entries(profileMap).map(([name, count]) => ({
            name,
            count,
          })),
        });
      } catch (err) {
        console.error("Failed to fetch patents:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPatents();
  }, []);

  const sortedPatents = useMemo(() => {
    const data = [...patents];
    return data.sort((a, b) =>
      sortAsc ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)
    );
  }, [sortAsc, patents]);

  return (
    <section className='bg-gray-50 min-h-screen'>
      <FindPatent />
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
            <h2 className='font-semibold mb-4'>Filters for Patent</h2>

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

            <SidebarSection title='Type' items={sidebarData.type} />
            <SidebarSection title='Concepts' items={sidebarData.concepts} />
          </aside>

          <main className='flex-1'>
            <div className='flex items-center justify-between border-b pb-3 mb-6'>
              <p className='text-sm text-gray-600'>
                Showing {patents.length} of {totalResults} results
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
                <p className='mt-2 text-sm text-gray-600'>Loading patents...</p>
              </div>
            ) : patents.length === 0 ? (
              <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center'>
                <span className='material-symbols-outlined text-gray-400 text-4xl mb-2'>
                  search_off
                </span>
                <h3 className='text-lg font-medium text-gray-900 mb-1'>
                  No patents found
                </h3>
                <p className='text-gray-500 text-sm'>
                  Try adjusting your search or filter criteria
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className='mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#d52727] hover:bg-[#b31f1f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d52727] transition-colors'
                >
                  Refresh Search
                </button>
              </div>
            ) : (
              <div className='space-y-4'>
                {sortedPatents.map((p, idx) => (
                  <article
                    key={idx}
                    className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200'
                  >
                    <div className='p-4 sm:p-6'>
                      <div className='flex items-start justify-between'>
                        <div className='flex-1 min-w-0'>
                          <h2 className='text-base sm:text-lg font-semibold text-gray-900 mb-1 leading-tight'>
                            <Link
                              to={`/detailpatent/${p.openalex_url}`}
                              className='hover:text-[#d52727] transition-colors'
                            >
                              {p.title}
                            </Link>
                          </h2>

                          <div className='mt-1 flex items-center text-xs text-gray-500'>
                            <span className='flex items-center'>
                              <span className='material-symbols-outlined text-sm mr-1'>
                                business
                              </span>
                              {p.organization}
                            </span>
                            {p.publication_date && (
                              <>
                                <span className='mx-2'>•</span>
                                <span>{p.publication_date}</span>
                              </>
                            )}
                          </div>

                          {p.lead && (
                            <p className='mt-1 text-sm text-gray-600'>
                              <span className='font-medium'>Lead:</span>{" "}
                              {p.lead}
                            </p>
                          )}
                        </div>

                        <div className='ml-4 flex-shrink-0'>
                          <Link
                            to={`/detailpatent/${p.openalex_url}`}
                            className='inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full text-[#d52727] bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d52727] transition-colors'
                          >
                            View Details
                          </Link>
                        </div>
                      </div>

                      <div className='mt-3 flex flex-wrap gap-2'>
                        {p.type && (
                          <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                            {p.type}
                          </span>
                        )}
                        {p.concepts?.slice(0, 3).map((c, i) => (
                          <span
                            key={i}
                            className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800'
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
            {patents.length > 0 && (
              <div className='mt-8 flex flex-col sm:flex-row items-center justify-between bg-white rounded-lg shadow-sm border border-gray-200 p-4'>
                <div className='mb-4 sm:mb-0'>
                  <p className='text-sm text-gray-700'>
                    Showing page{" "}
                    <span className='font-medium'>{currentPage}</span> of{" "}
                    <span className='font-medium'>
                      {Math.ceil(totalResults / itemsPerPage)}
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
                          page <= Math.ceil(totalResults / itemsPerPage)
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
                    disabled={patents.length < itemsPerPage}
                    className={`relative inline-flex items-center px-3 py-1.5 rounded-r-md border border-gray-300 text-sm font-medium ${
                      patents.length < itemsPerPage
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
