import { useEffect, useMemo, useState } from "react";
import { getSdgs, getOpenAlexFilters } from "../../utils/api";

export default function SectionSDGs() {
  const [sdgData, setSdgData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIdx, setActiveIdx] = useState(null);
  const [hoverIdx, setHoverIdx] = useState(null);
  const [sdgCountsByNumber, setSdgCountsByNumber] = useState({});
  const [sdgCountsByTitle, setSdgCountsByTitle] = useState({});
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const fetchSdgs = async () => {
      try {
        setLoading(true);
        const [sdgs, filters] = await Promise.all([
          getSdgs(),
          getOpenAlexFilters({ limit: 200 }),
        ]);

        const byNumber = {};
        const byTitle = {};
        const sdgFacet = Array.isArray(filters?.sdgs) ? filters.sdgs : [];
        for (const item of sdgFacet) {
          const rawName = (item?.name || "").trim();
          const count = Number(item?.count || 0);
          if (!rawName) continue;
          const m = rawName.match(/(?:SDG\s*)?(\d{1,2})/i);
          if (m) {
            const num = parseInt(m[1], 10);
            if (!Number.isNaN(num)) byNumber[num] = count;
          }
          const titlePart = (
            rawName.includes(":") ? rawName.split(":")[1] : rawName
          )
            .trim()
            .toLowerCase();
          if (titlePart) byTitle[titlePart] = count;
        }

        setSdgCountsByNumber(byNumber);
        setSdgCountsByTitle(byTitle);
        setSdgData(sdgs);
      } catch (error) {
        console.error("Error fetching SDGs:", error);
        setSdgData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSdgs();
  }, []);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const showIdx = !isMobile && hoverIdx !== null ? hoverIdx : activeIdx;

  const outputsCounts = useMemo(
    () =>
      sdgData.map((sdg) => {
        const byNum = sdgCountsByNumber?.[sdg.number];
        if (typeof byNum === "number") return byNum;
        const byT = sdgCountsByTitle?.[String(sdg.title || "").toLowerCase()];
        return typeof byT === "number" ? byT : 0;
      }),
    [sdgData, sdgCountsByNumber, sdgCountsByTitle]
  );
  const profileCounts = useMemo(
    () => outputsCounts.map((c) => Math.floor(c * 0.3)),
    [outputsCounts]
  );

  return (
    <section className='px-6 md:px-24'>
      <div className='max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start'>
        <div>
          <h3 className='text-[22px] md:text-2xl font-semibold text-gray-900 mb-3'>
            UN Sustainable Development Goals
          </h3>
          <p className='text-sm md:text-base leading-7 text-gray-800 max-w-xl'>
            In September 2015, 193 countries agreed to adopt a set of global
            goals to end poverty, protect the planet and ensure prosperity for
            all. Click on a goal to the right to explore how our researchers and
            their work are contributing towards achieving it.
          </p>
        </div>

        <div className='grid grid-cols-3 sm:grid-cols-6 gap-2 md:gap-3'>
          {loading
            ? Array.from({ length: 17 }).map((_, i) => (
                <div
                  key={i}
                  className='aspect-square bg-gray-200 animate-pulse rounded-sm'
                ></div>
              ))
            : sdgData.map((sdg, i) => (
                <div
                  key={sdg.sdg_id}
                  className='relative'
                  onMouseEnter={() => !isMobile && setHoverIdx(i)}
                  onMouseLeave={() => !isMobile && setHoverIdx(null)}
                >
                  <button
                    type='button'
                    onClick={() =>
                      setActiveIdx((prev) => (prev === i ? null : i))
                    }
                    className={`block w-full aspect-square overflow-hidden rounded-sm ring-offset-2 transition transform
                    ${
                      hoverIdx === i || activeIdx === i
                        ? "ring-4 ring-[#D52727] shadow-lg scale-[1.03]"
                        : "ring-0 shadow-none scale-100"
                    }`}
                    aria-label={sdg.title}
                  >
                    <img
                      src={`/${sdg.icon_url}`}
                      alt={sdg.title}
                      className='w-full h-full object-cover'
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.parentElement.innerHTML = `
                        <div class="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
                          SDG ${sdg.number}
                        </div>
                      `;
                      }}
                    />
                  </button>

                  {!isMobile && hoverIdx === i && (
                    <div
                      className={`absolute ${
                        i % 6 >= 3 ? "right-0" : "left-0"
                      } top-full mt-2 w-44 bg-white shadow-lg rounded-md overflow-hidden z-10`}
                    >
                      <div className='divide-y divide-gray-200'>
                        <div className='px-3 py-2 bg-gray-50'>
                          <h4 className='font-semibold text-gray-900 text-sm'>
                            {sdg.title}
                          </h4>
                        </div>
                        <a
                          href='#'
                          className='flex items-center gap-3 px-3 py-2 hover:bg-gray-50'
                        >
                          <span className='text-gray-600'>
                            <svg
                              xmlns='http://www.w3.org/2000/svg'
                              viewBox='0 0 24 24'
                              fill='currentColor'
                              className='w-5 h-5'
                            >
                              <path d='M7.5 6a3 3 0 106 0 3 3 0 00-6 0z' />
                              <path
                                fillRule='evenodd'
                                d='M4.5 20.25a7.5 7.5 0 1115 0 .75.75 0 01-.75.75h-13.5a.75.75 0 01-.75-.75z'
                                clipRule='evenodd'
                              />
                            </svg>
                          </span>
                          <span className='font-semibold text-[#D52727]'>
                            {profileCounts[i]}
                          </span>
                          <span className='text-sm text-gray-800'>
                            Profiles
                          </span>
                        </a>
                        <a
                          href='#'
                          className='flex items-center gap-3 px-3 py-2 hover:bg-gray-50'
                        >
                          <span className='text-gray-600'>
                            <svg
                              xmlns='http://www.w3.org/2000/svg'
                              viewBox='0 0 24 24'
                              fill='currentColor'
                              className='w-5 h-5'
                            >
                              <path d='M12 6.75a.75.75 0 01.75.75v8.69l2.72-2.72a.75.75 0 111.06 1.06l-4 4a.75.75 0 01-1.06 0l-4-4a.75.75 0 111.06-1.06l2.72 2.72V7.5A.75.75 0 0112 6.75z' />
                            </svg>
                          </span>
                          <span className='font-semibold text-[#D52727]'>
                            {outputsCounts[i]}
                          </span>
                          <span className='text-sm text-gray-800'>
                            Research output
                          </span>
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              ))}
        </div>
      </div>
      {isMobile && activeIdx !== null && sdgData[activeIdx] && (
        <div className='fixed inset-0 z-40'>
          <div
            className='absolute inset-0 bg-black/30'
            onClick={() => setActiveIdx(null)}
          />
          <div className='absolute left-0 right-0 bottom-0 bg-white rounded-t-xl shadow-2xl p-4'>
            <div className='flex items-start gap-3'>
              <img
                src={`http://localhost:8000/${sdgData[activeIdx].icon_url}`}
                alt={sdgData[activeIdx].title}
                className='w-14 h-14 object-cover rounded'
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.parentElement.innerHTML = `
                    <div class="w-14 h-14 bg-gray-200 flex items-center justify-center text-gray-500 text-xs rounded">
                      SDG ${sdgData[activeIdx].number}
                    </div>
                  `;
                }}
              />
              <div>
                <div className='text-sm text-gray-500'>
                  SDG {sdgData[activeIdx].number}
                </div>
                <div className='text-base font-semibold text-gray-900'>
                  {sdgData[activeIdx].title}
                </div>
              </div>
              <button
                className='ml-auto px-2 py-1 text-gray-600'
                onClick={() => setActiveIdx(null)}
              >
                Close
              </button>
            </div>
            <div className='mt-3 divide-y divide-gray-200 rounded-md border border-gray-200 overflow-hidden'>
              <a
                href='#'
                className='flex items-center gap-3 px-3 py-3 hover:bg-gray-50'
              >
                <span className='text-gray-600'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 24 24'
                    fill='currentColor'
                    className='w-5 h-5'
                  >
                    <path d='M7.5 6a3 3 0 106 0 3 3 0 00-6 0z' />
                    <path
                      fillRule='evenodd'
                      d='M4.5 20.25a7.5 7.5 0 1115 0 .75.75 0 01-.75.75h-13.5a.75.75 0 01-.75-.75z'
                      clipRule='evenodd'
                    />
                  </svg>
                </span>
                <span className='font-semibold text-[#D52727]'>
                  {profileCounts[activeIdx]}
                </span>
                <span className='text-sm text-gray-800'>Profiles</span>
              </a>
              <a
                href='#'
                className='flex items-center gap-3 px-3 py-3 hover:bg-gray-50'
              >
                <span className='text-gray-600'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 24 24'
                    fill='currentColor'
                    className='w-5 h-5'
                  >
                    <path d='M12 6.75a.75.75 0 01.75.75v8.69l2.72-2.72a.75.75 0 111.06 1.06l-4 4a.75.75 0 01-1.06 0l-4-4a.75.75 0 111.06-1.06l2.72 2.72V7.5A.75.75 0 0112 6.75z' />
                  </svg>
                </span>
                <span className='font-semibold text-[#D52727]'>
                  {outputsCounts[activeIdx]}
                </span>
                <span className='text-sm text-gray-800'>Research output</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
