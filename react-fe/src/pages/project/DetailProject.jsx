import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const COLORS = [
  "#d52727", "#e55d5d", "#f4a261", "#2a9d8f", "#264653",
  "#e9c46a", "#457b9d", "#8ecae6", "#ffb703", "#219ebc",
];

export default function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        // Ambil data proyek
        const projectRes = await fetch(`https://api.openalex.org/works/${id}`);
        const projectData = await projectRes.json();

        // Ambil data SDG dari API lokal
        const sdgRes = await fetch('http://127.0.0.1:8000/api/sdgs');
        const allSdgs = await sdgRes.json();

        // Gabungkan abstract
        const abstract = projectData.abstract_inverted_index
          ? Object.entries(projectData.abstract_inverted_index)
            .sort((a, b) => a[1][0] - b[1][0])
            .map((e) => e[0])
            .join(" ")
          : "Tidak ada abstrak yang tersedia.";

        // Ambil dan format data konsep untuk chart
        const concepts = projectData.concepts
          ?.sort((a, b) => b.score - a.score) // Urutkan berdasarkan score tertinggi
          .slice(0, 8) // Ambil 8 konsep teratas
          .map((c) => ({
            name: c.display_name,
            value: Math.round(c.score * 100), // Bulatkan ke bilangan bulat
            score: c.score
          })) || [];

        console.log('Data konsep untuk chart:', concepts);

        // Cari SDG yang terkait berdasarkan kata kunci
        const keywordMap = {
          water: ["water", "sanitation", "mangrove", "wetland"],
          energy: ["energy", "renewable"],
          education: ["education", "learning", "school", "research"],
          climate: ["climate", "global warming", "carbon", "emission"],
          health: ["health", "well-being", "disease", "medicine"],
          industry: ["industry", "innovation", "infrastructure", "technology"],
          environment: ["environment", "land", "biodiversity", "ecosystem", "ecology", "conservation", "sustainability"],
          poverty: ["poverty", "poor", "inequality", "development"],
          sea: ["ocean", "sea", "marine", "fishery", "coastal", "mangrove"]
        };

        // Debug: Tampilkan semua konsep yang ada
        console.log('Semua konsep dari API:', projectData.concepts?.map(c => c.display_name));

        // Cari SDG yang cocok berdasarkan kata kunci dalam konsep
        const matchedSdgs = allSdgs.filter(sdg => {
          const keywordEntry = Object.entries(keywordMap).find(([key, values]) =>
            sdg.title.toLowerCase().includes(key)
          );

          if (!keywordEntry) {
            console.log(`Tidak ada kata kunci yang cocok untuk SDG: ${sdg.title}`);
            return false;
          }

          const [_, keywords] = keywordEntry;
          const hasMatch = projectData.concepts?.some(concept => {
            if (!concept.display_name) return false;

            const conceptLower = concept.display_name.toLowerCase();
            const found = keywords.some(keyword =>
              conceptLower.includes(keyword)
            );

            if (found) {
              console.log(`Kecocokan ditemukan! SDG: ${sdg.title}, Konsep: ${concept.display_name}, Keyword: ${keywords.join(', ')}`);
            }

            return found;
          });

          if (!hasMatch) {
            console.log(`Tidak ada konsep yang cocok untuk SDG: ${sdg.title} dengan kata kunci: ${keywords.join(', ')}`);
          }

          return hasMatch;
        });

        console.log('SDG yang cocok:', matchedSdgs);

        setProject({
          title: projectData.display_name,
          lead: projectData.authorships?.[0]?.author?.display_name || "Tidak diketahui",
          organization:
            projectData.authorships?.[0]?.institutions?.[0]?.display_name ||
            "Tidak diketahui",
          program: projectData.primary_location?.source?.display_name || "Tidak tersedia",
          year: projectData.publication_year || "N/A",
          abstract,
          sdgs: matchedSdgs.map(sdg => ({
            goal: sdg.title,
            img: sdg.icon_url.split('/').pop() // Ambil nama file dari URL
          })),
          concepts,
          openalex_url: `https://openalex.org/${id}`,
        });
      } catch (err) {
        console.error("Gagal memuat data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  if (loading) return <p>Memuat data...</p>;
  if (!project) return <p>Data tidak ditemukan.</p>;

  return (
    <div className="max-w-full my-26">
      {/* INFO PROJECT */}
      <div className="bg-[#d52727] text-white shadow-lg p-8 pb-16">
        <Link
          to='/project'
          className='inline-flex items-center text-white/90 hover:text-white transition-colors text-sm sm:text-base pb-8'
        >
          <span className='material-symbols-outlined mr-1 sm:mr-2 text-lg sm:text-xl'>
            arrow_back
          </span>
          Back to Projects
        </Link>
        <h1 className="text-3xl font-bold mb-4">{project.title}</h1>
        <div className="space-y-2 text-sm sm:text-base">
          <p>
            <span className="font-semibold">Penulis:</span> {project.lead}
          </p>
          <p>
            <span className="font-semibold">Institusi:</span> {project.organization}
          </p>
          <p>
            <span className="font-semibold">Tahun:</span> {project.year}
          </p>
        </div>
      </div>


      {/* === DETAIL INFORMASI TAMBAHAN === */}
      <div className="bg-white border border-gray-100 rounded-2xl p-8 mt-8">

        {/* === ABSTRAK === */}
        <div className="pb-8">
          <h2 className="text-lg font-semibold mb-2 text-[#d52727]">Abstrak</h2>
          <p className="text-gray-700 leading-relaxed">{project.abstract}</p>
        </div>

        {/* === PIE CHART UNTUK CONCEPTS === */}
        {project.concepts.length > 0 && (
          <div className="pt-4 border-t border-gray-200">
            <h2 className="text-lg font-semibold text-[#d52727] mb-4">
              Concept Distribution
            </h2>
            <div className="flex justify-center">
              <PieChart width={800} height={400}>
                <Pie
                  data={project.concepts.slice(0, 8)}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  innerRadius={60}
                  paddingAngle={3}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {project.concepts.slice(0, 8).map((_, index) => (
                    <Cell
                      key={index}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </div>
          </div>
        )}

        {/* === SDG SECTION === */}
        {project.sdgs.length > 0 && (
          <div className="pt-4 border-t border-gray-200">
            <h2 className="text-lg font-semibold text-[#d52727] mb-4">
              Related SDGs
            </h2>
            <div className="flex flex-wrap gap-4 justify-center">
              {project.sdgs.map((sdg, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center text-center w-28"
                >
                  <img
                    src={`http://127.0.0.1:8000/storage/sdgs/${sdg.img}`}
                    alt={sdg.goal}
                    className="w-24 h-24 object-contain rounded-lg shadow-md hover:scale-105 transition-transform duration-300"
                  />
                  <p className="mt-2 text-sm text-gray-700 font-medium">
                    {sdg.goal}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
