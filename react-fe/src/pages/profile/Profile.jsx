import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import FindProfiles from "../../components/profiles/FindProfiles";

const stringToColor = (string) => {
  let hash = 0;
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 50%)`;
};

const sdgOptions = [
  { id: 1, name: "GOAL 9: Industry, Innovation and Infrastructure", count: 1377 },
  { id: 2, name: "GOAL 4: Quality Education", count: 892 },
  { id: 3, name: "GOAL 3: Good Health and Well-Being", count: 654 },
];

const conceptOptions = [
  { id: 1, name: "Geological Evolution of South China Sea", count: 202 },
  { id: 2, name: "Machine Learning Applications", count: 187 },
  { id: 3, name: "Renewable Energy Systems", count: 165 },
];

const countryOptions = [
  { id: 1, name: "Indonesia", count: 1614 },
  { id: 2, name: "Malaysia", count: 234 },
  { id: 3, name: "Singapore", count: 189 },
];

export default function Profile() {
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [selectedSdgs, setSelectedSdgs] = useState([]);
  const [selectedConcepts, setSelectedConcepts] = useState([]);
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        setLoading(true);
        const apiUrl = `https://api.openalex.org/authors?filter=last_known_institutions.ror:https://ror.org/044b0xj37${query ? `,display_name.search:${query}` : ''
          }&per_page=100&sort=${sortBy === "name"
            ? "display_name"
            : sortBy === "hIndex"
              ? "summary_stats.h_index:desc"
              : "works_count:desc"
          }`;

        const response = await fetch(apiUrl, { headers: { Accept: "application/json" } });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();

        setAuthors(
          data.results.map((a) => ({
            id: a.id.split("/").pop(),
            name: a.display_name,
            image: `https://ui-avatars.com/api/?name=${encodeURIComponent(
              a.display_name
            )}&background=${stringToColor(a.display_name).substring(1)}&color=fff`,
            affiliations: a.last_known_institutions?.map((i) => i.display_name),
            hIndex: a.summary_stats?.h_index || 0,
            worksCount: a.works_count || 0,
            citedByCount: a.cited_by_count || 0,
          }))
        );
      } catch (e) {
        setError("Gagal memuat data peneliti. Silakan coba beberapa saat lagi.");
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchAuthors, 400);
    return () => clearTimeout(timer);
  }, [query, sortBy]);

  const filteredProfiles = useMemo(() => {
    let filtered = authors;
    if (query) {
      const q = query.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.affiliations?.some((a) => a.toLowerCase().includes(q))
      );
    }
    if (sortBy === "name") filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === "hIndex") filtered = [...filtered].sort((a, b) => b.hIndex - a.hIndex);
    return filtered;
  }, [authors, query, sortBy]);

  return (
    <div className="bg-gray-50 min-h-screen">
      <FindProfiles query={query} setQuery={setQuery} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-8">
        {/* Mobile Filter Button */}
        <div className="md:hidden mb-4">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-[#d52727] text-white rounded-md text-sm font-medium hover:bg-[#b31f1f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d52727] transition-colors"
          >
            <span className="material-symbols-outlined mr-1 sm:mr-2 text-lg sm:text-xl">
              filter_alt
            </span>
            {showMobileFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className={`md:w-64 w-full bg-white rounded-xl shadow-sm border border-gray-100 p-5 h-fit
            ${showMobileFilters ? "block mb-4" : "hidden md:block"}`}>
            <h3 className="font-semibold text-lg mb-4 text-gray-800">Filter Authors</h3>
            <div className="space-y-6 text-sm text-gray-700">
              {[["SDGs", sdgOptions, selectedSdgs, setSelectedSdgs],
              ["Concepts", conceptOptions, selectedConcepts, setSelectedConcepts],
              ["Countries", countryOptions, selectedCountries, setSelectedCountries]].map(
                ([title, options, selected, setSelected], i) => (
                  <div key={i}>
                    <h4 className="font-medium mb-2">{title}</h4>
                    <ul className="space-y-1">
                      {options.map((opt) => (
                        <li key={opt.id}>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selected.includes(opt.id)}
                              onChange={(e) =>
                                e.target.checked
                                  ? setSelected([...selected, opt.id])
                                  : setSelected(selected.filter((id) => id !== opt.id))
                              }
                              className="text-[#d52727] rounded"
                            />
                            <span>{opt.name}</span>
                          </label>
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              )}
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 max-w-3xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b pb-3">
              <p className="text-gray-600 text-sm">{filteredProfiles.length} peneliti ditemukan</p>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-[#d52727] focus:border-[#d52727]"
              >
                <option value="">Urutkan</option>
                <option value="name">Nama (A-Z)</option>
                <option value="hIndex">H-Index (Tertinggi)</option>
              </select>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-60">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#d52727]"></div>
              </div>
            ) : error ? (
              <div className="text-center text-red-600 py-8">{error}</div>
            ) : filteredProfiles.length === 0 ? (
              <div className="text-center text-gray-500 py-8">Tidak ada peneliti ditemukan.</div>
            ) : (
              <div className="grid grid-cols-1 gap-5">
                {filteredProfiles.map((profile) => (
                  <Link
                    to={`/profile/${profile.id}`}
                    key={profile.id}
                    className="block bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      <img
                        src={profile.image}
                        alt={profile.name}
                        className="w-16 h-16 rounded-full border-2 border-gray-200"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-base">{profile.name}</h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {profile.affiliations?.join(", ") || "No affiliation info"}
                        </p>
                        <div className="flex gap-4 mt-3 text-xs text-gray-600">
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-base">menu_book</span>
                            {profile.worksCount} publikasi
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-base">trending_up</span>
                            {profile.citedByCount} sitasi
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-base">emoji_events</span>
                            H-Index {profile.hIndex}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
