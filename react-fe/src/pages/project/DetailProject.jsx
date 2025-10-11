import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";

export default function DetailProjectPage() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const url = `https://api.openalex.org/works/${id}`;
        const res = await fetch(url);
        const data = await res.json();

        const abstract = data.abstract_inverted_index
          ? Object.entries(data.abstract_inverted_index)
              .sort((a, b) => a[1][0] - b[1][0])
              .map((e) => e[0])
              .join(" ")
          : "";

        setProject({
          title: data.display_name,
          lead: data.authorships?.[0]?.author?.display_name || "N/A",
          organization:
            data.authorships?.[0]?.institutions?.[0]?.display_name || "N/A",
          type: data.type || "N/A",
          duration: data.publication_year ? `${data.publication_year}` : "N/A",
          status: data.is_oa ? "Open Access" : "Restricted",
          abstract: abstract,
          openalex_url: `https://openalex.org/${id}`,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  // Loading Spinner
  if (loading)
    return (
      <div className="text-center py-32">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#d52727]"></div>
        <p className="mt-3 text-sm text-gray-600">
          Memuat data organisasi...
        </p>
      </div>
    );

  if (!project)
    return <p className="text-center mt-20">Project not found.</p>;

  return (
    <div className="max-w-3xl mx-auto px-6 md:py-32 py-12">
      <Link
        to="/project"
        className="inline-flex items-center text-[#d52727] hover:text-[#a91e1e] mb-8 transition-colors"
      >
        <FiArrowLeft className="mr-2 text-lg" /> Kembali ke Daftar Proyek
      </Link>

      <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {project.title}
        </h1>

        <div className="space-y-2 text-gray-700 text-sm md:text-base">
          <p>
            <span className="font-semibold text-gray-800">Lead:</span>{" "}
            {project.lead}
          </p>
          <p>
            <span className="font-semibold text-gray-800">Organization:</span>{" "}
            {project.organization}
          </p>
          <p>
            <span className="font-semibold text-gray-800">Type:</span>{" "}
            {project.type}
          </p>
          <p>
            <span className="font-semibold text-gray-800">Year:</span>{" "}
            {project.duration}
          </p>
          <p>
            <span className="font-semibold text-gray-800">Status:</span>{" "}
            <span
              className={`px-2 py-1 rounded-md text-xs font-medium ${
                project.status === "Open Access"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {project.status}
            </span>
          </p>
        </div>

        <div className="mt-6 border-t border-gray-200 pt-6">
          <h2 className="font-semibold text-gray-800 mb-2">Deskripsi</h2>
          <p className="text-gray-600 leading-relaxed">
            {project.abstract || "Tidak ada deskripsi yang tersedia."}
          </p>
        </div>

        <div className="mt-6">
          <a
            href={project.openalex_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-[#d52727] hover:text-[#a91e1e] font-medium"
          >
            Lihat di OpenAlex →
          </a>
        </div>
      </div>
    </div>
  );
}
