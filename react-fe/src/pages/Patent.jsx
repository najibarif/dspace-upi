import { useState, useMemo } from "react";
import FindPatent from "../components/patent/FindPatent";

// Komponen SidebarSection (reusable)
function SidebarSection({ title, items }) {
  const [showAll, setShowAll] = useState(false);
  const visibleItems = showAll ? items : items.slice(0, 5);

  return (
    <div className="mb-6">
      <h4 className="font-medium text-sm mb-2">{title}</h4>
      <ul className="space-y-2 text-sm text-gray-600">
        {visibleItems.map((item, idx) => (
          <li key={idx}>
            <label className="flex items-start gap-2">
              <input type="checkbox" />
              <span>{item.name}</span>
              {item.count && <span className="text-gray-500 ml-auto">({item.count})</span>}
            </label>
          </li>
        ))}
      </ul>
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

// Dummy Data Sidebar Patent
const sidebarPatentData = {
  sdg: [
    { name: "GOAL 3: Good Health and Well-being", count: 248 },
    { name: "GOAL 9: Industry, Innovation and Infrastructure", count: 227 },
    { name: "GOAL 12: Responsible Consumption and Production", count: 205 },
    { name: "GOAL 7: Affordable and Clean Energy", count: 151 },
    { name: "GOAL 4: Quality Education", count: 69 },
  ],
  concepts: [
    { name: "Lorem Ipsum", count: 50 },
    { name: "Dolor Sit Amet", count: 40 },
    { name: "Consectetur Adipiscing", count: 35 },
    { name: "Sed Do Eiusmod", count: 25 },
    { name: "Tempor Incididunt", count: 20 },
  ],
  profile: [
    { name: "Lorem Ipsum", count: 15 },
    { name: "Dolor Sit", count: 14 },
    { name: "Amet Consectetur", count: 13 },
    { name: "Adipiscing Elit", count: 12 },
    { name: "Sed Do", count: 10 },
  ],
  type: [
    { name: "Lorem Ipsum", count: 60 },
    { name: "Dolor Sit Amet", count: 45 },
    { name: "Consectetur", count: 40 },
    { name: "Adipiscing", count: 30 },
    { name: "Elit", count: 20 },
  ],
};

// Dummy Data Patent List
const dummyPatents = [
  {
    title: "Lorem ipsum dolor sit amet, consectetur adipiscing elit 1",
    link: "https://doi.org/10.xxxx/patent-1",
    inventors: "Lorem, Ipsum",
    organization: "Lorem Institute",
    year: 2022,
    status: "Granted",
  },
  {
    title: "Lorem ipsum dolor sit amet, consectetur adipiscing elit 2",
    link: "https://doi.org/10.xxxx/patent-2",
    inventors: "Dolor, Sit",
    organization: "Ipsum Research Center",
    year: 2021,
    status: "Pending",
  },
  {
    title: "Lorem ipsum dolor sit amet, consectetur adipiscing elit 3",
    link: "https://doi.org/10.xxxx/patent-3",
    inventors: "Amet, Consectetur",
    organization: "Dolor Labs",
    year: 2020,
    status: "Granted",
  },
  {
    title: "Lorem ipsum dolor sit amet, consectetur adipiscing elit 4",
    link: "https://doi.org/10.xxxx/patent-4",
    inventors: "Elit, Ipsum",
    organization: "Tempor Tech",
    year: 2023,
    status: "Pending",
  },
];



export default function Patent() {
  const [query, setQuery] = useState("");
  const [sortAsc, setSortAsc] = useState(true);

  // Filter & Sort
  const filteredPatents = useMemo(() => {
    let data = dummyPatents.filter((p) =>
      p.title.toLowerCase().includes(query.toLowerCase())
    );
    return data.sort((a, b) =>
      sortAsc ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)
    );
  }, [query, sortAsc]);

  return (
    <div className="bg-[#FFFFFF] min-h-screen">
      <FindPatent onSearch={setQuery} />

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 flex gap-8">
        {/* Sidebar */}
        <aside className="w-64 hidden md:block bg-white shadow-sm rounded-md p-4">
          <h3 className="font-semibold mb-4">Filters for Patent</h3>

          {/* Sort */}
          <div className="mb-6">
            <h4 className="font-medium text-sm mb-2">Sort By</h4>
            <select
              className="w-full border p-2 rounded text-sm"
              onChange={(e) => setSortAsc(e.target.value === "asc")}
            >
              <option value="asc">Title (A–Z)</option>
              <option value="desc">Title (Z–A)</option>
            </select>
          </div>

          {/* Sidebar Sections */}
          <SidebarSection
            title="Sustainable Development Goals"
            items={sidebarPatentData.sdg}
          />
          <SidebarSection
            title="Concepts"
            items={sidebarPatentData.concepts}
          />
          <SidebarSection title="Profile" items={sidebarPatentData.profile} />
          <SidebarSection title="Type" items={sidebarPatentData.type} />

          {/* Year range */}
          <div className="mb-6">
            <h4 className="font-medium text-sm mb-2">Year</h4>
            <div className="flex items-center gap-2 text-sm mt-2">
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

        {/* Main Content */}
        <main className="flex-1">
          {/* Summary row */}
          <div className="flex items-center justify-between border-b pb-3 mb-6">
            <p className="text-sm text-gray-600">
              1 - {filteredPatents.length} out of {dummyPatents.length} results
            </p>
            <div className="flex items-center gap-5 text-sm">
              <button
                className="text-gray-700"
                onClick={() => setSortAsc((v) => !v)}
              >
                Sort bt Title ({sortAsc ? "ascending" : "descending"}) &gt;
              </button>
              <button className="text-blue-600">Export search results</button>
            </div>
          </div>

          {/* List */}
          <div className="space-y-6">
            {filteredPatents.map((patent, idx) => (
              <article key={idx} className="border-b pb-4">
                <h3 className="font-semibold text-lg text-gray-900">
                  {patent.title}
                </h3>
                <a
                  href={patent.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 break-words"
                >
                  {patent.link}
                </a>
                <p className="text-sm text-gray-600">
                  Inventors: {patent.inventors}
                </p>
                <p className="text-sm text-gray-600">
                  Organization: {patent.organization}
                </p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
                  <span>Patent</span>
                  <span>|</span>
                  <span>Filed {patent.year}</span>
                  <span>|</span>
                  <span>Status: {patent.status}</span>
                </div>
              </article>
            ))}
          </div>

          {/* Pagination Dummy */}
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
  );
}
