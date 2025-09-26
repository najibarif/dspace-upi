const columns = new Array(6).fill(0);

export default function SectionFaculty() {
  return (
    <section className='px-6 md:px-24 pb-16'>
      <div className='max-w-7xl mx-auto'>
        <h3 className='text-xl md:text-2xl font-semibold text-gray-900 mb-3'>
          Faculty
        </h3>
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 text-sm md:text-base text-gray-800'>
          {columns.map((_, idx) => (
            <div key={idx} className='space-y-3'>
              <div className='font-semibold'>Lorem ipsum dolor sit amet</div>
              <div className='text-gray-600'>Lorem ipsum dolor sit amet</div>
              <div className='font-semibold'>Lorem ipsum dolor sit amet</div>
              <div className='text-gray-600'>Lorem ipsum dolor sit amet</div>
              <div className='font-semibold'>Lorem ipsum dolor sit amet</div>
              <div className='text-gray-600'>Lorem ipsum dolor sit amet</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
