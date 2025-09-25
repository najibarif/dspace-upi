export default function Hero() {
  return (
    <section className="bg-red-600 text-white py-24 text-center">
      <h1 className="text-4xl md:text-5xl font-bold">Welcome to</h1>
      <h2 className="text-3xl md:text-4xl mt-2 font-semibold">
        Universitas Pendidikan Indonesia
      </h2>
      <p className="mt-4 text-lg">
        Trending : Dosen A, Dosen B, Dosen C
      </p>
      <div className="mt-6 flex justify-center">
        <input
          type="text"
          placeholder="Search here.."
          className="w-80 p-3 rounded-l-lg text-gray-900"
        />
        <button className="bg-white text-red-700 px-6 py-3 rounded-r-lg font-bold">
          Search
        </button>
      </div>
    </section>
  );
}
