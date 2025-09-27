import { useState, useMemo } from "react";
import FindPaper from "../components/paper/FindPaper";

// Komponen Section Sidebar
function SidebarSection({ title, items }) {
  const [showAll, setShowAll] = useState(false);
  const visibleItems = showAll ? items : items.slice(0, 5);

  return (
    <div className="mb-6">
      <h3 className="font-medium text-sm mb-2">{title}</h3>
      <div className="space-y-2 text-sm text-gray-600">
        {visibleItems.map((item, idx) => (
          <label key={idx} className="flex items-center gap-2">
            <input type="checkbox" />
            <span className="flex-1">{item.name}</span>
            {item.count && (
              <span className="text-gray-500">({item.count})</span>
            )}
          </label>
        ))}
      </div>
      {items.length > 5 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-blue-600 text-sm mt-2"
        >
          {showAll ? "Show less" : "See more >"}
        </button>
      )}
    </div>
  );
}

// Dummy Data Sidebar
const sidebarData = {
  sdg: [
    { name: "GOAL 7: Affordable and Clean Energy", count: 2054 },
    { name: "GOAL 14: Life Below Water", count: 1283 },
    { name: "GOAL 6: Clean Water and Sanitation", count: 1192 },
    { name: "GOAL 11: Sustainable Cities and Communities", count: 928 },
    { name: "GOAL 3: Good Health and Well-being", count: 577 },
  ],
  concepts: [
    { name: "Lorem Ipsum Concept 1", count: 120 },
    { name: "Lorem Ipsum Concept 2", count: 98 },
    { name: "Lorem Ipsum Concept 3", count: 75 },
    { name: "Lorem Ipsum Concept 4", count: 60 },
    { name: "Lorem Ipsum Concept 5", count: 40 },
  ],
  profile: [
    { name: "Lorem Ipsum Author 1", count: 324 },
    { name: "Lorem Ipsum Author 2", count: 280 },
    { name: "Lorem Ipsum Author 3", count: 257 },
    { name: "Lorem Ipsum Author 4", count: 210 },
    { name: "Lorem Ipsum Author 5", count: 190 },
  ],
  type: [
    { name: "Lorem Ipsum Type 1", count: 177 },
    { name: "Lorem Ipsum Type 2", count: 150 },
    { name: "Lorem Ipsum Type 3", count: 120 },
    { name: "Lorem Ipsum Type 4", count: 95 },
    { name: "Lorem Ipsum Type 5", count: 80 },
  ],
  sjr: [
    { name: "Q-None", count: 18855 },
    { name: "Q1", count: 3381 },
    { name: "Q2", count: 2222 },
    { name: "Q3", count: 1739 },
    { name: "Q4", count: 1120 },
  ],
};

// Dummy Paper List (agar bisa di-sort)
const dummyPapers = Array.from({ length: 6 }).map((_, idx) => ({
  title: `Lorem ipsum dolor sit amet, consectetur adipiscing elit ${idx + 1}`,
  link: `https://doi.org/10.xxxx/lorem-${idx + 1}`,
  authors: "Lorem Ipsum, Dolor Sit",
  organization: "Consectetur Institute",
  year: 2020 + idx,
  cite: Math.floor(Math.random() * 100),
}));

export default function Paper() {
  const [sortAsc, setSortAsc] = useState(true);

  // Filter & Sort
  const sortedPapers = useMemo(() => {
    const data = [...dummyPapers]; // copy array
    return data.sort((a, b) =>
      sortAsc ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)
    );
  }, [sortAsc]);

  return (
    <section className="bg-gray-50 min-h-screen">
      <FindPaper />

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 flex gap-8">
        {/* Sidebar Filter */}
        <aside className="w-64 hidden md:block bg-white shadow-sm rounded-md p-4 h-fit">
          <h2 className="font-semibold mb-4">Filters for Paper</h2>

          {/* Sort */}
          <div className="mb-4">
            <h4 className="font-medium text-sm mb-2">Sort By</h4>
            <select
              className="w-full border p-2 rounded text-sm"
              value={sortAsc ? "asc" : "desc"}
              onChange={(e) => setSortAsc(e.target.value === "asc")}
            >
              <option value="asc">Title (A–Z)</option>
              <option value="desc">Title (Z–A)</option>
            </select>
          </div>

          {/* Sidebar Sections */}
          <SidebarSection
            title="Sustainable Development Goals"
            items={sidebarData.sdg}
          />
          <SidebarSection title="Concepts" items={sidebarData.concepts} />
          <SidebarSection title="Profile" items={sidebarData.profile} />
          <SidebarSection title="Type" items={sidebarData.type} />
          <SidebarSection title="SJR" items={sidebarData.sjr} />

          
        </aside>

        {/* Results */}
        <main className="flex-1">
          {/* Summary row */}
          <div className="flex items-center justify-between border-b pb-3 mb-6">
            <p className="text-sm text-gray-600">
              1 - {sortedPapers.length} out of {dummyPapers.length} results
            </p>
            <div className="flex items-center gap-5 text-sm">
              <button
                className="text-gray-700"
                onClick={() => setSortAsc((v) => !v)}
              >
                Sort by title ({sortAsc ? "ascending" : "descending"}) &gt;
              </button>
            </div>
          </div>

          {/* List */}
          <div className="space-y-6">
            {sortedPapers.map((paper, idx) => (
              <article key={idx} className="border-b pb-4">
                <h2 className="font-semibold text-lg text-gray-900">{paper.title}</h2>
                <a
                  href={paper.link}
                  className="text-sm text-blue-600 break-words block"
                >
                  {paper.link}
                </a>
                <p className="text-sm text-gray-600">Authors: {paper.authors}</p>
                <p className="text-sm text-gray-600">Organization: {paper.organization}</p>
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-500">
                  <span>Journal</span>
                  <span>|</span>
                  <span>Cite {paper.cite}</span>
                  <span>|</span>
                  <span>Year {paper.year}</span>
                </div>
              </article>
            ))}
          </div>
        </main>
      </div>
    </section>
  );
}
