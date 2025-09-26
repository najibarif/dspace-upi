import { useState } from "react";
import FindPaper from "../components/home/FindPaper";

// Komponen Section Sidebar
function SidebarSection({ title, items }) {
  const [showAll, setShowAll] = useState(false);
  const visibleItems = showAll ? items : items.slice(0, 5);

  return (
    <div className="mb-6">
      <h3 className="font-medium">{title}</h3>
      <div className="mt-2 space-y-2 text-sm">
        {visibleItems.map((item, idx) => (
          <label key={idx} className="flex items-center gap-2">
            <input type="checkbox" />
            <span className="flex-1">{item.name}</span>
            {item.count && <span className="text-gray-500">({item.count})</span>}
          </label>
        ))}
      </div>
      {items.length > 5 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-blue-500 text-sm mt-1"
        >
          {showAll ? "Show less" : "Show more"}
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

export default function Paper() {
  return (
    <section className="bg-gray-50 min-h-screen">
      <FindPaper />

      {/* Content */}
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filter */}
          <aside className="bg-white p-4 rounded shadow h-fit">
            <h2 className="font-semibold mb-4">Filter for Paper</h2>
            <select className="w-full border p-2 rounded mb-6">
              <option>Please select Sort By</option>
            </select>

            <SidebarSection
              title="Sustainable Development Goals"
              items={sidebarData.sdg}
            />
            <SidebarSection title="Concepts" items={sidebarData.concepts} />
            <SidebarSection title="Profile" items={sidebarData.profile} />
            <SidebarSection title="Type" items={sidebarData.type} />
            <SidebarSection title="SJR" items={sidebarData.sjr} />
          </aside>

          {/* Result List */}
          <main className="lg:col-span-3">
            <p className="text-gray-600 mb-4">Result 27317 for 27317</p>
            <div className="space-y-6">
              {/* Artikel Dummy */}
              {Array.from({ length: 6 }).map((_, idx) => (
                <article key={idx} className="bg-white p-4 rounded shadow">
                  <h3 className="font-bold">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit{" "}
                    {idx + 1}
                  </h3>
                  <a href="#" className="text-sm text-blue-600 break-words">
                    https://doi.org/10.xxxx/lorem-{idx + 1}
                  </a>
                  <p className="text-sm text-gray-600">
                    Authors: Lorem Ipsum, Dolor Sit
                  </p>
                  <p className="text-sm text-gray-600">
                    Organization: Consectetur Institute
                  </p>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-500">
                    <span>Journal</span>
                    <span>|</span>
                    <span>Cite {Math.floor(Math.random() * 100)}</span>
                    <span>|</span>
                    <span>Year {2020 + (idx % 6)}</span>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex flex-wrap justify-center mt-8 gap-2">
              <button className="px-3 py-1 border rounded">First</button>
              <button className="px-3 py-1 border rounded">Prev</button>
              <button className="px-3 py-1 border rounded bg-[#D52727] text-white">
                1
              </button>
              <button className="px-3 py-1 border rounded">2</button>
              <button className="px-3 py-1 border rounded">Next</button>
              <button className="px-3 py-1 border rounded">Last</button>
            </div>
          </main>
        </div>
      </div>
    </section>
  );
}
