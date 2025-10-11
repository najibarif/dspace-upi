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
  const [showMobileFilters, setShowMobileFilters] = useState(false);

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
    <div className='bg-white min-h-screen'>
      <FindProfiles query={query} setQuery={setQuery} />
      <div className='max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-6 sm:py-10'>
        {/* Mobile filter button */}
        <div className='md:hidden mb-4'>
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className='flex items-center gap-2 px-4 py-2 bg-[#d52727] text-white rounded-md text-sm font-medium hover:bg-[#b31f1f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d52727] transition-colors'
          >
            <span className='material-symbols-outlined text-lg'>filter_alt</span>
            {showMobileFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>

        <div className='flex flex-col md:flex-row gap-6 lg:gap-8'>
          {/* Sidebar */}
          <aside className={`${showMobileFilters ? 'block' : 'hidden'} md:block w-full md:w-64 bg-white shadow-sm rounded-md p-4 h-fit`}>
            <h3 className='font-semibold text-base sm:text-lg mb-4'>Filter for Profiles</h3>

            {/* SDG */}
            <div className='mb-6'>
              <h4 className='font-medium text-sm sm:text-base mb-2'>Sustainable Development Goals</h4>
              <ul className='space-y-2 text-sm sm:text-base text-gray-600'>
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
              <button className='text-[#d52727] text-xs sm:text-sm mt-2'>Show more &gt;</button>
            </div>

            {/* Concept */}
            <div className='mb-6'>
              <h4 className='font-medium text-xs sm:text-sm mb-2'>Concept</h4>
              <ul className='space-y-2 text-xs sm:text-sm text-gray-600'>
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
              <button className='text-[#d52727] text-xs sm:text-sm mt-2'>Show more &gt;</button>
            </div>

            {/* Country */}
            <div className='mb-6'>
              <h4 className='font-medium text-xs sm:text-sm mb-2'>Collaborator Country</h4>
              <ul className='space-y-2 text-xs sm:text-sm text-gray-600'>
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
              <button className='text-[#d52727] text-xs sm:text-sm mt-2'>Show more &gt;</button>
            </div>
          </aside>

          {/* Main Content */}
          <main className='flex-1'>
            <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between border-b pb-3 mb-6 gap-3'>
              <p className='text-sm text-gray-600'>
                {`Showing ${indexOfFirstProfile + 1}-${Math.min(indexOfLastProfile, filteredProfiles.length)} of ${filteredProfiles.length} results`}
              </p>
              <div className='flex items-center gap-4'>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className='border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#d52727] focus:border-[#d52727]'
                >
                  <option value=''>Sort by</option>
                  <option value='name'>Name (A-Z)</option>
                  <option value='hIndex'>H-Index (High to Low)</option>
                </select>
              </div>
            </div>

            {/* Profile List */}
            <div className='space-y-4'>
              {currentProfiles.map((profile) => (
                <div key={profile.id} className='bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow'>
                  <div className='flex gap-4'>
                    <img 
                      src={profile.image} 
                      alt={profile.name}
                      className='w-16 h-16 rounded-full object-cover border-2 border-gray-200'
                    />
                    <div className='flex-1'>
                      <h3 className='font-semibold text-gray-900'>{profile.name}</h3>
                      <div className='mt-1 space-y-1'>
                        {profile.affiliations.map((affiliation, idx) => (
                          <p key={idx} className='text-sm text-gray-600'>{affiliation}</p>
                        ))}
                      </div>
                      <div className='mt-2 flex flex-wrap items-center gap-4 text-xs text-gray-500'>
                        <span className='flex items-center'><span className='material-symbols-outlined text-sm mr-1'>calendar_today</span> {profile.activityTimeline}</span>
                        <span className='flex items-center'><span className='material-symbols-outlined text-sm mr-1'>bar_chart</span> H-Index: {profile.hIndex}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className='mt-8 flex justify-center'>
                <nav className='flex items-center gap-1'>
                  {renderPagination().map((page, idx) => (
                    <button
                      key={idx}
                      onClick={() => typeof page === 'number' && handlePageChange(page)}
                      disabled={page === '...'}
                      className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium ${
                        page === currentPage
                          ? 'bg-[#d52727] text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      } ${page === '...' ? 'cursor-default' : 'cursor-pointer'}`}
                    >
                      {page}
                    </button>
                  ))}
                </nav>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
