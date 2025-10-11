import { useState, useMemo } from "react";
import FindProject from "../components/project/FindProject";

// Komponen Section Sidebar (reusable)
function SidebarSection({ title, items }) {
  const [showAll, setShowAll] = useState(false);
  const visibleItems = showAll ? items : items.slice(0, 5);

  return (
    <div className="mb-4 sm:mb-6">
      <h3 className="font-medium text-sm sm:text-sm mb-2 sm:mb-2">{title}</h3>
      <div className="space-y-2 sm:space-y-2 text-sm sm:text-sm text-gray-600">
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
          className="text-blue-600 text-sm sm:text-sm mt-2 sm:mt-2"
        >
          {showAll ? "Show less" : "See more >"}
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

// Dummy Project List agar bisa di-sort
const dummyProjects = Array.from({ length: 6 }).map((_, idx) => ({
  title: `Lorem ipsum dolor sit amet, consectetur adipiscing elit ${idx + 1}`,
  lead: "Lorem Ipsum",
  organization: "Dolor Sit Amet Institute",
  type: idx % 2 === 0 ? "Research Project" : "Industrial Collaboration",
  duration: `${2020 + idx}–${2021 + idx}`,
  status: idx % 2 === 0 ? "Ongoing" : "Completed",
}));

export default function Project() {
  const [sortAsc, setSortAsc] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Filter & Sort
  const sortedProjects = useMemo(() => {
    const data = [...dummyProjects];
    return data.sort((a, b) =>
      sortAsc ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)
    );
  }, [sortAsc]);

  return (
    <section className="bg-white min-h-screen">
      <FindProject />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-6 sm:py-10">
        {/* Mobile filter button */}
        <div className="md:hidden mb-4">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-[#d52727] text-white rounded-md text-sm font-medium hover:bg-[#b31f1f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d52727] transition-colors"
          >
            <span className="material-symbols-outlined text-lg">filter_alt</span>
            {showMobileFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-6 lg:gap-8">
          {/* Sidebar Filter */}
          <aside className={`${showMobileFilters ? 'block' : 'hidden'} md:block w-full md:w-64 bg-white shadow-sm rounded-md p-4 h-fit`}>
          {/* Sort */}
          <div className="mb-4">
            <h3 className="font-medium text-sm sm:text-sm mb-2">Sort By</h3>
            <select
              className="w-full border p-2 rounded text-sm"
              value={sortAsc ? "asc" : "desc"}
              onChange={(e) => setSortAsc(e.target.value === "asc")}
            >
              <option value="asc">Title (A–Z)</option>
              <option value="desc">Title (Z–A)</option>
            </select>
          </div>

          <SidebarSection title="Sustainable Development Goals" items={sidebarData.sdg} />
          <SidebarSection title="Concepts" items={sidebarData.concepts} />
          <SidebarSection title="Profile" items={sidebarData.profile} />
          <SidebarSection title="Type" items={sidebarData.type} />

          {/* Year range */}
          <div className="mb-6">
            <h4 className="font-medium text-sm mb-2">Year</h4>
            <div className="flex items-center gap-2 text-sm mt-2">
              <input
                type="number"
                placeholder="From"
                className="w-1/2 border p-2 rounded text-sm"
              />
              <span>to</span>
              <input
                type="number"
                placeholder="To"
                className="w-1/2 border p-2 rounded text-sm"
              />
            </div>
          </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
          {/* Summary row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b pb-3 mb-4 sm:mb-6 gap-2">
            <p className="text-sm text-gray-600">
              1 - {sortedProjects.length} out of {dummyProjects.length} results
            </p>
            <div className="flex items-center gap-3 sm:gap-5 text-sm sm:text-sm w-full sm:w-auto">
              <button
                className="text-gray-700 whitespace-nowrap text-left sm:text-right w-full sm:w-auto"
                onClick={() => setSortAsc((v) => !v)}
              >
                Sort by Title ({sortAsc ? "A-Z" : "Z-A"})
              </button>
            </div>
          </div>

          {/* List */}
          <div className="space-y-6">
            {sortedProjects.map((project, idx) => (
              <article key={idx} className="border-b pb-4">
                <h2 className="font-semibold text-lg sm:text-lg text-gray-900 mb-2 sm:mb-0">{project.title}</h2>
                <p className="text-sm sm:text-sm text-gray-600">Lead: {project.lead}</p>
                <p className="text-sm sm:text-sm text-gray-600">Organization: {project.organization}</p>
                <div className="mt-2 sm:mt-2 flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-xs text-gray-500">
                  <span>Type: {project.type}</span>
                  <span>|</span>
                  <span>Duration: {project.duration}</span>
                  <span>|</span>
                  <span>Status: {project.status}</span>
                </div>
              </article>
            ))}
          </div>
          </main>
        </div>
      </div>
    </section>
  );
}
