import { useState } from "react";
import FindThesis from "../components/home/FindThesis";

export default function Thesis() {
  const [results] = useState([1, 2, 3, 4]);

  return (
    <div className="bg-[#FFFFFF] min-h-screen">
      <FindThesis />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 flex gap-8">
        {/* Sidebar Filter */}
        <aside className="w-64 hidden md:block bg-white shadow-sm rounded-md p-4">
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
            <button className="text-blue-600 text-sm mt-2">See more &gt;</button>
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
            <button className="text-blue-600 text-sm mt-2">See more &gt;</button>
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
            <button className="text-blue-600 text-sm mt-2">See more &gt;</button>
          </div>
        </aside>

        {/* Results */}
        <main className="flex-1">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b pb-3 mb-6">
            <p className="text-sm text-gray-600">1 - 50 out of 2,485 results</p>
            <div className="flex gap-6 text-sm mt-3 md:mt-0">
              <button className="text-gray-700">Date (descending)&gt;</button>
              <button className="text-blue-600">Export search results</button>
            </div>
          </div>

          {/* List of results */}
          <div className="space-y-8">
            {results.map((i) => (
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
  );
}