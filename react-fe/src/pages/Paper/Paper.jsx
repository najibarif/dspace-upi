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
          className='text-blue-600 text-sm mt-2'
        >
          {showAll ? "Show less" : "See more >"}
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
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

  return (
    <section className='bg-gray-50 min-h-screen'>
      <FindPaper />

      <div className='max-w-7xl mx-auto px-6 md:px-12 py-10 flex gap-8'>
        <aside className='w-64 hidden md:block bg-white shadow-sm rounded-md p-4 h-fit'>
          <h2 className='font-semibold mb-4'>Filters for Paper</h2>

          <div className='mb-4'>
            <h4 className='font-medium text-sm mb-2'>Sort By</h4>
            <select
              className='w-full border p-2 rounded text-sm'
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
            <div className='flex items-center gap-5 text-sm'>
              <button
                className='text-gray-700'
                onClick={() => setSortAsc((v) => !v)}
              >
                Sort by title ({sortAsc ? "ascending" : "descending"}) &gt;
              </button>
            </div>
          </div>

          {loading ? (
            <div className='text-center py-10'>
              <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900'></div>
              <p className='mt-2 text-sm text-gray-600'>Loading papers...</p>
            </div>
          ) : error ? (
            <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4'>
              {error}
            </div>
          ) : sortedPapers.length === 0 ? (
            <div className='text-center py-10 text-gray-500'>
              No papers found in this collection.
            </div>
          ) : (
            <div className='space-y-6'>
              {sortedPapers.map((paper) => (
                <article key={paper.id} className='border-b pb-4'>
                  <h2 className='font-semibold text-lg text-gray-900'>
                    <Link
                      to={`/paper/${paper.id}`}
                      className='hover:text-blue-600 transition-colors'
                    >
                      {paper.title}
                    </Link>
                  </h2>
                  {paper.description && (
                    <p className='text-sm text-gray-600 mt-2 line-clamp-2'>
                      {paper.description}
                    </p>
                  )}
                  <p className='text-sm text-gray-600 mt-1'>
                    <span className='font-medium'>Source:</span>{" "}
                    {paper.source || "N/A"}
                  </p>
                  <p className='text-sm text-gray-600'>
                    <span className='font-medium'>Authors:</span>{" "}
                    {paper.authors}
                  </p>
                  <p className='text-sm text-gray-600'>
                    <span className='font-medium'>Organization:</span>{" "}
                    {paper.organization || "N/A"}
                  </p>
                  <div className='mt-2 flex flex-wrap gap-3 text-xs text-gray-500'>
                    <span>{paper.itemCount} items</span>
                    <span>•</span>
                    <span>Year: {paper.year}</span>
                  </div>
                </article>
              ))}
              {meta.total_pages > 1 && (
                <div className='flex items-center justify-center gap-2 pt-4'>
                  <button
                    className='px-3 py-1 border rounded disabled:opacity-50'
                    onClick={() => goToPage(meta.page - 1)}
                    disabled={meta.page <= 1}
                  >
                    Prev
                  </button>
                  {pageNumbers.map((p) => (
                    <button
                      key={p}
                      className={`px-3 py-1 border rounded ${
                        p === meta.page ? "bg-gray-900 text-white" : ""
                      }`}
                      onClick={() => goToPage(p)}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    className='px-3 py-1 border rounded disabled:opacity-50'
                    onClick={() => goToPage(meta.page + 1)}
                    disabled={meta.page >= meta.total_pages}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </section>
  );
}
