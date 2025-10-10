import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchCommunities } from '../utils/api';

export default function CommunityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [community, setCommunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCommunity = async () => {
      try {
        setLoading(true);
        const communities = await fetchCommunities();
        const communityData = Array.isArray(communities) 
          ? communities.find(com => (com.id === id) || (com.uuid === id))
          : null;
          
        if (!communityData) {
          throw new Error('Komunitas tidak ditemukan');
        }
        
        setCommunity({
          id: communityData.id || communityData.uuid,
          name: communityData.name,
          description: communityData.metadata?.['dc.description.abstract']?.[0]?.value || 'Tidak ada deskripsi',
          itemCount: communityData.numberItems || 0,
        });
        setError(null);
      } catch (err) {
        console.error('Error:', err);
        setError(err.message || 'Terjadi kesalahan saat memuat data');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCommunity();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-md w-full" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
          <button 
            onClick={() => navigate(-1)}
            className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Komunitas tidak ditemukan</h2>
          <button 
            onClick={() => navigate('/organization')}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Kembali ke Daftar Organisasi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 bg-gray-50">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl leading-6 font-bold text-gray-900">
                {community.name}
              </h1>
              <span className="px-3 py-1 text-sm font-semibold text-blue-800 bg-blue-100 rounded-full">
                {community.itemCount} Item
              </span>
            </div>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Detail Organisasi
            </p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Deskripsi</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {community.description}
                </dd>
              </div>
            </dl>
          </div>
          <div className="px-4 py-4 bg-gray-50 text-right sm:px-6">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Kembali
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="p-4 text-red-600">
        <p>Error: {error}</p>
        <button 
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Kembali
        </button>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="p-4">
        <p>Komunitas tidak ditemukan</p>
        <button 
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Kembali ke Daftar
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <button 
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center text-blue-600 hover:text-blue-800"
      >
        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Kembali ke Daftar
      </button>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">{community.name}</h1>
        
        {community.metadata && (
          <div className="prose max-w-none">
            {community.metadata['dc.description.abstract']?.map((desc, index) => (
              <p key={index} className="text-gray-600 mb-4">{desc.value}</p>
            ))}
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Informasi</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Jumlah Item</h3>
              <p className="text-gray-900">{community.numberItems || 0}</p>
            </div>
            {community.metadata?.['dc.identifier.uri']?.[0]?.value && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Link Eksternal</h3>
                <a 
                  href={community.metadata['dc.identifier.uri'][0].value} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Kunjungi Situs
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
