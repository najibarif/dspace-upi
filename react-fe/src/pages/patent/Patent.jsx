import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiChevronLeft, FiChevronRight, FiChevronsLeft } from "react-icons/fi";
import FindPatent from "../../components/patent/FindPatent";

function SidebarSection({ title, items }) {
  const [showAll, setShowAll] = useState(false);
  const visibleItems = showAll ? items : items.slice(0, 5);

  return (
    <div className="mb-6">
      <h3 className="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wide">
        {title}
      </h3>
      <div className="space-y-2 text-sm text-gray-600">
        {visibleItems.map((item, idx) => (
          <label
            key={idx}
            className="flex items-center justify-between cursor-pointer hover:text-[#d52727]"
          >
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-[#d52727] focus:ring-[#d52727]"
              />
              <span>{item.name}</span>
            </div>
            {item.count && (
              <span className="text-gray-400 text-xs">({item.count})</span>
            )}
          </label>
        ))}
      </div>
      {items.length > 5 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-[#d52727] text-sm font-medium mt-2 hover:underline"
        >
          {showAll ? "Show less" : "See more >"}
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
    <section className="bg-gray-50 min-h-screen">
      <FindPatent />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-8">
        {/* Mobile filter toggle */}
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
              } md:block w-full md:w-72 bg-white shadow-sm rounded-xl p-5 border border-gray-100 h-fit`}
          >
            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-2 text-sm uppercase tracking-wide">
                Sort By
              </h3>
              <select
                className="w-full border border-gray-300 p-2 rounded-md text-sm focus:ring-[#d52727] focus:border-[#d52727]"
                value={sortAsc ? "asc" : "desc"}
                onChange={(e) => setSortAsc(e.target.value === "asc")}
              >
                <option value="asc">Title (A–Z)</option>
                <option value="desc">Title (Z–A)</option>
              </select>
            </div>

            <SidebarSection title="Type" items={sidebarData.type} />
            <SidebarSection title="Concepts" items={sidebarData.concepts} />
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b pb-4 mb-6 gap-2">
              <h2 className="text-lg font-semibold text-gray-800">
                Patent Results
              </h2>
              <p className="text-sm text-gray-600">
                Showing {patents.length} of {totalResults} total
              </p>
            </div>

            {loading ? (
              <p className="text-gray-600 text-center mt-6">
                Loading patents...
              </p>
            ) : patents.length === 0 ? (
              <div className="text-center mt-10">
                <p className="text-gray-600 mb-4">
                  No patents found. Try adjusting your search criteria.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-[#d52727]/10 text-[#d52727] rounded-md hover:bg-[#d52727]/20 transition"
                >
                  Refresh Search
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {sortedPatents.map((p, idx) => (
                  <Link
                    key={idx}
                    to={`/detailpatent/${p.openalex_url}`}
                    className="block bg-white p-5 rounded-xl border border-gray-100 hover:border-[#d52727]/50 shadow-sm hover:shadow-md transition"
                  >
                    <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-2">
                      {p.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-medium text-gray-700">
                        Organization:
                      </span>{" "}
                      {p.organization}
                    </p>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                      <span className="bg-gray-100 px-2 py-1 rounded-md">
                        Type: {p.type}
                      </span>
                      {p.publication_date && (
                        <span className="bg-gray-100 px-2 py-1 rounded-md">
                          Published: {p.publication_date}
                        </span>
                      )}
                      {p.concepts.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {p.concepts.map((c, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 bg-[#d52727]/10 text-[#d52727] rounded-md"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
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
                  disabled={patents.length < itemsPerPage}
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
    </section>
  );
}
