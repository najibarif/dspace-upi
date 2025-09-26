export default function FindBanner() {
  return (
    <section className="bg-[#F5F5F5] min-h-[300px] flex flex-col items-center justify-center">
      <div className="text-center w-full max-w-4xl mx-auto px-4">
        {/* Judul + Icon */}
        <h2 className="text-4xl font-bold mb-8 flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-4xl">public</span>
          Find Outreach
        </h2>

        {/* Search Box */}
        <div className="flex flex-col items-center gap-2 px-4">
          <div className="w-full max-w-2xl flex rounded overflow-hidden border border-gray-300">
            <input
              type="text"
              placeholder="Find Outreach title"
              className="flex-1 px-4 py-3 outline-none"
            />
            <button className="bg-gray-700 hover:bg-gray-800 px-8 flex items-center justify-center">
              <span className="material-symbols-outlined text-white">search</span>
            </button>
          </div>
          <div className="w-full max-w-xl flex justify-end">
            <button className="text-sm text-gray-500 hover:text-gray-700">Advanced Search</button>
          </div>
        </div>
      </div>
    </section>
  );
}
