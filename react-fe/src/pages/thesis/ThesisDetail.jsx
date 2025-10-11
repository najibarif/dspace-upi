import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
    FiArrowLeft,
    FiExternalLink,
    FiDownload,
    FiCalendar,
    FiUser,
    FiBookOpen,
    FiTag,
    FiFileText,
} from "react-icons/fi";

const apiCache = new Map();

const fetchWithRetry = async (url, retries = 3) => {
    const cacheKey = url;
    if (apiCache.has(cacheKey)) return apiCache.get(cacheKey);

    try {
        const res = await fetch(url, { headers: { Accept: "application/json" } });
        if (!res.ok) throw new Error("Fetch failed");
        const data = await res.json();
        apiCache.set(cacheKey, data);
        return data;
    } catch (err) {
        if (retries > 0) {
            await new Promise((r) => setTimeout(r, 1000));
            return fetchWithRetry(url, retries - 1);
        }
        throw err;
    }
};

export default function ThesisDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [thesis, setThesis] = useState(null);
    const [related, setRelated] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await fetchWithRetry(`https://api.openalex.org/works/https://openalex.org/${id}`);
                setThesis(data);

                // Ambil related thesis dari konsep utama
                if (data.concepts && data.concepts.length > 0) {
                    const rel = await fetchWithRetry(
                        `https://api.openalex.org/works?filter=concepts.id:${data.concepts[0].id},type:dissertation&per-page=5`
                    );
                    const filtered = rel.results.filter((x) => x.id !== `https://openalex.org/${id}`);
                    setRelated(filtered);
                }
            } catch {
                setThesis(null);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id]);

    if (loading)
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-600">
                <div className="animate-spin h-10 w-10 border-t-2 border-b-2 border-[#d52727] rounded-full mb-3" />
                <p>Memuat detail tesis...</p>
            </div>
        );

    if (!thesis)
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
                <p className="text-lg font-medium text-gray-700 mb-3">
                    Gagal memuat detail tesis 😕
                </p>
                <button
                    onClick={() => navigate(-1)}
                    className="text-white bg-[#d52727] px-4 py-2 rounded-md hover:bg-[#b51f1f]"
                >
                    Kembali
                </button>
            </div>
        );

    const abstract = thesis.abstract_inverted_index
        ? Object.values(thesis.abstract_inverted_index).flat().join(" ")
        : "Abstrak tidak tersedia.";

    const authors =
        thesis.authorships?.map((a) => ({
            name: a.author.display_name,
            inst: a.institutions?.[0]?.display_name,
        })) || [];

    const concepts =
        thesis.concepts
            ?.sort((a, b) => b.score - a.score)
            .slice(0, 10)
            .map((c) => c.display_name) || [];

    return (
        <div className="min-h-screen bg-gray-50 md:py-32 py-12 px-4 sm:px-8 lg:px-16">
            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center mb-8 hover:text-gray-900"
                style={{ color: '#d52727' }}

            >
                <FiArrowLeft className="mr-2" /> Kembali ke Daftar
            </button>

            {/* Card */}
            <div className="bg-white shadow-md rounded-2xl overflow-hidden border border-gray-100">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#d52727] to-[#b31f1f] text-white p-6 md:p-8">
                    <h1 className="text-2xl md:text-3xl font-bold leading-snug mb-3">
                        {thesis.title || "Judul tidak tersedia"}
                    </h1>
                    <div className="flex flex-wrap items-center text-sm text-red-100 gap-4">
                        <div className="flex items-center gap-1">
                            <FiCalendar /> {thesis.publication_year || "Tahun tidak tersedia"}
                        </div>
                        {thesis.doi && (
                            <a
                                href={`https://doi.org/${thesis.doi.replace("https://doi.org/", "")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 hover:text-white"
                            >
                                <FiExternalLink /> DOI
                            </a>
                        )}
                    </div>
                </div>

                {/* Body */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6 md:p-8">
                    {/* Main content */}
                    <div className="lg:col-span-2 space-y-10">
                        {/* Abstract */}
                        <section>
                            <h2 className="flex items-center text-xl font-semibold text-gray-800 mb-3">
                                <FiFileText className="mr-2 text-[#d52727]" /> Abstrak
                            </h2>
                            <p className="text-gray-700 leading-relaxed">{abstract}</p>
                        </section>

                        {/* Authors */}
                        {authors.length > 0 && (
                            <section>
                                <h2 className="flex items-center text-xl font-semibold text-gray-800 mb-3">
                                    <FiUser className="mr-2 text-[#d52727]" /> Penulis
                                </h2>
                                <div className="grid sm:grid-cols-2 gap-3">
                                    {authors.map((a, i) => (
                                        <div
                                            key={i}
                                            className="bg-gray-50 border border-gray-100 p-4 rounded-lg"
                                        >
                                            <p className="font-medium text-gray-900">{a.name}</p>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {a.inst || "Institusi tidak tersedia"}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Concepts */}
                        {concepts.length > 0 && (
                            <section>
                                <h2 className="flex items-center text-xl font-semibold text-gray-800 mb-3">
                                    <FiTag className="mr-2 text-[#d52727]" /> Kata Kunci
                                </h2>
                                <div className="flex flex-wrap gap-2">
                                    {concepts.map((c, i) => (
                                        <span
                                            key={i}
                                            className="px-3 py-1 bg-[#fee2e2] text-[#b91c1c] text-sm rounded-full"
                                        >
                                            {c}
                                        </span>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-8">
                        {/* Info card */}
                        <section className="bg-gray-50 rounded-lg p-5 shadow-sm">
                            <h3 className="font-semibold text-gray-800 mb-3">Detail Publikasi</h3>
                            <div className="space-y-2 text-sm text-gray-700">
                                <p><span className="font-medium">Tahun:</span> {thesis.publication_year || "-"}</p>
                                <p><span className="font-medium">Bahasa:</span> {thesis.language?.toUpperCase() || "-"}</p>
                                <p><span className="font-medium">Dikutip:</span> {thesis.cited_by_count || 0} kali</p>
                            </div>
                        </section>

                        {/* Related */}
                        {related.length > 0 && (
                            <section className="bg-gray-50 rounded-lg p-5 shadow-sm">
                                <h3 className="font-semibold text-gray-800 mb-3">Terkait</h3>
                                <div className="space-y-2">
                                    {related.map((r) => (
                                        <Link
                                            key={r.id}
                                            to={`/thesis/${r.id.replace("https://openalex.org/", "")}`}
                                            className="block border border-gray-100 p-3 rounded-md hover:bg-gray-100 transition"
                                        >
                                            <p className="text-sm font-medium text-gray-800 line-clamp-2">
                                                {r.title}
                                            </p>
                                            <p className="text-xs text-gray-500">{r.publication_year}</p>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
