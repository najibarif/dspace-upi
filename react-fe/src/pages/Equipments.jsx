import { useState } from "react";
import FindEquipments from "../components/home/FindEquipments";

export default function Equipments() {
  const [results] = useState([1, 2, 3, 4]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [sortAsc, setSortAsc] = useState(false);

  return (
    <div className="bg-white min-h-screen">
      {/* Banner */}
      <FindEquipments />

      {/* Main Content */}
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
          {/* Sidebar Filter - Hidden on mobile unless toggled */}
          <aside className={`${showMobileFilters ? 'block' : 'hidden'} md:block w-full md:w-64 bg-white shadow-sm rounded-md p-4 h-fit`}>
          <h3 className="font-semibold mb-4">Filters for Profiles</h3>

          {/* Filter Section */}
          <div className="mb-6">
            <h4 className="font-medium text-sm mb-2">
              Sustainable Development Goals
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <label className="flex items-start gap-2">
                  <input type="checkbox" />
                  Lorem Ipsum has been the industry's standard dummy text ever
                  since the 1500s
                </label>
              </li>
              <li>
                <label className="flex items-start gap-2">
                  <input type="checkbox" />
                  Lorem Ipsum has been the industry's standard dummy text ever
                  since the 1500s
                </label>
              </li>
            </ul>
            <button className="text-[#d52727] hover:text-[#b31f1f] text-sm mt-2 transition-colors">See more &gt;</button>
          </div>

          <div className="mb-6">
            <h4 className="font-medium text-sm mb-2">Concepts</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <label className="flex items-start gap-2">
                  <input type="checkbox" />
                  Lorem Ipsum has been the industry's standard dummy text ever
                  since the 1500s
                </label>
              </li>
              <li>
                <label className="flex items-start gap-2">
                  <input type="checkbox" />
                  Lorem Ipsum has been the industry's standard dummy text ever
                  since the 1500s
                </label>
              </li>
            </ul>
            <button className="text-[#d52727] hover:text-[#b31f1f] text-sm mt-2 transition-colors">See more &gt;</button>
          </div>

          <div>
            <h4 className="font-medium text-sm mb-2">Time Period</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <label className="flex items-start gap-2">
                  <input type="checkbox" />
                  Lorem Ipsum has been the industry's standard dummy text ever
                  since the 1500s
                </label>
              </li>
              <li>
                <label className="flex items-start gap-2">
                  <input type="checkbox" />
                  Lorem Ipsum has been the industry's standard dummy text ever
                  since the 1500s
                </label>
              </li>
            </ul>
            <button className="text-[#d52727] hover:text-[#b31f1f] text-sm mt-2 transition-colors">See more &gt;</button>
          </div>
        </aside>

        {/* Results */}
        <main className="flex-1">
          {/* Header */}
          <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between border-b pb-3 mb-6 gap-3">
            <p className="text-sm text-gray-600 whitespace-nowrap">1 - 50 out of 2,485 results</p>
            <div className="flex flex-wrap gap-3 text-sm">
              <button 
                className="text-gray-700 hover:text-[#d52727] flex items-center gap-1 transition-colors"
                onClick={() => setSortAsc(v => !v)}
              >
                <span className="material-symbols-outlined text-base">
                  {sortAsc ? 'arrow_upward' : 'arrow_downward'}
                </span>
                Date {sortAsc ? 'A-Z' : 'Z-A'}
              </button>
              <button className="text-[#d52727] hover:text-[#b31f1f] transition-colors">
                Export results
              </button>
            </div>
          </div>

          {/* List of results */}
          <div className="space-y-8">
            {results.map((i) => (
              <article key={i} className="border-b pb-4 hover:bg-gray-50 transition-colors duration-150 p-3 rounded-md -mx-3">
                <h2 className="font-bold text-base sm:text-lg mb-1 text-gray-900">
                  <a href="#" className="hover:text-[#d52727] transition-colors">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit
                  </a>
                </h2>
                <p className="text-gray-600 text-sm line-clamp-2">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do
                  eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>
              </article>
            ))}
          </div>
        </main>
        </div>
      </div>
    </div>
  );
}
