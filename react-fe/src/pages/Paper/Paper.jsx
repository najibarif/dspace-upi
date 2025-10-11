import { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import FindPaper from "../../components/paper/FindPaper";
import { getOpenAlexWorks } from "../../utils/api";

function SidebarSection({ title, items, onToggle, isChecked }) {
  const [showAll, setShowAll] = useState(false);
  const visibleItems = showAll ? items : items.slice(0, 5);

  return (
    <div className='mb-6'>
      <h3 className='font-medium text-sm mb-2'>{title}</h3>
      <div className='space-y-2 text-sm text-gray-600'>
        {visibleItems.map((item, idx) => {
          const value = item.value ?? item.name;
          const checked = isChecked ? isChecked(value) : false;
          return (
            <label key={idx} className='flex items-center gap-2'>
              <input
                type='checkbox'
                checked={checked}
                onChange={() => onToggle && onToggle(value)}
                className='rounded border-gray-300 text-[#d52727] focus:ring-[#d52727]'
              />
              <span className='flex-1'>{item.name}</span>
              {item.count && (
                <span className='text-gray-500'>({item.count})</span>
              )}
            </label>
          );
        })}
      </div>
      {items.length > 5 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className='text-[#d52727] hover:text-[#b31f1f] text-sm mt-2 transition-colors flex items-center'
        >
          {showAll ? (
            <>
              <span className='material-symbols-outlined text-base mr-1'>
                expand_less
              </span>
              Show less
            </>
          ) : (
            <>
              <span className='material-symbols-outlined text-base mr-1'>
                expand_more
              </span>
              See more
            </>
          )}
        </button>
      )}
    </div>
  );
}

const sidebarData = {
  sdg: [
    { name: "GOAL 7: Affordable and Clean Energy", count: 2054 },
    { name: "GOAL 14: Life Below Water", count: 1283 },
    { name: "GOAL 6: Clean Water and Sanitation", count: 1192 },
    { name: "GOAL 11: Sustainable Cities and Communities", count: 928 },
    { name: "GOAL 3: Good Health and Well-being", count: 577 },
  ],
  concepts: [
    { name: "Lorem Ipsum Concept 1", count: 120 },
    { name: "Lorem Ipsum Concept 2", count: 98 },
    { name: "Lorem Ipsum Concept 3", count: 75 },
    { name: "Lorem Ipsum Concept 4", count: 60 },
    { name: "Lorem Ipsum Concept 5", count: 40 },
  ],
  profile: [
    { name: "Lorem Ipsum Author 1", count: 324 },
    { name: "Lorem Ipsum Author 2", count: 280 },
    { name: "Lorem Ipsum Author 3", count: 257 },
    { name: "Lorem Ipsum Author 4", count: 210 },
    { name: "Lorem Ipsum Author 5", count: 190 },
  ],
  type: [
    { name: "Journal Article", value: "journal-article" },
    { name: "Book Chapter", value: "book-chapter" },
    { name: "Proceedings Article", value: "proceedings-article" },
    { name: "Report", value: "report" },
    { name: "Book", value: "book" },
    { name: "Dataset", value: "dataset" },
    { name: "Dissertation", value: "dissertation" },
  ],
};

const getShortOpenAlexId = (openAlexId) => {
  if (!openAlexId) return "";
  const parts = openAlexId.split("/");
  return parts[parts.length - 1] || openAlexId;
};

const UPI_ID_FULL = "https://openalex.org/I130218214";
const UPI_ID_SHORT = "I130218214";
const hasUpiInInstitutionIds = (ids) =>
  Array.isArray(ids) &&
  ids.some((x) => x === UPI_ID_FULL || x === UPI_ID_SHORT);
const isUpiInstitution = (inst) => {
  const id = inst?.id;
  return id === UPI_ID_FULL || id === UPI_ID_SHORT;
};
const extractShortAffiliation = (raw) => {
  if (!raw || typeof raw !== "string") return null;
  const first = raw.split(",")[0]?.trim();
  return first || null;
};
const getUpiAffiliationNames = (authorships) => {
  if (!Array.isArray(authorships)) return [];
  const names = new Set();
  authorships.forEach((auth) => {
    const hasUpiAff = Array.isArray(auth?.affiliations)
      ? auth.affiliations.some((aff) =>
          hasUpiInInstitutionIds(aff?.institution_ids)
        )
      : false;
    const hasUpiInst = Array.isArray(auth?.institutions)
      ? auth.institutions.some((inst) => isUpiInstitution(inst))
      : false;
    if (hasUpiAff || hasUpiInst) {
      let added = false;
      if (Array.isArray(auth?.affiliations)) {
        auth.affiliations.forEach((aff) => {
          if (hasUpiInInstitutionIds(aff?.institution_ids)) {
            const short = extractShortAffiliation(aff?.raw_affiliation_string);
            if (short) {
              names.add(short);
              added = true;
            }
          }
        });
      }
      if (!added && Array.isArray(auth?.raw_affiliation_strings)) {
        auth.raw_affiliation_strings.forEach((s) => {
          const short = extractShortAffiliation(s);
          if (short) names.add(short);
        });
        added = names.size > 0;
      }
      if (!added && Array.isArray(auth?.institutions)) {
        auth.institutions.forEach((inst) => {
          if (isUpiInstitution(inst) && inst?.display_name)
            names.add(inst.display_name);
        });
      }
    }
  });
  return Array.from(names);
};

const adaptPapers = (openAlexData) => {
  const items = Array.isArray(openAlexData?.results)
    ? openAlexData.results
    : [];
  return items.map((work) => {
    const idShort = getShortOpenAlexId(work.id);
    const authors = Array.isArray(work.authorships)
      ? work.authorships
          .map((a) => a?.author?.display_name)
          .filter(Boolean)
          .join(", ")
      : "-";
    const upiNames = getUpiAffiliationNames(work.authorships);
    const institutions =
      upiNames.length > 0
        ? upiNames.join(", ")
        : Array.isArray(work.authorships)
        ? Array.from(
            new Set(
              work.authorships.flatMap((a) =>
                Array.isArray(a?.institutions)
                  ? a.institutions.map((i) => i?.display_name).filter(Boolean)
                  : []
              )
            )
          ).join(", ")
        : "-";
    const venueName =
      work?.host_venue?.display_name ||
      work?.primary_location?.source?.display_name ||
      "-";
    const year = work?.publication_year ? String(work.publication_year) : "N/A";
    const fulltextUrl =
      work?.primary_location?.landing_page_url ||
      work?.open_access?.oa_url ||
      work?.host_venue?.url ||
      `https://openalex.org/${idShort}`;

    return {
      id: idShort,
      title: work?.display_name || "Untitled",
      link: fulltextUrl,
      authors,
      organization: institutions,
      source: venueName,
      year,
      description: "",
      itemCount: 1,
      type: work?.type,
      visibility: undefined,
    };
  });
};

export default function Paper() {
  // State management
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [yearFrom, setYearFrom] = useState("");
  const [yearTo, setYearTo] = useState("");
  const [meta, setMeta] = useState({
    count: 0,
    page: 1,
    per_page: 12,
    total_pages: 0,
  });

  const buildFilterParam = (types, fromYear, toYear) => {
    const parts = [];
    if (Array.isArray(types) && types.length > 0) {
      parts.push(`type:${types.join("|")}`);
    }
    if (fromYear) {
      parts.push(`from_publication_date:${fromYear}-01-01`);
    }
    if (toYear) {
      parts.push(`to_publication_date:${toYear}-12-31`);
    }
    return parts.join(",");
  };

  const parseFilterParam = (filterStr) => {
    const next = { types: [], fromYear: "", toYear: "" };
    if (!filterStr) return next;
    const parts = filterStr
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);
    for (const p of parts) {
      if (p.startsWith("type:")) {
        const raw = p.slice("type:".length);
        next.types = raw.split("|").filter(Boolean);
      } else if (p.startsWith("from_publication_date:")) {
        const val = p.slice("from_publication_date:".length);
        next.fromYear = (val || "").slice(0, 4);
      } else if (p.startsWith("to_publication_date:")) {
        const val = p.slice("to_publication_date:".length);
        next.toYear = (val || "").slice(0, 4);
      }
    }
    return next;
  };

  const applyFiltersToUrl = (types, fromYear, toYear, resetPage = true) => {
    const params = new URLSearchParams(searchParams);
    const filterStr = buildFilterParam(types, fromYear, toYear);
    if (filterStr) params.set("filter", filterStr);
    else params.delete("filter");
    if (resetPage) params.set("page", "1");
    setSearchParams(params);
  };

  const toggleType = (value) => {
    const exists = selectedTypes.includes(value);
    const next = exists
      ? selectedTypes.filter((v) => v !== value)
      : [...selectedTypes, value];
    setSelectedTypes(next);
    applyFiltersToUrl(next, yearFrom, yearTo, true);
  };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        setError(null);
        const q = searchParams.get("q") || "";
        const filter = searchParams.get("filter") || "";
        const page = Number(searchParams.get("page") || 1);
        const data = await getOpenAlexWorks({
          page,
          perPage: 12,
          q,
          extraFilter: filter,
        });
        setPapers(adaptPapers(data));
        const total = Number(data?.meta?.count || 0);
        const per = Number(data?.meta?.per_page || 12);
        const current = Number(data?.meta?.page || page || 1);
        const totalPages = total > 0 && per > 0 ? Math.ceil(total / per) : 0;
        setMeta({
          count: total,
          per_page: per,
          page: current,
          total_pages: totalPages,
        });
      } catch (err) {
        console.error("Failed to fetch papers:", err);
        setError(
          "Failed to load papers. " +
            (err.response?.data?.message || "Try again.")
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [searchParams]);

  useEffect(() => {
    const { types, fromYear, toYear } = parseFilterParam(
      searchParams.get("filter") || ""
    );
    setSelectedTypes(types);
    setYearFrom(fromYear || "");
    setYearTo(toYear || "");
  }, [searchParams]);

  const [sortAsc, setSortAsc] = useState(true);
  
  // Close mobile filters when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMobileFilters && !event.target.closest('aside') && !event.target.closest('button')) {
        setShowMobileFilters(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMobileFilters]);

  const sortedPapers = useMemo(() => {
    return [...papers].sort((a, b) =>
      sortAsc ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)
    );
  }, [papers, sortAsc]);

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

  // Toggle mobile filters
  const toggleMobileFilters = () => {
    setShowMobileFilters(!showMobileFilters);
  };

  // Handle year filter changes
  const handleYearChange = (type, value) => {
    if (type === 'from') setYearFrom(value);
    else setYearTo(value);
  };

  // Apply filters
  const applyFilters = () => {
    applyFiltersToUrl(selectedTypes, yearFrom, yearTo, true);
  };

  // Clear all filters
  const clearFilters = () => {
    setYearFrom("");
    setYearTo("");
    setSelectedTypes([]);
    applyFiltersToUrl([], "", "", true);
  };

  return (
    <section className='bg-gray-50 min-h-screen'>
      <FindPaper />

      <div className='max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8'>
        {/* Mobile filter button */}
        <div className='md:hidden mb-4'>
          <button
            onClick={toggleMobileFilters}
            className='flex items-center gap-2 px-4 py-2 bg-[#d52727] text-white rounded-md text-sm font-medium hover:bg-[#b31f1f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d52727] transition-colors w-full justify-center'
          >
            <span className='material-symbols-outlined text-lg'>filter_alt</span>
            {showMobileFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>

        <div className='flex flex-col md:flex-row gap-6 lg:gap-8'>
          {/* Sidebar - Hidden on mobile unless toggled */}
          <aside className={`${showMobileFilters ? 'block' : 'hidden'} md:block w-full md:w-64 bg-white shadow-sm rounded-md p-4 h-fit`}>
          <h2 className='font-semibold mb-4'>Filters for Paper</h2>

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

          <SidebarSection
            title='Sustainable Development Goals'
            items={sidebarData.sdg}
          />
          <SidebarSection title='Concepts' items={sidebarData.concepts} />
          <SidebarSection title='Profile' items={sidebarData.profile} />
          <SidebarSection
            title='Type'
            items={sidebarData.type}
            onToggle={toggleType}
            isChecked={(v) => selectedTypes.includes(v)}
          />
          <div className='mb-6'>
            <h3 className='font-medium text-sm mb-2'>Publication Year</h3>
            <div className='space-y-2 text-sm text-gray-600'>
              <div className='flex items-center gap-2'>
                <input
                  type='number'
                  inputMode='numeric'
                  placeholder='From'
                  className='w-24 border p-2 rounded text-sm'
                  value={yearFrom}
                  onChange={(e) => setYearFrom(e.target.value)}
                />
                <span className='text-gray-500'>-</span>
                <input
                  type='number'
                  inputMode='numeric'
                  placeholder='To'
                  className='w-24 border p-2 rounded text-sm'
                  value={yearTo}
                  onChange={(e) => setYearTo(e.target.value)}
                />
              </div>
              <div className='flex gap-2'>
                <button
                  className='px-3 py-1 bg-[#D52727] text-white rounded'
                  onClick={() =>
                    applyFiltersToUrl(selectedTypes, yearFrom, yearTo, true)
                  }
                >
                  Apply
                </button>
                <button
                  className='px-3 py-1 bg-gray-200 text-gray-700 rounded'
                  onClick={() => {
                    setYearFrom("");
                    setYearTo("");
                    applyFiltersToUrl(selectedTypes, "", "", true);
                  }}
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </aside>
        <main className='flex-1'>
          <div className='flex items-center justify-between border-b pb-3 mb-6'>
            <p className='text-sm text-gray-600'>
              Showing {sortedPapers.length} of {meta.count} results
            </p>
            <button
              className='text-sm text-[#d52727] hover:text-[#b31f1f] flex items-center gap-1 transition-colors'
              onClick={() => setSortAsc((v) => !v)}
            >
              <span className='material-symbols-outlined text-base'>
                {sortAsc ? 'arrow_upward' : 'arrow_downward'}
              </span>
              Sort {sortAsc ? 'A-Z' : 'Z-A'}
            </button>
          </div>

          {loading ? (
            <div className='text-center py-10'>
              <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#d52727]'></div>
              <p className='mt-2 text-sm text-gray-600'>Loading papers...</p>
            </div>
          ) : error ? (
            <div className='bg-red-50 border-l-4 border-red-500 p-4 mb-6'>
              <div className='flex'>
                <div className='flex-shrink-0'>
                  <span className='material-symbols-outlined text-red-500'>error</span>
                </div>
                <div className='ml-3'>
                  <p className='text-sm text-red-700'>{error}</p>
                </div>
              </div>
            </div>
          ) : sortedPapers.length === 0 ? (
            <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center'>
              <span className='material-symbols-outlined text-gray-400 text-4xl mb-2'>
                search_off
              </span>
              <h3 className='text-lg font-medium text-gray-900 mb-1'>No papers found</h3>
              <p className='text-gray-500 text-sm'>
                Try adjusting your search or filter criteria
              </p>
              <button
                onClick={clearFilters}
                className='mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#d52727] hover:bg-[#b31f1f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d52727] transition-colors'
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className='space-y-4'>
              {sortedPapers.map((paper) => (
                <article 
                  key={paper.id} 
                  className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200'
                >
                  <div className='p-4 sm:p-6'>
                    <div className='flex items-start justify-between'>
                      <div className='flex-1 min-w-0'>
                        <h2 className='text-base sm:text-lg font-semibold text-gray-900 mb-1 leading-tight'>
                          <Link
                            to={`/paper/${paper.id}`}
                            className='hover:text-[#d52727] transition-colors'
                          >
                            {paper.title}
                          </Link>
                        </h2>
                        
                        <div className='mt-1 flex items-center text-xs text-gray-500'>
                          <span className='flex items-center'>
                            <span className='material-symbols-outlined text-sm mr-1'>person</span>
                            {paper.authors || 'Unknown author'}
                          </span>
                          <span className='mx-2'>•</span>
                          <span>{paper.year || 'N/A'}</span>
                        </div>

                        {paper.source && (
                          <p className='mt-2 text-sm text-gray-600 line-clamp-2'>
                            <span className='font-medium'>Published in:</span> {paper.source}
                          </p>
                        )}

                        {paper.organization && (
                          <p className='mt-1 text-sm text-gray-600 line-clamp-1'>
                            <span className='font-medium'>Affiliation:</span> {paper.organization}
                          </p>
                        )}
                      </div>
                      
                      <div className='ml-4 flex-shrink-0'>
                        <Link
                          to={`/paper/${paper.id}`}
                          className='inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full text-[#d52727] bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d52727] transition-colors'
                        >
                          View Details
                        </Link>
                      </div>
                    </div>

                    {paper.description && (
                      <p className='mt-3 text-sm text-gray-600 line-clamp-3'>
                        {paper.description}
                      </p>
                    )}

                    <div className='mt-3 flex flex-wrap gap-2'>
                      {paper.type && (
                        <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                          {paper.type}
                        </span>
                      )}
                      {paper.visibility && (
                        <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'>
                          {paper.visibility}
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              ))}

              {/* Pagination */}
              {meta.total_pages > 1 && (
                <div className='mt-8 flex flex-col sm:flex-row items-center justify-between bg-white rounded-lg shadow-sm border border-gray-200 p-4'>
                  <div className='mb-4 sm:mb-0'>
                    <p className='text-sm text-gray-700'>
                      Showing page <span className='font-medium'>{meta.page}</span> of{' '}
                      <span className='font-medium'>{meta.total_pages}</span>
                    </p>
                  </div>
                  <nav className='flex items-center space-x-2'>
                    <button
                      onClick={() => goToPage(meta.page - 1)}
                      disabled={meta.page <= 1}
                      className={`relative inline-flex items-center px-3 py-1.5 rounded-l-md border border-gray-300 text-sm font-medium ${
                        meta.page <= 1 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : 'bg-white text-gray-700 hover:bg-gray-50'
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
                                ? 'z-10 bg-[#d52727] border-[#d52727] text-white'
                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
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
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : 'bg-white text-gray-700 hover:bg-gray-50'
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
        <style>{`
          @media (max-width: 768px) {
            .md\:flex-row {
              flex-direction: column;
            }
            .md\:w-64 {
              width: 100%;
            }
            .md:h-fit {
              height: auto;
            }
          }
        `}</style>
      </div>
    </section>
  );
}
