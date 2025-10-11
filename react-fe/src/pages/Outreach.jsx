import { useState } from 'react';
import FindBanner from "../components/home/FindBanner";

export default function Outreach() {
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  return (
    <div className="bg-white min-h-screen">
      {/* Banner */}
      <FindBanner />

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
            <h2 className="font-semibold text-sm md:text-base mb-4">Filters for Outreach</h2>
            <div className="space-y-4">
              <div className="border-b pb-4">
                <h4 className="font-medium text-sm mb-2">Sustainable Development Goals</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>
                    <label className="flex items-start gap-2">
                      <input type="checkbox" />
                      <span className="flex-1">
                        Lorem Ipsum has been the industry's standard dummy text ever since the 1500s
                      </span>
                    </label>
                  </li>
                  <li>
                    <label className="flex items-start gap-2">
                      <input type="checkbox" />
                      <span className="flex-1">
                        Lorem Ipsum has been the industry's standard dummy text ever since the 1500s
                      </span>
                    </label>
                  </li>
                </ul>
                <button className="text-blue-600 text-sm mt-2">See more &gt;</button>
              </div>

              <div className="border-b pb-4">
                <h4 className="font-medium text-sm mb-2">Concepts</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>
                    <label className="flex items-start gap-2">
                      <input type="checkbox" />
                      <span className="flex-1">
                        Lorem Ipsum has been the industry's standard dummy text ever since the 1500s
                      </span>
                    </label>
                  </li>
                </ul>
                <button className="text-blue-600 text-sm mt-2">See more &gt;</button>
              </div>

              <div>
                <h4 className="font-medium text-sm mb-2">Time Period</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>
                    <label className="flex items-start gap-2">
                      <input type="checkbox" />
                      <span className="flex-1">
                        Lorem Ipsum has been the industry's standard dummy text ever since the 1500s
                      </span>
                    </label>
                  </li>
                </ul>
                <button className="text-blue-600 text-sm mt-2">See more &gt;</button>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b pb-3 mb-6">
            <p className="text-sm text-gray-600">
              1 - 50 out of 2,485 results
            </p>
            <div className="flex gap-6 text-sm mt-3 md:mt-0">
              <button className="text-gray-700">Start date (descending)&gt;</button>
              <button className="text-blue-600">Export search results</button>
            </div>
          </div>

          {/* List of results */}
          <div className="space-y-8">
            {[1, 2, 3, 4].map((i) => (
              <article key={i} className="border-b pb-4">
                <h2 className="font-bold text-lg mb-1">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit
                </h2>
                <p className="text-gray-600 text-sm">
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
