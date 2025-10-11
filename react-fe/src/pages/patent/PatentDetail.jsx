import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";

export default function PatentDetail() {
  const { id } = useParams();
  const [patent, setPatent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatent = async () => {
      setLoading(true);
      try {
        const response = await fetch(`https://api.openalex.org/works/${id}`);
        const data = await response.json();

        const abstract = data.abstract_inverted_index
          ? Object.entries(data.abstract_inverted_index)
              .sort((a, b) => a[1][0] - b[1][0])
              .map((e) => e[0])
              .join(" ")
          : "No abstract available";

        const mappedPatent = {
          title: data.display_name || "Untitled Patent",
          lead: data.authorships?.[0]?.author?.display_name || "Unknown",
          organization:
            data.authorships?.[0]?.author?.last_known_institutions?.[0]?.display_name ||
            "Unknown",
          type: data.type || "Patent",
          publication_year: data.publication_year || "-",
          concepts: data.concepts?.map((c) => c.display_name) || [],
          abstract: abstract,
          doi: data.doi || null,
          url: data.id ? `https://openalex.org/${data.id.split("/").pop()}` : null,
        };

        setPatent(mappedPatent);
      } catch (err) {
        console.error("Failed to fetch patent detail:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPatent();
  }, [id]);

  // Loading spinner
  if (loading) {
    return (
      <div className="text-center py-32">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#d52727]"></div>
        <p className="mt-3 text-sm text-gray-600">Memuat data paten...</p>
      </div>
    );
  }

  if (!patent) {
    return (
      <p className="text-red-600 text-center mt-20">Patent not found.</p>
    );
  }

  return (
    <section className="bg-gray-50 min-h-screen md:py-32 py-12 px-4 sm:px-8">
      <div className="max-w-3xl mx-auto">
        <Link
          to="/patent"
          className="inline-flex items-center text-[#d52727] hover:text-[#a91e1e] mb-6 transition-colors"
        >
          <FiArrowLeft className="mr-2" /> Kembali ke Daftar Paten
        </Link>

        <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-100">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            {patent.title}
          </h1>

          <div className="space-y-2 text-gray-700 text-sm md:text-base">
            <p>
              <span className="font-semibold text-gray-800">Lead:</span>{" "}
              {patent.lead}
            </p>
            <p>
              <span className="font-semibold text-gray-800">Organization:</span>{" "}
              {patent.organization}
            </p>
            <p>
              <span className="font-semibold text-gray-800">Type:</span>{" "}
              {patent.type}
            </p>
            <p>
              <span className="font-semibold text-gray-800">Publication Year:</span>{" "}
              {patent.publication_year}
            </p>

            {patent.doi && (
              <p>
                <span className="font-semibold text-gray-800">DOI:</span>{" "}
                <a
                  href={`https://doi.org/${patent.doi}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#d52727] hover:underline"
                >
                  {patent.doi}
                </a>
              </p>
            )}

            {patent.url && (
              <p>
                <span className="font-semibold text-gray-800">OpenAlex:</span>{" "}
                <a
                  href={patent.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#d52727] hover:underline"
                >
                  View in OpenAlex →
                </a>
              </p>
            )}
          </div>

          <div className="mt-8 border-t border-gray-200 pt-6">
            <h2 className="font-semibold text-lg mb-3 text-gray-800">
              Concepts
            </h2>
            <div className="flex flex-wrap gap-2">
              {patent.concepts.length > 0 ? (
                patent.concepts.map((c, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-lg border border-gray-200"
                  >
                    {c}
                  </span>
                ))
              ) : (
                <p className="text-gray-500 text-sm">Tidak ada konsep tersedia.</p>
              )}
            </div>
          </div>

          <div className="mt-8 border-t border-gray-200 pt-6">
            <h2 className="font-semibold text-lg mb-3 text-gray-800">
              Abstract
            </h2>
            <p className="text-gray-700 leading-relaxed text-sm md:text-base">
              {patent.abstract}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
