import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function FindPaper() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const submit = () => {
    const q = (query || "").trim();
    const search = q ? `?q=${encodeURIComponent(q)}` : "";
    navigate(`/paper${search}`);
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submit();
    }
  };

  return (
    <section className='bg-[#F5F5F5] min-h-[250px] md:min-h-[300px] flex flex-col items-center justify-center pt-16 md:pt-24'>
      <div className='text-center w-full max-w-4xl mx-auto px-4'>
<<<<<<< HEAD
        {/* Judul + Icon */}
        <h2 className='text-3xl md:text-4xl font-bold mb-6 md:mb-8 flex items-center justify-center gap-2'>
=======
        <h2 className='text-4xl font-bold mb-8 flex items-center justify-center gap-2'>
>>>>>>> 3e76a1e37b670e7a54024bb792571173326ae325
          <span className='material-symbols-outlined !text-4xl'>
            description
          </span>
          <span>Find Paper</span>
        </h2>

<<<<<<< HEAD
        {/* Search Box */}
        <div className='flex flex-col items-center gap-2 w-full px-2 sm:px-4'>
=======
        <div className='flex flex-col items-center gap-2 px-4'>
>>>>>>> 3e76a1e37b670e7a54024bb792571173326ae325
          <div className='w-full max-w-2xl flex rounded overflow-hidden border border-gray-300'>
            <input
              type='text'
              placeholder='Find Paper title'
<<<<<<< HEAD
              className='flex-1 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base outline-none'
            />
            <button className='bg-gray-700 hover:bg-gray-800 px-4 sm:px-6 flex items-center justify-center'>
              <span className='material-symbols-outlined text-white text-xl sm:text-2xl'>
=======
              className='flex-1 px-4 py-3 outline-none'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
            />
            <button
              className='bg-gray-700 hover:bg-gray-800 px-8 flex items-center justify-center'
              onClick={submit}
            >
              <span className='material-symbols-outlined text-white'>
>>>>>>> 3e76a1e37b670e7a54024bb792571173326ae325
                search
              </span>
            </button>
          </div>
<<<<<<< HEAD
          <div className='w-full max-w-xl flex justify-end'>
            <button className='text-xs sm:text-sm text-gray-500 hover:text-gray-700'>
              Advanced Search
            </button>
          </div>
=======
>>>>>>> 3e76a1e37b670e7a54024bb792571173326ae325
        </div>
      </div>
    </section>
  );
}
