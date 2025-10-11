import { useMemo, useState, useEffect, useCallback } from "react";
import { useNavigate } from 'react-router-dom';
import FindOrganization from "../components/organization/FindOrganization";
import { getOrganizations } from "../utils/api";

export default function Organization() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [sortAsc, setSortAsc] = useState(false);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 20,
    totalPages: 1,
    totalElements: 0,
    from: 0,
    to: 0
  });

  // Debounced search
  const [debouncedQuery, setDebouncedQuery] = useState("");

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
    <div className='bg-[#FFFFFF] min-h-screen'>
      <FindOrganization query={query} setQuery={setQuery} />

      <div className='max-w-7xl mx-auto px-6 md:px-12 py-10 flex gap-8'>
        <aside className='w-64 hidden md:block bg-white shadow-sm rounded-md p-4'>
          <h3 className='font-semibold mb-4'>Filters for Organization</h3>

          <div className='mb-6'>
            <h4 className='font-medium text-sm mb-2'>Concepts</h4>
            <ul className='space-y-2 text-sm text-gray-600'>
              {Array.from({ length: 3 }).map((_, i) => (
                <li key={`c-${i}`}>
                  <label className='flex items-start gap-2'>
                    <input type='checkbox' />
                    Dummy concept {i + 1}
                  </label>
                </li>
              ))}
            </ul>
            <button className='text-blue-600 text-sm mt-2'>
              See more &gt;
            </button>
          </div>

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
            <button className='text-blue-600 text-sm mt-2'>
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
            <button className='text-blue-600 text-sm mt-2'>
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
            <button className='text-blue-600 text-sm mt-2'>
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
            <button className='text-blue-600 text-sm mt-2'>
              See more &gt;
            </button>
          </div>
        </aside>

        {/* Results */}
        <main className='flex-1'>
          {/* Summary row */}
          <div className='flex items-center justify-between border-b pb-3 mb-6'>
            <p className='text-sm text-gray-600'>
              {pagination.from || 1} - {pagination.to || filtered.length} out of {pagination.totalElements || filtered.length} results
            </p>
            <div className='flex items-center gap-5 text-sm'>
              <button
                className='text-gray-700'
                onClick={() => setSortAsc((v) => !v)}
              >
                Last name ({sortAsc ? "ascending" : "descending"})&gt;
              </button>
              <button className='text-blue-600'>Export search results</button>
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
            <div className='space-y-6'>
              {filtered.map((item) => (
                <article 
                  key={item.id} 
                  className='border-b pb-4 cursor-pointer hover:bg-gray-50 p-4 rounded-md transition-colors'
                  onClick={() => {
                    // For now, just show an alert. You can implement detail page later
                    alert(`Organization: ${item.title}\nType: ${item.type}\nURL: ${item.url || 'No URL'}`);
                  }}
                >
                  <h2 className='font-semibold text-lg text-gray-900 hover:text-blue-600 transition-colors'>
                    {item.title}
                  </h2>
                  <p className='text-gray-600 text-sm line-clamp-2'>{item.desc}</p>
                  <div className='mt-2 text-sm text-gray-500'>
                    {item.itemCount} items • Click to view details
                  </div>
                </article>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}