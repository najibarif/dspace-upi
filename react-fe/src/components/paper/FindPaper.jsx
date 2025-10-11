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
    <section className='bg-[#F5F5F5] min-h-[300px] flex flex-col items-center justify-center pt-24'>
      <div className='text-center w-full max-w-4xl mx-auto px-4'>
        <h2 className='text-4xl font-bold mb-8 flex items-center justify-center gap-2'>
          <span className='material-symbols-outlined !text-4xl'>
            description
          </span>
          Find Paper
        </h2>

        <div className='flex flex-col items-center gap-2 px-4'>
          <div className='w-full max-w-2xl flex rounded overflow-hidden border border-gray-300'>
            <input
              type='text'
              placeholder='Find Paper title'
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
                search
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
