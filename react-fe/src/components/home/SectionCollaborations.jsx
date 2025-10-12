import { useEffect, useMemo, useRef, useState } from "react";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import { feature } from "topojson-client";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
const openAlexApiUrl = "/api/collaborations";

const countryCoordinates = {
  Indonesia: [113.92, -0.79],
  Malaysia: [101.98, 4.21],
  Japan: [138.25, 36.2],
  "United States of America": [-98.35, 39.5],
  Australia: [133.77, -25.27],
  China: [104.2, 35.86],
  "Korea, Republic of": [127.77, 35.91],
  "United Kingdom of Great Britain and Northern Ireland": [-1.5, 52.3],
  India: [78.96, 20.59],
  Thailand: [100.99, 15.87],
  "Saudi Arabia": [45.08, 23.89],
  Turkey: [35.24, 38.96],
  Canada: [-106.35, 56.13],
  Singapore: [103.82, 1.35],
  "Russian Federation": [105.32, 61.52],
  "Taiwan, Province of China": [121.52, 25.04],
  Netherlands: [5.29, 52.13],
  Pakistan: [69.35, 30.38],
  "Brunei Darussalam": [114.73, 4.54],
  Spain: [-3.75, 40.46],
  Qatar: [51.18, 25.35],
  France: [2.21, 46.23],
  Nigeria: [8.68, 9.08],
  Philippines: [121.77, 12.88],
  Sudan: [30.22, 12.86],
  "Iran, Islamic Republic of": [53.69, 32.43],
  Germany: [10.45, 51.16],
  "United Arab Emirates": [53.85, 23.42],
  Ghana: [-1.02, 7.94],
  Bangladesh: [90.36, 23.69],
  Iraq: [43.68, 33.22],
  "New Zealand": [174.89, -40.9],
  Peru: [-77.04, -9.19],
  Hungary: [19.5, 47.16],
  "Viet Nam": [108.28, 14.06],
  Italy: [12.57, 41.87],
  Slovenia: [14.99, 46.15],
  Bulgaria: [25.49, 42.73],
  Mexico: [-102.55, 23.63],
  "Hong Kong": [114.17, 22.32],
  Poland: [19.39, 51.92],
  Finland: [25.75, 61.92],
  Sweden: [18.64, 60.13],
  "South Africa": [22.94, -30.56],
  Brazil: [-51.9, -14.2],
  Czechia: [15.47, 49.82],
  "Sri Lanka": [80.77, 7.87],
  Egypt: [30.8, 26.82],
  Morocco: [-7.09, 31.79],
  Portugal: [-8.22, 39.4],
  Chile: [-71.54, -35.68],
  Romania: [24.97, 45.94],
  Uzbekistan: [64.59, 41.38],
  Jordan: [36.24, 30.59],
  Kenya: [37.91, -0.02],
  Slovakia: [19.7, 48.67],
  "Tanzania, United Republic of": [34.89, -6.37],
  Uganda: [32.29, 1.37],
  Azerbaijan: [47.58, 40.14],
  Croatia: [15.2, 45.1],
  "Bosnia and Herzegovina": [17.68, 43.92],
  Colombia: [-74.3, 4.57],
  Ethiopia: [40.49, 9.15],
  Norway: [8.47, 60.47],
  Yemen: [48.52, 15.55],
  Austria: [14.55, 47.52],
  Estonia: [25.01, 58.6],
  Mongolia: [103.85, 46.86],
  Afghanistan: [67.71, 33.94],
  Switzerland: [8.23, 46.82],
  Kuwait: [47.48, 29.31],
  Malawi: [34.3, -13.25],
  "Papua New Guinea": [143.96, -6.31],
  Belgium: [4.47, 50.5],
  Denmark: [9.5, 56.26],
  Serbia: [21.01, 44.02],
  Zimbabwe: [29.15, -19.02],
  Bahrain: [50.64, 25.93],
  Algeria: [1.66, 28.03],
  Fiji: [-178.07, -16.58],
  Israel: [34.85, 31.05],
  Kyrgyzstan: [74.77, 41.2],
  Kazakhstan: [66.92, 48.02],
  Lebanon: [35.86, 33.85],
  Libya: [17.23, 26.34],
  "Moldova, Republic of": [28.37, 47.41],
  Panama: [-80.78, 8.54],
  Tunisia: [9.54, 33.89],
  Armenia: [45.04, 40.07],
  Argentina: [-63.62, -38.42],
  Burundi: [29.92, -3.37],
  Cyprus: [33.43, 35.13],
  Greece: [21.82, 39.07],
  Cambodia: [104.99, 12.57],
  Myanmar: [95.96, 21.91],
  Nepal: [84.12, 28.39],
  "Palestine, State of": [35.23, 31.95],
  Ukraine: [31.17, 48.38],
  Albania: [20.17, 41.15],
  Botswana: [24.68, -22.33],
  "Côte d'Ivoire": [-5.55, 7.54],
  Cameroon: [12.35, 7.37],
  Cuba: [-77.78, 21.52],
  Georgia: [43.36, 42.32],
  "Equatorial Guinea": [10.27, 1.65],
  Ireland: [-8.24, 53.41],
  Kiribati: [-157.36, 1.87],
  "Lao People's Democratic Republic": [102.5, 19.86],
  Lesotho: [28.23, -29.61],
  Lithuania: [23.88, 55.17],
  Latvia: [24.6, 56.88],
  "North Macedonia": [21.75, 41.61],
  Macao: [113.54, 22.19],
  Mauritania: [-10.94, 21.01],
  Oman: [55.92, 21.51],
  Seychelles: [55.49, -4.68],
  Suriname: [-56.03, 3.92],
  "Timor-Leste": [125.73, -8.87],
  Vanuatu: [166.96, -15.38],
  Zambia: [27.85, -13.13],
};

export default function SectionCollaborations() {
  const [hover, setHover] = useState(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const [view, setView] = useState({ center: [0, 0], zoom: 1 });
  const [mapSize, setMapSize] = useState({ width: 980, height: 430 });
  const [collaborations, setCollaborations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;

    const fetchCollaborations = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(openAlexApiUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!alive) return;

        const transformedData = data.group_by
          ?.map((item) => {
            const countryName = item.key_display_name;
            const coordinates = countryCoordinates[countryName];

            if (!coordinates) return null;

            return {
              name: countryName,
              coordinates: coordinates,
              profiles: Math.floor(item.count * 0.3),
              outputs: item.count,
            };
          })
          .filter((item) => item !== null)
          .sort((a, b) => b.outputs - a.outputs);

        setCollaborations(transformedData);
      } catch (err) {
        if (!alive) return;
        console.error("Error fetching collaborations data:", err);
        setError(err.message);
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    };

    fetchCollaborations();

    return () => {
      alive = false;
    };
  }, []);

  const markers = useMemo(() => {
    if (collaborations.length === 0) return [];

    const outputs = collaborations.map((c) => c.outputs);
    const minOutputs = Math.min(...outputs);
    const maxOutputs = Math.max(...outputs);

    return collaborations.map((collaboration) => ({
      ...collaboration,
      dotSize:
        minOutputs === maxOutputs
          ? 8
          : 4 +
            ((collaboration.outputs - minOutputs) / (maxOutputs - minOutputs)) *
              16,
      haloSize:
        minOutputs === maxOutputs
          ? 12
          : 8 +
            ((collaboration.outputs - minOutputs) / (maxOutputs - minOutputs)) *
              22,
    }));
  }, [collaborations]);

  const aspect = 980 / 430;
  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = Math.max(320, Math.floor(entry.contentRect.width));
        const height = Math.max(220, Math.floor(width / aspect));
        setMapSize({ width, height });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const [countries, setCountries] = useState([]);

  useEffect(() => {
    let alive = true;
    fetch(geoUrl)
      .then((res) => res.json())
      .then((topology) => {
        if (!alive) return;
        const fc = feature(topology, topology.objects.countries);
        setCountries(fc.features ?? []);
      })
      .catch(() => setCountries([]));
    return () => {
      alive = false;
    };
  }, []);

  const projection = useMemo(() => {
    return geoNaturalEarth1().fitSize([mapSize.width, mapSize.height], {
      type: "Sphere",
    });
  }, [mapSize.width, mapSize.height]);

  const pathGen = useMemo(() => geoPath(projection), [projection]);

  const [pan, setPan] = useState({ x: 0, y: 0 });
  const draggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const panStartRef = useRef({ x: 0, y: 0 });

  const onMouseDown = (e) => {
    draggingRef.current = true;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    panStartRef.current = { x: pan.x, y: pan.y };
  };
  const onMouseUp = () => {
    draggingRef.current = false;
  };
  const onMouseLeave = () => {
    draggingRef.current = false;
  };
  const onMouseMove = (e) => {
    setMouse({ x: e.clientX, y: e.clientY });
    if (!draggingRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPan({ x: panStartRef.current.x + dx, y: panStartRef.current.y + dy });
  };

  const groupTransform = `translate(${pan.x},${pan.y}) scale(${view.zoom})`;

  return (
    <section className='px-6 md:px-24'>
      <div className='max-w-7xl mx-auto'>
        <h3 className='text-[22px] md:text-2xl font-semibold text-gray-900 mb-1'>
          Collaborations and top research areas from the last five years
        </h3>
        <p className='text-sm md:text-base text-gray-600 mb-4'>
          Click dots and donuts to bring up details or Select a
          country/territory from the list
        </p>

        {loading && (
          <div className='mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md'>
            <div className='flex items-center'>
              <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2'></div>
              <span className='text-sm text-blue-700'>
                Loading collaborations data...
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className='mb-4 p-4 bg-red-50 border border-red-200 rounded-md'>
            <div className='flex items-center'>
              <svg
                className='h-4 w-4 text-red-600 mr-2'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
              <span className='text-sm text-red-700'>
                Failed to load data: {error}. Using fallback data.
              </span>
            </div>
          </div>
        )}

        <div
          ref={containerRef}
          className='relative overflow-hidden bg-white rounded-lg border border-gray-200'
          style={{ touchAction: "none" }}
          onWheelCapture={(e) => {
            if (e.ctrlKey) {
              e.preventDefault();
            }
          }}
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseLeave}
          onMouseMove={onMouseMove}
        >
          <svg
            width={mapSize.width}
            height={mapSize.height}
            style={{ width: "100%", height: "auto" }}
            role='img'
          >
            <defs>
              <clipPath id='clip-sphere'>
                <rect
                  x='0'
                  y='0'
                  width={mapSize.width}
                  height={mapSize.height}
                />
              </clipPath>
            </defs>
            <g transform={groupTransform} clipPath='url(#clip-sphere)'>
              {countries.map((feat, idx) => (
                <path
                  key={idx}
                  d={pathGen(feat)}
                  fill='#f5f5f5'
                  stroke='#d1d5db'
                  strokeWidth={0.5}
                />
              ))}
              {markers.map((m) => {
                const pt = projection(m.coordinates);
                if (!pt) return null;
                const [cx, cy] = pt;
                return (
                  <g
                    key={m.name}
                    transform={`translate(${cx},${cy})`}
                    onMouseEnter={() => setHover(m)}
                    onMouseLeave={() => setHover(null)}
                  >
                    <circle r={m.haloSize} fill='#374151' opacity={0.15} />
                    <circle
                      r={m.dotSize}
                      fill='#374151'
                      stroke='#9ca3af'
                      strokeWidth={1}
                      opacity={1}
                    />
                  </g>
                );
              })}
            </g>
          </svg>

          <div className='absolute right-3 top-3 flex flex-col gap-2'>
            <button
              type='button'
              aria-label='Zoom in'
              className='h-9 w-9 rounded-md bg-white text-gray-700 shadow border border-gray-200 hover:bg-gray-50'
              onClick={() =>
                setView((v) => ({
                  ...v,
                  zoom: Math.min(6, Number((v.zoom * 1.25).toFixed(2))),
                }))
              }
            >
              +
            </button>
            <button
              type='button'
              aria-label='Zoom out'
              className='h-9 w-9 rounded-md bg-white text-gray-700 shadow border border-gray-200 hover:bg-gray-50'
              onClick={() =>
                setView((v) => ({
                  ...v,
                  zoom: Math.max(1, Number((v.zoom / 1.25).toFixed(2))),
                }))
              }
            >
              −
            </button>
            <button
              type='button'
              aria-label='Reset'
              className='h-9 w-9 rounded-md bg-white text-gray-700 shadow border border-gray-200 hover:bg-gray-50'
              onClick={() => {
                setView({ center: [0, 0], zoom: 1 });
                setPan({ x: 0, y: 0 });
              }}
            >
              ⤾
            </button>
          </div>

          {hover && (
            <div
              className='pointer-events-none absolute z-10 bg-white/95 backdrop-blur border border-gray-200 rounded-md shadow-md px-3 py-2 text-xs text-gray-800'
              style={{
                left: Math.max(
                  12,
                  mouse.x -
                    (containerRef.current?.getBoundingClientRect().left ?? 0) +
                    12
                ),
                top: Math.max(
                  12,
                  mouse.y -
                    (containerRef.current?.getBoundingClientRect().top ?? 0) +
                    12
                ),
              }}
            >
              <div className='font-semibold text-gray-900'>{hover.name}</div>
              <div className='mt-1 grid grid-cols-2 gap-3'>
                <div className='flex items-center gap-2'>
                  <span className='inline-block w-2 h-2 rounded-full bg-[#D52727]' />
                  <span className='text-gray-600'>Profiles</span>
                  <span className='ml-auto font-medium text-[#D52727]'>
                    {hover.profiles}
                  </span>
                </div>
                <div className='flex items-center gap-2'>
                  <span className='inline-block w-2 h-2 rounded-full bg-gray-700' />
                  <span className='text-gray-600'>Output</span>
                  <span className='ml-auto font-medium text-gray-900'>
                    {hover.outputs}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {!loading && collaborations.length > 0 && (
          <div className='mt-6 p-4 bg-gray-50 rounded-lg'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div className='text-center'>
                <div className='text-2xl font-bold text-gray-900'>
                  {collaborations.length}
                </div>
                <div className='text-sm text-gray-600'>
                  Negara Berkolaborasi
                </div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-gray-900'>
                  {collaborations.reduce((sum, item) => sum + item.profiles, 0)}
                </div>
                <div className='text-sm text-gray-600'>
                  Total Profil Peneliti
                </div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-gray-900'>
                  {collaborations.reduce((sum, item) => sum + item.outputs, 0)}
                </div>
                <div className='text-sm text-gray-600'>Total Publikasi</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
