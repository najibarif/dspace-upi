import { useEffect, useMemo, useRef, useState } from "react";
import { geoEqualEarth, geoPath } from "d3-geo";
import { feature } from "topojson-client";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const dummyCollaborations = [
  {
    name: "United States",
    coordinates: [-98.35, 39.5],
    profiles: 120,
    outputs: 240,
  },
  {
    name: "United Kingdom",
    coordinates: [-1.5, 52.3],
    profiles: 75,
    outputs: 160,
  },
  { name: "Germany", coordinates: [10.45, 51.16], profiles: 88, outputs: 170 },
  { name: "Japan", coordinates: [138.25, 36.2], profiles: 66, outputs: 140 },
  {
    name: "Australia",
    coordinates: [133.77, -25.27],
    profiles: 40,
    outputs: 95,
  },
  {
    name: "Indonesia",
    coordinates: [113.92, -0.79],
    profiles: 52,
    outputs: 110,
  },
  { name: "China", coordinates: [104.2, 35.86], profiles: 90, outputs: 200 },
  { name: "India", coordinates: [78.96, 20.59], profiles: 72, outputs: 150 },
  { name: "Brazil", coordinates: [-51.9, -14.2], profiles: 45, outputs: 98 },
  {
    name: "South Africa",
    coordinates: [22.94, -30.56],
    profiles: 28,
    outputs: 64,
  },
];

export default function SectionCollaborations() {
  const [hover, setHover] = useState(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const [view, setView] = useState({ center: [0, 0], zoom: 1 });
  const [mapSize, setMapSize] = useState({ width: 980, height: 430 });

  const markers = useMemo(() => dummyCollaborations, []);

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
    return geoEqualEarth().fitSize([mapSize.width, mapSize.height], {
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

        <div
          ref={containerRef}
          className='relative overflow-hidden'
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
                  fill='#eef2f7'
                  stroke='#cfd8e3'
                  strokeWidth={1}
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
                    <circle
                      r={5.5}
                      fill='#111827'
                      stroke='#ffffff'
                      strokeWidth={2}
                      opacity={0.9}
                    />
                    <circle r={10} fill='#111827' opacity={0.08} />
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
      </div>
    </section>
  );
}
