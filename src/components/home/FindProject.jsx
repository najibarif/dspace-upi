import isola from "../../assets/isola.png";

export default function HeroBanner() {
  return (
    <section className='relative w-full'>
      <div className='relative h-[320px] md:h-[420px] w-full overflow-hidden'>
        <img
          src={isola}
          alt='Isola'
          className='absolute inset-0 w-full h-full object-cover'
        />
        <div className='absolute inset-0 bg-white/10' />

        <div className='relative z-10 max-w-7xl mx-auto px-6 md:px-24 h-full flex flex-col items-center justify-center text-white text-center gap-4'>
          <h1 className='text-2xl md:text-4xl font-semibold leading-snug'>
            Find Project
          </h1>
          <div className='w-full max-w-2xl bg-white/90 rounded-md px-4 py-2 flex items-center gap-2'>
            <input
              type='text'
              placeholder='Search...'
              className='flex-1 bg-transparent outline-none text-gray-800 placeholder-gray-500 text-sm md:text-base'
            />
            <button className='text-white bg-[#D52727] px-3 md:px-4 py-2 rounded-md text-sm md:text-base'>
              Search
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
