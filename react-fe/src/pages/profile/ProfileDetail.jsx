import { useParams, Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { getAuthorById, getAuthorWorks } from "../../utils/api";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

export default function AuthorDetail() {
  const { id } = useParams();
  const [author, setAuthor] = useState(null);
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("Overview");
  const [paperPage, setPaperPage] = useState(1);
  const perPagePaper = 12;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [authorData, worksPayload] = await Promise.all([
          getAuthorById(id),
          getAuthorWorks(id),
        ]);

        setAuthor(authorData);
        setWorks(
          Array.isArray(worksPayload?.results) ? worksPayload.results : []
        );
      } catch (err) {
        setError("Gagal memuat detail peneliti.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const isLoading = loading;
  const loadError = error;

  const COLORS = [
    "#d52727",
    "#f87171",
    "#fb923c",
    "#facc15",
    "#4ade80",
    "#60a5fa",
    "#a78bfa",
    "#f472b6",
  ];

  const researchData =
    author?.counts_by_year
      ?.map((y) => ({ year: y.year, count: y.works_count }))
      ?.reverse() || [];

  const citeData =
    author?.counts_by_year
      ?.map((y) => ({ year: y.year, count: y.cited_by_count }))
      ?.reverse() || [];

  const outreachData =
    works
      ?.filter((w) => ["report", "other"].includes(w.type))
      .reduce((acc, w) => {
        const year = w.publication_year || "Unknown";
        const found = acc.find((i) => i.year === year);
        if (found) found.count++;
        else acc.push({ year, count: 1 });
        return acc;
      }, [])
      .sort((a, b) => a.year - b.year) || [];

  const sdgFromWorks = useMemo(() => {
    const counts = new Map();
    (works || []).forEach((w) => {
      const sdgs = Array.isArray(w?.sustainable_development_goals)
        ? w.sustainable_development_goals
        : [];
      sdgs.forEach((s) => {
        const rawId = typeof s?.id === "string" ? s.id : "";
        let num = null;
        const m = rawId.match(/SDG[_\/:\-\s]*?(\d{1,2})/i);
        if (m && m[1]) {
          num = parseInt(m[1], 10);
        }
        if (!num && typeof s?.display_name === "string") {
          const m2 = s.display_name.match(/^(\d{1,2})/);
          if (m2 && m2[1]) num = parseInt(m2[1], 10);
        }
        if (num && num >= 1 && num <= 17) {
          counts.set(num, (counts.get(num) || 0) + 1);
        }
      });
    });
    return Array.from(counts.entries())
      .map(([num, count]) => ({ num, count }))
      .sort((a, b) => b.count - a.count || a.num - b.num);
  }, [works]);

  const conceptData =
    author?.x_concepts?.slice(0, 8).map((c) => ({
      name: c.display_name,
      value: c.score,
    })) || [];

  const tabItems = [
    { icon: "home", label: "Overview" },
    { icon: "public", label: "Network" },
    { icon: "article", label: "Paper" },
    { icon: "bar_chart", label: "Project" },
    { icon: "emoji_events", label: "Patent" },
    { icon: "campaign", label: "Outreach" },
    { icon: "school", label: "Thesis" },
  ];

  const sortedWorks = useMemo(() => {
    return [...(Array.isArray(works) ? works : [])].sort(
      (a, b) => (b?.publication_year || 0) - (a?.publication_year || 0)
    );
  }, [works]);

  const totalPaper = sortedWorks.length;
  const totalPaperPages =
    totalPaper > 0 ? Math.ceil(totalPaper / perPagePaper) : 0;
  const safePaperPage = Math.min(
    Math.max(paperPage, 1),
    Math.max(totalPaperPages, 1)
  );
  const startPaperIndex =
    totalPaper > 0 ? (safePaperPage - 1) * perPagePaper : 0;
  const endPaperIndexExclusive = Math.min(
    startPaperIndex + perPagePaper,
    totalPaper
  );
  const visibleWorks = sortedWorks.slice(
    startPaperIndex,
    endPaperIndexExclusive
  );

  useEffect(() => {
    setPaperPage(1);
  }, [id]);

  const pageNumbers = useMemo(() => {
    const total = totalPaperPages || 0;
    const current = safePaperPage || 1;
    if (total <= 1) return [];
    const delta = 2;
    let start = Math.max(1, current - delta);
    let end = Math.min(total, current + delta);
    if (current <= 2) end = Math.min(total, 1 + delta * 2);
    if (current >= total - 1) start = Math.max(1, total - delta * 2);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [totalPaperPages, safePaperPage]);

  if (isLoading)
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <div className='inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600'></div>
          <p className='mt-4 text-gray-600'>Loading profile...</p>
        </div>
      </div>
    );
  if (loadError)
    return <div className='text-center py-20 text-red-600'>{loadError}</div>;

  return (
    <div className='bg-gray-50 min-h-screen text-gray-800 mt-24'>
      <div className='bg-[#D52727] text-white'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8'>
          <div className='mb-4'>
            <Link
              to='/profiles'
              className='inline-flex items-center text-white/90 hover:text-white transition-colors text-sm sm:text-base'
            >
              <span className='material-symbols-outlined mr-1 sm:mr-2 text-lg sm:text-xl'>
                arrow_back
              </span>
              Back to Profiles
            </Link>
          </div>

          <div className='flex flex-col sm:flex-row items-center gap-6'>
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                author.display_name
              )}&background=ffffff&color=d52727`}
              alt={author.display_name}
              className='w-28 h-28 rounded-full border-4 border-white shadow-lg'
            />
            <div>
              <h1 className='text-2xl sm:text-3xl md:text-4xl font-bold leading-tight'>
                {author.display_name}
              </h1>
              <p className='mt-1 text-sm sm:text-base opacity-90'>
                {author.last_known_institutions
                  ?.map((i) => i.display_name)
                  .join(", ") || "Tidak ada afiliasi"}
              </p>
              <div className='mt-3 sm:mt-4 flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-white/90'>
                <span className='inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 rounded-full border border-white/30'>
                  <span className='material-symbols-outlined mr-1 sm:mr-2 text-sm'>
                    equalizer
                  </span>
                  H-Index {author.summary_stats?.h_index || 0}
                </span>
                <span className='inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 rounded-full border border-white/30'>
                  <span className='material-symbols-outlined mr-1 sm:mr-2 text-sm'>
                    star
                  </span>
                  Cited {author.cited_by_count || 0}
                </span>
                <span className='inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 rounded-full border border-white/30'>
                  <span className='material-symbols-outlined mr-1 sm:mr-2 text-sm'>
                    article
                  </span>
                  Works {author.works_count || 0}
                </span>
              </div>
            </div>
          </div>

          <div className='mt-6 border-t border-white/30 pt-4 flex flex-wrap justify-between items-center text-sm'>
            <div className='flex flex-wrap gap-4 font-medium'>
              {tabItems.map((tab) => (
                <button
                  key={tab.label}
                  onClick={() => setActiveTab(tab.label)}
                  className={`flex items-center gap-1 hover:text-gray-100 ${
                    activeTab === tab.label ? "font-semibold" : ""
                  }`}
                >
                  <span className='material-symbols-outlined'>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {activeTab === "Overview" && (
        <div className='max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8'>
          <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6'>
            <h2 className='font-semibold text-lg mb-3'>Personal Profile</h2>
            <p className='text-sm text-gray-700 mb-2'>
              <strong>
                Expertise related to UN Sustainable Development Goals
              </strong>
            </p>
            <p className='text-sm text-gray-600 mb-4'>
              In 2015, UN member states agreed to 17 global Sustainable
              Development Goals (SDGs) to end poverty, protect the planet, and
              ensure prosperity for all.
            </p>

            {sdgFromWorks.length > 0 ? (
              <div className='flex flex-wrap gap-3 mb-8'>
                {sdgFromWorks.map(({ num, count }) => {
                  const fileName = `E-WEB-Goal-${String(num).padStart(
                    2,
                    "0"
                  )} 1.png`;
                  const imageUrl = `/storage/sdgs/${encodeURIComponent(
                    fileName
                  )}`;
                  return (
                    <div key={num} className='relative'>
                      <img
                        src={imageUrl}
                        alt={`SDG ${num}`}
                        className='w-16 h-16 rounded-md'
                      />
                      <span className='absolute -top-2 -right-2 bg-red-700 text-white text-xs px-1.5 py-0.5 rounded-full'>
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className='text-sm text-gray-500 mb-8'>
                Belum ada SDG terdeteksi dari karya.
              </div>
            )}

            <h2 className='text-lg font-semibold mb-4'>Concepts</h2>
            <div className='w-full h-72 flex justify-center items-center'>
              <ResponsiveContainer width='60%' height='100%'>
                <PieChart>
                  <Pie
                    data={conceptData}
                    dataKey='value'
                    nameKey='name'
                    outerRadius={100}
                    innerRadius={60}
                    paddingAngle={3}
                    label
                  >
                    {conceptData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className='mt-10 space-y-10'>
              <BarSection
                title='Research Output'
                data={researchData}
                total={author.works_count}
              />
              <BarSection
                title='Cite'
                data={citeData}
                total={author.cited_by_count}
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === "Paper" && (
        <div className='max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8'>
          <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6'>
            <h2 className='font-semibold text-lg mb-4'>Papers</h2>
            {Array.isArray(visibleWorks) && visibleWorks.length > 0 ? (
              <div className='space-y-4'>
                {visibleWorks.map((w) => {
                  const idStr = typeof w?.id === "string" ? w.id : "";
                  const idShort = idStr.includes("/")
                    ? idStr.split("/").pop()
                    : idStr;
                  const title = w?.display_name || "Untitled";
                  const year = w?.publication_year
                    ? String(w.publication_year)
                    : "N/A";
                  const venue =
                    w?.host_venue?.display_name ||
                    w?.primary_location?.source?.display_name ||
                    "-";
                  const authors = Array.isArray(w?.authorships)
                    ? w.authorships
                        .map((a) => a?.author?.display_name)
                        .filter(Boolean)
                        .join(", ")
                    : "-";
                  const insts = Array.isArray(w?.authorships)
                    ? Array.from(
                        new Set(
                          w.authorships.flatMap((a) =>
                            Array.isArray(a?.institutions)
                              ? a.institutions
                                  .map((i) => i?.display_name)
                                  .filter(Boolean)
                              : []
                          )
                        )
                      ).join(", ")
                    : "";
                  const cited = Number(w?.cited_by_count || 0) || 0;
                  const type = w?.type || "";
                  return (
                    <article
                      key={idStr}
                      className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200'
                    >
                      <div className='p-4 sm:p-6'>
                        <div className='flex items-start justify-between'>
                          <div className='flex-1 min-w-0'>
                            <h2 className='text-base sm:text-lg font-semibold text-gray-900 mb-1 leading-tight'>
                              <Link
                                to={`/paper/${idShort}`}
                                className='hover:text-[#d52727] transition-colors'
                              >
                                {title}
                              </Link>
                            </h2>
                            <div className='mt-1 flex items-center text-xs text-gray-500'>
                              <span className='flex items-center'>
                                <span className='material-symbols-outlined text-sm mr-1'>
                                  person
                                </span>
                                {authors || "Unknown author"}
                              </span>
                              <span className='mx-2'>•</span>
                              <span>{year}</span>
                            </div>
                            {venue && (
                              <p className='mt-2 text-sm text-gray-600 line-clamp-2'>
                                <span className='font-medium'>
                                  Published in:
                                </span>{" "}
                                {venue}
                              </p>
                            )}
                            {insts && (
                              <p className='mt-1 text-sm text-gray-600 line-clamp-1'>
                                <span className='font-medium'>
                                  Affiliation:
                                </span>{" "}
                                {insts}
                              </p>
                            )}
                          </div>
                          <div className='ml-4 flex-shrink-0'>
                            <Link
                              to={`/paper/${idShort}`}
                              className='inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full text-[#d52727] bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d52727] transition-colors'
                            >
                              View Details
                            </Link>
                          </div>
                        </div>
                        <div className='mt-3 flex flex-wrap gap-2'>
                          {type && (
                            <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                              {type}
                            </span>
                          )}
                          <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700'>
                            Cited by {cited}
                          </span>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className='text-sm text-gray-500'>
                Tidak ada karya yang ditemukan.
              </div>
            )}
            {totalPaperPages > 1 && (
              <div className='mt-8 flex flex-col sm:flex-row items-center justify-between bg-white rounded-lg border border-gray-200 p-4'>
                <div className='mb-4 sm:mb-0'>
                  <p className='text-sm text-gray-700'>
                    Showing page{" "}
                    <span className='font-medium'>{safePaperPage}</span> of{" "}
                    <span className='font-medium'>{totalPaperPages}</span>
                  </p>
                </div>
                <nav className='flex items-center space-x-2'>
                  <button
                    onClick={() => setPaperPage(Math.max(1, safePaperPage - 1))}
                    disabled={safePaperPage <= 1}
                    className={`relative inline-flex items-center px-3 py-1.5 rounded-l-md border border-gray-300 text-sm font-medium ${
                      safePaperPage <= 1
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
                      const isCurrent = pageNum === safePaperPage;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPaperPage(pageNum)}
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
                    onClick={() =>
                      setPaperPage(Math.min(totalPaperPages, safePaperPage + 1))
                    }
                    disabled={safePaperPage >= totalPaperPages}
                    className={`relative inline-flex items-center px-3 py-1.5 rounded-r-md border border-gray-300 text-sm font-medium ${
                      safePaperPage >= totalPaperPages
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
        </div>
      )}
    </div>
  );
}

function BarSection({ title, data, total }) {
  return (
    <div>
      <h3 className='font-semibold mb-2'>{title}</h3>
      <div className='flex justify-between items-end'>
        <ResponsiveContainer width='85%' height={200}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis dataKey='year' />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey='count' fill='#d52727' radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className='text-right text-sm'>
          <p>Total</p>
          <p className='text-lg font-semibold'>{total}</p>
        </div>
      </div>
    </div>
  );
}
