import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";

export default function OutreachDetail() {
    const { id } = useParams();
    const [work, setWork] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchWork = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`https://api.openalex.org/works/${id}`);
                const data = await response.json();

                const mappedWork = {
                    title: data.title,
                    lead: data.authorships?.[0]?.author?.display_name || "Unknown",
                    organization:
                        data.authorships?.[0]?.author?.last_known_institutions?.[0]?.display_name ||
                        "Unknown",
                    publication_year: data.publication_year || "-",
                    concepts: data.concepts?.map((c) => c.display_name) || [],
                    abstract: data.abstract_inverted_index
                        ? Object.values(data.abstract_inverted_index).flat().join(" ")
                        : "No abstract available",
                    doi: data.doi || null,
                    url: data.id || null,
                };

                setWork(mappedWork);
            } catch (err) {
                setError("Failed to load outreach detail.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchWork();
    }, [id]);

    if (loading)
        return (
            <div className='text-center py-32'><div className='inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#d52727]'></div><p className='mt-3 text-sm text-gray-600'>Memuat data...</p></div>
        );

    if (error)
        return (
            <p className="text-red-500 text-center mt-10 font-medium">{error}</p>
        );

    if (!work)
        return (
            <p className="text-gray-600 text-center mt-10 font-medium">
                Work not found.
            </p>
        );

    return (
        <section className="bg-gray-50 min-h-screen md:py-32 py-12 px-4 sm:px-6 lg:px-12">
            <div className="max-w-3xl mx-auto">
                <Link
                    to="/outreach"
                    className="text-[#d52727] font-medium hover:underline mb-6 inline-block"
                >
                    &larr; Back to Outreach
                </Link>

                <div className="bg-white shadow-md rounded-2xl p-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 leading-snug">
                        {work.title}
                    </h1>

                    <div className="text-sm sm:text-base text-gray-700 space-y-3 mb-8">
                        <p>
                            <span className="font-semibold text-gray-800">Lead:</span>{" "}
                            {work.lead}
                        </p>
                        <p>
                            <span className="font-semibold text-gray-800">Organization:</span>{" "}
                            {work.organization}
                        </p>
                        <p>
                            <span className="font-semibold text-gray-800">
                                Publication Year:
                            </span>{" "}
                            {work.publication_year}
                        </p>
                        {work.doi && (
                            <p>
                                <span className="font-semibold text-gray-800">DOI:</span>{" "}
                                <a
                                    href={`https://doi.org/${work.doi}`}
                                    className="text-[#d52727] hover:underline"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {work.doi}
                                </a>
                            </p>
                        )}
                        {work.url && (
                            <p>
                                <span className="font-semibold text-gray-800">
                                    OpenAlex URL:
                                </span>{" "}
                                <a
                                    href={work.url}
                                    className="text-[#d52727] hover:underline"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    View in OpenAlex
                                </a>
                            </p>
                        )}
                    </div>

                    <div className="mb-8">
                        <h2 className="font-semibold text-lg sm:text-xl mb-3 text-gray-800">
                            Concepts
                        </h2>
                        <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
                            {work.concepts.length > 0 ? (
                                work.concepts.map((c, idx) => (
                                    <span
                                        key={idx}
                                        className="px-3 py-1 bg-[#feecec] text-[#b31f1f] rounded-full font-medium"
                                    >
                                        {c}
                                    </span>
                                ))
                            ) : (
                                <p className="text-gray-600">-</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <h2 className="font-semibold text-lg sm:text-xl mb-3 text-gray-800">
                            Abstract
                        </h2>
                        <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                            {work.abstract}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
