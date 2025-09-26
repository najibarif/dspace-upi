import HeroBanner from "../components/home/HeroBanner";
export default function Paper() {
    return (
        <section className="bg-gray-50 min-h-screen">
            <HeroBanner />

            {/* Content */}
            <div className="flex max-w-7xl mx-auto py-10 px-6 gap-8">
                {/* Sidebar Filter */}
                <aside className="w-1/4 bg-white p-4 rounded shadow">
                    <h2 className="font-semibold mb-4">Filter for Paper</h2>
                    <select className="w-full border p-2 rounded mb-4">
                        <option>Please select Sort By</option>
                    </select>

                    <div className="mb-6">
                        <h3 className="font-medium">Sustainable Development Goals</h3>
                        <div className="mt-2 space-y-2">
                            <label className="flex items-center gap-2">
                                <input type="checkbox" /> GOAL 7: Affordable and Clean Energy
                            </label>
                            <label className="flex items-center gap-2">
                                <input type="checkbox" /> GOAL 14: Life Below Water
                            </label>
                            <button className="text-blue-500 text-sm">Show more</button>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h3 className="font-medium">Concepts</h3>
                        <div className="mt-2 space-y-2">
                            <label className="flex items-center gap-2">
                                <input type="checkbox" /> Geological Evolution of South China Sea
                            </label>
                            <label className="flex items-center gap-2">
                                <input type="checkbox" /> Impact of Covid-19
                            </label>
                            <button className="text-blue-500 text-sm">Show more</button>
                        </div>
                    </div>
                </aside>

                {/* Result List */}
                <main className="flex-1">
                    <p className="text-gray-600 mb-4">Result 27317 for 27317</p>
                    <div className="space-y-6">
                        <article className="bg-white p-4 rounded shadow">
                            <h3 className="font-bold">
                                SMT-EX: An Explainable Surrogate Modeling Toolbox ...
                            </h3>
                            <a href="https://doi.org/" className="text-sm">
                                https://doi.org/
                            </a>
                            <p className="text-sm text-gray-600">
                                Authors: Rizi Zuhal, Pramulda Satria Palar
                            </p>
                            <p className="text-sm text-gray-600">
                                Organization: Center for Industrial Technology
                            </p>
                            <div className="mt-2 flex gap-3 text-xs text-gray-500">
                                <span>Journal</span>
                                <span>|</span>
                                <span>Cite 0</span>
                                <span>|</span>
                                <span>Year 2025</span>
                            </div>
                        </article>

                        {/* Tambahkan artikel lain persis sesuai screenshot */}
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-center mt-8 gap-2">
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
        </section>
    );
}
