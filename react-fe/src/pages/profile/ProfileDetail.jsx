import { useParams } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

// Cache for storing API responses
const apiCache = new Map();

// Function to fetch with retry and backoff
const fetchWithRetry = async (url, options = {}, retries = 3, backoff = 300) => {
  try {
    // Check cache first
    if (apiCache.has(url)) {
      return apiCache.get(url);
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
        ...options.headers,
      },
    });

    // Handle rate limiting (429)
    if (response.status === 429) {
      if (retries > 0) {
        const retryAfter = response.headers.get('Retry-After') || backoff;
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        return fetchWithRetry(url, options, retries - 1, backoff * 2);
      }
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Cache the successful response
    apiCache.set(url, data);
    
    return data;
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, backoff * 1000));
      return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }
    throw error;
  }
};

export default function AuthorDetail() {
  const { id } = useParams();
  const [author, setAuthor] = useState(null);
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchAuthorData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [authorData, worksData] = await Promise.all([
        fetchWithRetry(`https://api.openalex.org/authors/${id}`),
        fetchWithRetry(`https://api.openalex.org/works?filter=author.id:${id}&per-page=200`)
      ]);

      setAuthor(authorData);
      setWorks(worksData.results || []);
    } catch (err) {
      console.error('Error fetching author data:', err);
      setError(
        err.message.includes('Rate limit')
          ? 'Terlalu banyak permintaan. Silakan coba lagi nanti.'
          : 'Gagal memuat detail peneliti. Pastikan koneksi internet Anda stabil.'
      );
      
      // If rate limited, enable retry button
      if (err.message.includes('Rate limit')) {
        setRetryCount(prev => prev + 1);
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAuthorData();
  }, [fetchAuthorData, retryCount]);

  if (loading) {
    return (
      <div className="text-center py-32">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600 mb-4"></div>
        <p className="text-gray-600">Memuat data peneliti...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 px-4">
        <div className="max-w-md mx-auto">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-lg font-medium">{error}</p>
          </div>
          {error.includes('Terlalu banyak permintaan') && (
            <button
              onClick={() => {
                setRetryCount(prev => prev + 1);
                setError(null);
                setLoading(true);
              }}
              className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Coba Lagi
            </button>
          )}
        </div>
      </div>
    );
  }

  const COLORS = [
    "#d52727",
    "#f87171",
    "#fb923c",
    "#facc15",
    "#4ade80",
    "#60a5fa",
    "#a78bfa",
    "#f472b6",
  ];

  const researchData =
    author.counts_by_year
      ?.map((y) => ({ year: y.year, count: y.works_count }))
      .reverse() || [];

  const citeData =
    author.counts_by_year
      ?.map((y) => ({ year: y.year, count: y.cited_by_count }))
      .reverse() || [];

  const outreachData =
    works
      ?.filter((w) => ["report", "other"].includes(w.type))
      .reduce((acc, w) => {
        const year = w.publication_year || "Unknown";
        const found = acc.find((i) => i.year === year);
        if (found) found.count++;
        else acc.push({ year, count: 1 });
        return acc;
      }, [])
      .sort((a, b) => a.year - b.year) || [];

  const sdgIcons = [1, 2, 3, 4, 6, 7, 9, 12, 13];

  const conceptData =
    author.x_concepts?.slice(0, 8).map((c) => ({
      name: c.display_name,
      value: c.score,
    })) || [];

  const tabItems = [
    { icon: "home", label: "Overview" },
    { icon: "public", label: "Network" },
    { icon: "article", label: "Paper" },
    { icon: "bar_chart", label: "Project" },
    { icon: "emoji_events", label: "Patent" },
    { icon: "campaign", label: "Outreach" },
    { icon: "school", label: "Thesis" },
  ];

  return (
    <div className="bg-gray-50 min-h-screen text-gray-800 mt-0 md:mt-24">
      <div className="bg-gradient-to-r from-red-700 to-red-900 text-white py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center gap-6">
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
              author.display_name
            )}&background=ffffff&color=d52727`}
            alt={author.display_name}
            className="w-28 h-28 rounded-full border-4 border-white shadow-lg"
          />
          <div>
            <h1 className="text-3xl font-semibold">{author.display_name}</h1>
            <p className="mt-1 text-sm opacity-90">
              {author.last_known_institutions
                ?.map((i) => i.display_name)
                .join(", ") || "Tidak ada afiliasi"}
            </p>
            <div className="flex gap-6 mt-4 text-sm">
              <div>
                <span className="text-2xl font-bold">
                  {author.summary_stats?.h_index || 0}
                </span>
                <p>H-Index</p>
              </div>
              <div>
                <span className="text-2xl font-bold">{author.cited_by_count}</span>
                <p>Cite</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navbar Tabs */}
        <div className="max-w-6xl mx-auto mt-8 border-t border-red-400 pt-4 flex flex-wrap justify-between items-center text-sm">
          <div className="flex flex-wrap gap-4 font-medium">
            {tabItems.map((tab) => (
              <button key={tab.label} className="hover:text-gray-100 flex items-center gap-1">
                <span className="material-symbols-outlined">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Search here.."
            className="bg-white text-gray-700 px-3 py-1.5 rounded-md border focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
      </div>

      <div className="max-w-6xl mx-auto bg-white mt-8 rounded-xl shadow p-8">
        <h2 className="font-semibold text-lg mb-3">Personal Profile</h2>
        <p className="text-sm text-gray-700 mb-2">
          <strong>Expertise related to UN Sustainable Development Goals</strong>
        </p>
        <p className="text-sm text-gray-600 mb-4">
          In 2015, UN member states agreed to 17 global Sustainable Development
          Goals (SDGs) to end poverty, protect the planet, and ensure prosperity
          for all.
        </p>

        <div className="flex flex-wrap gap-2 mb-8">
          {sdgIcons.map((n) => {
            const fileName = `E-WEB-Goal-${String(n).padStart(2, "0")} 1.png`;
            const imageUrl = `http://127.0.0.1:8000/storage/sdgs/${encodeURIComponent(
              fileName
            )}`;
            return (
              <img key={n} src={imageUrl} alt={`SDG ${n}`} className="w-16 h-16 rounded-md" />
            );
          })}
        </div>

        <h2 className="text-lg font-semibold mb-4">Concepts</h2>
        <div className="w-full h-72 flex justify-center items-center">
          <ResponsiveContainer width="60%" height="100%">
            <PieChart>
              <Pie
                data={conceptData}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                innerRadius={60}
                paddingAngle={3}
                label
              >
                {conceptData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-10 space-y-10">
          <BarSection title="Research Output" data={researchData} total={author.works_count} />
          <BarSection title="Cite" data={citeData} total={author.cited_by_count} />
          <BarSection
            title="Outreach Output"
            data={outreachData}
            total={outreachData.reduce((a, b) => a + b.count, 0)}
          />
        </div>
      </div>
    </div>
  );
}

function BarSection({ title, data, total }) {
  return (
    <div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <div className="flex justify-between items-end">
        <ResponsiveContainer width="85%" height={200}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#d52727" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="text-right text-sm">
          <p>Total</p>
          <p className="text-lg font-semibold">{total}</p>
        </div>
      </div>
    </div>
  );
}
