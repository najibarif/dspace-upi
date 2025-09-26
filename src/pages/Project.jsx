import { useState } from "react";
import FindProject from "../components/home/FindProject";

// Komponen Section Sidebar (reusable)
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
            {item.count && (
              <span className="text-gray-500">({item.count})</span>
            )}
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

// Dummy Data Sidebar untuk Project
const sidebarData = {
  sdg: [
    { name: "GOAL 9: Industry, Innovation and Infrastructure", count: 3981 },
    { name: "GOAL 3: Good Health and Well-being", count: 2000 },
    { name: "GOAL 7: Affordable and Clean Energy", count: 1854 },
    { name: "GOAL 11: Sustainable Cities and Communities", count: 1816 },
    { name: "GOAL 4: Quality Education", count: 1135 },
  ],
  concepts: [
    { name: "Lorem Ipsum", count: 120 },
    { name: "Dolor Sit Amet", count: 98 },
    { name: "Consectetur Adipiscing", count: 76 },
    { name: "Sed Do Eiusmod", count: 55 },
    { name: "Tempor Incididunt", count: 43 },
  ],
  profile: [
    { name: "Lorem Ipsum", count: 12 },
    { name: "Dolor Sit", count: 11 },
    { name: "Amet Consectetur", count: 10 },
    { name: "Adipiscing Elit", count: 8 },
    { name: "Sed Do", count: 7 },
  ],
  type: [
    { name: "Lorem Ipsum", count: 50 },
    { name: "Dolor Sit Amet", count: 45 },
    { name: "Consectetur", count: 40 },
    { name: "Adipiscing", count: 35 },
    { name: "Elit", count: 25 },
  ],
};

export default function Project() {
  return (
    <section className="bg-gray-50 min-h-screen">
      <FindProject />

      {/* Content */}
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filter */}
          <aside className="bg-white p-4 rounded shadow h-fit">
            <h2 className="font-semibold mb-4">Filter for Project</h2>
            <select className="w-full border p-2 rounded mb-6">
              <option>Please select Sort By</option>
            </select>

            <SidebarSection title="Sustainable Development Goals" items={sidebarData.sdg} />
            <SidebarSection title="Concepts" items={sidebarData.concepts} />
            <SidebarSection title="Profile" items={sidebarData.profile} />
            <SidebarSection title="Type" items={sidebarData.type} />

            {/* Year (khusus range input) */}
            <div className="mb-6">
              <h3 className="font-medium">Year</h3>
              <div className="mt-2 flex items-center gap-2 text-sm">
                <input
                  type="number"
                  placeholder="From"
                  className="w-1/2 border p-2 rounded"
                />
                <span>to</span>
                <input
                  type="number"
                  placeholder="To"
                  className="w-1/2 border p-2 rounded"
                />
              </div>
            </div>
          </aside>

          {/* Result List */}
          <main className="lg:col-span-3">
            <p className="text-gray-600 mb-4">Result 152 for 152</p>
            <div className="space-y-6">
              {/* Project Dummy */}
              {Array.from({ length: 6 }).map((_, idx) => (
                <article key={idx} className="bg-white p-4 rounded shadow">
                  <h3 className="font-bold">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit{" "}
                    {idx + 1}
                  </h3>
                  <p className="text-sm text-gray-600">Lead: Lorem Ipsum</p>
                  <p className="text-sm text-gray-600">
                    Organization: Dolor Sit Amet Institute
                  </p>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-500">
                    <span>
                      Type:{" "}
                      {idx % 2 === 0
                        ? "Research Project"
                        : "Industrial Collaboration"}
                    </span>
                    <span>|</span>
                    <span>
                      Duration: {2020 + idx}–{2021 + idx}
                    </span>
                    <span>|</span>
                    <span>
                      Status: {idx % 2 === 0 ? "Ongoing" : "Completed"}
                    </span>
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
