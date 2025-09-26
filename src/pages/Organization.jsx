import { useMemo, useState } from "react";
import FindOrganization from "../components/organization/FindOrganization";

const dummyOrganizations = Array.from({ length: 20 }).map((_, i) => ({
  id: i + 1,
  title: `Placehoder organization`,
  desc: `Placeholder description ${i + 1}`,
}));

export default function Organization() {
  const [query, setQuery] = useState("");
  const [sortAsc, setSortAsc] = useState(false);

  const filtered = useMemo(() => {
    const list = dummyOrganizations.filter((p) =>
      p.title.toLowerCase().includes(query.toLowerCase())
    );
    return list.sort((a, b) =>
      sortAsc ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)
    );
  }, [query, sortAsc]);

  return (
    <div className='bg-[#FFFFFF] min-h-screen'>
      <FindOrganization />

      <div className='max-w-7xl mx-auto px-6 md:px-12 py-10 flex gap-8'>
        <aside className='w-64 hidden md:block bg-white shadow-sm rounded-md p-4'>
          <h3 className='font-semibold mb-4'>Filters for Organization</h3>

          <div className='mb-6'>
            <h4 className='font-medium text-sm mb-2'>Concepts</h4>
            <ul className='space-y-2 text-sm text-gray-600'>
              {Array.from({ length: 3 }).map((_, i) => (
                <li key={`c-${i}`}>
                  <label className='flex items-start gap-2'>
                    <input type='checkbox' />
                    Dummy concept {i + 1}
                  </label>
                </li>
              ))}
            </ul>
            <button className='text-blue-600 text-sm mt-2'>
              See more &gt;
            </button>
          </div>

          <div className='mb-6'>
            <h4 className='font-medium text-sm mb-2'>
              Sustainable Development Goals
            </h4>
            <ul className='space-y-2 text-sm text-gray-600'>
              {Array.from({ length: 2 }).map((_, i) => (
                <li key={`s-${i}`}>
                  <label className='flex items-start gap-2'>
                    <input type='checkbox' />
                    Dummy SDG {i + 1}
                  </label>
                </li>
              ))}
            </ul>
            <button className='text-blue-600 text-sm mt-2'>
              See more &gt;
            </button>
          </div>

          <div className='mb-6'>
            <h4 className='font-medium text-sm mb-2'>Network Affiliation</h4>
            <ul className='space-y-2 text-sm text-gray-600'>
              {Array.from({ length: 2 }).map((_, i) => (
                <li key={`na-${i}`}>
                  <label className='flex items-start gap-2'>
                    <input type='checkbox' />
                    Dummy affiliation {i + 1}
                  </label>
                </li>
              ))}
            </ul>
            <button className='text-blue-600 text-sm mt-2'>
              See more &gt;
            </button>
          </div>

          <div className='mb-6'>
            <h4 className='font-medium text-sm mb-2'>Network Country</h4>
            <ul className='space-y-2 text-sm text-gray-600'>
              {Array.from({ length: 2 }).map((_, i) => (
                <li key={`nc-${i}`}>
                  <label className='flex items-start gap-2'>
                    <input type='checkbox' />
                    Dummy country {i + 1}
                  </label>
                </li>
              ))}
            </ul>
            <button className='text-blue-600 text-sm mt-2'>
              See more &gt;
            </button>
          </div>

          <div>
            <h4 className='font-medium text-sm mb-2'>Type</h4>
            <ul className='space-y-2 text-sm text-gray-600'>
              {Array.from({ length: 2 }).map((_, i) => (
                <li key={`t-${i}`}>
                  <label className='flex items-start gap-2'>
                    <input type='checkbox' />
                    Dummy type {i + 1}
                  </label>
                </li>
              ))}
            </ul>
            <button className='text-blue-600 text-sm mt-2'>
              See more &gt;
            </button>
          </div>
        </aside>

        {/* Results */}
        <main className='flex-1'>
          {/* Summary row */}
          <div className='flex items-center justify-between border-b pb-3 mb-6'>
            <p className='text-sm text-gray-600'>
              1 - 50 out of {filtered.length} results
            </p>
            <div className='flex items-center gap-5 text-sm'>
              <button
                className='text-gray-700'
                onClick={() => setSortAsc((v) => !v)}
              >
                Last name ({sortAsc ? "ascending" : "descending"})&gt;
              </button>
              <button className='text-blue-600'>Export search results</button>
            </div>
          </div>

          {/* List */}
          <div className='space-y-6'>
            {filtered.map((item) => (
              <article key={item.id} className='border-b pb-4'>
                <h2 className='font-semibold text-lg text-gray-900'>
                  {item.title}
                </h2>
                <p className='text-gray-600 text-sm'>{item.desc}</p>
              </article>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
