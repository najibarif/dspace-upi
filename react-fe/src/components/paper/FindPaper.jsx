import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

export default function FindPaper() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get("q") || "";
  const [query, setQuery] = useState(queryParam);

  useEffect(() => {
    setQuery(queryParam);
  }, [queryParam]);

  useEffect(() => {
    const trimmed = (query || "").trim();
    const timer = setTimeout(() => {
      if (trimmed === queryParam) return;
      const params = new URLSearchParams(searchParams);
      if (trimmed) params.set("q", trimmed);
      else params.delete("q");
      params.set("page", "1");
      setSearchParams(params);
    }, 400);
    return () => clearTimeout(timer);
  }, [query, queryParam, searchParams, setSearchParams]);

  const submit = () => {
    const trimmed = (query || "").trim();
    const params = new URLSearchParams(searchParams);
    if (trimmed) params.set("q", trimmed);
    else params.delete("q");
    params.set("page", "1");
    setSearchParams(params);
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
        <h2 className='text-4xl font-bold mb-8 flex items-center justify-center gap-2'>
          <span className='material-symbols-outlined !text-4xl'>
            description
          </span>
          <span>Find Paper</span>
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
