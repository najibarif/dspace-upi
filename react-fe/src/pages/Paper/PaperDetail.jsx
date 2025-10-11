import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getOpenAlexWorkById } from "../../utils/api";

function getSdgNumberFromId(id) {
  const match = (id || "").match(/sdg\/(\d+)/i);
  return match ? parseInt(match[1], 10) : null;
}

function getSdgImageUrlByNumber(n) {
  if (!n) return null;
  const num = String(n).padStart(2, "0");
  return new URL(
    `../../assets/sdgs/E-WEB-Goal-${num} 1.png`,
    import.meta.url
  ).toString();
}

const decodeAbstract = (abstractInvertedIndex) => {
  if (!abstractInvertedIndex || typeof abstractInvertedIndex !== "object")
    return "";
  let maxIndex = 0;
  Object.values(abstractInvertedIndex).forEach((positions) => {
    if (Array.isArray(positions)) {
      const localMax = Math.max(...positions);
      if (localMax > maxIndex) maxIndex = localMax;
    }
  });
  const words = new Array(maxIndex + 1).fill("");
  Object.entries(abstractInvertedIndex).forEach(([word, positions]) => {
    if (Array.isArray(positions)) {
      positions.forEach((idx) => {
        words[idx] = word;
      });
    }
  });
  return words.filter(Boolean).join(" ");
};

const adaptOpenAlexWork = (work) => {
  if (!work) return null;
  const authors = Array.isArray(work.authorships)
    ? work.authorships
      .map((a) => a?.author?.display_name)
      .filter(Boolean)
      .join(", ")
    : "-";
  const upiOpenAlexIdFull = "https://openalex.org/I130218214";
  const upiShortId = "I130218214";
  const hasUpiInInstitutionIds = (ids) => {
    if (!Array.isArray(ids)) return false;
    return ids.some((x) => x === upiOpenAlexIdFull || x === upiShortId);
  };
  const isUpiInstitution = (inst) => {
    const id = inst?.id;
    return id === upiOpenAlexIdFull || id === upiShortId;
  };
  const extractShortAffiliation = (raw) => {
    if (!raw || typeof raw !== "string") return null;
    const first = raw.split(",")[0]?.trim();
    return first || null;
  };

  const upiAffiliationNames = Array.isArray(work.authorships)
    ? Array.from(
      new Set(
        work.authorships.flatMap((auth) => {
          const names = [];
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
                  const short = extractShortAffiliation(
                    aff?.raw_affiliation_string
                  );
                  if (short) {
                    names.push(short);
                    added = true;
                  }
                }
              });
            }
            if (!added && Array.isArray(auth?.raw_affiliation_strings)) {
              auth.raw_affiliation_strings.forEach((s) => {
                const short = extractShortAffiliation(s);
                if (short) names.push(short);
              });
              added = names.length > 0;
            }
            if (!added && Array.isArray(auth?.institutions)) {
              auth.institutions.forEach((inst) => {
                if (isUpiInstitution(inst) && inst?.display_name) {
                  names.push(inst.display_name);
                }
              });
            }
          }
          return names;
        })
      )
    )
    : [];

  const institutions =
    upiAffiliationNames.length > 0
      ? upiAffiliationNames.join(", ")
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
    undefined;
  const year = work?.publication_year
    ? String(work.publication_year)
    : undefined;
  const doi = work?.doi
    ? work.doi.replace(/^https?:\/\/doi.org\//i, "")
    : undefined;
  const urlFulltext =
    work?.primary_location?.landing_page_url ||
    work?.open_access?.oa_url ||
    work?.host_venue?.url ||
    undefined;
  const abstract =
    work?.abstract ||
    (work?.abstract_inverted_index
      ? decodeAbstract(work.abstract_inverted_index)
      : undefined);
  const idShort = (work?.id || "").split("/").pop();
  const openalexUrl = idShort ? `https://openalex.org/${idShort}` : undefined;
  const concepts = Array.isArray(work?.concepts)
    ? work.concepts
      .sort((a, b) => (b?.score || 0) - (a?.score || 0))
      .slice(0, 10)
      .map((c) => ({ id: c?.id, name: c?.display_name, score: c?.score }))
      .filter((c) => c.name)
    : [];
  const sdgs = Array.isArray(work?.sustainable_development_goals)
    ? work.sustainable_development_goals
      .map((s) => ({ id: s?.id, name: s?.display_name }))
      .filter((s) => s.name)
    : [];
  const oaStatus = work?.open_access?.oa_status;
  const oaIsOa = Boolean(work?.open_access?.is_oa);
  const oaUrl = work?.open_access?.oa_url || undefined;
  const pdfUrl =
    work?.primary_location?.pdf_url ||
    work?.best_oa_location?.pdf_url ||
    undefined;
  const publicationDate = work?.publication_date || undefined;
  const language = work?.language || undefined;
  const sourceIndexedInScopus =
    work?.primary_location?.source?.is_indexed_in_scopus ??
    work?.host_venue?.is_indexed_in_scopus;
  const sourceIssnL =
    work?.primary_location?.source?.issn_l || work?.host_venue?.issn_l;
  const sourceIssn =
    work?.primary_location?.source?.issn || work?.host_venue?.issn || [];
  const biblio = work?.biblio || {};
  const topics = Array.isArray(work?.topics)
    ? work.topics
      .sort((a, b) => (b?.score || 0) - (a?.score || 0))
      .slice(0, 6)
      .map((t) => ({ id: t?.id, name: t?.display_name }))
      .filter((t) => t.name)
    : [];
  const keywords = Array.isArray(work?.keywords)
    ? work.keywords
      .map((k) => ({ id: k?.id, name: k?.display_name }))
      .filter((k) => k.name)
    : [];

  return {
    id: work?.id,
    title: work?.display_name,
    authors,
    organization: institutions,
    type: work?.type,
    year,
    venue_name: venueName,
    doi,
    url_fulltext: urlFulltext,
    abstract,
    cited_by_count: work?.cited_by_count ?? 0,
    openalex_url: openalexUrl,
    concepts,
    sdgs,
    oa_status: oaStatus,
    is_oa: oaIsOa,
    oa_url: oaUrl,
    pdf_url: pdfUrl,
    publication_date: publicationDate,
    language,
    source_indexed_in_scopus: sourceIndexedInScopus,
    source_issn_l: sourceIssnL,
    source_issn: sourceIssn,
    biblio,
    topics,
    keywords,
  };
};

export default function PaperDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchPaper = async () => {
      try {
        setLoading(true);
        setError(null);
        const work = await getOpenAlexWorkById(id);
        setPaper(adaptOpenAlexWork(work));
      } catch (err) {
        console.error("Failed to fetch paper:", err);
        setError("Failed to load paper details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPaper();
    }
  }, [id]);

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <div className='inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600'></div>
          <p className='mt-4 text-gray-600'>Loading paper details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <div className='bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg max-w-md'>
            <h3 className='font-bold text-lg mb-2'>Error</h3>
            <p className='mb-4'>{error}</p>
            <button
              onClick={() => navigate("/paper")}
              className='bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded'
            >
              Back to Papers
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!paper) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <h2 className='text-2xl font-bold text-gray-800 mb-4'>
            Paper not found
          </h2>
          <button
            onClick={() => navigate("/paper")}
            className='bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
          >
            Back to Papers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-[#D52727] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8">
          {/* Back button */}
          <div className="mb-4">
            <Link
              to="/paper"
              className="inline-flex items-center text-white/90 hover:text-white transition-colors text-sm sm:text-base"
            >
              <span className="material-symbols-outlined mr-1 sm:mr-2 text-lg sm:text-xl">
                arrow_back
              </span>
              Back to Papers
            </Link>
          </div>
  
          {/* Title */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 leading-tight">
            {paper.title}
          </h1>
  
          {/* Authors */}
          <div className="mb-3 sm:mb-4">
            <p className="text-sm sm:text-base md:text-lg text-white/90">
              <span className="font-medium">Authors:</span>{" "}
              {paper.authors || "N/A"}
            </p>
          </div>
  
          {/* Organization */}
          <div className="mb-4 sm:mb-6">
            <span className="inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium bg-white/20 border border-white/30">
              <span className="material-symbols-outlined mr-1 sm:mr-2 text-sm">
                business
              </span>
              {paper.organization || "N/A"}
            </span>
          </div>
  
          {/* Metadata summary */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-white/80">
            <div className="flex items-center">
              <span className="material-symbols-outlined mr-1 sm:mr-2 text-sm">
                description
              </span>
              <span className="whitespace-nowrap">
                {paper.type_label || paper.type || "journal"}
              </span>
            </div>
  
            <div className="w-px h-4 bg-white/30"></div>
  
            <div className="flex items-center">
              <span className="material-symbols-outlined mr-1 sm:mr-2 text-sm">
                star
              </span>
              <span className="whitespace-nowrap">
                {paper.visibility_label || "Public"}
              </span>
              <span className="ml-1">(Cited {paper.cited_by_count || 0} times)</span>
            </div>
  
            <div className="w-px h-4 bg-white/30"></div>
  
            <div className="flex items-center">
              <span className="material-symbols-outlined mr-1 sm:mr-2 text-sm">
                link
              </span>
              <span className="whitespace-nowrap">
                {paper.is_oa
                  ? `Open Access (${paper.oa_status || "yes"})`
                  : "Restricted"}
              </span>
            </div>
  
            <div className="w-px h-4 bg-white/30 hidden xs:block"></div>
  
            <div className="flex items-center">
              <span className="material-symbols-outlined mr-1 sm:mr-2 text-sm">
                calendar_today
              </span>
              <span className="whitespace-nowrap">
                Year {paper.year || "N/A"}
              </span>
            </div>
  
            <div className="w-px h-4 bg-white/30 hidden sm:block"></div>
  
            <div className="flex items-center">
              <span className="material-symbols-outlined mr-1 sm:mr-2 text-sm">
                group
              </span>
              <span className="whitespace-nowrap">Group</span>
            </div>
          </div>
        </div>
      </div>
  
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              {/* Source info */}
              {paper.venue_name && (
                <p className="text-sm text-gray-600 mb-6">
                  <span className="font-medium">Source:</span> {paper.venue_name}
                </p>
              )}
  
              {/* Publication info */}
              <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-gray-600">
                {paper.publication_date && (
                  <div>
                    <span className="font-medium">Published:</span>{" "}
                    {paper.publication_date}
                  </div>
                )}
                {paper.language && (
                  <div>
                    <span className="font-medium">Language:</span>{" "}
                    {paper.language}
                  </div>
                )}
                {paper.oa_status && (
                  <div>
                    <span className="font-medium">OA Status:</span>{" "}
                    {paper.oa_status}
                  </div>
                )}
                {paper.source_indexed_in_scopus !== undefined && (
                  <div>
                    <span className="font-medium">Indexed in Scopus:</span>{" "}
                    {paper.source_indexed_in_scopus ? "Yes" : "No"}
                  </div>
                )}
                {paper.biblio?.first_page && (
                  <div>
                    <span className="font-medium">Pages:</span>{" "}
                    {paper.biblio.first_page}
                    {paper.biblio.last_page
                      ? `-${paper.biblio.last_page}`
                      : ""}
                  </div>
                )}
                {paper.source_issn_l && (
                  <div>
                    <span className="font-medium">ISSN-L:</span>{" "}
                    {paper.source_issn_l}
                  </div>
                )}
              </div>
  
              {/* Abstract */}
              {paper.abstract && (
                <div className="mb-6 sm:mb-8">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-4">
                    Abstract
                  </h2>
                  <div className="text-sm sm:text-base text-gray-700 leading-relaxed">
                    {paper.abstract}
                  </div>
                </div>
              )}
  
              {/* Keywords */}
              <div className="mb-6 sm:mb-8">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-4">
                  Keywords
                </h2>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-gray-100 text-gray-700 rounded-full text-xs sm:text-sm">
                    {paper.type_label || paper.type}
                  </span>
                  <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-gray-100 text-gray-700 rounded-full text-xs sm:text-sm">
                    Year {paper.year}
                  </span>
                  {paper.venue_name && (
                    <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-gray-100 text-gray-700 rounded-full text-xs sm:text-sm">
                      {paper.venue_name}
                    </span>
                  )}
                </div>
              </div>
  
              {/* Research Concepts */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Research Concepts
                </h2>
                {paper.concepts?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {paper.concepts.map((c) => {
                      const pct = Math.max(0, Math.min(1, Number(c.score || 0))) * 100;
                      return (
                        <div
                          key={c.id || c.name}
                          className="flex items-center gap-3 bg-gray-50 rounded-lg p-4 border border-gray-100"
                        >
                          <div className="relative w-10 h-10">
                            <svg viewBox="0 0 36 36" className="w-10 h-10">
                              <path
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="#e5e7eb"
                                strokeWidth="4"
                              />
                              <path
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="#1d4ed8"
                                strokeWidth="4"
                                strokeDasharray={`${pct}, 100`}
                              />
                            </svg>
                          </div>
                          <div className="text-gray-800 font-medium">{c.name}</div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">No concepts available</p>
                )}
              </div>
  
              {/* SDGs */}
              {paper.sdgs && paper.sdgs.length > 0 && (
                <div className="border-t border-gray-200 pt-6 mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    Sustainable Development Goals
                  </h2>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 md:gap-3">
                    {paper.sdgs.map((s) => {
                      const n = getSdgNumberFromId(s.id);
                      const img = getSdgImageUrlByNumber(n);
                      return (
                        <div key={s.id || s.name} className="relative">
                          <div
                            className="w-full aspect-square overflow-hidden rounded-sm ring-2 ring-[#D52727]/0 hover:ring-[#D52727] transition"
                            title={s.name}
                          >
                            {img ? (
                              <img
                                src={img}
                                alt={s.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-blue-50 flex items-center justify-center text-xs text-blue-700">
                                SDG {n || ""}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
  
              {/* Footer meta */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <span className="material-symbols-outlined mr-1 sm:mr-2 text-sm">
                      description
                    </span>
                    <span className="whitespace-nowrap">
                      {paper.type_label || paper.type}
                    </span>
                  </div>
                  <div className="w-px h-4 bg-gray-300 hidden xs:block"></div>
                  <div className="flex items-center">
                    <span className="material-symbols-outlined mr-1 sm:mr-2 text-sm">
                      star
                    </span>
                    <span className="whitespace-nowrap">
                      {paper.visibility_label || "Public"}
                    </span>
                    <span className="ml-1">
                      (Cited {paper.cited_by_count || 0} times)
                    </span>
                  </div>
                  <div className="w-px h-4 bg-gray-300 hidden sm:block"></div>
                  <div className="flex items-center">
                    <span className="material-symbols-outlined mr-1 sm:mr-2 text-sm">
                      link
                    </span>
                    <span className="whitespace-nowrap">cite 0</span>
                  </div>
                  <div className="w-px h-4 bg-gray-300 hidden xs:block"></div>
                  <div className="flex items-center">
                    <span className="material-symbols-outlined mr-1 sm:mr-2 text-sm">
                      calendar_today
                    </span>
                    <span className="whitespace-nowrap">
                      Year {paper.year || "N/A"}
                    </span>
                  </div>
                  <div className="w-px h-4 bg-gray-300 hidden sm:block"></div>
                  <div className="flex items-center">
                    <span className="material-symbols-outlined mr-1 sm:mr-2 text-sm">
                      menu_book
                    </span>
                    <span className="whitespace-nowrap">
                      {paper.venue_name || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
  
          {/* Right Column (Sidebar) */}
          <div className="space-y-4 sm:space-y-6">
            {/* Search */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
              <div className="flex rounded-md overflow-hidden border border-gray-300">
                <input
                  type="text"
                  placeholder="Search here..."
                  className="flex-1 px-3 py-2 outline-none text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const q = (searchQuery || "").trim();
                      const search = q ? `?q=${encodeURIComponent(q)}` : "";
                      navigate(`/paper${search}`);
                    }
                  }}
                />
                <button
                  className="bg-[#D52727] hover:bg-[#B02121] px-4 flex items-center justify-center text-white"
                  onClick={() => {
                    const q = (searchQuery || "").trim();
                    const search = q ? `?q=${encodeURIComponent(q)}` : "";
                    navigate(`/paper${search}`);
                  }}
                >
                  <span className="material-symbols-outlined text-white text-lg">
                    search
                  </span>
                </button>
              </div>
            </div>
  
            {/* Share Button */}
            <button
              className="w-full bg-[#D52727] hover:bg-[#B02121] text-white font-medium py-2 px-4 rounded-md flex items-center justify-center gap-2"
              onClick={async () => {
                try {
                  const url = window.location.href;
                  if (navigator?.share) {
                    await navigator.share({
                      title: paper.title,
                      url: url,
                    });
                  } else if (navigator?.clipboard?.writeText) {
                    await navigator.clipboard.writeText(url);
                    alert("Link copied to clipboard!");
                  } else {
                    const ta = document.createElement("textarea");
                    ta.value = url;
                    document.body.appendChild(ta);
                    ta.select();
                    document.execCommand("copy");
                    document.body.removeChild(ta);
                    alert("Link copied to clipboard!");
                  }
                } catch (err) {
                  console.error("Failed to share:", err);
                }
              }}
            >
              <span className="material-symbols-outlined">share</span>
              Share Link
            </button>
  
            {/* Access Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
              <h3 className="font-bold text-gray-900 text-sm sm:text-base mb-3 sm:mb-4">
                Access to Document
              </h3>
              <div className="space-y-2 sm:space-y-3">
                {paper.doi && (
                  <div className="flex items-center text-xs sm:text-sm">
                    <span className="material-symbols-outlined mr-1.5 sm:mr-2 text-gray-400 text-base sm:text-lg">
                      link
                    </span>
                    <a
                      href={`https://doi.org/${paper.doi}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline break-all"
                    >
                      {paper.doi}
                    </a>
                  </div>
                )}
  
                {paper.url_fulltext && (
                  <div className="flex items-center text-xs sm:text-sm">
                    <span className="material-symbols-outlined mr-1.5 sm:mr-2 text-gray-400 text-base sm:text-lg">
                      description
                    </span>
                    <a
                      href={paper.url_fulltext}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Full Text
                    </a>
                  </div>
                )}
  
                {paper.pdf_url && (
                  <div className="flex items-center text-xs sm:text-sm">
                    <span className="material-symbols-outlined mr-1.5 sm:mr-2 text-gray-400 text-base sm:text-lg">
                      picture_as_pdf
                    </span>
                    <a
                      href={paper.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Download PDF
                    </a>
                  </div>
                )}
  
                <div className="flex items-center text-xs sm:text-sm">
                  <span className="material-symbols-outlined mr-1.5 sm:mr-2 text-gray-400 text-base sm:text-lg">
                    {paper.is_oa ? "lock_open" : "lock"}
                  </span>
                  <span className="text-gray-600">
                    {paper.is_oa
                      ? `Open Access${
                          paper.oa_status ? ` (${paper.oa_status})` : ""
                        }`
                      : "Restricted Access"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
