import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
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

export default function AuthorDetail() {
  const { id } = useParams();
  const [author, setAuthor] = useState(null);
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [authorRes, worksRes] = await Promise.all([
          fetch(`https://api.openalex.org/authors/${id}`),
          fetch(`https://api.openalex.org/works?filter=author.id:${id}&per-page=200`),
        ]);

        if (!authorRes.ok || !worksRes.ok) throw new Error("Gagal memuat data");

        const authorData = await authorRes.json();
        const worksData = await worksRes.json();

        setAuthor(authorData);
        setWorks(worksData.results);
      } catch (err) {
        setError("Gagal memuat detail peneliti.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading)
    return <div className="text-center py-20 text-gray-500">Memuat data...</div>;
  if (error)
    return <div className="text-center py-20 text-red-600">{error}</div>;

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
    <div className="bg-gray-50 min-h-screen text-gray-800 mt-24">
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
