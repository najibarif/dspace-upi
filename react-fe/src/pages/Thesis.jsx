import { useState } from "react";
import FindThesis from "../components/home/FindThesis";

export default function Thesis() {
  const [results] = useState([1, 2, 3, 4]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  return (
    <div className="bg-white min-h-screen">
      <FindThesis />
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
            <h2 className="font-semibold text-base md:text-base mb-4">Filters for Thesis</h2>
          <h3 className="font-semibold text-sm sm:text-base mb-3 sm:mb-4">Filters for Profiles</h3>

          {/* Filter Section */}
          <div className="mb-4 sm:mb-6">
            <h4 className="font-medium text-sm sm:text-sm mb-1 sm:mb-2">
              Sustainable Development Goals
            </h4>
            <ul className="space-y-2 sm:space-y-2 text-sm sm:text-sm text-gray-600">
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
            <button className="text-blue-600 text-sm sm:text-sm mt-2 sm:mt-2">See more &gt;</button>
          </div>

          <div className="mb-4 sm:mb-6">
            <h4 className="font-medium text-sm sm:text-sm mb-1 sm:mb-2">Concepts</h4>
            <ul className="space-y-2 sm:space-y-2 text-sm sm:text-sm text-gray-600">
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
            <button className="text-blue-600 text-sm sm:text-sm mt-2 sm:mt-2">See more &gt;</button>
          </div>

          <div>
            <h4 className="font-medium text-sm sm:text-sm mb-1 sm:mb-2">Time Period</h4>
            <ul className="space-y-2 sm:space-y-2 text-sm sm:text-sm text-gray-600">
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
            <button className="text-blue-600 text-sm sm:text-sm mt-2 sm:mt-2">See more &gt;</button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3 mb-4 sm:mb-6 gap-2">
            <p className="text-sm sm:text-sm text-gray-600">1 - 50 out of 2,485 results</p>
            <div className="flex flex-wrap gap-3 sm:gap-4 text-sm sm:text-sm">
              <button className="text-gray-700 whitespace-nowrap">Date (desc)&gt;</button>
              <button className="text-blue-600 whitespace-nowrap">Export results</button>
            </div>
          </div>

          {/* List of results */}
          <div className="space-y-8">
            {results.map((i) => (
              <article key={i} className="border-b pb-4">
                <h2 className="font-bold text-lg sm:text-lg mb-2">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit
                </h2>
                <p className="text-gray-600 text-sm sm:text-sm">
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