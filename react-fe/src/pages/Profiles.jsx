import { useMemo, useState, useEffect } from "react";
import { getEpersons, login } from "../utils/api";
import FindProfiles from "../components/profiles/FindProfiles";

// Kredensial login - ganti dengan kredensial yang valid
const DSpaceCredentials = {
  email: "naufalnajibarif@upi.edu", // Ganti dengan email admin DSpace
  password: "dspace123"            // Ganti dengan password admin DSpace
};

export default function Profiles() {
  const [query, setQuery] = useState("");
  const [sortAsc, setSortAsc] = useState(true);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch profiles from API with authentication
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        setLoading(true);
        setError(null);
        
        try {
          // Coba ambil data epersons
          const response = await getEpersons();
          console.log('API Response:', response);
          
          // Pastikan data yang diterima adalah array
          const profilesData = Array.isArray(response) 
            ? response 
            : (response._embedded?.epersons || []);
            
          setProfiles(profilesData);
        } catch (error) {
          if (error.response && error.response.status === 401) {
            // Jika tidak terautentikasi, coba login dulu
            console.log('Not authenticated, trying to login...');
            try {
              await login(DSpaceCredentials.email, DSpaceCredentials.password);
              console.log('Login successful, retrying to fetch profiles...');
              
              // Coba ambil data lagi setelah login
              const retryResponse = await getEpersons();
              const profilesData = Array.isArray(retryResponse) 
                ? retryResponse 
                : (retryResponse._embedded?.epersons || []);
                
              setProfiles(profilesData);
            } catch (loginError) {
              console.error('Login failed:', loginError);
              setError('Gagal login ke sistem. Silakan periksa kredensial admin.');
            }
          } else {
            throw error;
          }
        }
      } catch (err) {
        console.error('Error in fetchProfiles:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
        });
        setError('Gagal memuat data profil. ' + (err.response?.data?.message || ''));
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, []);

  const filtered = useMemo(() => {
    // Format data dari API ke format yang diharapkan komponen
    const formattedProfiles = profiles.map(profile => ({
      id: profile.uuid || profile.id,
      name: profile.name || 'Nama tidak tersedia',
      email: profile.email || 'Email tidak tersedia',
      faculty: profile.metadata?.['eperson.faculty']?.[0]?.value || 'Fakultas tidak tersedia',
      department: profile.metadata?.['eperson.department']?.[0]?.value || 'Departemen tidak tersedia',
      startYear: profile.metadata?.['eperson.startYear']?.[0]?.value || 'Tahun tidak tersedia',
      endYear: profile.metadata?.['eperson.endYear']?.[0]?.value || 'Tahun tidak tersedia',
    }));

    const list = formattedProfiles.filter(profile => 
      Object.values(profile).some(value => 
        String(value).toLowerCase().includes(query.toLowerCase())
      )
    );

    return sortAsc 
      ? [...list].sort((a, b) => a.name.localeCompare(b.name))
      : [...list].sort((a, b) => b.name.localeCompare(a.name));
  }, [query, sortAsc]);

  return (
    <div className='bg-[#FFFFFF] min-h-screen'>
      <FindProfiles />

      <div className='max-w-7xl mx-auto px-6 md:px-12 py-10 flex gap-8'>
        <aside className='w-64 hidden md:block bg-white shadow-sm rounded-md p-4'>
          <h3 className='font-semibold mb-4'>Filters for Profiles</h3>

          <div className='mb-6'>
            <h4 className='font-medium text-sm mb-2'>
              Sustainable Development Goals
            </h4>
            <ul className='space-y-2 text-sm text-gray-600'>
              {Array.from({ length: 3 }).map((_, i) => (
                <li key={i}>
                  <label className='flex items-start gap-2'>
                    <input type='checkbox' />
                    Dummy filter option {i + 1}
                  </label>
                </li>
              ))}
            </ul>
            <button className='text-blue-600 text-sm mt-2'>
              See more &gt;
            </button>
          </div>

          <div className='mb-6'>
            <h4 className='font-medium text-sm mb-2'>Concepts</h4>
            <ul className='space-y-2 text-sm text-gray-600'>
              {Array.from({ length: 2 }).map((_, i) => (
                <li key={i}>
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

          <div>
            <h4 className='font-medium text-sm mb-2'>Time Period</h4>
            <ul className='space-y-2 text-sm text-gray-600'>
              {Array.from({ length: 2 }).map((_, i) => (
                <li key={i}>
                  <label className='flex items-start gap-2'>
                    <input type='checkbox' />
                    Dummy period {i + 1}
                  </label>
                </li>
              ))}
            </ul>
            <button className='text-blue-600 text-sm mt-2'>
              See more &gt;
            </button>
          </div>
        </aside>

        <main className='flex-1'>
          <div className='flex items-center justify-between border-b pb-3 mb-6'>
            <p className='text-sm text-gray-600'>
              1 - 50 out of {filtered.length} results
            </p>
            <div className='flex items-center gap-5 text-sm'>
              <button
                className='text-gray-700'
                onClick={() => setSortAsc((v) => !v)}
              >
                Last Name ({sortAsc ? "ascending" : "descending"}) &gt;
              </button>
              <button className='text-blue-600'>Export search results</button>
            </div>
          </div>

          <div className='grid md:grid-cols-2 gap-x-12 gap-y-6'>
            {filtered.slice(0, 50).map((p) => (
              <article key={p.id} className='flex gap-4'>
                <div className='h-12 w-12 rounded-md bg-gray-200 shrink-0' />
                <div className='flex-1 border-b pb-4'>
                  <h2 className='font-semibold text-gray-900'>{p.name}</h2>
                  <p className='text-gray-600 text-sm'>
                    {p.faculty}, {p.department}
                  </p>
                  <div className='mt-1 flex items-center gap-3'>
                    <div className='text-xs text-gray-500'>
                      {p.startYear} | {p.endYear}
                    </div>
                    <div className='h-3 w-20 bg-gray-200 rounded' />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
