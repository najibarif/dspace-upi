import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getPaperById } from "../../utils/api";

export default function PaperDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPaper = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getPaperById(id);
        setPaper(response.data || response);
      } catch (err) {
        console.error("Failed to fetch paper:", err);
        setError("Failed to load paper details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPaper();
    }
  }, [id]);

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <div className='inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600'></div>
          <p className='mt-4 text-gray-600'>Loading paper details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <div className='bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg max-w-md'>
            <h3 className='font-bold text-lg mb-2'>Error</h3>
            <p className='mb-4'>{error}</p>
            <button
              onClick={() => navigate("/paper")}
              className='bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded'
            >
              Back to Papers
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!paper) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <h2 className='text-2xl font-bold text-gray-800 mb-4'>
            Paper not found
          </h2>
          <button
            onClick={() => navigate("/paper")}
            className='bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
          >
            Back to Papers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 pt-24'>
      <div className='bg-[#D52727] text-white'>
        <div className='max-w-7xl mx-auto px-6 py-8'>
          <div className='mb-4'>
            <Link
              to='/paper'
              className='inline-flex items-center text-white/80 hover:text-white transition-colors'
            >
              <span className='material-symbols-outlined mr-2'>arrow_back</span>
              Back to Papers
            </Link>
          </div>

          <h1 className='text-3xl md:text-4xl font-bold mb-4 leading-tight'>
            {paper.title}
          </h1>

          <div className='mb-4'>
            <p className='text-lg text-white/90'>
              <span className='font-medium'>Authors:</span>{" "}
              {paper.authors || "N/A"}
            </p>
          </div>

          <div className='mb-6'>
            <span className='inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/20 border border-white/30'>
              <span className='material-symbols-outlined mr-2 text-sm'>
                business
              </span>
              {paper.organization || "N/A"}
            </span>
          </div>

          <div className='flex flex-wrap items-center gap-4 text-sm text-white/80'>
            <div className='flex items-center'>
              <span className='material-symbols-outlined mr-2 text-sm'>
                description
              </span>
              {paper.type_label || paper.type || "journal"}
            </div>
            <div className='w-px h-4 bg-white/30'></div>
            <div className='flex items-center'>
              <span className='material-symbols-outlined mr-2 text-sm'>
                star
              </span>
              {paper.visibility_label || "Public"}
            </div>
            <div className='w-px h-4 bg-white/30'></div>
            <div className='flex items-center'>
              <span className='material-symbols-outlined mr-2 text-sm'>
                link
              </span>
              cite 0
            </div>
            <div className='w-px h-4 bg-white/30'></div>
            <div className='flex items-center'>
              <span className='material-symbols-outlined mr-2 text-sm'>
                calendar_today
              </span>
              Year {paper.year || "N/A"}
            </div>
            <div className='w-px h-4 bg-white/30'></div>
            <div className='flex items-center'>
              <span className='material-symbols-outlined mr-2 text-sm'>
                group
              </span>
              Group
            </div>
          </div>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-6 py-8'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          <div className='lg:col-span-2'>
            <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
              {paper.venue_name && (
                <p className='text-sm text-gray-600 mb-6'>
                  <span className='font-medium'>Source:</span>{" "}
                  {paper.venue_name}
                </p>
              )}

              {paper.abstract && (
                <div className='mb-8'>
                  <h2 className='text-xl font-bold text-gray-900 mb-4'>
                    Abstract
                  </h2>
                  <div className='text-gray-700 leading-relaxed'>
                    {paper.abstract}
                  </div>
                </div>
              )}

              <div className='mb-8'>
                <h2 className='text-xl font-bold text-gray-900 mb-4'>
                  Keywords
                </h2>
                <div className='flex flex-wrap gap-2'>
                  <span className='px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm'>
                    {paper.type_label || paper.type}
                  </span>
                  <span className='px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm'>
                    Year {paper.year}
                  </span>
                  {paper.venue_name && (
                    <span className='px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm'>
                      {paper.venue_name}
                    </span>
                  )}
                </div>
              </div>

              <div className='mb-8'>
                <h2 className='text-xl font-bold text-gray-900 mb-4'>
                  Concepts
                </h2>
              </div>

              <div className='border-t border-gray-200 pt-6'>
                <div className='flex flex-wrap items-center gap-4 text-sm text-gray-600'>
                  <div className='flex items-center'>
                    <span className='material-symbols-outlined mr-2 text-sm'>
                      description
                    </span>
                    {paper.type_label || paper.type}
                  </div>
                  <div className='w-px h-4 bg-gray-300'></div>
                  <div className='flex items-center'>
                    <span className='material-symbols-outlined mr-2 text-sm'>
                      star
                    </span>
                    {paper.visibility_label || "Public"}
                  </div>
                  <div className='w-px h-4 bg-gray-300'></div>
                  <div className='flex items-center'>
                    <span className='material-symbols-outlined mr-2 text-sm'>
                      link
                    </span>
                    cite 0
                  </div>
                  <div className='w-px h-4 bg-gray-300'></div>
                  <div className='flex items-center'>
                    <span className='material-symbols-outlined mr-2 text-sm'>
                      calendar_today
                    </span>
                    Year {paper.year}
                  </div>
                  <div className='w-px h-4 bg-gray-300'></div>
                  <div className='flex items-center'>
                    <span className='material-symbols-outlined mr-2 text-sm'>
                      menu_book
                    </span>
                    source {paper.venue_name || "N/A"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className='space-y-6'>
            <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-4'>
              <div className='flex rounded-md overflow-hidden border border-gray-300'>
                <input
                  type='text'
                  placeholder='Search here...'
                  className='flex-1 px-3 py-2 outline-none text-sm'
                />
                <button className='bg-[#D52727] hover:bg-[#B02121] px-4 flex items-center justify-center'>
                  <span className='material-symbols-outlined text-white text-sm'>
                    search
                  </span>
                </button>
              </div>
            </div>

            <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-4'>
              <button className='w-full bg-[#D52727] hover:bg-[#B02121] text-white font-medium py-2 px-4 rounded-md flex items-center justify-center'>
                <span className='material-symbols-outlined mr-2'>share</span>
                Share Link
              </button>
            </div>

            <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-4'>
              <h3 className='font-bold text-gray-900 mb-4'>
                Access to Document
              </h3>
              <div className='space-y-3'>
                {paper.doi && (
                  <div className='flex items-center text-sm'>
                    <span className='material-symbols-outlined mr-2 text-gray-400'>
                      link
                    </span>
                    <a
                      href={`https://doi.org/${paper.doi}`}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-blue-600 hover:underline'
                    >
                      {paper.doi}
                    </a>
                  </div>
                )}

                {paper.url_fulltext && (
                  <div className='flex items-center text-sm'>
                    <span className='material-symbols-outlined mr-2 text-gray-400'>
                      description
                    </span>
                    <a
                      href={paper.url_fulltext}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-blue-600 hover:underline'
                    >
                      Full Text
                    </a>
                  </div>
                )}

                <div className='flex items-center text-sm'>
                  <span className='material-symbols-outlined mr-2 text-gray-400'>
                    lock
                  </span>
                  <span className='text-gray-600'>Restricted Access</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
