import { useState, useMemo } from "react";
import FindProfiles from "../components/profiles/FindProfiles";

const dummyProfiles = [
  {
    id: 1,
    name: "Ferry Iskandar",
    image: "https://via.placeholder.com/60x60/4F46E5/FFFFFF?text=FI",
    affiliations: ["Fisika Material Elektronik", "FMIPA", "Center For Sustainable Transportation Technology Development"],
    activityTimeline: "2011 ...... 2024",
    hIndex: 25
  },
  {
    id: 2,
    name: "I Gede Wenten",
    image: "https://via.placeholder.com/60x60/059669/FFFFFF?text=IGW",
    affiliations: ["Teknik Kimia", "FTI", "Research Center for Nanosciences and Nanotechnology"],
    activityTimeline: "2010 ...... 2024",
    hIndex: 18
  },
  {
    id: 3,
    name: "Brian Yuliarto",
    image: "https://via.placeholder.com/60x60/DC2626/FFFFFF?text=BY",
    affiliations: ["Fisika", "FMIPA", "Center for Energy Studies"],
    activityTimeline: "2012 ...... 2024",
    hIndex: 22
  },
  {
    id: 4,
    name: "Afriyanti Sumboja",
    image: "https://via.placeholder.com/60x60/7C3AED/FFFFFF?text=AS",
    affiliations: ["Teknik Material", "FTI", "Advanced Materials Research Group"],
    activityTimeline: "2013 ...... 2024",
    hIndex: 15
  },
  {
    id: 5,
    name: "Rino Rakhmata Mukti",
    image: "https://via.placeholder.com/60x60/EA580C/FFFFFF?text=RRM",
    affiliations: ["Teknik Kimia", "FTI", "Catalysis Research Center"],
    activityTimeline: "2011 ...... 2024",
    hIndex: 20
  },
  {
    id: 6,
    name: "Muhammad Iqbal",
    image: "https://via.placeholder.com/60x60/0891B2/FFFFFF?text=MI",
    affiliations: ["Teknik Informatika", "FIT", "Artificial Intelligence Research Lab"],
    activityTimeline: "2014 ...... 2024",
    hIndex: 12
  },
];

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
  const [hIndexRange, setHIndexRange] = useState([0, 50]);
  const [currentPage, setCurrentPage] = useState(1);
  const [profilesPerPage] = useState(20);

  const filteredProfiles = useMemo(() => {
    let filtered = dummyProfiles;
    if (query) {
      filtered = filtered.filter(profile =>
        profile.name.toLowerCase().includes(query.toLowerCase()) ||
        profile.affiliations.some(aff => aff.toLowerCase().includes(query.toLowerCase()))
      );
    }
    if (sortBy === "name") {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "hIndex") {
      filtered.sort((a, b) => b.hIndex - a.hIndex);
    }
    return filtered;
  }, [query, sortBy]);

  const indexOfLastProfile = currentPage * profilesPerPage;
  const indexOfFirstProfile = indexOfLastProfile - profilesPerPage;
  const currentProfiles = filteredProfiles.slice(indexOfFirstProfile, indexOfLastProfile);
  const totalPages = Math.ceil(filteredProfiles.length / profilesPerPage);

  const handlePageChange = (page) => setCurrentPage(page);

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }
    return pages;
  };

  return (
    <div className='bg-[#FFFFFF] min-h-screen'>
      <FindProfiles query={query} setQuery={setQuery} />

      <div className='max-w-7xl mx-auto px-6 md:px-12 py-10 flex gap-8'>
        {/* Sidebar */}
        <aside className='w-64 hidden md:block bg-white shadow-sm rounded-md p-4'>
          <h3 className='font-semibold mb-4'>Filter for Profiles</h3>

          {/* SDG */}
          <div className='mb-6'>
            <h4 className='font-medium text-sm mb-2'>Sustainable Development Goals</h4>
            <ul className='space-y-2 text-sm text-gray-600'>
              {sdgOptions.map((sdg) => (
                <li key={sdg.id}>
                  <label className='flex items-start gap-2'>
                    <input
                      type='checkbox'
                      checked={selectedSdgs.includes(sdg.id)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedSdgs([...selectedSdgs, sdg.id]);
                        else setSelectedSdgs(selectedSdgs.filter(id => id !== sdg.id));
                      }}
                    />
                    <span>{sdg.name} ({sdg.count})</span>
                  </label>
                </li>
              ))}
            </ul>
            <button className='text-[#d52727] text-sm mt-2'>Show more &gt;</button>
          </div>

          {/* Concept */}
          <div className='mb-6'>
            <h4 className='font-medium text-sm mb-2'>Concept</h4>
            <ul className='space-y-2 text-sm text-gray-600'>
              {conceptOptions.map((concept) => (
                <li key={concept.id}>
                  <label className='flex items-start gap-2'>
                    <input
                      type='checkbox'
                      checked={selectedConcepts.includes(concept.id)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedConcepts([...selectedConcepts, concept.id]);
                        else setSelectedConcepts(selectedConcepts.filter(id => id !== concept.id));
                      }}
                    />
                    <span>{concept.name} ({concept.count})</span>
                  </label>
                </li>
              ))}
            </ul>
            <button className='text-[#d52727] text-sm mt-2'>Show more &gt;</button>
          </div>

          {/* Country */}
          <div className='mb-6'>
            <h4 className='font-medium text-sm mb-2'>Collaborator Country</h4>
            <ul className='space-y-2 text-sm text-gray-600'>
              {countryOptions.map((country) => (
                <li key={country.id}>
                  <label className='flex items-start gap-2'>
                    <input
                      type='checkbox'
                      checked={selectedCountries.includes(country.id)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedCountries([...selectedCountries, country.id]);
                        else setSelectedCountries(selectedCountries.filter(id => id !== country.id));
                      }}
                    />
                    <span>{country.name} ({country.count})</span>
                  </label>
                </li>
              ))}
            </ul>
            <button className='text-[#d52727] text-sm mt-2'>Show more &gt;</button>
          </div>
        </aside>

        {/* Main */}
        <main className='flex-1'>
          <div className='flex items-center justify-between border-b pb-3 mb-6'>
            <div className='flex items-center gap-4'>
              <h3 className='font-semibold'>Filter for Profiles</h3>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className='px-3 py-1 border border-gray-300 rounded text-sm'
              >
                <option value=''>Please select Sort By</option>
                <option value='name'>Sort by Name</option>
                <option value='hIndex'>Sort by H-Index</option>
              </select>
            </div>
            <p className='text-sm text-gray-600'>
              Result {indexOfFirstProfile + 1} to {Math.min(indexOfLastProfile, filteredProfiles.length)} of {filteredProfiles.length} Page
            </p>
          </div>

          {/* Profile Grid */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8'>
            {currentProfiles.map((profile) => (
              <div key={profile.id} className='bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow'>
                <div className='flex items-start gap-4'>
                  <img src={profile.image} alt={profile.name} className='w-16 h-16 rounded-full object-cover' />
                  <div className='flex-1'>
                    <h3 className='font-semibold text-lg text-gray-900 mb-2'>{profile.name}</h3>
                    <div className='flex flex-wrap gap-1 mb-3'>
                      {profile.affiliations.map((aff, i) => (
                        <span key={i} className='inline-block px-2 py-1 text-xs bg-[#fdeaea] text-[#d52727] rounded'>
                          {aff}
                        </span>
                      ))}
                    </div>
                    <div className='text-sm text-gray-600'>
                      H-Index: <span className='font-semibold text-[#d52727]'>{profile.hIndex}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className='flex items-center justify-center gap-2'>
            {renderPagination().map((page, i) => (
              <button
                key={i}
                onClick={() => typeof page === "number" && handlePageChange(page)}
                disabled={page === "..."}
                className={`px-3 py-1 text-sm border border-gray-300 rounded ${
                  page === currentPage
                    ? "bg-[#d52727] text-white border-[#d52727]"
                    : page === "..."
                    ? "border-transparent cursor-default"
                    : "hover:bg-[#fdeaea]"
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
