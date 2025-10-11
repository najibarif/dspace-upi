import { useMemo, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOrganizations } from '../utils/api';
import FindOrganization from '../components/organization/FindOrganization';

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
    { name: "Lorem Ipsum Type 1", count: 177 },
    { name: "Lorem Ipsum Type 2", count: 150 },
    { name: "Lorem Ipsum Type 3", count: 120 },
    { name: "Lorem Ipsum Type 4", count: 95 },
    { name: "Lorem Ipsum Type 5", count: 80 },
  ],
  sjr: [
    { name: "Q-None", count: 18855 },
    { name: "Q1", count: 3381 },
    { name: "Q3", count: 1739 },
    { name: "Q4", count: 1120 },
  ],
};

const SidebarSection = ({ title, items, showAll, onToggleShowAll }) => {
  const visibleItems = showAll ? items : items.slice(0, 5);
  
  return (
    <div className='mb-6'>
      <h4 className='font-medium text-sm mb-2'>{title}</h4>
      <ul className='space-y-2 text-sm text-gray-600'>
        {visibleItems.map((item, index) => (
          <li key={index} className='group'>
            <label className='flex items-center justify-between w-full hover:bg-gray-50 p-1 rounded'>
              <div className='flex items-center gap-2 min-w-0'>
                <input 
                  type='checkbox' 
                  className='flex-shrink-0 rounded border-gray-300 text-[#d52727]' 
                />
                <span className='truncate' title={item.name}>
                  {item.name}
                </span>
              </div>
              <span className='flex-shrink-0 text-gray-400 text-xs ml-2'>
                {item.count.toLocaleString()}
              </span>
            </label>
          </li>
        ))}
      </ul>
      {items.length > 5 && (
        <button
          onClick={onToggleShowAll}
          className='text-[#d52727] hover:text-[#b31f1f] text-sm mt-2 transition-colors flex items-center'
        >
          {showAll ? (
            <>
              <span className='material-symbols-outlined text-base mr-1'>expand_less</span>
              Show less
            </>
          ) : (
            <>
              <span className='material-symbols-outlined text-base mr-1'>expand_more</span>
              See more
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default function Organization() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  // State for search and filters
  const [error, setError] = useState(null);
  const [sortAsc, setSortAsc] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [expandedSections, setExpandedSections] = useState({
    sdg: false,
    concepts: false,
    profile: false,
    type: false,
    sjr: false
  });
  const [organizations, setOrganizations] = useState([]);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 20,
    totalPages: 1,
    totalElements: 0,
    from: 0,
    to: 0
  });

  // Fetch organizations
  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        setLoading(true);
        const response = await getOrganizations({
          page: pagination.page,
          size: pagination.size,
          sort: sortAsc ? 'name,asc' : 'name,desc',
          query: debouncedQuery
        });
        setOrganizations(response.content || []);
        setPagination(prev => ({
          ...prev,
          totalPages: response.totalPages || 1,
          totalElements: response.totalElements || 0,
          from: response.number * response.size + 1,
          to: Math.min((response.number + 1) * response.size, response.totalElements)
        }));
      } catch (err) {
        setError(err.message || 'Failed to fetch organizations');
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizations();
  }, [pagination.page, pagination.size, sortAsc, debouncedQuery]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  // Fetch organizations from the API
  const fetchOrganizations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getOrganizations({
        page: pagination.page + 1, // Laravel uses 1-based pagination
        size: pagination.size,
        search: debouncedQuery || undefined
      });
      
      setOrganizations(response.data || []);
      
      // Update pagination info
      if (response.pagination) {
        setPagination(prev => ({
          ...prev,
          totalPages: response.pagination.last_page,
          totalElements: response.pagination.total,
          from: response.pagination.from,
          to: response.pagination.to
        }));
      }
    } catch (err) {
      console.error('Error fetching organizations:', err);
      setError('Failed to load organizations. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.size, debouncedQuery]);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  const filtered = useMemo(() => {
    let list = organizations.map(org => ({
      id: org.org_id,
      title: org.name,
      desc: `${org.type} organization`,
      itemCount: 0, // We can add this field later if needed
      type: org.type,
      url: org.url
    }));

    // Since search is now handled by the API, we only need to sort
    return list.sort((a, b) =>
      sortAsc 
        ? (a.title || '').localeCompare(b.title || '') 
        : (b.title || '').localeCompare(a.title || '')
    );
  }, [organizations, sortAsc]);

  return (
    <div className='bg-white min-h-screen'>
      <FindOrganization query={query} setQuery={setQuery} />

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
          {/* Sidebar - Hidden on mobile unless toggled */}
          <aside className={`${showMobileFilters ? 'block' : 'hidden'} md:block w-full md:w-64 bg-white shadow-sm rounded-md p-4 h-fit`}>
          <h2 className='font-semibold mb-4'>Filters for Organization</h2>
          
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
            showAll={expandedSections.sdg}
            onToggleShowAll={() => toggleSection('sdg')}
          />
          
          <SidebarSection
            title='Concepts'
            items={sidebarData.concepts}
            showAll={expandedSections.concepts}
            onToggleShowAll={() => toggleSection('concepts')}
          />
          
          <SidebarSection
            title='Profile'
            items={sidebarData.profile}
            showAll={expandedSections.profile}
            onToggleShowAll={() => toggleSection('profile')}
          />
          
          <SidebarSection
            title='Type'
            items={sidebarData.type}
            showAll={expandedSections.type}
            onToggleShowAll={() => toggleSection('type')}
          />
          
          <SidebarSection
            title='SJR'
            items={sidebarData.sjr}
            showAll={expandedSections.sjr}
            onToggleShowAll={() => toggleSection('sjr')}
          />

          <div className='mb-6'>
            <h4 className='font-medium text-sm mb-2'>
              Sustainable Development Goals
            </h4>
            <ul className='space-y-2 text-sm text-gray-600'>
              {Array.from({ length: 2 }).map((_, i) => (
                <li key={`s-${i}`}>
                  <label className='flex items-start gap-2'>
                    <input type='checkbox' />
                    Dummy SDG {i + 1}
                  </label>
                </li>
              ))}
            </ul>
            <button className='text-[#d52727] hover:text-[#b31f1f] text-sm mt-2 transition-colors'>
              See more &gt;
            </button>
          </div>

          <div className='mb-6'>
            <h4 className='font-medium text-sm mb-2'>Network Affiliation</h4>
            <ul className='space-y-2 text-sm text-gray-600'>
              {Array.from({ length: 2 }).map((_, i) => (
                <li key={`na-${i}`}>
                  <label className='flex items-start gap-2'>
                    <input type='checkbox' />
                    Dummy affiliation {i + 1}
                  </label>
                </li>
              ))}
            </ul>
            <button className='text-[#d52727] hover:text-[#b31f1f] text-sm mt-2 transition-colors'>
              See more &gt;
            </button>
          </div>

          <div className='mb-6'>
            <h4 className='font-medium text-sm mb-2'>Network Country</h4>
            <ul className='space-y-2 text-sm text-gray-600'>
              {Array.from({ length: 2 }).map((_, i) => (
                <li key={`nc-${i}`}>
                  <label className='flex items-start gap-2'>
                    <input type='checkbox' />
                    Dummy country {i + 1}
                  </label>
                </li>
              ))}
            </ul>
            <button className='text-[#d52727] hover:text-[#b31f1f] text-sm mt-2 transition-colors'>
              See more &gt;
            </button>
          </div>

          <div>
            <h4 className='font-medium text-sm mb-2'>Type</h4>
            <ul className='space-y-2 text-sm text-gray-600'>
              {Array.from({ length: 2 }).map((_, i) => (
                <li key={`t-${i}`}>
                  <label className='flex items-start gap-2'>
                    <input type='checkbox' />
                    Dummy type {i + 1}
                  </label>
                </li>
              ))}
            </ul>
            <button className='text-[#d52727] hover:text-[#b31f1f] text-sm mt-2 transition-colors'>
              See more &gt;
            </button>
          </div>
        </aside>

        {/* Results */}
        <main className='flex-1'>
          {/* Summary row */}
          <div className='flex flex-col xs:flex-row items-start xs:items-center justify-between pb-4 border-b border-gray-200 mb-6'>
            <p className='text-sm text-gray-600'>
              {pagination.from || 1} - {pagination.to || filtered.length} of {pagination.totalElements || filtered.length} results
            </p>
            <div className='flex items-center gap-4 text-sm mt-2 xs:mt-0'>
              <button className='text-[#d52727] hover:text-[#b31f1f] transition-colors flex items-center'>
                <span className='material-symbols-outlined text-base mr-1'>download</span>
                Export
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className='text-center py-10'>
              <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900'></div>
              <p className='mt-2 text-sm text-gray-600'>Loading organizations...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4'>
              {error}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filtered.length === 0 && (
            <div className='text-center py-10 text-gray-500'>
              No organizations found. Try adjusting your search.
            </div>
          )}
          {/* List */}
          {!loading && !error && filtered.length > 0 && (
            <div className='space-y-4'>
              {filtered.map((org) => (
                <div 
                  key={org.id}
                  className='border-b border-gray-200 py-3 last:border-b-0 last:pb-0 hover:bg-gray-50 rounded-md transition-colors cursor-pointer'
                >
                  <div className='flex items-center justify-between px-2'>
                    <div className='min-w-0'>
                      <h3 className='text-sm font-medium text-gray-900'>{org.title}</h3>
                      <div className='mt-1 flex items-center text-xs text-gray-500'>
                        <span className='material-symbols-outlined text-sm mr-1'>location_on</span>
                        <span>Indonesia</span>
                      </div>
                    </div>
                    <span className='material-symbols-outlined text-gray-400'>chevron_right</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
        </div>
      </div>
    </div>
  );
}